import { createClient } from '@/lib/supabase/server'
import { HeroSection, SectorsSection, AboutJazSection } from '@/components/home'

export default async function Home() {
  const supabase = await createClient()

  const { data: sectors } = await supabase
    .from('sectors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <>
      <HeroSection />
      <AboutJazSection />
      <SectorsSection sectors={sectors || []} />
    </>
  )
}
