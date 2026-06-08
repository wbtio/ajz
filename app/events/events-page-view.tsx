'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { EventsHero } from './_components/events-hero'
import { EventsFilter } from './events-filter'
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
    sub_sector: null,
    sub_sector_ar: null,
    updated_at: null,
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
    sub_sector: null,
    sub_sector_ar: null,
    updated_at: null,
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
    sub_sector: null,
    sub_sector_ar: null,
    updated_at: null,
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
    sub_sector: null,
    sub_sector_ar: null,
    updated_at: null,
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
    sub_sector: null,
    sub_sector_ar: null,
    updated_at: null,
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

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [participationTypes, setParticipationTypes] = useState<string[]>([])

  // Combine database events with mock events
  const allEvents = useMemo(() => {
    // Prevent duplicate entries if database already contains some of the mock IDs
    const dbIds = new Set(events.map((e) => e.id))
    const filteredMocks = MOCK_EVENTS.filter((m) => !dbIds.has(m.id))
    return [...filteredMocks, ...events]
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
        const roles = (event as any).participation_roles || ['participation']
        const hasMatch = participationTypes.some((t) => roles.includes(t))
        if (!hasMatch) return false
      }

      return true
    })
  }, [allEvents, search, selectedSector, selectedCountry, selectedMonth, participationTypes, isRTL])

  const handlePopularSearch = (query: string, sectorSlug?: string) => {
    if (sectorSlug) {
      setSelectedSector(sectorSlug)
      setSearch('')
    } else {
      setSearch(query)
      setSelectedSector('')
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setSelectedSector('')
    setSelectedCountry('')
    setSelectedMonth('')
    setParticipationTypes([])
  }

  // Localized texts for layout elements
  const pageTexts = isRTL
    ? {
        statsUpcoming: 'الفعاليات القادمة',
        statsCountries: 'البلدان الشريكة',
        statsSectors: 'القطاعات الاستراتيجية',
        statsParticipants: 'المشاركون العالميون',
        noResultsTitle: 'لم يتم العثور على فعاليات مطابقة',
        noResultsDesc: 'يرجى تجربة تغيير خيارات التصفية أو البحث للوصول إلى فعاليات أخرى.',
        ctaTitle: 'هل تحتاج إلى دعوة أو دعم للمشاركة؟',
        ctaDesc: 'يمكن لفريقنا المساعدة في خطابات الدعوة وتنسيق الشراكات ووثائق دعم التأشيرة وتسهيل مشاركتكم.',
        ctaBtnRequest: 'طلب دعم الدعوة',
        ctaBtnContact: 'اتصل بفريقنا',
        supportBadge: 'دعم الدعوة متاح',
        sectorLabel: 'القطاع الاستراتيجي',
      }
    : {
        statsUpcoming: 'Upcoming Events',
        statsCountries: 'Countries',
        statsSectors: 'Key Sectors',
        statsParticipants: 'Global Participants',
        noResultsTitle: 'No Matching Events Found',
        noResultsDesc: 'Try adjusting your search queries or filter categories to discover other events.',
        ctaTitle: 'Need Invitation or Participation Support?',
        ctaDesc: 'Our team can assist with invitation letters, partnership matchmaking, visa support documents, and event coordination.',
        ctaBtnRequest: 'Request Invitation Support',
        ctaBtnContact: 'Contact Our Team',
        supportBadge: 'Invitation Support Available',
        sectorLabel: 'Sector',
      }

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      {/* Hero Section */}
      <EventsHero
        searchQuery={search}
        onSearchChange={setSearch}
        onPopularSearchClick={handlePopularSearch}
      />

      {/* Stats Bar */}
      <section className="bg-[#001a33] px-4 sm:px-6 md:px-12 lg:px-20 -mt-2 pb-6" data-purpose="stats-bar">
        <div className="max-w-7xl mx-auto bg-[#0a2a4d]/50 border-t border-gray-700 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
          <div className="border-e border-gray-700 last:border-0">
            <div className="text-lg sm:text-2xl font-bold">+250+</div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">
              {pageTexts.statsUpcoming}
            </div>
          </div>
          <div className="border-e border-gray-700 last:border-0">
            <div className="text-lg sm:text-2xl font-bold">+{uniqueCountries.length > 0 ? uniqueCountries.length + 35 : 40}+</div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">
              {pageTexts.statsCountries}
            </div>
          </div>
          <div className="border-e border-gray-700 last:border-0">
            <div className="text-lg sm:text-2xl font-bold">{sectors.length || 4}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">
              {pageTexts.statsSectors}
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold">5K+</div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">
              {pageTexts.statsParticipants}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <EventsFilter
          sectors={sectors}
          uniqueCountries={uniqueCountries}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          participationTypes={participationTypes}
          setParticipationTypes={setParticipationTypes}
          onClear={handleClearFilters}
        />

        {/* Events Grid Section */}
        <section className="flex-grow">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const title = isRTL ? event.title_ar || event.title : event.title || event.title_ar || ''
                const locationText = isRTL
                  ? [event.location_ar || event.location, event.country_ar || event.country].filter(Boolean).join('، ')
                  : [event.location || event.location_ar, event.country || event.country_ar].filter(Boolean).join(', ')
                const locationDetails = isRTL ? event.location_ar : event.location
                const sectorName = getSectorName(event.sector, isRTL)
                const { day, month, year } = parseDateForBadge(event.date, locale)

                return (
                  <article
                    key={event.id}
                    className="border border-gray-200 rounded-[4px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow bg-white relative group"
                  >
                    {/* Event Card Image */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 shrink-0">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-sky-100 via-white to-lime-500" />
                      )}

                      {/* Date Badge Overlay */}
                      <div className="absolute top-0 start-3 bg-[#001a33] text-white px-3 py-2 text-center z-10 leading-tight rounded-b-[4px]">
                        <span className="block text-lg sm:text-xl font-bold">{day}</span>
                        <span className="block text-[10px] uppercase font-semibold">{month}</span>
                        <span className="block text-[10px]">{year}</span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-4 flex-grow flex flex-col">
                      <Link href={`/events/${event.id}`}>
                        <h3 className="text-base sm:text-lg font-bold mb-2 text-[#001a33] hover:text-[#d9b382] transition-colors leading-snug line-clamp-2">
                          {title}
                        </h3>
                      </Link>

                      {/* Location with Pin */}
                      <div className="flex items-start gap-2 mb-4 text-xs text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{locationText}</p>
                          {locationDetails && (
                            <p className="text-[10px] text-gray-500 line-clamp-1">{locationDetails}</p>
                          )}
                        </div>
                      </div>

                      {/* Sector */}
                      <div className="mb-4 mt-auto">
                        <span className="text-[10px] font-bold block mb-1 text-gray-400 uppercase tracking-wider">
                          {pageTexts.sectorLabel}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">{sectorName}</span>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="bg-gray-100 text-center py-2 text-[10px] text-gray-500 uppercase tracking-wider font-semibold border-t border-gray-200">
                      {pageTexts.supportBadge}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-[4px] bg-gray-50">
              <h3 className="text-lg font-bold text-[#001a33] mb-2">{pageTexts.noResultsTitle}</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">{pageTexts.noResultsDesc}</p>
            </div>
          )}
        </section>
      </main>

      {/* Bottom CTA Banner */}
      <section className="bg-[#001a33] py-12 px-4 sm:px-6 md:px-12 lg:px-20 text-white" data-purpose="cta-banner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{pageTexts.ctaTitle}</h2>
            <p className="text-gray-400 text-sm max-w-2xl">{pageTexts.ctaDesc}</p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/contact"
              className="flex-1 md:flex-none text-center bg-[#d9b382] text-[#001a33] font-bold px-6 py-3 rounded-[4px] hover:bg-opacity-90 transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              {pageTexts.ctaBtnRequest}
            </Link>
            <Link
              href="/contact"
              className="flex-1 md:flex-none text-center border border-gray-500 text-white font-bold px-6 py-3 rounded-[4px] hover:bg-white hover:text-[#001a33] transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              {pageTexts.ctaBtnContact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
