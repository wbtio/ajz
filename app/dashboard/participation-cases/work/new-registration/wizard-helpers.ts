import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import type { RegistrationDocument, PreviousSchengenVisa, RegistrationEvent } from './wizard-types'

export const EMPTY_SCHENGEN_VISA: PreviousSchengenVisa = { country: '', visa_number: '', issue_date: '', expiry_date: '' }

export function normalizePreviousSchengenVisas(value: unknown): PreviousSchengenVisa[] {
  if (!value) return []
  let parsed = value
  if (typeof value === 'string') { try { parsed = JSON.parse(value) } catch { return [] } }
  if (!Array.isArray(parsed)) return []
  return parsed.map((visa) => ({ country: String(visa?.country ?? ''), visa_number: String(visa?.visa_number ?? ''), issue_date: String(visa?.issue_date ?? ''), expiry_date: String(visa?.expiry_date ?? '') }))
}

export function normalizeResidencePermit(value: unknown) {
  let parsed = value
  if (typeof value === 'string') { try { parsed = JSON.parse(value) } catch { parsed = null } }
  const permit = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  return { hasPermit: Boolean(permit.has_permit), country: String(permit.country ?? ''), number: String(permit.number ?? ''), issueDate: String(permit.issue_date ?? ''), expiryDate: String(permit.expiry_date ?? '') }
}

export function normalizeRegistrationDocuments(value: unknown): RegistrationDocument[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const doc = entry as Record<string, unknown>
    const path = String(doc.path ?? doc.file_url ?? doc.url ?? '')
    return path ? [{ name: String(doc.name ?? doc.label ?? 'Document'), path, type: String(doc.type ?? 'other'), uploadedAt: typeof doc.uploadedAt === 'string' ? doc.uploadedAt : undefined }] : []
  })
}

export function formatEventDate(date?: string | null) { return date ? new Date(date).toLocaleDateString('en-GB') : '' }

export function buildTravelPurpose(event: RegistrationEvent | undefined, participationType: string) {
  if (!event) return 'Business / Exhibition Attendance'
  const place = event.location_ar || event.location || event.country_ar || event.country
  return [`Attend ${event.title_ar || event.title || 'the selected event'}`, place && `in ${place}`, formatEventDate(event.date) && `on ${formatEventDate(event.date)}`, `as ${participationType}`].filter(Boolean).join(' ')
}

export function normalizeLocalPhoneInput(value: string, country: CountryCode) {
  const trimmed = value.trim(); if (!trimmed) return ''; if (trimmed.startsWith('+')) return trimmed
  const digits = trimmed.replace(/\D/g, ''); if (!digits) return ''
  const callingCode = getCountryCallingCode(country)
  return `+${callingCode}${(digits.startsWith(callingCode) ? digits.slice(callingCode.length) : digits).replace(/^0+/, '')}`
}

export function getPhoneValidation(value: string, country: CountryCode) {
  const normalized = normalizeLocalPhoneInput(value, country); if (!normalized) return { normalized: '', error: '' }
  const phone = parsePhoneNumberFromString(normalized, country)
  return phone?.isValid() ? { normalized: phone.number, error: '' } : { normalized, error: country === 'IQ' ? 'Invalid Iraqi number. Enter it like 07712345678 or 7712345678.' : 'Enter a valid phone number.' }
}

export function getEmailValidation(value: string) {
  const email = value.trim().toLowerCase(); if (!email) return { normalized: '', error: '' }
  if (/\s/.test(email)) return { normalized: email, error: 'Email addresses cannot contain spaces.' }
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? { normalized: email, error: '' } : { normalized: email, error: 'Enter a valid email address.' }
}
