'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileCheck2, IdCard, AlertTriangle } from 'lucide-react'
import { saveRegistrationJsonb } from '../../actions'
import { SectionHeader, SaveButton, FieldLabel, FileUploadField, inputClass, selectClass } from './shared'

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
    const [form, setForm] = useState({
        website: meta.website ?? '',
        account_email: meta.account_email ?? '',
        registration_date: meta.registration_date ?? '',
        reference: meta.reference ?? '',
        reg_type: meta.reg_type ?? '',
        visitor_category: meta.visitor_category ?? '',
        company_used: meta.company_used ?? '',
        job_used: meta.job_used ?? '',
        status: meta.status ?? 'not_started',
        submission_date: meta.submission_date ?? '',
        confirmation_number: meta.confirmation_number ?? '',
        confirmation_email: meta.confirmation_email ?? '',
        badge_name: meta.badge_name ?? '',
        badge_number: meta.badge_number ?? '',
        notes: meta.notes ?? '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const { error } = await saveRegistrationJsonb(
                registration.id,
                'additional_data',
                { registration_meta: form },
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

    const fullName = registration?.full_name?.trim().toLowerCase()
    const badgeName = form.badge_name?.trim().toLowerCase()
    const nameMismatch = fullName && badgeName && fullName !== badgeName

    return (
        <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={FileCheck2} title="تفاصيل التسجيل في الفعالية" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2"><FieldLabel>موقع التسجيل</FieldLabel>
                        <Input value={form.website} onChange={(e) => set('website', e.target.value)} dir="ltr" className={inputClass} placeholder="https://..." /></div>
                    <div><FieldLabel>إيميل حساب التسجيل</FieldLabel>
                        <Input type="email" value={form.account_email} onChange={(e) => set('account_email', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>تاريخ التسجيل</FieldLabel>
                        <Input type="date" value={form.registration_date} onChange={(e) => set('registration_date', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>الرقم المرجعي</FieldLabel>
                        <Input value={form.reference} onChange={(e) => set('reference', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>نوع التسجيل</FieldLabel>
                        <select value={form.reg_type} onChange={(e) => set('reg_type', e.target.value)} className={selectClass}>
                            <option value="">—</option>
                            <option value="visitor">زائر</option>
                            <option value="exhibitor">عارض</option>
                            <option value="press">إعلام</option>
                        </select></div>
                    <div><FieldLabel>فئة الزائر</FieldLabel>
                        <Input value={form.visitor_category} onChange={(e) => set('visitor_category', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>اسم الشركة المستخدم</FieldLabel>
                        <Input value={form.company_used} onChange={(e) => set('company_used', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>المسمى الوظيفي المستخدم</FieldLabel>
                        <Input value={form.job_used} onChange={(e) => set('job_used', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>حالة التسجيل</FieldLabel>
                        <select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectClass}>
                            {REG_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select></div>
                    <div><FieldLabel>رقم التأكيد</FieldLabel>
                        <Input value={form.confirmation_number} onChange={(e) => set('confirmation_number', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>تاريخ الإرسال النهائي</FieldLabel>
                        <Input type="date" value={form.submission_date} onChange={(e) => set('submission_date', e.target.value)} className={inputClass} /></div>
                    <div className="md:col-span-2"><FieldLabel>إيميل التأكيد</FieldLabel>
                        <Input type="email" value={form.confirmation_email} onChange={(e) => set('confirmation_email', e.target.value)} dir="ltr" className={inputClass} /></div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={IdCard} title="بطاقة الزائر (Badge)" />
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>الاسم على الـ Badge</FieldLabel>
                            <Input value={form.badge_name} onChange={(e) => set('badge_name', e.target.value)} dir="ltr" className={inputClass} /></div>
                        <div><FieldLabel>رقم الـ Badge</FieldLabel>
                            <Input value={form.badge_number} onChange={(e) => set('badge_number', e.target.value)} dir="ltr" className={inputClass} /></div>
                    </div>
                    {nameMismatch && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div><strong>تنبيه تطابق الاسم!</strong>
                                <div className="mt-0.5">الاسم ({registration?.full_name}) يختلف عن Badge ({form.badge_name}).</div></div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FileUploadField caseId={registration.id} docType="badge_pdf" label="PDF الـ Badge" />
                        <FileUploadField caseId={registration.id} docType="registration_screenshot" label="لقطة شاشة التسجيل" />
                    </div>
                    <div><FieldLabel>ملاحظات</FieldLabel>
                        <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} /></div>
                </div>
            </Card>

            <SaveButton saving={saving} onSave={handleSave} label="حفظ بيانات التسجيل" />
        </div>
    )
}
