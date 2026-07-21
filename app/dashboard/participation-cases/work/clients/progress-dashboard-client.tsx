'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from '@/components/ui/avatar'
import {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { WizardClient } from '../new-registration/wizard-client'
import type { Employee, RegistrationEvent } from '../new-registration/wizard-types'
import type { Json } from '@/lib/database.types'
import {
    Search,
    Download,
    Plus,
    FolderKanban,
    ArrowUpRight,
    X,
    Mars,
    Venus,
    CircleUserRound,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Step model                                                        */
/* ------------------------------------------------------------------ */

const STEPS = [
    { id: 1, label: 'Event', code: 'EVT' },
    { id: 2, label: 'Client', code: 'CLI' },
    { id: 3, label: 'Intake', code: 'INT' },
    { id: 4, label: 'Visa', code: 'VSA' },
    { id: 5, label: 'Docs', code: 'DOC' },
    { id: 6, label: 'Pay', code: 'PAY' },
    { id: 7, label: 'Delivery', code: 'DLV' },
] as const

// Shape of rows coming from the drift_events table (filtered by the parent
// page to `is_active = true` AND `status = 'active'`). Do not accept events
// objects sourced from public.events here — that table is for the website
// catalog and is intentionally NOT used by this wizard.
interface Event {
    id: string
    title: string
    title_ar: string | null
    date: string | null
    end_date: string | null
    country: string | null
    country_ar: string | null
    location: string | null
    location_ar: string | null
    sector: string | null
    status?: string | null
    registration_config?: Json
}

/** Shape of a registration returned by `loadEventCases` (with joined relations). */
interface ApplicationCase {
    id: string
    event_id: string
    full_name: string | null
    email: string | null
    case_number: string | null
    case_status: string | null
    current_step: number
    created_at: string | null
    updated_at: string | null
    payment_status: string
    documents: Json
    assigned_employee_id: string | null
    additional_data: Json | null
    form_data?: Json | null
    clients: { employer_name: string | null } | { employer_name: string | null }[] | null
    assigned_employee: { full_name: string | null; email: string | null } | null
    registration_events: Array<{
        performed_by: string | null
        performed_by_name: string | null
        created_at: string | null
        users: { full_name: string | null; email: string | null; avatar_url: string | null } | { full_name: string | null; email: string | null; avatar_url: string | null }[]
    }>
    clients_sex?: string | null
}

interface CurrentUser {
    id: string
    role: string | null
    permissions: string[] | null
}

interface ProgressDashboardClientProps {
    events: Event[]
    employees: Employee[]
    currentUser: CurrentUser
}

/* ------------------------------------------------------------------ */
/*  Mapping helpers                                                   */
/* ------------------------------------------------------------------ */

function getMappedStep(c: ApplicationCase): number {
    const storedStep = Number(c.current_step)
    if (!Number.isInteger(storedStep)) return 1
    return Math.max(1, Math.min(storedStep, STEPS.length))
}

function formatEventDate(date?: string | null) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-GB')
}

function eventLabel(event: Event) {
    return [
        event.title_ar || event.title,
        event.location_ar || event.location || event.country_ar || event.country,
        formatEventDate(event.date),
    ].filter(Boolean).join(' • ')
}

function getOverallStatusLabel(c: ApplicationCase): string {
    switch (c.case_status) {
        case 'completed': return 'Closed'
        case 'ready_for_next_stage': return 'Ready to Send'
        case 'new_request': return 'Pending'
        default: return 'In Progress'
    }
}

const REQUIRED_DOCUMENT_TYPES = [
    ['passport_copy', 'passport'],
    ['visa_application_form'],
    ['invitation', 'invitation_letter'],
    ['appointment_confirmation', 'tls_appointment'],
    ['insurance', 'travel_insurance'],
]

function hasMissingDocuments(c: ApplicationCase) {
    const documents = Array.isArray(c.documents) ? (c.documents as any[]) : []
    return REQUIRED_DOCUMENT_TYPES.some((aliases) => !documents.some((doc) => aliases.includes(String(doc?.type || ''))))
}

function appointmentDate(c: ApplicationCase) {
    const additional = (c.additional_data ?? {}) as Record<string, unknown>
    const value = additional.visa_appointment_date
    const time = additional.visa_appointment_time
    return value ? new Date(`${value}T${(time as string) || '23:59'}`) : null
}

function getAppointmentStatus(c: ApplicationCase): string {
    return String((c.additional_data as Record<string, unknown> | null)?.visa_appointment_status ?? '')
}

/* ------------------------------------------------------------------ */
/*  Status pill                                                       */
/*  Filled accent reserved for Closed / Ready states (≤10% rule)      */
/*  Other states use muted neutrals.                                  */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { fg: string; bg: string; dot: string; border: string }> = {
        'Closed': {
            fg: 'text-[var(--jaz-emerald)]',
            bg: 'bg-[var(--jaz-emerald-soft)]',
            dot: 'bg-[var(--jaz-emerald)]',
            border: 'border-transparent',
        },
        'Ready to Send': {
            fg: 'text-[var(--jaz-sovereign)]',
            bg: 'bg-[var(--jaz-sovereign)]/8',
            dot: 'bg-[var(--jaz-sovereign)]',
            border: 'border-[var(--jaz-sovereign)]/15',
        },
        'Pending': {
            fg: 'text-[var(--jaz-muted)]',
            bg: 'bg-[var(--jaz-surface-2)]',
            dot: 'bg-[var(--jaz-whisper)]',
            border: 'border-transparent',
        },
        'In Progress': {
            fg: 'text-[var(--jaz-info)]',
            bg: 'bg-[var(--jaz-info-soft)]',
            dot: 'bg-[var(--jaz-info)]',
            border: 'border-transparent',
        },
    }
    const v = map[status] ?? map['In Progress']
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] border',
                v.fg,
                v.bg,
                v.border,
            )}
        >
            <span className={cn('size-1.5 rounded-full', v.dot)} aria-hidden />
            {status}
        </span>
    )
}

function StageProgress({ mappedStep, onStepClick }: { mappedStep: number; onStepClick: (step: number) => void }) {
    const currentStep = STEPS[Math.max(0, Math.min(mappedStep - 1, STEPS.length - 1))]
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-1" role="group" aria-label={`Application progress: step ${mappedStep} of ${STEPS.length}`}>
                {STEPS.map((step) => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => onStepClick(step.id)}
                        aria-label={`Open step ${step.id}: ${step.label}`}
                        aria-current={step.id === mappedStep ? 'step' : undefined}
                        title={`${step.id}. ${step.label}`}
                        className={cn(
                            'h-2 w-5 rounded-full transition-[background-color,transform] duration-150 hover:scale-y-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/40 focus-visible:ring-offset-2',
                            // Completed stages stay visibly red even when a later
                            // stage is active; only future stages use the neutral tone.
                            step.id < mappedStep && 'bg-[var(--jaz-sovereign)]/55',
                            step.id === mappedStep && 'bg-[var(--jaz-sovereign)]',
                            step.id > mappedStep && 'bg-[var(--jaz-line-strong)]',
                        )}
                    />
                ))}
            </div>
            <span className="min-w-0 truncate text-[11px] font-medium text-[var(--jaz-ink-soft)]">
                {currentStep?.label || 'Event'} <span className="text-[var(--jaz-whisper)]">{mappedStep}/7</span>
            </span>
        </div>
    )
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase() || '?'
}

function renderGenderIcon(sex?: string | null) {
    const value = String(sex || '').toLowerCase()
    if (['male', 'm', 'man', 'boy', 'ذكر'].includes(value)) return <Mars className="size-4" />
    if (['female', 'f', 'woman', 'girl', 'أنثى'].includes(value)) return <Venus className="size-4" />
    return <CircleUserRound className="size-4" />
}

function ApplicationEditors({ events }: { events?: ApplicationCase['registration_events'] }) {
    const editors = useMemo(() => {
        const uniqueEditors = new Map<string, { id: string; name: string; avatarUrl: string | null }>()

        for (const event of events || []) {
            if (!event.performed_by) continue
            const user = Array.isArray(event.users) ? event.users[0] : event.users
            if (uniqueEditors.has(event.performed_by)) continue

            uniqueEditors.set(event.performed_by, {
                id: event.performed_by,
                name: user?.full_name || event.performed_by_name || user?.email || 'Staff member',
                avatarUrl: user?.avatar_url || null,
            })
        }

        return Array.from(uniqueEditors.values())
    }, [events])

    if (editors.length === 0) {
        return <span className="text-[11px] text-[var(--jaz-whisper)]" aria-label="No recorded editors">—</span>
    }

    const visibleEditors = editors.slice(0, 4)
    const remainingCount = editors.length - visibleEditors.length

    return (
        <AvatarGroup aria-label={`Edited by ${editors.map((editor) => editor.name).join(', ')}`}>
            {visibleEditors.map((editor) => (
                <Avatar key={editor.id} size="sm" title={editor.name} aria-label={editor.name}>
                    <AvatarImage src={editor.avatarUrl || undefined} alt={editor.name} className="object-cover" />
                    <AvatarFallback className="bg-[var(--jaz-surface-2)] text-[9px] font-semibold text-[var(--jaz-ink-soft)]">
                        {getInitials(editor.name)}
                    </AvatarFallback>
                </Avatar>
            ))}
            {remainingCount > 0 && (
                <AvatarGroupCount title={`${remainingCount} more editors`} aria-label={`${remainingCount} more editors`}>
                    +{remainingCount}
                </AvatarGroupCount>
            )}
        </AvatarGroup>
    )
}

/* ------------------------------------------------------------------ */
/*  Case row — denser, table-like, no nested cards                    */
/* ------------------------------------------------------------------ */

function CaseRow({ c, onStepClick, onOpenFile }: {
    c: ApplicationCase
    onStepClick: (regId: string, step: number) => void
    onOpenFile: (c: ApplicationCase) => void
}) {
    const mappedStep = getMappedStep(c)
    const overallStatus = getOverallStatusLabel(c)
    return (
        <div className="group bg-[var(--jaz-surface)] transition-colors duration-150 hover:bg-[var(--jaz-surface-2)]/55">
            <div className="grid min-h-16 grid-cols-12 items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-5">
                <div className="col-span-9 flex min-w-0 items-center gap-3 md:col-span-3">
                    <div
                        aria-hidden
                        className="size-9 shrink-0 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center text-[var(--jaz-ink-soft)]"
                    >
                        {renderGenderIcon((c.form_data as Record<string, unknown> | null)?.sex as string | undefined)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-baseline gap-2">
                            <h3 className="truncate text-[13px] font-semibold leading-tight text-[var(--jaz-ink)]">
                                {c.full_name || 'Unnamed Client'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                            <span className="jaz-mono text-[11px] font-medium text-[var(--jaz-muted)] shrink-0">
                                {c.case_number || '\u2014'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="col-span-3 flex justify-end md:col-span-2 md:justify-start">
                    <StatusPill status={overallStatus} />
                </div>

                <div className="col-span-10 md:col-span-3">
                    <StageProgress mappedStep={mappedStep} onStepClick={(step) => onStepClick(c.id, step)} />
                </div>

                <div className="col-span-6 flex items-center md:col-span-2">
                    <ApplicationEditors events={c.registration_events} />
                </div>

                <div className="col-span-6 flex items-center justify-end md:col-span-2">
                    <Link
                        href={`/dashboard/participation-cases/work/clients/${c.id}/ai-review`}
                        aria-label={`Review application for ${c.full_name || 'client'} with AI`}
                        className="mr-1 inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-[var(--jaz-sovereign)] hover:bg-red-50"
                    >
                        <FolderKanban className="size-3.5" aria-hidden />
                        <span className="hidden xl:inline">AI Review</span>
                    </Link>
                    <button
                        onClick={() => onOpenFile(c)}
                        aria-label={`Open file for ${c.full_name || 'client'}`}
                        className={cn(
                            'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5',
                            'text-[12px] font-medium no-print',
                            'text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)]',
                            'hover:bg-[var(--jaz-surface-2)] transition-colors duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                        )}
                    >
                        <span className="hidden lg:inline">Open</span>
                        <ArrowUpRight className="size-3.5" aria-hidden />
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Kpi block — values live above labels, scales by hierarchy.        */
/*  Top KPI (Total) uses display weight; secondary stats are quieter. */
/* ------------------------------------------------------------------ */

function KpiPrimary({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex h-10 min-w-[94px] items-center gap-2 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] px-2.5">
            <span className="jaz-mono flex h-5 min-w-5 items-center justify-center rounded px-1 text-[9px] font-semibold bg-[var(--jaz-surface-2)] text-[var(--jaz-ink-soft)]">
                {value}
            </span>
            <span className="text-[11px] font-medium text-[var(--jaz-ink-soft)]">{label}</span>
        </div>
    )
}

function KpiSecondary({ value, label, accent }: { value: number; label: string; accent: 'emerald' | 'amber' | 'info' }) {
    const colorMap = {
        emerald: 'var(--jaz-emerald)',
        amber: 'var(--jaz-amber)',
        info: 'var(--jaz-info)',
    } as const
    return (
        <div className="flex h-10 min-w-[86px] items-center gap-2 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] px-2.5">
            <span
                className="jaz-mono flex h-5 min-w-5 items-center justify-center rounded px-1 text-[9px] font-semibold"
                style={{ color: colorMap[accent], backgroundColor: `color-mix(in srgb, ${colorMap[accent]} 12%, white)` }}
            >
                {value}
            </span>
            <span className="text-[11px] font-medium text-[var(--jaz-ink-soft)]">{label}</span>
        </div>
    )
}

const ALL_EVENTS_VALUE = 'all-events'

/** Number of registration rows fetched per page (initial + "Load more"). */
const PAGE_SIZE = 50

/** Safely reads employer_name regardless of whether the join returns an object or array. */
function getEmployerName(c: ApplicationCase): string | null {
    const clients = c.clients as unknown
    if (!clients) return null
    if (Array.isArray(clients)) return clients[0]?.employer_name ?? null
    return (clients as { employer_name: string | null }).employer_name
}

/**
 * Prevents CSV formula injection. Excel/LibreOffice will execute a cell as a
 * formula if it starts with =, +, -, @, a tab, or a carriage return. Prefixing
 * with a single quote neutralises the attack while keeping the value readable.
 */
function sanitizeCsvCell(value: string): string {
    const escaped = value.replace(/"/g, '""')
    if (/^[=+\-@\t\r]/.test(escaped)) return `'${escaped}`
    return escaped
}

/** Strips characters that are invalid in filenames on Windows / macOS / Linux. */
function sanitizeFileName(name: string): string {
    return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim() || 'event'
}

/* ------------------------------------------------------------------ */
/*  Skeleton rows — match real layout, not generic placeholders       */
/* ------------------------------------------------------------------ */

function SkeletonRows() {
    return (
        <>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="animate-pulse bg-[var(--jaz-surface)] px-5 py-4 sm:px-6 border-b border-[var(--jaz-line)] first:rounded-t-md last:rounded-b-md"
                >
                    <div className="grid grid-cols-12 items-center gap-x-4 gap-y-3">
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                            <div className="size-9 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)]" />
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="h-3 w-32 rounded bg-[var(--jaz-surface-2)]" />
                                <div className="h-2.5 w-44 rounded bg-[var(--jaz-surface-2)]" />
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-3">
                            <div className="h-5 w-24 rounded-full bg-[var(--jaz-surface-2)]" />
                        </div>
                        <div className="hidden md:block md:col-span-3 h-3 w-32 rounded bg-[var(--jaz-surface-2)]" />
                        <div className="col-span-6 md:col-span-2 flex justify-end">
                            <div className="h-7 w-24 rounded-md bg-[var(--jaz-surface-2)]" />
                        </div>
                        <div className="col-span-12 pt-3">
                            <div className="h-7 w-full rounded bg-[var(--jaz-surface-2)]" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

export function ProgressDashboardClient({ events, employees, currentUser }: ProgressDashboardClientProps) {
    const supabase = useMemo(() => createClient(), [])
    const activeCasesRequest = useRef<AbortController | null>(null)

    const [selectedEventId, setSelectedEventId] = useState(ALL_EVENTS_VALUE)
    // Tracks the event id for the currently active/loaded list, so an in-flight
    // "Load more" can bail out if the user switches events mid-request.
    const activeEventIdRef = useRef<string>(selectedEventId)
    const [cases, setCases] = useState<ApplicationCase[]>([])
    // Total matching rows on the server (independent of how many are loaded).
    const [totalCount, setTotalCount] = useState(0)
    // Whether more pages remain to be loaded via "Load more".
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [smartFilter, setSmartFilter] = useState('all')
    const [assignedFilter, setAssignedFilter] = useState('all')
    const [showWizard, setShowWizard] = useState(false)
    const [wizardRegId, setWizardRegId] = useState<string | undefined>()
    const [wizardStep, setWizardStep] = useState<number>(1)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const registrationId = params.get('registrationId')
            const requestedStep = Number(params.get('step'))
            if (registrationId) {
                setShowWizard(true)
                setWizardRegId(registrationId)
                setWizardStep(Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 7 ? requestedStep : 4)
            } else if (params.get('action') === 'new') {
                setShowWizard(true); setWizardStep(1); setWizardRegId(undefined)
            }
        }
    }, [])

    /** Builds the base registrations query (event-scoped) without any range. */
    const buildCasesQuery = useCallback((eventId: string) => {
        let query = supabase
            .from('registrations')
            .select(`
                id,
                event_id,
                full_name,
                email,
                case_number,
                case_status,
                current_step,
                created_at,
                updated_at,
                payment_status,
                documents,
                assigned_employee_id,
                additional_data,
                form_data,
                clients (employer_name),
                assigned_employee:users!registrations_assigned_employee_id_fkey (full_name, email),
                registration_events (
                    performed_by,
                    performed_by_name,
                    created_at,
                    users (full_name, email, avatar_url)
                )
            `, { count: 'exact' })
            .not('case_number', 'is', null)
            .order('created_at', { ascending: false })
            .order('created_at', { referencedTable: 'registration_events', ascending: false })

        if (eventId !== ALL_EVENTS_VALUE) {
            query = query.eq('event_id', eventId)
        }
        return query
    }, [supabase])

    const loadEventCases = useCallback(async (eventId: string) => {
        activeCasesRequest.current?.abort()
        const controller = new AbortController()
        activeCasesRequest.current = controller
        activeEventIdRef.current = eventId
        setLoading(true)
        try {
            const { data, count, error } = await buildCasesQuery(eventId)
                .range(0, PAGE_SIZE - 1)
                .abortSignal(controller.signal)
            if (error) throw error
            // Ignore the response if the user already switched to another event.
            if (activeEventIdRef.current !== eventId) return
            setCases((data as ApplicationCase[]) || [])
            setTotalCount(count ?? (data?.length ?? 0))
            setHasMore((data?.length ?? 0) === PAGE_SIZE)
        } catch (e) {
            if (controller.signal.aborted) return
            console.error(e); toast.error('Failed to load cases')
        } finally {
            if (activeCasesRequest.current === controller) {
                activeCasesRequest.current = null
                setLoading(false)
            }
        }
    }, [buildCasesQuery])

    /** Loads the next page and appends to the existing list. */
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return
        const eventId = selectedEventId
        setLoadingMore(true)
        try {
            const from = cases.length
            const to = from + PAGE_SIZE - 1
            const { data, error } = await buildCasesQuery(eventId).range(from, to)
            if (error) throw error
            // Bail if the user switched events while this request was in flight.
            if (activeEventIdRef.current !== eventId) return
            const next = (data as ApplicationCase[]) || []
            setCases((prev) => [...prev, ...next])
            setHasMore(next.length === PAGE_SIZE)
        } catch (e) {
            console.error(e); toast.error('Failed to load more cases')
        } finally {
            setLoadingMore(false)
        }
    }, [buildCasesQuery, cases.length, hasMore, loadingMore, selectedEventId])

    useEffect(() => {
        if (selectedEventId) void loadEventCases(selectedEventId)
        return () => activeCasesRequest.current?.abort()
    }, [selectedEventId, loadEventCases])

    const selectedEvent = useMemo(
        () => events.find((e) => e.id === selectedEventId),
        [events, selectedEventId],
    )

    const filteredCases = useMemo(() => {
        let result: ApplicationCase[] = cases
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            result = result.filter((c) =>
                [c.case_number, c.full_name, c.email, getEmployerName(c)]
                    .filter(Boolean).join(' ').toLowerCase().includes(q))
        }
        if (assignedFilter !== 'all') result = result.filter((c) => c.assigned_employee_id === assignedFilter)
        if (smartFilter === 'missing_documents') result = result.filter(hasMissingDocuments)
        if (smartFilter === 'awaiting_appointment') {
            // Only meaningful once the case has reached the Visa stage; otherwise
            // every early-stage record would be flagged as "awaiting appointment".
            result = result.filter((c) => {
                if (getMappedStep(c) < 4) return false
                const status = getAppointmentStatus(c)
                const hasDate = !!appointmentDate(c)
                return !['Booked', 'Completed'].includes(status) || !hasDate
            })
        }
        if (smartFilter === 'appointment_soon') result = result.filter((c) => {
            const date = appointmentDate(c)
            if (!date || Number.isNaN(date.getTime())) return false
            const days = (date.getTime() - Date.now()) / 86400000
            return days >= 0 && days <= 7
        })
        if (smartFilter === 'awaiting_payment') result = result.filter((c) => !['paid', 'completed'].includes(String(c.payment_status || '').toLowerCase()))
        if (smartFilter === 'updated_today') result = result.filter((c) => c.updated_at && new Date(c.updated_at).toDateString() === new Date().toDateString())
        if (smartFilter.startsWith('step_')) result = result.filter((c) => String(getMappedStep(c)) === smartFilter.slice(5))
        return result
    }, [cases, searchQuery, smartFilter, assignedFilter])

    const kpis = useMemo(() => {
        // `total` reflects the server-side count (accurate regardless of paging);
        // the status breakdowns are computed from the currently loaded subset.
        const completed = cases.filter((c) => ['completed', 'closed'].includes(c.case_status ?? '')).length
        const inProgress = cases.filter((c) => !['completed', 'closed', 'cancelled'].includes(c.case_status ?? '')).length
        const filesSent = cases.filter((c) => (c.additional_data as Record<string, unknown> | null)?.archive_status === 'Archived').length
        return { total: totalCount, completed, inProgress, filesSent }
    }, [cases, totalCount])

    function exportToCSV() {
        if (filteredCases.length === 0) { toast.error('No data to export'); return }
        const headers = ['Full Name', 'Application ID', 'Company', 'Overall Status', 'Created At']
        const rows = filteredCases.map((c) => [
            `"${sanitizeCsvCell(c.full_name || '')}"`,
            `"${sanitizeCsvCell(c.case_number || '')}"`,
            `"${sanitizeCsvCell(getEmployerName(c) || '')}"`,
            `"${sanitizeCsvCell(getOverallStatusLabel(c))}"`,
            `"${sanitizeCsvCell(c.created_at ? new Date(c.created_at).toLocaleDateString() : '')}"`,
        ].join(','))
        const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
        const link = document.createElement('a')
        link.href = encodeURI(csv)
        const eventPart = selectedEventId === ALL_EVENTS_VALUE
            ? 'all_events'
            : sanitizeFileName(selectedEvent?.title || 'event')
        link.download = `jaz_applications_${eventPart}.csv`
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        toast.success('Exported as CSV')
    }

    function openNewRegistration() { setShowWizard(true); setWizardStep(1); setWizardRegId(undefined) }
    function openStep(regId: string, step: number) { setWizardRegId(regId); setWizardStep(step); setShowWizard(true) }
    function openFile(c: ApplicationCase) { setWizardRegId(c.id); setWizardStep(getMappedStep(c)); setShowWizard(true) }

    /* Filter-active chip strip: collapses into a row above the list */
    const hasActiveFilters = smartFilter !== 'all' || assignedFilter !== 'all' || searchQuery.trim().length > 0

    if (showWizard) {
        return (
            <WizardClient
                events={events as unknown as RegistrationEvent[]} employees={employees} currentUser={currentUser}
                initialRegistrationId={wizardRegId} initialStep={wizardStep}
                onClose={() => { setShowWizard(false); if (selectedEventId) loadEventCases(selectedEventId) }}
            />
        )
    }

    return (
        <div className="jaz-apps-dashboard mx-auto flex max-w-7xl flex-col pb-12" dir="ltr">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    #jaz-print, #jaz-print * { visibility: visible !important; }
                    #jaz-print { position: absolute; inset: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}} />

            <div id="jaz-print" className="flex flex-col">
                {/* ====== Header ============================================== */}
                <header className="border-b border-[var(--jaz-line)] pb-4 pt-1">
                    <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight text-[var(--jaz-ink)] text-balance">
                        Applications
                    </h1>
                </div>
                        <Button onClick={openNewRegistration} size="sm" className="no-print shrink-0 gap-1.5">
                            <Plus className="size-4" strokeWidth={2.5} />
                            <span>New registration</span>
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col gap-3 border-b border-[var(--jaz-line)] py-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-2 lg:w-[340px]">
                        <label className="shrink-0 text-[11px] font-semibold text-[var(--jaz-muted)]">Event</label>
                        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                            <SelectTrigger className="h-10 min-w-0 flex-1 rounded-md border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[12.5px] font-medium text-[var(--jaz-ink)] focus:ring-[var(--jaz-sovereign)]/20">
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent className="border-[var(--jaz-line-strong)] shadow-lg">
                                <SelectGroup>
                                    <SelectItem value={ALL_EVENTS_VALUE} className="text-[13.5px]">All events</SelectItem>
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={e.id} className="text-[13.5px]">{eventLabel(e)}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                        <KpiPrimary value={kpis.total} label="Total cases" />
                        <KpiSecondary value={kpis.completed} label="Closed" accent="emerald" />
                        <KpiSecondary value={kpis.inProgress} label="Active" accent="amber" />
                        <KpiSecondary value={kpis.filesSent} label="Archived" accent="info" />
                    </div>
                </div>

                {/* ====== Filter bar ========================================== */}
                <div className="no-print flex flex-col gap-2 border-b border-[var(--jaz-line)] py-3 md:flex-row md:items-center">
                    <div className="relative md:max-w-xs flex-1">
                        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--jaz-whisper)] pointer-events-none" aria-hidden />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name, ID, or company"
                            aria-label="Search applications"
                            className="w-full bg-[var(--jaz-surface)] border border-[var(--jaz-line)] text-[var(--jaz-ink)] placeholder:text-[var(--jaz-whisper)] rounded-md pl-9 pr-3 h-9 text-[13px] focus:outline-none focus:border-[var(--jaz-sovereign)]/40 focus:ring-1 focus:ring-[var(--jaz-sovereign)]/20 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 flex-1 md:flex-none">
                        <Select value={smartFilter} onValueChange={setSmartFilter}>
                            <SelectTrigger className="bg-[var(--jaz-surface)] border-[var(--jaz-line)] text-[var(--jaz-ink-soft)] h-9 w-full md:w-[160px] text-[12.5px] rounded-md focus:ring-[var(--jaz-sovereign)]/20">
                                <SelectValue placeholder="Operational filter" />
                            </SelectTrigger>
                            <SelectContent className="border-[var(--jaz-line-strong)] shadow-lg">
                                <SelectGroup>
                                    <SelectItem value="all">All applications</SelectItem>
                                    <SelectItem value="missing_documents">Missing documents</SelectItem>
                                    <SelectItem value="awaiting_appointment">Awaiting appointment</SelectItem>
                                    <SelectItem value="appointment_soon">Appointment within 7 days</SelectItem>
                                    <SelectItem value="awaiting_payment">Awaiting payment</SelectItem>
                                    <SelectItem value="updated_today">Updated today</SelectItem>
                                    <SelectItem value="step_1">Stopped at Event</SelectItem>
                                    <SelectItem value="step_2">Stopped at Client</SelectItem>
                                    <SelectItem value="step_3">Stopped at Intake</SelectItem>
                                    <SelectItem value="step_4">Stopped at Visa</SelectItem>
                                    <SelectItem value="step_5">Stopped at Documents</SelectItem>
                                    <SelectItem value="step_6">Stopped at Payment</SelectItem>
                                    <SelectItem value="step_7">Stopped at Delivery</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                            <SelectTrigger className="bg-[var(--jaz-surface)] border-[var(--jaz-line)] text-[var(--jaz-ink-soft)] h-9 w-full md:w-[160px] text-[12.5px] rounded-md focus:ring-[var(--jaz-sovereign)]/20">
                                <SelectValue placeholder="Assigned member" />
                            </SelectTrigger>
                            <SelectContent className="border-[var(--jaz-line-strong)] shadow-lg">
                                <SelectGroup>
                                    <SelectItem value="all">All members</SelectItem>
                                    {employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.full_name || employee.email}</SelectItem>)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 md:ml-auto">
                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[12.5px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                            <Download className="size-3.5" aria-hidden />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* ====== Filter summary chip strip ============================ */}
                {(hasActiveFilters || hasMore) && !loading && (
                    <div className="flex flex-wrap items-center gap-2 pt-4 no-print">
                        <span className="text-[11px] text-[var(--jaz-muted)]">
                            {hasActiveFilters
                                ? `${filteredCases.length} of ${cases.length} loaded match`
                                : `Showing ${cases.length}${totalCount > cases.length ? ` of ${totalCount}` : ''}`}
                        </span>
                        {hasActiveFilters && (
                            <button
                                onClick={() => { setSearchQuery(''); setSmartFilter('all'); setAssignedFilter('all') }}
                                className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-[var(--jaz-line)] text-[10.5px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150"
                            >
                                Clear filters
                                <X className="size-3" aria-hidden />
                            </button>
                        )}
                    </div>
                )}

                {/* ====== Applications list =================================== */}
                <section
                    aria-label="Applications list"
                    className="mt-4"
                >
                    {loading ? (
                        <div className="overflow-hidden rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)]">
                            <SkeletonRows />
                        </div>
                    ) : filteredCases.length === 0 ? (
                        <EmptyState
                            hasAnyData={cases.length > 0}
                            onCreate={openNewRegistration}
                        />
                    ) : (
                        <div className="overflow-hidden rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)]">
                            <div className="hidden grid-cols-12 gap-3 border-b border-[var(--jaz-line)] bg-[var(--jaz-surface-2)]/65 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--jaz-muted)] md:grid">
                                <span className="col-span-3">Client & Case</span>
                                <span className="col-span-2">Status</span>
                                <span className="col-span-3">Current Stage</span>
                                <span className="col-span-2">Editors</span>
                                <span className="col-span-2 text-right">Action</span>
                            </div>
                            <ol className="divide-y divide-[var(--jaz-line)]" aria-label={`${filteredCases.length} applications`}>
                                {filteredCases.map((c) => (
                                    <li key={c.id}>
                                        <CaseRow c={c} onStepClick={openStep} onOpenFile={openFile} />
                                    </li>
                                ))}
                            </ol>
                            {hasMore && (
                                <div className="flex items-center justify-center gap-3 border-t border-[var(--jaz-line)] px-5 py-3 no-print">
                                    <span className="text-[11px] text-[var(--jaz-muted)]">
                                        {cases.length} loaded of {totalCount}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="h-8 gap-1.5"
                                    >
                                        {loadingMore ? 'Loading…' : 'Load more'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Empty state — teaches the interface, not “nothing here.”          */
/* ------------------------------------------------------------------ */

function EmptyState({ hasAnyData, onCreate }: { hasAnyData: boolean; onCreate: () => void }) {
    return (
        <div
            className="flex flex-col items-center justify-center px-4 py-20 sm:py-28 text-center bg-[var(--jaz-surface)] border border-dashed border-[var(--jaz-line-strong)] rounded-md"
            role="status"
        >
            <div className="flex flex-col items-center gap-5 max-w-sm">
                <div className="size-12 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center">
                    <FolderKanban className="size-5 text-[var(--jaz-muted)]" aria-hidden />
                </div>
                <div className="flex flex-col gap-1.5">
                    <h2 className="jaz-title text-[var(--jaz-ink)]">
                        {hasAnyData ? 'No matches with these filters' : 'No applications yet'}
                    </h2>
                    <p className="text-[13px] leading-relaxed text-[var(--jaz-muted)]">
                        {hasAnyData
                            ? 'Adjust the search or filters above to see more results.'
                            : 'Create the first case to begin tracking a client through the seven-stage registration workflow.'}
                    </p>
                </div>
                {!hasAnyData && (
                    <Button onClick={onCreate} className="mt-1 gap-2">
                        <Plus className="size-4" strokeWidth={2.5} />
                        New registration
                    </Button>
                )}
            </div>
        </div>
    )
}
