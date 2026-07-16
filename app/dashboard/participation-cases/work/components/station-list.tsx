'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, Phone, Calendar, FolderKanban } from 'lucide-react'
import { Input } from '@/components/ui/input'

const STATUS_LABELS: Record<string, string> = {
    new_request: 'New Request',
    data_incomplete: 'Incomplete Data',
    data_complete: 'Data Complete',
    payment_pending: 'Payment Pending',
    payment_confirmed: 'Payment Confirmed',
    registration_in_progress: 'Registration In Progress',
    registration_draft: 'Registration Draft',
    under_review: 'Under Review',
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
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
    closed: 'Closed',
}

function formatDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-GB') } catch { return '—' }
}

function getPhone(formData: any): string | null {
    if (!formData || typeof formData !== 'object') return null
    return formData.phone || null
}

interface StationListProps {
    cases: any[]
    station: string
    title: string
    desc?: string
}

export function StationList({ cases, station, title, desc }: StationListProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        if (!search.trim()) return cases
        const q = search.trim().toLowerCase()
        return cases.filter((c) => {
            const haystack = [c.case_number, c.full_name, c.email, c.events?.title, c.events?.title_ar]
                .filter(Boolean).join(' ').toLowerCase()
            return haystack.includes(q)
        })
    }, [cases, search])

    return (
        <div className="space-y-4" dir="ltr" lang="en">
            {/* ====== Header ============================================ */}
            <header className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="jaz-display text-[var(--jaz-ink)]">{title}</h1>
                    {desc && (
                        <p className="text-[13px] leading-relaxed text-[var(--jaz-muted)] mt-2 max-w-prose">{desc}</p>
                    )}
                </div>
                <span className="jaz-meta whitespace-nowrap shrink-0 self-start">
                    {filtered.length} cases
                </span>
            </header>

            {/* ====== Search =========================================== */}
            <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--jaz-whisper)] pointer-events-none" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by case number, name, or email…"
                    aria-label="Search cases"
                    className="pr-9 h-10 border-[var(--jaz-line)] bg-[var(--jaz-surface)] focus:border-[var(--jaz-sovereign)]/40 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 rounded-md placeholder:text-[var(--jaz-whisper)]"
                />
            </div>

            {/* ====== Table ============================================ */}
            <div className="rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px] min-w-[720px]">
                        <thead className="bg-[var(--jaz-surface-2)]/60 border-b border-[var(--jaz-line)]">
                            <tr className="text-right">
                                    <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">
                                        Case #
                                    </th>
                                    <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">
                                        Client
                                    </th>
                                    <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">
                                        Event
                                    </th>
                                    <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">
                                        Status
                                    </th>
                                    <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)]">
                                        Date
                                    </th>
                                <th className="py-2.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--jaz-line)]">
                            {filtered.map((c) => {
                                const phone = getPhone(c.form_data)
                                return (
                                    <tr
                                        key={c.id}
                                        onClick={() => router.push(`/dashboard/participation-cases/work/${station}/${c.id}`)}
                                        className="hover:bg-[var(--jaz-surface-2)]/40 transition-colors duration-150 cursor-pointer"
                                    >
                                        <td className="py-3 px-5">
                                            <span className="jaz-mono text-[12px] font-semibold text-[var(--jaz-sovereign)]">
                                                {c.case_number || `#${c.id.slice(-8).toUpperCase()}`}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="font-semibold text-[var(--jaz-ink)]">{c.full_name || '—'}</div>
                                            {phone && (
                                                <div className="text-[11px] text-[var(--jaz-muted)] flex items-center gap-1 mt-0.5">
                                                    <Phone className="size-3" />
                                                    <span dir="ltr">{phone}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="text-[var(--jaz-ink)]">{c.events?.title_ar || c.events?.title || '—'}</div>
                                            {c.events?.date && (
                                                <div className="text-[11px] text-[var(--jaz-muted)] flex items-center gap-1 mt-0.5">
                                                    <Calendar className="size-3" />
                                                    {formatDate(c.events.date)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className="inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] rounded-full border border-[var(--jaz-info)]/20 bg-[var(--jaz-info-soft)] text-[var(--jaz-info)]">
                                                {STATUS_LABELS[c.case_status] || c.case_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5 text-[var(--jaz-muted)] text-[12px] whitespace-nowrap">
                                            {formatDate(c.created_at)}
                                        </td>
                                        <td className="py-3 px-5">
                                            <ChevronLeft className="size-4 text-[var(--jaz-whisper)]" />
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="size-12 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center mb-3">
                                                <FolderKanban className="size-5 text-[var(--jaz-muted)]" aria-hidden />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-[var(--jaz-ink)]">No cases found</h3>
                                            <p className="text-[12px] text-[var(--jaz-muted)] mt-1 max-w-xs">
                                                There are no cases in this station right now.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
