'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CalendarDaysIcon as Calendar, SparklesIcon as Sparkles } from 'lucide-animated'
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Tables } from '@/lib/database.types'

type Event = Tables<'events'>

interface EventCardProps {
  event: Event
}

function formatEventDate(startDateStr: string, endDateStr: string | null | undefined, locale: string) {
  const start = new Date(startDateStr)
  const isRTL = locale.startsWith('ar')

  if (!endDateStr) {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(start)
  }

  const end = new Date(endDateStr)
  
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()
  const startMonth = start.getMonth()
  const endMonth = end.getMonth()
  const startDay = start.getDate()
  const endDay = end.getDate()

  // Same day
  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(start)
  }

  // Same month and year
  if (startYear === endYear && startMonth === endMonth) {
    const monthStr = new Intl.DateTimeFormat(locale, { month: 'short' }).format(start)
    if (isRTL) {
      return `${startDay}—${endDay} ${monthStr} ${startYear}`
    } else {
      return `${monthStr} ${startDay}—${endDay}, ${startYear}`
    }
  }

  // Same year, different months
  if (startYear === endYear) {
    const startMonthStr = new Intl.DateTimeFormat(locale, { month: 'short' }).format(start)
    const endMonthStr = new Intl.DateTimeFormat(locale, { month: 'short' }).format(end)
    if (isRTL) {
      return `${startDay} ${startMonthStr} — ${endDay} ${endMonthStr} ${startYear}`
    } else {
      return `${startMonthStr} ${startDay} — ${endMonthStr} ${endDay}, ${startYear}`
    }
  }

  // Different years
  const startStr = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start)
  const endStr = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end)
  
  return `${startStr} — ${endStr}`
}

export function EventCard({ event }: EventCardProps) {
  const { locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const title = isRTL ? (event.title_ar || event.title) : (event.title || event.title_ar || '')
  const description = isRTL ? (event.description_ar || event.description) : (event.description || event.description_ar || '')
  const locationText = isRTL
    ? [event.location_ar || event.location, event.country_ar || event.country].filter(Boolean).join('، ')
    : [event.location || event.location_ar, event.country || event.country_ar].filter(Boolean).join(', ')

  const eventTypeLabel = event.event_type === 'international'
    ? (isRTL ? 'دولية' : 'International')
    : event.event_type === 'local'
      ? (isRTL ? 'محلية' : 'Local')
      : null

  const isFree = !(event.show_price && event.price && event.price > 0)
  const priceLabel = isFree
    ? (isRTL ? 'مجاني' : 'Free')
    : (isRTL ? `${event.price!.toLocaleString('ar-IQ')} د.ع` : `$${event.price!.toLocaleString()}`)

  const isCompleted = event.status === 'completed'
  const ctaLabel = isCompleted
    ? (isRTL ? 'تفاصيل الفعالية' : 'View Details')
    : (isRTL ? 'سجل الآن' : 'Register')

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full"
    >
      <Link
        href={`/events/${event.id}`}
        className="group flex w-full flex-col overflow-hidden rounded-lg border border-[#0b1426]/10 bg-white transition-all duration-300 hover:border-[#8B0000]/30 hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)]"
      >
        {/* Image Header — compact widescreen aspect ratio */}
        <div className="relative aspect-[16/5] w-full overflow-hidden bg-slate-100">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#0b1426] p-4 text-center select-none relative">
              <Calendar size={20} className="text-white/20 mb-1.5" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8B0000]">
                {event.sector ? (isRTL ? 'القطاع الاستراتيجي' : 'Strategic Sector') : (isRTL ? 'فعالية JAZ' : 'JAZ Event')}
              </span>
              <span className="text-[10px] font-semibold text-white/45 mt-0.5 truncate max-w-[85%] uppercase tracking-wider">
                {event.sector || 'Joint Annual Zone'}
              </span>
            </div>
          )}

          {/* Overlay row — Type + Status (start) · Price (end) */}
          <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {event.featured && (
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#8B0000] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  {isRTL ? 'مميز' : 'Featured'}
                </span>
              )}
              {eventTypeLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0b1426] shadow-sm">
                  {event.status === 'published' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                  )}
                  {event.status === 'completed' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  )}
                  {eventTypeLabel}
                </span>
              )}
            </div>

            <span
              className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap shadow-sm ${
                isFree ? 'bg-[#16a34a] text-white' : 'bg-[#0b1426] text-white'
              }`}
            >
              {priceLabel}
            </span>
          </div>
        </div>

        {/* Card Content — spacious layout with optimized visual rhythm */}
        <div className="flex flex-1 flex-col gap-3 p-5 text-start">
          {/* Title — Title tier per DESIGN.md */}
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#0b1426] transition-colors group-hover:text-[#8B0000]">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          )}

          {/* Location */}
          {locationText && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1">
              <MapPin size={12} className="shrink-0 text-slate-400" />
              <span className="line-clamp-1">{locationText}</span>
            </div>
          )}

          {/* Bottom metadata row — unified, clean action layout */}
          <div className="mt-auto pt-3.5 border-t border-[#0b1426]/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1426]">
              <Calendar size={13} className="shrink-0 text-slate-400" />
              <span className="line-clamp-1">
                {formatEventDate(event.date, event.end_date, locale)}
              </span>
            </div>
            
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8B0000] transition-colors group-hover:text-[#6B0000]">
              <span>{ctaLabel}</span>
              <Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
