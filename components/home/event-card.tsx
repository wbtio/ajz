'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { CountdownTimer } from './countdown-timer'
import { useI18n } from '@/lib/i18n'
import type { Event } from '@/lib/database.types'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-100/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full rounded-[2.5rem]">
      {/* Image & Overlay Section */}
      <div className="relative aspect-[16/11] overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title_ar || event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <Calendar className="w-16 h-16 text-white/10 relative z-10" />
          </div>
        )}
        
        {/* Badges - Floating Style */}
        <div className="absolute top-6 inset-x-6 flex justify-between items-start z-20">
          <div className="flex items-center gap-1.5">
            {event.featured && (
              <div className="bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-2xl shadow-xl border border-yellow-300/50 backdrop-blur-md bg-opacity-95">
                {t.events.featured}
              </div>
            )}
            {event.event_type === 'international' ? (
              <div className="bg-blue-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-2xl shadow-sm border border-blue-400/30">
                {isRTL ? 'دولية' : 'International'}
              </div>
            ) : event.event_type === 'local' ? (
              <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-2xl shadow-sm border border-emerald-400/30">
                {isRTL ? 'محلية' : 'Local'}
              </div>
            ) : null}
          </div>
          {(event.sub_sector || event.sector) && (
            <div className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 ml-auto">
              {isRTL 
                ? (event.sub_sector_ar || event.sector)
                : (event.sub_sector || event.sector)}
            </div>
          )}
        </div>

        {/* Dynamic Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      {/* Content Section - Floating Card Effect */}
      <div className="px-6 pb-6 -mt-16 relative z-30 flex flex-col flex-1">
        <div className="bg-white p-5 rounded-[2rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col flex-1 transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Countdown Area */}
          <div className="mb-6 flex justify-center">
            <CountdownTimer targetDate={event.date} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-gray-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {isRTL ? (event.title_ar || event.title) : (event.title || event.title_ar)}
          </h3>

          {/* Details Grid */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 group/item">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-2xl text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{locale === 'ar' ? 'التاريخ' : 'Date'}</span>
                <span className="text-xs font-black text-gray-700">{formatDate(event.date)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group/item">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-300">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{locale === 'ar' ? 'الموقع' : 'Location'}</span>
                <span className="text-xs font-black text-gray-700 line-clamp-1">
                  {isRTL 
                    ? [event.location_ar || event.location, event.country_ar || event.country].filter(Boolean).join('، ')
                    : [event.location || event.location_ar, event.country || event.country_ar].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Premium Action Button */}
          <Link
            href={`/events/${event.id}`}
            target="_blank"
            className="mt-auto group/btn relative flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-sm transition-all duration-300 shadow-lg shadow-blue-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <span>{t.events.viewDetails}</span>
            <Arrow className={`w-4 h-4 transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
