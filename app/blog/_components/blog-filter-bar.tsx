'use client'

import { Search, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export interface CategoryOption {
  value: string
  count: number
}

export function formatCategoryName(category: string, isRTL: boolean): string {
  const norm = category.toLowerCase().trim()
  if (norm === 'all') {
    return isRTL ? 'الكل' : 'All'
  }
  if (norm === 'event' || norm === 'events') {
    return isRTL ? 'الفعاليات' : 'Events'
  }
  if (norm === 'general') {
    return isRTL ? 'عام' : 'General'
  }
  if (norm === 'news') {
    return isRTL ? 'أخبار' : 'News'
  }
  if (norm === 'announcement') {
    return isRTL ? 'إعلانات' : 'Announcements'
  }
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
}

interface BlogFilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  categories: CategoryOption[]
  activeCategory: string | null
  onCategoryChange: (value: string | null) => void
  resultsLabel?: string
}

export function BlogFilterBar({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  resultsLabel,
}: BlogFilterBarProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'

  const allOption: CategoryOption = {
    value: 'all',
    count: categories.reduce((sum, c) => sum + c.count, 0),
  }
  const options: CategoryOption[] = [allOption, ...categories]

  return (
    <div className="flex flex-col gap-4 border-y border-slate-200 bg-white py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <label htmlFor="blog-search" className="sr-only">
          {t.blogPage.searchLabel}
        </label>
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
            isRTL ? 'right-4' : 'left-4'
          )}
          aria-hidden="true"
        />
        <input
          id="blog-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t.blogPage.searchPlaceholder}
          className={cn(
            'h-9 w-full rounded-sm border border-slate-200 bg-white text-sm text-[#0b1426] outline-none transition-all',
            'placeholder:text-slate-400',
            'focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/20',
            isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#0b1426]',
              isRTL ? 'left-3' : 'right-3'
            )}
            aria-label={t.blogPage.clearFilters}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Categories */}
      <nav
        className="flex items-center gap-2 overflow-x-auto"
        aria-label={t.blogPage.categoriesLabel}
      >
        {options.map((opt) => {
          const isActive =
            opt.value === 'all' ? activeCategory === null : activeCategory === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onCategoryChange(opt.value === 'all' ? null : opt.value)}
              className={cn(
                'group inline-flex shrink-0 items-center gap-2 rounded-sm border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200',
                isActive
                  ? 'border-[#8B0000] bg-[#8B0000] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-[#0b1426]'
              )}
              aria-pressed={isActive}
            >
              <span>{formatCategoryName(opt.value, isRTL)}</span>
              <span
                className={cn(
                  'rounded-sm px-1.5 py-0.5 font-mono text-[10px] tabular-nums',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                {String(opt.count).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </nav>

      {resultsLabel && (
        <p className="hidden text-xs font-medium text-slate-500 lg:block">
          {resultsLabel}
        </p>
      )}
    </div>
  )
}
