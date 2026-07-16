'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { FileCheck2, IdCard } from 'lucide-react'
import { saveRegistrationJsonb } from '../../actions'
import {
    Section,
    FormGrid,
    FormField,
    SaveFooter,
    FileUploadField,
    inputClass,
    selectClass,
} from './shared'

const REG_STATUS_OPTIONS = [
    { value: 'not_started', label: 'لم يبدأ' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'draft', label: 'مسودة' },
    { value: 'submitted', label: 'تم الإرسال' },
    { value: 'confirmed', label: 'مؤكد' },
]

export function TabRegistration({ registration }: { registration: any }) {
    const ad = (registration?.additional_data as Record<string, any>) || {}
    const meta = ad.registration_meta || {}
    const [saving, setSaving] = useState(false)

    const isStandardCategory = ['visitor', 'exhibitor', 'press'].includes(meta.visitor_category || '')
    const initialCategory = isStandardCategory ? meta.visitor_category : (meta.visitor_category ? 'other' : '')
    const initialCustomCategory = isStandardCategory ? '' : (meta.visitor_category || '')

    const [form, setForm] = useState({
        website: meta.website ?? '',
        account_email: meta.account_email ?? '',
        visitor_category: initialCategory,
        custom_visitor_category: initialCustomCategory,
        company_used: meta.company_used ?? '',
        job_used: meta.job_used ?? '',
        status: meta.status ?? 'not_started',
        submission_date: meta.submission_date ?? '',
        confirmation_number: meta.confirmation_number ?? '',
        confirmation_email: meta.confirmation_email ?? '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const visitorCat = form.visitor_category === 'other' ? form.custom_visitor_category : form.visitor_category
            const saveMeta = {
                website: form.website,
                account_email: form.account_email,
                visitor_category: visitorCat,
                company_used: form.company_used,
                job_used: form.job_used,
                status: form.status,
                submission_date: form.submission_date,
                confirmation_number: form.confirmation_number,
                confirmation_email: form.confirmation_email,
            }
            const { error } = await saveRegistrationJsonb(
                registration.id,
                'additional_data',
                { registration_meta: saveMeta },
                'registration_updated',
                'تم تحديث بيانات التسجيل',
            )
            if (error) toast.error(error)
            else toast.success('تم حفظ بيانات التسجيل')
        } catch {
            toast.error('فشل الحفظ')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <Section title="Event registration" icon={FileCheck2}>
                <FormGrid>
                    <FormField label="Registration website" span={2}>
                        <input value={form.website} onChange={(e) => set('website', e.target.value)} dir="ltr" className={inputClass} placeholder="https://…" />
                    </FormField>
                    <FormField label="Account email">
                        <input type="email" value={form.account_email} onChange={(e) => set('account_email', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Registration status">
                        <select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectClass}>
                            {REG_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Visitor category">
                        <select value={form.visitor_category} onChange={(e) => set('visitor_category', e.target.value)} className={selectClass}>
                            <option value="">—</option>
                            <option value="visitor">زائر (Visitor)</option>
                            <option value="exhibitor">عارض (Exhibitor)</option>
                            <option value="press">إعلام (Media)</option>
                            <option value="other">آخر (Other)</option>
                        </select>
                    </FormField>
                    {form.visitor_category === 'other' && (
                        <FormField label="Custom category" span={2}>
                            <input value={form.custom_visitor_category} onChange={(e) => set('custom_visitor_category', e.target.value)} placeholder="e.g. VIP, Speaker…" className={inputClass} />
                        </FormField>
                    )}
                    <FormField label="Company used">
                        <input value={form.company_used} onChange={(e) => set('company_used', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Job title used">
                        <input value={form.job_used} onChange={(e) => set('job_used', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Confirmation number">
                        <input value={form.confirmation_number} onChange={(e) => set('confirmation_number', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Submission date">
                        <input type="date" value={form.submission_date} onChange={(e) => set('submission_date', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Confirmation email" span={2}>
                        <input type="email" value={form.confirmation_email} onChange={(e) => set('confirmation_email', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                </FormGrid>
            </Section>

            <Section title="Visitor badge" icon={IdCard}>
                <FormGrid columns={2}>
                    <FileUploadField caseId={registration.id} documents={registration.documents} docType="badge_pdf" label="Upload badge PDF" />
                    <FileUploadField caseId={registration.id} documents={registration.documents} docType="registration_screenshot" label="Upload registration screenshot" />
                </FormGrid>
                <SaveFooter saving={saving} onSave={handleSave} label="Save registration" />
            </Section>
        </div>
    )
}
