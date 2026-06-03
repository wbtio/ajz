'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []
  const showLeft = current > 3
  const showRight = current < total - 2

  if (!showLeft && showRight) {
    pages.push(1, 2, 3, 4, 'ellipsis', total)
  } else if (showLeft && !showRight) {
    pages.push(1, 'ellipsis', total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total)
  }
  return pages
}

export function BlogPagination({ currentPage, totalPages, onPageChange }: BlogPaginationProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight

  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <nav
      className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row"
      aria-label="Pagination"
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
        {t.blogPage.pagination.page}{' '}
        <span className="font-mono tabular-nums text-[#0b1426]">
          {String(currentPage).padStart(2, '0')}
        </span>{' '}
        {t.blogPage.pagination.of}{' '}
        <span className="font-mono tabular-nums text-[#0b1426]">
          {String(totalPages).padStart(2, '0')}
        </span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'inline-flex h-10 items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 transition-all',
            'hover:border-slate-400 hover:text-[#0b1426]',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600'
          )}
        >
          <PrevIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t.blogPage.pagination.previous}</span>
        </button>

        {pageNumbers.map((p, i) => {
          if (p === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex h-10 w-10 items-center justify-center text-sm font-medium text-slate-400"
                aria-hidden="true"
              >
                …
              </span>
            )
          }
          const isActive = p === currentPage
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-sm border text-sm font-bold tabular-nums transition-all',
                isActive
                  ? 'border-[#8B0000] bg-[#8B0000] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-[#0b1426]'
              )}
            >
              {String(p).padStart(2, '0')}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'inline-flex h-10 items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 transition-all',
            'hover:border-slate-400 hover:text-[#0b1426]',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600'
          )}
        >
          <span className="hidden sm:inline">{t.blogPage.pagination.next}</span>
          <NextIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
