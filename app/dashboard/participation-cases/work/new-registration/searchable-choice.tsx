'use client'
import { useMemo, useState } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function SearchableChoice({ value, placeholder, items, onSelect, disabled = false }: { value: string; placeholder: string; items: Array<{ value: string; label: string }>; onSelect: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedLabel = items.find(item => item.value === value)?.label || ''
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return normalized ? items.filter(item => `${item.label} ${item.value}`.toLocaleLowerCase().includes(normalized)) : items
  }, [items, query])
  return <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery('') }}><PopoverTrigger asChild><Button type="button" variant="outline" disabled={disabled} className="h-10 w-full justify-between border-slate-200 bg-white px-3 text-left font-normal text-slate-700 hover:bg-slate-50"><span className={cn('truncate', !selectedLabel && 'text-slate-400')}>{selectedLabel || placeholder}</span><ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" /></Button></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start"><div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2"><Search className="size-4 shrink-0 text-slate-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type to search..." aria-label={`Search ${placeholder}`} className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" /></div><ScrollArea className="h-64 rounded-md border border-slate-100"><div className="p-1">{filteredItems.length ? filteredItems.map(item => <button key={item.value} type="button" onClick={() => { onSelect(item.value); setOpen(false) }} className={cn('flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100', item.value === value && 'bg-slate-100 font-medium text-[#8B0000]')}>{item.label}</button>) : <p className="px-3 py-6 text-center text-sm text-slate-500">No matching options</p>}</div></ScrollArea></PopoverContent></Popover>
}
