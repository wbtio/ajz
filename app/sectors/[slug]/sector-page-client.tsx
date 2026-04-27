'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SectorRegistrationForm } from '@/app/sectors/components/sector-registration-form'
import { useI18n } from '@/lib/i18n'
import type { Tables } from '@/lib/database.types'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  Cpu,
  GraduationCap,
  Heart,
  MapPin,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
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
  const accentColor = content.accent || '#8b0000'
  const primaryName = isArabic ? content.nameAr : content.name
  const heroDescription = isArabic ? content.heroDescriptionAr : content.heroDescription
  const overviewTitle = isArabic ? content.overviewTitleAr : content.overviewTitle
  const keywordChips = (isArabic ? content.scopeAr : content.scope)
    .split(/[،,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="pt-36 pb-12" dir={dir} lang={locale}>
      <Container>
        <nav
          aria-label={isArabic ? 'مسار التصفح' : 'Breadcrumb'}
          className="mb-8 flex flex-wrap items-center justify-start gap-2 text-sm text-gray-500"
        >
          <Link href="/" className="hover:text-[#8b0000]">{isArabic ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href="/sectors" className="hover:text-[#8b0000]">{isArabic ? 'القطاعات' : 'Sectors'}</Link>
          <span>/</span>
          <span className="text-gray-900">{primaryName}</span>
        </nav>

        <div className="relative mb-12 overflow-hidden rounded-[2rem] bg-stone-950 text-white shadow-[0_35px_80px_-50px_rgba(15,23,42,0.85)]">
          {/* @ts-ignore - cover_image exists in DB but not in types */}
          {sector.cover_image && (
            <div className="absolute inset-0 z-0">
              <Image
                fill
                src={sector.cover_image}
                alt={primaryName}
                sizes="100vw"
                className="object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/45 rtl:bg-gradient-to-l" />
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: isArabic
                ? `radial-gradient(circle at 0% 0%, ${accentColor}66, transparent 34%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.08), transparent 32%)`
                : `radial-gradient(circle at 100% 0%, ${accentColor}66, transparent 34%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.08), transparent 32%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
          <div
            className="absolute -end-12 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{ backgroundColor: `${accentColor}33` }}
          />
          <div className="absolute -bottom-24 -start-8 h-64 w-64 rounded-full bg-white/8 blur-3xl" />

          <div className="relative z-10 w-full px-6 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-16">
            <div className="max-w-3xl text-start me-auto">
                <div className="mb-6 flex flex-wrap items-center justify-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border backdrop-blur-md"
                    style={{ backgroundColor: `${accentColor}30`, borderColor: `${accentColor}70` }}
                  >
                    <IconComponent className="h-8 w-8" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0 text-start">
                    <p
                      className={cn(
                        'text-xs font-semibold text-white/55',
                        isArabic ? 'tracking-[0.08em]' : 'uppercase tracking-[0.24em]',
                      )}
                    >
                      {isArabic ? 'بوابة قطاعية متخصصة' : 'Sector Gateway'}
                    </p>
                    <div className="mt-2 flex flex-wrap justify-start gap-2">
                      <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/80">
                        {isArabic ? 'واجهة ثنائية اللغة' : 'Bilingual Layout'}
                      </span>
                    </div>
                  </div>
                </div>

                <h1 className="max-w-[16ch] text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                  {primaryName}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/85 sm:text-lg lg:text-[1.2rem]">
                  {heroDescription}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                  {overviewTitle}
                </p>

                <div className="mt-6 flex flex-wrap justify-start gap-2.5">
                  {(keywordChips.length > 0 ? keywordChips : [overviewTitle]).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/12 bg-black/20 px-3.5 py-2 text-sm font-medium text-white/85 backdrop-blur-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start sm:gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="min-h-12 rounded-full bg-white px-6 text-stone-950 hover:bg-white/90 focus:ring-white/40"
                      >
                        {isArabic ? 'فتح نموذج التسجيل' : 'Open Registration Form'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      dir={dir}
                      className="inset-0 left-0 top-0 h-screen w-screen max-h-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[#f5efe7] p-0 shadow-none"
                    >
                      <div className="flex h-full min-h-0 flex-col">
                        <div className="flex items-center justify-between border-b border-stone-200 bg-white/90 py-4 ps-16 pe-5 backdrop-blur-sm sm:ps-20 sm:pe-7">
                          <div className={cn('flex items-center gap-3', isArabic && 'flex-row-reverse')}>
                            <div className={cn('flex items-center gap-2', isArabic && 'flex-row-reverse')}>
                              <span className="h-2.5 w-2.5 rounded-full bg-[#8b0000]/20" />
                              <span className="h-2.5 w-2.5 rounded-full bg-[#8b0000]/35" />
                              <span className="h-2.5 w-2.5 rounded-full bg-[#8b0000]" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                              {isArabic ? 'نافذة التسجيل' : 'Registration Window'}
                            </p>
                          </div>
                          <span className="text-xs text-stone-400">
                            {isArabic ? 'ملف رسمي' : 'Official Dossier'}
                          </span>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                          <div className="mx-auto w-full space-y-5 xl:max-w-[56rem] 2xl:max-w-[50vw]">
                            <DialogHeader className="rounded-[1.6rem] border border-stone-200 bg-white px-5 py-5 text-start shadow-[0_28px_70px_-58px_rgba(15,23,42,0.28)] sm:px-6 sm:py-6">
                              <Badge
                                variant="outline"
                                className="w-fit rounded-full border-[#8b0000]/15 bg-[#fff8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0000]"
                              >
                                {isArabic ? 'استمارة رسمية' : 'Official Dossier'}
                              </Badge>
                              <DialogTitle className="text-2xl font-semibold text-stone-950 sm:text-[2rem]">
                                {isArabic ? 'نموذج التسجيل' : 'Registration Form'}
                              </DialogTitle>
                              <DialogDescription className="max-w-3xl text-start leading-7 text-stone-600">
                                {isArabic ? content.registrationIntroAr : content.registrationIntro}
                              </DialogDescription>
                            </DialogHeader>

                            <SectorRegistrationForm
                              sectorId={sector.id}
                              sectorName={primaryName}
                              config={null}
                              intro={isArabic ? content.registrationIntroAr : content.registrationIntro}
                              variant="plain"
                              showHeader={false}
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="min-h-12 rounded-full border border-white/15 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white focus:ring-white/30"
                  >
                    <Link href="#sector-events" className="inline-flex items-center gap-2">
                      {isArabic ? 'استكشف الفعاليات' : 'Explore Events'}
                      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  </Button>
                </div>
            </div>
          </div>
        </div>

        <div id="sector-events" className="scroll-mt-32">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-start text-2xl font-bold text-gray-900">
              {isArabic ? 'الفعاليات ضمن هذا القطاع' : 'Events in This Sector'}
            </h2>
            <Link href={`/events?sector=${slug}`}>
              <Button variant="outline" className="border-[#8b0000]/25 text-[#8b0000] hover:bg-[#8b0000]/5 hover:text-[#8b0000]">
                {isArabic ? 'عرض الكل' : 'View All'}
                <ArrowLeft
                  className={cn('h-4 w-4', isArabic ? 'me-2' : 'ms-2 rotate-180')}
                  aria-hidden
                />
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="group h-full transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-start">
                      <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#8b0000]">
                        {isArabic ? (event.title_ar || event.title) : (event.title || event.title_ar)}
                      </h3>
                      {event.sub_sector && (
                        <span className="mb-2 inline-block rounded-full bg-[#8b0000]/10 px-2 py-0.5 text-[10px] font-medium text-[#8b0000]">{event.sub_sector}</span>
                      )}
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0">{formatDate(event.date)}</span>
                          <Calendar className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="min-w-0">{[event.location, event.country].filter(Boolean).join(', ')}</span>
                          <MapPin className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
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
