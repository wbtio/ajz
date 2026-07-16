'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarDays, MapPin, Tag, AlertTriangle } from 'lucide-react'
import { updateEventInviterDetails } from '../../actions'
import {
    Section,
    FieldLabel,
    FormGrid,
    FormField,
    SaveFooter,
    InlineAlert,
    inputClass,
} from './shared'

function formatDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-GB') } catch { return '—' }
}

export function TabEvent({ registration }: { registration: any }) {
    const router = useRouter()
    const event = registration?.events
    const eventStatus = String(event?.status || '').toLowerCase()
    const isClosed = ['closed', 'cancelled', 'completed', 'inactive'].includes(eventStatus)

    const config = (event?.registration_config as Record<string, any>) || {}
    const inviter = config.inviter || {}

    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        host_org: inviter.host_org || '',
        host_address: inviter.host_address || '',
        host_contact_name: inviter.host_contact_name || '',
        host_contact_phone: inviter.host_contact_phone || '',
        host_contact_email: inviter.host_contact_email || '',
    })

    function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSaveInviter() {
        if (!event?.id) return
        setSaving(true)
        try {
            const { error } = await updateEventInviterDetails(event.id, form)
            if (error) toast.error(error)
            else {
                toast.success('تم حفظ بيانات الداعي للفعالية')
                router.refresh()
            }
        } catch {
            toast.error('فشل حفظ البيانات')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            {isClosed && (
                <InlineAlert variant="danger">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <span>هذه الفعالية مغلقة. إضافة أو متابعة ملفات عليها تحتاج موافقة مشرف.</span>
                </InlineAlert>
            )}

            <Section title="Event details" desc="Read-only — managed from the Events station." icon={CalendarDays}>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <DataLine icon={CalendarDays} label="Event" value={event?.title_ar || event?.title} />
                    <DataLine icon={Tag} label="Status" value={event?.status} />
                    <DataLine icon={Tag} label="Sector" value={event?.sector} />
                    <DataLine icon={MapPin} label="Country" value={event?.country_ar || event?.country} />
                    <DataLine icon={MapPin} label="City / Venue" value={event?.location_ar || event?.location} />
                    <DataLine icon={CalendarDays} label="Start" value={formatDate(event?.date)} />
                    <DataLine icon={CalendarDays} label="End" value={formatDate(event?.end_date)} />
                </dl>
            </Section>

            <Section
                title="Hosting organization"
                desc="Stored at event level — applied to every participant file."
                icon={CalendarDays}
            >
                <FormGrid>
                    <FormField label="Host organization" span={2}>
                        <input
                            value={form.host_org}
                            onChange={(e) => set('host_org', e.target.value)}
                            placeholder="e.g. Host Organization LLC"
                            dir="ltr"
                            className={inputClass}
                        />
                    </FormField>
                    <FormField label="Host address (country, governorate, street)" span={2}>
                        <input
                            value={form.host_address}
                            onChange={(e) => set('host_address', e.target.value)}
                            placeholder="e.g. Germany, Berlin, Alexanderplatz 12"
                            dir="ltr"
                            className={inputClass}
                        />
                    </FormField>
                    <FormField label="Contact name">
                        <input
                            value={form.host_contact_name}
                            onChange={(e) => set('host_contact_name', e.target.value)}
                            placeholder="e.g. John Doe"
                            dir="ltr"
                            className={inputClass}
                        />
                    </FormField>
                    <FormField label="Contact phone">
                        <input
                            value={form.host_contact_phone}
                            onChange={(e) => set('host_contact_phone', e.target.value)}
                            placeholder="e.g. +491512345678"
                            dir="ltr"
                            className={inputClass}
                        />
                    </FormField>
                    <FormField label="Contact email" span={2}>
                        <input
                            type="email"
                            value={form.host_contact_email}
                            onChange={(e) => set('host_contact_email', e.target.value)}
                            placeholder="e.g. contact@host.com"
                            dir="ltr"
                            className={inputClass}
                        />
                    </FormField>
                </FormGrid>
                <SaveFooter saving={saving} onSave={handleSaveInviter} label="Save host details" />
            </Section>
        </div>
    )
}

function DataLine({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof MapPin
    label: string
    value: string | null | undefined
}) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)]">
                <Icon className="size-3" />
                {label}
            </dt>
            <dd className="text-[13px] text-[var(--jaz-ink)] break-words">
                {value || <span className="text-[var(--jaz-whisper)]">—</span>}
            </dd>
        </div>
    )
}
