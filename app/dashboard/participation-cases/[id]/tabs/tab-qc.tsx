'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Upload, Trash2, Loader2, FileText, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { uploadRegistrationDocument, deleteRegistrationDocument } from '../../actions'
import { SectionHeader } from './shared'

const DOC_TYPES = [
    { value: 'passport', label: 'جواز السفر' },
    { value: 'national_id', label: 'البطاقة الموحدة' },
    { value: 'photo', label: 'صورة شخصية' },
    { value: 'invitation', label: 'الدعوة' },
    { value: 'employment_letter', label: 'كتاب عمل' },
    { value: 'company_docs', label: 'وثائق الشركة' },
    { value: 'professional_evidence', label: 'إثبات مهني' },
    { value: 'insurance', label: 'التأمين' },
    { value: 'visa_copy', label: 'نسخة الفيزا' },
    { value: 'other', label: 'أخرى' },
]

function formatDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('ar-IQ') } catch { return '—' }
}

function normalize(value: unknown) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function inRange(target: string | null | undefined, start: string | null | undefined, end: string | null | undefined) {
    if (!target || !start || !end) return false
    const t = new Date(target).getTime()
    return t >= new Date(start).getTime() && t <= new Date(end).getTime()
}

export function TabQc({ registration }: { registration: any }) {
    const router = useRouter()
    const [uploading, setUploading] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const docsRaw = registration?.documents
    const documents = Array.isArray(docsRaw) ? docsRaw : []
    const formData = (registration?.form_data as Record<string, any>) || {}
    const ad = (registration?.additional_data as Record<string, any>) || {}
    const selectedServices = (registration?.selected_services as Record<string, any>) || {}
    const requirements = Array.isArray(selectedServices.requirements) ? selectedServices.requirements : []
    const registrationMeta = ad.registration_meta || {}
    const invitation = ad.invitation || {}
    const embassy = (registration?.embassy_application as Record<string, any>) || {}
    const event = registration?.events

    async function handleUpload(docType: string, label: string, file: File) {
        setUploading(docType)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'events-bucket')
            formData.append('type', docType)
            const { error } = await uploadRegistrationDocument(registration.id, formData, docType, label)
            if (error) toast.error(error)
            else toast.success(`تم رفع ${label}`)
            router.refresh()
        } catch { toast.error('فشل رفع الملف') } finally { setUploading(null) }
    }

    async function handleDelete(docPath: string, docLabel: string) {
        if (!confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) return
        setDeleting(docPath)
        try {
            const { error } = await deleteRegistrationDocument(registration.id, docPath, docLabel)
            if (error) toast.error(error)
            else toast.success('تم حذف الوثيقة')
            router.refresh()
        } catch { toast.error('فشل الحذف') } finally { setDeleting(null) }
    }

    const hasPassportDoc = documents.some((d: any) => d.type === 'passport' || /passport|جواز/i.test(d.name || ''))
    const fullName = registration?.full_name
    const requiredFields = [
        fullName,
        registration?.email,
        formData.phone,
        formData.nationality,
        formData.date_of_birth,
        formData.passport_number,
        formData.passport_expiry_date,
        selectedServices.service_package,
        registration?.total_amount,
    ]
    const requiredDocs = requirements.filter((r: any) => r.required)
    const completedFields = requiredFields.filter(Boolean).length
    const completedDocs = requiredDocs.filter((req: any) => documents.some((d: any) => d.type === req.key)).length
    const completionTotal = requiredFields.length + Math.max(requiredDocs.length, 1)
    const completionDone = completedFields + (requiredDocs.length ? completedDocs : 1)
    const completion = Math.round((completionDone / completionTotal) * 100)
    const hasVisaService = ['registration_invitation_visa', 'full'].includes(selectedServices.service_package)
    const invitationNameMatches = !invitation.invited_name || normalize(invitation.invited_name) === normalize(fullName)
    const badgeNameMatches = !registrationMeta.badge_name || normalize(registrationMeta.badge_name) === normalize(fullName)
    const insuranceCoversEvent = !hasVisaService || inRange(event?.date, embassy.insurance_coverage_start, embassy.insurance_coverage_end)
    const invitationCoversEvent = !invitation.travel_start_date || !invitation.travel_end_date || inRange(event?.date, invitation.travel_start_date, invitation.travel_end_date)
    const passportValidForEvent = !formData.passport_expiry_date || !event?.date || new Date(formData.passport_expiry_date).getTime() > new Date(event.date).getTime()
    const zeroErrorRows = [
        { ok: !!fullName, label: 'اسم العميل كما في الجواز', value: fullName },
        { ok: !!formData.passport_number, label: 'رقم الجواز', value: formData.passport_number },
        { ok: !!formData.date_of_birth, label: 'تاريخ الميلاد', value: formatDate(formData.date_of_birth) },
        { ok: !!formData.nationality, label: 'الجنسية', value: formData.nationality },
        { ok: passportValidForEvent, label: 'صلاحية الجواز بعد تاريخ الفعالية', value: formatDate(formData.passport_expiry_date), warn: !passportValidForEvent },
        { ok: invitationNameMatches, label: 'تطابق اسم الدعوة مع العميل', value: invitation.invited_name || 'لم يُدخل' },
        { ok: badgeNameMatches, label: 'تطابق اسم الـ Badge مع العميل', value: registrationMeta.badge_name || 'لم يُدخل' },
        { ok: insuranceCoversEvent && invitationCoversEvent, label: 'تطابق تواريخ الدعوة/التأمين مع الفعالية', value: event?.date ? formatDate(event.date) : '—', warn: !(insuranceCoversEvent && invitationCoversEvent) },
    ]
    const criticalIssues = zeroErrorRows.filter((row) => !row.ok).length

    return (
        <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={CheckCircle2} title="نسبة اكتمال الملف" desc={`${completion}% مكتمل`} />
                <div className="p-4 space-y-3">
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${completion >= 90 ? 'bg-emerald-500' : completion >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">الحقول: {completedFields}/{requiredFields.length}</div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">المتطلبات: {completedDocs}/{requiredDocs.length || 0}</div>
                        <div className={`rounded-lg border p-2 ${criticalIssues ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                            أخطاء حرجة: {criticalIssues}
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={FileText} title="قائمة المتطلبات حسب نوع الخدمة" desc={selectedServices.service_package || 'غير محدد'} />
                <div className="p-4 space-y-2.5">
                    {requirements.length > 0 ? requirements.map((req: any) => {
                        const hasDoc = documents.some((d: any) => d.type === req.key)
                        return <MatchRow key={req.key} ok={hasDoc || !req.required} label={req.label} value={hasDoc ? 'مرفوعة' : req.required ? 'مطلوبة' : 'اختيارية'} warn={req.required && !hasDoc} />
                    }) : (
                        <div className="text-sm text-slate-400 text-center py-4">اختر نوع الخدمة من تبويب الخدمة والدفع لتوليد المتطلبات.</div>
                    )}
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Upload} title="رفع الوثائق والمستندات" desc="PDF أو صور — حدّد 10MB كحد أقصى" />
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {DOC_TYPES.map((dt) => {
                        const isUploading = uploading === dt.value
                        return (
                            <div key={dt.value} className="border border-slate-200 rounded-lg p-3 text-center hover:border-slate-300 transition-colors">
                                <input
                                    ref={(el) => { fileRefs.current[dt.value] = el }}
                                    type="file" accept="image/*,application/pdf" className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0]
                                        if (f) handleUpload(dt.value, dt.label, f)
                                        e.target.value = ''
                                    }}
                                />
                                <button type="button" onClick={() => fileRefs.current[dt.value]?.click()} disabled={isUploading} className="w-full flex flex-col items-center gap-1.5 text-slate-600 hover:text-[#8b0000] disabled:opacity-50">
                                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-[#8b0000]" /> : <Upload className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[11px] font-medium leading-tight">{dt.label}</span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={FileText} title="الوثائق المرفوعة" desc={`${documents.length} وثيقة`} />
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr className="text-right">
                                <th className="py-2.5 px-4 font-semibold text-slate-600 text-xs">النوع</th>
                                <th className="py-2.5 px-4 font-semibold text-slate-600 text-xs">التاريخ</th>
                                <th className="py-2.5 px-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {documents.map((d: any, i: number) => {
                                const label = d.type ? (DOC_TYPES.find((t) => t.value === d.type)?.label || d.type) : (d.name || 'وثيقة')
                                return (
                                    <tr key={i} className="hover:bg-slate-50/60">
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-medium text-slate-800">{label}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-500 text-xs">{formatDate(d.uploadedAt)}</td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <a href={d.path} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <button onClick={() => handleDelete(d.path, label)} disabled={deleting === d.path} className="p-1.5 hover:bg-rose-50 rounded text-rose-500 disabled:opacity-50">
                                                    {deleting === d.path ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {documents.length === 0 && (
                                <tr><td colSpan={3} className="py-10 text-center text-slate-400 text-sm">لا توجد وثائق مرفوعة بعد.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={CheckCircle2} title="ZERO ERROR DATA AUDIT" />
                <div className="p-4 space-y-2.5">
                    <MatchRow ok={!!fullName} label="اسم العميل" value={fullName} />
                    <MatchRow ok={hasPassportDoc} label="نسخة الجواز مرفوعة" value={hasPassportDoc ? 'مرفوعة' : 'غير مرفوعة'} warn={!hasPassportDoc} />
                    {zeroErrorRows.map((row) => (
                        <MatchRow key={row.label} ok={row.ok} label={row.label} value={row.value} warn={row.warn} />
                    ))}
                </div>
                <div className="px-4 pb-4">
                    <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>مطابقة الاسم بين الجواز والدعوة والـBadge يجب أن تكون 100%.</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

function MatchRow({ ok, label, value, warn }: { ok: boolean; label: string; value: string | null | undefined; warn?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-2">
                {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : warn ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                <span className="text-sm text-slate-700">{label}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">{value || '—'}</span>
        </div>
    )
}
