import { createClient } from '@/lib/supabase/server'
import { HeroSection, UpcomingEvents, SectorsSection, WhyJazSection } from '@/components/home'
import { filterVisibleEvents } from '@/lib/events-visibility'

export default async function Home() {
  const supabase = await createClient()

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
      .order('date', { ascending: true }),
  ])

  const visibleEvents = filterVisibleEvents(events)

  return (
    <>
      <HeroSection />
      <UpcomingEvents events={visibleEvents} />
      <SectorsSection sectors={sectors || []} events={visibleEvents as any} />
      <WhyJazSection />
    </>
  )
}


