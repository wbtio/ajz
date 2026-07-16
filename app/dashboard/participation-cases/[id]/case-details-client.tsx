'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { updateCaseClosure, updateCaseStatus } from '../actions'
import {
    ArrowLeft,
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
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
    { value: 'new_request', label: 'New Request' },
    { value: 'data_incomplete', label: 'Incomplete Data' },
    { value: 'data_complete', label: 'Data Complete' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'payment_confirmed', label: 'Payment Confirmed' },
    { value: 'registration_in_progress', label: 'Registration In Progress' },
    { value: 'registration_draft', label: 'Registration Draft' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'invitation_requested', label: 'Invitation Requested' },
    { value: 'invitation_received', label: 'Invitation Received' },
    { value: 'visa_in_progress', label: 'Visa In Progress' },
    { value: 'appointment_booked', label: 'Appointment Booked' },
    { value: 'final_qc', label: 'Final Quality Control' },
    { value: 'correction_required', label: 'Correction Required' },
    { value: 'ready_for_next_stage', label: 'Ready for Next Stage' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'closed', label: 'Closed' },
]

const PAYMENT_LABELS: Record<string, string> = {
    not_invoiced: 'Not Invoiced',
    invoice_issued: 'Invoice Issued',
    payment_pending: 'Payment Pending',
    partially_paid: 'Partially Paid',
    paid: 'Paid',
    pending: 'Pending',
}

const CLOSURE_REASONS = [
    { value: 'registration_completed', label: 'Registration Completed' },
    { value: 'participation_completed', label: 'Participation Completed' },
    { value: 'visa_rejected', label: 'Visa Rejected' },
    { value: 'client_cancelled', label: 'Client Cancelled' },
    { value: 'event_cancelled', label: 'Event Cancelled' },
    { value: 'no_response', label: 'No Response' },
    { value: 'other', label: 'Other' },
]

const EVENT_META: Record<string, { icon: typeof User; color: string; label: string }> = {
    case_created: { icon: FolderKanban, color: 'bg-blue-100 text-blue-600', label: 'Case Created' },
    client_updated: { icon: User, color: 'bg-sky-100 text-sky-600', label: 'Client Updated' },
    status_changed: { icon: History, color: 'bg-amber-100 text-amber-600', label: 'Status Changed' },
    document_uploaded: { icon: FileCheck2, color: 'bg-indigo-100 text-indigo-600', label: 'Document Uploaded' },
    document_deleted: { icon: FileCheck2, color: 'bg-slate-100 text-slate-500', label: 'Document Deleted' },
    payment_updated: { icon: CreditCard, color: 'bg-emerald-100 text-emerald-600', label: 'Payment Updated' },
    registration_updated: { icon: FileCheck2, color: 'bg-indigo-100 text-indigo-600', label: 'Registration Updated' },
    invitation_updated: { icon: Mail, color: 'bg-purple-100 text-purple-600', label: 'Invitation Updated' },
    visa_updated: { icon: Plane, color: 'bg-sky-100 text-sky-600', label: 'Visa Updated' },
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: History },
    { id: 'client', label: 'Client', icon: User },
    { id: 'event', label: 'Event', icon: CalendarDays },
    { id: 'payment', label: 'Service & Payment', icon: CreditCard },
    { id: 'registration', label: 'Registration', icon: FileCheck2 },
    { id: 'invitation', label: 'Invitation', icon: Mail },
    { id: 'visa', label: 'Visa', icon: Plane },
    { id: 'qc', label: 'Documents', icon: ShieldCheck },
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
            else { toast.success('Case status updated'); router.refresh() }
        } catch { setCaseStatus(old); toast.error('Failed to update status') } finally { setChangingStatus(false) }
    }

    const caseNumber = registration.case_number || `#${registration.id.slice(-8).toUpperCase()}`
    const client = registration.clients || {}
    const clientName = client.full_name_as_passport || registration.full_name
    const clientEmail = client.email || registration.email
    const clientPhone = client.phone || registration.form_data?.phone
    const clientNationality = client.nationality || registration.form_data?.nationality

    return (
        <div className="space-y-4 max-w-7xl mx-auto" dir="ltr" lang="en">
            {/* ====== Case header ============================================ */}
            <header className="flex items-center justify-between gap-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/dashboard/participation-cases" className="shrink-0">
                        <button
                            aria-label="Back to cases"
                            className="inline-flex items-center justify-center size-9 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150"
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                    </Link>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="jaz-meta tracking-[0.14em] shrink-0">Case ID</span>
                            <h1 className="jaz-mono text-[15px] font-semibold text-[var(--jaz-ink)] truncate">{caseNumber}</h1>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[var(--jaz-muted)] min-w-0">
                            <span className="truncate">{clientName}</span>
                            <span className="text-[var(--jaz-whisper)] shrink-0" aria-hidden>·</span>
                            <span className="truncate hidden sm:inline">{event?.title || event?.title_ar}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {(caseStatus === 'closed' || caseStatus === 'cancelled') && (
                        <select
                            value={closureReason}
                            onChange={(e) => setClosureReason(e.target.value)}
                            className="h-9 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[12px] font-medium text-[var(--jaz-ink-soft)] focus:outline-none focus:border-[var(--jaz-sovereign)]/40"
                        >
                            {CLOSURE_REASONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    )}
                    <span className="text-[11px] font-medium text-[var(--jaz-muted)] uppercase tracking-[0.06em] hidden sm:inline">Status</span>
                    <select
                        value={caseStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={changingStatus}
                        className={cn(
                            'h-9 px-3 rounded-md border bg-[var(--jaz-surface)] text-[12px] font-semibold',
                            'focus:outline-none focus:border-[var(--jaz-sovereign)]/40 cursor-pointer',
                            'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                            caseStatus === 'completed'
                                ? 'border-[var(--jaz-emerald)]/30 text-[var(--jaz-emerald)] bg-[var(--jaz-emerald-soft)]'
                                : caseStatus === 'cancelled' || caseStatus === 'closed'
                                    ? 'border-[var(--jaz-sovereign)]/30 text-[var(--jaz-sovereign)] bg-[var(--jaz-sovereign)]/8'
                                    : caseStatus === 'correction_required'
                                        ? 'border-[var(--jaz-amber)]/30 text-[var(--jaz-amber)] bg-[var(--jaz-amber-soft)]'
                                        : 'border-[var(--jaz-line)] text-[var(--jaz-ink-soft)]',
                        )}
                    >
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </header>

            {/* ====== Tab strip ============================================ */}
            <nav
                className="flex items-center gap-1 overflow-x-auto rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] p-1 no-scrollbar"
                aria-label="Case sections"
            >
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium whitespace-nowrap transition-colors duration-150 shrink-0',
                                isActive
                                    ? 'bg-[var(--jaz-sovereign)]/8 text-[var(--jaz-sovereign)]'
                                    : 'text-[var(--jaz-muted)] hover:text-[var(--jaz-ink-soft)] hover:bg-[var(--jaz-surface-2)]/60',
                            )}
                        >
                            <Icon className="size-3.5" aria-hidden />
                            {tab.label}
                        </button>
                    )
                })}
            </nav>

            {/* ====== Tab content ============================================ */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <Section icon={User} title="Client" desc="Identity and contact details">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <DataLine label="Full name" value={clientName} />
                                <DataLine label="Phone" value={clientPhone} icon={Phone} />
                                <DataLine label="Email" value={clientEmail} icon={Mail} />
                                <DataLine label="Nationality" value={clientNationality} />
                            </dl>
                        </Section>

                        <Section icon={CalendarDays} title="Event" desc="Where this case is registered">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <DataLine label="Event" value={event?.title_ar || event?.title} />
                                <DataLine label="Country" value={event?.country_ar || event?.country} icon={MapPin} />
                                <DataLine label="City" value={event?.location_ar || event?.location} icon={MapPin} />
                                <DataLine label="Start date" value={event?.date ? new Date(event.date).toLocaleDateString('en-GB') : null} icon={CalendarDays} />
                            </dl>
                        </Section>

                        <Section icon={CreditCard} title="Service & payment" desc="Commercial record">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <DataLine label="Source" value={registration.case_source} />
                                <DataLine label="Campaign" value={registration.campaign_name} />
                                <DataLine label="Payment status" value={PAYMENT_LABELS[registration.payment_status] || registration.payment_status} />
                                <DataLine label="Amount" value={registration.total_amount ? `${Number(registration.total_amount).toLocaleString('en-US')} IQD` : null} />
                                <DataLine label="Assigned to" value={employee?.full_name || null} />
                            </dl>
                        </Section>
                    </div>

                    <div className="lg:col-span-1">
                        <Section icon={History} title="Activity" desc="Time-ordered log">
                            {events.length === 0 ? (
                                <EmptyState compact icon={History} label="No activity yet" />
                            ) : (
                                <ol className="space-y-3 max-h-[600px] overflow-y-auto -mx-1 px-1">
                                    {events.map((ev) => {
                                        const meta = EVENT_META[ev.action] || { icon: History, color: 'bg-slate-100 text-slate-500', label: ev.action }
                                        const Icon = meta.icon
                                        return (
                                            <li key={ev.id} className="flex gap-2.5">
                                                <div className={cn('size-7 rounded-full flex items-center justify-center shrink-0', meta.color)}>
                                                    <Icon className="size-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[12px] font-semibold text-[var(--jaz-ink)]">{meta.label}</div>
                                                    {ev.description && (
                                                        <div className="text-[11px] text-[var(--jaz-muted)] mt-0.5">{ev.description}</div>
                                                    )}
                                                    <div className="text-[10.5px] text-[var(--jaz-whisper)] mt-1">
                                                        {ev.performed_by_name || 'System'} · {ev.created_at ? new Date(ev.created_at).toLocaleString('en-GB') : ''}
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ol>
                            )}
                        </Section>
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

/* ------------------------------------------------------------------ */
/*  Inline section used inside the overview — shares tokens with tabs  */
/* ------------------------------------------------------------------ */

function Section({
    icon: Icon,
    title,
    desc,
    children,
}: {
    icon: typeof User
    title: string
    desc?: string
    children: React.ReactNode
}) {
    return (
        <section className="rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] overflow-hidden">
            <header className="flex items-start gap-3 px-5 py-3.5 border-b border-[var(--jaz-line)]">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] text-[var(--jaz-ink-soft)]">
                    <Icon className="size-3.5" />
                </span>
                <div>
                    <h3 className="jaz-headline text-[var(--jaz-ink)]">{title}</h3>
                    {desc && <p className="text-[11.5px] text-[var(--jaz-muted)] mt-0.5">{desc}</p>}
                </div>
            </header>
            <div className="px-5 py-4">{children}</div>
        </section>
    )
}

function DataLine({
    label,
    value,
    icon: Icon,
}: {
    label: string
    value: string | null | undefined
    icon?: typeof Phone
}) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)]">
                {Icon && <Icon className="size-3" />}
                {label}
            </dt>
            <dd className="text-[13px] text-[var(--jaz-ink)] break-words">
                {value || <span className="text-[var(--jaz-whisper)]">—</span>}
            </dd>
        </div>
    )
}

function EmptyState({
    icon: Icon,
    label,
    compact,
}: {
    icon: typeof User
    label: string
    compact?: boolean
}) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center text-center',
            compact ? 'py-6' : 'py-14',
        )}>
            <div className="size-10 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center mb-2.5">
                <Icon className="size-4 text-[var(--jaz-muted)]" aria-hidden />
            </div>
            <p className="text-[12px] text-[var(--jaz-muted)]">{label}</p>
        </div>
    )
}
