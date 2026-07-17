import { createClient } from '@/lib/supabase/server'
import {
  HeroSection,
  FocusSectors,
  OurServices
} from '@/components/home'

export default async function Home() {
  const supabase = await createClient()

  // Fetch sectors and events in parallel
  const [{ data: sectors }] = await Promise.all([
    supabase
      .from('sectors')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  return (
    <>
      <HeroSection />

      <div data-purpose="main-content">
        {/* Navy — capabilities catalog (rhythmic contrast) */}
        <OurServices />

        {/* White — focus domains */}
        <FocusSectors sectors={sectors || []} />
      </div>
    </>
  )
}
