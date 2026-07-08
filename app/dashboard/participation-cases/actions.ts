'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
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
//  2) توليد رقم ملف تسلسلي JAZ-PC-{سنة}-{تسلسل}
// ─────────────────────────────────────────────────────────────────
async function generateCaseNumber(supabase: SupabaseClient<Database>): Promise<string> {
    const year = new Date().getFullYear()
    const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .like('case_number', `JAZ-PC-${year}-%`)

    const next = ((count ?? 0) + 1).toString().padStart(5, '0')
    return `JAZ-PC-${year}-${next}`
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
    notes?: string
}) {
    const { supabase, user, profile } = await getCurrentUser()
    if (!isStaff(profile) || !user) return { data: null, error: 'غير مصرح' }

    if (!input.eventId || !input.fullName.trim()) {
        return { data: null, error: 'الفعالية والاسم مطلوبان' }
    }

    const caseNumber = await generateCaseNumber(supabase)

    const { data: reg, error } = await supabase
        .from('registrations')
        .insert({
            event_id: input.eventId,
            full_name: input.fullName.trim(),
            email: input.email || `${Date.now()}@anonymous.jaz`,
            status: 'registered',
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
            form_data: { phone: input.phone || '', notes: input.notes || '' },
            notes: input.notes || null,
        })
        .select('id, case_number')
        .single()

    if (error) {
        console.error('createManualRegistration failed:', error)
        return { data: null, error: error.message }
    }

    await logEvent(supabase, reg.id, 'case_created', 'تم إنشاء ملف المشاركة', user.id, profile?.full_name || profile?.email || 'موظف', { case_number: caseNumber, source: input.source })

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

    // افصل أعمدة registrations العادية عن form_data
    const colKeys = ['full_name', 'email', 'notes']
    const regUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const formPatch: Record<string, unknown> = {}

    for (const [k, v] of Object.entries(data)) {
        if (colKeys.includes(k)) regUpdate[k] = v
        else formPatch[k] = v
    }

    // ادمج form_data
    if (Object.keys(formPatch).length > 0) {
        const { data: current } = await supabase
            .from('registrations')
            .select('form_data')
            .eq('id', regId)
            .single()
        const fd = (current?.form_data as Record<string, unknown> | null) || {}
        regUpdate.form_data = { ...fd, ...formPatch }
    }

    const { error } = await supabase
        .from('registrations')
        .update(regUpdate)
        .eq('id', regId)

    if (error) {
        console.error('updateClientData failed:', error)
        return { error: error.message }
    }

    await logEvent(supabase, regId, 'client_updated', 'تم تحديث بيانات العميل', user.id, profile?.full_name || profile?.email || 'موظف', data)

    revalidatePath(`/dashboard/participation-cases/${regId}`)
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

    // رفع عبر API الموحّد
    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/upload-document`, {
        method: 'POST',
        body: formData,
    })
    if (!uploadRes.ok) {
        const errBody = await uploadRes.json().catch(() => ({}))
        return { error: errBody.error || 'فشل رفع الملف' }
    }
    const { url } = await uploadRes.json()

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

    const { error } = await supabase
        .from('registrations')
        .update({ documents: [...docs, newDoc], updated_at: new Date().toISOString() })
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
