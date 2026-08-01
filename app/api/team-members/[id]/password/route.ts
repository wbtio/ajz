import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MIN_PASSWORD_LENGTH = 10

/**
 * Sets a new password for a staff account. Admin only — this hands whoever
 * calls it full control of another person's account.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Only an administrator can change passwords' }, { status: 403 })
  }

  let body: { password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    )
  }

  // Confirm the target is actually a staff account before touching it.
  const admin = createAdminClient()
  const { data: target } = await admin.from('users').select('id, email, role').eq('id', id).single()
  if (!target || (target.role !== 'admin' && target.role !== 'team')) {
    return NextResponse.json({ error: 'That account is not a team member' }, { status: 404 })
  }

  const { error } = await admin.auth.admin.updateUserById(id, { password })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, email: target.email })
}
