import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const editableFields = ['full_name_as_passport', 'sex', 'nationality', 'city', 'phone', 'whatsapp_number', 'email', 'full_address', 'employer_name', 'job_title', 'department', 'workplace_type', 'work_address', 'work_phone', 'source_event_name', 'jaz_sector', 'preferred_contact_method', 'imported_source_date', 'imported_employee_name', 'referred_by', 'inquiry_reason', 'follow_up_date', 'source_note', 'notes'] as const


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as Record<string, unknown>
  const updates = Object.fromEntries(editableFields.filter((field) => field in body).map((field) => [field, body[field] ?? null]))
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 })

  const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select('id, updated_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ customer: data })
}
