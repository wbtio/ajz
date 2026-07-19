'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sanitizeEnglishText } from '@/lib/english-only'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EventsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const status = searchParams.get('status') ?? 'all'
  const type = searchParams.get('type') ?? 'all'

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateParams({ search: search.trim() })
  }

  const clearFilters = () => {
    setSearch('')
    router.replace(pathname)
  }

  const hasFilters = Boolean(searchParams.get('search') || searchParams.get('status') || searchParams.get('type'))

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(sanitizeEnglishText(e.target.value))}
          placeholder="Search by event title or sector"
          className="bg-white pl-9"
        />
      </form>

      <div className="flex w-full gap-2 lg:w-auto">
        <Select value={status} onValueChange={(value) => updateParams({ status: value })}>
          <SelectTrigger className="w-full bg-white lg:w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={(value) => updateParams({ type: value })}>
          <SelectTrigger className="w-full bg-white lg:w-[170px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="international">International</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} className="shrink-0" title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
