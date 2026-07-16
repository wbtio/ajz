'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plane, UserCog, FileText, Calendar, Shield, Info } from 'lucide-react'
import { saveRegistrationJsonb } from '../../actions'
import {
    Section,
    FieldLabel,
    FormGrid,
    FormField,
    SaveFooter,
    InlineAlert,
    FileUploadField,
    inputClass,
    selectClass,
} from './shared'

const ACCT_STATUS = [
    { value: 'not_created', label: 'لم يُنشأ' },
    { value: 'pending_activation', label: 'بانتظار التفعيل' },
    { value: 'activated', label: 'مُفعّل' },
    { value: 'access_problem', label: 'مشكلة وصول' },
]
const APP_STATUS = [
    { value: 'not_started', label: 'لم يبدأ' },
    { value: 'draft', label: 'مسودة' },
    { value: 'under_review', label: 'تحت المراجعة' },
    { value: 'reference_obtained', label: 'تم الحصول على الرقم المرجعي' },
    { value: 'pending_appointment', label: 'بانتظار الموعد' },
    { value: 'finalized', label: 'منتهي' },
]

export function TabVisa({ registration }: { registration: any }) {
    const embassy = (registration?.embassy_application as Record<string, any>) || {}
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        destination_country: embassy.destination_country ?? 'France',
        france_visas_account_status: embassy.france_visas_account_status ?? 'not_created',
        tls_account_status: embassy.tls_account_status ?? 'not_created',
        account_setup_complete: embassy.account_setup_complete ?? false,
        france_visas_number: embassy.france_visas_number ?? '',
        application_start_date: embassy.application_start_date ?? '',
        application_status: embassy.application_status ?? 'not_started',
        tls_appointment_date: embassy.tls_appointment_date ? String(embassy.tls_appointment_date).slice(0, 16) : '',
        tls_center: embassy.tls_center ?? '',
        appointment_reference: embassy.appointment_reference ?? '',
        appointment_booked: embassy.appointment_booked ?? false,
        visa_approved: embassy.visa_approved ?? false,
        visa_decision_date: embassy.visa_decision_date ?? '',
        insurance_company: embassy.insurance_company ?? '',
        insurance_policy_number: embassy.insurance_policy_number ?? '',
        insurance_coverage_start: embassy.insurance_coverage_start ?? '',
        insurance_coverage_end: embassy.insurance_coverage_end ?? '',
        insurance_amount: embassy.insurance_amount ?? 0,
        notes: embassy.notes ?? registration?.notes ?? '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const payload: Record<string, unknown> = { ...form }
            if (form.tls_appointment_date) payload.tls_appointment_date = new Date(form.tls_appointment_date).toISOString()
            const { error } = await saveRegistrationJsonb(
                registration.id, 'embassy_application', payload,
                'visa_updated', 'تم تحديث بيانات الفيزا',
            )
            if (error) toast.error(error)
            else toast.success('تم حفظ بيانات الفيزا')
        } catch { toast.error('فشل الحفظ') } finally { setSaving(false) }
    }

    return (
        <div className="space-y-4">
            <Section title="Client accounts" desc="France-Visas + TLS portal account states." icon={UserCog}>
                <FormGrid>
                    <FormField label="Destination country">
                        <input value={form.destination_country} onChange={(e) => set('destination_country', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="France-Visas account">
                        <select value={form.france_visas_account_status} onChange={(e) => set('france_visas_account_status', e.target.value)} className={selectClass}>
                            {ACCT_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="TLS account">
                        <select value={form.tls_account_status} onChange={(e) => set('tls_account_status', e.target.value)} className={selectClass}>
                            {ACCT_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                </FormGrid>
                <label className="mt-4 flex items-center gap-2.5 text-[13px] text-[var(--jaz-ink)] cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={form.account_setup_complete}
                        onChange={(e) => set('account_setup_complete', e.target.checked)}
                        className="size-4 rounded border-[var(--jaz-line-strong)] text-[var(--jaz-sovereign)] focus:ring-[var(--jaz-sovereign)]/30 focus:ring-offset-0 cursor-pointer accent-[var(--jaz-sovereign)]"
                    />
                    Account setup completed
                </label>
            </Section>

            <Section title="France-Visas application" icon={FileText}>
                <div className="space-y-4"> 
                    <InlineAlert variant="info">
                        <Info className="size-3.5 shrink-0 mt-0.5" />
                        <span>قاعدة JAZ: أبقِ الطلب كـ <strong>مسودة</strong> حتى يكتمل المسار.</span>
                    </InlineAlert>
                    <FormGrid>
                        <FormField label="Application reference">
                            <input
                                value={form.france_visas_number}
                                onChange={(e) => set('france_visas_number', e.target.value)}
                                dir="ltr"
                                className={inputClass}
                                placeholder="FRA1BG2026XXXXXXX"
                            />
                        </FormField>
                        <FormField label="Application start date">
                            <input
                                type="date"
                                value={form.application_start_date}
                                onChange={(e) => set('application_start_date', e.target.value)}
                                className={inputClass}
                            />
                        </FormField>
                        <FormField label="Status" span={2}>
                            <select value={form.application_status} onChange={(e) => set('application_status', e.target.value)} className={selectClass}>
                                {APP_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>
                    </FormGrid>
                </div>
            </Section>

            <Section title="TLS appointment" icon={Calendar}>
                <FormGrid>
                    <FormField label="Appointment date & time">
                        <input
                            type="datetime-local"
                            value={form.tls_appointment_date}
                            onChange={(e) => set('tls_appointment_date', e.target.value)}
                            className={inputClass}
                        />
                    </FormField>
                    <FormField label="TLS center">
                        <input value={form.tls_center} onChange={(e) => set('tls_center', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Appointment reference" span={2}>
                        <input value={form.appointment_reference} onChange={(e) => set('appointment_reference', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Confirmation PDF" span={2}>
                        <FileUploadField caseId={registration.id} documents={registration.documents} docType="tls_appointment" label="Upload confirmation PDF" />
                    </FormField>
                </FormGrid>
                <label className="mt-4 flex items-center gap-2.5 text-[13px] text-[var(--jaz-ink)] cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={form.appointment_booked}
                        onChange={(e) => set('appointment_booked', e.target.checked)}
                        className="size-4 rounded border-[var(--jaz-line-strong)] text-[var(--jaz-sovereign)] focus:ring-[var(--jaz-sovereign)]/30 focus:ring-offset-0 cursor-pointer accent-[var(--jaz-sovereign)]"
                    />
                    Appointment booked
                </label>
            </Section>

            <Section title="Health insurance" icon={Shield}>
                <FormGrid>
                    <FormField label="Insurance company">
                        <input value={form.insurance_company} onChange={(e) => set('insurance_company', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Policy number">
                        <input value={form.insurance_policy_number} onChange={(e) => set('insurance_policy_number', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Coverage start">
                        <input type="date" value={form.insurance_coverage_start} onChange={(e) => set('insurance_coverage_start', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Coverage end">
                        <input type="date" value={form.insurance_coverage_end} onChange={(e) => set('insurance_coverage_end', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Coverage amount">
                        <input type="number" value={form.insurance_amount} onChange={(e) => set('insurance_amount', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Insurance PDF" span={2}>
                        <FileUploadField caseId={registration.id} documents={registration.documents} docType="insurance" label="Upload insurance PDF" />
                    </FormField>
                </FormGrid>
            </Section>

            <Section title="Visa decision & notes" icon={Plane}>
                <label className="flex items-center gap-2.5 text-[13px] text-[var(--jaz-ink)] cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={form.visa_approved}
                        onChange={(e) => set('visa_approved', e.target.checked)}
                        className="size-4 rounded border-[var(--jaz-line-strong)] text-[var(--jaz-sovereign)] focus:ring-[var(--jaz-sovereign)]/30 focus:ring-offset-0 cursor-pointer accent-[var(--jaz-sovereign)]"
                    />
                    Visa approved
                </label>
                <FormGrid className="mt-4">
                    <FormField label="Decision date">
                        <input type="date" value={form.visa_decision_date} onChange={(e) => set('visa_decision_date', e.target.value)} className={inputClass} />
                    </FormField>
                </FormGrid>
                <div className="mt-4">
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                        value={form.notes}
                        onChange={(e) => set('notes', e.target.value)}
                        rows={3}
                        className="min-h-[88px] py-2.5 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[13px] text-[var(--jaz-ink)] placeholder:text-[var(--jaz-whisper)] focus:outline-none focus:border-[var(--jaz-sovereign)]/50 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 transition-colors duration-150 w-full resize-y"
                    />
                </div>
                <SaveFooter saving={saving} onSave={handleSave} label="Save visa record" />
            </Section>
        </div>
    )
}
