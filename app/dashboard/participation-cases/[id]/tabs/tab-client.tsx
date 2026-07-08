'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, User, BookUser, Phone, Briefcase } from 'lucide-react'
import { updateClientData } from '../../actions'
import { SectionHeader, SaveButton, FieldLabel, inputClass } from './shared'

interface TabClientProps {
    registration: any
}

export function TabClient({ registration }: TabClientProps) {
    const formData = (registration?.form_data as Record<string, any>) || {}
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        full_name: registration?.full_name || '',
        email: registration?.email || '',
        phone: formData.phone || '',
        whatsapp: formData.whatsapp || '',
        nationality: formData.nationality || '',
        place_of_birth: formData.place_of_birth || '',
        marital_status: formData.marital_status || '',
        passport_number: formData.passport_number || '',
        passport_type: formData.passport_type || '',
        passport_issue_date: formData.passport_issue_date || '',
        passport_place_of_issue: formData.passport_place_of_issue || '',
        passport_expiry_date: formData.passport_expiry_date || '',
        date_of_birth: formData.date_of_birth || '',
        sex: formData.sex || '',
        residence_country: formData.residence_country || '',
        city: formData.city || '',
        full_address: formData.full_address || '',
        job_title: formData.job_title || formData.position || '',
        employer_name: formData.employer_name || formData.company || '',
        workplace_type: formData.workplace_type || '',
        work_address: formData.work_address || '',
        work_city: formData.work_city || '',
        work_governorate: formData.work_governorate || '',
        department: formData.department || '',
        professional_specialty: formData.professional_specialty || '',
        company_website: formData.company_website || '',
        work_phone: formData.work_phone || '',
        work_email: formData.work_email || '',
        notes: registration?.notes || '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const { error } = await updateClientData(registration.id, form)
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
            <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>يجب أن تكون البيانات <strong>كما في الجواز (AS PER PASSPORT)</strong>.</span>
            </div>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={User} title="المعلومات الأساسية" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <FieldLabel required>الاسم الكامل</FieldLabel>
                        <Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={inputClass} />
                    </div>
                    <div><FieldLabel>الجنسية</FieldLabel>
                        <Input value={form.nationality} onChange={(e) => set('nationality', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>تاريخ الميلاد</FieldLabel>
                        <Input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>مكان الولادة</FieldLabel>
                        <Input value={form.place_of_birth} onChange={(e) => set('place_of_birth', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>الجنس</FieldLabel>
                        <select value={form.sex} onChange={(e) => set('sex', e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none w-full">
                            <option value="">—</option><option value="male">ذكر</option><option value="female">أنثى</option>
                        </select></div>
                    <div><FieldLabel>الحالة الاجتماعية</FieldLabel>
                        <select value={form.marital_status} onChange={(e) => set('marital_status', e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none w-full">
                            <option value="">—</option>
                            <option value="single">أعزب/عزباء</option>
                            <option value="married">متزوج/ة</option>
                            <option value="divorced">مطلق/ة</option>
                            <option value="widowed">أرمل/ة</option>
                        </select></div>
                    <div><FieldLabel>دولة الإقامة</FieldLabel>
                        <Input value={form.residence_country} onChange={(e) => set('residence_country', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>المدينة</FieldLabel>
                        <Input value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} /></div>
                    <div className="md:col-span-2"><FieldLabel>العنوان الكامل</FieldLabel>
                        <Input value={form.full_address} onChange={(e) => set('full_address', e.target.value)} className={inputClass} /></div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={BookUser} title="معلومات الجواز" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><FieldLabel>رقم الجواز</FieldLabel>
                        <Input value={form.passport_number} onChange={(e) => set('passport_number', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>نوع الجواز</FieldLabel>
                        <Input value={form.passport_type} onChange={(e) => set('passport_type', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>تاريخ إصدار الجواز</FieldLabel>
                        <Input type="date" value={form.passport_issue_date} onChange={(e) => set('passport_issue_date', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>تاريخ انتهاء الجواز</FieldLabel>
                        <Input type="date" value={form.passport_expiry_date} onChange={(e) => set('passport_expiry_date', e.target.value)} className={inputClass} /></div>
                    <div className="md:col-span-2"><FieldLabel>مكان إصدار الجواز</FieldLabel>
                        <Input value={form.passport_place_of_issue} onChange={(e) => set('passport_place_of_issue', e.target.value)} className={inputClass} /></div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Phone} title="معلومات الاتصال" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><FieldLabel>رقم الهاتف</FieldLabel>
                        <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>رقم الواتساب</FieldLabel>
                        <Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>البريد الإلكتروني</FieldLabel>
                        <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} dir="ltr" className={inputClass} /></div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Briefcase} title="المعلومات المهنية" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><FieldLabel>اسم جهة العمل</FieldLabel>
                        <Input value={form.employer_name} onChange={(e) => set('employer_name', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>نوع جهة العمل</FieldLabel>
                        <Input value={form.workplace_type} onChange={(e) => set('workplace_type', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>المسمى الوظيفي</FieldLabel>
                        <Input value={form.job_title} onChange={(e) => set('job_title', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>القسم</FieldLabel>
                        <Input value={form.department} onChange={(e) => set('department', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>التخصص المهني</FieldLabel>
                        <Input value={form.professional_specialty} onChange={(e) => set('professional_specialty', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>مدينة العمل</FieldLabel>
                        <Input value={form.work_city} onChange={(e) => set('work_city', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>محافظة العمل</FieldLabel>
                        <Input value={form.work_governorate} onChange={(e) => set('work_governorate', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>هاتف العمل</FieldLabel>
                        <Input value={form.work_phone} onChange={(e) => set('work_phone', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>بريد العمل</FieldLabel>
                        <Input type="email" value={form.work_email} onChange={(e) => set('work_email', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div><FieldLabel>موقع الشركة</FieldLabel>
                        <Input value={form.company_website} onChange={(e) => set('company_website', e.target.value)} dir="ltr" className={inputClass} /></div>
                    <div className="md:col-span-2"><FieldLabel>عنوان العمل</FieldLabel>
                        <Input value={form.work_address} onChange={(e) => set('work_address', e.target.value)} className={inputClass} /></div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="p-4">
                    <FieldLabel>ملاحظات</FieldLabel>
                    <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={inputClass} />
                </div>
            </Card>

            <SaveButton saving={saving} onSave={handleSave} label="حفظ بيانات العميل" />
        </div>
    )
}
