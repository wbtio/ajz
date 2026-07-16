'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
    IdCard,
    Search,
    Phone,
    Mail,
    FileCheck2,
    FileWarning,
    Users,
    Globe,
    FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CORE_FIELDS = [
    'phone', 'nationality', 'date_of_birth', 'place_of_birth', 'sex',
    'passport_number', 'passport_type', 'passport_issue_date', 'passport_expiry_date',
    'residence_country', 'city', 'job_title', 'employer_name',
]

function completeness(client: any): { filled: number; total: number; ratio: number } {
    const c = client && typeof client === 'object' ? client : {}
    const filled = CORE_FIELDS.filter((k) => {
        const v = c[k]
        return v !== undefined && v !== null && String(v).trim() !== ''
    }).length
    return { filled, total: CORE_FIELDS.length, ratio: filled / CORE_FIELDS.length }
}

function completenessBadge(ratio: number): { label: string; tone: 'success' | 'warn' | 'danger' } {
    if (ratio >= 0.8) return { label: 'Complete', tone: 'success' }
    if (ratio >= 0.4) return { label: 'Partial', tone: 'warn' }
    return { label: 'Incomplete', tone: 'danger' }
}

function formatDate(d: string | null) {
    if (!d) return '—'
    try {
        return new Date(d).toLocaleDateString('en-GB')
    } catch {
        return '—'
    }
}

const FILTER_OPTIONS = [
    { value: 'all', label: 'All clients' },
    { value: 'complete', label: 'Complete profiles' },
    { value: 'partial', label: 'Partial profiles' },
    { value: 'incomplete', label: 'Incomplete profiles' },
]

interface ClientsDirectoryProps {
    clients: any[]
}

export function ClientsDirectory({ clients }: ClientsDirectoryProps) {
    const [search, setSearch] = useState('')
    const [completenessFilter, setCompletenessFilter] = useState('all')

    const enriched = useMemo(
        () => clients.map((c) => ({ ...c, _comp: completeness(c) })),
        [clients],
    )

    const filtered = useMemo(() => {
        return enriched.filter((c) => {
            const ratio = c._comp.ratio
            if (completenessFilter === 'complete' && ratio < 0.8) return false
            if (completenessFilter === 'partial' && !(ratio >= 0.4 && ratio < 0.8)) return false
            if (completenessFilter === 'incomplete' && ratio >= 0.4) return false
            if (search.trim()) {
                const q = search.trim().toLowerCase()
                const caseMatches = c.registrations?.map((r: any) =>
                    `${r.case_number || ''} ${r.events?.title_ar || ''} ${r.events?.title || ''}`
                ).join(' ') || ''
                const haystack = [
                    c.full_name_as_passport,
                    c.email,
                    c.phone,
                    c.passport_number,
                    caseMatches,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                if (!haystack.includes(q)) return false
            }
            return true
        })
    }, [enriched, search, completenessFilter])

    const kpis = useMemo(() => {
        const total = enriched.length
        const complete = enriched.filter((c) => c._comp.ratio >= 0.8).length
        const incomplete = enriched.filter((c) => c._comp.ratio < 0.4).length
        return { total, complete, incomplete }
    }, [enriched])

    return (
        <div className="space-y-6" dir="ltr" lang="en">
            {/* ====== Header ============================================ */}
            <header className="flex items-end justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span aria-hidden className="size-1.5 rounded-full bg-[var(--jaz-sovereign)]" />
                        <span className="jaz-meta tracking-[0.16em]">Clients / Directory</span>
                    </div>
                    <h1 className="jaz-display text-[var(--jaz-ink)]">Client Directory</h1>
                    <p className="text-[13px] leading-relaxed text-[var(--jaz-muted)] mt-2 max-w-prose">
                        Search registered clients, review profile completeness, and open the latest application.
                    </p>
                </div>
            </header>

            {/* ====== KPI strip ========================================= */}
            <div className="flex items-stretch gap-6 md:gap-8 border-y border-[var(--jaz-line)] py-5">
                <DataStat
                    label="Total Clients"
                    value={kpis.total}
                    icon={Users}
                    tone="info"
                />
                <div aria-hidden className="self-stretch w-px bg-[var(--jaz-line)]" />
                <DataStat
                    label="Complete Profiles"
                    value={kpis.complete}
                    icon={FileCheck2}
                    tone="emerald"
                />
                <div aria-hidden className="self-stretch w-px bg-[var(--jaz-line)] hidden sm:block" />
                <DataStat
                    label="Incomplete Profiles"
                    value={kpis.incomplete}
                    icon={FileWarning}
                    tone="sovereign"
                />
            </div>

            {/* ====== Filter row ========================================= */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--jaz-whisper)] pointer-events-none" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, phone, email, passport, or case number…"
                        aria-label="Search clients"
                        className="pr-9 h-10 border-[var(--jaz-line)] bg-[var(--jaz-surface)] focus:border-[var(--jaz-sovereign)]/40 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 rounded-md placeholder:text-[var(--jaz-whisper)]"
                    />
                </div>
                <select
                    value={completenessFilter}
                    onChange={(e) => setCompletenessFilter(e.target.value)}
                    className="h-10 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[13px] text-[var(--jaz-ink)] focus:outline-none focus:border-[var(--jaz-sovereign)]/40 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 transition-colors min-w-[180px]"
                >
                    {FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <span className="jaz-meta md:ms-auto">{filtered.length} Results</span>
            </div>

            {/* ====== Table ============================================ */}
            <div className="rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px] min-w-[820px]">
                        <thead className="bg-[var(--jaz-surface-2)]/60 border-b border-[var(--jaz-line)]">
                            <tr className="text-left">
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)] w-[30%]">Client</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)] w-[15%]">Nationality / City</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)] w-[15%]">Passport Number</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)] w-[20%]">Event / Cases</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)] w-[10%]">Completeness</th>
                                <th className="py-2.5 px-5 font-semibold text-[10.5px] uppercase tracking-[0.08em] text-[var(--jaz-muted)] w-[10%]">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--jaz-line)]">
                            {filtered.map((c) => {
                                const badge = completenessBadge(c._comp.ratio)
                                const latestCase = c.registrations?.[0]
                                return (
                                    <tr key={c.id} className="hover:bg-[var(--jaz-surface-2)]/40 transition-colors duration-150">
                                        <td className="py-3 px-5 min-w-0">
                                            {latestCase ? <Link href={`/dashboard/participation-cases/${latestCase.id}`} className="block truncate font-semibold text-[var(--jaz-ink)] hover:text-[var(--jaz-sovereign)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/30">{c.full_name_as_passport || '—'}</Link> : <div className="font-semibold text-[var(--jaz-ink)] truncate">{c.full_name_as_passport || '—'}</div>}
                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                {c.phone && (
                                                    <span className="text-[11px] text-[var(--jaz-muted)] flex items-center gap-1">
                                                        <Phone className="size-3 shrink-0" /> <span dir="ltr">{c.phone}</span>
                                                    </span>
                                                )}
                                                {c.email && (
                                                    <span className="text-[11px] text-[var(--jaz-muted)] flex items-center gap-1 truncate">
                                                        <Mail className="size-3 shrink-0" /> <span className="truncate" dir="ltr">{c.email}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-1.5 text-[var(--jaz-ink)] text-xs">
                                                <Globe className="size-3.5 text-[var(--jaz-whisper)] shrink-0" />
                                                <span className="truncate">{c.nationality || '—'}</span>
                                            </div>
                                            {c.city && <div className="text-[11px] text-[var(--jaz-muted)] mt-0.5 truncate">{c.city}</div>}
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className="jaz-mono text-[12px] text-[var(--jaz-ink-soft)]" dir="ltr">{c.passport_number || '—'}</span>
                                        </td>
                                        <td className="py-3 px-5">
                                            {latestCase ? (
                                                <>
                                                    <div className="text-[var(--jaz-ink)] text-xs truncate">
                                                        {latestCase.events?.title_ar || latestCase.events?.title || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="jaz-mono text-[10px] text-[var(--jaz-sovereign)] font-semibold">
                                                            {latestCase.case_number}
                                                        </span>
                                                        {c.registrations && c.registrations.length > 1 && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[var(--jaz-emerald)]/20 bg-[var(--jaz-emerald-soft)] text-[var(--jaz-emerald)]">
                                                                <FolderOpen className="size-2.5" />
                                                                +{c.registrations.length - 1} Cases
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-[var(--jaz-whisper)] text-xs">No Cases</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            <Pill tone={badge.tone}>{badge.label}</Pill>
                                            <div className="text-[10px] text-[var(--jaz-whisper)] mt-0.5">
                                                {c._comp.filled}/{c._comp.total} Fields
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-[var(--jaz-muted)] text-xs whitespace-nowrap">
                                            {formatDate(c.updated_at)}
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="size-12 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center mb-3">
                                                <IdCard className="size-5 text-[var(--jaz-muted)]" aria-hidden />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-[var(--jaz-ink)]">
                                                {clients.length === 0 ? 'No Clients Yet' : 'No Matching Clients'}
                                            </h3>
                                            <p className="text-[12px] text-[var(--jaz-muted)] mt-1.5 max-w-xs">
                                                Try another search term or clear the completeness filter.
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

function DataStat({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string
    value: number
    icon: typeof Users
    tone: 'info' | 'emerald' | 'sovereign'
}) {
    const toneClass = {
        info: 'text-[var(--jaz-info)]',
        emerald: 'text-[var(--jaz-emerald)]',
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
    tone?: 'success' | 'warn' | 'danger' | 'info'
}) {
    const toneClass = {
        success: 'border-[var(--jaz-emerald)]/20 bg-[var(--jaz-emerald-soft)] text-[var(--jaz-emerald)]',
        warn: 'border-[var(--jaz-amber)]/20 bg-[var(--jaz-amber-soft)] text-[var(--jaz-amber)]',
        danger: 'border-[var(--jaz-sovereign)]/20 bg-[var(--jaz-sovereign)]/8 text-[var(--jaz-sovereign)]',
        info: 'border-[var(--jaz-info)]/20 bg-[var(--jaz-info-soft)] text-[var(--jaz-info)]',
    } as const
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] rounded-full border',
                toneClass[tone],
            )}
        >
            {children}
        </span>
    )
}
