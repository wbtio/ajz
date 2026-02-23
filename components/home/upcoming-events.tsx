'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Event } from '@/lib/database.types'

interface UpcomingEventsProps {
  events: Event[]
}

function getFullMonthName(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getFullDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  // Group events by month (show only first two upcoming months)
  const eventMonths = useMemo(() => {
    const monthMap = new Map<string, Event[]>()
    events.forEach((event) => {
      const d = new Date(event.date)
      const key = getMonthKey(d)
      if (!monthMap.has(key)) monthMap.set(key, [])
      monthMap.get(key)!.push(event)
    })

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 2)
  }, [events])

  return (
    <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a2e] mb-1">
              {t.events.upcoming}
            </h2>
            <p className="text-gray-400 text-sm max-w-lg">
              {t.events.upcomingSubtitle}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/calendar">
              <Button variant="outline" className="h-10 px-5 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 font-medium text-sm">
                {t.events.viewAll}
                <Arrow className={`w-3.5 h-3.5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </Link>
          </motion.div>
        </div>

        {events.length > 0 ? (
          <div className="space-y-10">
            {eventMonths.map(([monthKey, monthEvents]) => {
              const monthDate = new Date(monthKey + '-01')
              return (
                <div key={monthKey}>
                  <div className="flex gap-6 lg:gap-10">
                    {/* Month & Year label on the side */}
                    <div className="hidden md:flex flex-col items-center flex-shrink-0 w-20 relative">
                      <div className="text-center sticky top-36">
                        <div className="text-xl lg:text-2xl font-black text-[#1a1a2e] leading-tight">
                          {getFullMonthName(monthDate, isRTL ? 'ar-IQ' : 'en-US')}
                        </div>
                        <div className="text-sm font-bold text-gray-400">
                          {monthDate.getFullYear()}
                        </div>
                      </div>
                      <div className="w-px bg-gray-200 mx-auto mt-3 flex-1" />
                    </div>

                    {/* Events list */}
                    <div className="flex-1 space-y-6">
                      {/* Mobile month label */}
                      <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4 }}
                        className="md:hidden mb-2"
                      >
                        <span className="text-lg font-black text-[#1a1a2e]">
                          {getFullMonthName(monthDate, isRTL ? 'ar-IQ' : 'en-US')}
                        </span>
                        <span className="text-sm font-bold text-gray-400 mx-1.5">
                          {monthDate.getFullYear()}
                        </span>
                      </motion.div>

                      {monthEvents.map((event, index) => {
                        const eventDate = new Date(event.date)
                        const title = isRTL ? (event.title_ar || event.title) : (event.title || event.title_ar || '')
                        const description = isRTL ? (event.description_ar || event.description) : (event.description || event.description_ar || '')

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                          >
                            <Link href={`/events/${event.id}`} className="group block">
                              <div className="flex flex-col lg:flex-row gap-5">
                                {/* Text Content */}
                                <div className="flex-1 min-w-0 order-2 lg:order-1">
                                  <h3 className="text-lg font-bold text-[#1a1a2e] group-hover:text-blue-700 transition-colors mb-1.5 line-clamp-2">
                                    {title}
                                  </h3>

                                  {description && (
                                    <p className="text-gray-500 text-sm leading-relaxed mb-2.5 line-clamp-3">
                                      {description}
                                    </p>
                                  )}

                                  {/* Date */}
                                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                    <span>{getFullDate(eventDate, isRTL ? 'ar-IQ' : 'en-US')}</span>
                                    {event.end_date && (
                                      <>
                                        <span className="text-gray-300">-</span>
                                        <span>{getFullDate(new Date(event.end_date), isRTL ? 'ar-IQ' : 'en-US')}</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Badges */}
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {event.event_type && (
                                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-[#1a1a2e] text-white px-2.5 py-0.5 rounded">
                                        {event.event_type === 'international' ? (isRTL ? 'فعالية دولية' : 'INTERNATIONAL EVENT') :
                                         event.event_type === 'local' ? (isRTL ? 'فعالية محلية' : 'LOCAL EVENT') :
                                         event.event_type.toUpperCase()}
                                      </span>
                                    )}
                                    {event.featured && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        {t.events.featured}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Image */}
                                <div className="relative w-full lg:w-[280px] h-44 lg:h-40 flex-shrink-0 rounded-lg overflow-hidden order-1 lg:order-2">
                                  {event.image_url ? (
                                    <Image
                                      src={event.image_url}
                                      alt={title}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 flex items-center justify-center">
                                      <Calendar className="w-12 h-12 text-white/15" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>

                            {/* Separator */}
                            {index < monthEvents.length - 1 && (
                              <div className="border-b border-gray-100 mt-6" />
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-6">{t.events.noEvents}</p>
            <Link href="/contact" className="inline-block">
              <Button variant="outline" className="h-10 px-6">
                {t.hero.contactUs}
              </Button>
            </Link>
          </motion.div>
        )}
      </Container>
    </section>
  )
}
