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
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
  ])

  const visibleEvents = filterVisibleEvents(events)

  return (
    <>
      <HeroSection />

      <main data-purpose="main-content">
        {/* White — focus domains */}
        <FocusSectors sectors={sectors || []} />

        {/* Navy — capabilities catalog (rhythmic contrast) */}
        <OurServices />

        {/* White — upcoming proof */}
        <FeaturedEvents events={visibleEvents} />
      </main>
    </>
  )
}
