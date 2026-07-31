'use client'

import { useEffect, useState } from 'react'
import {
  FALLBACK_SETTINGS,
  PUBLIC_SETTINGS_URL,
  type CompanySettings,
} from '@/lib/site-settings'

/**
 * Company contact details as edited by an admin in the dashboard.
 *
 * Starts from the built-in defaults so the footer renders complete contact
 * information on first paint and never flashes empty, then swaps in whatever
 * the admin has saved.
 */
export function useCompanySettings(): CompanySettings {
  const [company, setCompany] = useState<CompanySettings>(FALLBACK_SETTINGS.company)

  useEffect(() => {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!anonKey) return

    let cancelled = false

    fetch(PUBLIC_SETTINGS_URL, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((rows: { key: string; value: Partial<CompanySettings> }[] | null) => {
        if (cancelled || !rows) return
        const saved = rows.find((r) => r.key === 'company')?.value
        if (saved) setCompany({ ...FALLBACK_SETTINGS.company, ...saved })
      })
      .catch(() => {
        // keep the defaults — contact details must never disappear
      })

    return () => {
      cancelled = true
    }
  }, [])

  return company
}
