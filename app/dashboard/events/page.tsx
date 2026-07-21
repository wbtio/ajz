import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EventsFilters } from './_components/events-filters'
import { StatsCards } from './_components/stats-cards'

import { EventsTable } from './_components/events-table'

export const metadata = {
  title: 'Event Management | JAZ Admin',
}

type SearchParams = {
  search?: string
  status?: string
  type?: string
  page?: string
}

const PAGE_SIZE = 10

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  await requireDashboardAccess('/dashboard/events')

  const supabase = await createClient()
  const params = (await searchParams) ?? {}

  const search = params.search?.trim() ?? ''
  const status = params.status?.trim() ?? ''
  const type = params.type?.trim() ?? ''
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,sector.ilike.%${search}%,sub_sector.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (type) {
    query = query.eq('event_type', type)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: eventsData, count: filteredCount }, { data: allEventsData }] = await Promise.all([
    query.range(from, to),
    supabase.from('events').select('id,status,date'),
  ])

  const events = eventsData ?? []
  const allEvents = allEventsData ?? []
  const totalFiltered = filteredCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    total: allEvents.length,
    published: allEvents.filter((event) => event.status === 'published').length,
    completed: allEvents.filter((event) => event.status === 'completed').length,
    upcoming: allEvents.filter((event) => new Date(event.date) >= today).length,
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Link>
      </div>

      <StatsCards
        total={stats.total}
        published={stats.published}
        completed={stats.completed}
        upcoming={stats.upcoming}
      />

      <EventsFilters />

      <EventsTable
        initialEvents={events}
        totalFiltered={totalFiltered}
        currentPage={currentPage}
        totalPages={totalPages}
        from={from}
      />
    </div>
  )
}
