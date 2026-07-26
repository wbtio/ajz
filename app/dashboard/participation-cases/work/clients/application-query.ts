/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared types and constants for the Applications list. These live outside
 * `actions.ts` because a `'use server'` module may only export async functions.
 */

export const ALL_EVENTS_VALUE = 'all-events'
export const PAGE_SIZE = 50

export type SortKey = 'created_at' | 'updated_at' | 'full_name' | 'case_number' | 'current_step'

export interface ApplicationQuery {
  eventId: string
  search: string
  smartFilter: string
  assignedFilter: string
  sortKey: SortKey
  sortAscending: boolean
  page: number
}

export interface ApplicationRow {
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
  documents: any
  assigned_employee_id: string | null
  additional_data: any
  client_snapshot: any
  clients: { employer_name: string | null; sex: string | null } | { employer_name: string | null; sex: string | null }[] | null
  assigned_employee: { full_name: string | null; email: string | null } | null
  registration_events: {
    performed_by: string | null
    performed_by_name: string | null
    created_at: string | null
    users:
      | { full_name: string | null; email: string | null; avatar_url: string | null }
      | { full_name: string | null; email: string | null; avatar_url: string | null }[]
  }[]
}

export interface ApplicationStats {
  total: number
  closed: number
  active: number
  archived: number
}

/** Safely reads employer_name regardless of whether the join returns an object or array. */
export function getEmployerName(row: ApplicationRow): string | null {
  const snapshotCompany = (row.client_snapshot as any)?.company_name
  if (typeof snapshotCompany === 'string' && snapshotCompany.trim()) return snapshotCompany
  const clients = row.clients
  if (!clients) return null
  if (Array.isArray(clients)) return clients[0]?.employer_name ?? null
  return clients.employer_name
}

/**
 * The applicant's sex. The list used to read `form_data.sex`, a field only the
 * public website form writes, so every wizard-created case fell back to the
 * neutral icon.
 */
export function getApplicantSex(row: ApplicationRow): string | null {
  const clients = row.clients
  const fromClient = Array.isArray(clients) ? clients[0]?.sex : clients?.sex
  if (fromClient) return fromClient
  const snapshotGender = (row.client_snapshot as any)?.gender
  return typeof snapshotGender === 'string' ? snapshotGender : null
}
