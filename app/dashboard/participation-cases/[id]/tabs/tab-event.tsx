'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card } from '@/components/ui/card'
import { AlertTriangle, CalendarDays, MapPin, Tag } from 'lucide-react'
import { SectionHeader } from './shared'

function formatDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('ar-IQ') } catch { return '—' }
}

export function TabEvent({ registration }: { registration: any }) {
    const event = registration?.events
    const eventStatus = String(event?.status || '').toLowerCase()
    const isClosed = ['closed', 'cancelled', 'completed', 'inactive'].includes(eventStatus)

    return (
        <div className="space-y-4">
            {isClosed && (
                <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>هذه الفعالية مغلقة. إضافة أو متابعة ملفات عليها تحتاج موافقة مشرف.</span>
                </div>
            )}
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <SectionHeader icon={CalendarDays} title="بيانات الفعالية" desc="تُدار تفاصيل الفعالية من قسم الفعاليات" />
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <Row icon={CalendarDays} label="الفعالية" value={event?.title_ar || event?.title} />
                    <Row icon={Tag} label="حالة الفعالية" value={event?.status} />
                    <Row icon={Tag} label="القطاع" value={event?.sector} />
                    <Row icon={MapPin} label="الدولة" value={event?.country_ar || event?.country} />
                    <Row icon={MapPin} label="المدينة / الموقع" value={event?.location_ar || event?.location} />
                    <Row icon={CalendarDays} label="تاريخ البداية" value={formatDate(event?.date)} />
                    <Row icon={CalendarDays} label="تاريخ النهاية" value={formatDate(event?.end_date)} />
                </div>
            </Card>
        </div>
    )
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string | null | undefined }) {
    return (
        <div>
            <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
            <div className="text-slate-800 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="break-words">{value || '—'}</span>
            </div>
        </div>
    )
}
