'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/database.types'
import { decryptField, encryptField, isEncrypted } from '@/lib/secure-field'

// ─────────────────────────────────────────────────────────────────
//  Helper: fetch current user + check authorization
// ─────────────────────────────────────────────────────────────────
async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { supabase, user: null, profile: null }

    const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single()

    return { supabase, user, profile }
}

function isStaff(profile: { role: string | null } | null) {
    return profile?.role === 'admin' || profile?.role === 'team'
}

/** Remove application documents older than the retention window.
 *  Client/profile fields stay intact; only files attached to old applications
 *  and their JSONB references are removed.
 */
async function purgeExpiredApplicationDocuments(currentRegistrationId?: string) {
    const admin = createAdminClient()
    const cutoff = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    let query = admin
        .from('registrations')
        .select('id, documents')
        .lt('created_at', cutoff)
    if (currentRegistrationId) query = query.neq('id', currentRegistrationId)

    const { data: registrations, error } = await query
    if (error || !registrations?.length) return

    for (const registration of registrations) {
        const documents = Array.isArray(registration.documents) ? registration.documents as any[] : []
        if (!documents.length) continue

        const removalsByBucket = new Map<string, string[]>()
        for (const document of documents) {
            const rawPath = typeof document?.path === 'string' ? document.path : ''
            const marker = '/storage/v1/object/public/'
            const markerIndex = rawPath.indexOf(marker)
            if (markerIndex < 0) continue
            const [bucket, ...pathParts] = rawPath.slice(markerIndex + marker.length).split('/')
            const path = pathParts.join('/')
            if (bucket && path) removalsByBucket.set(bucket, [...(removalsByBucket.get(bucket) || []), path])
        }

        for (const [bucket, paths] of removalsByBucket) {
            await admin.storage.from(bucket).remove(paths)
        }
        await admin.from('registrations').update({ documents: [], updated_at: new Date().toISOString() }).eq('id', registration.id)
    }
}

// ── Internal helper: log an event on a registration ──
async function logEvent(
    supabase: SupabaseClient<Database>,
    registrationId: string,
    action: string,
    description: string,
    userId: string,
    userName: string,
    metadata?: Record<string, unknown>,
) {
    await supabase.from('registration_events').insert({
        registration_id: registrationId,
        action,
        description,
        performed_by: userId,
        performed_by_name: userName,
        metadata: (metadata ?? null) as unknown as Json,
    })
}

// ─────────────────────────────────────────────────────────────────
//  Visa portal credentials
//
//  The password is stored encrypted inside `additional_data` and is never
//  sent to the browser with the rest of the case. The wizard writes it
//  through `saveVisaPortalPassword` and only pulls the cleartext back on an
//  explicit reveal, which is recorded in the activity log.
// ─────────────────────────────────────────────────────────────────

export async function saveVisaPortalPassword(regId: string, password: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    const ciphertext = encryptField(password)
    if (ciphertext === null) {
        return { error: 'Password storage is not configured. Set FIELD_ENCRYPTION_KEY before saving portal credentials.' }
    }

    const { data: current, error: lookupError } = await supabase
        .from('registrations')
        .select('additional_data')
        .eq('id', regId)
        .single()
    if (lookupError || !current) return { error: lookupError?.message || 'Could not find the application' }

    const additionalData = (current.additional_data ?? {}) as Record<string, unknown>
    // Drop the legacy plaintext key so the old value stops travelling to the client.
    delete additionalData.visa_portal_password

    const { error } = await supabase
        .from('registrations')
        .update({
            additional_data: { ...additionalData, visa_portal_password_encrypted: ciphertext } as unknown as Json,
            updated_at: new Date().toISOString(),
        })
        .eq('id', regId)

    if (error) return { error: error.message }
    return { error: null }
}

export async function revealVisaPortalPassword(regId: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized', password: '' }

    const { data, error } = await supabase
        .from('registrations')
        .select('additional_data')
        .eq('id', regId)
        .single()
    if (error || !data) return { error: error?.message || 'Could not find the application', password: '' }

    const additionalData = (data.additional_data ?? {}) as Record<string, unknown>
    const stored = additionalData.visa_portal_password_encrypted ?? additionalData.visa_portal_password
    const password = isEncrypted(stored) ? decryptField(stored) : String(stored ?? '')

    await logEvent(
        supabase,
        regId,
        'visa_credentials_revealed',
        'Visa portal password revealed',
        user.id,
        profile?.full_name || profile?.email || 'Staff',
    )

    return { error: null, password }
}

/** Short activity log entry for wizard page edits that save directly from the client. */
export async function recordRegistrationActivity(input: {
    registrationId: string
    action: string
    description: string
    step?: number
    metadata?: Record<string, unknown>
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!user || !isStaff(profile)) return { error: 'Unauthorized' }
    await logEvent(
        supabase,
        input.registrationId,
        input.action,
        input.description,
        user.id,
        profile?.full_name || profile?.email || 'Staff',
        { ...(input.metadata ?? {}), step: input.step },
    )
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  1) Search for an existing registration/client (to reuse instead of duplicating)
// ─────────────────────────────────────────────────────────────────
export async function searchRegistrations(query: string) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { data: [], error: 'Unauthorized' }

    const q = query.trim()
    if (q.length < 2) return { data: [], error: null }

    const orFilters = [
        `full_name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `case_number.ilike.%${q}%`,
        `ticket_number.ilike.%${q}%`,
    ].join(',')

    const { data, error } = await supabase
        .from('registrations')
        .select('id, full_name, email, case_number, event_id, events(title, title_ar)')
        .or(orFilters)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('searchRegistrations failed:', error)
        return { data: [], error: error.message }
    }
    return { data: data ?? [], error: null }
}

// ─────────────────────────────────────────────────────────────────
//  1.5) Search for clients (to reuse and avoid creating duplicate clients)
// ─────────────────────────────────────────────────────────────────
export async function searchClients(input: {
    fullName: string
    dateOfBirth?: string
    placeOfBirth?: string
}) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { data: [], error: 'Unauthorized' }

    if (!input.fullName.trim() && !input.dateOfBirth && !input.placeOfBirth?.trim()) {
        return { data: [], error: null }
    }

    let query = supabase
        .from('clients')
        .select('id, full_name_as_passport, email, phone, passport_number, date_of_birth, place_of_birth')

    if (input.fullName.trim()) {
        query = query.ilike('full_name_as_passport', `%${input.fullName.trim()}%`)
    }
    if (input.dateOfBirth) {
        query = query.eq('date_of_birth', input.dateOfBirth)
    }
    if (input.placeOfBirth && input.placeOfBirth.trim()) {
        query = query.ilike('place_of_birth', `%${input.placeOfBirth.trim()}%`)
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('searchClients failed:', error)
        return { data: [], error: error.message }
    }
    return { data: data ?? [], error: null }
}

// ─────────────────────────────────────────────────────────────────
//  2) Generate a sequential case number JAZ-{last 2 digits of year}-{sequence}
// ─────────────────────────────────────────────────────────────────
async function generateCaseNumber(supabase: SupabaseClient<Database>): Promise<string> {
    const fullYear = new Date().getFullYear()
    const year = fullYear.toString().slice(-2)
    const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .like('case_number', `JAZ-${year}-%`)

    const next = ((count ?? 0) + 1).toString().padStart(5, '0')
    return `JAZ-${year}-${next}`
}

// ─────────────────────────────────────────────────────────────────
//  3) Create a new participation registration (manual — from WhatsApp/phone)
//     Inserts a row into registrations with case_number + case_status.
// ─────────────────────────────────────────────────────────────────
export async function createManualRegistration(input: {
    eventId: string
    fullName: string
    phone?: string
    email?: string
    source?: string
    campaignName?: string
    servicePackage?: string
    attendanceType?: string
    travelPurpose?: string
    notes?: string
    clientId?: string
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { data: null, error: 'Unauthorized' }

    if (!input.eventId || (!input.clientId && !input.fullName.trim())) {
        return { data: null, error: 'Event and name are required' }
    }

    const caseNumber = await generateCaseNumber(supabase)

    let finalClientId = input.clientId
    let finalFullName = input.fullName
    let finalEmail = input.email || `${Date.now()}@anonymous.jaz`

    if (finalClientId) {
        const { data: client } = await supabase
            .from('clients')
            .select('full_name_as_passport, email')
            .eq('id', finalClientId)
            .single()
        if (client) {
            finalFullName = client.full_name_as_passport
            if (client.email) finalEmail = client.email
        }
    } else {
        // create a new client
        const { data: newClient, error: clientErr } = await supabase
            .from('clients')
            .insert({
                full_name_as_passport: input.fullName.trim(),
                phone: input.phone || null,
                email: input.email || null,
                notes: input.notes || null,
            })
            .select('id')
            .single()

        if (clientErr) {
            console.error('Failed to create client during manual registration:', clientErr)
            return { data: null, error: clientErr.message }
        }
        finalClientId = newClient.id
    }

    const { data: reg, error } = await supabase
        .from('registrations')
        .insert({
            event_id: input.eventId,
            client_id: finalClientId,
            full_name: finalFullName.trim(),
            email: finalEmail,
            status: 'confirmed',
            payment_status: 'pending',
            total_amount: 0,
            current_step: 5,
            user_id: null, // manual
            case_number: caseNumber,
            case_status: 'new_request',
            case_source: input.source || null,
            campaign_name: input.campaignName || null,
            assigned_employee_id: user.id,
            selected_services: {
                service_package: input.servicePackage || 'registration_only',
                requirements: getServiceRequirements(input.servicePackage || 'registration_only'),
            },
            form_data: {
                phone: input.phone || '',
                notes: input.notes || '',
                attendance_type: input.attendanceType || null,
                travel_purpose: input.travelPurpose || null,
            },
            additional_data: {
                participation_type: input.attendanceType || null,
                travel_purpose: input.travelPurpose || null,
            },
            notes: input.notes || null,
        })
        .select('id, case_number')
        .single()

    if (error) {
        console.error('createManualRegistration failed:', error)
        return { data: null, error: error.message }
    }

    await logEvent(supabase, reg.id, 'case_created', 'Participation case created and client assigned', user.id, profile?.full_name || profile?.email || 'Staff', { case_number: caseNumber, source: input.source, client_id: finalClientId })

    revalidatePath('/dashboard/participation-cases')
    return { data: reg, error: null }
}

function getServiceRequirements(servicePackage: string) {
    const base = [
        { key: 'passport', label: 'Passport copy', required: true },
        { key: 'photo', label: 'Personal photo', required: true },
        { key: 'professional_evidence', label: 'Professional evidence', required: false },
    ]

    if (servicePackage === 'registration_invitation' || servicePackage === 'registration_invitation_visa' || servicePackage === 'full') {
        base.push({ key: 'invitation', label: 'Official invitation', required: true })
    }

    if (servicePackage === 'registration_invitation_visa' || servicePackage === 'full') {
        base.push(
            { key: 'insurance', label: 'Insurance policy', required: true },
            { key: 'tls_appointment', label: 'TLS appointment confirmation', required: true },
        )
    }

    return base
}

// ─────────────────────────────────────────────────────────────────
//  4) Update the detailed case status (case_status)
// ─────────────────────────────────────────────────────────────────
export async function updateCaseStatus(regId: string, caseStatus: string, note?: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('registrations')
        .update({ case_status: caseStatus })
        .eq('id', regId)

    if (error) {
        console.error('updateCaseStatus failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'status_changed', note || `Status changed to: ${caseStatus}`, user.id, profile?.full_name || profile?.email || 'Staff', { new_status: caseStatus })

    revalidatePath('/dashboard/participation-cases')
    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

export async function updateCaseClosure(regId: string, caseStatus: string, closureReason: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    const { data: current } = await supabase
        .from('registrations')
        .select('additional_data')
        .eq('id', regId)
        .single()

    const additionalData = (current?.additional_data as Record<string, unknown> | null) || {}
    const { error } = await supabase
        .from('registrations')
        .update({
            case_status: caseStatus,
            additional_data: {
                ...additionalData,
                closure_reason: closureReason,
                closed_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
        })
        .eq('id', regId)

    if (error) {
        console.error('updateCaseClosure failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'status_changed', `Case closed/cancelled: ${closureReason}`, user.id, profile?.full_name || profile?.email || 'Staff', { new_status: caseStatus, closure_reason: closureReason })

    revalidatePath('/dashboard/participation-cases')
    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  5) Save generic JSONB data on registrations (for the tabs)
//     column = 'embassy_application' | 'additional_data' | ...
//     Merges with the existing value.
// ─────────────────────────────────────────────────────────────────
export async function saveRegistrationJsonb(
    regId: string,
    column: 'embassy_application' | 'additional_data' | 'form_data' | 'documents',
    patch: Record<string, unknown>,
    eventAction: string,
    eventDescription: string,
) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    // read the current value first
    const { data: current } = await supabase
        .from('registrations')
        .select(column)
        .eq('id', regId)
        .single()

    const existing = ((current as any)?.[column] as Record<string, unknown> | null) || {}
    const merged = { ...existing, ...patch }

    const { error } = await supabase
        .from('registrations')
        .update({ [column]: merged, updated_at: new Date().toISOString() })
        .eq('id', regId)

    if (error) {
        console.error('saveRegistrationJsonb failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, eventAction, eventDescription, user.id, profile?.full_name || profile?.email || 'Staff', patch)

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  6) Save payment data (total_amount + payment_status + JSONB discount)
// ─────────────────────────────────────────────────────────────────
export async function savePaymentData(
    regId: string,
    data: {
        total_amount?: number
        payment_status?: string
        service_package?: string
        currency?: string
        discount?: { amount: number; reason: string }
        discount_approved?: boolean
        receipt?: { number: string; date: string; method: string }
    },
) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.total_amount !== undefined) update.total_amount = data.total_amount
    const hasReceipt = !!data.receipt?.number?.trim()
    if (hasReceipt) update.payment_status = 'paid'
    else if (data.payment_status !== undefined) update.payment_status = data.payment_status

    // discount and receipt live in additional_data
    if (data.discount || data.receipt || data.currency || data.discount_approved !== undefined || data.service_package) {
        const { data: current } = await supabase
            .from('registrations')
            .select('additional_data, selected_services')
            .eq('id', regId)
            .single()
        const ad = (current?.additional_data as Record<string, unknown> | null) || {}
        if (data.currency) ad.payment_currency = data.currency
        if (data.discount) ad.payment_discount = { ...data.discount, approved: !!data.discount_approved }
        if (data.receipt) ad.payment_receipt = data.receipt
        update.additional_data = ad

        if (data.service_package) {
            const selected = (current?.selected_services as Record<string, unknown> | null) || {}
            update.selected_services = {
                ...selected,
                service_package: data.service_package,
                requirements: getServiceRequirements(data.service_package),
            }
        }
    }

    const { error } = await supabase
        .from('registrations')
        .update(update)
        .eq('id', regId)

    if (error) {
        console.error('savePaymentData failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'payment_updated', 'Payment data updated', user.id, profile?.full_name || profile?.email || 'Staff', data)

    if (hasReceipt) {
        await supabase
            .from('registrations')
            .update({ case_status: 'payment_confirmed' })
            .eq('id', regId)
        await logEvent(supabase, regId, 'status_changed', 'Payment automatically confirmed because a receipt number was entered', user.id, profile?.full_name || profile?.email || 'Staff', { new_status: 'payment_confirmed' })
    }

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  7) Update client data (full_name, email, form_data.phone...)
// ─────────────────────────────────────────────────────────────────
export async function updateClientData(regId: string, data: Record<string, unknown>) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    // 1) find the client_id linked to the registration
    const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('client_id')
        .eq('id', regId)
        .single()

    if (regError || !reg || !reg.client_id) {
        console.error('updateClientData failed: registration or client_id not found', regError)
        return { error: 'Participation case not found or not linked to a client' }
    }

    const clientId = reg.client_id

    // 2) map form fields to clients table columns
    const clientPatch: Record<string, any> = {
        updated_at: new Date().toISOString()
    }

    const mapping: Record<string, string> = {
        full_name: 'full_name_as_passport',
        first_name: 'first_name',
        last_name: 'last_name',
        date_of_birth: 'date_of_birth',
        place_of_birth: 'place_of_birth',
        sex: 'sex',
        nationality: 'nationality',
        marital_status: 'marital_status',
        residence_country: 'residence_country',
        city: 'city',
        full_address: 'full_address',
        passport_number: 'passport_number',
        passport_type: 'passport_type',
        passport_issue_date: 'passport_issue_date',
        passport_expiry_date: 'passport_expiry_date',
        passport_place_of_issue: 'passport_place_of_issue',
        email: 'email',
        phone: 'phone',
        whatsapp: 'whatsapp_number',
        alt_phone: 'alt_phone',
        employer_name: 'employer_name',
        workplace_type: 'workplace_type',
        job_title: 'job_title',
        department: 'department',
        professional_specialty: 'professional_specialty',
        work_city: 'work_city',
        work_governorate: 'work_governorate',
        work_phone: 'work_phone',
        work_email: 'work_email',
        company_website: 'company_website',
        work_address: 'work_address',
        previous_schengen_visa: 'previous_schengen_visa',
        schengen_visas_last_5y: 'schengen_visas_last_5y',
        other_residence_permit: 'other_residence_permit'
    }

    for (const [k, v] of Object.entries(data)) {
        const dbCol = mapping[k]
        if (dbCol) {
            if ((dbCol === 'date_of_birth' || dbCol === 'passport_issue_date' || dbCol === 'passport_expiry_date') && v === '') {
                clientPatch[dbCol] = null
            } else {
                clientPatch[dbCol] = v
            }
        }
    }

    // 3) update the clients table
    const { error: clientError } = await supabase
        .from('clients')
        .update(clientPatch)
        .eq('id', clientId)

    if (clientError) {
        console.error('updateClientData client update failed:', clientError)
        return { error: clientError.message }
    }

    // 4) sync core fields into the registrations table for display consistency across dashboards
    const regUpdate: Record<string, any> = {
        updated_at: new Date().toISOString()
    }
    if (data.full_name !== undefined) regUpdate.full_name = data.full_name
    if (data.email !== undefined) regUpdate.email = data.email

    if (Object.keys(regUpdate).length > 1) {
        const { error: regUpdateErr } = await supabase
            .from('registrations')
            .update(regUpdate)
            .eq('id', regId)
        if (regUpdateErr) {
            console.error('updateClientData sync to registrations failed:', regUpdateErr)
        }
    }

    await logEvent(supabase, regId, 'client_updated', 'Client data updated successfully', user.id, profile?.full_name || profile?.email || 'Staff', data)

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    revalidatePath('/dashboard/participation-cases')
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  8) Upload a document directly to Supabase Storage, then register it in documents
// ─────────────────────────────────────────────────────────────────
const REGISTRATION_DOCUMENTS_BUCKET = 'events-bucket'

function getRegistrationDocumentMaxSize(docType: string) {
    return docType === 'merged_package' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
}

function isSafeRegistrationUploadValue(value: string) {
    return /^[a-zA-Z0-9_-]+$/.test(value)
}

export async function prepareRegistrationDocumentUpload(
    regId: string,
    file: { name: string; size: number; type: string },
    docType: string,
) {
    try {
        const { supabase, user, profile } = await getCurrentUser()
        if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

        if (!isSafeRegistrationUploadValue(regId) || !isSafeRegistrationUploadValue(docType)) {
            return { error: 'Invalid document data' }
        }

        if (!file?.name || !Number.isFinite(file.size) || file.size <= 0) {
            return { error: 'No valid file was selected' }
        }

        const maxFileSize = getRegistrationDocumentMaxSize(docType)
        if (file.size > maxFileSize) {
            const maxSizeMb = Math.round(maxFileSize / (1024 * 1024))
            return { error: `File is too large. Maximum size is ${maxSizeMb} MB` }
        }

        const safeFileName = file.name
            .slice(0, 180)
            .replace(/[^a-zA-Z0-9.-]/g, '_') || 'document'
        const storagePath = `registrations/${regId}/${Date.now()}_${crypto.randomUUID()}_${docType}_${safeFileName}`
        const { data, error } = await supabase.storage
            .from(REGISTRATION_DOCUMENTS_BUCKET)
            .createSignedUploadUrl(storagePath)

        if (error || !data) {
            console.error('prepareRegistrationDocumentUpload failed:', error)
            return { error: error?.message || 'Could not prepare the file upload link' }
        }

        return {
            error: null,
            bucket: REGISTRATION_DOCUMENTS_BUCKET,
            path: data.path,
            token: data.token,
        }
    } catch (error) {
        console.error('prepareRegistrationDocumentUpload unexpected failure:', error)
        return { error: 'Could not start the file upload. Please try again.' }
    }
}

export async function finalizeRegistrationDocumentUpload(
    regId: string,
    storagePath: string,
    docType: string,
    label: string,
) {
    try {
        const { supabase, user, profile } = await getCurrentUser()
        if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

        const expectedPrefix = `registrations/${regId}/`
        if (
            !isSafeRegistrationUploadValue(regId)
            || !isSafeRegistrationUploadValue(docType)
            || !storagePath.startsWith(expectedPrefix)
            || !label.trim()
        ) {
            return { error: 'Invalid document data' }
        }

        const { data: storedFile, error: fileError } = await supabase.storage
            .from(REGISTRATION_DOCUMENTS_BUCKET)
            .info(storagePath)

        if (fileError || !storedFile) {
            console.error('finalizeRegistrationDocumentUpload file verification failed:', fileError)
            return { error: 'The file upload to storage did not complete' }
        }

        const maxFileSize = getRegistrationDocumentMaxSize(docType)
        if (typeof storedFile.size === 'number' && storedFile.size > maxFileSize) {
            await supabase.storage.from(REGISTRATION_DOCUMENTS_BUCKET).remove([storagePath])
            const maxSizeMb = Math.round(maxFileSize / (1024 * 1024))
            return { error: `File is too large. Maximum size is ${maxSizeMb} MB` }
        }

        const { data: publicUrlData } = supabase.storage
            .from(REGISTRATION_DOCUMENTS_BUCKET)
            .getPublicUrl(storagePath)
        const url = publicUrlData.publicUrl

        const { data: current, error: registrationError } = await supabase
            .from('registrations')
            .select('documents')
            .eq('id', regId)
            .single()

        if (registrationError || !current) {
            console.error('finalizeRegistrationDocumentUpload registration lookup failed:', registrationError)
            return { error: registrationError?.message || 'Could not find the application' }
        }

        const docsRaw = current.documents
        const docs = Array.isArray(docsRaw) ? docsRaw : []
        const newDoc = {
            name: label.trim().slice(0, 200),
            path: url,
            uploadedAt: new Date().toISOString(),
            type: docType,
            // Storage reports the authoritative size; the UI previously showed
            // a hardcoded placeholder for every file.
            size: typeof storedFile.size === 'number' ? storedFile.size : undefined,
        }
        const nextDocs = [
            ...docs.filter((doc: any) => doc?.type !== docType),
            newDoc,
        ]

        const { error } = await supabase
            .from('registrations')
            .update({ documents: nextDocs, updated_at: new Date().toISOString() })
            .eq('id', regId)

        if (error) {
            console.error('finalizeRegistrationDocumentUpload failed:', error)
            await supabase.storage.from(REGISTRATION_DOCUMENTS_BUCKET).remove([storagePath])
            return { error: error.message }
        }

        await logEvent(
            supabase,
            regId,
            'document_uploaded',
            `Document uploaded: ${label}`,
            user.id,
            profile?.full_name || profile?.email || 'Staff',
            { doc_type: docType, url },
        )

        revalidatePath(`/dashboard/participation-cases/${regId}`)
        return { error: null, url }
    } catch (error) {
        console.error('finalizeRegistrationDocumentUpload unexpected failure:', error)
        return { error: 'The file was uploaded, but could not be registered on the application. Please try again.' }
    }
}

// ─────────────────────────────────────────────────────────────────
//  9) Delete a document from the documents JSONB (by path)
// ─────────────────────────────────────────────────────────────────
export async function deleteRegistrationDocument(regId: string, docPath: string, docLabel: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'Unauthorized' }

    const { data: current } = await supabase
        .from('registrations')
        .select('documents')
        .eq('id', regId)
        .single()
    const docsRaw = current?.documents
    const docs = Array.isArray(docsRaw) ? docsRaw : []
    const filtered = docs.filter((d: any) => d.path !== docPath && d.name !== docLabel)

    const { error } = await supabase
        .from('registrations')
        .update({ documents: filtered, updated_at: new Date().toISOString() })
        .eq('id', regId)

    if (error) {
        console.error('deleteRegistrationDocument failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'document_deleted', `Document deleted: ${docLabel}`, user.id, profile?.full_name || profile?.email || 'Staff')

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  10) Update the event inviter details in registration_config.inviter
// ─────────────────────────────────────────────────────────────────
export async function updateEventInviterDetails(eventId: string, inviter: {
    host_org: string
    host_address: string
    host_contact_name: string
    host_contact_phone: string
    host_contact_email: string
}) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { error: 'Unauthorized' }

    const { data: event, error: getError } = await supabase
        .from('events')
        .select('registration_config')
        .eq('id', eventId)
        .single()

    if (getError || !event) {
        return { error: 'Event not found' }
    }

    const currentConfig = (event.registration_config as Record<string, any>) || {}
    const updatedConfig = {
        ...currentConfig,
        inviter: inviter
    }

    const { error: updateError } = await supabase
        .from('events')
        .update({ registration_config: updatedConfig })
        .eq('id', eventId)

    if (updateError) {
        console.error('updateEventInviterDetails failed:', updateError)
        return { error: updateError.message }
    }

    revalidatePath(`/dashboard/participation-cases`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  11) Calculate the client match score and compare data (step one)
// ─────────────────────────────────────────────────────────────────
function calculateClientMatchScore(client: any, input: any) {
    let score = 0
    let maxScore = 0

    const norm = (s: string) => s ? s.trim().replace(/\s+/g, ' ').toLowerCase() : ''

    if (input.fullName) {
        maxScore += 30
        const inputName = norm(input.fullName)
        const clientName = norm(client.full_name_as_passport)
        if (inputName === clientName) {
            score += 30
        } else if (clientName.includes(inputName) || inputName.includes(clientName)) {
            score += 15
        }
    }

    if (input.surname) {
        maxScore += 10
        if (norm(input.surname) === norm(client.last_name)) {
            score += 10
        }
    }

    if (input.dateOfBirth) {
        maxScore += 30
        if (input.dateOfBirth === client.date_of_birth) {
            score += 30
        }
    }

    if (input.nationalId) {
        maxScore += 30
        if (norm(input.nationalId) === norm(client.national_id)) {
            score += 30
        }
    }

    if (input.placeOfBirth) {
        maxScore += 10
        if (norm(input.placeOfBirth) === norm(client.place_of_birth)) {
            score += 10
        }
    }

    if (input.passportNumber) {
        maxScore += 15
        if (norm(input.passportNumber) === norm(client.passport_number)) {
            score += 15
        }
    }

    if (input.phone) {
        maxScore += 15
        if (norm(input.phone) === norm(client.phone)) {
            score += 15
        }
    }

    if (input.email) {
        maxScore += 15
        if (norm(input.email) === norm(client.email)) {
            score += 15
        }
    }

    if (input.companyName) {
        maxScore += 5
        if (norm(input.companyName) === norm(client.employer_name)) {
            score += 5
        }
    }

    if (input.maritalStatus) {
        maxScore += 5
        if (norm(input.maritalStatus) === norm(client.marital_status)) {
            score += 5
        }
    }

    if (input.gender) {
        maxScore += 5
        if (norm(input.gender) === norm(client.sex)) {
            score += 5
        }
    }

    if (input.salutation) {
        maxScore += 5
        if (norm(input.salutation) === norm(client.title_salutation || '')) {
            score += 5
        }
    }

    if (maxScore === 0) return 0
    return Math.round((score / maxScore) * 100)
}

export async function searchClientsWithMatchingScore(input: {
    fullName?: string
    surname?: string
    salutation?: string
    gender?: string
    maritalStatus?: string
    passportNumber?: string
    nationalId?: string
    phone?: string
    email?: string
    companyName?: string
    dateOfBirth?: string
    placeOfBirth?: string
    passportIssueDate?: string
    passportExpiryDate?: string
}) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { data: [], error: 'Unauthorized' }

    const orConditions: string[] = []
    if (input.fullName?.trim()) {
        orConditions.push(`full_name_as_passport.ilike.%${input.fullName.trim()}%`)
    }
    if (input.nationalId?.trim()) {
        orConditions.push(`national_id.eq.${input.nationalId.trim()}`)
    }
    if (input.passportNumber?.trim()) {
        orConditions.push(`passport_number.eq.${input.passportNumber.trim()}`)
    }
    if (input.dateOfBirth) {
        orConditions.push(`date_of_birth.eq.${input.dateOfBirth}`)
    }
    if (input.phone?.trim()) {
        orConditions.push(`phone.eq.${input.phone.trim()}`)
    }
    if (input.email?.trim()) {
        orConditions.push(`email.eq.${input.email.trim()}`)
    }

    if (orConditions.length === 0) {
        return { data: [], error: null }
    }

    const { data: candidates, error } = await supabase
        .from('clients')
        .select('id, full_name_as_passport, last_name, date_of_birth, national_id, place_of_birth, passport_number, phone, email, employer_name, professional_specialty, marital_status, sex, title_salutation, job_title, department, work_city, work_governorate, work_phone, work_email')
        .or(orConditions.join(','))
        .limit(50)

    if (error) {
        console.error('searchClientsWithMatchingScore failed:', error)
        return { data: [], error: error.message }
    }

    const clientIds = (candidates || []).map((client) => client.id)
    const { data: registrations, error: registrationsError } = clientIds.length > 0
        ? await supabase
            .from('registrations')
            .select('id, client_id, case_number, event_id, events(title, title_ar, date, location, location_ar)')
            .in('client_id', clientIds)
            .order('created_at', { ascending: false })
        : { data: [], error: null }

    if (registrationsError) console.error('searchClientsWithMatchingScore registrations failed:', registrationsError)
    const registrationsByClient = new Map<string, any[]>()
    for (const registration of registrations || []) {
        if (!registration.client_id) continue
        const current = registrationsByClient.get(registration.client_id) || []
        current.push(registration)
        registrationsByClient.set(registration.client_id, current)
    }

    const results = (candidates || []).map((client) => {
        const score = calculateClientMatchScore(client, input)
        let matchType: 'Exact Match' | 'Strong Match' | 'Potential Match' | 'Low Confidence Match' | 'No Match' = 'No Match'
        
        if (score >= 95) matchType = 'Exact Match'
        else if (score >= 85) matchType = 'Strong Match'
        else if (score >= 70) matchType = 'Potential Match'
        else if (score >= 50) matchType = 'Low Confidence Match'

        return {
            client: { ...client, registrations: registrationsByClient.get(client.id) || [] },
            score,
            matchType
        }
    })

    const sorted = results
        .filter(r => r.score >= 40)
        .sort((a, b) => b.score - a.score)

    return { data: sorted, error: null }
}

// ─────────────────────────────────────────────────────────────────
//  12) Continue with an existing client, renew passport data, and save the draft
// ─────────────────────────────────────────────────────────────────
export async function continueWithClientAction(input: {
    clientId: string
    updateProfile: boolean
    eventId: string
    newData: {
        fullName?: string
        surname?: string
        salutation?: string
        gender?: string
        maritalStatus?: string
        passportNumber?: string
        nationalId?: string
        phone?: string
        email?: string
        companyName?: string
        companySpecialty?: string
        dateOfBirth?: string
        placeOfBirth?: string
        passportIssueDate?: string
        passportExpiryDate?: string
        jobTitle?: string
        department?: string
        workCity?: string
        workPhone?: string
        workEmail?: string
        residenceCountry?: string
        previousSchengenVisa?: boolean
        previousSchengenVisas?: any[]
        otherResidencePermit?: any
    }
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { data: null, error: 'Unauthorized' }

    const { data: client, error: fetchErr } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('id', input.clientId)
        .single()

    if (fetchErr || !client) {
        return { data: null, error: 'Client not found' }
    }

    const updatedHistory = Array.isArray((client as any).passport_history) ? (client as any).passport_history : []

    const passportChanged = input.newData.passportNumber && client.passport_number && 
        input.newData.passportNumber.trim() !== client.passport_number.trim()

    if (passportChanged) {
        updatedHistory.push({
            passport_number: client.passport_number,
            passport_issue_date: client.passport_issue_date,
            passport_expiry_date: client.passport_expiry_date,
            passport_place_of_issue: client.passport_place_of_issue,
            passport_type: client.passport_type,
            status: 'Replaced',
            archived_at: new Date().toISOString()
        })
    }

    const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
        passport_history: updatedHistory
    }

    if (input.updateProfile) {
        if (input.newData.phone) updates.phone = input.newData.phone
        if (input.newData.email) updates.email = input.newData.email
        if (input.newData.companyName) updates.employer_name = input.newData.companyName
        if (input.newData.companySpecialty) updates.professional_specialty = input.newData.companySpecialty
        if (input.newData.maritalStatus) updates.marital_status = input.newData.maritalStatus
        if (input.newData.salutation) updates.title_salutation = input.newData.salutation
        if (input.newData.gender) updates.sex = input.newData.gender

        if (input.newData.passportNumber) updates.passport_number = input.newData.passportNumber
        if (input.newData.passportIssueDate) updates.passport_issue_date = input.newData.passportIssueDate
        if (input.newData.passportExpiryDate) updates.passport_expiry_date = input.newData.passportExpiryDate

        if (input.newData.fullName) updates.full_name_as_passport = input.newData.fullName
        if (input.newData.surname) updates.last_name = input.newData.surname
        if (input.newData.dateOfBirth) updates.date_of_birth = input.newData.dateOfBirth
        if (input.newData.placeOfBirth) updates.place_of_birth = input.newData.placeOfBirth
        if (input.newData.nationalId) updates.national_id = input.newData.nationalId
        if (input.newData.residenceCountry) updates.residence_country = input.newData.residenceCountry
        if (input.newData.previousSchengenVisa !== undefined) updates.previous_schengen_visa = input.newData.previousSchengenVisa
        if (input.newData.previousSchengenVisas !== undefined) updates.schengen_visas_last_5y = input.newData.previousSchengenVisas
        if (input.newData.otherResidencePermit !== undefined) updates.other_residence_permit = input.newData.otherResidencePermit
    }

    // Employment information is captured on the client-search step and must
    // follow the client into future applications, even when passport details
    // are intentionally left unchanged.
    if (input.newData.jobTitle) updates.job_title = input.newData.jobTitle
    if (input.newData.department) updates.department = input.newData.department
    if (input.newData.workCity) {
        updates.work_city = input.newData.workCity
        updates.work_governorate = input.newData.workCity
    }
    if (input.newData.workPhone) updates.work_phone = input.newData.workPhone
    if (input.newData.workEmail) updates.work_email = input.newData.workEmail

    const { error: updateErr } = await (supabase as any)
        .from('clients')
        .update(updates)
        .eq('id', input.clientId)

    if (updateErr) {
        console.error('Failed to update client profile:', updateErr)
        return { data: null, error: updateErr.message }
    }

    // Draft Reuse Logic: Check if there is an unfinished draft registration for this client on the selected event
    const { data: existingDraft } = await supabase
        .from('registrations')
        .select('id, case_number')
        .eq('client_id', input.clientId)
        .eq('event_id', input.eventId)
        .eq('case_status', 'new_request')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    let targetRegId = ''
    let caseNumber = ''

    if (existingDraft) {
        targetRegId = existingDraft.id
        caseNumber = existingDraft.case_number || ''
    } else {
        caseNumber = await generateCaseNumber(supabase)

        const { data: newReg, error: createRegErr } = await (supabase as any)
            .from('registrations')
            .insert({
                client_id: input.clientId,
                full_name: updates.full_name_as_passport || client.full_name_as_passport,
                email: updates.email || client.email || `${Date.now()}@anonymous.jaz`,
                status: 'confirmed',
                payment_status: 'pending',
                total_amount: 0,
                current_step: 2,
                case_number: caseNumber,
                case_status: 'new_request',
                assigned_employee_id: user.id,
                notes: 'Draft created via registration wizard.',
                form_data: { phone: updates.phone || client.phone || '' },
                event_id: input.eventId
            })
            .select('id')
            .single()

        if (createRegErr) {
            console.error('Failed to create registration draft:', createRegErr)
            return { data: null, error: createRegErr.message }
        }
        targetRegId = newReg.id
    }

    // Snapshot Logic: capture client's current details and save them to client_snapshot column
    const { data: latestClient } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('id', input.clientId)
        .single()

    if (latestClient) {
        const snapshot = {
            full_name: latestClient.full_name_as_passport,
            surname: latestClient.last_name,
            salutation: latestClient.title_salutation,
            gender: latestClient.sex,
            marital_status: latestClient.marital_status,
            passport_number: latestClient.passport_number,
            passport_issue_date: latestClient.passport_issue_date,
            passport_expiry_date: latestClient.passport_expiry_date,
            national_id: latestClient.national_id,
            date_of_birth: latestClient.date_of_birth,
            place_of_birth: latestClient.place_of_birth,
            phone: latestClient.phone,
            email: latestClient.email,
            company_name: latestClient.employer_name,
            residence_country: latestClient.residence_country,
            previous_schengen_visa: latestClient.previous_schengen_visa,
            schengen_visas_last_5y: latestClient.schengen_visas_last_5y,
            other_residence_permit: latestClient.other_residence_permit,
            timestamp: new Date().toISOString()
        }

        await (supabase as any)
            .from('registrations')
            .update({ client_snapshot: snapshot })
            .eq('id', targetRegId)
    }

    // Cleanup is best-effort. A deployment without the service-role key must
    // not prevent staff from continuing with an existing client.
    try {
        await purgeExpiredApplicationDocuments(targetRegId)
    } catch (cleanupError) {
        console.error('Expired application document cleanup skipped:', cleanupError)
    }

    await logEvent(supabase, targetRegId, 'client_updated', 'Client data updated and linked to a new application/draft', user.id, profile?.full_name || profile?.email || 'Staff', { client_id: input.clientId, passport_changed: !!passportChanged })

    revalidatePath('/dashboard/participation-cases')
    return { data: { registrationId: targetRegId, caseNumber }, error: null }
}

// ─────────────────────────────────────────────────────────────────
//  13) Create a new client and generate a new application and draft
// ─────────────────────────────────────────────────────────────────
export async function createNewClientAndApplication(input: {
    eventId: string
    clientData: {
        fullName: string
        surname?: string
        salutation?: string
        gender?: string
        maritalStatus?: string
        passportNumber?: string
        nationalId?: string
        phone?: string
        email?: string
        companyName?: string
        companySpecialty?: string
        dateOfBirth?: string
        placeOfBirth?: string
        passportIssueDate?: string
        passportExpiryDate?: string
        jobTitle?: string
        department?: string
        workCity?: string
        workPhone?: string
        workEmail?: string
        residenceCountry?: string
        previousSchengenVisa?: boolean
        previousSchengenVisas?: any[]
        otherResidencePermit?: any
    }
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { data: null, error: 'Unauthorized' }

    if (input.clientData.nationalId) {
        const { data: existing } = await supabase
            .from('clients')
            .select('id, full_name_as_passport')
            .eq('national_id', input.clientData.nationalId.trim())
            .limit(1)
            .maybeSingle()

        if (existing) {
            return { data: null, error: `This national ID is already used by client: ${existing.full_name_as_passport}` }
        }
    }

    const { data: newClient, error: clientErr } = await (supabase as any)
        .from('clients')
        .insert({
            full_name_as_passport: input.clientData.fullName.trim(),
            last_name: input.clientData.surname || null,
            title_salutation: input.clientData.salutation || null,
            sex: input.clientData.gender || null,
            marital_status: input.clientData.maritalStatus || null,
            passport_number: input.clientData.passportNumber || null,
            passport_issue_date: input.clientData.passportIssueDate || null,
            passport_expiry_date: input.clientData.passportExpiryDate || null,
            national_id: input.clientData.nationalId || null,
            date_of_birth: input.clientData.dateOfBirth || null,
            place_of_birth: input.clientData.placeOfBirth || null,
            phone: input.clientData.phone || null,
            email: input.clientData.email || null,
            employer_name: input.clientData.companyName || null,
            professional_specialty: input.clientData.companySpecialty || null,
            job_title: input.clientData.jobTitle || null,
            department: input.clientData.department || null,
            work_city: input.clientData.workCity || null,
            work_governorate: input.clientData.workCity || null,
            work_phone: input.clientData.workPhone || null,
            work_email: input.clientData.workEmail || null,
            residence_country: input.clientData.residenceCountry || null,
            previous_schengen_visa: input.clientData.previousSchengenVisa || false,
            schengen_visas_last_5y: input.clientData.previousSchengenVisas || [],
            other_residence_permit: input.clientData.otherResidencePermit || null,
            passport_history: []
        })
        .select('*')
        .single()

    if (clientErr) {
        console.error('Failed to create new client:', clientErr)
        return { data: null, error: clientErr.message }
    }

    const caseNumber = await generateCaseNumber(supabase)

    const { data: newReg, error: createRegErr } = await (supabase as any)
        .from('registrations')
        .insert({
            client_id: newClient.id,
            full_name: newClient.full_name_as_passport,
            email: newClient.email || `${Date.now()}@anonymous.jaz`,
            status: 'confirmed',
            payment_status: 'pending',
            total_amount: 0,
            current_step: 2,
            case_number: caseNumber,
            case_status: 'new_request',
            assigned_employee_id: user.id,
            notes: 'New client and draft created.',
            form_data: { phone: newClient.phone || '' },
            event_id: input.eventId
        })
        .select('id')
        .single()

    if (createRegErr) {
        console.error('Failed to create registration draft:', createRegErr)
        return { data: null, error: createRegErr.message }
    }

    const snapshot = {
        full_name: newClient.full_name_as_passport,
        surname: newClient.last_name,
        salutation: newClient.title_salutation,
        gender: newClient.sex,
        marital_status: newClient.marital_status,
        passport_number: newClient.passport_number,
        passport_issue_date: newClient.passport_issue_date,
        passport_expiry_date: newClient.passport_expiry_date,
        national_id: newClient.national_id,
        date_of_birth: newClient.date_of_birth,
        place_of_birth: newClient.place_of_birth,
        phone: newClient.phone,
        email: newClient.email,
        company_name: newClient.employer_name,
        residence_country: newClient.residence_country,
        previous_schengen_visa: newClient.previous_schengen_visa,
        schengen_visas_last_5y: newClient.schengen_visas_last_5y,
        other_residence_permit: newClient.other_residence_permit,
        timestamp: new Date().toISOString()
    }

    await purgeExpiredApplicationDocuments(newReg.id)

    await (supabase as any)
        .from('registrations')
        .update({ client_snapshot: snapshot })
        .eq('id', newReg.id)

    await logEvent(supabase, newReg.id, 'case_created', 'Client case created and a new application and draft generated in the system', user.id, profile?.full_name || profile?.email || 'Staff', { client_id: newClient.id, case_number: caseNumber })

    revalidatePath('/dashboard/participation-cases')
    return { data: { registrationId: newReg.id, caseNumber }, error: null }
}
