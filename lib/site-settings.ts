/**
 * Reads the site-wide settings that admins edit from the dashboard.
 *
 * Only rows flagged `is_public` are exposed here — the anon RLS policy on
 * `app_settings` enforces that too, so a leak in this file cannot expose the
 * private rows (e.g. notification recipients).
 */

export type CompanySettings = {
  name_ar: string
  name_en: string
  email: string
  phone: string
  address_ar: string
  address_en: string
  website: string
}

export type MaintenanceSettings = {
  enabled: boolean
  message_ar: string
  message_en: string
}

export type PublicSettings = {
  company: CompanySettings
  maintenance: MaintenanceSettings
}

/** Used until the real values arrive, and whenever the database is unreachable. */
export const FALLBACK_SETTINGS: PublicSettings = {
  company: {
    name_ar: 'جوينت أنيوال زون',
    name_en: 'Joint Annual Zone',
    email: 'info@jaz.iq',
    phone: '+964 771 900 0600',
    address_ar: '',
    address_en: '',
    website: 'https://jaz.iq',
  },
  maintenance: {
    enabled: false,
    message_ar: 'الموقع تحت الصيانة مؤقتاً. نعتذر عن الانقطاع ونعود قريباً.',
    message_en: 'We are performing scheduled maintenance. We will be back shortly.',
  },
}

export const PUBLIC_SETTINGS_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_settings` +
  '?select=key,value&is_public=eq.true'

/**
 * Fetch the public settings. Never throws: a failure falls back to the
 * defaults so a database hiccup can never take the marketing site down.
 */
export async function fetchPublicSettings(): Promise<PublicSettings> {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) return FALLBACK_SETTINGS

  try {
    const res = await fetch(PUBLIC_SETTINGS_URL, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return FALLBACK_SETTINGS

    const rows = (await res.json()) as { key: string; value: unknown }[]
    const byKey = new Map(rows.map((r) => [r.key, r.value]))

    return {
      company: {
        ...FALLBACK_SETTINGS.company,
        ...((byKey.get('company') as Partial<CompanySettings>) ?? {}),
      },
      maintenance: {
        ...FALLBACK_SETTINGS.maintenance,
        ...((byKey.get('maintenance') as Partial<MaintenanceSettings>) ?? {}),
      },
    }
  } catch {
    return FALLBACK_SETTINGS
  }
}

/**
 * Same fetch, but memoised for a short window. The proxy runs on every public
 * request, so it must not hit the database each time; a minute of staleness is
 * an acceptable trade for not adding a round-trip to every page view.
 */
const CACHE_TTL_MS = 60_000
let cached: { at: number; value: PublicSettings } | null = null
let inFlight: Promise<PublicSettings> | null = null

export async function getCachedPublicSettings(): Promise<PublicSettings> {
  const now = Date.now()
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.value
  if (inFlight) return inFlight

  inFlight = fetchPublicSettings()
    .then((value) => {
      cached = { at: Date.now(), value }
      return value
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}
