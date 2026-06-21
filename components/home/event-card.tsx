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
      <div data-impeccable-variants="349e334a" data-impeccable-variant-count="3" style={{ display: "contents" }}>
        {/* impeccable-variants-start 349e334a */}
        {/* Original */}
        <div data-impeccable-variant="original">
          <Link
            href={`/events/${event.id}`}
            className="group flex w-full flex-col overflow-hidden rounded-lg border border-[#001a33]/10 bg-white transition-all duration-300 hover:border-[#8B0000]/30 hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)]"
          >
            {/* Image Header — compact widescreen aspect ratio */}
            <div data-impeccable-variants="2bfb7f4a" data-impeccable-variant-count="4" style={{ display: "contents" }}>
              {/* impeccable-variants-start 2bfb7f4a */}
              {/* Original */}
              <div data-impeccable-variant="original">
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
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#001a33] p-4 text-center select-none relative">
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
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#001a33] shadow-sm">
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
                        isFree ? 'bg-[#16a34a] text-white' : 'bg-[#001a33] text-white'
                      }`}
                    >
                      {priceLabel}
                    </span>
                  </div>
                </div>
              </div>
              {/* Variants: insert below this line */}
              <style data-impeccable-css="2bfb7f4a">{`
                @scope ([data-impeccable-variant="1"]) {
                  :scope > .v1-header {
                    position: relative;
                    aspect-ratio: 16/5;
                    width: 100%;
                    overflow: hidden;
                  }
                  :scope[data-p-strip-position="top"] .v1-strip {
                    top: 0;
                    bottom: auto;
                    border-top: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                  }
                  :scope > .v1-header .v1-strip {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem 0.75rem;
                    background: rgba(0, 26, 51, 0.85);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    z-index: 10;
                  }
                  :scope[data-p-backdrop-blur="true"] .v1-strip {
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                  }
                }

                @scope ([data-impeccable-variant="2"]) {
                  :scope > .v2-header {
                    position: relative;
                    aspect-ratio: 16/5;
                    width: 100%;
                    overflow: hidden;
                  }
                  :scope > .v2-header .v2-badge-col {
                    position: absolute;
                    top: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    z-index: 10;
                  }
                  :scope[data-p-badge-align="left"] .v2-badge-col {
                    left: 0.75rem;
                    right: auto;
                  }
                  :scope[data-p-badge-align="right"] .v2-badge-col {
                    right: 0.75rem;
                    left: auto;
                  }
                  :scope > .v2-header .v2-accent-line {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    z-index: 5;
                  }
                  :scope[data-p-badge-align="left"] .v2-accent-line {
                    left: 0;
                    right: auto;
                  }
                  :scope[data-p-badge-align="right"] .v2-accent-line {
                    right: 0;
                    left: auto;
                  }
                }

                @scope ([data-impeccable-variant="3"]) {
                  :scope > .v3-header {
                    position: relative;
                    aspect-ratio: 16/5;
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                  }
                  :scope[data-p-split-ratio="60-40"] .v3-img-part { width: 60%; }
                  :scope[data-p-split-ratio="60-40"] .v3-text-part { width: 40%; }
                  :scope[data-p-split-ratio="70-30"] .v3-img-part { width: 70%; }
                  :scope[data-p-split-ratio="70-30"] .v3-text-part { width: 30%; }
                  :scope[data-p-split-ratio="80-20"] .v3-img-part { width: 80%; }
                  :scope[data-p-split-ratio="80-20"] .v3-text-part { width: 20%; }

                  :scope > .v3-header .v3-img-part {
                    height: 100%;
                    position: relative;
                  }
                  :scope > .v3-header .v3-text-part {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: #001a33;
                    padding: 0.5rem;
                    color: white;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                  }
                  :scope[data-p-bg-tint="true"] .v3-text-part {
                    background: #8B0000;
                  }
                }

                @scope ([data-impeccable-variant="4"]) {
                  :scope > .v4-header {
                    position: relative;
                    aspect-ratio: 16/5;
                    width: 100%;
                    overflow: hidden;
                  }
                  :scope > .v4-header::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: #16a34a;
                    opacity: var(--p-glow-intensity, 0.4);
                    box-shadow: 0 0 8px #16a34a;
                    transition: opacity 0.3s;
                    z-index: 10;
                  }
                  :scope > .v4-header:hover::after {
                    opacity: calc(var(--p-glow-intensity, 0.4) * 1.5);
                  }
                  :scope[data-p-reveal-speed="fast"] .v4-img {
                    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
                  }
                  :scope[data-p-reveal-speed="normal"] .v4-img {
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                  }
                  :scope[data-p-reveal-speed="smooth"] .v4-img {
                    transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
                  }
                }
              `}</style>

              {/* Variant 1: Meridian Glass */}
              <div
                data-impeccable-variant="1"
                data-impeccable-params='[
                  {"id":"backdrop-blur","kind":"toggle","default":true,"label":"Backdrop Blur"},
                  {"id":"strip-position","kind":"steps","default":"bottom","label":"Position","options":[
                    {"value":"bottom","label":"Bottom"},
                    {"value":"top","label":"Top"}
                  ]}
                ]'
                className="w-full"
              >
                <div className="v1-header relative aspect-[16/5] w-full overflow-hidden bg-slate-100">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#001a33] to-[#1e3a5f] p-4 text-center select-none relative">
                      <Calendar size={20} className="text-white/20 mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8B0000]">
                        {event.sector ? (isRTL ? 'القطاع الاستراتيجي' : 'Strategic Sector') : (isRTL ? 'فعالية JAZ' : 'JAZ Event')}
                      </span>
                    </div>
                  )}

                  {/* Glassmorphic strip */}
                  <div className="v1-strip">
                    <div className="flex items-center gap-2">
                      {event.featured && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-[#8B0000] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                          <Sparkles className="h-2 w-2" />
                          {isRTL ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {eventTypeLabel && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white flex items-center gap-1">
                          {event.status === 'published' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                          )}
                          {eventTypeLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#f7e382]">
                      {priceLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant 2: Sovereign Badge Pillar */}
              <div
                data-impeccable-variant="2"
                data-impeccable-params='[
                  {"id":"badge-align","kind":"steps","default":"left","label":"Alignment","options":[
                    {"value":"left","label":"Left"},
                    {"value":"right","label":"Right"}
                  ]},
                  {"id":"accent-weight","kind":"range","min":0,"max":1,"step":0.2,"default":0.6,"label":"Accent Weight"}
                ]'
                style={{ display: "none" }}
                className="w-full"
              >
                <div className="v2-header relative aspect-[16/5] w-full overflow-hidden bg-slate-100">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#001a33] p-4 text-center select-none relative">
                      <Calendar size={20} className="text-white/20 mb-1.5" />
                    </div>
                  )}

                  {/* Authority Accent Line */}
                  <div 
                    className="v2-accent-line" 
                    style={{ 
                      backgroundColor: event.event_type === 'international' ? '#16a34a' : '#8B0000',
                      opacity: 'var(--p-accent-weight, 0.6)' 
                    }} 
                  />

                  {/* Vertical Badges */}
                  <div className="v2-badge-col">
                    {event.featured && (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-[#8B0000] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-md">
                        {isRTL ? 'مميز' : 'Featured'}
                      </span>
                    )}
                    {eventTypeLabel && (
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#001a33] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-md border border-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                        {eventTypeLabel}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-sm bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#001a33] shadow-md">
                      {priceLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant 3: Editorial Split-Screen */}
              <div
                data-impeccable-variant="3"
                data-impeccable-params='[
                  {"id":"split-ratio","kind":"steps","default":"70-30","label":"Split Ratio","options":[
                    {"value":"60-40","label":"60 / 40"},
                    {"value":"70-30","label":"70 / 30"},
                    {"value":"80-20","label":"80 / 20"}
                  ]},
                  {"id":"bg-tint","kind":"toggle","default":false,"label":"Sovereign Red Bg"}
                ]'
                style={{ display: "none" }}
                className="w-full"
              >
                <div className="v3-header relative aspect-[16/5] w-full overflow-hidden bg-slate-100">
                  {/* Image Column */}
                  <div className="v3-img-part">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200">
                        <Calendar size={18} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="v3-text-part">
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#f7e382] text-center mb-1">
                      {priceLabel}
                    </span>
                    {eventTypeLabel && (
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-white/80 text-center">
                        {eventTypeLabel}
                      </span>
                    )}
                    {event.featured && (
                      <div className="mt-2 text-[#8B0000] bg-white rounded-full p-1">
                        <Sparkles className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variant 4: Premium Interactive Reveal */}
              <div
                data-impeccable-variant="4"
                data-impeccable-params='[
                  {"id":"glow-intensity","kind":"range","min":0,"max":1,"step":0.1,"default":0.4,"label":"Glow Intensity"},
                  {"id":"reveal-speed","kind":"steps","default":"normal","label":"Reveal Speed","options":[
                    {"value":"fast","label":"Fast"},
                    {"value":"normal","label":"Normal"},
                    {"value":"smooth","label":"Smooth"}
                  ]}
                ]'
                style={{ display: "none" }}
                className="w-full"
              >
                <div className="v4-header relative aspect-[16/5] w-full overflow-hidden bg-slate-100">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="v4-img object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#001a33] p-4 text-center select-none relative">
                      <Calendar size={20} className="text-white/20 mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8B0000]">
                        {event.sector ? (isRTL ? 'القطاع الاستراتيجي' : 'Strategic Sector') : (isRTL ? 'فعالية JAZ' : 'JAZ Event')}
                      </span>
                    </div>
                  )}

                  {/* Dynamic Reveal Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-40" />

                  {/* Clean layout float badges */}
                  <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {event.featured && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-[#8B0000] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                          <Sparkles className="h-2.5 w-2.5" />
                          {isRTL ? 'مميز' : 'Featured'}
                        </span>
                      )}
                      {eventTypeLabel && (
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#001a33] shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                          {eventTypeLabel}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap bg-[#16a34a] text-white shadow-sm">
                      {priceLabel}
                    </span>
                  </div>
                </div>
              </div>
              {/* impeccable-variants-end 2bfb7f4a */}
            </div>

            {/* Card Content — spacious layout with optimized visual rhythm */}
            <div className="flex flex-1 flex-col gap-3 p-5 text-start">
              {/* Title — Title tier per DESIGN.md */}
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#001a33] transition-colors group-hover:text-[#8B0000]">
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
              <div className="mt-auto pt-3.5 border-t border-[#001a33]/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#001a33]">
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
        </div>
        {/* Variants: insert below this line */}
        <style data-impeccable-css="349e334a">{`
          @scope ([data-impeccable-variant="1"]) {
            :scope > .v1-card-link {
              display: flex;
              flex-direction: row;
              width: 100%;
              overflow: hidden;
              border-radius: 8px;
              border: 1px solid rgba(15, 23, 42, 0.1);
              background: #ffffff;
              transition: all 0.3s ease;
              text-decoration: none;
            }
            :scope > .v1-card-link:hover {
              border-color: rgba(139, 0, 0, 0.3);
              box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
            }
            :scope > .v1-card-link .v1-img-col {
              position: relative;
              height: 100%;
              min-height: 180px;
            }
            :scope[data-p-img-width="30%"] .v1-img-col { width: 30%; }
            :scope[data-p-img-width="35%"] .v1-img-col { width: 35%; }
            :scope[data-p-img-width="40%"] .v1-img-col { width: 40%; }
            :scope[data-p-img-width="30%"] .v1-info-col { width: 70%; }
            :scope[data-p-img-width="35%"] .v1-info-col { width: 65%; }
            :scope[data-p-img-width="40%"] .v1-info-col { width: 60%; }

            :scope > .v1-card-link .v1-info-col {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              flex: 1;
            }
            :scope[data-p-card-padding="compact"] .v1-info-col {
              padding: 0.75rem;
              gap: 0.5rem;
            }
            :scope[data-p-card-padding="spacious"] .v1-info-col {
              padding: 1.25rem;
              gap: 0.75rem;
            }
          }

          @scope ([data-impeccable-variant="2"]) {
            :scope > .v2-card-link {
              display: flex;
              flex-direction: column;
              width: 100%;
              overflow: hidden;
              border-radius: 8px;
              border: 1px solid rgba(15, 23, 42, 0.1);
              background: #001a33;
              border-top: 3px solid #8B0000;
              transition: all 0.3s ease;
              padding: 1.5rem;
              color: white;
              text-decoration: none;
            }
            :scope[data-p-accent-tint="true"] .v2-card-link {
              background: linear-gradient(135deg, #8B0000 0%, #001a33 100%);
              border-top-color: #f7e382;
            }
            :scope > .v2-card-link:hover {
              box-shadow: 0 12px 32px rgba(139, 0, 0, 0.15);
              border-color: rgba(247, 227, 130, 0.3);
            }
            :scope[data-p-font-size-title="base"] .v2-title {
              font-size: 1rem;
            }
            :scope[data-p-font-size-title="lg"] .v2-title {
              font-size: 1.25rem;
            }
          }

          @scope ([data-impeccable-variant="3"]) {
            :scope > .v3-card-link {
              display: flex;
              flex-direction: column;
              width: 100%;
              overflow: hidden;
              border-radius: 8px;
              border: 1px solid rgba(15, 23, 42, 0.1);
              background: rgba(255, 255, 255, var(--p-bg-glass-opacity, 0.8));
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              transition: all 0.3s ease;
              text-decoration: none;
            }
            :scope[data-p-shadow-depth="flat"] .v3-card-link {
              box-shadow: none;
            }
            :scope[data-p-shadow-depth="tactile"] .v3-card-link {
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
            }
            :scope[data-p-shadow-depth="meridian-lift"] .v3-card-link {
              box-shadow: 0 16px 40px rgba(139, 0, 0, 0.06);
            }
          }
        `}</style>

        {/* Variant 1: Meridian Horizon split landscape layout */}
        <div
          data-impeccable-variant="1"
          data-impeccable-params='[
            {"id":"img-width","kind":"steps","default":"35%","label":"Image Width","options":[
              {"value":"30%","label":"30%"},
              {"value":"35%","label":"35%"},
              {"value":"40%","label":"40%"}
            ]},
            {"id":"card-padding","kind":"steps","default":"spacious","label":"Padding","options":[
              {"value":"compact","label":"Compact"},
              {"value":"spacious","label":"Spacious"}
            ]}
          ]'
          className="w-full"
        >
          <Link
            href={`/events/${event.id}`}
            className="v1-card-link group"
          >
            {/* Image Column */}
            <div className="v1-img-col overflow-hidden bg-slate-100">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#001a33] p-2 text-center select-none relative">
                  <Calendar size={20} className="text-white/20" />
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="v1-info-col text-start">
              <div>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {event.featured && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#8B0000] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                      {isRTL ? 'مميز' : 'Featured'}
                    </span>
                  )}
                  {eventTypeLabel && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#f5f7fa] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#001a33]">
                      {eventTypeLabel}
                    </span>
                  )}
                </div>

                <h3 className="line-clamp-1 text-sm font-bold text-[#001a33] group-hover:text-[#8B0000] transition-colors">
                  {title}
                </h3>

                {description && (
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500 mt-0.5">
                    {description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#001a33]/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B0000]">
                  {priceLabel}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B0000] transition-colors group-hover:text-[#6B0000]">
                  <span>{ctaLabel}</span>
                  <Arrow className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Variant 2: Obsidian Frame dark typographic theme */}
        <div
          data-impeccable-variant="2"
          data-impeccable-params='[
            {"id":"accent-tint","kind":"toggle","default":false,"label":"Sovereign Red Bg"},
            {"id":"font-size-title","kind":"steps","default":"base","label":"Title Size","options":[
              {"value":"base","label":"Base"},
              {"value":"lg","label":"Large"}
            ]}
          ]'
          style={{ display: "none" }}
          className="w-full"
        >
          <Link
            href={`/events/${event.id}`}
            className="v2-card-link group"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {event.featured && (
                  <span className="inline-flex items-center gap-1 rounded bg-[#8B0000] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                    {isRTL ? 'مميز' : 'Featured'}
                  </span>
                )}
                {eventTypeLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white border border-white/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                    {eventTypeLabel}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f7e382]">
                {priceLabel}
              </span>
            </div>

            <h3 className="v2-title font-bold leading-snug text-white transition-colors group-hover:text-[#f7e382] mb-2">
              {title}
            </h3>

            {description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-300 opacity-90 mb-4">
                {description}
              </p>
            )}

            <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-300">
                {formatEventDate(event.date, event.end_date, locale)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f7e382] transition-colors group-hover:text-white">
                <span>{ctaLabel}</span>
                <Arrow className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* Variant 3: Sovereign Glass Panel */}
        <div
          data-impeccable-variant="3"
          data-impeccable-params='[
            {"id":"bg-glass-opacity","kind":"range","min":0.5,"max":0.95,"step":0.05,"default":0.8,"label":"Glass Opacity"},
            {"id":"shadow-depth","kind":"steps","default":"tactile","label":"Shadow Depth","options":[
              {"value":"flat","label":"Flat"},
              {"value":"tactile","label":"Tactile"},
              {"value":"meridian-lift","label":"Meridian Lift"}
            ]}
          ]'
          style={{ display: "none" }}
          className="w-full"
        >
          <Link
            href={`/events/${event.id}`}
            className="v3-card-link group"
          >
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
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#001a33] p-4 text-center select-none relative">
                  <Calendar size={20} className="text-white/20 mb-1.5" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8B0000]">
                    {event.sector ? (isRTL ? 'القطاع الاستراتيجي' : 'Strategic Sector') : (isRTL ? 'فعالية JAZ' : 'JAZ Event')}
                  </span>
                </div>
              )}

              {/* Overlay row */}
              <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {event.featured && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#8B0000] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" />
                      {isRTL ? 'مميز' : 'Featured'}
                    </span>
                  )}
                  {eventTypeLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#001a33] shadow-sm">
                      {event.status === 'published' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                      )}
                      {eventTypeLabel}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center rounded-sm bg-[#001a33] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap text-white shadow-sm">
                  {priceLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5 text-start">
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#001a33] transition-colors group-hover:text-[#8B0000]">
                {title}
              </h3>
              {description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {description}
                </p>
              )}

              <div className="mt-auto pt-3.5 border-t border-[#001a33]/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#001a33]">
                  <Calendar size={13} className="shrink-0 text-slate-400" />
                  <span className="line-clamp-1">
                    {formatEventDate(event.date, event.end_date, locale)}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8B0000] transition-colors group-hover:text-[#6B0000]">
                  <span>{ctaLabel}</span>
                  <Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
        {/* impeccable-variants-end 349e334a */}
      </div>
    </motion.div>
  )
}
