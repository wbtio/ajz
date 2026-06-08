import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import {
  HeroSection,
  FocusSectors,
  OurServices,
  FeaturedEvents,
  PartnershipProcess,
  TrustedPartners,
  NewsInsights
} from '@/components/home'
import { filterVisibleEvents } from '@/lib/events-visibility'

export default async function Home() {
  const supabase = await createClient()

  // Fetch sectors, events, and blog posts in parallel
  const [{ data: sectors }, { data: events }, { data: posts }] = await Promise.all([
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
    supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)
  ])

  const visibleEvents = filterVisibleEvents(events)

  return (
    <>
      <HeroSection />
      
      <main className="py-16 bg-white" data-purpose="main-content">
        <Container>
          {/* Top Row: Focus Sectors, Our Services, & Featured Events */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
            <div className="lg:col-span-5">
              <FocusSectors sectors={sectors || []} />
            </div>
            
            <div className="lg:col-span-4">
              <OurServices />
            </div>
            
            <div className="lg:col-span-3">
              <FeaturedEvents events={visibleEvents} />
            </div>
          </div>
          
          {/* Bottom Row Container: Partnership, Trusted Partners, & News */}
          <div className="border border-slate-200/80 rounded-2xl p-8 bg-white shadow-sm" data-purpose="info-blocks">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <PartnershipProcess />
              </div>
              
              <div className="lg:col-span-4">
                <TrustedPartners />
              </div>
              
              <div className="lg:col-span-3">
                <NewsInsights posts={posts || []} />
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}
