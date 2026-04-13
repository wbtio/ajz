import { createClient } from '@/lib/supabase/server'
import { filterVisibleEvents } from '@/lib/events-visibility'
import { EventsPageView } from './events-page-view'

export const metadata = {
  title: 'Events and Exhibitions | JAZ',
  description: 'Browse all upcoming events and exhibitions in Iraq',
}

interface EventsPageProps {
  searchParams: Promise<{ sector?: string; search?: string }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // بناء استعلام الفعاليات
  let eventsQuery = supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: true })

  // تطبيق فلتر القطاع
  if (params.sector) {
    eventsQuery = eventsQuery.eq('sector', params.sector)
  }

  // تطبيق البحث
  if (params.search) {
    eventsQuery = eventsQuery.or(`title.ilike.%${params.search}%,title_ar.ilike.%${params.search}%`)
  }

  // جلب البيانات بشكل متوازي
  const [sectorsResult, eventsResult] = await Promise.all([
    supabase
      .from('sectors')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    eventsQuery
  ])

  const sectors = sectorsResult.data
  const events = filterVisibleEvents(eventsResult.data)
  const hasActiveFilters = Boolean(params.sector || params.search)

  return (
    <EventsPageView
      sectors={sectors ?? []}
      events={events ?? []}
      hasActiveFilters={hasActiveFilters}
    />
  )
}
