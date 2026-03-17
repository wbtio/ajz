import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { EventCard } from '@/components/home/event-card'
import { EventsFilter } from './events-filter'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays, LayoutGrid, Mail } from 'lucide-react'
import { filterVisibleEvents } from '@/lib/events-visibility'

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
  const events = filterVisibleEvents(eventsResult.data)
  const hasEvents = Boolean(events && events.length > 0)
  const hasActiveFilters = Boolean(params.sector || params.search)

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
        {hasEvents && <EventsFilter sectors={sectors || []} />}

        {/* Events Grid */}
        {hasEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-gray-200 bg-[linear-gradient(135deg,#faf8f5,#ffffff)] p-8 shadow-sm lg:p-12">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8b0000]/10 text-[#8b0000]">
                <CalendarDays className="h-8 w-8" />
              </div>

              <h2 className="mb-4 text-2xl font-bold text-gray-900 lg:text-3xl">
                {hasActiveFilters ? 'No matching events were found' : 'Upcoming events will be announced soon'}
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-gray-600 lg:text-lg">
                {hasActiveFilters
                  ? 'Try changing the selected sector or search term. We are keeping this page active so visitors can find future events as soon as they are published.'
                  : 'You can keep this page live while your calendar is being prepared. It reassures visitors that the section exists and gives them clear next steps instead of an empty page.'}
              </p>

              <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/sectors">
                  <Button className="h-12 rounded-2xl bg-[#8b0000] px-6 hover:bg-[#a01010]">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Explore Sectors
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="h-12 rounded-2xl px-6">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </Link>
              </div>

              {sectors && sectors.length > 0 && (
                <div className="rounded-[1.5rem] border border-gray-200 bg-white p-6 text-left">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Available sectors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((sector) => (
                      <Link
                        key={sector.id}
                        href={`/sectors/${sector.slug}`}
                        className="rounded-xl border border-gray-200 bg-[#faf8f5] px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#8b0000]/30 hover:text-[#8b0000]"
                      >
                        {sector.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
