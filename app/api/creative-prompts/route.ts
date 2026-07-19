/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, profile: null }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
  return { supabase, user, profile }
}

export async function GET() {
  const { supabase, user, profile } = await getStaff()
  if (!user || !['admin', 'team'].includes(profile?.role ?? '')) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const db = supabase as any
  const [{ data: settings }, { data: prompts }, { data: events }] = await Promise.all([
    db.from('creative_prompt_studio').select('*').eq('owner_id', user.id).eq('kind', 'settings').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('creative_prompt_studio').select('*').eq('owner_id', user.id).eq('kind', 'prompt').order('updated_at', { ascending: false }).limit(12),
    supabase.from('events').select('id,title,title_ar,description,description_ar,date,location,location_ar,image_url').order('date', { ascending: false }).limit(100),
  ])
  return NextResponse.json({ settings, prompts: prompts ?? [], events: events ?? [] })
}

export async function POST(request: Request) {
  const { supabase, user, profile } = await getStaff()
  if (!user || !['admin', 'team'].includes(profile?.role ?? '')) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const db = supabase as any
  const body = await request.json().catch(() => null)
  if (!body || !['settings', 'prompt'].includes(body.kind)) return NextResponse.json({ error: 'Invalid record.' }, { status: 400 })

  if (body.kind === 'settings') {
    const { data: existing } = await db.from('creative_prompt_studio').select('id').eq('owner_id', user.id).eq('kind', 'settings').limit(1).maybeSingle()
    const query = existing
      ? db.from('creative_prompt_studio').update({ payload: body.payload ?? {}, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single()
      : db.from('creative_prompt_studio').insert({ owner_id: user.id, kind: 'settings', payload: body.payload ?? {} }).select().single()
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ record: data })
  }

  const { data, error } = await db.from('creative_prompt_studio').insert({ owner_id: user.id, kind: 'prompt', title: body.title ?? 'Creative prompt', payload: body.payload ?? {}, provider: body.provider ?? null, model: body.model ?? null }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
