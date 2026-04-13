'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import type { Sector } from '@/lib/database.types'

interface EventsFilterProps {
  sectors: Sector[]
}

export function EventsFilter({ sectors }: EventsFilterProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentSector = searchParams.get('sector') || ''

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`/events?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  return (
    <div className="mb-10 space-y-6 rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700" />
          <Input
            type="text"
            placeholder={t.events.searchPlaceholderDetail}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir="auto"
            className={`h-12 rounded-xl border-white/70 bg-white/80 text-base shadow-sm backdrop-blur-sm transition-all focus:border-slate-500 focus:ring-slate-500/10 ${isRTL ? 'ps-4 pe-11 text-right' : 'ps-4 pe-11 text-left'}`}
          />
        </div>
        <Button
          type="submit"
          isLoading={isPending}
          className="h-12 gap-2 rounded-xl bg-slate-800 px-8 font-bold shadow-md shadow-slate-900/15 transition-all hover:bg-slate-700"
        >
          <Filter className="h-4 w-4" />
          {t.events.filterResults}
        </Button>
      </form>

      <div className="space-y-3">
        <label className="flex items-center gap-2 px-1 text-sm font-bold text-slate-900">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" />
          {t.events.sectorCategoriesLabel}
        </label>

        <div className="flex flex-wrap gap-2 pb-2">
          <button
            type="button"
            onClick={() => updateFilters('sector', '')}
            className={`rounded-xl border-2 px-6 py-2.5 text-sm font-bold transition-all ${
              !currentSector
                ? 'border-slate-800 bg-slate-800 text-white shadow-lg shadow-slate-900/15'
                : 'border-white/80 bg-white/80 text-slate-600 shadow-sm hover:border-slate-400/35 hover:text-slate-900'
            }`}
          >
            {t.events.all}
          </button>
          {sectors.map((sector) => (
            <button
              key={sector.id}
              type="button"
              onClick={() => updateFilters('sector', sector.slug)}
              className={`rounded-xl border-2 px-6 py-2.5 text-sm font-bold transition-all ${
                currentSector === sector.slug
                  ? 'border-slate-800 bg-slate-800 text-white shadow-lg shadow-slate-900/15'
                  : 'border-white/80 bg-white/80 text-slate-600 shadow-sm hover:border-slate-400/35 hover:text-slate-900'
              }`}
            >
              {isRTL ? sector.name_ar || sector.name : sector.name || sector.name_ar}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
