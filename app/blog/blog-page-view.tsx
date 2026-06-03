'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import type { Database } from '@/lib/database.types'
import { BlogHero } from './_components/blog-hero'
import { BlogFeatured } from './_components/blog-featured'
import { BlogPostCard } from './_components/blog-post-card'
import { BlogFilterBar, type CategoryOption } from './_components/blog-filter-bar'
import { BlogPagination } from './_components/blog-pagination'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { ContactBanner } from '@/components/shared/contact-banner'

type Post = Database['public']['Tables']['posts']['Row']

const POSTS_PER_PAGE = 6

interface BlogStats {
  articles: number
  categories: number
  readingTime: number
  years: number
}

interface BlogPageViewProps {
  posts: Post[]
  stats: BlogStats
}

export function BlogPageView({ posts, stats }: BlogPageViewProps) {
  const { t, locale, dir } = useI18n()

  const [searchQuery, setSearchQueryRaw] = useState('')
  const [activeCategory, setActiveCategoryRaw] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Wrapped setters that also reset pagination to page 1
  const setSearchQuery = (value: string) => {
    setSearchQueryRaw(value)
    setCurrentPage(1)
  }
  const setActiveCategory = (value: string | null) => {
    setActiveCategoryRaw(value)
    setCurrentPage(1)
  }

  // Derive categories from posts (with counts)
  const categories: CategoryOption[] = useMemo(() => {
    const map = new Map<string, number>()
    posts.forEach((p) => {
      if (p.category) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))
  }, [posts])

  // Filter posts by search + category
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return posts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false
      if (!q) return true
      const haystack = [
        p.title,
        p.title_ar,
        p.excerpt,
        p.excerpt_ar,
        p.content,
        p.content_ar,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [posts, searchQuery, activeCategory])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const featured = filteredPosts[0]
  const gridPosts = filteredPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE,
  )

  const isFiltered = searchQuery.length > 0 || activeCategory !== null
  const hasNoResults = filteredPosts.length === 0
  const hasPosts = posts.length > 0

  const statsItems: StatsBarItem[] = [
    {
      value: stats.articles,
      label: t.blogPage.stats.articles.label,
      suffix: t.blogPage.stats.articles.suffix,
      icon: 'solar:document-text-bold-duotone',
    },
    {
      value: stats.categories,
      label: t.blogPage.stats.categories.label,
      suffix: t.blogPage.stats.categories.suffix,
      icon: 'solar:tag-bold-duotone',
    },
    {
      value: stats.readingTime,
      label: t.blogPage.stats.readingTime.label,
      suffix: t.blogPage.stats.readingTime.suffix,
      icon: 'solar:book-bookmark-bold-duotone',
    },
    {
      value: stats.years,
      label: t.blogPage.stats.years.label,
      suffix: t.blogPage.stats.years.suffix,
      icon: 'solar:stars-minimalistic-bold-duotone',
    },
  ]

  const handleClearFilters = () => {
    setSearchQueryRaw('')
    setActiveCategoryRaw(null)
  }

  if (!hasPosts) {
    return (
      <div className="min-h-screen bg-white" dir={dir} lang={locale}>
        <BlogHero totalPosts={0} />
        <StatsBar items={statsItems} overlap={false} />
        <Container className="mt-6 sm:mt-8 lg:mt-10">
          <div className="relative overflow-hidden rounded-xl border border-[#0b1426]/10 bg-white px-6 py-20 mt-8">
            <div className="relative flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-sm bg-[#8B0000]/6 text-[#8B0000]">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#0b1426]">{t.blogPage.emptyTitle}</h3>
              <p className="text-sm leading-relaxed text-slate-500 mb-8">
                {t.blogPage.emptyDescription}
              </p>
              <Button
                asChild
                className="h-11 rounded-sm bg-[#8B0000] px-6 text-white transition-all duration-200 ease-out hover:bg-[#6B0000] active:scale-[0.98] focus:ring-2 focus:ring-[#8B0000]/20 focus:outline-none shadow-sm font-semibold cursor-pointer"
              >
                <Link href="/events">
                  {locale === 'ar' ? 'تصفح الفعاليات القادمة' : 'Browse Upcoming Events'}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
        <ContactBanner
          title={t.blogPage.contactBanner.title}
          description={t.blogPage.contactBanner.description}
          ctaLabel={t.blogPage.contactBanner.cta}
          ctaHref="/contact"
          className="mt-12 sm:mt-14 lg:mt-20"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      <BlogHero totalPosts={posts.length} />
      <StatsBar items={statsItems} overlap={false} />

      <Container className="mt-6 sm:mt-8 lg:mt-10 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Filter bar */}
        <BlogFilterBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* No results state (when filtered) */}
        {hasNoResults ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-20 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-sm bg-white text-[#8B0000] ring-1 ring-slate-200">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#0b1426]">
              {t.blogPage.noResultsTitle}
            </h3>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-500">
              {t.blogPage.noResultsDescription}
            </p>
            <Button
              type="button"
              onClick={handleClearFilters}
              variant="outline"
              className="h-10 rounded-sm border-[#0b1426] px-5 text-xs font-bold uppercase tracking-[0.15em] text-[#0b1426] hover:bg-[#0b1426] hover:text-white"
            >
              {t.blogPage.clearFilters}
            </Button>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && <BlogFeatured post={featured} />}

            {/* Grid (skip if all on one page and featured is the only one) */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isFiltered && totalPages > 1 && (
              <BlogPagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </Container>

      <ContactBanner
        title={t.blogPage.contactBanner.title}
        description={t.blogPage.contactBanner.description}
        ctaLabel={t.blogPage.contactBanner.cta}
        ctaHref="/contact"
        className="mt-12 sm:mt-14 lg:mt-20"
      />
    </div>
  )
}
