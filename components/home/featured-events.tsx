'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import type { Tables } from '@/lib/database.types'

type Event = Tables<'events'>

interface FeaturedEventsProps {
  events?: Event[]
}

export function FeaturedEvents({ events = [] }: FeaturedEventsProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const defaultFlyers = [
    {
      title: isRTL ? 'معرض التجارة الدولي' : 'International Trade Expo',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLs76bUT2w4ZlhE6oksmJ_C1sWvzime-8lUfqdl94sa36DQbnPv31v7ckdKsT5ntV39OhJFQpsifWnzw9IRh8-p7knlz1pgXM-CyLYjYctrVAWznVEwhIeQVXbc3i3GWEVxnKpojfRjmCsbwoZOWB4VOJehB1g5UE5qbafUzP8O8TUaF_1BRPQ84ZRnX4C09Q9r58gfeEEMreTBzNOb-lSGr5l6h08ZEl7oztf3yttX6icQu34gO-uJgqmE',
    },
    {
      title: isRTL ? 'القمة العالمية للتكنولوجيا' : 'Global Technology Summit',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLqd5ScjLXNZy-aCW4ytlKTxbqtfQj726Olmcrtq_Vfe66Z2zmQKye1B6DlwfzP28inkduu4yfj7lhfQJFZq5k6kZIIY2Ku_zqt3WTdSvp8I0Z7DPfkvlxaOqXMpCcRtOPoTaUZ0gMZDciCEjrZ-kbN1KlJl8lamfksHsl1skj6pm-XYZTUX9ESNb22U1ahQfix9lBeuA3SvJtsrOJKd-7cEEXXSNM8_ouQ_S1-oXI7WyXQRrPMaoKE7bQ',
    },
    {
      title: isRTL ? 'منتدى الشراكة الاستراتيجية' : 'Strategic Partnership Forum',
      src: 'https://lh3.googleusercontent.com/aida/AP1WRLuu5PjobJp5xC7cp9yPZzzzkhz1zzWq6YVlNy4kIRVlmEoqwOobBslJy9-UClz12NaTZIeqE6oWyZntiVUmVzwAG4xpVcY4Vbhwqc4Ssayyvv63CSUnh7t0skBs7fOOkTaUIMDkTvcV4uFwDfoYvvT5aHWsOftTswVCvFEl6Rry8en5LYwgCB6XYuDmIgx7uDD3p7SETYeEA25xaANQyNh1fuwIaLhCpimRYXYjCzyJHz2cBteTAyNSeug',
    },
  ]

  // If there are real events in DB with images, we can merge them or fallback
  const displayEvents = events.filter(e => e.image_url).slice(0, 3)

  return (
    <div className="w-full text-start" data-purpose="featured-events">
      <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.events.title}
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
        {defaultFlyers.map((flyer, index) => (
          <motion.div
            key={index}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
            className="min-w-[150px] sm:min-w-[170px] flex-1 aspect-[2/3] relative rounded-xl overflow-hidden shadow-md group cursor-pointer"
          >
            <Link href="/events" className="absolute inset-0 z-20" aria-label={flyer.title} />
            <Image
              src={flyer.src}
              alt={flyer.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 150px, 200px"
            />
            {/* Soft gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-white text-start leading-tight">
                {flyer.title}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
