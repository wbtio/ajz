'use client'

import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  Check,
  ChevronRight,
  CircleX,
  ExternalLink,
  FileSpreadsheet,
  FilePenLine,
  MapPin,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface DraftEvent {
  id: string
  title: string | null
  date: string | null
  location: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  updated_by: string | null
  editor: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
}

interface EventRegistration {
  id: string
  event_id: string
  case_number: string | null
  current_step: number
  payment_status: string
  documents: unknown
  additional_data: unknown
  clients: { id: string; full_name_as_passport: string; last_name: string | null } | Array<{ id: string; full_name_as_passport: string; last_name: string | null }> | null
}

interface DraftEventsTableProps {
  events: DraftEvent[]
  registrations: EventRegistration[]
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'
type DetailsFilter = 'all' | 'complete' | 'incomplete'

const pageSizeOptions = [20, 50, 100]

const documentAliases = {
  passport: ['passport_copy', 'passport'],
  visaApplication: ['visa_application_form'],
  travelInsurance: ['insurance', 'travel_insurance'],
  invitationLetter: ['invitation', 'invitation_letter'],
  appointment: ['appointment_confirmation', 'tls_appointment'],
  companyLetter: ['company_letter', 'employment_letter'],
} as const

const stepLabels: Record<number, string> = {
  1: 'Event',
  2: 'Client',
  3: 'Intake',
  4: 'Visa',
  5: 'Documents',
  6: 'Payment',
  7: 'Delivery',
}

function getClient(registration: EventRegistration) {
  return Array.isArray(registration.clients) ? registration.clients[0] : registration.clients
}

function getDocumentTypes(documents: unknown) {
  if (!Array.isArray(documents)) return new Set<string>()
  return new Set(documents.flatMap((document) => {
    if (!document || typeof document !== 'object') return []
    const type = (document as Record<string, unknown>).type
    return typeof type === 'string' ? [type] : []
  }))
}

function hasDocument(types: Set<string>, aliases: readonly string[]) {
  return aliases.some((alias) => types.has(alias))
}

function getRegistrationChecks(registration: EventRegistration) {
  const types = getDocumentTypes(registration.documents)
  const additionalData = registration.additional_data && typeof registration.additional_data === 'object'
    ? registration.additional_data as Record<string, unknown>
    : {}
  return {
    passport: hasDocument(types, documentAliases.passport),
    visaApplication: hasDocument(types, documentAliases.visaApplication),
    travelInsurance: hasDocument(types, documentAliases.travelInsurance),
    invitationLetter: hasDocument(types, documentAliases.invitationLetter),
    appointment: hasDocument(types, documentAliases.appointment) || Boolean(additionalData.visa_appointment_date),
    companyLetter: hasDocument(types, documentAliases.companyLetter),
    payment: registration.payment_status === 'paid',
  }
}

function StatusBox({ complete, label }: { complete: boolean; label: string }) {
  return (
    <span className={`inline-flex size-7 items-center justify-center rounded-md border ${complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-600'}`} title={`${label}: ${complete ? 'Complete' : 'Incomplete'}`} aria-label={`${label}: ${complete ? 'Complete' : 'Incomplete'}`}>
      {complete ? <Check className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
    </span>
  )
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return [...pages].filter((page) => page > 0 && page <= totalPages).sort((a, b) => a - b)
}

export function DraftEventsTable({ events: initialEvents, registrations }: DraftEventsTableProps) {
  const [events, setEvents] = useState(initialEvents)
  const [query, setQuery] = useState('')
  const [detailsFilter, setDetailsFilter] = useState<DetailsFilter>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<DraftEvent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return events
      .filter((event) => {
        const matchesQuery = !normalizedQuery || `${event.title ?? ''} ${event.location ?? ''} ${event.date ?? ''} ${event.id}`.toLowerCase().includes(normalizedQuery)
        const isComplete = Boolean(event.title && event.date && event.location)
        const matchesDetails = detailsFilter === 'all' || (detailsFilter === 'complete' ? isComplete : !isComplete)
        return matchesQuery && matchesDetails
      })
      .sort((a, b) => {
        if (sort === 'title-asc') return (a.title ?? '').localeCompare(b.title ?? '')
        if (sort === 'title-desc') return (b.title ?? '').localeCompare(a.title ?? '')
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return sort === 'oldest' ? aTime - bTime : bTime - aTime
      })
  }, [detailsFilter, events, query, sort])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageStart = (activePage - 1) * pageSize
  const pageEvents = filteredEvents.slice(pageStart, pageStart + pageSize)
  const pageNumbers = getPageNumbers(activePage, totalPages)
  const hasFilters = Boolean(query || detailsFilter !== 'all')
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null
  const selectedRegistrations = selectedEventId ? registrations.filter((registration) => registration.event_id === selectedEventId) : []

  const resetToFirstPage = () => setCurrentPage(1)

  const deleteEvents = async (ids: string[]) => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('events').delete().in('id', ids)
      if (error) throw error
      setEvents((current) => current.filter((event) => !ids.includes(event.id)))
      setPendingDelete(null)
      toast.success(ids.length === 1 ? 'Draft event deleted.' : `${ids.length} draft events deleted.`)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Could not delete the draft${ids.length > 1 ? 's' : ''}: ${message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setDetailsFilter('all')
    resetToFirstPage()
  }

  const exportEventRegistrations = async () => {
    if (!selectedEvent) return
    const XLSX = await import('xlsx')
    const headers = ['Client name', 'Surname', 'Application ID', 'Stage', 'Passport', 'Visa Application', 'Travel Insurance', 'Invitation Letter', 'Appointment', 'Company Letter', 'Payment', 'Application Link']
    const rows = selectedRegistrations.map((registration) => {
      const client = getClient(registration)
      const checks = getRegistrationChecks(registration)
      return [
        client?.full_name_as_passport || 'Unknown client',
        client?.last_name || '',
        registration.case_number || registration.id,
        stepLabels[registration.current_step] || `Step ${registration.current_step}`,
        checks.passport ? '✓' : '✕',
        checks.visaApplication ? '✓' : '✕',
        checks.travelInsurance ? '✓' : '✕',
        checks.invitationLetter ? '✓' : '✕',
        checks.appointment ? '✓' : '✕',
        checks.companyLetter ? '✓' : '✕',
        checks.payment ? 'Paid' : 'Not paid',
        `${window.location.origin}/dashboard/participation-cases/${registration.id}`,
      ]
    })
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    worksheet['!autofilter'] = { ref: `A1:L${Math.max(1, rows.length + 1)}` }
    worksheet['!cols'] = [
      { wch: 30 }, { wch: 20 }, { wch: 24 }, { wch: 14 },
      { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
      { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 58 },
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Clients')
    const safeTitle = (selectedEvent.title || 'draft-event').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '')
    XLSX.writeFile(workbook, `${safeTitle}-registered-clients.xlsx`)
    toast.success(`${selectedRegistrations.length} registered clients exported to Excel.`)
  }

  if (!events.length) return (
    <section className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 text-center" aria-labelledby="empty-drafts-title" dir="ltr" lang="en">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-primary"><FilePenLine aria-hidden /></div>
      <div className="flex flex-col gap-1">
        <h2 id="empty-drafts-title" className="font-semibold text-foreground">No draft events yet</h2>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">Create a draft to collect event details before publishing it to the event calendar.</p>
      </div>
    </section>
  )

  return (
    <section className="flex flex-col gap-4 text-left" aria-label="Draft event records" dir="ltr" lang="en">
      <div className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:min-w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(event) => { setQuery(event.target.value); resetToFirstPage() }} placeholder="Search events" aria-label="Search draft events" className="h-10 border-slate-200 pl-9" />
          </div>
          <span className="whitespace-nowrap px-1 text-sm font-medium text-muted-foreground" aria-live="polite">
            {filteredEvents.length.toLocaleString()} {filteredEvents.length === 1 ? 'record' : 'records'}
          </span>
          <Select dir="ltr" value={detailsFilter} onValueChange={(value: DetailsFilter) => { setDetailsFilter(value); resetToFirstPage() }}>
            <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Filter by record completeness"><SelectValue placeholder="All records" /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="all">All records</SelectItem><SelectItem value="complete">Complete details</SelectItem><SelectItem value="incomplete">Missing details</SelectItem></SelectGroup></SelectContent>
          </Select>
          <DropdownMenu dir="ltr">
            <DropdownMenuTrigger asChild><Button variant="outline" className="h-10 w-full sm:w-auto">{sort.includes('title') ? <ArrowDownAZ data-icon="inline-start" /> : <CalendarDays data-icon="inline-start" />}Sort</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setSort('newest')}><CalendarDays />Newest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('oldest')}><CalendarDays />Oldest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('title-asc')}><ArrowDownAZ />Title A–Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('title-desc')}><ArrowUpAZ />Title Z–A</DropdownMenuItem>
            </DropdownMenuGroup></DropdownMenuContent>
          </DropdownMenu>
          {hasFilters ? <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 w-full whitespace-nowrap sm:w-auto"><X data-icon="inline-start" />Clear filters</Button> : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="overflow-x-auto">
          <Table className="min-w-[980px] table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[16%]" />
              <col className="w-[22%]" />
              <col className="w-[13%]" />
              <col className="w-[16%]" />
              <col className="w-[5%]" />
            </colgroup>
            <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-left">Event title</TableHead><TableHead className="text-left">Event date</TableHead><TableHead className="text-left">Location</TableHead><TableHead className="text-left">Readiness</TableHead><TableHead className="text-left">Last edited by</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{pageEvents.map((event) => {
              const isComplete = Boolean(event.title && event.date && event.location)
              return (
                <TableRow key={event.id}>
                  <TableCell><button type="button" onClick={() => setSelectedEventId(event.id)} className="group flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="flex flex-col gap-1"><span className="font-semibold text-foreground group-hover:text-primary">{event.title || 'Untitled event'}</span><span className="text-xs text-muted-foreground">{registrations.filter((registration) => registration.event_id === event.id).length} registered · Draft ID {event.id.slice(0, 8)}</span></span><ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button></TableCell>
                  <TableCell><span className="inline-flex items-center gap-2 text-foreground"><CalendarDays className="text-muted-foreground" aria-hidden />{event.date ? formatDate(event.date) : 'Date not set'}</span></TableCell>
                  <TableCell><span className="inline-flex items-center gap-2 text-foreground"><MapPin className="text-muted-foreground" aria-hidden />{event.location || 'Location not set'}</span></TableCell>
                  <TableCell><Badge variant={isComplete ? 'outline' : 'secondary'}>{isComplete ? 'Details complete' : 'Missing details'}</Badge></TableCell>
                  <TableCell>
                    {event.editor ? (
                      <div className="flex items-center gap-2" title={event.editor.full_name || event.editor.email}>
                        <Avatar className="size-7">
                          <AvatarImage src={event.editor.avatar_url || undefined} alt={event.editor.full_name || event.editor.email} />
                          <AvatarFallback className="text-[10px]">{(event.editor.full_name || event.editor.email).charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="max-w-24 truncate text-xs text-muted-foreground">{event.editor.full_name || event.editor.email}</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Not recorded</span>}
                  </TableCell>
                  <TableCell className="text-right"><DropdownMenu dir="ltr"><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="size-9 p-0"><span className="sr-only">Open actions for {event.title || 'untitled event'}</span><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => router.push(`/dashboard/draft-events/${event.id}/edit`)}><Pencil />Edit draft</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(event)}><Trash2 />Delete draft</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></TableCell>
                </TableRow>
              )
            })}</TableBody>
          </Table>
        </div>

        {!pageEvents.length ? <div className="flex flex-col items-center gap-2 border-t px-6 py-14 text-center"><Search className="text-muted-foreground" aria-hidden /><p className="font-medium text-foreground">No matching draft events</p><p className="text-sm text-muted-foreground">Try a different search term or clear the active filters.</p><Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button></div> : null}

        {filteredEvents.length ? <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Rows per page</span><Select dir="ltr" value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); resetToFirstPage() }}><SelectTrigger className="w-20" aria-label="Rows per page"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{pageSizeOptions.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectGroup></SelectContent></Select><span>{pageStart + 1}–{Math.min(pageStart + pageSize, filteredEvents.length)} of {filteredEvents.length}</span></div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end"><PaginationContent>
            <PaginationItem><PaginationPrevious href="#" aria-disabled={activePage === 1} className={activePage === 1 ? 'pointer-events-none opacity-50' : undefined} onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.max(1, page - 1)) }} /></PaginationItem>
            {pageNumbers.map((page, index) => <Fragment key={page}>{index > 0 && page - pageNumbers[index - 1] > 1 ? <PaginationItem><PaginationEllipsis /></PaginationItem> : null}<PaginationItem><PaginationLink href="#" isActive={page === activePage} onClick={(event) => { event.preventDefault(); setCurrentPage(page) }}>{page}</PaginationLink></PaginationItem></Fragment>)}
            <PaginationItem><PaginationNext href="#" aria-disabled={activePage === totalPages} className={activePage === totalPages ? 'pointer-events-none opacity-50' : undefined} onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.min(totalPages, page + 1)) }} /></PaginationItem>
          </PaginationContent></Pagination>
        </div> : null}
      </div>

      {selectedEvent ? (
        <section className="overflow-hidden rounded-xl border bg-background" aria-labelledby="event-registrations-title">
          <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="size-5" aria-hidden /></span>
              <div className="min-w-0">
                <h3 id="event-registrations-title" className="truncate font-bold text-foreground">{selectedEvent.title || 'Untitled event'} — Registered clients</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{selectedRegistrations.length} {selectedRegistrations.length === 1 ? 'person' : 'people'} registered. Select an application ID to open the full record.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportEventRegistrations} disabled={!selectedRegistrations.length}><FileSpreadsheet data-icon="inline-start" />Export Excel</Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEventId(null)}><X data-icon="inline-start" />Close</Button>
            </div>
          </div>

          {selectedRegistrations.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="min-w-56">Client</TableHead><TableHead className="min-w-44">Application / Stage</TableHead><TableHead className="text-center">Passport</TableHead><TableHead className="min-w-28 text-center">Visa application</TableHead><TableHead className="min-w-28 text-center">Travel insurance</TableHead><TableHead className="min-w-28 text-center">Invitation letter</TableHead><TableHead className="text-center">Appointment</TableHead><TableHead className="min-w-28 text-center">Company letter</TableHead><TableHead className="text-center">Payment</TableHead>
                </TableRow></TableHeader>
                <TableBody>{selectedRegistrations.map((registration) => {
                  const client = getClient(registration)
                  const checks = getRegistrationChecks(registration)
                  return (
                    <TableRow key={registration.id}>
                      <TableCell><span className="block font-semibold text-foreground">{client?.full_name_as_passport || 'Unknown client'}</span>{client?.last_name ? <span className="text-xs text-muted-foreground">Surname: {client.last_name}</span> : null}</TableCell>
                      <TableCell><button type="button" onClick={() => router.push(`/dashboard/participation-cases/${registration.id}`)} className="group flex flex-col gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary">{registration.case_number || registration.id.slice(0, 8)}<ExternalLink className="size-3" aria-hidden /></span><Badge variant="secondary" className="w-fit">{stepLabels[registration.current_step] || `Step ${registration.current_step}`}</Badge></button></TableCell>
                      <TableCell className="text-center"><StatusBox complete={checks.passport} label="Passport" /></TableCell><TableCell className="text-center"><StatusBox complete={checks.visaApplication} label="Visa application" /></TableCell><TableCell className="text-center"><StatusBox complete={checks.travelInsurance} label="Travel insurance" /></TableCell><TableCell className="text-center"><StatusBox complete={checks.invitationLetter} label="Invitation letter" /></TableCell><TableCell className="text-center"><StatusBox complete={checks.appointment} label="Appointment" /></TableCell><TableCell className="text-center"><StatusBox complete={checks.companyLetter} label="Company letter" /></TableCell><TableCell className="text-center"><StatusBox complete={checks.payment} label={checks.payment ? 'Paid' : 'Not paid'} /></TableCell>
                    </TableRow>
                  )
                })}</TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center"><Users className="size-7 text-muted-foreground" aria-hidden /><p className="font-medium text-foreground">No registered clients yet</p><p className="text-sm text-muted-foreground">Applications linked to this event will appear here automatically.</p></div>
          )}
        </section>
      ) : null}

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}><DialogContent className="max-w-md text-left" dir="ltr"><DialogHeader><DialogTitle>Delete this draft event?</DialogTitle><DialogDescription>“{pendingDelete?.title || 'Untitled event'}” will be permanently removed. This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter className="mt-3 gap-2 sm:space-x-0"><DialogClose asChild><Button variant="outline" disabled={isDeleting}>Cancel</Button></DialogClose><Button variant="danger" onClick={() => pendingDelete && deleteEvents([pendingDelete.id])} disabled={isDeleting}>{isDeleting ? 'Deleting…' : 'Delete draft'}</Button></DialogFooter></DialogContent></Dialog>
    </section>
  )
}
