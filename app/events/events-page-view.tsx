'use client'

import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { EventCard } from '@/components/home/event-card'
import { EventsFilter } from './events-filter'
import { Button } from '@/components/ui/button'
import { CalendarDays, LayoutGrid, Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { EventsHero } from './_components/events-hero'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { ContactBanner } from '@/components/shared/contact-banner'
import type { Event, Sector } from '@/lib/database.types'

interface EventsPageStats {
  total: number
  upcoming: number
  countries: number
  divisions: number
  years: number
}

interface EventsPageViewProps {
  sectors: Sector[]
  events: Event[]
  hasActiveFilters: boolean
  stats: EventsPageStats
}

export function EventsPageView({ sectors, events, hasActiveFilters, stats }: EventsPageViewProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const hasEvents = events.length > 0

  const statsItems: StatsBarItem[] = [
    {
      value: stats.total,
      label: t.events.stats.total.label,
      suffix: t.events.stats.total.suffix,
      icon: 'solar:calendar-mark-bold-duotone',
    },
    {
      value: stats.upcoming,
      label: t.events.stats.upcoming.label,
      suffix: t.events.stats.upcoming.suffix,
      icon: 'solar:clock-circle-bold-duotone',
    },
    {
      value: stats.countries,
      label: t.events.stats.countries.label,
      suffix: t.events.stats.countries.suffix,
      icon: 'solar:globus-bold-duotone',
    },
    {
      value: stats.divisions,
      label: t.events.stats.divisions.label,
      suffix: t.events.stats.divisions.suffix,
      icon: 'solar:widget-5-bold-duotone',
    },
  ]

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      <EventsHero />
      <StatsBar items={statsItems} overlap={false} />

      <Container className="mt-6 sm:mt-8 lg:mt-10">
        <div className="flex flex-col gap-8 pb-14 lg:flex-row lg:items-start sm:pb-16 lg:pb-20">
          {/* Left column (sticky, fixed width ~280px on desktop) */}
          <aside className="w-full lg:w-[280px] lg:shrink-0 lg:sticky lg:top-24 z-30">
            <EventsFilter sectors={sectors} />
          </aside>

          {/* Right column (scrollable events grid or empty state) */}
          <main className="flex-1 min-w-0">
            {hasEvents ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-10 lg:p-16">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-slate-50 text-[#0b1426]">
                    <CalendarDays className="h-7 w-7" strokeWidth={1.5} />
                  </div>

                  <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#0b1426] lg:text-[2rem]">
                    {hasActiveFilters ? t.events.listNoMatchTitle : t.events.listEmptyTitle}
                  </h2>

                  <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-slate-600">
                    {hasActiveFilters ? t.events.listNoMatchDescription : t.events.listEmptyDescription}
                  </p>

                  <div className="mb-12 flex flex-col justify-center gap-2.5 sm:flex-row">
                    <Button asChild className="h-11 gap-2 rounded-md bg-[#8B0000] px-5 text-sm font-semibold text-white hover:bg-[#6B0000]">
                      <Link href="/sectors">
                        <LayoutGrid className="h-4 w-4" />
                        {t.events.exploreSectors}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 gap-2 rounded-md border-slate-300 bg-white px-5 text-sm font-semibold text-[#0b1426] hover:bg-slate-50">
                      <Link href="/contact">
                        <Mail className="h-4 w-4" />
                        {t.hero.contactUs}
                      </Link>
                    </Button>
                  </div>

                  {sectors.length > 0 && (
                    <div className="border-t border-slate-200 pt-8 text-start">
                      <p
                        className={`mb-4 text-[11px] font-semibold text-slate-500 ${isRTL ? 'tracking-normal' : 'uppercase tracking-[0.14em]'}`}
                      >
                        {t.events.availableSectors}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sectors.map((sector) => (
                          <Link
                            key={sector.id}
                            href={`/sectors/${sector.slug}`}
                            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#0b1426] hover:text-[#0b1426]"
                          >
                            {isRTL ? sector.name_ar || sector.name : sector.name || sector.name_ar}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </Container>

      <ContactBanner
        title={t.events.contactBanner.title}
        description={t.events.contactBanner.description}
        ctaLabel={t.events.contactBanner.cta}
        ctaHref="/contact"
      />
    </div>
  )
}
