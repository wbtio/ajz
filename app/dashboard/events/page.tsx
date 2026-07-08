import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, Users, Globe, MapPin, Calendar, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EventsFilters } from './_components/events-filters'
import { StatsCards } from './_components/stats-cards'

import { EventsTable } from './_components/events-table'

export const metadata = {
  title: 'إدارة الفعاليات | JAZ Admin',
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
    query = query.or(`title.ilike.%${search}%,title_ar.ilike.%${search}%,sector.ilike.%${search}%,sub_sector_ar.ilike.%${search}%`)
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
        <h1 className="text-2xl font-bold text-gray-900">إدارة الفعاليات</h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فعالية
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
