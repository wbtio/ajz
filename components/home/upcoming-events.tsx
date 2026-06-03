'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { CalendarDaysIcon as Calendar, ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight } from 'lucide-animated'
import { EventCard } from './event-card'
import { useI18n } from '@/lib/i18n'
import type { Tables } from '@/lib/database.types'

type Event = Tables<'events'>

interface UpcomingEventsProps {
  events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  // We show up to 3 upcoming events for a clean, premium minimalist layout
  const upcomingEvents = events.slice(0, 3)

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-slate-100 relative overflow-hidden" dir={dir} lang={locale}>
      {/* Decorative subtle background grid pattern */}
      <div className="absolute inset-0 home-grid-pattern opacity-10 pointer-events-none" />
      
      <Container className="relative z-10 max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="text-start max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl leading-tight">
              {t.events.upcoming}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.events.upcomingSubtitle}
            </p>
          </div>
          <div className="shrink-0 flex justify-start">
            <Link href="/calendar">
              <Button variant="outline" className="h-11 px-6 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-sm rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98]">
                {t.events.viewAll}
                <Arrow className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </Link>
          </div>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm"
          >
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-6">{t.events.noEvents}</p>
            <Link href="/contact" className="inline-block">
              <Button variant="outline" className="h-10 px-6 rounded-xl">
                {t.hero.contactUs}
              </Button>
            </Link>
          </motion.div>
        )}
      </Container>
    </section>
  )
}
