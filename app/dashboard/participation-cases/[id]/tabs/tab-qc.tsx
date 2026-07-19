'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Loader2, FileText, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { deleteRegistrationDocument } from '../../actions'
import { uploadRegistrationDocumentDirect } from '../../registration-document-upload'
import { Section, InlineAlert, FieldLabel } from './shared'
import { cn } from '@/lib/utils'

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
    try { return new Date(d).toLocaleDateString('en-GB') } catch { return '—' }
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
    const client = (registration?.clients as Record<string, any>) || {}
    const formData = (registration?.form_data as Record<string, any>) || {}
    const getClientField = (key: string, legacyKey?: string) => {
        if (client[key] !== undefined && client[key] !== null && client[key] !== '') return client[key]
        const lKey = legacyKey || key
        return formData[lKey]
    }

    const ad = (registration?.additional_data as Record<string, any>) || {}
    const selectedServices = (registration?.selected_services as Record<string, any>) || {}
    const requirements = Array.isArray(selectedServices.requirements) ? selectedServices.requirements : []
    const invitation = ad.invitation || {}
    const embassy = (registration?.embassy_application as Record<string, any>) || {}
    const event = registration?.events

    async function handleUpload(docType: string, label: string, file: File) {
        setUploading(docType)
        try {
            const { error } = await uploadRegistrationDocumentDirect(registration.id, file, docType, label)
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
    const fullName = client.full_name_as_passport || registration?.full_name
    const requiredFields = [
        fullName,
        client.email || registration?.email,
        getClientField('phone'),
        getClientField('nationality'),
        getClientField('date_of_birth'),
        getClientField('passport_number'),
        getClientField('passport_expiry_date'),
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
    const insuranceCoversEvent = !hasVisaService || inRange(event?.date, embassy.insurance_coverage_start, embassy.insurance_coverage_end)
    const passportExpiryDate = getClientField('passport_expiry_date')
    const passportValidForEvent = !passportExpiryDate || !event?.date || new Date(passportExpiryDate).getTime() > new Date(event.date).getTime()

    const zeroErrorRows = [
        { ok: !!fullName, label: 'اسم العميل كما في الجواز', value: fullName },
        { ok: !!getClientField('passport_number'), label: 'رقم الجواز', value: getClientField('passport_number') },
        { ok: !!getClientField('date_of_birth'), label: 'تاريخ الميلاد', value: formatDate(getClientField('date_of_birth')) },
        { ok: !!getClientField('nationality'), label: 'الجنسية', value: getClientField('nationality') },
        { ok: passportValidForEvent, label: 'صلاحية الجواز بعد تاريخ الفعالية', value: formatDate(passportExpiryDate), warn: !passportValidForEvent },
        { ok: insuranceCoversEvent, label: 'تطابق تاريخ التأمين مع الفعالية', value: event?.date ? formatDate(event.date) : '—', warn: !insuranceCoversEvent },
    ]
    const criticalIssues = zeroErrorRows.filter((row) => !row.ok).length

    return (
        <div className="space-y-4">
            {/* ====== Completion summary ====================================== */}
            <Section title="Completion" desc={`${completion}% complete`} icon={CheckCircle2}>
                <div className="space-y-4">
                    <div className="flex items-baseline justify-between gap-4">
                        <span className="jaz-numeric text-[var(--jaz-ink)]">{completion}<span className="jaz-mono text-[var(--jaz-muted)] text-base">%</span></span>
                        <span className="text-[12px] text-[var(--jaz-muted)]">
                            {completedFields + (requiredDocs.length ? completedDocs : 1)} of {completionTotal} items
                        </span>
                    </div>
                    <div
                        className="h-1.5 rounded-full bg-[var(--jaz-surface-2)] overflow-hidden"
                        role="progressbar"
                        aria-valuenow={completion}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Case completion"
                    >
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-500 ease-out',
                                completion >= 90 ? 'bg-[var(--jaz-emerald)]' :
                                completion >= 60 ? 'bg-[var(--jaz-amber)]' :
                                'bg-[var(--jaz-sovereign)]',
                            )}
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                    <dl className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Stat label="Fields" value={`${completedFields}/${requiredFields.length}`} />
                        <Stat label="Required docs" value={`${completedDocs}/${requiredDocs.length || 0}`} />
                        <Stat
                            label="Critical issues"
                            value={criticalIssues.toString()}
                            tone={criticalIssues ? 'warn' : 'success'}
                        />
                    </dl>
                </div>
            </Section>

            {/* ====== Required docs =========================================== */}
            <Section
                title="Required documents"
                desc={`Single source of truth per service package: ${selectedServices.service_package || 'unset'}`}
                icon={FileText}
            >
                {requirements.length > 0 ? (
                    <ul className="divide-y divide-[var(--jaz-line)]">
                        {requirements.map((req: any) => {
                            const hasDoc = documents.some((d: any) => d.type === req.key)
                            const ok = hasDoc || !req.required
                            return (
                                <ChecklistRow
                                    key={req.key}
                                    ok={ok}
                                    label={req.label}
                                    value={hasDoc ? 'Uploaded' : req.required ? 'Required' : 'Optional'}
                                    warn={req.required && !hasDoc}
                                />
                            )
                        })}
                    </ul>
                ) : (
                    <div className="text-[13px] text-[var(--jaz-muted)] text-center py-8 border border-dashed border-[var(--jaz-line)] rounded-md">
                        Choose a service package from the Service & Payment tab to generate requirements.
                    </div>
                )}
            </Section>

            {/* ====== Document upload grid ==================================== */}
            <Section
                title="Upload documents"
                desc="PDF or images — 10 MB max per file."
                icon={Upload}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {DOC_TYPES.map((dt) => {
                        const isUploading = uploading === dt.value
                        return (
                            <div
                                key={dt.value}
                                className="group relative rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] hover:border-[var(--jaz-sovereign)]/30 hover:bg-[var(--jaz-surface-2)]/40 transition-colors duration-150"
                            >
                                <input
                                    ref={(el) => { fileRefs.current[dt.value] = el }}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0]
                                        if (f) handleUpload(dt.value, dt.label, f)
                                        e.target.value = ''
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileRefs.current[dt.value]?.click()}
                                    disabled={isUploading}
                                    className="w-full flex flex-col items-center gap-2 px-3 py-4 text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)] disabled:opacity-50 transition-colors duration-150"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] group-hover:border-[var(--jaz-sovereign)]/30 transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="size-4 animate-spin text-[var(--jaz-sovereign)]" />
                                        ) : (
                                            <Upload className="size-4" />
                                        )}
                                    </div>
                                    <span className="text-[11px] font-medium leading-tight text-center">
                                        {dt.label}
                                    </span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </Section>

            {/* ====== Uploaded documents list ================================ */}
            <Section title="Uploaded documents" desc={`${documents.length} file${documents.length === 1 ? '' : 's'}`} icon={FileText}>
                {documents.length === 0 ? (
                    <div className="text-center py-10 text-[13px] text-[var(--jaz-muted)] border border-dashed border-[var(--jaz-line)] rounded-md">
                        لا توجد وثائق مرفوعة بعد — اختر نوعاً من الشبكة في الأعلى.
                    </div>
                ) : (
                    <div className="-mx-5 overflow-x-auto">
                        <table className="w-full text-[13px] min-w-[640px]">
                            <thead className="bg-[var(--jaz-surface-2)]/60 border-y border-[var(--jaz-line)]">
                                <tr className="text-right">
                                    <th className="py-2.5 px-5 font-semibold text-[11px] uppercase tracking-[0.06em] text-[var(--jaz-muted)]">Document</th>
                                    <th className="py-2.5 px-5 font-semibold text-[11px] uppercase tracking-[0.06em] text-[var(--jaz-muted)]">Uploaded</th>
                                    <th className="py-2.5 px-5 font-semibold text-[11px] uppercase tracking-[0.06em] text-[var(--jaz-muted)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--jaz-line)]">
                                {documents.map((d: any, i: number) => {
                                    const label = d.type ? (DOC_TYPES.find((t) => t.value === d.type)?.label || d.type) : (d.name || 'وثيقة')
                                    return (
                                        <tr key={i} className="hover:bg-[var(--jaz-surface-2)]/40 transition-colors duration-150">
                                            <td className="py-2.5 px-5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="size-3.5 text-[var(--jaz-whisper)] shrink-0" />
                                                    <span className="font-medium text-[var(--jaz-ink)] truncate">{label}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-5 text-[12px] text-[var(--jaz-muted)] whitespace-nowrap">
                                                {formatDate(d.uploadedAt)}
                                            </td>
                                            <td className="py-2.5 px-5">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <a
                                                        href={d.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label="Open document"
                                                        className="p-1.5 rounded-md hover:bg-[var(--jaz-surface-2)] text-[var(--jaz-muted)] hover:text-[var(--jaz-ink)] transition-colors"
                                                    >
                                                        <ExternalLink className="size-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(d.path, label)}
                                                        disabled={deleting === d.path}
                                                        aria-label="Delete document"
                                                        className="p-1.5 rounded-md hover:bg-[var(--jaz-sovereign)]/8 text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)] disabled:opacity-50 transition-colors"
                                                    >
                                                        {deleting === d.path ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>

            {/* ====== Zero-error audit ======================================== */}
            <Section title="Audit (Zero-Error Data)" desc="Passport ↔ invitation ↔ badge names must match 100%." icon={CheckCircle2}>
                <ul className="divide-y divide-[var(--jaz-line)]">
                    <ChecklistRow ok={!!fullName} label="اسم العميل كما في الجواز" value={fullName || '—'} />
                    <ChecklistRow ok={hasPassportDoc} label="نسخة الجواز مرفوعة" value={hasPassportDoc ? 'مرفوعة' : 'غير مرفوعة'} warn={!hasPassportDoc} />
                    {zeroErrorRows.map((row) => (
                        <ChecklistRow
                            key={row.label}
                            ok={row.ok}
                            label={row.label}
                            value={row.value}
                            warn={row.warn}
                        />
                    ))}
                </ul>
                <div className="mt-4">
                    <InlineAlert variant="warn">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                        <span>مطابقة الاسم بين الجواز والدعوة والـBadge يجب أن تكون 100%.</span>
                    </InlineAlert>
                </div>
            </Section>
        </div>
    )
}

function ChecklistRow({ ok, label, value, warn }: { ok: boolean; label: string; value: string | null | undefined; warn?: boolean }) {
    return (
        <li className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
                {ok ? (
                    <CheckCircle2 className="size-4 text-[var(--jaz-emerald)] shrink-0" aria-hidden />
                ) : warn ? (
                    <AlertTriangle className="size-4 text-[var(--jaz-amber)] shrink-0" aria-hidden />
                ) : (
                    <XCircle className="size-4 text-[var(--jaz-sovereign)] shrink-0" aria-hidden />
                )}
                <span className="text-[13px] text-[var(--jaz-ink)]">{label}</span>
            </div>
            <span className="text-[12px] text-[var(--jaz-muted)] font-medium whitespace-nowrap">{value || '—'}</span>
        </li>
    )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warn' }) {
    return (
        <div className={cn(
            'rounded-md p-3 border',
            tone === 'warn'
                ? 'bg-[var(--jaz-amber-soft)] border-[var(--jaz-amber)]/20'
                : tone === 'success'
                    ? 'bg-[var(--jaz-emerald-soft)] border-[var(--jaz-emerald)]/20'
                    : 'bg-[var(--jaz-surface-2)]/50 border-[var(--jaz-line)]',
        )}>
            <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--jaz-muted)]">{label}</dt>
            <dd className={cn(
                'jaz-mono text-[15px] font-semibold leading-none mt-1.5',
                tone === 'warn' ? 'text-[var(--jaz-amber)]' :
                tone === 'success' ? 'text-[var(--jaz-emerald)]' :
                'text-[var(--jaz-ink)]',
            )}>
                {value}
            </dd>
        </div>
    )
}
