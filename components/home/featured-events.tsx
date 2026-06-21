'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'
import type { Tables } from '@/lib/database.types'

type Event = Tables<'events'>

interface FeaturedEventsProps {
  events?: Event[]
}

export function FeaturedEvents({ events = [] }: FeaturedEventsProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const defaultFlyers = [
    {
      title: isRTL ? 'معرض التجارة الدولي' : 'International Trade Expo',
      tag: isRTL ? 'معرض' : 'Exhibition',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLs76bUT2w4ZlhE6oksmJ_C1sWvzime-8lUfqdl94sa36DQbnPv31v7ckdKsT5ntV39OhJFQpsifWnzw9IRh8-p7knlz1pgXM-CyLYjYctrVAWznVEwhIeQVXbc3i3GWEVxnKpojfRjmCsbwoZOWB4VOJehB1g5UE5qbafUzP8O8TUaF_1BRPQ84ZRnX4C09Q9r58gfeEEMreTBzNOb-lSGr5l6h08ZEl7oztf3yttX6icQu34gO-uJgqmE',
    },
    {
      title: isRTL ? 'القمة العالمية للتكنولوجيا' : 'Global Technology Summit',
      tag: isRTL ? 'قمة' : 'Summit',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLqd5ScjLXNZy-aCW4ytlKTxbqtfQj726Olmcrtq_Vfe66Z2zmQKye1B6DlwfzP28inkduu4yfj7lhfQJFZq5k6kZIIY2Ku_zqt3WTdSvp8I0Z7DPfkvlxaOqXMpCcRtOPoTaUZ0gMZDciCEjrZ-kbN1KlJl8lamfksHsl1skj6pm-XYZTUX9ESNb22U1ahQfix9lBeuA3SvJtsrOJKd-7cEEXXSNM8_ouQ_S1-oXI7WyXQRrPMaoKE7bQ',
    },
    {
      title: isRTL ? 'منتدى الشراكة الاستراتيجية' : 'Strategic Partnership Forum',
      tag: isRTL ? 'منتدى' : 'Forum',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLuu5PjobJp5xC7cp9yPZzzzkhz1zzWq6YVlNy4kIRVlmEoqwOobBslJy9-UClz12NaTZIeqE6oWyZntiVUmVzwAG4xpVcY4Vbhwqc4Ssayyvv63CSUnh7t0skBs7fOOkTaUIMDkTvcV4uFwDfoYvvT5aHWsOftTswVCvFEl6Rry8en5LYwgCB6XYuDmIgx7uDD3p7SETYeEA25xaANQyNh1fuwIaLhCpimRYXYjCzyJHz2cBteTAyNSeug',
    },
  ]

  const realEvents = events
    .filter((e) => e.image_url)
    .slice(0, 3)
    .map((e) => ({
      title: (isRTL ? e.title_ar || e.title : e.title || e.title_ar) ?? '',
      tag: isRTL ? 'فعالية' : 'Event',
      src: e.image_url as string,
    }))

  const fillers = defaultFlyers.filter(
    (d) => !realEvents.some((r) => r.title === d.title),
  )
  const displayEvents = [...realEvents, ...fillers].slice(0, 3)

  return (
    <section className="bg-white py-8 lg:py-12" data-purpose="featured-events">
      <Container>
        <SectionHeader
          title={t.homepage.events.title}
          action={{ label: t.homepage.events.viewAll, href: '/events' }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 mt-6 lg:mt-8">
          {displayEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="relative aspect-[4/5] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer"
            >
              <Link
                href="/events"
                className="absolute inset-0 z-20"
                aria-label={event.title}
              />
              <Image
                src={event.src}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Readability gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 z-10 flex flex-col gap-1.5">
                <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {event.tag}
                </span>
                <span className="text-base lg:text-lg font-extrabold text-white leading-snug text-balance">
                  {event.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
