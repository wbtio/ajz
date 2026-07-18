import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const fields = ['full_name_as_passport', 'phone', 'email', 'whatsapp_number', 'nationality', 'city', 'employer_name', 'job_title', 'department', 'workplace_type', 'work_phone', 'work_address'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as Record<string, unknown>
  const name = String(body.full_name_as_passport || '').trim()
  const phone = String(body.phone || '').trim()
  if (!name || !phone) return NextResponse.json({ error: 'Full name and primary phone are required' }, { status: 400 })
  const values = Object.fromEntries(fields.map((field) => [field, body[field] || null]))
  const { data, error } = await supabase.from('clients').insert({ ...values, full_name_as_passport: name, created_by: user.id }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ customer: data }, { status: 201 })
}
