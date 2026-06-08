'use client'

import { useI18n } from '@/lib/i18n'
import { useState } from 'react'

interface EventsHeroProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  onPopularSearchClick: (tag: string, sectorSlug?: string) => void
}

export function EventsHero({
  searchQuery,
  onSearchChange,
  onPopularSearchClick,
}: EventsHeroProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'

  const [inputVal, setInputVal] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(inputVal)
  }

  // Localized text for Hero
  const content = isRTL
    ? {
        title: 'الفعاليات الدولية',
        subtitle: 'اكتشف المعارض والمؤتمرات والفعاليات التجارية العالمية في مختلف القطاعات الرئيسية. ابحث عن فرص للتواصل والتعلم والنمو مع العالم.',
        placeholder: 'ابحث عن الفعاليات بالاسم، القطاع، البلد، أو كلمة مفتاحية...',
        searchBtn: 'بحث',
        popularLabel: 'الأكثر بحثاً',
        tags: [
          { name: 'الرعاية الصحية', slug: 'medical' },
          { name: 'التكنولوجيا', slug: 'technology' },
          { name: 'الطاقة', slug: 'industrie' },
          { name: 'المدن الذكية', search: 'Smart Cities' },
          { name: 'الاستدامة', search: 'Sustainability' },
          { name: 'التصنيع', slug: 'industrie' },
        ],
      }
    : {
        title: 'International Events',
        subtitle: 'Discover global exhibitions, conferences, and trade events across key sectors. Find opportunities to connect, learn, and grow with the world.',
        placeholder: 'Search events by name, sector, country, or keyword...',
        searchBtn: 'Search',
        popularLabel: 'Popular Searches',
        tags: [
          { name: 'Healthcare', slug: 'medical' },
          { name: 'Technology', slug: 'technology' },
          { name: 'Energy', slug: 'industrie' },
          { name: 'Smart Cities', search: 'Smart Cities' },
          { name: 'Sustainability', search: 'Sustainability' },
          { name: 'Manufacturing', slug: 'industrie' },
        ],
      }

  return (
    <section
      className="bg-[#001a33] text-white pt-24 pb-14 px-4 sm:px-6 md:px-12 lg:px-20 relative overflow-hidden"
      data-purpose="hero-section"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
          {content.title}
        </h1>
        <p className="text-gray-300 max-w-2xl mb-8 text-sm sm:text-base leading-relaxed">
          {content.subtitle}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex max-w-3xl mb-8 w-full">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={content.placeholder}
            className="flex-grow p-3 sm:p-4 text-gray-800 rounded-s-[4px] border-none focus:ring-2 focus:ring-[#d9b382] focus:outline-none text-xs sm:text-sm bg-white"
          />
          <button
            type="submit"
            className="bg-[#0a2a4d] px-6 sm:px-10 py-3 sm:py-4 font-semibold rounded-e-[4px] text-xs sm:text-sm hover:bg-opacity-90 transition-colors shrink-0"
          >
            {content.searchBtn}
          </button>
        </form>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="text-gray-400">{content.popularLabel}</span>
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => {
                  if (tag.slug) {
                    onPopularSearchClick('', tag.slug)
                  } else if (tag.search) {
                    onPopularSearchClick(tag.search)
                    setInputVal(tag.search)
                  }
                }}
                className="border border-gray-500 px-3 py-1 rounded-[4px] text-gray-300 hover:bg-white hover:text-[#001a33] hover:border-white transition-all text-xs"
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
