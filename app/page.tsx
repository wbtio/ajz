import { createClient } from '@/lib/supabase/server'
import { HeroSection, UpcomingEvents, SectorsSection } from '@/components/home'

export default async function Home() {
  const supabase = await createClient()

  const [eventsResult, sectorsResult] = await Promise.all([
    // جلب الفعاليات القادمة فقط (غير المنتهية)
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true }),
    
    // جلب القطاعات النشطة
    supabase
      .from('sectors')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  ])

  const events = eventsResult.data
  const sectors = sectorsResult.data

  return (
    <>
      <HeroSection />
      <UpcomingEvents events={events || []} />
      <SectorsSection sectors={sectors || []} />
    </>
  )
}
