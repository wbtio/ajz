'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectorRegistrationForm } from '@/app/sectors/components/sector-registration-form'
import { useI18n } from '@/lib/i18n'
import type { Tables } from '@/lib/database.types'
import type { FormField } from '@/lib/types'
import { Building2, Heart, Cpu, GraduationCap, ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { SectorContentEntry } from '@/app/sectors/sector-content'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2,
  Heart,
  Cpu,
  GraduationCap,
}

interface SectorPageClientProps {
  slug: string
  sector: Tables<'sectors'>
  content: SectorContentEntry
  events: Tables<'events'>[] | null
}

export function SectorPageClient({ slug, sector, content, events }: SectorPageClientProps) {
  const { locale, dir } = useI18n()
  const isArabic = locale === 'ar'
  const IconComponent = iconMap[sector.icon || 'Building2'] || Building2

  return (
    <div className="pt-36 pb-12" dir={dir} lang={locale}>
      <Container>
        <div className={`mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500 ${isArabic ? '' : 'justify-start'}`}>
          <Link href="/" className="hover:text-[#8b0000]">{isArabic ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href="/sectors" className="hover:text-[#8b0000]">{isArabic ? 'القطاعات' : 'Sectors'}</Link>
          <span>/</span>
          <span className="text-gray-900">{isArabic ? content.nameAr : content.name}</span>
        </div>

        <div className="relative mb-12 flex min-h-[420px] items-center overflow-hidden rounded-[2rem] bg-stone-950 text-white">
          {sector.cover_image && (
            <div className="absolute inset-0 z-0">
              <img
                src={sector.cover_image}
                alt={isArabic ? content.nameAr : content.name}
                className="h-full w-full object-cover opacity-50"
              />
              <div className={`absolute inset-0 ${isArabic ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-stone-950 via-stone-950/80 to-stone-950/25`} />
            </div>
          )}

          <div className={`absolute inset-0 ${isArabic ? 'bg-[radial-gradient(circle_at_top_left,_rgba(139,0,0,0.3),_transparent_35%)]' : 'bg-[radial-gradient(circle_at_top_right,_rgba(139,0,0,0.3),_transparent_35%)]'}`} />

          <div className="relative z-10 w-full p-8 lg:p-16">
            <div className={`flex flex-col items-start gap-8 ${isArabic ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:items-center`}>
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl backdrop-blur-md"
                style={{ backgroundColor: `${sector.color}40`, border: `1px solid ${sector.color}60` }}
              >
                <IconComponent className="h-12 w-12" style={{ color: sector.color || '#3B82F6' }} />
              </div>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                  {isArabic ? content.name : content.nameAr}
                </p>
                <h1 className="mb-6 text-4xl font-extrabold leading-tight lg:text-6xl">
                  {isArabic ? content.nameAr : content.name}
                </h1>
                <p className="max-w-3xl text-lg leading-relaxed text-gray-200 lg:text-xl">
                  {isArabic ? content.heroDescriptionAr : content.heroDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:p-10">
              <p className="mb-3 text-sm font-semibold text-[#8b0000]">{isArabic ? 'القطاعات' : 'Industry Sectors'}</p>
              <h2 className="mb-2 text-3xl font-bold text-stone-950">{isArabic ? content.nameAr : content.name}</h2>
              <p className="mb-8 text-lg leading-8 text-stone-600">
                {isArabic ? content.overviewTitleAr : content.overviewTitle}
              </p>

              <div className={isArabic ? 'space-y-6 text-right' : 'space-y-6 text-left'}>
                <div className="rounded-2xl bg-stone-50 p-6">
                  <h3 className="mb-3 text-lg font-bold text-stone-950">{isArabic ? 'النطاق' : 'Scope'}</h3>
                  <p className="leading-8 text-stone-600">{isArabic ? content.scopeAr : content.scope}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-6">
                  <h3 className="mb-3 text-lg font-bold text-stone-950">{isArabic ? 'الربط المهني' : 'Professional Link'}</h3>
                  <p className="leading-8 text-stone-600">{isArabic ? content.professionalLinkAr : content.professionalLink}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-6">
                  <h3 className="mb-3 text-lg font-bold text-stone-950">{isArabic ? 'المنفعة' : 'Benefit'}</h3>
                  <p className="leading-8 text-stone-600">{isArabic ? content.benefitAr : content.benefit}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-fit rounded-[2rem] border border-[#8b0000]/10 bg-[#8b0000]/[0.03] p-8">
              <h3 className="mb-4 text-lg font-bold text-stone-950">{isArabic ? 'لماذا هذا القطاع؟' : 'Why This Sector?'}</h3>
              <p className="mb-6 text-sm leading-7 text-stone-700">
                {isArabic
                  ? 'تعمل Joint Annual Zone كبوابة استراتيجية لربط المؤسسات العراقية بالفرص الدولية النوعية، مع تركيز على الشراكات العملية والتبادل المهني المباشر.'
                  : 'Joint Annual Zone serves as a strategic gateway linking Iraqi institutions with high-value international opportunities and direct professional engagement.'}
              </p>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 text-sm font-medium text-stone-700 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                  <span>{isArabic ? 'الوصول إلى المعارض والمؤتمرات الدولية' : 'Access to international exhibitions and conferences'}</span>
                  <div className="h-2 w-2 rounded-full bg-[#8b0000]" />
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium text-stone-700 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                  <span>{isArabic ? 'بناء شبكات وشراكات مهنية مباشرة' : 'Building direct professional networks and partnerships'}</span>
                  <div className="h-2 w-2 rounded-full bg-[#8b0000]" />
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium text-stone-700 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                  <span>{isArabic ? 'تطوير القدرات وربطها بمتطلبات السوق الدولي' : 'Capability development aligned with international market needs'}</span>
                  <div className="h-2 w-2 rounded-full bg-[#8b0000]" />
                </div>
              </div>
            </div>

            <SectorRegistrationForm
              sectorId={sector.id}
              sectorName={isArabic ? content.nameAr : content.name}
              config={sector.registration_config as unknown as FormField[]}
              intro={isArabic ? content.registrationIntroAr : content.registrationIntro}
            />
          </div>
        </div>

        <div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'الفعاليات ضمن هذا القطاع' : 'Events in This Sector'}
            </h2>
            <Link href={`/events?sector=${slug}`}>
              <Button variant="outline">
                {isArabic ? 'عرض الكل' : 'View All'}
                <ArrowLeft className={`h-4 w-4 ${isArabic ? 'mr-2' : 'ml-2 rotate-180'}`} />
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="group h-full transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#8b0000]">
                        {isArabic ? (event.title_ar || event.title) : (event.title || event.title_ar)}
                      </h3>
                      {event.sub_sector && (
                        <span className="mb-2 inline-block rounded-full bg-[#8b0000]/10 px-2 py-0.5 text-[10px] font-medium text-[#8b0000]">{event.sub_sector}</span>
                      )}
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className={`flex items-center gap-2 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatDate(event.date)}</span>
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className={`flex items-center gap-2 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                          <span>{[event.location, event.country].filter(Boolean).join(', ')}</span>
                          <MapPin className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 py-12 text-center">
              <p className="mb-4 text-gray-500">{isArabic ? 'لا توجد فعاليات في هذا القطاع حالياً' : 'No events in this sector currently'}</p>
              <Link href="/events">
                <Button variant="outline">{isArabic ? 'تصفح جميع الفعاليات' : 'Browse All Events'}</Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
