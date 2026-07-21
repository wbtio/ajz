'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Building2, Mail, MapPin, Phone, Plus, Search, SlidersHorizontal, Users, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getInitials } from './customer-utils'
import type { Customer } from './customer-types'

const statusFilters = [
  ['all', 'All customers'],
  ['company', 'Has an organization'],
  ['complete', 'Complete data'],
  ['incomplete', 'Needs updates'],
] as const

export function CustomersTable({ clients }: { clients: Customer[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const rows = useMemo(() => clients.filter((client) => {
    const haystack = [client.full_name_as_passport, client.first_name, client.last_name, client.phone, client.email, client.nationality, client.city, client.employer_name, client.job_title].filter(Boolean).join(' ').toLowerCase()
    if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return false
    const complete = Boolean(client.phone && client.employer_name && client.job_title && client.nationality)
    if (filter === 'company' && !client.employer_name) return false
    if (filter === 'complete' && !complete) return false
    if (filter === 'incomplete' && complete) return false
    return true
  }), [clients, filter, query])

  const completeCount = clients.filter((client) => Boolean(client.phone && client.employer_name && client.job_title && client.nationality)).length
  return (
    <div dir="ltr" lang="en" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--jaz-ink)]">Customers</h1>
        </div>
        <Link href="/dashboard/customers/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8B0000] px-4 text-sm font-semibold text-white transition hover:bg-[#6B0000]"><Plus className="size-4" /> Add customer</Link>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Customer overview">
        {([[Users, 'Total customers', clients.length], [Building2, 'With an organization', clients.filter((c) => c.employer_name).length], [Phone, 'With contact details', clients.filter((c) => c.phone || c.email || c.whatsapp_number).length], [SlidersHorizontal, 'Complete data', completeCount] ] as const).map(([Icon, label, value]) => <div key={String(label)} className="rounded-lg border border-slate-200/80 bg-white px-4 py-4"><Icon className="size-4 text-[#8B0000]" /><p className="mt-3 text-2xl font-bold tabular-nums text-[var(--jaz-ink)]">{value}</p><p className="mt-1 text-xs text-[var(--jaz-muted)]">{label}</p></div>)}
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-3">
        <div className="relative min-w-[240px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, phone, company, or city" aria-label="Search customers" className="h-10 border-slate-200 bg-slate-50 pl-9 text-left" /></div>
        <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-[var(--jaz-ink)] hover:bg-slate-50"><SlidersHorizontal className="size-4" /> Filter</button>
        <span className="text-xs text-[var(--jaz-muted)]">{rows.length} records visible</span>
      </div>

      {filtersOpen && <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/20 p-4 pt-24" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && setFiltersOpen(false)}><div className="w-full max-w-sm rounded-lg border border-[var(--jaz-line)] bg-white p-5 shadow-lg"><div className="flex items-center justify-between"><h2 className="font-semibold">Customer filters</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close"><X className="size-4" /></button></div><label className="mt-5 block text-xs font-semibold text-[var(--jaz-muted)]">Data status<select value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-[var(--jaz-line)] bg-white px-3 text-sm font-normal text-[var(--jaz-ink)]">{statusFilters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" onClick={() => setFiltersOpen(false)} className="mt-5 h-10 w-full rounded-md bg-[var(--jaz-sovereign)] text-sm font-semibold text-white">Apply filters</button></div></div>}

      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-4 py-4"><div><h2 className="text-sm font-semibold text-[var(--jaz-ink)]">Customer directory</h2></div><span className="text-xs text-[var(--jaz-muted)]">Automatically updated</span></div>
        <div className="divide-y divide-slate-200/70">
          {rows.map((client) => <Link key={client.id} href={`/dashboard/customers/${client.id}`} className="group grid gap-4 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_minmax(170px,1fr)_auto] md:items-center">
            <div className="flex items-center gap-3"><Avatar size="sm" title={client.full_name_as_passport}><AvatarImage src={client.avatar_url || undefined} alt="" /><AvatarFallback className="bg-[var(--jaz-surface-2)] text-xs text-[var(--jaz-ink)]">{getInitials(client.full_name_as_passport)}</AvatarFallback></Avatar><div><p className="font-semibold text-[var(--jaz-ink)]">{client.full_name_as_passport}</p><p className="mt-1 text-xs text-[var(--jaz-muted)]">Client ID · {client.id.slice(0, 8).toUpperCase()}</p></div></div>
            <div className="text-sm"><p className="flex items-center gap-2 text-[var(--jaz-ink)]"><Building2 className="size-3.5 text-[var(--jaz-sovereign)]" />{client.employer_name || 'Organization not recorded'}</p><p className="mt-1 text-xs text-[var(--jaz-muted)]">{client.job_title || 'Position not recorded'}</p></div>
            <div className="text-xs text-[var(--jaz-muted)]"><p className="flex items-center gap-2">{client.phone ? <><Phone className="size-3.5" />{client.phone}</> : client.email ? <><Mail className="size-3.5" />{client.email}</> : 'Contact details incomplete'}</p><p className="mt-1 flex items-center gap-2">{client.city || client.nationality ? <><MapPin className="size-3.5" />{[client.city, client.nationality].filter(Boolean).join(' · ')}</> : 'Location not recorded'}</p></div>
            <div className="flex items-center justify-between gap-3 md:justify-end"><span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', client.phone && client.employer_name && client.job_title && client.nationality ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{client.phone && client.employer_name && client.job_title && client.nationality ? 'Complete data' : 'Needs update'}</span><ArrowUpRight className="size-4 text-[var(--jaz-whisper)] transition group-hover:text-[var(--jaz-sovereign)]" /></div>
          </Link>)}
          {rows.length === 0 && <div className="px-6 py-16 text-center text-sm text-[var(--jaz-muted)]">No records match the current search.</div>}
        </div>
      </div>
    </div>
  )
}
