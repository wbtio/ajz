'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/database.types'

// ─────────────────────────────────────────────────────────────────
//  مساعد: جلب المستخدم الحالي + التحقق من الصلاحية
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

// ── مساعد داخلي: تسجيل حدث على التسجيل ──
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

/** سجل مختصر لتعديلات صفحات الـ wizard التي تحفظ مباشرة من العميل. */
export async function recordRegistrationActivity(input: {
    registrationId: string
    action: string
    description: string
    step?: number
    metadata?: Record<string, unknown>
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!user || !isStaff(profile)) return { error: 'غير مصرح' }
    await logEvent(
        supabase,
        input.registrationId,
        input.action,
        input.description,
        user.id,
        profile?.full_name || profile?.email || 'موظف',
        { ...(input.metadata ?? {}), step: input.step },
    )
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  1) البحث عن تسجيل/عميل موجود (لإعادة الاستخدام بدل تكرار)
// ─────────────────────────────────────────────────────────────────
export async function searchRegistrations(query: string) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { data: [], error: 'غير مصرح' }

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
//  1.5) البحث عن العملاء (لإعادة الاستخدام وتجنب تكرار العملاء)
// ─────────────────────────────────────────────────────────────────
export async function searchClients(input: {
    fullName: string
    dateOfBirth?: string
    placeOfBirth?: string
}) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { data: [], error: 'غير مصرح' }

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
//  2) توليد رقم ملف تسلسلي JAZ-{آخر رقمين من السنة}-{تسلسل}
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
//  3) إنشاء تسجيل مشاركة جديد (يدوي — من واتساب/هاتف)
//     يُدرج صف في registrations مع case_number + case_status.
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
    if (!isStaff(profile) || !user) return { data: null, error: 'غير مصرح' }

    if (!input.eventId || (!input.clientId && !input.fullName.trim())) {
        return { data: null, error: 'الفعالية والاسم مطلوبان' }
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
        // إنشاء عميل جديد
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
            user_id: null, // يدوي
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

    await logEvent(supabase, reg.id, 'case_created', 'تم إنشاء ملف المشاركة وتعيين العميل', user.id, profile?.full_name || profile?.email || 'موظف', { case_number: caseNumber, source: input.source, client_id: finalClientId })

    revalidatePath('/dashboard/participation-cases')
    return { data: reg, error: null }
}

function getServiceRequirements(servicePackage: string) {
    const base = [
        { key: 'passport', label: 'نسخة الجواز', required: true },
        { key: 'photo', label: 'صورة شخصية', required: true },
        { key: 'professional_evidence', label: 'إثبات مهني', required: false },
    ]

    if (servicePackage === 'registration_invitation' || servicePackage === 'registration_invitation_visa' || servicePackage === 'full') {
        base.push({ key: 'invitation', label: 'الدعوة الرسمية', required: true })
    }

    if (servicePackage === 'registration_invitation_visa' || servicePackage === 'full') {
        base.push(
            { key: 'insurance', label: 'وثيقة التأمين', required: true },
            { key: 'tls_appointment', label: 'تأكيد موعد TLS', required: true },
        )
    }

    return base
}

// ─────────────────────────────────────────────────────────────────
//  4) تحديث حالة الملف التفصيلية (case_status)
// ─────────────────────────────────────────────────────────────────
export async function updateCaseStatus(regId: string, caseStatus: string, note?: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

    const { error } = await supabase
        .from('registrations')
        .update({ case_status: caseStatus })
        .eq('id', regId)

    if (error) {
        console.error('updateCaseStatus failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'status_changed', note || `تم تغيير الحالة إلى: ${caseStatus}`, user.id, profile?.full_name || profile?.email || 'موظف', { new_status: caseStatus })

    revalidatePath('/dashboard/participation-cases')
    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

export async function updateCaseClosure(regId: string, caseStatus: string, closureReason: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

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

    await logEvent(supabase, regId, 'status_changed', `تم إغلاق/إلغاء الملف: ${closureReason}`, user.id, profile?.full_name || profile?.email || 'موظف', { new_status: caseStatus, closure_reason: closureReason })

    revalidatePath('/dashboard/participation-cases')
    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  5) حفظ بيانات JSONB عامة على registrations (للتبويبات)
//     column = 'embassy_application' | 'additional_data' | ...
//     تدمج مع القيمة الموجودة (merge).
// ─────────────────────────────────────────────────────────────────
export async function saveRegistrationJsonb(
    regId: string,
    column: 'embassy_application' | 'additional_data' | 'form_data' | 'documents',
    patch: Record<string, unknown>,
    eventAction: string,
    eventDescription: string,
) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

    // اقرأ القيمة الحالية أولاً
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

    await logEvent(supabase, regId, eventAction, eventDescription, user.id, profile?.full_name || profile?.email || 'موظف', patch)

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  6) حفظ بيانات الدفع (total_amount + payment_status + JSONB خصم)
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
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.total_amount !== undefined) update.total_amount = data.total_amount
    const hasReceipt = !!data.receipt?.number?.trim()
    if (hasReceipt) update.payment_status = 'paid'
    else if (data.payment_status !== undefined) update.payment_status = data.payment_status

    // الخصم والإيصال في additional_data
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

    await logEvent(supabase, regId, 'payment_updated', 'تم تحديث بيانات الدفع', user.id, profile?.full_name || profile?.email || 'موظف', data)

    if (hasReceipt) {
        await supabase
            .from('registrations')
            .update({ case_status: 'payment_confirmed' })
            .eq('id', regId)
        await logEvent(supabase, regId, 'status_changed', 'تم تأكيد الدفع تلقائياً بسبب إدخال رقم الإيصال', user.id, profile?.full_name || profile?.email || 'موظف', { new_status: 'payment_confirmed' })
    }

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  7) تحديث بيانات العميل (full_name, email, form_data.phone...)
// ─────────────────────────────────────────────────────────────────
export async function updateClientData(regId: string, data: Record<string, unknown>) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

    // 1) البحث عن client_id المرتبط بالتسجيل
    const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('client_id')
        .eq('id', regId)
        .single()

    if (regError || !reg || !reg.client_id) {
        console.error('updateClientData failed: registration or client_id not found', regError)
        return { error: 'ملف المشاركة غير موجود أو غير مرتبط بعميل' }
    }

    const clientId = reg.client_id

    // 2) خرائط الحقول من الواجهة لأعمدة جدول clients
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

    // 3) تحديث جدول العملاء
    const { error: clientError } = await supabase
        .from('clients')
        .update(clientPatch)
        .eq('id', clientId)

    if (clientError) {
        console.error('updateClientData client update failed:', clientError)
        return { error: clientError.message }
    }

    // 4) مزامنة الحقول الأساسية في جدول registrations للتوافق مع العرض في لوحات التحكم
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

    await logEvent(supabase, regId, 'client_updated', 'تم تحديث بيانات العميل المستقل بنجاح', user.id, profile?.full_name || profile?.email || 'موظف', data)

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    revalidatePath('/dashboard/participation-cases')
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  8) رفع وثيقة إلى documents JSONB (نفس شكل الموقع: مصفوفة)
// ─────────────────────────────────────────────────────────────────
export async function uploadRegistrationDocument(
    regId: string,
    formData: FormData,
    docType: string,
    label: string,
) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

    const file = formData.get('file')
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
        return { error: 'لم يتم اختيار ملف' }
    }

    const maxFileSize = docType === 'merged_package'
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024
    if (file.size > maxFileSize) {
        const maxSizeMb = Math.round(maxFileSize / (1024 * 1024))
        return { error: `حجم الملف كبير جداً، الحد الأقصى ${maxSizeMb} ميغابايت` }
    }

    // This action already has an authenticated staff session. Upload directly
    // with the server-only admin client so an internal fetch does not lose the
    // user's Supabase cookies between the Server Action and the route handler.
    const adminSupabase = createAdminClient()
    const bucketName = String(formData.get('bucket') || 'events-bucket')
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') || 'document'
    const storagePath = `registrations/${Date.now()}_${docType}_${safeFileName}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    let { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
        })

    if (uploadError && (uploadError.message.includes('not found') || uploadError.message.includes('Bucket'))) {
        const { error: bucketError } = await adminSupabase.storage.createBucket(bucketName, { public: true })
        if (!bucketError) {
            const retry = await adminSupabase.storage
                .from(bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: file.type || 'application/octet-stream',
                    upsert: false,
                })
            uploadData = retry.data
            uploadError = retry.error
        }
    }

    if (uploadError || !uploadData) {
        console.error('uploadRegistrationDocument storage upload failed:', uploadError)
        return { error: uploadError?.message || 'فشل رفع الملف إلى التخزين' }
    }

    const { data: publicUrlData } = adminSupabase.storage.from(bucketName).getPublicUrl(storagePath)
    const url = publicUrlData.publicUrl

    // اقرأ documents الحالية (قد تكون array أو object — نوحد على array)
    const { data: current } = await supabase
        .from('registrations')
        .select('documents')
        .eq('id', regId)
        .single()
    const docsRaw = current?.documents
    const docs = Array.isArray(docsRaw) ? docsRaw : []

    const newDoc = {
        name: label,
        path: url,
        uploadedAt: new Date().toISOString(),
        type: docType,
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
        console.error('uploadRegistrationDocument failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'document_uploaded', `تم رفع وثيقة: ${label}`, user.id, profile?.full_name || profile?.email || 'موظف', { doc_type: docType, url })

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null, url }
}

// ─────────────────────────────────────────────────────────────────
//  9) حذف وثيقة من documents JSONB (بالمسار)
// ─────────────────────────────────────────────────────────────────
export async function deleteRegistrationDocument(regId: string, docPath: string, docLabel: string) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { error: 'غير مصرح' }

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

    await logEvent(supabase, regId, 'document_deleted', `تم حذف وثيقة: ${docLabel}`, user.id, profile?.full_name || profile?.email || 'موظف')

    revalidatePath(`/dashboard/participation-cases/${regId}`)
    return { error: null }
}

// ─────────────────────────────────────────────────────────────────
//  10) تحديث بيانات الداعي للفعالية في registration_config.inviter
// ─────────────────────────────────────────────────────────────────
export async function updateEventInviterDetails(eventId: string, inviter: {
    host_org: string
    host_address: string
    host_contact_name: string
    host_contact_phone: string
    host_contact_email: string
}) {
    const { supabase, profile } = await getCurrentUser()
    if (!isStaff(profile)) return { error: 'غير مصرح' }

    const { data: event, error: getError } = await supabase
        .from('events')
        .select('registration_config')
        .eq('id', eventId)
        .single()

    if (getError || !event) {
        return { error: 'الفعالية غير موجودة' }
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
//  11) حساب نقاط التطابق للعميل ومقارنة البيانات (الخطوة الأولى)
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
    if (!isStaff(profile)) return { data: [], error: 'غير مصرح' }

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
        .select('id, full_name_as_passport, last_name, date_of_birth, national_id, place_of_birth, passport_number, phone, email, employer_name, marital_status, sex, title_salutation')
        .or(orConditions.join(','))
        .limit(50)

    if (error) {
        console.error('searchClientsWithMatchingScore failed:', error)
        return { data: [], error: error.message }
    }

    const results = (candidates || []).map((client) => {
        const score = calculateClientMatchScore(client, input)
        let matchType: 'Exact Match' | 'Strong Match' | 'Potential Match' | 'Low Confidence Match' | 'No Match' = 'No Match'
        
        if (score >= 95) matchType = 'Exact Match'
        else if (score >= 85) matchType = 'Strong Match'
        else if (score >= 70) matchType = 'Potential Match'
        else if (score >= 50) matchType = 'Low Confidence Match'

        return {
            client,
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
//  12) المتابعة مع عميل موجود وتجديد بيانات الجواز وحفظ المسودة
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
    }
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { data: null, error: 'غير مصرح' }

    const { data: client, error: fetchErr } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('id', input.clientId)
        .single()

    if (fetchErr || !client) {
        return { data: null, error: 'العميل غير موجود' }
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
    }

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
            timestamp: new Date().toISOString()
        }

        await (supabase as any)
            .from('registrations')
            .update({ client_snapshot: snapshot })
            .eq('id', targetRegId)
    }

    await purgeExpiredApplicationDocuments(targetRegId)

    await logEvent(supabase, targetRegId, 'client_updated', 'تم تحديث بيانات العميل وربطه بطلب جديد/مسودة', user.id, profile?.full_name || profile?.email || 'موظف', { client_id: input.clientId, passport_changed: !!passportChanged })

    revalidatePath('/dashboard/participation-cases')
    return { data: { registrationId: targetRegId, caseNumber }, error: null }
}

// ─────────────────────────────────────────────────────────────────
//  13) إنشاء عميل جديد وتوليد طلب جديد ومسودة
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
    }
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { data: null, error: 'غير مصرح' }

    if (input.clientData.nationalId) {
        const { data: existing } = await supabase
            .from('clients')
            .select('id, full_name_as_passport')
            .eq('national_id', input.clientData.nationalId.trim())
            .limit(1)
            .maybeSingle()
        
        if (existing) {
            return { data: null, error: `الرقم الوطني مستخدم بالفعل للعميل: ${existing.full_name_as_passport}` }
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
        timestamp: new Date().toISOString()
    }

    await purgeExpiredApplicationDocuments(newReg.id)

    await (supabase as any)
        .from('registrations')
        .update({ client_snapshot: snapshot })
        .eq('id', newReg.id)

    await logEvent(supabase, newReg.id, 'case_created', 'تم إنشاء ملف العميل وتوليد طلب جديد ومسودة في النظام', user.id, profile?.full_name || profile?.email || 'موظف', { client_id: newClient.id, case_number: caseNumber })

    revalidatePath('/dashboard/participation-cases')
    return { data: { registrationId: newReg.id, caseNumber }, error: null }
}
