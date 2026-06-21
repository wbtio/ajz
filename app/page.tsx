import { createClient } from '@/lib/supabase/server'
import {
  HeroSection,
  FocusSectors,
  OurServices,
  FeaturedEvents
} from '@/components/home'
import { filterVisibleEvents } from '@/lib/events-visibility'

export default async function Home() {
  const supabase = await createClient()

  // Fetch sectors and events in parallel
  const [{ data: sectors }, { data: events }] = await Promise.all([
    supabase
      .from('sectors')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false })
      .limit(6)
  ])

  const visibleEvents = filterVisibleEvents(events)

  return (
    <>
      <HeroSection />

      <div data-purpose="main-content">
        {/* White — upcoming proof */}
        <FeaturedEvents events={visibleEvents} />

        {/* Navy — capabilities catalog (rhythmic contrast) */}
        <OurServices />

        {/* White — focus domains */}
        <FocusSectors sectors={sectors || []} />
      </div>
    </>
  )
}
