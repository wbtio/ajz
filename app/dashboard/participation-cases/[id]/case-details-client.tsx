'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { updateCaseClosure, updateCaseStatus } from '../actions'
import {
    ArrowRight,
    FolderKanban,
    User,
    CalendarDays,
    CreditCard,
    FileCheck2,
    Mail,
    Plane,
    ShieldCheck,
    History,
    Phone,
    MapPin,
} from 'lucide-react'
import { TabClient } from './tabs/tab-client'
import { TabEvent } from './tabs/tab-event'
import { TabPayment } from './tabs/tab-payment'
import { TabRegistration } from './tabs/tab-registration'
import { TabInvitation } from './tabs/tab-invitation'
import { TabVisa } from './tabs/tab-visa'
import { TabQc } from './tabs/tab-qc'

const STATUS_OPTIONS = [
    { value: 'new_request', label: 'طلب جديد' },
    { value: 'data_incomplete', label: 'بيانات ناقصة' },
    { value: 'data_complete', label: 'بيانات مكتملة' },
    { value: 'payment_pending', label: 'بانتظار الدفع' },
    { value: 'payment_confirmed', label: 'تم تأكيد الدفع' },
    { value: 'registration_in_progress', label: 'التسجيل جارٍ' },
    { value: 'registration_draft', label: 'مسودة التسجيل' },
    { value: 'under_review', label: 'تحت المراجعة' },
    { value: 'invitation_requested', label: 'تم طلب الدعوة' },
    { value: 'invitation_received', label: 'تم استلام الدعوة' },
    { value: 'visa_in_progress', label: 'الفيزا قيد المعالجة' },
    { value: 'appointment_booked', label: 'تم حجز الموعد' },
    { value: 'final_qc', label: 'مراقبة الجودة النهائية' },
    { value: 'correction_required', label: 'يلزم تصحيح' },
    { value: 'ready_for_next_stage', label: 'جاهز للمرحلة التالية' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'on_hold', label: 'متوقف مؤقتاً' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'closed', label: 'مغلق' },
]

const PAYMENT_LABELS: Record<string, string> = {
    not_invoiced: 'بدون فاتورة',
    invoice_issued: 'صدرت الفاتورة',
    payment_pending: 'بانتظار الدفع',
    partially_paid: 'مدفوع جزئياً',
    paid: 'مدفوع',
    pending: 'بانتظار الدفع',
}

const CLOSURE_REASONS = [
    { value: 'registration_completed', label: 'اكتمل التسجيل' },
    { value: 'participation_completed', label: 'اكتملت المشاركة' },
    { value: 'visa_rejected', label: 'رفض الفيزا' },
    { value: 'client_cancelled', label: 'إلغاء العميل' },
    { value: 'event_cancelled', label: 'إلغاء الفعالية' },
    { value: 'no_response', label: 'عدم استجابة العميل' },
    { value: 'other', label: 'أخرى' },
]

// ─── خرائط أحداث السجل ───
const EVENT_META: Record<string, { icon: typeof User; color: string; label: string }> = {
    case_created: { icon: FolderKanban, color: 'bg-blue-100 text-blue-600', label: 'إنشاء الملف' },
    client_updated: { icon: User, color: 'bg-sky-100 text-sky-600', label: 'تحديث العميل' },
    status_changed: { icon: History, color: 'bg-amber-100 text-amber-600', label: 'تغيير الحالة' },
    document_uploaded: { icon: FileCheck2, color: 'bg-indigo-100 text-indigo-600', label: 'رفع وثيقة' },
    document_deleted: { icon: FileCheck2, color: 'bg-slate-100 text-slate-500', label: 'حذف وثيقة' },
    payment_updated: { icon: CreditCard, color: 'bg-emerald-100 text-emerald-600', label: 'تحديث الدفع' },
    registration_updated: { icon: FileCheck2, color: 'bg-indigo-100 text-indigo-600', label: 'تحديث التسجيل' },
    invitation_updated: { icon: Mail, color: 'bg-purple-100 text-purple-600', label: 'تحديث الدعوة' },
    visa_updated: { icon: Plane, color: 'bg-sky-100 text-sky-600', label: 'تحديث الفيزا' },
}

const TABS = [
    { id: 'overview', label: 'نظرة عامة', icon: History },
    { id: 'client', label: 'العميل', icon: User },
    { id: 'event', label: 'الفعالية', icon: CalendarDays },
    { id: 'payment', label: 'الخدمة والدفع', icon: CreditCard },
    { id: 'registration', label: 'التسجيل', icon: FileCheck2 },
    { id: 'invitation', label: 'الدعوة', icon: Mail },
    { id: 'visa', label: 'الفيزا', icon: Plane },
    { id: 'qc', label: 'الوثائق والمراقبة', icon: ShieldCheck },
] as const

type TabId = (typeof TABS)[number]['id']

interface CaseDetailsClientProps {
    registration: any
    events: any[]
}

export function CaseDetailsClient({ registration, events }: CaseDetailsClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const [caseStatus, setCaseStatus] = useState(registration.case_status || 'new_request')
    const initialAdditionalData = (registration.additional_data as Record<string, any>) || {}
    const [closureReason, setClosureReason] = useState(initialAdditionalData.closure_reason || 'registration_completed')
    const [changingStatus, setChangingStatus] = useState(false)

    const event = registration.events
    const employee = registration.employee

    async function handleStatusChange(newStatus: string) {
        const old = caseStatus
        setCaseStatus(newStatus)
        setChangingStatus(true)
        try {
            const shouldClose = newStatus === 'closed' || newStatus === 'cancelled'
            const { error } = shouldClose
                ? await updateCaseClosure(registration.id, newStatus, closureReason)
                : await updateCaseStatus(registration.id, newStatus)
            if (error) { setCaseStatus(old); toast.error(error) }
            else { toast.success('تم تحديث حالة الملف'); router.refresh() }
        } catch { setCaseStatus(old); toast.error('فشل تحديث الحالة') } finally { setChangingStatus(false) }
    }

    const caseNumber = registration.case_number || `#${registration.id.slice(-8).toUpperCase()}`
    const formData = (registration.form_data as Record<string, any>) || {}
    const phone = formData.phone
    return (
        <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
            {/* الشريط العلوي */}
            <div className="bg-white border border-slate-200/70 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/dashboard/participation-cases" className="shrink-0">
                        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 h-9 w-9 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 truncate font-mono">{caseNumber}</h1>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="truncate">{registration.full_name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate hidden sm:inline">{event?.title_ar || event?.title}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {(caseStatus === 'closed' || caseStatus === 'cancelled') && (
                        <select
                            value={closureReason}
                            onChange={(e) => setClosureReason(e.target.value)}
                            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-[#8b0000] focus:outline-none"
                        >
                            {CLOSURE_REASONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    )}
                    <span className="text-xs text-slate-500 hidden sm:inline">الحالة:</span>
                    <select
                        value={caseStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={changingStatus}
                        className={`h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:border-[#8b0000] focus:outline-none cursor-pointer disabled:opacity-50 ${
                            caseStatus === 'completed' ? 'text-emerald-700 bg-emerald-50/50 border-emerald-200' :
                            caseStatus === 'cancelled' || caseStatus === 'closed' ? 'text-rose-700 bg-rose-50/50 border-rose-200' :
                            caseStatus === 'correction_required' ? 'text-amber-700 bg-amber-50/50 border-amber-200' :
                            'text-slate-700'
                        }`}
                    >
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>

            {/* التبويبات */}
            <div className="bg-white border border-slate-200/70 rounded-xl p-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                isActive ? 'bg-[#8b0000]/5 text-[#8b0000]' : 'text-slate-500 hover:bg-slate-50'
                            }`}>
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* محتوى التبويبات */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <h3 className="text-sm font-bold text-slate-800">العميل</h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <InfoRow label="الاسم الكامل" value={registration.full_name} />
                                <InfoRow label="رقم الهاتف" value={phone} icon={Phone} />
                                <InfoRow label="البريد الإلكتروني" value={registration.email} icon={Mail} />
                                <InfoRow label="الجنسية" value={formData.nationality} />
                            </div>
                        </Card>

                        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-slate-500" />
                                <h3 className="text-sm font-bold text-slate-800">الفعالية</h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <InfoRow label="الفعالية" value={event?.title_ar || event?.title} />
                                <InfoRow label="الدولة" value={event?.country_ar || event?.country} icon={MapPin} />
                                <InfoRow label="الموقع" value={event?.location_ar || event?.location} icon={MapPin} />
                                <InfoRow label="التاريخ" value={event?.date ? new Date(event.date).toLocaleDateString('ar-IQ') : null} icon={CalendarDays} />
                            </div>
                        </Card>

                        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-500" />
                                <h3 className="text-sm font-bold text-slate-800">الخدمة والدفع</h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <InfoRow label="المصدر" value={registration.case_source} />
                                <InfoRow label="الحملة" value={registration.campaign_name} />
                                <InfoRow label="حالة الدفع" value={PAYMENT_LABELS[registration.payment_status] || registration.payment_status} />
                                <InfoRow label="المبلغ" value={registration.total_amount ? `${Number(registration.total_amount).toLocaleString('ar')} د.ع` : '—'} />
                                <InfoRow label="الموظف المسؤول" value={employee?.full_name || '—'} />
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden sticky top-4">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-500" />
                                <h3 className="text-sm font-bold text-slate-800">سجل النشاط</h3>
                            </div>
                            <div className="p-4 max-h-[600px] overflow-y-auto">
                                {events.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-6">لا توجد أحداث مسجّلة.</p>
                                ) : (
                                    <ol className="space-y-4">
                                        {events.map((ev) => {
                                            const meta = EVENT_META[ev.action] || { icon: History, color: 'bg-slate-100 text-slate-500', label: ev.action }
                                            const Icon = meta.icon
                                            return (
                                                <li key={ev.id} className="flex gap-3">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs font-semibold text-slate-800">{meta.label}</div>
                                                        {ev.description && <div className="text-[11px] text-slate-500 mt-0.5">{ev.description}</div>}
                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                            {ev.performed_by_name || 'النظام'} • {ev.created_at ? new Date(ev.created_at).toLocaleString('ar-IQ') : ''}
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ol>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'client' && <TabClient registration={registration} />}
            {activeTab === 'event' && <TabEvent registration={registration} />}
            {activeTab === 'payment' && <TabPayment registration={registration} />}
            {activeTab === 'registration' && <TabRegistration registration={registration} />}
            {activeTab === 'invitation' && <TabInvitation registration={registration} />}
            {activeTab === 'visa' && <TabVisa registration={registration} />}
            {activeTab === 'qc' && <TabQc registration={registration} />}
        </div>
    )
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: typeof Phone }) {
    return (
        <div>
            <div className="text-[11px] text-slate-400 mb-0.5">{label}</div>
            <div className="text-slate-800 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <span className="break-words">{value || '—'}</span>
            </div>
        </div>
    )
}
