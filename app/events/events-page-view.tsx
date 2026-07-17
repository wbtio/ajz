'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { EventsHero } from './_components/events-hero'
import { EventsFilter } from './events-filter'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { Container } from '@/components/ui/container'
import type { Event, Sector } from '@/lib/database.types'

interface EventsPageStats {
  total: number
  upcoming: number
  countries: number
  divisions: number
  years: number
}

interface EventsPageViewProps {
  sectors: Sector[]
  events: Event[]
  hasActiveFilters: boolean
  stats: EventsPageStats
}

// 5 Custom Mock Events with Local PNG illustrations
const MOCK_EVENTS: (Event & { participation_roles: string[] })[] = [
  {
    id: 'mock-1',
    title: 'VivaTech 2027',
    title_ar: 'معرض فيفاتك للتكنولوجيا 2027',
    description: "Join JAZ at Europe's biggest startup and tech event in Paris. Access exclusive registration and delegate coordination.",
    description_ar: 'انضم إلى جاز في أكبر حدث للشركات الناشئة والتكنولوجيا في أوروبا بباريس. احصل على دعم التسجيل وتنسيق الوفود.',
    date: '2027-06-02T09:00:00.000Z',
    end_date: '2027-06-05T18:00:00.000Z',
    location: 'Paris Expo Porte de Versailles',
    location_ar: 'معرض باريس إكسبو بورت دي فرساي',
    country: 'France',
    country_ar: 'فرنسا',
    event_type: 'international',
    sector: 'technology',
    image_url: '/events/event_vivatech.png',
    price: 0,
    show_price: true,
    featured: true,
    status: 'published',
    capacity: 500,
    awards: null,
    conference_config: null,
    coordinators: null,
    created_at: null,
    format: null,
    html_content: null,
    html_content_url: null,
    mentorship: null,
    mentorship_ar: null,
    registration_config: null,
    sector_id: null,
    sub_sector: 'ict',
    sub_sector_ar: null,
    updated_at: null,
    updated_by: null,
    participation_roles: ['participation', 'exhibitor', 'visitor'],
  },
  {
    id: 'mock-2',
    title: 'Arab Health 2027',
    title_ar: 'معرض الصحة العربي 2027',
    description: 'The leading medical exhibition in the MENA region. Explore innovations in digital health, telemedicine, and medical devices.',
    description_ar: 'المعرض الطبي الرائد في منطقة الشرق الأوسط وشمال أفريقيا. استكشف الابتكارات في الصحة الرقمية والتعليم الطبي.',
    date: '2027-01-25T09:00:00.000Z',
    end_date: '2027-01-28T18:00:00.000Z',
    location: 'Dubai World Trade Centre',
    location_ar: 'مركز دبي التجاري العالمي',
    country: 'United Arab Emirates',
    country_ar: 'الإمارات العربية المتحدة',
    event_type: 'international',
    sector: 'medical',
    image_url: '/events/event_arab_health.png',
    price: 0,
    show_price: true,
    featured: true,
    status: 'published',
    capacity: 1000,
    awards: null,
    conference_config: null,
    coordinators: null,
    created_at: null,
    format: null,
    html_content: null,
    html_content_url: null,
    mentorship: null,
    mentorship_ar: null,
    registration_config: null,
    sector_id: null,
    sub_sector: 'healthcare-pharma',
    sub_sector_ar: null,
    updated_at: null,
    updated_by: null,
    participation_roles: ['participation', 'speaker', 'exhibitor'],
  },
  {
    id: 'mock-3',
    title: 'Iraq Energy & Industry Expo 2027',
    title_ar: 'معرض العراق للطاقة والصناعة 2027',
    description: 'Connecting global energy leaders with local opportunities in Iraq. Focusing on renewable energy, smart grids, and sustainable infrastructure.',
    description_ar: 'ربط قادة الطاقة العالميين بالفرص المحلية في العراق. التركيز على الطاقة المتجددة والشبكات الذكية والبنية التحتية المستدامة.',
    date: '2027-04-12T09:00:00.000Z',
    end_date: '2027-04-14T18:00:00.000Z',
    location: 'Baghdad International Fairground',
    location_ar: 'أرض معرض بغداد الدولي',
    country: 'Iraq',
    country_ar: 'العراق',
    event_type: 'local',
    sector: 'industrie',
    image_url: '/events/event_iraq_energy.png',
    price: 0,
    show_price: true,
    featured: false,
    status: 'published',
    capacity: 800,
    awards: null,
    conference_config: null,
    coordinators: null,
    created_at: null,
    format: null,
    html_content: null,
    html_content_url: null,
    mentorship: null,
    mentorship_ar: null,
    registration_config: null,
    sector_id: null,
    sub_sector: 'chemistry-energy-materials',
    sub_sector_ar: null,
    updated_at: null,
    updated_by: null,
    participation_roles: ['participation', 'visitor'],
  },
  {
    id: 'mock-4',
    title: 'Global Smart Cities Forum 2027',
    title_ar: 'منتدى المدن الذكية العالمي 2027',
    description: 'Shaping the future of urban environments. Discussing IoT, sustainable transport, and eco-friendly municipal solutions.',
    description_ar: 'تشكيل مستقبل البيئات الحضرية. مناقشة إنترنت الأشياء والنقل المستدام والحلول البلدية الصديقة للبيئة.',
    date: '2027-09-18T09:00:00.000Z',
    end_date: '2027-09-20T18:00:00.000Z',
    location: 'Basra International Plaza',
    location_ar: 'ساحة البصرة الدولية',
    country: 'Iraq',
    country_ar: 'العراق',
    event_type: 'local',
    sector: 'industrie',
    image_url: '/events/event_smart_cities.png',
    price: 0,
    show_price: true,
    featured: true,
    status: 'published',
    capacity: 600,
    awards: null,
    conference_config: null,
    coordinators: null,
    created_at: null,
    format: null,
    html_content: null,
    html_content_url: null,
    mentorship: null,
    mentorship_ar: null,
    registration_config: null,
    sector_id: null,
    sub_sector: 'construction',
    sub_sector_ar: null,
    updated_at: null,
    updated_by: null,
    participation_roles: ['participation', 'speaker'],
  },
  {
    id: 'mock-5',
    title: 'Erbil Academic Cooperation & Education Fair 2027',
    title_ar: 'معرض أربيل للتعاون الأكاديمي والتعليم 2027',
    description: 'Bridging the gap between Iraqi universities and international academic institutions. Explore scholarships and partnerships.',
    description_ar: 'سد الفجوة بين الجامعات العراقية والمؤسسات الأكاديمية الدولية. استكشف المنح الدراسية والشراكات الأكاديمية.',
    date: '2027-11-05T09:00:00.000Z',
    end_date: '2027-11-07T18:00:00.000Z',
    location: 'Erbil International Fairground',
    location_ar: 'أرض معرض أربيل الدولي',
    country: 'Iraq',
    country_ar: 'العراق',
    event_type: 'local',
    sector: 'academia',
    image_url: '/events/event_education_fair.png',
    price: 0,
    show_price: true,
    featured: false,
    status: 'published',
    capacity: 1500,
    awards: null,
    conference_config: null,
    coordinators: null,
    created_at: null,
    format: null,
    html_content: null,
    html_content_url: null,
    mentorship: null,
    mentorship_ar: null,
    registration_config: null,
    sector_id: null,
    sub_sector: 'education-training',
    sub_sector_ar: null,
    updated_at: null,
    updated_by: null,
    participation_roles: ['participation', 'visitor'],
  },
]

function getSectorName(sectorSlug: string | null | undefined, isRTL: boolean) {
  if (!sectorSlug) return isRTL ? 'عام' : 'General'
  const slug = sectorSlug.toLowerCase()
  if (slug.includes('medical') || slug.includes('health')) {
    return isRTL ? 'الرعاية الصحية وعلوم الحياة' : 'Healthcare & Life Sciences'
  }
  if (slug.includes('tech')) {
    return isRTL ? 'التحول الرقمي والتكنولوجيا' : 'Digital Transformation & Tech'
  }
  if (slug.includes('industrie') || slug.includes('energy') || slug.includes('industrial')) {
    return isRTL ? 'التطوير الصناعي والتجاري' : 'Industrial & Commercial'
  }
  if (slug.includes('academia') || slug.includes('education') || slug.includes('academic')) {
    return isRTL ? 'الشؤون المهنية والأكاديمية' : 'Academic & Professional'
  }
  return sectorSlug
}

function parseDateForBadge(dateStr: string, locale: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString(locale, { month: 'short' })
  const year = String(d.getFullYear())
  return { day, month, year }
}

export function EventsPageView({ sectors, events, stats }: EventsPageViewProps) {
  const { locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedSubSector, setSelectedSubSector] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [participationTypes, setParticipationTypes] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState('')

  // Pagination: incrementally reveal more events when the list is long
  const PAGE_SIZE = 6
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Changing the main sector resets any selected sub-sector
  const handleSectorChange = (val: string) => {
    setSelectedSector(val)
    setSelectedSubSector('')
    setVisibleCount(PAGE_SIZE)
  }

  // Use only database events (mock events removed - they caused 404s)
  const allEvents = useMemo(() => {
    // Events remain stored in the database, but the public catalogue is paused
    // while the 2027 calendar is being prepared.
    return []
  }, [events])

  // Extract unique countries
  const uniqueCountries = useMemo(() => {
    const list = allEvents
      .map((e) => (isRTL ? e.country_ar || e.country : e.country || e.country_ar))
      .filter(Boolean) as string[]
    return Array.from(new Set(list)).sort()
  }, [allEvents, isRTL])

  // Filtered Events logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // 1. Search Query Filter
      if (search) {
        const query = search.toLowerCase()
        const title = ((isRTL ? event.title_ar || event.title : event.title || event.title_ar) || '').toLowerCase()
        const desc = ((isRTL ? event.description_ar || event.description : event.description || event.description_ar) || '').toLowerCase()
        const loc = ((isRTL ? event.location_ar || event.location : event.location || event.location_ar) || '').toLowerCase()
        const countryName = ((isRTL ? event.country_ar || event.country : event.country || event.country_ar) || '').toLowerCase()
        if (
          !title.includes(query) &&
          !desc.includes(query) &&
          !loc.includes(query) &&
          !countryName.includes(query)
        ) {
          return false
        }
      }

      // 2. Sector Filter
      if (selectedSector) {
        if (event.sector !== selectedSector) return false
      }

      // 2b. Sub-sector Filter
      if (selectedSubSector) {
        if (event.sub_sector !== selectedSubSector) return false
      }

      // 3. Country Filter
      if (selectedCountry) {
        const eventCountry = isRTL ? event.country_ar || event.country : event.country || event.country_ar
        if (eventCountry !== selectedCountry) return false
      }

      // 4. Month Filter
      if (selectedMonth) {
        const m = new Date(event.date).getMonth().toString()
        if (m !== selectedMonth) return false
      }

      // 5. Participation Type Filter
      if (participationTypes.length > 0) {
        const roles = (event as Event & { participation_roles?: string[] }).participation_roles || ['participation']
        const hasMatch = participationTypes.some((t) => roles.includes(t))
        if (!hasMatch) return false
      }

      // 6. Price Filter (filter-only — price is never displayed on the event itself)
      if (priceFilter) {
        const isFree = !event.price || Number(event.price) <= 0
        if (priceFilter === 'free' && !isFree) return false
        if (priceFilter === 'paid' && isFree) return false
      }

      return true
    })
  }, [allEvents, search, selectedSector, selectedSubSector, selectedCountry, selectedMonth, participationTypes, priceFilter, isRTL])

  // Wrappers that reset pagination whenever a filter changes
  const resetPage = () => setVisibleCount(PAGE_SIZE)
  const setSelectedSubSectorPaginated = (v: string) => { setSelectedSubSector(v); resetPage() }
  const setSelectedCountryPaginated = (v: string) => { setSelectedCountry(v); resetPage() }
  const setSelectedMonthPaginated = (v: string) => { setSelectedMonth(v); resetPage() }
  const setParticipationTypesPaginated = (v: string[]) => { setParticipationTypes(v); resetPage() }
  const setSearchPaginated = (v: string) => { setSearch(v); resetPage() }
  const setPriceFilterPaginated = (v: string) => { setPriceFilter(v); resetPage() }

  const handlePopularSearch = (query: string, sectorSlug?: string) => {
    if (sectorSlug) {
      setSelectedSector(sectorSlug)
      setSelectedSubSector('')
      setSearch('')
    } else {
      setSearch(query)
      setSelectedSector('')
      setSelectedSubSector('')
    }
    setVisibleCount(PAGE_SIZE)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSelectedSector('')
    setSelectedSubSector('')
    setSelectedCountry('')
    setSelectedMonth('')
    setParticipationTypes([])
    setPriceFilter('')
    setVisibleCount(PAGE_SIZE)
  }

  // Stats bar data
  const statsItems: StatsBarItem[] = isRTL
    ? [
        { value: 250, label: 'الفعاليات القادمة', icon: 'solar:calendar-bold-duotone', suffix: '+' },
        { value: 40, label: 'البلدان الشريكة', icon: 'solar:earth-bold-duotone', suffix: '+' },
        { value: 4, label: 'القطاعات الاستراتيجية', icon: 'solar:widget-5-bold-duotone', suffix: '' },
        { value: 5000, label: 'المشاركون العالميون', icon: 'solar:users-group-rounded-bold-duotone', suffix: '+', format: 'compact' },
      ]
    : [
        { value: 250, label: 'Upcoming Events', icon: 'solar:calendar-bold-duotone', suffix: '+' },
        { value: 40, label: 'Countries', icon: 'solar:earth-bold-duotone', suffix: '+' },
        { value: 4, label: 'Key Sectors', icon: 'solar:widget-5-bold-duotone', suffix: '' },
        { value: 5000, label: 'Global Participants', icon: 'solar:users-group-rounded-bold-duotone', suffix: '+', format: 'compact' },
      ]

  // Localized texts for layout elements
  const pageTexts = isRTL
    ? {
        noResultsTitle: 'نعمل حالياً على تجهيز فعاليات عام 2027',
        noResultsDesc: 'الفعاليات الخاصة بعام 2026 انتهت، وسيتم الإعلان عن فعاليات 2027 فور جاهزيتها.',
        ctaTitle: 'هل تحتاج إلى دعوة أو دعم للمشاركة؟',
        ctaDesc: 'يمكن لفريقنا المساعدة في خطابات الدعوة وتنسيق الشراكات ووثائق دعم التأشيرة وتسهيل مشاركتكم.',
        ctaBtnRequest: 'طلب دعم الدعوة',
        ctaBtnContact: 'اتصل بفريقنا',
        supportBadge: 'دعم الدعوة متاح',
        sectorLabel: 'القطاع الاستراتيجي',
        gridTitle: 'الفعاليات والمعارض',
        gridSubtitle: 'نعمل حالياً على تجهيز فعاليات عام 2027.',
        resultsCount: (n: number) => `${n} فعالية`,
        loadMore: 'تحميل المزيد من الفعاليات',
        showingRange: (shown: number, total: number) => `عرض ${shown} من أصل ${total} فعالية`,
      }
    : {
        noResultsTitle: 'No Matching Events Found',
        noResultsDesc: 'Try adjusting your search queries or filter categories to discover other events.',
        ctaTitle: 'Need Invitation or Participation Support?',
        ctaDesc: 'Our team can assist with invitation letters, partnership matchmaking, visa support documents, and event coordination.',
        ctaBtnRequest: 'Request Invitation Support',
        ctaBtnContact: 'Contact Our Team',
        supportBadge: 'Invitation Support Available',
        sectorLabel: 'Sector',
        gridTitle: 'Events & Exhibitions',
        gridSubtitle: 'Browse upcoming and completed events and register your attendance through JAZ.',
        resultsCount: (n: number) => `${n} events`,
        loadMore: 'Load more events',
        showingRange: (shown: number, total: number) => `Showing ${shown} of ${total} events`,
      }

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      {/* Hero Section */}
      <EventsHero
        searchQuery={search}
        onSearchChange={setSearchPaginated}
        onPopularSearchClick={handlePopularSearch}
      />

      {/* Stats Bar */}
      <StatsBar items={statsItems} overlap={false} />

      {/* Main Grid Area */}
      <main className="bg-white py-16 lg:py-24">
        <Container>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
            {/* Sidebar Filters */}
            {false && <EventsFilter
              sectors={sectors}
              uniqueCountries={uniqueCountries}
              selectedSector={selectedSector}
              setSelectedSector={handleSectorChange}
              selectedSubSector={selectedSubSector}
              setSelectedSubSector={setSelectedSubSectorPaginated}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountryPaginated}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonthPaginated}
              participationTypes={participationTypes}
              setParticipationTypes={setParticipationTypesPaginated}
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilterPaginated}
              onClear={handleClearFilters}
            />}

            {/* Events Grid Section */}
            <section className="flex-grow min-w-0">
              {/* Section header + count */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8 lg:mb-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.15] text-balance">
                    {pageTexts.gridTitle}
                  </h2>
                </div>
                <span className="text-sm font-bold text-slate-500 shrink-0">
                  {pageTexts.resultsCount(filteredEvents.length)}
                </span>
              </div>

{filteredEvents.length > 0 ? (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                  {filteredEvents.slice(0, visibleCount).map((event, index) => {
                    const title = isRTL ? event.title_ar || event.title : event.title || event.title_ar || ''
                    const locationText = isRTL
                      ? [event.location_ar || event.location, event.country_ar || event.country].filter(Boolean).join('، ')
                      : [event.location || event.location_ar, event.country || event.country_ar].filter(Boolean).join(', ')
                    const sectorName = getSectorName(event.sector, isRTL)
                    const { day, month, year } = parseDateForBadge(event.date, locale)

                    return (
                      <motion.article
                        key={event.id}
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.45, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={shouldReduceMotion ? {} : { y: -5 }}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/70 transition-colors duration-300 hover:border-slate-300"
                      >
                        <Link href={`/events/${event.id}`} className="absolute inset-0 z-20" aria-label={title} />

                        {/* Event Card Image */}
                        <div className="relative aspect-[3/1] w-full overflow-hidden bg-slate-100 shrink-0">
                          {event.image_url ? (
                            <Image
                              src={event.image_url}
                              alt={title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-b from-sky-100 via-white to-lime-500" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />

                          {/* Date Badge */}
                          <div className="absolute top-0 start-3 bg-white text-slate-900 px-3 py-2 text-center z-10 leading-tight rounded-b-lg shadow-sm">
                            <span className="block text-lg sm:text-xl font-black">{day}</span>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">{month}</span>
                            <span className="block text-[10px] font-semibold text-slate-400">{year}</span>
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="p-4 flex-grow flex flex-col">
                          <h3 className="text-sm lg:text-base font-extrabold mb-2 text-slate-900 transition-colors duration-300 group-hover:text-[#8b0000] leading-snug line-clamp-2 text-balance">
                            {title}
                          </h3>

                          {/* Location */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <p className="font-semibold text-slate-700 line-clamp-1">{locationText}</p>
                          </div>

                          {/* Sector pill */}
                          <span className="mt-auto inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            {sectorName}
                          </span>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>

                {/* Pagination: Load More */}
                {filteredEvents.length > visibleCount && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-bold text-slate-800 transition-all duration-200 hover:border-[#8b0000] hover:text-[#8b0000] active:scale-95"
                    >
                      <span>{pageTexts.loadMore}</span>
                      <svg className="w-4 h-4 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                    <span className="text-xs font-semibold text-slate-500">
                      {pageTexts.showingRange(Math.min(visibleCount, filteredEvents.length), filteredEvents.length)}
                    </span>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{pageTexts.noResultsTitle}</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">{pageTexts.noResultsDesc}</p>
                </div>
              )}
            </section>
          </div>
        </Container>
      </main>

      {/* Bottom CTA Banner */}
      <section className="bg-[#0b1426] text-white py-5 lg:py-8" data-purpose="cta-banner">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                <MapPin className="h-8 w-8 text-[#b08d4b]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-balance">{pageTexts.ctaTitle}</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{pageTexts.ctaDesc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/invitation-support"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#8b0000] px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#6b0000] active:scale-95"
              >
                <span>{pageTexts.ctaBtnRequest}</span>
                <svg className="w-4 h-4 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/10 active:scale-95"
              >
                <span>{pageTexts.ctaBtnContact}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
