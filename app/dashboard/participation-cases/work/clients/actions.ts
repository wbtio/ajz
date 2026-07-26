'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Query layer for the Applications list.
 *
 * Search, filters, sorting and the KPI counts all used to run in the browser
 * over whichever 50 rows happened to be loaded, while the "Total cases" badge
 * showed a server-side count. Searching for a client who sat on page 5 simply
 * returned nothing. Everything below now runs against the full result set.
 */

import { createClient } from '@/lib/supabase/server'
import { canAccessPath } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import {
  ALL_EVENTS_VALUE,
  PAGE_SIZE,
  type ApplicationQuery,
  type ApplicationRow,
  type ApplicationStats,
  type SortKey,
} from './application-query'

const LIST_PATH = '/dashboard/participation-cases/work/clients'

/** Document types a complete visa file must contain, with their legacy aliases. */
const REQUIRED_DOCUMENT_TYPES = [
  ['passport_copy', 'passport'],
  ['visa_application_form'],
  ['invitation', 'invitation_letter'],
  ['appointment_confirmation', 'tls_appointment'],
  ['insurance', 'travel_insurance'],
]

const SELECT_COLUMNS = `
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
  client_snapshot,
  clients (employer_name, sex),
  assigned_employee:users!registrations_assigned_employee_id_fkey (full_name, email),
  registration_events (
    performed_by,
    performed_by_name,
    created_at,
    users (full_name, email, avatar_url)
  )
`

/** Filters that a JS pass has to evaluate because they depend on JSONB contents. */
const JS_ONLY_FILTERS = new Set(['missing_documents', 'awaiting_appointment'])

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, profile: null, authorized: false as const }

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, role, permissions')
    .eq('id', user.id)
    .single()

  const authorized =
    (profile?.role === 'admin' || profile?.role === 'team') &&
    canAccessPath(profile?.role, LIST_PATH, profile?.permissions as string[] | null)

  return { supabase, profile, authorized }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function applySqlFilters(query: any, params: Pick<ApplicationQuery, 'eventId' | 'search' | 'smartFilter' | 'assignedFilter'>) {
  let next = query.not('case_number', 'is', null)

  if (params.eventId !== ALL_EVENTS_VALUE) next = next.eq('event_id', params.eventId)
  if (params.assignedFilter !== 'all') next = next.eq('assigned_employee_id', params.assignedFilter)

  const search = params.search.trim()
  if (search) {
    // PostgREST cannot OR across an embedded table and the parent in one
    // expression, so company matching uses the per-application snapshot the
    // wizard writes on every save rather than the shared client row.
    const pattern = `%${search.replace(/[%,()]/g, '')}%`
    next = next.or(
      [
        `full_name.ilike.${pattern}`,
        `case_number.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `client_snapshot->>company_name.ilike.${pattern}`,
      ].join(','),
    )
  }

  const filter = params.smartFilter
  if (filter.startsWith('step_')) {
    next = next.eq('current_step', Number(filter.slice(5)) || 1)
  } else if (filter === 'awaiting_payment') {
    next = next.not('payment_status', 'in', '("paid","completed")')
  } else if (filter === 'updated_today') {
    next = next.gte('updated_at', `${todayIsoDate()}T00:00:00`)
  } else if (filter === 'appointment_soon') {
    const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    next = next
      .gte('additional_data->>visa_appointment_date', todayIsoDate())
      .lte('additional_data->>visa_appointment_date', inSevenDays)
  } else if (filter === 'archived') {
    next = next.not('additional_data->>receipt_archived_at', 'is', null)
  } else if (filter === 'closed') {
    next = next.in('case_status', ['completed', 'closed'])
  }

  return next
}

function hasMissingDocuments(row: Pick<ApplicationRow, 'documents'>) {
  const documents = Array.isArray(row.documents) ? row.documents : []
  return REQUIRED_DOCUMENT_TYPES.some((aliases) => !documents.some((doc: any) => aliases.includes(String(doc?.type || ''))))
}

function isAwaitingAppointment(row: Pick<ApplicationRow, 'current_step' | 'additional_data'>) {
  // Only meaningful once the case has reached the visa stage; otherwise every
  // early-stage record would be flagged.
  if (Number(row.current_step) < 4) return false
  const additional = (row.additional_data ?? {}) as Record<string, unknown>
  const status = String(additional.visa_appointment_status ?? '')
  const hasDate = Boolean(additional.visa_appointment_date)
  return !['Booked', 'Completed'].includes(status) || !hasDate
}

function matchesJsFilter(row: ApplicationRow, smartFilter: string) {
  if (smartFilter === 'missing_documents') return hasMissingDocuments(row)
  if (smartFilter === 'awaiting_appointment') return isAwaitingAppointment(row)
  return true
}

function sortRows(rows: ApplicationRow[], sortKey: SortKey, ascending: boolean) {
  const direction = ascending ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = a[sortKey]
    const right = b[sortKey]
    if (sortKey === 'current_step') return ((Number(left) || 0) - (Number(right) || 0)) * direction
    return String(left ?? '').localeCompare(String(right ?? '')) * direction
  })
}

/**
 * Returns one page of applications plus the accurate totals for the same
 * filters. `filteredTotal` counts every matching row, not just loaded ones.
 */
export async function fetchApplications(params: ApplicationQuery): Promise<{
  error: string | null
  rows: ApplicationRow[]
  filteredTotal: number
  stats: ApplicationStats
}> {
  const empty = { rows: [] as ApplicationRow[], filteredTotal: 0, stats: { total: 0, closed: 0, active: 0, archived: 0 } }
  const { supabase, authorized } = await requireStaff()
  if (!authorized) return { error: 'Unauthorized', ...empty }

  const needsJsPass = JS_ONLY_FILTERS.has(params.smartFilter)
  const from = Math.max(0, params.page) * PAGE_SIZE

  try {
    if (needsJsPass) {
      // These two filters depend on the shape of JSONB payloads, so the rows
      // are narrowed in SQL first and then evaluated in memory.
      const { data, error } = await applySqlFilters(supabase.from('registrations').select(SELECT_COLUMNS), params)
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'registration_events', ascending: false })
        .limit(2000)
      if (error) throw error

      const matching = ((data || []) as unknown as ApplicationRow[]).filter((row) => matchesJsFilter(row, params.smartFilter))
      const sorted = sortRows(matching, params.sortKey, params.sortAscending)
      return {
        error: null,
        rows: sorted.slice(from, from + PAGE_SIZE),
        filteredTotal: matching.length,
        stats: await fetchStats(supabase, params, matching),
      }
    }

    const { data, count, error } = await applySqlFilters(
      supabase.from('registrations').select(SELECT_COLUMNS, { count: 'exact' }),
      params,
    )
      .order(params.sortKey, { ascending: params.sortAscending })
      .order('created_at', { referencedTable: 'registration_events', ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error

    return {
      error: null,
      rows: (data || []) as unknown as ApplicationRow[],
      filteredTotal: count ?? (data?.length ?? 0),
      stats: await fetchStats(supabase, params),
    }
  } catch (error) {
    console.error('fetchApplications failed:', error)
    return { error: error instanceof Error ? error.message : 'Could not load the applications', ...empty }
  }
}

/**
 * KPI counts for the current filters. These are head-only count queries, so
 * they stay accurate no matter how many rows the table has loaded — the
 * previous version derived them from the visible page.
 */
async function fetchStats(supabase: any, params: ApplicationQuery, preFiltered?: ApplicationRow[]): Promise<ApplicationStats> {
  if (preFiltered) {
    return {
      total: preFiltered.length,
      closed: preFiltered.filter((row) => ['completed', 'closed'].includes(row.case_status ?? '')).length,
      active: preFiltered.filter((row) => !['completed', 'closed', 'cancelled'].includes(row.case_status ?? '')).length,
      archived: preFiltered.filter((row) => Boolean((row.additional_data as any)?.receipt_archived_at)).length,
    }
  }

  const base = () => applySqlFilters(supabase.from('registrations').select('id', { count: 'exact', head: true }), params)

  const [total, closed, active, archived] = await Promise.all([
    base(),
    base().in('case_status', ['completed', 'closed']),
    base().not('case_status', 'in', '("completed","closed","cancelled")'),
    // The old KPI read `archive_status`, a key nothing in the codebase writes.
    base().not('additional_data->>receipt_archived_at', 'is', null),
  ])

  return {
    total: total.count ?? 0,
    closed: closed.count ?? 0,
    active: active.count ?? 0,
    archived: archived.count ?? 0,
  }
}

/** Every matching row, for a CSV export that is not limited to the loaded page. */
export async function fetchApplicationsForExport(params: Omit<ApplicationQuery, 'page'>): Promise<{
  error: string | null
  rows: ApplicationRow[]
}> {
  const { supabase, authorized } = await requireStaff()
  if (!authorized) return { error: 'Unauthorized', rows: [] }

  try {
    const { data, error } = await applySqlFilters(supabase.from('registrations').select(SELECT_COLUMNS), params)
      .order(params.sortKey, { ascending: params.sortAscending })
      .limit(5000)
    if (error) throw error

    const rows = ((data || []) as unknown as ApplicationRow[]).filter((row) => matchesJsFilter(row, params.smartFilter))
    return { error: null, rows: sortRows(rows, params.sortKey, params.sortAscending) }
  } catch (error) {
    console.error('fetchApplicationsForExport failed:', error)
    return { error: error instanceof Error ? error.message : 'Could not export the applications', rows: [] }
  }
}

/** Reassigns several applications to one staff member in a single action. */
export async function bulkAssignApplications(ids: string[], employeeId: string | null) {
  const { supabase, profile, authorized } = await requireStaff()
  if (!authorized) return { error: 'Unauthorized' }
  if (ids.length === 0) return { error: 'No applications selected' }

  const { error } = await supabase
    .from('registrations')
    .update({ assigned_employee_id: employeeId, updated_at: new Date().toISOString() })
    .in('id', ids)
  if (error) return { error: error.message }

  await supabase.from('registration_events').insert(
    ids.map((id) => ({
      registration_id: id,
      action: 'assignment_changed',
      description: employeeId ? 'Assigned through a bulk action.' : 'Assignment cleared through a bulk action.',
      performed_by: profile?.id ?? null,
      performed_by_name: profile?.full_name || profile?.email || 'Staff',
    })),
  )

  revalidatePath(LIST_PATH)
  return { error: null }
}

/** Bulk status change, used for closing or cancelling a batch of applications. */
export async function bulkUpdateCaseStatus(ids: string[], caseStatus: string) {
  const { supabase, profile, authorized } = await requireStaff()
  if (!authorized) return { error: 'Unauthorized' }
  if (ids.length === 0) return { error: 'No applications selected' }
  if (!['completed', 'cancelled', 'ready_for_next_stage', 'new_request'].includes(caseStatus)) {
    return { error: 'Unsupported status' }
  }

  const { error } = await supabase
    .from('registrations')
    .update({ case_status: caseStatus, updated_at: new Date().toISOString() })
    .in('id', ids)
  if (error) return { error: error.message }

  await supabase.from('registration_events').insert(
    ids.map((id) => ({
      registration_id: id,
      action: 'status_changed',
      description: `Status changed to ${caseStatus} through a bulk action.`,
      performed_by: profile?.id ?? null,
      performed_by_name: profile?.full_name || profile?.email || 'Staff',
    })),
  )

  revalidatePath(LIST_PATH)
  return { error: null }
}
