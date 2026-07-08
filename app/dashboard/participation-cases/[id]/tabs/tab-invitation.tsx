'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, FileText } from 'lucide-react'
import { saveRegistrationJsonb } from '../../actions'
import { SectionHeader, SaveButton, FieldLabel, FileUploadField, inputClass, selectClass } from './shared'

const INV_STATUS_OPTIONS = [
    { value: 'not_required', label: 'غير مطلوبة' },
    { value: 'required', label: 'مطلوبة' },
    { value: 'pending_data', label: 'بانتظار البيانات' },
    { value: 'ready', label: 'جاهزة للطلب' },
    { value: 'requested', label: 'تم الطلب' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'received', label: 'تم الاستلام' },
    { value: 'correction_required', label: 'يلزم تصحيح' },
]

export function TabInvitation({ registration }: { registration: any }) {
    const ad = (registration?.additional_data as Record<string, any>) || {}
    const inv = ad.invitation || {}
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        invitation_required: inv.invitation_required ?? true,
        invitation_type: inv.invitation_type ?? '',
        request_date: inv.request_date ?? '',
        requested_from: inv.requested_from ?? '',
        organizer_contact: inv.organizer_contact ?? '',
        status: inv.status ?? 'required',
        invited_name: inv.invited_name ?? '',
        invitation_number: inv.invitation_number ?? '',
        issue_date: inv.issue_date ?? '',
        travel_start_date: inv.travel_start_date ?? '',
        travel_end_date: inv.travel_end_date ?? '',
        notes: inv.notes ?? '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const { error } = await saveRegistrationJsonb(
                registration.id, 'additional_data',
                { invitation: form },
                'invitation_updated', 'تم تحديث بيانات الدعوة',
            )
            if (error) toast.error(error)
            else toast.success('تم حفظ بيانات الدعوة')
        } catch { toast.error('فشل الحفظ') } finally { setSaving(false) }
    }

    return (
        <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Mail} title="تفاصيل طلب الدعوة" />
                <div className="p-4 space-y-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={form.invitation_required} onChange={(e) => set('invitation_required', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#8b0000] focus:ring-[#8b0000]/20" />
                        الدعوة مطلوبة
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>حالة الدعوة</FieldLabel>
                            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectClass}>
                                {INV_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select></div>
                        <div><FieldLabel>نوع الدعوة</FieldLabel>
                            <select value={form.invitation_type} onChange={(e) => set('invitation_type', e.target.value)} className={selectClass}>
                                <option value="">—</option><option value="individual">فردية</option><option value="company">شركة</option>
                            </select></div>
                        <div><FieldLabel>تاريخ الطلب</FieldLabel>
                            <Input type="date" value={form.request_date} onChange={(e) => set('request_date', e.target.value)} className={inputClass} /></div>
                        <div><FieldLabel>الجهة المطلوب منها</FieldLabel>
                            <Input value={form.requested_from} onChange={(e) => set('requested_from', e.target.value)} className={inputClass} /></div>
                        <div className="md:col-span-2"><FieldLabel>جهة اتصال المنظّم</FieldLabel>
                            <Input value={form.organizer_contact} onChange={(e) => set('organizer_contact', e.target.value)} className={inputClass} /></div>
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={FileText} title="بيانات الدعوة بعد الاستلام" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><FieldLabel>رقم الدعوة</FieldLabel>
                        <Input value={form.invitation_number} onChange={(e) => set('invitation_number', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>الاسم في الدعوة</FieldLabel>
                        <Input value={form.invited_name} onChange={(e) => set('invited_name', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>تاريخ الإصدار</FieldLabel>
                        <Input type="date" value={form.issue_date} onChange={(e) => set('issue_date', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>بداية فترة السفر</FieldLabel>
                        <Input type="date" value={form.travel_start_date} onChange={(e) => set('travel_start_date', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>نهاية فترة السفر</FieldLabel>
                        <Input type="date" value={form.travel_end_date} onChange={(e) => set('travel_end_date', e.target.value)} className={inputClass} /></div>
                    <div className="md:col-span-2">
                        <FileUploadField caseId={registration.id} docType="invitation" label="PDF الدعوة الرسمية" />
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="p-4"><FieldLabel>ملاحظات</FieldLabel>
                    <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} /></div>
            </Card>

            <SaveButton saving={saving} onSave={handleSave} label="حفظ بيانات الدعوة" />
        </div>
    )
}
