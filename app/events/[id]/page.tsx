import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventHero, EventTabs } from '@/components/conference/event-tabs'

const TEMPLATE_EVENT_AR_TITLE = 'تنفس البصرة 2026'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    return { title: 'Event Not Found | JAZ' }
  }

  return {
    title: `${event.title_ar || event.title} | JAZ`,
    description: event.description_ar || event.description,
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  const htmlContent = (event as any).html_content

  // إذا الفعالية تحتوي على محتوى HTML، نعرضه كصفحة مستقلة داخل iframe
  // حتى نتجنب hydration mismatch ونحافظ على head/body/scripts كما هي
  if (htmlContent) {
    return (
      <div className="relative min-h-screen">
        <iframe
          title={`event-${event.id}-content`}
          className="w-full min-h-screen border-0"
          srcDoc={String(htmlContent)}
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        />

        <Link
          href={`/events/${event.id}/registration`}
          className="fixed bottom-6 left-1/2 z-50 inline-flex w-[280px] -translate-x-1/2 items-center justify-center rounded-lg bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-red-700 animate-bounce"
        >
          سجل الان 
        </Link>
      </div>
    )
  }

  const cc = (event as any).conference_config as any

  const { data: templateEvent } = await supabase
    .from('events')
    .select('conference_config, date')
    .ilike('title_ar', `%${TEMPLATE_EVENT_AR_TITLE}%`)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const templateConferenceConfig = (templateEvent as any)?.conference_config as any

  let sectorName_ar: string | null = null
  let sectorName_en: string | null = null
  if (event.sector_id) {
    const { data: sector } = await supabase
      .from('sectors')
      .select('name_ar, name_en')
      .eq('id', event.sector_id)
      .single()
    if (sector) {
      sectorName_ar = (sector as any).name_ar || null
      sectorName_en = (sector as any).name_en || null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventHero
        event={event}
        sectorName_ar={sectorName_ar}
        sectorName_en={sectorName_en}
      />
      <EventTabs
        eventId={event.id}
        conferenceConfig={cc}
        templateConferenceConfig={templateConferenceConfig}
        description_ar={event.description_ar}
        description_en={event.description}
      />

      <Link
        href={`/events/${event.id}/registration`}
        className="fixed bottom-6 left-1/2 z-50 inline-flex w-[280px] -translate-x-1/2 items-center justify-center rounded-lg bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-red-700 animate-bounce"
      >
        سجل الان 
      </Link>
    </div>
  )
}
