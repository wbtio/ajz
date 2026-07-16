'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { saveRegistrationJsonb } from '../../actions'
import {
    Section,
    FormGrid,
    FormField,
    SaveFooter,
    FileUploadField,
    selectClass,
} from './shared'

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
        status: inv.status ?? 'required',
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
            <Section title="Invitation request" icon={Mail}>
                <div className="space-y-4">
                    <label className="flex items-center gap-2.5 text-[13px] text-[var(--jaz-ink)] cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.invitation_required}
                            onChange={(e) => set('invitation_required', e.target.checked)}
                            className="size-4 rounded border-[var(--jaz-line-strong)] text-[var(--jaz-sovereign)] focus:ring-[var(--jaz-sovereign)]/30 focus:ring-offset-0 cursor-pointer accent-[var(--jaz-sovereign)]"
                        />
                        Invitation required
                    </label>
                    <FormGrid>
                        <FormField label="Status">
                            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectClass}>
                                {INV_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>
                    </FormGrid>
                </div>
                <SaveFooter saving={saving} onSave={handleSave} label="Save invitation status" />
            </Section>

            <Section title="Received invitation" icon={Mail}>
                <FileUploadField caseId={registration.id} documents={registration.documents} docType="invitation" label="Upload official invitation PDF" />
            </Section>
        </div>
    )
}
