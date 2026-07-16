/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Gemini is not configured. Add a new GEMINI_API_KEY after rotating the exposed key.' }, { status: 503 })
  const body = await request.json().catch(() => null)
  const context = body?.context || {}
  const files = Array.isArray(body?.files) ? body.files.slice(0, 8) : []
  const { data: registration } = await supabase.from('registrations').select('documents').eq('id', body?.registrationId).maybeSingle()
  const storedDocuments = Array.isArray(registration?.documents) ? registration.documents : []
  const storedFiles = await Promise.all(storedDocuments.slice(0, 8).map(async (document: any) => {
    const url = document.url || document.publicUrl
    if (!url) return null
    try { const response = await fetch(url); if (!response.ok) return null; const buffer = Buffer.from(await response.arrayBuffer()); return { name: document.name || document.type || 'application document', mimeType: response.headers.get('content-type') || 'application/octet-stream', data: buffer.toString('base64') } } catch { return null }
  }))
  const allFiles = [...storedFiles.filter(Boolean), ...files]
  const prompt = `Review this visa/event application against the documents already stored in the application. Do not invent facts. Compare names, passport number, dates, nationality, event, and required documents. Return JSON only: {"score":0,"summary":"","errors":[{"title":"","detail":"","severity":"error|warning"}],"verified":[""],"next_actions":[""]}. Score 0-100 based on evidence. Application: ${JSON.stringify(context)}`
  const parts = [{ text: prompt }, ...allFiles.filter((file: any) => file.data && file.mimeType).map((file: any) => ({ inline_data: { mime_type: file.mimeType, data: file.data } }))]
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } }) })
  if (!response.ok) return NextResponse.json({ error: 'Gemini could not complete the review.' }, { status: 502 })
  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '{}'
  try {
    const review = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''))
    const { error } = await (supabase as any).from('ai_application_reviews').insert({ registration_id: body?.registrationId, created_by: user.id, score: Number(review.score) || 0, review, file_names: allFiles.map((file: any) => file?.name || '') })
    if (error) return NextResponse.json({ error: 'Review completed but could not be saved. Apply migration 013 first.' }, { status: 500 })
    return NextResponse.json({ review })
  } catch { return NextResponse.json({ error: 'Gemini returned an unreadable review.' }, { status: 502 }) }
}
