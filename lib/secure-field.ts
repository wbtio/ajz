import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * Symmetric encryption for individual sensitive columns stored inside JSONB
 * (currently the visa portal password, which used to sit in plaintext inside
 * `registrations.additional_data` and was readable by anyone who could open
 * the case).
 *
 * The key is taken from `FIELD_ENCRYPTION_KEY` when present, otherwise it is
 * derived from `SUPABASE_SERVICE_ROLE_KEY` so encryption works without adding
 * a new environment variable. Rotating the service role key without setting
 * `FIELD_ENCRYPTION_KEY` first would make existing values undecryptable, so
 * set the dedicated variable before any key rotation.
 */

const ALGORITHM = 'aes-256-gcm'
const PREFIX = 'enc.v1.'

function encryptionKey(): Buffer | null {
  const explicit = process.env.FIELD_ENCRYPTION_KEY
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY
  const source = explicit || fallback
  if (!source) return null
  // SHA-256 gives a stable 32-byte key from an arbitrary-length secret.
  return createHash('sha256').update(source).digest()
}

export function isEncrypted(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

/**
 * Returns the ciphertext, or `null` when no key is configured so callers can
 * decide whether to refuse the write rather than silently storing plaintext.
 */
export function encryptField(plaintext: string): string | null {
  if (!plaintext) return ''
  const key = encryptionKey()
  if (!key) return null

  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${PREFIX}${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`
}

/**
 * Decrypts a value produced by `encryptField`. Values that are not encrypted
 * are returned unchanged so legacy plaintext rows keep working until they are
 * next saved.
 */
export function decryptField(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  if (!isEncrypted(value)) return value

  const key = encryptionKey()
  if (!key) return ''

  const [ivPart, tagPart, dataPart] = value.slice(PREFIX.length).split('.')
  if (!ivPart || !tagPart || !dataPart) return ''

  try {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    return ''
  }
}
