'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
    FolderKanban,
    Plus,
    Search,
    ChevronLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Phone,
    Calendar,
} from 'lucide-react'
import { NewCaseDialog } from './new-case-dialog'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
    new_request: 'New Request',
    data_incomplete: 'Incomplete Data',
    data_complete: 'Data Complete',
    payment_pending: 'Payment Pending',
    payment_confirmed: 'Payment Confirmed',
    registration_in_progress: 'Registration In Progress',
    under_review: 'Under Review',
    invitation_requested: 'Invitation Requested',
    invitation_received: 'Invitation Received',
    visa_in_progress: 'Visa In Progress',
    appointment_booked: 'Appointment Booked',
    final_qc: 'Quality Control',
    correction_required: 'Correction Required',
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
    closed: 'Closed',
}

const STATUS_TONE: Record<string, 'success' | 'warn' | 'sovereign' | 'info' | 'muted'> = {
    completed: 'success',
    payment_confirmed: 'success',
    closed: 'muted',
    on_hold: 'warn',
    correction_required: 'sovereign',
    cancelled: 'sovereign',
}

const PAYMENT_LABELS: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    partially_paid: 'Partially Paid',
    not_invoiced: 'Not Invoiced',
}

const PAYMENT_TONE: Record<string, 'success' | 'warn' | 'muted'> = {
    paid: 'success',
    pending: 'warn',
    partially_paid: 'warn',
    not_invoiced: 'muted',
}

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'new_request', label: 'New Request' },
    { value: 'data_incomplete', label: 'Incomplete Data' },
    { value: 'data_complete', label: 'Data Complete' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'payment_confirmed', label: 'Payment Confirmed' },
    { value: 'registration_in_progress', label: 'Registration In Progress' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'invitation_requested', label: 'Invitation Requested' },
    { value: 'invitation_received', label: 'Invitation Received' },
    { value: 'visa_in_progress', label: 'Visa In Progress' },
    { value: 'appointment_booked', label: 'Appointment Booked' },
    { value: 'final_qc', label: 'Quality Control' },
    { value: 'correction_required', label: 'Correction Required' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'closed', label: 'Closed' },
]

function formatDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-GB') } catch { return '—' }
}

function getPhone(formData: any): string | null {
    if (!formData || typeof formData !== 'object') return null
    return formData.phone || null
}

interface CasesViewProps {
    initialCases: any[]
    events: any[]
}

export function CasesView({ initialCases, events }: CasesViewProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)

    const filteredCases = useMemo(() => {
        return initialCases.filter((c) => {
            if (statusFilter !== 'all' && c.case_status !== statusFilter) return false
            if (search.trim()) {
                const q = search.trim().toLowerCase()
                const haystack = [
                    c.case_number,
                    c.full_name,
                    c.email,
                    c.events?.title,
                    c.events?.title_ar,
                ].filter(Boolean).join(' ').toLowerCase()
                if (!haystack.includes(q)) return false
            }
            return true
        })
    }, [initialCases, search, statusFilter])

    const kpis = useMemo(() => {
        const total = initialCases.length
        const inProgress = initialCases.filter((c) => !['completed', 'closed', 'cancelled'].includes(c.case_status || '')).length
        const completed = initialCases.filter((c) => ['completed', 'closed'].includes(c.case_status || '')).length
        const needsAttention = initialCases.filter((c) => ['correction_required', 'data_incomplete', 'on_hold'].includes(c.case_status || '')).length
        return { total, inProgress, completed, needsAttention }
    }, [initialCases])

    return (
        <div className="space-y-6" dir="rtl">
            {/* ====== Header ============================================ */}
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span aria-hidden className="size-1.5 rounded-full bg-[var(--jaz-sovereign)]" />
                    <span className="jaz-meta tracking-[0.16em]">Applications / Inbox</span>
                    </div>
                    <h1 className="jaz-display text-[var(--jaz-ink)]">Applications</h1>
                    <p className="text-[13px] leading-relaxed text-[var(--jaz-muted)] mt-2 max-w-prose">
                        All incoming requests from WhatsApp, the website, and the app in one place. Browse, filter, or open a new file.
                    </p>
                </div>
                <button
                    onClick={() => setIsNewDialogOpen(true)}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-[var(--jaz-sovereign)] hover:bg-[var(--jaz-sovereign-2)] text-white text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jaz-surface)]"
                >
                    <Plus className="size-4" />
                    New Request
                </button>
            </header>

            {/* ====== KPI strip ========================================= */}
            <div className="flex items-stretch gap-6 md:gap-8 border-y border-[var(--jaz-line)] py-5">
                <DataStat icon={FolderKanban} label="Total Requests" value={kpis.total} tone="info" />
                <div aria-hidden className="self-stretch w-px bg-[var(--jaz-line)]" />
                <DataStat icon={Clock} label="In Progress" value={kpis.inProgress} tone="warn" />
                <div aria-hidden className="self-stretch w-px bg-[var(--jaz-line)] hidden sm:block" />
                <DataStat icon={CheckCircle2} label="Completed" value={kpis.completed} tone="emerald" />
                <div aria-hidden className="self-stretch w-px bg-[var(--jaz-line)] hidden sm:block" />
                <DataStat icon={AlertCircle} label="Needs Attention" value={kpis.needsAttention} tone="sovereign" />
            </div>

            {/* ====== Filter row ========================================= */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--jaz-whisper)] pointer-events-none" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by case number, name, phone, or email…"
                        aria-label="Search cases"
                        className="pr-9 h-10 border-[var(--jaz-line)] bg-[var(--jaz-surface)] focus:border-[var(--jaz-sovereign)]/40 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 rounded-md placeholder:text-[var(--jaz-whisper)]"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[13px] text-[var(--jaz-ink)] focus:outline-none focus:border-[var(--jaz-sovereign)]/40 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 transition-colors min-w-[180px]"
                >
                    {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="jaz-meta md:ms-auto">Results: {filteredCases.length}</span>
            </div>

            {/* ====== Table ============================================ */}
            <div className="rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px] min-w-[920px]">
                        <thead className="bg-[var(--jaz-surface-2)]/60 border-b border-[var(--jaz-line)]">
                            <tr className="text-right">
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Case #</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Client</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Event</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Status</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Payment</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Assigned To</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">Date</th>
                                <th className="py-2.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--jaz-line)]">
                            {filteredCases.map((c) => {
                                const phone = getPhone(c.form_data)
                                return (
                                    <tr
                                        key={c.id}
                                        onClick={() => router.push(`/dashboard/participation-cases/${c.id}`)}
                                        className="hover:bg-[var(--jaz-surface-2)]/40 transition-colors duration-150 cursor-pointer"
                                    >
                                        <td className="py-3 px-5">
                                            <span className="jaz-mono text-[12px] font-semibold text-[var(--jaz-sovereign)]">{c.case_number}</span>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="font-semibold text-[var(--jaz-ink)]">{c.full_name || '—'}</div>
                                            {phone && (
                                                <div className="text-[11px] text-[var(--jaz-muted)] flex items-center gap-1 mt-0.5">
                                                    <Phone className="size-3" /> <span dir="ltr">{phone}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="text-[var(--jaz-ink)]">{c.events?.title_ar || c.events?.title || '—'}</div>
                                            {c.events?.date && (
                                                <div className="text-[11px] text-[var(--jaz-muted)] flex items-center gap-1 mt-0.5">
                                                    <Calendar className="size-3" /> {formatDate(c.events.date)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            <Pill tone={STATUS_TONE[c.case_status] || 'info'}>{STATUS_LABELS[c.case_status] || c.case_status}</Pill>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Pill tone={PAYMENT_TONE[c.payment_status] || 'muted'}>{PAYMENT_LABELS[c.payment_status] || c.payment_status}</Pill>
                                        </td>
                                        <td className="py-3 px-5 text-[var(--jaz-ink-soft)] text-[12px]">{c.employee?.full_name || '—'}</td>
                                        <td className="py-3 px-5 text-[var(--jaz-muted)] text-[12px] whitespace-nowrap">{formatDate(c.created_at)}</td>
                                        <td className="py-3 px-5">
                                            <ChevronLeft className="size-4 text-[var(--jaz-whisper)]" />
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="size-12 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center mb-3">
                                                <FolderKanban className="size-5 text-[var(--jaz-muted)]" aria-hidden />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-[var(--jaz-ink)]">
                                                {initialCases.length === 0 ? 'No requests yet' : 'No matching requests'}
                                            </h3>
                                            <p className="text-[12px] text-[var(--jaz-muted)] mt-1.5 max-w-xs">
                                                {initialCases.length === 0
                                                    ? 'Start by creating the first request from the button above.'
                                                    : 'Try a different search term or change the selected status.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewCaseDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} events={events} />
        </div>
    )
}

function DataStat({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string
    value: number
    icon: typeof FolderKanban
    tone: 'info' | 'emerald' | 'warn' | 'sovereign'
}) {
    const toneClass = {
        info: 'text-[var(--jaz-info)]',
        emerald: 'text-[var(--jaz-emerald)]',
        warn: 'text-[var(--jaz-amber)]',
        sovereign: 'text-[var(--jaz-sovereign)]',
    } as const
    return (
        <div className="flex items-center gap-3">
            <span
                aria-hidden
                className={cn(
                    'flex size-10 items-center justify-center rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)]',
                    toneClass[tone],
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="flex flex-col gap-0.5">
                <span className="jaz-numeric text-[var(--jaz-ink)]">{value}</span>
                <span className="jaz-meta">{label}</span>
            </div>
        </div>
    )
}

function Pill({
    children,
    tone = 'info',
}: {
    children: React.ReactNode
    tone?: 'success' | 'warn' | 'sovereign' | 'info' | 'muted'
}) {
    const toneClass = {
        success: 'border-[var(--jaz-emerald)]/20 bg-[var(--jaz-emerald-soft)] text-[var(--jaz-emerald)]',
        warn: 'border-[var(--jaz-amber)]/20 bg-[var(--jaz-amber-soft)] text-[var(--jaz-amber)]',
        sovereign: 'border-[var(--jaz-sovereign)]/20 bg-[var(--jaz-sovereign)]/8 text-[var(--jaz-sovereign)]',
        info: 'border-[var(--jaz-info)]/20 bg-[var(--jaz-info-soft)] text-[var(--jaz-info)]',
        muted: 'border-[var(--jaz-line)] bg-[var(--jaz-surface-2)] text-[var(--jaz-muted)]',
    } as const
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] rounded-full border whitespace-nowrap',
                toneClass[tone],
            )}
        >
            {children}
        </span>
    )
}
