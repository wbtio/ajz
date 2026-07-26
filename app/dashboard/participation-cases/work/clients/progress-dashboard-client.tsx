'use client'

import { useState, useEffect, useMemo, useCallback, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
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
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CircleUserRound,
  Download,
  FolderKanban,
  Mars,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Venus,
  X,
} from 'lucide-react'
import {
  ALL_EVENTS_VALUE,
  PAGE_SIZE,
  getApplicantSex,
  getEmployerName,
  type ApplicationRow,
  type ApplicationStats,
  type SortKey,
} from './application-query'
import { bulkAssignApplications, bulkUpdateCaseStatus, fetchApplications, fetchApplicationsForExport } from './actions'

/* ------------------------------------------------------------------ */
/*  Step model                                                        */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 1, label: 'Event' },
  { id: 2, label: 'Client' },
  { id: 3, label: 'Intake' },
  { id: 4, label: 'Visa' },
  { id: 5, label: 'Docs' },
  { id: 6, label: 'Pay' },
  { id: 7, label: 'Delivery' },
] as const

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

function getMappedStep(row: ApplicationRow): number {
  const storedStep = Number(row.current_step)
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

/** Cancelled cases used to render as blue "In Progress" because the map had no entry for them. */
function getOverallStatusLabel(row: ApplicationRow): string {
  switch (row.case_status) {
    case 'completed':
    case 'closed': return 'Closed'
    case 'cancelled': return 'Cancelled'
    case 'ready_for_next_stage': return 'Ready to Send'
    case 'new_request': return 'Pending'
    default: return 'In Progress'
  }
}

/* ------------------------------------------------------------------ */
/*  Status pill                                                       */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { fg: string; bg: string; dot: string; border: string }> = {
    'Closed': {
      fg: 'text-[var(--jaz-emerald)]',
      bg: 'bg-[var(--jaz-emerald-soft)]',
      dot: 'bg-[var(--jaz-emerald)]',
      border: 'border-transparent',
    },
    'Cancelled': {
      fg: 'text-rose-700',
      bg: 'bg-rose-50',
      dot: 'bg-rose-500',
      border: 'border-rose-100',
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
  const variant = map[status] ?? map['In Progress']
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] border',
        variant.fg,
        variant.bg,
        variant.border,
      )}
    >
      <span className={cn('size-1.5 rounded-full', variant.dot)} aria-hidden />
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
              step.id < mappedStep && 'bg-[var(--jaz-sovereign)]/55',
              step.id === mappedStep && 'bg-[var(--jaz-sovereign)]',
              step.id > mappedStep && 'bg-[var(--jaz-line-strong)]',
            )}
          />
        ))}
      </div>
      <span className="min-w-0 truncate text-[11px] font-medium text-[var(--jaz-ink-soft)]">
        {currentStep?.label} <span className="text-[var(--jaz-whisper)]">{mappedStep}/7</span>
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

function ApplicationEditors({ events }: { events?: ApplicationRow['registration_events'] }) {
  const editors = useMemo(() => {
    const uniqueEditors = new Map<string, { id: string; name: string; avatarUrl: string | null }>()

    for (const event of events || []) {
      const user = Array.isArray(event.users) ? event.users[0] : event.users
      const editorKey = event.performed_by || (event.performed_by_name ? `staff:${event.performed_by_name}` : null)
      if (!editorKey || uniqueEditors.has(editorKey)) continue

      uniqueEditors.set(editorKey, {
        id: editorKey,
        name: user?.full_name || event.performed_by_name || user?.email || 'Staff member',
        avatarUrl: user?.avatar_url || null,
      })
    }

    return Array.from(uniqueEditors.values())
  }, [events])

  if (editors.length === 0) {
    return <span className="text-[11px] text-[var(--jaz-whisper)]" aria-label="No recorded editors">—</span>
  }

  const visibleEditors = editors.slice(0, 3)
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
/*  Case row                                                          */
/* ------------------------------------------------------------------ */

function CaseRow({ row, eventName, selected, onToggleSelect, onStepClick, onOpenFile }: {
  row: ApplicationRow
  eventName: string
  selected: boolean
  onToggleSelect: (id: string) => void
  onStepClick: (regId: string, step: number) => void
  onOpenFile: (row: ApplicationRow) => void
}) {
  const mappedStep = getMappedStep(row)
  const overallStatus = getOverallStatusLabel(row)
  const assignee = row.assigned_employee?.full_name || row.assigned_employee?.email || null

  return (
    <div className={cn('group transition-colors duration-150', selected ? 'bg-[var(--jaz-sovereign)]/[0.04]' : 'bg-[var(--jaz-surface)] hover:bg-[var(--jaz-surface-2)]/55')}>
      <div className="grid min-h-16 grid-cols-12 items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-5">
        <div className="col-span-9 flex min-w-0 items-center gap-2.5 md:col-span-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(row.id)}
            aria-label={`Select application for ${row.full_name || 'client'}`}
            className="size-4 shrink-0 accent-[var(--jaz-sovereign)] no-print"
          />
          <div
            aria-hidden
            className="size-9 shrink-0 rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] flex items-center justify-center text-[var(--jaz-ink-soft)]"
          >
            {renderGenderIcon(getApplicantSex(row))}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-2">
              <h3 className="truncate text-[13px] font-semibold leading-tight text-[var(--jaz-ink)]">
                {row.full_name || 'Unnamed Client'}
              </h3>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <span className="jaz-mono shrink-0 text-[11px] font-medium text-[var(--jaz-muted)]">
                {row.case_number || '—'}
              </span>
              {getEmployerName(row) && (
                <span className="truncate text-[11px] text-[var(--jaz-whisper)]" title={getEmployerName(row) || ''}>
                  · {getEmployerName(row)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event column: previously there was no way to tell which event a case
            belonged to while "All events" was selected. */}
        <div className="col-span-6 min-w-0 md:col-span-2">
          <span className="block truncate text-[11.5px] text-[var(--jaz-ink-soft)]" title={eventName}>{eventName || '—'}</span>
          <span className="block text-[10.5px] text-[var(--jaz-whisper)]">{formatEventDate(row.updated_at)}</span>
        </div>

        <div className="col-span-6 flex justify-end md:col-span-1 md:justify-start">
          <StatusPill status={overallStatus} />
        </div>

        <div className="col-span-12 md:col-span-2">
          <StageProgress mappedStep={mappedStep} onStepClick={(step) => onStepClick(row.id, step)} />
        </div>

        {/* Assigned member column: the filter existed but the value was never shown. */}
        <div className="col-span-6 min-w-0 md:col-span-1">
          <span className="block truncate text-[11.5px] text-[var(--jaz-ink-soft)]" title={assignee || ''}>
            {assignee || <span className="text-[var(--jaz-whisper)]">Unassigned</span>}
          </span>
        </div>

        <div className="col-span-3 flex items-center md:col-span-1">
          <ApplicationEditors events={row.registration_events} />
        </div>

        <div className="col-span-3 flex items-center justify-end gap-0.5 md:col-span-2 no-print">
          <Link
            href={`/dashboard/participation-cases/work/clients/${row.id}`}
            aria-label={`View details for ${row.full_name || 'client'}`}
            title="Application details"
            className="inline-flex h-8 items-center rounded-md px-2 text-[11px] font-semibold text-[var(--jaz-ink-soft)] hover:bg-[var(--jaz-surface-2)] hover:text-[var(--jaz-sovereign)]"
          >
            Details
          </Link>
          <Link
            href={`/dashboard/participation-cases/work/clients/${row.id}/ai-review`}
            aria-label={`Review application for ${row.full_name || 'client'} with AI`}
            title="AI review"
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-[var(--jaz-sovereign)] hover:bg-red-50"
          >
            <FolderKanban className="size-3.5" aria-hidden />
            <span className="hidden xl:inline">AI Review</span>
          </Link>
          <button
            onClick={() => onOpenFile(row)}
            aria-label={`Open file for ${row.full_name || 'client'}`}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5',
              'text-[12px] font-medium',
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
/*  KPI blocks                                                        */
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

/**
 * Prevents CSV formula injection. Excel/LibreOffice will execute a cell as a
 * formula if it starts with =, +, -, @, a tab, or a carriage return.
 */
function sanitizeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""')
  if (/^[=+\-@\t\r]/.test(escaped)) return `'${escaped}`
  return escaped
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim() || 'event'
}

/* ------------------------------------------------------------------ */
/*  Skeleton rows                                                     */
/* ------------------------------------------------------------------ */

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
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
          </div>
        </div>
      ))}
    </>
  )
}

const SMART_FILTERS: [string, string][] = [
  ['all', 'All applications'],
  ['missing_documents', 'Missing documents'],
  ['awaiting_appointment', 'Awaiting appointment'],
  ['appointment_soon', 'Appointment within 7 days'],
  ['awaiting_payment', 'Awaiting payment'],
  ['updated_today', 'Updated today'],
  ['closed', 'Closed'],
  ['archived', 'Archived'],
  ['step_1', 'Stopped at Event'],
  ['step_2', 'Stopped at Client'],
  ['step_3', 'Stopped at Intake'],
  ['step_4', 'Stopped at Visa'],
  ['step_5', 'Stopped at Documents'],
  ['step_6', 'Stopped at Payment'],
  ['step_7', 'Stopped at Delivery'],
]

const SORT_OPTIONS: [SortKey, string][] = [
  ['created_at', 'Created date'],
  ['updated_at', 'Last updated'],
  ['full_name', 'Client name'],
  ['case_number', 'Application ID'],
  ['current_step', 'Stage'],
]

/** Debounce so typing in the search box does not fire a request per keystroke. */
function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

export function ProgressDashboardClient({ events, employees, currentUser }: ProgressDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedEventId, setSelectedEventId] = useState(ALL_EVENTS_VALUE)
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, closed: 0, active: 0, archived: 0 })
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, startRefresh] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [smartFilter, setSmartFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortAscending, setSortAscending] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [bulkPending, setBulkPending] = useState(false)

  const [showWizard, setShowWizard] = useState(false)
  const [wizardRegId, setWizardRegId] = useState<string | undefined>()
  const [wizardStep, setWizardStep] = useState<number>(1)

  const debouncedSearch = useDebounced(searchQuery, 350)
  const requestIdRef = useRef(0)

  const eventNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const event of events) map.set(event.id, event.title_ar || event.title)
    return map
  }, [events])

  /**
   * Deep links are read reactively. The previous version parsed
   * `window.location.search` once on mount, so a notification link opened while
   * already on this page did nothing.
   */
  useEffect(() => {
    const registrationId = searchParams.get('registrationId')
    const requestedStep = Number(searchParams.get('step'))
    if (registrationId) {
      setShowWizard(true)
      setWizardRegId(registrationId)
      setWizardStep(Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 7 ? requestedStep : 4)
    } else if (searchParams.get('action') === 'new') {
      setShowWizard(true)
      setWizardStep(1)
      setWizardRegId(undefined)
    } else {
      setShowWizard(false)
    }
  }, [searchParams])

  const query = useMemo(
    () => ({
      eventId: selectedEventId,
      search: debouncedSearch,
      smartFilter,
      assignedFilter,
      sortKey,
      sortAscending,
      page,
    }),
    [selectedEventId, debouncedSearch, smartFilter, assignedFilter, sortKey, sortAscending, page],
  )

  const loadApplications = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    const result = await fetchApplications(query)
    // Ignore a stale response if the filters changed while it was in flight.
    if (requestId !== requestIdRef.current) return
    if (result.error) {
      toast.error('Failed to load applications')
    } else {
      setRows(result.rows)
      setStats(result.stats)
      setFilteredTotal(result.filteredTotal)
    }
    setLoading(false)
  }, [query])

  useEffect(() => {
    void loadApplications()
  }, [loadApplications])

  // Reset paging whenever the result set itself changes.
  useEffect(() => {
    setPage(0)
    setSelectedIds([])
  }, [selectedEventId, debouncedSearch, smartFilter, assignedFilter, sortKey, sortAscending])

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  )

  const hasActiveFilters = smartFilter !== 'all' || assignedFilter !== 'all' || searchQuery.trim().length > 0
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE))
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id))

  function toggleSelect(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((current) => {
      if (allOnPageSelected) return current.filter((id) => !rows.some((row) => row.id === id))
      const pageIds = rows.map((row) => row.id)
      return Array.from(new Set([...current, ...pageIds]))
    })
  }

  /** Exports every matching row, not just the page currently on screen. */
  async function exportToCSV() {
    setIsExporting(true)
    try {
      const { rows: exportRows, error } = await fetchApplicationsForExport({
        eventId: selectedEventId,
        search: debouncedSearch,
        smartFilter,
        assignedFilter,
        sortKey,
        sortAscending,
      })
      if (error) throw new Error(error)
      if (exportRows.length === 0) {
        toast.error('No data to export')
        return
      }

      const headers = [
        'Full Name',
        'Application ID',
        'Company',
        'Email',
        'Event',
        'Status',
        'Current Stage',
        'Payment Status',
        'Assigned Member',
        'Visa Appointment',
        'Created At',
        'Last Updated',
      ]
      const csvRows = exportRows.map((row) => {
        const additional = (row.additional_data ?? {}) as Record<string, unknown>
        const appointment = [additional.visa_appointment_date, additional.visa_appointment_time].filter(Boolean).join(' ')
        return [
          row.full_name || '',
          row.case_number || '',
          getEmployerName(row) || '',
          row.email || '',
          eventNameById.get(row.event_id) || '',
          getOverallStatusLabel(row),
          `${getMappedStep(row)}/7 ${STEPS[getMappedStep(row) - 1]?.label ?? ''}`,
          row.payment_status || '',
          row.assigned_employee?.full_name || row.assigned_employee?.email || '',
          String(appointment),
          row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '',
          row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-GB') : '',
        ]
          .map((cell) => `"${sanitizeCsvCell(String(cell))}"`)
          .join(',')
      })

      const csv = '﻿' + [headers.join(','), ...csvRows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      const eventPart = selectedEventId === ALL_EVENTS_VALUE ? 'all_events' : sanitizeFileName(selectedEvent?.title || 'event')
      link.download = `jaz_applications_${eventPart}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
      toast.success(`Exported ${exportRows.length} applications`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  async function runBulkAssign(employeeId: string) {
    setBulkPending(true)
    const result = await bulkAssignApplications(selectedIds, employeeId === 'none' ? null : employeeId)
    setBulkPending(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Updated ${selectedIds.length} applications`)
    setSelectedIds([])
    void loadApplications()
  }

  async function runBulkStatus(status: string) {
    const labels: Record<string, string> = { completed: 'Close', cancelled: 'Cancel' }
    if (!window.confirm(`${labels[status] || 'Update'} ${selectedIds.length} applications?`)) return
    setBulkPending(true)
    const result = await bulkUpdateCaseStatus(selectedIds, status)
    setBulkPending(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Updated ${selectedIds.length} applications`)
    setSelectedIds([])
    void loadApplications()
  }

  function openNewRegistration() {
    setShowWizard(true)
    setWizardStep(1)
    setWizardRegId(undefined)
  }

  function openStep(regId: string, step: number) {
    setWizardRegId(regId)
    setWizardStep(step)
    setShowWizard(true)
  }

  function openFile(row: ApplicationRow) {
    setWizardRegId(row.id)
    setWizardStep(getMappedStep(row))
    setShowWizard(true)
  }

  function closeWizard() {
    setShowWizard(false)
    // Clear the deep-link params, otherwise a refresh reopens the same case.
    if (searchParams.toString()) router.replace('/dashboard/participation-cases/work/clients')
    void loadApplications()
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAscending((current) => !current)
    else {
      setSortKey(key)
      setSortAscending(key === 'full_name' || key === 'case_number')
    }
  }

  if (showWizard) {
    return (
      <WizardClient
        events={events as unknown as RegistrationEvent[]}
        employees={employees}
        currentUser={currentUser}
        initialRegistrationId={wizardRegId}
        initialStep={wizardStep}
        onClose={closeWizard}
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
              <h1 className="text-xl font-bold tracking-tight text-[var(--jaz-ink)] text-balance">Applications</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startRefresh(() => { void loadApplications() })}
                disabled={isRefreshing || loading}
                className="gap-1.5"
                aria-label="Refresh list"
              >
                <RefreshCw className={cn('size-4', (isRefreshing || loading) && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button onClick={openNewRegistration} size="sm" className="shrink-0 gap-1.5">
                <Plus className="size-4" strokeWidth={2.5} />
                <span>New registration</span>
              </Button>
            </div>
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
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id} className="text-[13.5px]">{eventLabel(event)}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* All four counts are server-side and reflect the active filters. */}
          <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
            <KpiPrimary value={stats.total} label="Total cases" />
            <KpiSecondary value={stats.closed} label="Closed" accent="emerald" />
            <KpiSecondary value={stats.active} label="Active" accent="amber" />
            <KpiSecondary value={stats.archived} label="Archived" accent="info" />
          </div>
        </div>

        {/* ====== Filter bar ========================================== */}
        <div className="no-print flex flex-col gap-2 border-b border-[var(--jaz-line)] py-3 md:flex-row md:items-center">
          <div className="relative md:max-w-xs flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--jaz-whisper)] pointer-events-none" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, ID, or company"
              aria-label="Search applications"
              className="w-full bg-[var(--jaz-surface)] border border-[var(--jaz-line)] text-[var(--jaz-ink)] placeholder:text-[var(--jaz-whisper)] rounded-md pl-9 pr-3 h-9 text-[13px] focus:outline-none focus:border-[var(--jaz-sovereign)]/40 focus:ring-1 focus:ring-[var(--jaz-sovereign)]/20 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-1 md:flex-none">
            <Select value={smartFilter} onValueChange={setSmartFilter}>
              <SelectTrigger className="bg-[var(--jaz-surface)] border-[var(--jaz-line)] text-[var(--jaz-ink-soft)] h-9 w-full md:w-[170px] text-[12.5px] rounded-md focus:ring-[var(--jaz-sovereign)]/20">
                <SelectValue placeholder="Operational filter" />
              </SelectTrigger>
              <SelectContent className="border-[var(--jaz-line-strong)] shadow-lg">
                <SelectGroup>
                  {SMART_FILTERS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
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
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>{employee.full_name || employee.email}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(value) => toggleSort(value as SortKey)}>
              <SelectTrigger className="bg-[var(--jaz-surface)] border-[var(--jaz-line)] text-[var(--jaz-ink-soft)] h-9 w-full md:w-[150px] text-[12.5px] rounded-md focus:ring-[var(--jaz-sovereign)]/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-[var(--jaz-line-strong)] shadow-lg">
                <SelectGroup>
                  {SORT_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setSortAscending((current) => !current)}
              aria-label={sortAscending ? 'Sort descending' : 'Sort ascending'}
              title={sortAscending ? 'Ascending' : 'Descending'}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] px-2.5 text-[12.5px] text-[var(--jaz-ink-soft)] hover:border-[var(--jaz-sovereign)]/30 hover:text-[var(--jaz-sovereign)]"
            >
              {sortAscending ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[12.5px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150"
            >
              <Printer className="size-3.5" aria-hidden />
              <span className="hidden lg:inline">Print</span>
            </button>
            <button
              onClick={() => void exportToCSV()}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[12.5px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <Download className="size-3.5" aria-hidden />
              <span>{isExporting ? 'Exporting…' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* ====== Bulk action bar ===================================== */}
        {selectedIds.length > 0 && (
          <div className="no-print mt-3 flex flex-wrap items-center gap-2 rounded-md border border-[var(--jaz-sovereign)]/20 bg-[var(--jaz-sovereign)]/[0.04] px-3 py-2">
            <span className="text-[12px] font-semibold text-[var(--jaz-ink)]">{selectedIds.length} selected</span>
            <Select onValueChange={(value) => void runBulkAssign(value)} disabled={bulkPending}>
              <SelectTrigger className="h-8 w-[190px] bg-white text-[12px]">
                <SelectValue placeholder="Assign to member" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Clear assignment</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>{employee.full_name || employee.email}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={bulkPending} onClick={() => void runBulkStatus('completed')} className="h-8 text-[12px]">
              Close selected
            </Button>
            <Button variant="outline" size="sm" disabled={bulkPending} onClick={() => void runBulkStatus('cancelled')} className="h-8 text-[12px] text-rose-700 hover:text-rose-800">
              Cancel selected
            </Button>
            <button onClick={() => setSelectedIds([])} className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)]">
              Clear selection <X className="size-3" />
            </button>
          </div>
        )}

        {/* ====== Filter summary ====================================== */}
        {!loading && (
          <div className="flex flex-wrap items-center gap-2 pt-4 no-print">
            <span className="text-[11px] text-[var(--jaz-muted)]">
              {filteredTotal === 0
                ? 'No results'
                : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filteredTotal)} of ${filteredTotal}`}
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
        <section aria-label="Applications list" className="mt-4">
          {loading ? (
            <div className="overflow-hidden rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)]">
              <SkeletonRows />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onCreate={openNewRegistration} />
          ) : (
            <div className="overflow-hidden rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)]">
              <div className="hidden grid-cols-12 items-center gap-3 border-b border-[var(--jaz-line)] bg-[var(--jaz-surface-2)]/65 px-5 py-2 text-[10px] font-semibold tracking-[0.02em] text-[var(--jaz-muted)] md:grid">
                <span className="col-span-3 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all applications on this page"
                    className="size-4 accent-[var(--jaz-sovereign)] no-print"
                  />
                  <SortableHeader label="Client & Case" sortKey="full_name" activeKey={sortKey} ascending={sortAscending} onSort={toggleSort} />
                </span>
                <span className="col-span-2">
                  <SortableHeader label="Event / Updated" sortKey="updated_at" activeKey={sortKey} ascending={sortAscending} onSort={toggleSort} />
                </span>
                <span className="col-span-1">Status</span>
                <span className="col-span-2">
                  <SortableHeader label="Stage" sortKey="current_step" activeKey={sortKey} ascending={sortAscending} onSort={toggleSort} />
                </span>
                <span className="col-span-1">Assignee</span>
                <span className="col-span-1">Editors</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>
              <ol className="divide-y divide-[var(--jaz-line)]" aria-label={`${rows.length} applications`}>
                {rows.map((row) => (
                  <li key={row.id}>
                    <CaseRow
                      row={row}
                      eventName={eventNameById.get(row.event_id) || ''}
                      selected={selectedIds.includes(row.id)}
                      onToggleSelect={toggleSelect}
                      onStepClick={openStep}
                      onOpenFile={openFile}
                    />
                  </li>
                ))}
              </ol>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 border-t border-[var(--jaz-line)] px-5 py-3 no-print">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="h-8">
                    Previous
                  </Button>
                  <span className="text-[11px] text-[var(--jaz-muted)]">Page {page + 1} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)} className="h-8">
                    Next
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

function SortableHeader({ label, sortKey, activeKey, ascending, onSort }: {
  label: string
  sortKey: SortKey
  activeKey: SortKey
  ascending: boolean
  onSort: (key: SortKey) => void
}) {
  const isActive = activeKey === sortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn('inline-flex items-center gap-1 transition-colors hover:text-[var(--jaz-sovereign)]', isActive && 'text-[var(--jaz-sovereign)]')}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive && (ascending ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
    </button>
  )
}

function EmptyState({ hasFilters, onCreate }: { hasFilters: boolean; onCreate: () => void }) {
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
            {hasFilters ? 'No matches with these filters' : 'No applications yet'}
          </h2>
          <p className="text-[13px] leading-relaxed text-[var(--jaz-muted)]">
            {hasFilters
              ? 'Adjust the search or filters above to see more results.'
              : 'Create the first case to begin tracking a client through the seven-stage registration workflow.'}
          </p>
        </div>
        {!hasFilters && (
          <Button onClick={onCreate} className="mt-1 gap-2">
            <Plus className="size-4" strokeWidth={2.5} />
            New registration
          </Button>
        )}
      </div>
    </div>
  )
}
