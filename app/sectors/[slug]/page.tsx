import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSectorContent, mergeSectorWithContent } from '@/app/sectors/sector-content'
import { SectorPageClient } from './sector-page-client'
import { filterVisibleEvents } from '@/lib/events-visibility'

interface SectorPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SectorPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: sector } = await supabase
    .from('sectors')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!sector) {
    return { title: 'Sector Not Found | JAZ' }
  }

  return {
    title: `${sector.name} | JAZ`,
    description: sector.description,
  }
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: sector } = await supabase
    .from('sectors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!sector) {
    notFound()
  }

  const sectorView = mergeSectorWithContent(sector)
  const sectorContent = getSectorContent(sector)

  if (!sectorContent) {
    notFound()
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('sector', slug)
    .eq('status', 'published')
    .order('date', { ascending: true })
    .limit(6)

  return (
    <SectorPageClient
      slug={slug}
      sector={sectorView}
      content={sectorContent}
      events={filterVisibleEvents(events)}
    />
  )
}
