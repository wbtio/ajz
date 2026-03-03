import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { EventCard } from '@/components/home/event-card'
import { EventsFilter } from './events-filter'

export const metadata = {
  title: 'Events & Exhibitions | JAZ',
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
  const events = eventsResult.data

  return (
    <div className="pt-36 pb-12" dir="ltr" lang="en">
      <Container>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-[#8b0000] mb-4">
            Events & Exhibitions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover all upcoming events and exhibitions and register your attendance now
          </p>
        </div>

        {/* Filters */}
        <EventsFilter sectors={sectors || []} />

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">No events available currently</p>
          </div>
        )}
      </Container>
    </div>
  )
}
