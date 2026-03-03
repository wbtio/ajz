import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Heart, Cpu, GraduationCap, ArrowRight, Calendar, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { SectorRegistrationForm } from '@/app/sectors/components/sector-registration-form'
import { FormField } from '@/lib/types'
import ReactMarkdown from 'react-markdown'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2,
  Heart,
  Cpu,
  GraduationCap,
}

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

  // Get events for this sector
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('sector', slug)
    .eq('status', 'published')
    .order('date', { ascending: true })
    .limit(6)

  const IconComponent = iconMap[sector.icon || 'Building2'] || Building2

  return (
    <div className="pt-36 pb-12" dir="ltr" lang="en">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/sectors" className="hover:text-blue-600">Sectors</Link>
          <span>/</span>
          <span className="text-gray-900">{sector.name}</span>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl mb-12 bg-gray-900 text-white min-h-[400px] flex items-center">
          {sector.cover_image && (
            <div className="absolute inset-0 z-0">
              <img
                src={sector.cover_image}
                alt={sector.name}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            </div>
          )}
          
          <div className="relative z-10 p-8 lg:p-16 w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md"
                style={{ backgroundColor: `${sector.color}40`, border: `1px solid ${sector.color}60` }}
              >
                <IconComponent
                  className="w-12 h-12"
                  style={{ color: sector.color || '#3B82F6' }}
                />
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  {sector.name}
                </h1>
                <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
                  {sector.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Content */}
        {sector.long_description && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-600">
                <ReactMarkdown>{sector.long_description}</ReactMarkdown>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-fit">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Why This Sector?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  At JAZ, we work to provide the best opportunities and events in this sector to enhance networking and professional growth.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Continuous Events
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Wide Network Connections
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Specialized Training Opportunities
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <SectorRegistrationForm 
                sectorId={sector.id}
                sectorName={sector.name}
                config={sector.registration_config as unknown as FormField[]}
              />
            </div>
          </div>
        )}

        {/* Events in this sector */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Events in This Sector
            </h2>
            <Link href={`/events?sector=${slug}`}>
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {event.title || event.title_ar}
                      </h3>
                      {event.sub_sector && (
                        <span className="inline-block text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mb-2">{event.sub_sector}</span>
                      )}
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{[event.location, event.country].filter(Boolean).join(', ')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-4">No events in this sector currently</p>
              <Link href="/events">
                <Button variant="outline">Browse All Events</Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
