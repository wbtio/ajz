import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarPlus, CheckCircle2, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DraftEventsTable } from './_components/draft-events-table'

export const metadata = {
  title: 'Draft Events | JAZ Admin',
}

export default async function DraftEventsPage() {
  const supabase = await createClient()

  // Fetch only events with status 'draft'
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, date, location, status, created_at, updated_at, updated_by, editor:users!events_updated_by_fkey(id, full_name, email, avatar_url)')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching draft events:', error)
  }

  const eventIds = (events ?? []).map((event) => event.id)
  const { data: registrations, error: registrationsError } = eventIds.length
    ? await supabase
        .from('registrations')
        .select('id, event_id, case_number, current_step, payment_status, documents, additional_data, clients(id, full_name_as_passport, last_name)')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
    : { data: [], error: null }

  if (registrationsError) {
    console.error('Error fetching draft event registrations:', registrationsError)
  }

  const draftEvents = (events ?? []).map((event) => ({
    ...event,
    editor: Array.isArray(event.editor) ? event.editor[0] ?? null : event.editor,
  }))
  const draftRegistrations = registrations ?? []
  const completeEvents = draftEvents.filter((event) => Boolean(event.title && event.date && event.location)).length

  return (
    <div className="mx-auto max-w-6xl space-y-7 text-left [font-family:var(--font-plus-jakarta-sans),sans-serif]" dir="ltr" lang="en">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-48 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Draft Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Prepare event details before publishing to the calendar.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex h-10 min-w-28 items-center gap-2 rounded-lg border bg-background px-3">
            <FileText className="size-4 text-primary" aria-hidden />
            <span className="text-lg font-semibold leading-none">{draftEvents.length}</span>
            <span className="text-xs text-muted-foreground">Drafts</span>
          </div>
          <div className="flex h-10 min-w-28 items-center gap-2 rounded-lg border bg-background px-3">
            <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
            <span className="text-lg font-semibold leading-none">{completeEvents}</span>
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
          <div className="flex h-10 min-w-28 items-center gap-2 rounded-lg border bg-background px-3">
            <Users className="size-4 text-blue-600" aria-hidden />
            <span className="text-lg font-semibold leading-none">{draftRegistrations.length}</span>
            <span className="text-xs text-muted-foreground">Registered</span>
          </div>
          <Button asChild className="h-10">
            <Link href="/dashboard/draft-events/new"><CalendarPlus data-icon="inline-start" />Add event</Link>
          </Button>
        </div>
      </header>
      <DraftEventsTable events={draftEvents} registrations={draftRegistrations} />
    </div>
  )
}
