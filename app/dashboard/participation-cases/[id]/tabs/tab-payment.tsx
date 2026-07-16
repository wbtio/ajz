'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { CreditCard, AlertTriangle, Receipt } from 'lucide-react'
import { savePaymentData } from '../../actions'
import {
    Section,
    FormGrid,
    FormField,
    SaveFooter,
    InlineAlert,
    FileUploadField,
    inputClass,
    selectClass,
} from './shared'

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
            <InlineAlert variant="warn">
                <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                <span>أي خصم يحتاج: المبلغ، السبب، وموافقة المشرف.</span>
            </InlineAlert>

            <Section title="Service, price & discount" icon={CreditCard}>
                <FormGrid>
                    <FormField label="Service package" span={2}>
                        <select value={form.service_package} onChange={(e) => set('service_package', e.target.value)} className={selectClass}>
                            {SERVICE_PACKAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Total amount">
                        <input type="number" value={form.total_amount} onChange={(e) => set('total_amount', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Currency">
                        <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={selectClass}>
                            {CURRENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Payment status">
                        <select value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)} className={selectClass}>
                            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Discount amount">
                        <input type="number" value={form.discount_amount} onChange={(e) => set('discount_amount', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Discount reason" span={2}>
                        <input value={form.discount_reason} onChange={(e) => set('discount_reason', e.target.value)} className={inputClass} />
                    </FormField>
                </FormGrid>
                <label className="mt-4 flex items-center gap-2.5 text-[13px] text-[var(--jaz-ink)] cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={form.discount_approved}
                        onChange={(e) => set('discount_approved', e.target.checked)}
                        className="size-4 rounded border-[var(--jaz-line-strong)] text-[var(--jaz-sovereign)] focus:ring-[var(--jaz-sovereign)]/30 focus:ring-offset-0 cursor-pointer accent-[var(--jaz-sovereign)]"
                    />
                    Discount approved by supervisor
                </label>
            </Section>

            <Section title="Receipt" icon={Receipt}>
                <FormGrid>
                    <FormField label="Payment method">
                        <select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)} className={selectClass}>
                            <option value="">—</option>
                            <option value="cash">نقداً</option>
                            <option value="bank_transfer">حوالة بنكية</option>
                            <option value="card">بطاقة</option>
                            <option value="online">إلكتروني</option>
                        </select>
                    </FormField>
                    <FormField label="Receipt number">
                        <input value={form.receipt_number} onChange={(e) => set('receipt_number', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Payment date" span={2}>
                        <input type="date" value={form.receipt_date} onChange={(e) => set('receipt_date', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Receipt file / PDF" span={2}>
                        <FileUploadField caseId={registration.id} documents={registration.documents} docType="payment_receipt" label="Upload receipt file" />
                    </FormField>
                </FormGrid>
                <SaveFooter saving={saving} onSave={handleSave} label="Save payment record" />
            </Section>
        </div>
    )
}
