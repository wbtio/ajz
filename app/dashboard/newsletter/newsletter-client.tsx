'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Download, Search, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'

export interface Subscriber {
  id: string
  email: string
  locale: string | null
  source: string | null
  is_active: boolean
  created_at: string
}

interface Props {
  initialSubscribers: Subscriber[]
  isAdmin: boolean
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Builds the CSV client-side — the list is already loaded, so no extra request. */
function toCsv(rows: Subscriber[]) {
  const header = ['email', 'locale', 'source', 'is_active', 'created_at']
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [r.email, r.locale ?? '', r.source ?? '', String(r.is_active), r.created_at]
      .map(escape)
      .join(',')
  )
  // BOM so Excel opens the Arabic columns in the right encoding
  return '﻿' + [header.join(','), ...lines].join('\n')
}

export default function NewsletterClient({ initialSubscribers, isAdmin }: Props) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return subscribers
    return subscribers.filter((s) => s.email.toLowerCase().includes(q))
  }, [subscribers, query])

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jaz-newsletter-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (subscriber: Subscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the newsletter list?`)) return

    setBusyId(subscriber.id)
    setError('')
    setNotice('')

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', subscriber.id)

    setBusyId(null)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id))
    setNotice(`Removed ${subscriber.email}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Newsletter</h1>
          <p className="mt-1 text-sm text-slate-500">
            {subscribers.length === 0
              ? 'No subscribers yet. Anyone who signs up from the site footer appears here.'
              : `${subscribers.length} subscribers from the sign-up form on the site.`}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email…"
              className="h-10 border-slate-200 bg-slate-50 pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Mail className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">
                {subscribers.length === 0 ? 'No subscribers yet.' : 'No results match your search.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Language</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Subscribed</th>
                    {isAdmin && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900" dir="ltr">
                        {subscriber.email}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {subscriber.locale === 'en' ? 'English' : 'Arabic'}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{subscriber.source ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDate(subscriber.created_at)}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => handleDelete(subscriber)}
                            disabled={busyId === subscriber.id}
                            aria-label={`Remove ${subscriber.email}`}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
