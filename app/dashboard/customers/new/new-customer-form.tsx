'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const fields = [
  ['full_name_as_passport', 'Full name', true], ['phone', 'Primary phone', true], ['email', 'Email address', false], ['whatsapp_number', 'WhatsApp number', false],
  ['nationality', 'Nationality', false], ['city', 'City', false], ['employer_name', 'Company or organization', false], ['job_title', 'Job title', false],
  ['department', 'Department', false], ['workplace_type', 'Organization type', false], ['work_phone', 'Work phone', false], ['work_address', 'Company address', false],
] as const

export function NewCustomerForm() {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    const response = await fetch('/api/customers/new', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const result = await response.json().catch(() => null)
    if (!response.ok) { setError(result?.error || 'Could not create the customer'); setSaving(false); return }
    router.push(`/dashboard/customers/${result.customer.id}`)
  }
  return <form onSubmit={submit} className="max-w-4xl rounded-lg border border-slate-200/80 bg-white p-5"><div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, label, required]) => <label key={key} className="text-xs font-medium text-[var(--jaz-muted)]">{label}{required && <span className="ml-1 text-[#8B0000]">*</span>}<input required={required} value={form[key] || ''} onChange={(event) => update(key, event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-normal text-[var(--jaz-ink)] outline-none focus:border-[#8B0000] focus:bg-white" /></label>)}</div><div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-5"><p className="text-xs text-red-700">{error}</p><div className="flex gap-2"><button type="button" onClick={() => router.back()} className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-[var(--jaz-ink)]">Cancel</button><button type="submit" disabled={saving} className="h-10 rounded-md bg-[#8B0000] px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Creating...' : 'Create customer'}</button></div></div></form>
}
