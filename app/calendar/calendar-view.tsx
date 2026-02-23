'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Event } from '@/lib/database.types'

interface CalendarViewProps {
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

export function CalendarView({ events }: CalendarViewProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const ChevPrev = isRTL ? ChevronRight : ChevronLeft
  const ChevNext = isRTL ? ChevronLeft : ChevronRight
  const monthTabsRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [activeMonthKey, setActiveMonthKey] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const isScrollingToRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const stickyBarTop = isScrolled ? 42 : 98

  // Get unique event types and locations for filters
  const eventTypes = useMemo(() => {
    const types = new Set<string>()
    events.forEach(e => { if (e.event_type) types.add(e.event_type) })
    return Array.from(types)
  }, [events])

  const eventLocations = useMemo(() => {
    const locs = new Set<string>()
    events.forEach(e => {
      const loc = isRTL ? (e.location_ar || e.location) : (e.location || e.location_ar || '')
      if (loc) locs.add(loc)
    })
    return Array.from(locs)
  }, [events, isRTL])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const title = isRTL ? (event.title_ar || event.title) : (event.title || event.title_ar || '')
      const matchesSearch = !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || event.event_type === selectedType
      const loc = isRTL ? (event.location_ar || event.location) : (event.location || event.location_ar || '')
      const matchesLocation = selectedLocation === 'all' || loc === selectedLocation
      return matchesSearch && matchesType && matchesLocation
    })
  }, [events, searchQuery, selectedType, selectedLocation, isRTL])

  // Group filtered events by month
  const eventMonths = useMemo(() => {
    const monthMap = new Map<string, Event[]>()
    filteredEvents.forEach((event) => {
      const d = new Date(event.date)
      const key = getMonthKey(d)
      if (!monthMap.has(key)) monthMap.set(key, [])
      monthMap.get(key)!.push(event)
    })
    return Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredEvents])

  // Set initial active month
  useEffect(() => {
    if (eventMonths.length > 0 && !activeMonthKey) {
      setActiveMonthKey(eventMonths[0][0])
    }
  }, [eventMonths, activeMonthKey])

  // IntersectionObserver to track which month section is visible
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const visibleSections = new Map<string, number>()

    sectionRefs.current.forEach((el, key) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.set(key, entry.intersectionRatio)
            } else {
              visibleSections.delete(key)
            }

            if (!isScrollingToRef.current) {
              // Find the most visible section
              let maxRatio = 0
              let maxKey = ''
              visibleSections.forEach((ratio, k) => {
                if (ratio > maxRatio) {
                  maxRatio = ratio
                  maxKey = k
                }
              })
              if (maxKey) {
                setActiveMonthKey(maxKey)
              }
            }
          })
        },
        { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], rootMargin: '-150px 0px -30% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [eventMonths])

  // Scroll active tab into view in the tabs bar
  const activeMonthIndex = eventMonths.findIndex(([k]) => k === activeMonthKey)
  useEffect(() => {
    if (monthTabsRef.current && activeMonthIndex >= 0) {
      const btn = monthTabsRef.current.children[activeMonthIndex] as HTMLElement
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeMonthIndex])

  // Click on month tab → scroll to that section
  const scrollToMonth = useCallback((monthKey: string) => {
    const el = sectionRefs.current.get(monthKey)
    if (el) {
      isScrollingToRef.current = true
      setActiveMonthKey(monthKey)
      const offset = stickyBarTop + 110
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
      setTimeout(() => { isScrollingToRef.current = false }, 800)
    }
  }, [stickyBarTop])

  // Navigate prev/next month
  const goToPrevMonth = () => {
    if (activeMonthIndex > 0) scrollToMonth(eventMonths[activeMonthIndex - 1][0])
  }
  const goToNextMonth = () => {
    if (activeMonthIndex < eventMonths.length - 1) scrollToMonth(eventMonths[activeMonthIndex + 1][0])
  }

  // Register section ref
  const setSectionRef = useCallback((monthKey: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(monthKey, el)
    } else {
      sectionRefs.current.delete(monthKey)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <Container>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1a1a2e] mb-2">
            {t.calendarPage.title}
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            {t.calendarPage.subtitle}
          </p>
        </motion.div>
      </Container>

      {/* Sticky Month Tabs + Filters */}
      <div
        className="sticky z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300"
        style={{ top: `${stickyBarTop}px` }}
      >
        <Container>
          {/* Month Navigation Strip */}
          {eventMonths.length > 0 && (
            <div className="flex items-center gap-2 pt-3 pb-2">
              <button
                onClick={goToPrevMonth}
                disabled={activeMonthIndex <= 0}
                className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevPrev className="w-4 h-4" />
              </button>

              <div ref={monthTabsRef} className="flex-1 flex gap-1 overflow-x-auto no-scrollbar py-1">
                {eventMonths.map(([monthKey]) => {
                  const d = new Date(monthKey + '-01')
                  const isActive = monthKey === activeMonthKey
                  return (
                    <button
                      key={monthKey}
                      onClick={() => scrollToMonth(monthKey)}
                      className={`relative flex-shrink-0 px-4 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap z-10 ${
                        isActive
                          ? 'text-white font-bold'
                          : 'text-gray-400 hover:text-gray-600 font-medium'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="calendarActiveTab"
                          className="absolute inset-0 bg-[#1a1a2e] rounded-lg"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 text-sm lg:text-base">
                        {getFullMonthName(d, isRTL ? 'ar-IQ' : 'en-US')}
                      </span>
                      <span className={`relative z-10 text-sm lg:text-base ${isRTL ? 'mr-1' : 'ml-1'} ${isActive ? 'text-white/70' : 'text-gray-300'}`}>
                        {d.getFullYear()}
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={goToNextMonth}
                disabled={activeMonthIndex >= eventMonths.length - 1}
                className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-red-500 hover:text-red-600 hover:border-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevNext className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 pb-3">
            <div className="relative w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.calendarPage.search}
                className="w-full h-9 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:border-gray-500 focus:ring-0 focus:outline-none transition-all px-3"
              />
            </div>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 bg-white border border-gray-300 rounded-md text-sm text-gray-600 px-3 pr-8 appearance-none cursor-pointer focus:border-gray-500 focus:ring-0 focus:outline-none"
              >
                <option value="all">{t.calendarPage.filterCategory}</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'international' ? (isRTL ? 'دولية' : 'International') :
                     type === 'local' ? (isRTL ? 'محلية' : 'Local') : type}
                  </option>
                ))}
              </select>
              <ChevronLeft className="absolute top-1/2 -translate-y-1/2 ltr:right-2 rtl:left-2 w-3.5 h-3.5 text-gray-400 pointer-events-none rotate-[-90deg]" />
            </div>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-9 bg-white border border-gray-300 rounded-md text-sm text-gray-600 px-3 pr-8 appearance-none cursor-pointer focus:border-gray-500 focus:ring-0 focus:outline-none"
              >
                <option value="all">{t.calendarPage.filterLocation}</option>
                {eventLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronLeft className="absolute top-1/2 -translate-y-1/2 ltr:right-2 rtl:left-2 w-3.5 h-3.5 text-gray-400 pointer-events-none rotate-[-90deg]" />
            </div>
          </div>
        </Container>
      </div>

      {/* All Events - grouped by month */}
      <Container>
        <div className="mt-8" />
        {eventMonths.length > 0 ? (
          <div className="space-y-12">
            {eventMonths.map(([monthKey, monthEvents]) => {
              const monthDate = new Date(monthKey + '-01')
              return (
                <div
                  key={monthKey}
                  ref={(el) => setSectionRef(monthKey, el)}
                >
                  <div className="flex gap-6 lg:gap-10">
                    {/* Month & Year label on the side */}
                    <div className="hidden md:flex flex-col items-center flex-shrink-0 w-24 relative">
                      <div className="text-center sticky" style={{ top: `${stickyBarTop + 110}px` }}>
                        <div className="text-2xl lg:text-3xl font-black text-[#1a1a2e] leading-tight">
                          {getFullMonthName(monthDate, isRTL ? 'ar-IQ' : 'en-US')}
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-gray-400">
                          {monthDate.getFullYear()}
                        </div>
                      </div>
                      <div className="w-px bg-gray-200 mx-auto mt-3 flex-1" />
                    </div>

                    {/* Events list */}
                    <div className="flex-1 space-y-8">
                      {/* Mobile month label */}
                      <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4 }}
                        className="md:hidden mb-2"
                      >
                        <span className="text-xl font-black text-[#1a1a2e]">
                          {getFullMonthName(monthDate, isRTL ? 'ar-IQ' : 'en-US')}
                        </span>
                        <span className="text-base font-bold text-gray-400 mx-2">
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
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* Text Content */}
                                <div className="flex-1 min-w-0 order-2 lg:order-1">
                                  <h3 className="text-xl font-bold text-[#1a1a2e] group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
                                    {title}
                                  </h3>

                                  {description && (
                                    <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-3">
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
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {event.event_type && (
                                      <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider bg-[#1a1a2e] text-white px-3 py-1 rounded">
                                        {event.event_type === 'international' ? (isRTL ? 'فعالية دولية' : 'INTERNATIONAL EVENT') :
                                         event.event_type === 'local' ? (isRTL ? 'فعالية محلية' : 'LOCAL EVENT') :
                                         event.event_type.toUpperCase()}
                                      </span>
                                    )}
                                    {event.featured && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-3 py-1 rounded">
                                        <Sparkles className="w-3 h-3" />
                                        {t.events.featured}
                                      </span>
                                    )}
                                    {event.sector && (
                                      <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded">
                                        {event.sector}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Image */}
                                <div className="relative w-full lg:w-[340px] h-52 lg:h-48 flex-shrink-0 rounded-lg overflow-hidden order-1 lg:order-2">
                                  {event.image_url ? (
                                    <Image
                                      src={event.image_url}
                                      alt={title}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 flex items-center justify-center">
                                      <Calendar className="w-14 h-14 text-white/15" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>

                            {/* Separator */}
                            {index < monthEvents.length - 1 && (
                              <div className="border-b border-gray-100 mt-8" />
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
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t.events.noEvents}</p>
          </div>
        )}
      </Container>
    </div>
  )
}
