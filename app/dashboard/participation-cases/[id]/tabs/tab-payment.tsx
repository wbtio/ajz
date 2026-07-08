'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CreditCard, AlertTriangle, Receipt } from 'lucide-react'
import { savePaymentData } from '../../actions'
import { SectionHeader, SaveButton, FieldLabel, FileUploadField, inputClass, selectClass } from './shared'

const PAYMENT_STATUS_OPTIONS = [
    { value: 'pending', label: 'بانتظار الدفع' },
    { value: 'paid', label: 'مدفوع' },
    { value: 'partially_paid', label: 'مدفوع جزئياً' },
    { value: 'not_invoiced', label: 'بدون فاتورة' },
]

const SERVICE_PACKAGES = [
    { value: 'registration_only', label: 'تسجيل فقط' },
    { value: 'registration_invitation', label: 'تسجيل + دعوة' },
    { value: 'registration_invitation_visa', label: 'تسجيل + دعوة + فيزا' },
    { value: 'full', label: 'خدمة كاملة' },
]

const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD' },
    { value: 'IQD', label: 'IQD' },
    { value: 'EUR', label: 'EUR' },
]

export function TabPayment({ registration }: { registration: any }) {
    const ad = (registration?.additional_data as Record<string, any>) || {}
    const selectedServices = (registration?.selected_services as Record<string, any>) || {}
    const discount = ad.payment_discount || {}
    const receipt = ad.payment_receipt || {}
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        service_package: selectedServices.service_package ?? 'registration_only',
        total_amount: registration?.total_amount ?? 0,
        currency: ad.payment_currency ?? 'USD',
        payment_status: registration?.payment_status ?? 'pending',
        discount_amount: discount.amount ?? 0,
        discount_reason: discount.reason ?? '',
        discount_approved: discount.approved ?? false,
        receipt_number: receipt.number ?? '',
        receipt_date: receipt.date ? String(receipt.date).slice(0, 10) : '',
        payment_method: receipt.method ?? '',
        notes: registration?.notes ?? '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            const { error } = await savePaymentData(registration.id, {
                total_amount: Number(form.total_amount),
                payment_status: form.payment_status,
                service_package: form.service_package,
                currency: form.currency,
                discount: { amount: Number(form.discount_amount), reason: form.discount_reason },
                discount_approved: form.discount_approved,
                receipt: { number: form.receipt_number, date: form.receipt_date, method: form.payment_method },
            })
            if (error) toast.error(error)
            else toast.success('تم حفظ بيانات الدفع')
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
                <span>أي خصم يحتاج: المبلغ، السبب، وموافقة المشرف.</span>
            </div>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={CreditCard} title="الخدمة والسعر والخصم" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2"><FieldLabel>نوع الخدمة</FieldLabel>
                        <select value={form.service_package} onChange={(e) => set('service_package', e.target.value)} className={selectClass}>
                            {SERVICE_PACKAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select></div>
                    <div><FieldLabel>المبلغ الإجمالي</FieldLabel>
                        <Input type="number" value={form.total_amount} onChange={(e) => set('total_amount', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>العملة</FieldLabel>
                        <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={selectClass}>
                            {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select></div>
                    <div><FieldLabel>حالة الدفع</FieldLabel>
                        <select value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)} className={selectClass}>
                            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select></div>
                    <div><FieldLabel>مبلغ الخصم</FieldLabel>
                        <Input type="number" value={form.discount_amount} onChange={(e) => set('discount_amount', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>سبب الخصم</FieldLabel>
                        <Input value={form.discount_reason} onChange={(e) => set('discount_reason', e.target.value)} className={inputClass} /></div>
                    <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={form.discount_approved} onChange={(e) => set('discount_approved', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#8b0000] focus:ring-[#8b0000]/20" />
                        تمت موافقة المشرف على الخصم
                    </label>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={Receipt} title="تفاصيل الدفع" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><FieldLabel>طريقة الدفع</FieldLabel>
                        <select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)} className={selectClass}>
                            <option value="">—</option>
                            <option value="cash">نقداً</option>
                            <option value="bank_transfer">حوالة بنكية</option>
                            <option value="card">بطاقة</option>
                            <option value="online">إلكتروني</option>
                        </select></div>
                    <div><FieldLabel>رقم الإيصال</FieldLabel>
                        <Input value={form.receipt_number} onChange={(e) => set('receipt_number', e.target.value)} className={inputClass} /></div>
                    <div><FieldLabel>تاريخ الدفع</FieldLabel>
                        <Input type="date" value={form.receipt_date} onChange={(e) => set('receipt_date', e.target.value)} className={inputClass} /></div>
                    <div className="md:col-span-2">
                        <FileUploadField caseId={registration.id} docType="payment_receipt" label="صورة/ PDF الإيصال" />
                    </div>
                </div>
            </Card>

            <SaveButton saving={saving} onSave={handleSave} label="حفظ بيانات الدفع" />
        </div>
    )
}
