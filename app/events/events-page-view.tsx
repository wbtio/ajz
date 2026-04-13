'use client'

import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { EventCard } from '@/components/home/event-card'
import { EventsFilter } from './events-filter'
import { Button } from '@/components/ui/button'
import { CalendarDays, LayoutGrid, Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Event, Sector } from '@/lib/database.types'

interface EventsPageViewProps {
  sectors: Sector[]
  events: Event[]
  hasActiveFilters: boolean
}

export function EventsPageView({ sectors, events, hasActiveFilters }: EventsPageViewProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const hasEvents = events.length > 0

  return (
    <div className="bg-white pt-36 pb-12" dir={dir} lang={locale}>
      <Container>
        {hasEvents && <EventsFilter sectors={sectors} />}

        {hasEvents ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-500/5" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-700/8 text-slate-700">
                <CalendarDays className="h-8 w-8" />
              </div>

              <h2 className="mb-4 text-2xl font-bold text-slate-950 lg:text-3xl">
                {hasActiveFilters ? t.events.listNoMatchTitle : t.events.listEmptyTitle}
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
                {hasActiveFilters ? t.events.listNoMatchDescription : t.events.listEmptyDescription}
              </p>

              <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="h-12 gap-2 rounded-2xl bg-slate-800 px-6 hover:bg-slate-700">
                  <Link href="/sectors">
                    <LayoutGrid className="h-4 w-4" />
                    {t.events.exploreSectors}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 gap-2 rounded-2xl border-slate-300 bg-white/70 px-6 text-slate-800 hover:bg-white">
                  <Link href="/contact">
                    <Mail className="h-4 w-4" />
                    {t.hero.contactUs}
                  </Link>
                </Button>
              </div>

              {sectors.length > 0 && (
                <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-6 text-start shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <p
                    className={`mb-4 text-sm font-semibold text-slate-500 ${isRTL ? 'tracking-normal' : 'uppercase tracking-[0.18em]'}`}
                  >
                    {t.events.availableSectors}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((sector) => (
                      <Link
                        key={sector.id}
                        href={`/sectors/${sector.slug}`}
                        className="rounded-xl border border-white/80 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400/40 hover:bg-white hover:text-slate-950"
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
      </Container>
    </div>
  )
}
