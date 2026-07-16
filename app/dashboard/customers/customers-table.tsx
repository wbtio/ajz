'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { Search, Users, Phone, Mail, CalendarClock, FileWarning, ArrowUpRight, SlidersHorizontal, MessageCircle, X, BriefcaseBusiness, CircleAlert, Clock3 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { APPLICATION_STEPS, getCustomerStatus, getInitials, getMissingDocuments, getProgress, latestRegistration } from './customer-utils'
import type { Customer } from './customer-types'

export function CustomersTable({ clients }: { clients: Customer[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({ contact: true, passport: true, applications: true, progress: true, status: true, appointment: true })

  const rows = useMemo(() => clients.filter((client) => {
    const registration = latestRegistration(client.registrations)
    const haystack = [client.full_name_as_passport, client.phone, client.email, client.passport_number, ...(client.registrations || []).map((r: any) => r.case_number)].filter(Boolean).join(' ').toLowerCase()
    if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return false
    const currentStatus = getCustomerStatus(registration)
    if (filter === 'missing' && currentStatus !== 'Missing documents') return false
    if (filter === 'payment' && currentStatus !== 'Payment pending') return false
    if (filter === 'active' && currentStatus !== 'In progress') return false
    return true
  }), [clients, filter, query])

  const summary = useMemo(() => {
    const registrations = clients.flatMap((client) => client.registrations || [])
    return {
      total: clients.length,
      active: clients.filter((client) => getCustomerStatus(latestRegistration(client.registrations)) === 'In progress').length,
      missing: clients.filter((client) => getMissingDocuments(latestRegistration(client.registrations)) > 0).length,
      payment: clients.filter((client) => getCustomerStatus(latestRegistration(client.registrations)) === 'Payment pending').length,
      appointments: registrations.filter((registration) => Boolean((registration.additional_data as Record<string, unknown> | null)?.visa_appointment_date)).length,
    }
  }, [clients])

  return (
    <div dir="ltr" lang="en" className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="jaz-meta mb-1">Application Operations / Customers</p>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--jaz-ink)]">Customers</h1>
          <p className="mt-1 text-sm text-[var(--jaz-muted)]">One clear record for every customer and their applications.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--jaz-muted)]"><Users className="size-4" /> {rows.length} visible</div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Customer overview">
        {[
          ['Total customers', summary.total, Users, 'text-blue-600 bg-blue-50'],
          ['Active applications', summary.active, BriefcaseBusiness, 'text-violet-600 bg-violet-50'],
          ['Missing documents', summary.missing, CircleAlert, 'text-rose-600 bg-rose-50'],
          ['Payment pending', summary.payment, Clock3, 'text-amber-600 bg-amber-50'],
          ['With appointments', summary.appointments, CalendarClock, 'text-emerald-600 bg-emerald-50'],
        ].map(([label, value, Icon, tone]) => (
          <div key={String(label)} className="flex items-center gap-3 rounded-lg border border-[var(--jaz-line)] bg-white px-3 py-3">
            <div className={cn('flex size-9 items-center justify-center rounded-lg', tone as string)}><Icon className="size-4" /></div>
            <div><p className="text-xl font-bold leading-none tabular-nums text-[var(--jaz-ink)]">{value as number}</p><p className="mt-1 text-[11px] text-[var(--jaz-muted)]">{label as string}</p></div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-2 border-y border-[var(--jaz-line)] py-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--jaz-whisper)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, email, passport, or case" aria-label="Search customers" className="h-9 pl-9" />
        </div>
        <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--jaz-line)] bg-white px-3 text-sm font-medium text-[var(--jaz-ink)] hover:bg-[var(--jaz-surface-2)]"><SlidersHorizontal className="size-4" /> Filters</button>
        <span className="text-xs text-[var(--jaz-muted)]">{filter === 'all' ? 'All customers' : filter === 'active' ? 'In progress' : filter === 'missing' ? 'Missing documents' : 'Payment pending'}</span>
      </div>

      {filtersOpen && <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/20 p-4 pt-20" role="dialog" aria-modal="true" aria-labelledby="customer-filter-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false) }}>
        <div className="w-full max-w-md rounded-lg border border-[var(--jaz-line)] bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between"><div><h2 id="customer-filter-title" className="font-semibold text-[var(--jaz-ink)]">Customer filters</h2><p className="mt-1 text-xs text-[var(--jaz-muted)]">Show only the information needed for this view.</p></div><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="rounded p-1 text-[var(--jaz-muted)] hover:bg-[var(--jaz-surface-2)]"><X className="size-4" /></button></div>
          <label className="mt-5 block text-xs font-semibold text-[var(--jaz-muted)]">Status<select value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--jaz-line)] bg-white px-3 text-sm font-normal text-[var(--jaz-ink)]"><option value="all">All customers</option><option value="active">In progress</option><option value="missing">Missing documents</option><option value="payment">Payment pending</option></select></label>
          <fieldset className="mt-5"><legend className="text-xs font-semibold text-[var(--jaz-muted)]">Visible columns</legend><div className="mt-2 grid grid-cols-2 gap-2">{[['contact', 'Contact'], ['passport', 'Passport'], ['applications', 'Applications'], ['progress', 'Progress'], ['status', 'Status'], ['appointment', 'Next appointment']].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded border border-[var(--jaz-line)] px-3 py-2 text-sm"><input type="checkbox" checked={visibleColumns[key]} onChange={(e) => setVisibleColumns((current) => ({ ...current, [key]: e.target.checked }))} />{label}</label>)}</div></fieldset>
          <button type="button" onClick={() => setFiltersOpen(false)} className="mt-5 h-9 w-full rounded-md bg-[var(--jaz-sovereign)] px-4 text-sm font-semibold text-white hover:bg-[#6B0000]">Apply filters</button>
        </div>
      </div>}

      <div className="overflow-hidden rounded-lg border border-[var(--jaz-line)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--jaz-line)] bg-[var(--jaz-surface-2)] px-4 py-2 text-[11px] text-[var(--jaz-muted)]">
          <span>{rows.length} customer records</span>
          <button type="button" onClick={() => tableScrollRef.current?.scrollTo({ left: tableScrollRef.current.scrollLeft > 0 ? 0 : tableScrollRef.current.scrollWidth, behavior: 'smooth' })} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium hover:bg-white" aria-label="Scroll table horizontally">
            <span className="text-base leading-none">↔</span> More columns
          </button>
        </div>
        <div ref={tableScrollRef} className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--jaz-line)] bg-[var(--jaz-surface-2)] text-xs font-semibold text-[var(--jaz-muted)]"><tr>
              <th className="sticky left-0 z-10 bg-[var(--jaz-surface-2)] px-4 py-3">Customer</th>{visibleColumns.contact && <th className="px-4 py-3">Contact</th>}{visibleColumns.passport && <th className="px-4 py-3">Passport</th>}{visibleColumns.applications && <th className="px-4 py-3">Applications</th>}{visibleColumns.progress && <th className="px-4 py-3">Progress</th>}{visibleColumns.status && <th className="px-4 py-3">Status</th>}{visibleColumns.appointment && <th className="px-4 py-3">Next appointment</th>}
            </tr></thead>
            <tbody className="divide-y divide-[var(--jaz-line)]">
              {rows.map((client) => {
                const registration = latestRegistration(client.registrations)
                const pct = getProgress(registration)
                const clientStatus = getCustomerStatus(registration)
                return <tr key={client.id} className="group hover:bg-[var(--jaz-surface-2)]/50">
                  <td className="sticky left-0 z-[1] bg-white px-4 py-3 group-hover:bg-[var(--jaz-surface-2)]"><Link href={`/dashboard/customers/${client.id}`} className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/30"><Avatar size="sm" title={client.full_name_as_passport}><AvatarImage src={client.avatar_url || undefined} alt={client.full_name_as_passport} /><AvatarFallback className="bg-[var(--jaz-surface-2)] text-xs text-[var(--jaz-ink)]">{getInitials(client.full_name_as_passport)}</AvatarFallback></Avatar><span><span className="block font-semibold text-[var(--jaz-ink)]">{client.full_name_as_passport}</span><span className="text-xs text-[var(--jaz-muted)]">{client.nationality || 'Nationality not set'}{client.city ? ` · ${client.city}` : ''}</span></span><ArrowUpRight className="ml-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></Link></td>
                  {visibleColumns.contact && <td className="px-4 py-3 text-xs text-[var(--jaz-muted)]"><div className="flex flex-wrap gap-1.5">{client.phone ? <a href={`tel:${client.phone}`} title="Call customer" aria-label={`Call ${client.full_name_as_passport}`} className="inline-flex items-center gap-1 rounded border border-[var(--jaz-line)] px-2 py-1 font-medium hover:border-[var(--jaz-sovereign)] hover:text-[var(--jaz-sovereign)]"><Phone className="size-3" />Call</a> : null}{(client.whatsapp_number || client.phone) ? <a href={`https://wa.me/${(client.whatsapp_number || client.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" title="Open WhatsApp" aria-label={`Message ${client.full_name_as_passport} on WhatsApp`} className="inline-flex items-center gap-1 rounded border border-green-200 px-2 py-1 font-medium text-green-700 hover:bg-green-50"><MessageCircle className="size-3" />WhatsApp</a> : null}{client.email ? <a href={`mailto:${client.email}`} title="Send email" aria-label={`Email ${client.full_name_as_passport}`} className="inline-flex items-center gap-1 rounded border border-[var(--jaz-line)] px-2 py-1 font-medium hover:border-[var(--jaz-sovereign)] hover:text-[var(--jaz-sovereign)]"><Mail className="size-3" />Email</a> : null}{!client.phone && !client.whatsapp_number && !client.email && <span> No contact details </span>}</div><div className="mt-1 max-w-[220px] truncate text-[11px]">{client.phone || client.whatsapp_number || client.email || '—'}</div></td>}
                  {visibleColumns.passport && <td className="px-4 py-3"><span className="font-mono text-xs">{client.passport_number || '—'}</span><span className={cn('mt-1 block text-[11px]', client.passport_expiry_date && new Date(client.passport_expiry_date) < new Date() ? 'text-red-700' : 'text-[var(--jaz-muted)]')}>{client.passport_expiry_date ? `Expires ${client.passport_expiry_date}` : 'Expiry not set'}</span></td>}
                  {visibleColumns.applications && <td className="px-4 py-3"><span className="font-semibold">{client.registrations?.length || 0}</span>{registration?.case_number && <span className="ml-2 text-xs text-[var(--jaz-muted)]">{registration.case_number}</span>}</td>}
                  {visibleColumns.progress && <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--jaz-line)]"><div className="h-full rounded-full bg-[var(--jaz-sovereign)]" style={{ width: `${pct}%` }} /></div><span className="text-xs font-semibold">{pct}%</span></div><span className="mt-1 block text-[11px] text-[var(--jaz-muted)]">Step {registration?.current_step || 0} of {APPLICATION_STEPS}</span></td>}
                  {visibleColumns.status && <td className="px-4 py-3"><span className={cn('inline-flex rounded-full px-2 py-1 text-[11px] font-medium', clientStatus === 'Completed' ? 'bg-green-50 text-green-700' : clientStatus === 'Missing documents' ? 'bg-red-50 text-red-700' : clientStatus === 'Payment pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700')}>{clientStatus}</span>{getMissingDocuments(registration) > 0 && <span className="mt-1 flex items-center gap-1 text-[11px] text-red-600"><FileWarning className="size-3" /> {getMissingDocuments(registration)} missing</span>}</td>}
                  {visibleColumns.appointment && <td className="px-4 py-3 text-xs text-[var(--jaz-muted)]">{(() => { const data = registration?.additional_data as Record<string, unknown> | null; const date = data?.visa_appointment_date; const time = data?.visa_appointment_time; return date ? <span className="flex items-center gap-1.5 font-medium text-emerald-700"><CalendarClock className="size-3.5" />{String(date)}{time ? ` · ${String(time)}` : ''}</span> : <span className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />Not booked</span> })()}</td>}
                </tr>
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="px-6 py-14 text-center text-sm text-[var(--jaz-muted)]">No customers match this search.</div>}
      </div>
    </div>
  )
}
