import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Json } from '@/lib/database.types'

const EDITABLE_KEYS = ['company', 'notifications', 'maintenance'] as const
type EditableKey = (typeof EDITABLE_KEYS)[number]

/** Any signed-in staff member may read settings; only an admin may change them. */
async function getRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null as string | null }

  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return { user, role: (data?.role as string) ?? null }
}

export async function GET() {
  const supabase = await createClient()
  const { user, role } = await getRole(supabase)

  if (!user || (role !== 'admin' && role !== 'team')) {
    return NextResponse.json({ error: 'You are not allowed to do that' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value, updated_at')
    .in('key', EDITABLE_KEYS as unknown as string[])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: Record<string, unknown> = {}
  for (const row of data ?? []) settings[row.key] = row.value

  return NextResponse.json({ settings, role })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { user, role } = await getRole(supabase)

  if (!user || role !== 'admin') {
    return NextResponse.json({ error: 'You are not allowed to do that' }, { status: 403 })
  }

  let body: { key?: string; value?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const key = body.key as EditableKey
  if (!key || !EDITABLE_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Unknown setting key' }, { status: 400 })
  }
  if (typeof body.value !== 'object' || body.value === null || Array.isArray(body.value)) {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('app_settings')
    .update({
      value: body.value as Json,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('key', key)
    .select('key, value, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ setting: data })
}
