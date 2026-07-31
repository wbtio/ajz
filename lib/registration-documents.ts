/**
 * Applicant documents (passports, visa forms, receipts) live in the private
 * `registration-documents` bucket and are only reachable through
 * /api/documents/view, which checks for a staff session and then hands back a
 * short-lived signed URL.
 *
 * Older rows stored a public `events-bucket` URL instead of a storage path.
 * `registrationDocumentPath` normalises both shapes so nothing 404s while the
 * data is migrated.
 */

const LEGACY_PUBLIC_PREFIX = '/storage/v1/object/public/events-bucket/'

/** Reduce whatever is stored on the row to a plain storage path. */
export function registrationDocumentPath(stored: string): string {
  if (!stored) return ''
  if (!stored.startsWith('http')) return stored

  const index = stored.indexOf(LEGACY_PUBLIC_PREFIX)
  if (index === -1) return stored

  return decodeURIComponent(stored.slice(index + LEGACY_PUBLIC_PREFIX.length))
}

/** The guarded viewer URL for a stored document reference. */
export function registrationDocumentUrl(stored: string): string {
  return `/api/documents/view?path=${encodeURIComponent(registrationDocumentPath(stored))}`
}
