'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, User, BookUser, Phone, Briefcase, Plane, Plus, X } from 'lucide-react'
import { updateClientData } from '../../actions'
import {
    Section,
    FieldLabel,
    FormGrid,
    FormField,
    SaveFooter,
    InlineAlert,
    inputClass,
    selectClass,
} from './shared'

const SCHENGEN_COUNTRIES = [
    { code: 'AT', name: 'Austria (AT) — النمسا' },
    { code: 'BE', name: 'Belgium (BE) — بلجيكا' },
    { code: 'CH', name: 'Switzerland (CH) — سويسرا' },
    { code: 'CZ', name: 'Czech Republic (CZ) — التشيك' },
    { code: 'DE', name: 'Germany (DE) — ألمانيا' },
    { code: 'DK', name: 'Denmark (DK) — الدنمارك' },
    { code: 'EE', name: 'Estonia (EE) — إستونيا' },
    { code: 'ES', name: 'Spain (ES) — إسبانيا' },
    { code: 'FI', name: 'Finland (FI) — فنلندا' },
    { code: 'FR', name: 'France (FR) — فرنسا' },
    { code: 'GR', name: 'Greece (GR) — اليون' },
    { code: 'HR', name: 'Croatia (HR) — كرواتيا' },
    { code: 'HU', name: 'Hungary (HU) — المجر' },
    { code: 'IS', name: 'Iceland (IS) — آيسلندا' },
    { code: 'IT', name: 'Italy (IT) — إيطاليا' },
    { code: 'LI', name: 'Liechtenstein (LI) — ليختنشتاين' },
    { code: 'LT', name: 'Lithuania (LT) — ليتوانيا' },
    { code: 'LU', name: 'Luxembourg (LU) — لوكسمبورغ' },
    { code: 'LV', name: 'Latvia (LV) — لاتفيا' },
    { code: 'MT', name: 'Malta (MT) — مالطا' },
    { code: 'NL', name: 'Netherlands (NL) — هولندا' },
    { code: 'NO', name: 'Norway (NO) — النرويج' },
    { code: 'PL', name: 'Poland (PL) — بولندا' },
    { code: 'PT', name: 'Portugal (PT) — البرتغال' },
    { code: 'SE', name: 'Sweden (SE) — السويد' },
    { code: 'SI', name: 'Slovenia (SI) — سلوفينيا' },
    { code: 'SK', name: 'Slovakia (SK) — سلوفاكيا' },
]

interface TabClientProps {
    registration: any
}

export function TabClient({ registration }: TabClientProps) {
    const client = (registration?.clients as Record<string, any>) || {}
    const formData = (registration?.form_data as Record<string, any>) || {}
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        full_name: client.full_name_as_passport || registration?.full_name || '',
        email: client.email || registration?.email || '',
        phone: client.phone || formData.phone || '',
        whatsapp: client.whatsapp_number || formData.whatsapp || '',
        nationality: client.nationality || formData.nationality || '',
        place_of_birth: client.place_of_birth || formData.place_of_birth || '',
        marital_status: client.marital_status || formData.marital_status || '',
        passport_number: client.passport_number || formData.passport_number || '',
        passport_type: client.passport_type || formData.passport_type || '',
        passport_issue_date: client.passport_issue_date || formData.passport_issue_date || '',
        passport_place_of_issue: client.passport_place_of_issue || formData.passport_place_of_issue || '',
        passport_expiry_date: client.passport_expiry_date || formData.passport_expiry_date || '',
        date_of_birth: client.date_of_birth || formData.date_of_birth || '',
        sex: client.sex || formData.sex || '',
        residence_country: client.residence_country || formData.residence_country || '',
        city: client.city || formData.city || '',
        full_address: client.full_address || formData.full_address || '',
        job_title: client.job_title || formData.job_title || formData.position || '',
        employer_name: client.employer_name || formData.employer_name || formData.company || '',
        workplace_type: client.workplace_type || formData.workplace_type || '',
        work_address: client.work_address || formData.work_address || '',
        work_city: client.work_city || formData.work_city || '',
        work_governorate: client.work_governorate || formData.work_governorate || '',
        department: client.department || formData.department || '',
        professional_specialty: client.professional_specialty || formData.professional_specialty || '',
        company_website: client.company_website || formData.company_website || '',
        work_phone: client.work_phone || formData.work_phone || '',
        work_email: client.work_email || formData.work_email || '',
        previous_schengen_visa: client.previous_schengen_visa || false,
        previous_visas_list: (() => {
            const raw = client.schengen_visas_last_5y
            if (!raw) return []
            if (Array.isArray(raw)) return raw
            try {
                const parsed = JSON.parse(raw as string)
                return Array.isArray(parsed) ? parsed : []
            } catch { return [] }
        })(),
        has_other_residence: (() => {
            const raw = client.other_residence_permit
            if (!raw) return false
            if (typeof raw === 'object') return (raw as any).has_permit || false
            try {
                const parsed = JSON.parse(raw as string)
                return parsed?.has_permit || false
            } catch { return false }
        })(),
        other_residence_country: (() => {
            const raw = client.other_residence_permit
            if (!raw) return ''
            if (typeof raw === 'object') return (raw as any).country || ''
            try {
                const parsed = JSON.parse(raw as string)
                return parsed?.country || ''
            } catch { return '' }
        })(),
        other_residence_number: (() => {
            const raw = client.other_residence_permit
            if (!raw) return ''
            if (typeof raw === 'object') return (raw as any).number || ''
            try {
                const parsed = JSON.parse(raw as string)
                return parsed?.number || ''
            } catch { return '' }
        })(),
        other_residence_expiry: (() => {
            const raw = client.other_residence_permit
            if (!raw) return ''
            if (typeof raw === 'object') return (raw as any).expiry_date || ''
            try {
                const parsed = JSON.parse(raw as string)
                return parsed?.expiry_date || ''
            } catch { return '' }
        })(),
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const permitJson = {
                has_permit: form.has_other_residence,
                country: form.has_other_residence ? form.other_residence_country : '',
                number: form.has_other_residence ? form.other_residence_number : '',
                expiry_date: form.has_other_residence ? form.other_residence_expiry : '',
            }
            const { error } = await updateClientData(registration.id, {
                ...form,
                schengen_visas_last_5y: form.previous_visas_list,
                other_residence_permit: permitJson,
            })
            if (error) toast.error(error)
            else toast.success('تم حفظ بيانات العميل')
        } catch {
            toast.error('فشل الحفظ')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <InlineAlert variant="warn">
                <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                <span>
                    يجب أن تكون البيانات <strong>كما في الجواز (AS PER PASSPORT)</strong>.
                </span>
            </InlineAlert>

            <Section title="Basic information" icon={User}>
                <FormGrid>
                    <FormField label="Full name (as per passport)" required span={2}>
                        <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Nationality">
                        <input value={form.nationality} onChange={(e) => set('nationality', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Date of birth">
                        <input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Place of birth">
                        <input value={form.place_of_birth} onChange={(e) => set('place_of_birth', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Gender">
                        <select value={form.sex} onChange={(e) => set('sex', e.target.value)} className={selectClass}>
                            <option value=""> </option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </FormField>
                    <FormField label="Marital status">
                        <select value={form.marital_status} onChange={(e) => set('marital_status', e.target.value)} className={selectClass}>
                            <option value="">—</option>
                            <option value="single">أعزب/عزباء</option>
                            <option value="married">متزوج/ة</option>
                            <option value="divorced">مطلق/ة</option>
                            <option value="widowed">أرمل/ة</option>
                        </select>
                    </FormField>
                    <FormField label="Country of residence">
                        <input value={form.residence_country} onChange={(e) => set('residence_country', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="City">
                        <input value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Full address" span={2}>
                        <input value={form.full_address} onChange={(e) => set('full_address', e.target.value)} className={inputClass} />
                    </FormField>
                </FormGrid>
            </Section>

            <Section title="Passport" icon={BookUser}>
                <FormGrid>
                    <FormField label="Passport number">
                        <input value={form.passport_number} onChange={(e) => set('passport_number', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Type">
                        <input value={form.passport_type} onChange={(e) => set('passport_type', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Issue date">
                        <input type="date" value={form.passport_issue_date} onChange={(e) => set('passport_issue_date', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Expiry date">
                        <input type="date" value={form.passport_expiry_date} onChange={(e) => set('passport_expiry_date', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Place of issue" span={2}>
                        <input value={form.passport_place_of_issue} onChange={(e) => set('passport_place_of_issue', e.target.value)} className={inputClass} />
                    </FormField>
                </FormGrid>
            </Section>

            <Section title="Contact details" icon={Phone}>
                <FormGrid>
                    <FormField label="Phone">
                        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="WhatsApp">
                        <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Email">
                        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                </FormGrid>
            </Section>

            <Section title="Professional details" icon={Briefcase}>
                <FormGrid columns={2}>
                    <FormField label="Employer">
                        <input value={form.employer_name} onChange={(e) => set('employer_name', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Workplace type">
                        <input value={form.workplace_type} onChange={(e) => set('workplace_type', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Job title">
                        <input value={form.job_title} onChange={(e) => set('job_title', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Department">
                        <input value={form.department} onChange={(e) => set('department', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Specialty">
                        <input value={form.professional_specialty} onChange={(e) => set('professional_specialty', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Work city">
                        <input value={form.work_city} onChange={(e) => set('work_city', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Work governorate">
                        <input value={form.work_governorate} onChange={(e) => set('work_governorate', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Work phone">
                        <input value={form.work_phone} onChange={(e) => set('work_phone', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Work email">
                        <input type="email" value={form.work_email} onChange={(e) => set('work_email', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Company website">
                        <input value={form.company_website} onChange={(e) => set('company_website', e.target.value)} dir="ltr" className={inputClass} />
                    </FormField>
                    <FormField label="Work address" span={2}>
                        <input value={form.work_address} onChange={(e) => set('work_address', e.target.value)} className={inputClass} />
                    </FormField>
                </FormGrid>
            </Section>

            <Section
                title="Visa and residence"
                desc="Schengen history (last 5 years) and other residence permits."
                icon={Plane}
            >
                <FormGrid>
                    <FormField label="Previous Schengen visa?">
                        <select
                            value={form.previous_schengen_visa ? 'true' : 'false'}
                            onChange={(e) => set('previous_schengen_visa', e.target.value === 'true')}
                            className={selectClass}
                        >
                            <option value="false">لا</option>
                            <option value="true">نعم</option>
                        </select>
                    </FormField>
                    <FormField label="Other residence permit?">
                        <select
                            value={form.has_other_residence ? 'true' : 'false'}
                            onChange={(e) => set('has_other_residence', e.target.value === 'true')}
                            className={selectClass}
                        >
                            <option value="false">لا</option>
                            <option value="true">نعم</option>
                        </select>
                    </FormField>

                    {form.has_other_residence && (
                        <>
                            <FormField label="Other residence country">
                                <input
                                    value={form.other_residence_country}
                                    onChange={(e) => set('other_residence_country', e.target.value)}
                                    placeholder="e.g. United Arab Emirates"
                                    className={inputClass}
                                />
                            </FormField>
                            <FormField label="Permit number">
                                <input
                                    value={form.other_residence_number}
                                    onChange={(e) => set('other_residence_number', e.target.value)}
                                    placeholder="e.g. 784-1990-1234567-1"
                                    dir="ltr"
                                    className={inputClass}
                                />
                            </FormField>
                            <FormField label="Expiry date" span={2}>
                                <input
                                    type="date"
                                    value={form.other_residence_expiry}
                                    onChange={(e) => set('other_residence_expiry', e.target.value)}
                                    className={inputClass}
                                />
                            </FormField>
                        </>
                    )}
                </FormGrid>

                {form.previous_schengen_visa && (
                    <div className="mt-6 pt-5 border-t border-[var(--jaz-line)] space-y-3">
                        <div className="flex items-center justify-between">
                            <FieldLabel>Previous Schengen visas (last 5 years)</FieldLabel>
                            <button
                                type="button"
                                onClick={() => {
                                    const newList = [...form.previous_visas_list, { country: '', visa_number: '', issue_date: '', expiry_date: '' }]
                                    set('previous_visas_list', newList)
                                }}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--jaz-line)] text-[12px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150"
                            >
                                <Plus className="size-3" />
                                Add visa
                            </button>
                        </div>

                        {form.previous_visas_list.length === 0 ? (
                            <div className="text-center py-6 text-[12px] text-[var(--jaz-muted)] border border-dashed border-[var(--jaz-line)] rounded-md">
                                لا توجد تأشيرات. اضغط "Add visa" في الأعلى.
                            </div>
                        ) : (
                            <ul className="space-y-2.5">
                                {form.previous_visas_list.map((v: any, index: number) => (
                                    <li
                                        key={index}
                                        className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-md bg-[var(--jaz-surface-2)]/60 border border-[var(--jaz-line)]"
                                    >
                                        <div>
                                            <label className="block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--jaz-whisper)] mb-1.5">Country</label>
                                            <select
                                                value={v.country}
                                                onChange={(e) => {
                                                    const newList = [...form.previous_visas_list]
                                                    newList[index].country = e.target.value
                                                    set('previous_visas_list', newList)
                                                }}
                                                className={selectClass}
                                            >
                                                <option value="">Select country…</option>
                                                {SCHENGEN_COUNTRIES.map((c) => (
                                                    <option key={c.code} value={c.code}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--jaz-whisper)] mb-1.5">Visa number</label>
                                            <input
                                                value={v.visa_number}
                                                onChange={(e) => {
                                                    const newList = [...form.previous_visas_list]
                                                    newList[index].visa_number = e.target.value
                                                    set('previous_visas_list', newList)
                                                }}
                                                placeholder="e.g. 1234567"
                                                dir="ltr"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--jaz-whisper)] mb-1.5">Issue date</label>
                                            <input
                                                type="date"
                                                value={v.issue_date}
                                                onChange={(e) => {
                                                    const newList = [...form.previous_visas_list]
                                                    newList[index].issue_date = e.target.value
                                                    set('previous_visas_list', newList)
                                                }}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--jaz-whisper)] mb-1.5">Expiry date</label>
                                            <input
                                                type="date"
                                                value={v.expiry_date}
                                                onChange={(e) => {
                                                    const newList = [...form.previous_visas_list]
                                                    newList[index].expiry_date = e.target.value
                                                    set('previous_visas_list', newList)
                                                }}
                                                className={inputClass}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = form.previous_visas_list.filter((_: any, idx: number) => idx !== index)
                                                    set('previous_visas_list', newList)
                                                }}
                                                aria-label="Remove visa"
                                                className="absolute left-0 top-7 size-7 rounded-md bg-transparent hover:bg-[var(--jaz-sovereign)]/8 text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)] flex items-center justify-center transition-colors duration-150"
                                                title="حذف"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <SaveFooter saving={saving} onSave={handleSave} label="Save client record" />
            </Section>
        </div>
    )
}
