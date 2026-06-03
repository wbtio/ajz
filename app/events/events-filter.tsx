'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import type { Sector } from '@/lib/database.types'

interface EventsFilterProps {
  sectors: Sector[]
}

function getShortenedSectorName(name: string, isRTL: boolean) {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('healthcare') || name.includes('الرعاية الصحية') || name.includes('الصحية')) {
    return isRTL ? 'الرعاية الصحية' : 'Healthcare'
  }
  if (nameLower.includes('digital') || nameLower.includes('technology') || name.includes('التكنولوجيا') || name.includes('التحول الرقمي')) {
    return isRTL ? 'التكنولوجيا' : 'Technology'
  }
  if (nameLower.includes('professional') || nameLower.includes('academic') || name.includes('الأكاديمية') || name.includes('الشؤون المهنية')) {
    return isRTL ? 'الأكاديمية' : 'Academic'
  }
  if (nameLower.includes('industrial') || nameLower.includes('commercial') || name.includes('الصناعي') || name.includes('التطوير الصناعي')) {
    return isRTL ? 'الصناعي' : 'Industrial'
  }
  return name
}

export function EventsFilter({ sectors }: EventsFilterProps) {
  const { locale } = useI18n()
  const isRTL = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentSector = searchParams.get('sector') || ''

  const labels = isRTL ? {
    searchPlaceholder: 'ابحث عن فعالية...',
    filterResults: 'تطبيق التصفية والبحث',
    sectorCategoriesLabel: 'القطاع الاستراتيجي',
    eventTypeLabel: 'نوع الفعالية',
    statusLabel: 'حالة التسجيل',
    priceLabel: 'التكلفة',
    all: 'الكل',
    local: 'محلية',
    international: 'دولية',
    open: 'مفتوح للتسجيل',
    completed: 'مكتملة',
    free: 'مجانية',
    paid: 'مدفوعة',
  } : {
    searchPlaceholder: 'Search for an event...',
    filterResults: 'Apply Search & Filters',
    sectorCategoriesLabel: 'Strategic Sector',
    eventTypeLabel: 'Event Type',
    statusLabel: 'Registration Status',
    priceLabel: 'Price',
    all: 'All',
    local: 'Local',
    international: 'International',
    open: 'Open',
    completed: 'Completed',
    free: 'Free',
    paid: 'Paid',
  }

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page if filtering
    params.delete('page')
    
    startTransition(() => {
      router.push(`/events?${params.toString()}`)
    })
  }, [searchParams, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const typeOptions = [
    { value: '', label: labels.all },
    { value: 'local', label: labels.local },
    { value: 'international', label: labels.international },
  ]
  const statusOptions = [
    { value: '', label: labels.all },
    { value: 'open', label: labels.open },
    { value: 'completed', label: labels.completed },
  ]
  const priceOptions = [
    { value: '', label: labels.all },
    { value: 'free', label: labels.free },
    { value: 'paid', label: labels.paid },
  ]

  const sectionLabel = 'block px-0.5 text-[10px] font-bold text-[#0b1426]/60 uppercase tracking-[0.14em]'
  const chipBase = 'rounded-sm px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-200 border cursor-pointer'
  const chipIdle = 'border-[#0b1426]/10 bg-white text-slate-600 hover:border-[#0b1426]/30 hover:text-[#0b1426]'
  const chipActive = 'border-[#0b1426] bg-[#0b1426] text-white shadow-sm'

  return (
    <form onSubmit={handleSearch} className="space-y-5 rounded-lg border border-[#0b1426]/10 bg-white p-5 text-start">
      {/* Search Input */}
      <div className="group relative">
        <Search className="absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#8B0000]" />
        <Input
          type="text"
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir="auto"
          className={`h-11 rounded-sm border-[#0b1426]/10 bg-white text-sm transition-all duration-200 focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/15 focus:shadow-[0_0_8px_rgba(139,0,0,0.12)] ${
            isRTL ? 'ps-3 pe-10 text-right' : 'ps-3 pe-10 text-left'
          }`}
        />
      </div>

      {/* 1. Sector Categories — full-width buttons (5+ options) */}
      <div className="space-y-2 border-t border-[#0b1426]/5 pt-4">
        <label className={sectionLabel}>{labels.sectorCategoriesLabel}</label>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => updateFilters('sector', '')}
            className={`w-full rounded-sm border px-3 py-2.5 text-xs font-semibold text-start flex items-center justify-between transition-all duration-200 cursor-pointer ${
              !currentSector ? chipActive : chipIdle
            }`}
          >
            <span>{labels.all}</span>
            {!currentSector && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
            )}
          </button>
          {sectors.map((sector) => {
            const isSelected = currentSector === sector.slug
            const rawName = isRTL ? sector.name_ar || sector.name : sector.name || sector.name_ar
            const shortName = getShortenedSectorName(rawName, isRTL)
            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => updateFilters('sector', sector.slug)}
                className={`w-full rounded-sm border px-3 py-2.5 text-xs font-semibold text-start flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isSelected ? chipActive : chipIdle
                }`}
              >
                <span>{shortName}</span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Event Type — inline chips (3 options) */}
      <div className="space-y-2 border-t border-[#0b1426]/5 pt-4">
        <label className={sectionLabel}>{labels.eventTypeLabel}</label>
        <div className="flex flex-wrap gap-1.5">
          {typeOptions.map((opt) => {
            const isSelected = (searchParams.get('type') || '') === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilters('type', opt.value)}
                className={`${chipBase} ${isSelected ? chipActive : chipIdle}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Status — inline chips (3 options) */}
      <div className="space-y-2 border-t border-[#0b1426]/5 pt-4">
        <label className={sectionLabel}>{labels.statusLabel}</label>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => {
            const isSelected = (searchParams.get('status') || '') === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilters('status', opt.value)}
                className={`${chipBase} ${isSelected ? chipActive : chipIdle}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Price — inline chips (3 options) */}
      <div className="space-y-2 border-t border-[#0b1426]/5 pt-4">
        <label className={sectionLabel}>{labels.priceLabel}</label>
        <div className="flex flex-wrap gap-1.5">
          {priceOptions.map((opt) => {
            const isSelected = (searchParams.get('price') || '') === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilters('price', opt.value)}
                className={`${chipBase} ${isSelected ? chipActive : chipIdle}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary action — apply search (brand red, distinguished from secondary filter chips) */}
      <Button
        type="submit"
        isLoading={isPending}
        className="h-11 w-full gap-2 rounded-sm bg-[#8B0000] px-4 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-[#6B0000] active:scale-[0.98] focus:ring-2 focus:ring-[#8B0000]/20 focus:outline-none"
      >
        <Filter className="h-3.5 w-3.5" />
        {labels.filterResults}
      </Button>
    </form>
  )
}
