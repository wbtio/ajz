'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { format } from 'date-fns'
import { ar as arLocale, enUS } from 'date-fns/locale'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'
import type { Tables } from '@/lib/database.types'

type Event = Tables<'events'>

interface FeaturedEventsProps {
  events?: Event[]
}

interface DisplayEvent {
  id: string
  title: string
  tag: string
  src: string | null
  date: string | null
  location: string | null
}

const EASE_QUINT = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function FeaturedEvents({ events = [] }: FeaturedEventsProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const defaultFlyers: DisplayEvent[] = [
    {
      id: 'default-1',
      title: isRTL ? 'معرض التجارة الدولي' : 'International Trade Expo',
      tag: isRTL ? 'معرض' : 'Exhibition',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLs76bUT2w4ZlhE6oksmJ_C1sWvzime-8lUfqdl94sa36DQbnPv31v7ckdKsT5ntV39OhJFQpsifWnzw9IRh8-p7knlz1pgXM-CyLYjYctrVAWznVEwhIeQVXbc3i3GWEVxnKpojfRjmCsbwoZOWB4VOJehB1g5UE5qbafUzP8O8TUaF_1BRPQ84ZRnX4C09Q9r58gfeEEMreTBzNOb-lSGr5l6h08ZEl7oztf3yttX6icQu34gO-uJgqmE',
      date: null,
      location: null,
    },
    {
      id: 'default-2',
      title: isRTL ? 'القمة العالمية للتكنولوجيا' : 'Global Technology Summit',
      tag: isRTL ? 'قمة' : 'Summit',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLqd5ScjLXNZy-aCW4ytlKTxbqtfQj726Olmcrtq_Vfe66Z2zmQKye1B6DlwfzP28inkduu4yfj7lhfQJFZq5k6kZIIY2Ku_zqt3WTdSvp8I0Z7DPfkvlxaOqXMpCcRtOPoTaUZ0gMZDciCEjrZ-kbN1KlJl8lamfksHsl1skj6pm-XYZTUX9ESNb22U1ahQfix9lBeuA3SvJtsrOJKd-7cEEXXSNM8_ouQ_S1-oXI7WyXQRrPMaoKE7bQ',
      date: null,
      location: null,
    },
    {
      id: 'default-3',
      title: isRTL ? 'منتدى الشراكة الاستراتيجية' : 'Strategic Partnership Forum',
      tag: isRTL ? 'منتدى' : 'Forum',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLuu5PjobJp5xC7cp9yPZzzzkhz1zzWq6YVlNy4kIRVlmEoqwOobBslJy9-UClz12NaTZIeqE6oWyZntiVUmVzwAG4xpVcY4Vbhwqc4Ssayyvv63CSUnh7t0skBs7fOOkTaUIMDkTvcV4uFwDfoYvvT5aHWsOftTswVCvFEl6Rry8en5LYwgCB6XYuDmIgx7uDD3p7SETYeEA25xaANQyNh1fuwIaLhCpimRYXYjCzyJHz2cBteTAyNSeug',
      date: null,
      location: null,
    },
  ]

  const realEvents: DisplayEvent[] = events.slice(0, 3).map((e) => ({
    id: e.id,
    title: (isRTL ? e.title_ar || e.title : e.title || e.title_ar) ?? '',
    tag: isRTL
      ? (e.event_type === 'international' ? 'دولية' : e.event_type) || 'فعالية'
      : (e.event_type === 'international' ? 'International' : e.event_type) || 'Event',
    src: e.image_url,
    date: e.date,
    location: isRTL
      ? e.location_ar || e.location || null
      : e.location || e.location_ar || null,
  }))

  const displayEvents =
    realEvents.length > 0 ? realEvents.slice(0, 3) : defaultFlyers

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', {
        locale: isRTL ? arLocale : enUS,
      })
    } catch {
      return null
    }
  }

  return (
    <section className="bg-white py-4 lg:py-6" data-purpose="featured-events">
      <Container>
        <SectionHeader
          title={t.homepage.events.title}
          action={{ label: t.homepage.events.viewAll, href: '/events' }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5 mt-4 lg:mt-5">
          {displayEvents.map((event, index) => {
            const formattedDate = formatDate(event.date)
            const hasImage = !!event.src

            return (
              <motion.div
                key={event.id || index}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_QUINT }}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-slate-200/60 group cursor-pointer"
              >
                <Link
                  href="/events"
                  className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B0000] rounded-2xl"
                  aria-label={event.title}
                />

                {hasImage ? (
                  <>
                    <Image
                      src={event.src as string}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                  </>
                ) : (
                  <>
                    {/* Solid navy card for events without images */}
                    <div className="absolute inset-0 bg-[#0b1426]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0b1426] to-[#1a2a4a]" />
                  </>
                )}

                {/* Content overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 lg:p-5">
                  {/* Tag at top for no-image cards, bottom for image cards */}
                  {hasImage ? (
                    <div className="mt-auto flex flex-col gap-2">
                      <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm rtl:tracking-normal rtl:normal-case">
                        {event.tag}
                      </span>
                      <span className="text-base lg:text-lg font-extrabold text-white leading-snug text-balance">
                        {event.title}
                      </span>
                      {(formattedDate || event.location) && (
                        <div className="flex flex-col gap-1 mt-1">
                          {formattedDate && (
                            <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                              <Icon icon="solar:calendar-bold-duotone" className="w-3.5 h-3.5 shrink-0" />
                              {formattedDate}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                              <Icon icon="solar:map-point-bold-duotone" className="w-3.5 h-3.5 shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="inline-flex w-fit items-center rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 rtl:tracking-normal rtl:normal-case">
                          {event.tag}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-base lg:text-lg font-black text-white leading-snug text-balance">
                          {event.title}
                        </h3>
                        {(formattedDate || event.location) && (
                          <div className="flex flex-col gap-1 mt-1">
                            {formattedDate && (
                              <span className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                                <Icon icon="solar:calendar-bold-duotone" className="w-3.5 h-3.5 shrink-0 text-[#b08d4b]" />
                                {formattedDate}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                                <Icon icon="solar:map-point-bold-duotone" className="w-3.5 h-3.5 shrink-0 text-[#b08d4b]" />
                                <span className="line-clamp-2">{event.location}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
