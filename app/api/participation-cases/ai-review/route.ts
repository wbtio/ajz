/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Gemini rejects inline parts far smaller than this; skip anything oversized. */
const MAX_INLINE_FILE_BYTES = 15 * 1024 * 1024
const MAX_FILES = 8

/**
 * Documents are persisted by `finalizeRegistrationDocumentUpload` under a
 * `path` key (a storage public URL). Older rows may carry `file_url` / `url`,
 * so accept those too — reading only `url` is what previously made every
 * review run with zero documents attached.
 */
function documentUrl(document: any): string {
  return String(document?.path || document?.file_url || document?.url || document?.publicUrl || '')
}

/** Credentials must never leave the system in a third-party prompt. */
const REDACTED_KEYS = new Set([
  'visa_portal_password',
  'visa_portal_password_encrypted',
  'password',
])

function redactSecrets(value: any): any {
  if (Array.isArray(value)) return value.map(redactSecrets)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, REDACTED_KEYS.has(key) ? '[redacted]' : redactSecrets(entry)]),
  )
}

async function fetchInlineFile(document: any) {
  const url = documentUrl(document)
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > MAX_INLINE_FILE_BYTES) return null
    return {
      name: String(document?.name || document?.type || 'application document'),
      mimeType: response.headers.get('content-type') || 'application/octet-stream',
      data: Buffer.from(arrayBuffer).toString('base64'),
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const registrationId = new URL(request.url).searchParams.get('registrationId')
  if (!registrationId) return NextResponse.json({ error: 'registrationId is required.' }, { status: 400 })

  const { data, error } = await (supabase as any)
    .from('ai_application_reviews')
    .select('id, created_at, score, review, file_names, users:created_by (full_name, email)')
    .eq('registration_id', registrationId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ history: [] })
  return NextResponse.json({ history: data || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Gemini is not configured. Add a GEMINI_API_KEY environment variable.' }, { status: 503 })

  const body = await request.json().catch(() => null)
  const registrationId = body?.registrationId
  if (!registrationId) return NextResponse.json({ error: 'registrationId is required.' }, { status: 400 })
  const context = redactSecrets(body?.context || {})

  const { data: registration } = await supabase
    .from('registrations')
    .select('documents')
    .eq('id', registrationId)
    .maybeSingle()

  const storedDocuments = Array.isArray(registration?.documents) ? registration.documents : []
  const candidates = storedDocuments.filter((document: any) => documentUrl(document)).slice(0, MAX_FILES)
  const attachedFiles = (await Promise.all(candidates.map(fetchInlineFile))).filter(Boolean) as {
    name: string
    mimeType: string
    data: string
  }[]

  const skippedCount = storedDocuments.length - attachedFiles.length
  const attachmentNote = attachedFiles.length
    ? `The following ${attachedFiles.length} document(s) are attached: ${attachedFiles.map((file) => file.name).join(', ')}.`
    : 'No documents could be attached — judge only the structured fields below and say so explicitly in the summary.'

  const prompt = `Review this visa/event application. Do not invent facts. Compare names, passport number, dates, nationality, event, and required documents. ${attachmentNote} Return JSON only: {"score":0,"summary":"","errors":[{"title":"","detail":"","severity":"error|warning"}],"verified":[""],"next_actions":[""]}. Score 0-100 based on evidence. Application: ${JSON.stringify(context)}`

  const parts = [
    { text: prompt },
    ...attachedFiles.map((file) => ({ inline_data: { mime_type: file.mimeType, data: file.data } })),
  ]

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } }),
    },
  )
  if (!response.ok) return NextResponse.json({ error: 'Gemini could not complete the review.' }, { status: 502 })

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '{}'

  let review: any
  try {
    review = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''))
  } catch {
    return NextResponse.json({ error: 'Gemini returned an unreadable review.' }, { status: 502 })
  }

  const fileNames = attachedFiles.map((file) => file.name)
  const { error } = await (supabase as any).from('ai_application_reviews').insert({
    registration_id: registrationId,
    created_by: user.id,
    score: Number(review.score) || 0,
    review,
    file_names: fileNames,
  })

  // A failed insert loses the audit row but the review itself is still useful,
  // so surface it alongside a warning instead of throwing the result away.
  return NextResponse.json({
    review,
    analyzedFiles: fileNames,
    skippedFiles: Math.max(0, skippedCount),
    warning: error ? 'The review could not be saved to the review history.' : undefined,
  })
}
