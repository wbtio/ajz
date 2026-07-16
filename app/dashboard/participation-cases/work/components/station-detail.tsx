'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { TabClient } from '@/app/dashboard/participation-cases/[id]/tabs/tab-client'
import { TabPayment } from '@/app/dashboard/participation-cases/[id]/tabs/tab-payment'
import { TabRegistration } from '@/app/dashboard/participation-cases/[id]/tabs/tab-registration'
import { TabInvitation } from '@/app/dashboard/participation-cases/[id]/tabs/tab-invitation'
import { TabVisa } from '@/app/dashboard/participation-cases/[id]/tabs/tab-visa'
import { TabQc } from '@/app/dashboard/participation-cases/[id]/tabs/tab-qc'

const STATUS_LABELS: Record<string, string> = {
    new_request: 'New Request',
    data_incomplete: 'Incomplete Data',
    data_complete: 'Data Complete',
    payment_pending: 'Payment Pending',
    payment_confirmed: 'Payment Confirmed',
    registration_in_progress: 'Registration In Progress',
    registration_draft: 'Registration Draft',
    invitation_required: 'Invitation Required',
    invitation_requested: 'Invitation Requested',
    invitation_received: 'Invitation Received',
    visa_in_progress: 'Visa In Progress',
    appointment_pending: 'Appointment Pending',
    appointment_booked: 'Appointment Booked',
    final_qc: 'Quality Control',
    correction_required: 'Correction Required',
    ready_for_next_stage: 'Ready for Next Stage',
    completed: 'Completed',
    cancelled: 'Cancelled',
    closed: 'Closed',
}

type TabKind = 'client' | 'payment' | 'registration' | 'invitation' | 'visa' | 'qc' | 'closure'

interface StationDetailProps {
    registration: any
    station: string
    stationLabel: string
    tab: TabKind
}

export function StationDetail({ registration, station, stationLabel, tab }: StationDetailProps) {
    const caseNumber = registration.case_number || `#${registration.id.slice(-8).toUpperCase()}`
    const event = registration.events

    return (
        <div className="space-y-4 max-w-6xl mx-auto" dir="ltr" lang="en">
            {/* ====== Station header ============================================ */}
            <header className="flex items-center justify-between gap-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href={`/dashboard/participation-cases/work/${station}`} className="shrink-0">
                        <button
                            aria-label="Back to station"
                            className="inline-flex items-center justify-center size-9 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150"
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                    </Link>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="jaz-mono text-[14px] font-semibold text-[var(--jaz-ink)] truncate">{caseNumber}</span>
                            <span className="inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] rounded-full border border-[var(--jaz-sovereign)]/20 bg-[var(--jaz-sovereign)]/8 text-[var(--jaz-sovereign)] shrink-0">
                                {stationLabel}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[var(--jaz-muted)] min-w-0">
                            <span className="truncate">{registration.full_name}</span>
                            <span className="text-[var(--jaz-whisper)] shrink-0" aria-hidden>·</span>
                            <span className="truncate">{event?.title_ar || event?.title}</span>
                            <span className="text-[var(--jaz-whisper)] shrink-0 hidden sm:inline" aria-hidden>·</span>
                            <span className="truncate text-[var(--jaz-ink-soft)] font-medium hidden sm:inline">
                                {STATUS_LABELS[registration.case_status] || registration.case_status}
                            </span>
                        </div>
                    </div>
                </div>
                <Link
                    href={`/dashboard/participation-cases/${registration.id}`}
                    target="_blank"
                    className="shrink-0"
                >
                        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[12px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors">
                        <ExternalLink className="size-3.5" />
                        Full case
                    </span>
                </Link>
            </header>

            {/* ====== Station tab content ========================================= */}
            {tab === 'client' && <TabClient registration={registration} />}
            {tab === 'payment' && <TabPayment registration={registration} />}
            {tab === 'registration' && <TabRegistration registration={registration} />}
            {tab === 'invitation' && <TabInvitation registration={registration} />}
            {tab === 'visa' && <TabVisa registration={registration} />}
            {tab === 'qc' && <TabQc registration={registration} />}
            {tab === 'closure' && <ClosureView registration={registration} />}
        </div>
    )
}

function ClosureView({ registration }: { registration: any }) {
    const ad = (registration.additional_data as Record<string, any>) || {}
    const closureReason = ad.closure_reason || '—'
    const closedAt = ad.closed_at ? new Date(ad.closed_at).toLocaleString('en-GB') : '—'

    const CLOSURE_LABELS: Record<string, string> = {
        registration_completed: 'اكتمل التسجيل',
        participation_completed: 'اكتملت المشاركة',
        visa_rejected: 'رفض الفيزا',
        client_cancelled: 'إلغاء العميل',
        event_cancelled: 'إلغاء الحدث',
        no_response: 'عدم استجابة',
        other: 'أخرى',
    }

    return (
        <div className="rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] overflow-hidden">
            <header className="flex items-baseline justify-between gap-3 px-5 py-3.5 border-b border-[var(--jaz-line)]">
                <h3 className="jaz-title text-[var(--jaz-ink)]">Closure Information</h3>
            </header>
            <div className="px-5 py-4 space-y-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
                    <div className="flex flex-col gap-1 min-w-0">
                        <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)]">Closure Reason</dt>
                        <dd className="text-[var(--jaz-ink)] font-semibold">{CLOSURE_LABELS[closureReason] || closureReason}</dd>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)]">Closed At</dt>
                        <dd className="text-[var(--jaz-ink)]">{closedAt}</dd>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)]">Client Name</dt>
                        <dd className="text-[var(--jaz-ink)]">{registration.full_name}</dd>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)]">Phone</dt>
                        <dd className="text-[var(--jaz-ink)]">{(registration.form_data as any)?.phone || '—'}</dd>
                    </div>
                </dl>
                {registration.notes && (
                    <div>
                        <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-whisper)] mb-1">Notes</dt>
                        <div className="text-[var(--jaz-ink-soft)] text-[13px] bg-[var(--jaz-surface-2)] rounded-md p-3 whitespace-pre-wrap">
                            {registration.notes}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
