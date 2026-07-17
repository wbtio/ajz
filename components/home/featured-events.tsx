'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { MapPin } from 'lucide-react'
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

  const displayEvents = realEvents.slice(0, 3)

  function parseDateForBadge(dateStr: string | null, locale: string) {
    if (!dateStr) return { day: '', month: '', year: '' }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return { day: '', month: '', year: '' }
    const day = String(d.getDate()).padStart(2, '0')
    const month = d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-US', { month: 'short' })
    const year = String(d.getFullYear())
    return { day, month, year }
  }

  return (
    <section className="bg-white py-4 lg:py-6" data-purpose="featured-events">
      <Container>
        <SectionHeader
          title={t.homepage.events.title}
          action={{ label: t.homepage.events.viewAll, href: '/events' }}
        />

        {displayEvents.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-base font-bold text-slate-800">الفعاليات الخاصة بعام 2026 انتهت، ونعمل حالياً على تجهيز فعاليات عام 2027.</p>
            <p className="mt-2 text-sm text-slate-500">سيتم الإعلان عن الفعاليات الجديدة فور جاهزيتها.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5 mt-4 lg:mt-5">
          {displayEvents.map((event, index) => {
            const { day, month, year } = parseDateForBadge(event.date, locale)
            const hasImage = !!event.src

            return (
              <motion.article
                key={event.id || index}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_QUINT }}
                whileHover={shouldReduceMotion ? {} : { y: -5 }}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/70 transition-colors duration-300 hover:border-slate-300"
              >
                <Link
                  href="/events"
                  className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B0000] rounded-2xl"
                  aria-label={event.title}
                />

                {/* Card Image */}
                <div className="relative aspect-[3/1] w-full overflow-hidden bg-slate-100 shrink-0">
                  {hasImage ? (
                    <>
                      <Image
                        src={event.src as string}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-sky-100 via-white to-lime-500" />
                  )}

                  {/* Date Badge */}
                  {(event.date && day) && (
                    <div className="absolute top-0 start-3 bg-white text-slate-900 px-3 py-2 text-center z-10 leading-tight rounded-b-lg shadow-sm">
                      <span className="block text-lg sm:text-xl font-black">{day}</span>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">{month}</span>
                      <span className="block text-[10px] font-semibold text-slate-400">{year}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-sm lg:text-base font-extrabold mb-2 text-slate-900 transition-colors duration-300 group-hover:text-[#8b0000] leading-snug line-clamp-2 text-balance">
                    {event.title}
                  </h3>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <p className="font-semibold text-slate-700 line-clamp-1">{event.location}</p>
                    </div>
                  )}

                  {/* Tag Pill */}
                  <span className="mt-auto inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {event.tag}
                  </span>
                </div>
              </motion.article>
            )
          })}
        </div>
        )}
      </Container>
    </section>
  )
}
