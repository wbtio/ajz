import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { EventCard } from '@/components/home/event-card'
import { EventsFilter } from './events-filter'

export const metadata = {
  title: 'الفعاليات والمعارض | JAZ',
  description: 'تصفح جميع الفعاليات والمعارض القادمة في العراق',
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
    <div className="pt-36 pb-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            الفعاليات والمعارض
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            اكتشف جميع الفعاليات والمعارض القادمة وسجل حضورك الآن
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
            <p className="text-gray-500 text-lg">لا توجد فعاليات متاحة حالياً</p>
          </div>
        )}
      </Container>
    </div>
  )
}
