'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Sector } from '@/lib/database.types'

interface EventsFilterProps {
  sectors: Sector[]
}

export function EventsFilter({ sectors }: EventsFilterProps) {
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
    <div className="mb-10 space-y-6">
      {/* Search and Main Actions */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8b0000] transition-colors" />
          <Input
            type="text"
            placeholder="Search for event name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-[#8b0000]/10 focus:border-[#8b0000] transition-all text-base"
          />
        </div>
        <Button 
          type="submit" 
          isLoading={isPending}
          className="h-12 px-8 rounded-xl bg-[#8b0000] hover:bg-[#a01010] shadow-md shadow-[#8b0000]/20 transition-all font-bold"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter Results
        </Button>
      </form>

      {/* Sector Filters Container */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8b0000]" />
          Sector Categories
        </label>
        
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            onClick={() => updateFilters('sector', '')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
              !currentSector
                ? 'bg-[#8b0000] border-[#8b0000] text-white shadow-lg shadow-[#8b0000]/20'
                : 'bg-white border-gray-100 text-gray-600 hover:border-[#8b0000]/30 hover:text-[#8b0000] shadow-sm'
            }`}
          >
            All
          </button>
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => updateFilters('sector', sector.slug)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                currentSector === sector.slug
                  ? 'bg-[#8b0000] border-[#8b0000] text-white shadow-lg shadow-[#8b0000]/20'
                  : 'bg-white border-gray-100 text-gray-600 hover:border-[#8b0000]/30 hover:text-[#8b0000] shadow-sm'
              }`}
            >
              {sector.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
