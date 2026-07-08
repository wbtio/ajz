'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plane, UserCog, FileText, Calendar, Shield, Info } from 'lucide-react'
import { saveRegistrationJsonb } from '../../actions'
import { SectionHeader, SaveButton, FieldLabel, FileUploadField, inputClass, selectClass } from './shared'

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
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={UserCog} title="حسابات العميل" />
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>دولة الوجهة</FieldLabel>
                            <Input value={form.destination_country} onChange={(e) => set('destination_country', e.target.value)} className={inputClass} /></div>
                        <div><FieldLabel>حالة حساب France-Visas</FieldLabel>
                            <select value={form.france_visas_account_status} onChange={(e) => set('france_visas_account_status', e.target.value)} className={selectClass}>
                                {ACCT_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select></div>
                        <div><FieldLabel>حالة حساب TLS</FieldLabel>
                            <select value={form.tls_account_status} onChange={(e) => set('tls_account_status', e.target.value)} className={selectClass}>
                                {ACCT_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select></div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={form.account_setup_complete} onChange={(e) => set('account_setup_complete', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#8b0000] focus:ring-[#8b0000]/20" />
                        اكتمل إعداد الحسابات
                    </label>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={FileText} title="France-Visas Application" />
                <div className="p-4 space-y-3">
                    <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>قاعدة JAZ: أبقِ الطلب كـ <strong>مسودة</strong> حتى يكتمل المسار.</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>الرقم المرجعي</FieldLabel>
                            <Input value={form.france_visas_number} onChange={(e) => set('france_visas_number', e.target.value)} dir="ltr" className={inputClass} placeholder="FRA1BG2026XXXXXXX" /></div>
                        <div><FieldLabel>تاريخ بدء الطلب</FieldLabel>
                            <Input type="date" value={form.application_start_date} onChange={(e) => set('application_start_date', e.target.value)} className={inputClass} /></div>
                        <div className="md:col-span-2"><FieldLabel>حالة الطلب</FieldLabel>
                            <select value={form.application_status} onChange={(e) => set('application_status', e.target.value)} className={selectClass}>
                                {APP_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select></div>
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Calendar} title="موعد TLS" />
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>تاريخ ووقت الموعد</FieldLabel>
                            <Input type="datetime-local" value={form.tls_appointment_date} onChange={(e) => set('tls_appointment_date', e.target.value)} className={inputClass} /></div>
                        <div><FieldLabel>مركز TLS</FieldLabel>
                            <Input value={form.tls_center} onChange={(e) => set('tls_center', e.target.value)} className={inputClass} /></div>
                        <div className="md:col-span-2"><FieldLabel>الرقم المرجعي للموعد</FieldLabel>
                            <Input value={form.appointment_reference} onChange={(e) => set('appointment_reference', e.target.value)} dir="ltr" className={inputClass} /></div>
                        <div className="md:col-span-2">
                            <FileUploadField caseId={registration.id} docType="tls_appointment" label="PDF تأكيد الموعد" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={form.appointment_booked} onChange={(e) => set('appointment_booked', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#8b0000] focus:ring-[#8b0000]/20" />
                        تم حجز الموعد
                    </label>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Shield} title="التأمين الصحي" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><FieldLabel>شركة التأمين</FieldLabel>
                        <Input value={form.insurance_company} onChange={(e) => set('insurance_company', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>رقم الوثيقة</FieldLabel>
                        <Input value={form.insurance_policy_number} onChange={(e) => set('insurance_policy_number', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>بداية التغطية</FieldLabel>
                        <Input type="date" value={form.insurance_coverage_start} onChange={(e) => set('insurance_coverage_start', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>نهاية التغطية</FieldLabel>
                        <Input type="date" value={form.insurance_coverage_end} onChange={(e) => set('insurance_coverage_end', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>قيمة التغطية</FieldLabel>
                        <Input type="number" value={form.insurance_amount} onChange={(e) => set('insurance_amount', e.target.value)} className={inputClass} /></div>
                    <div className="md:col-span-2">
                        <FileUploadField caseId={registration.id} docType="insurance" label="PDF وثيقة التأمين" />
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Plane} title="نتيجة الفيزا وملاحظات" />
                <div className="p-4 space-y-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={form.visa_approved} onChange={(e) => set('visa_approved', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#8b0000] focus:ring-[#8b0000]/20" />
                        تم منح الفيزا
                    </label>
                    <div><FieldLabel>تاريخ القرار</FieldLabel>
                        <Input type="date" value={form.visa_decision_date} onChange={(e) => set('visa_decision_date', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>ملاحظات</FieldLabel>
                        <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} /></div>
                </div>
            </Card>

            <SaveButton saving={saving} onSave={handleSave} label="حفظ بيانات الفيزا" />
        </div>
    )
}
