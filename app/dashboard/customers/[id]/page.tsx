import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { canAccessPath } from '@/lib/permissions'
import { CustomerDetails } from './customer-details'

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = 'force-dynamic'

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('users').select('id, role, permissions').eq('id', user.id).single()
  if (!profile || !canAccessPath(profile.role, '/dashboard/customers', profile.permissions as string[] | null)) redirect('/dashboard/home')

  const { data: customer } = await supabase.from('clients').select('id, full_name_as_passport, first_name, last_name, date_of_birth, place_of_birth, sex, nationality, marital_status, residence_country, city, full_address, passport_number, passport_type, passport_issue_date, passport_expiry_date, passport_place_of_issue, passport_copy_url, email, phone, whatsapp_number, employer_name, workplace_type, work_address, work_city, work_governorate, job_title, department, professional_specialty, work_phone, work_email, source_event_name, jaz_sector, preferred_contact_method, imported_source_date, imported_employee_name, referred_by, inquiry_reason, follow_up_date, source_note, notes, created_at, updated_at').eq('id', id).maybeSingle()
  if (!customer) notFound()

  const { data: registrations } = await supabase.from('registrations').select('id, case_number, current_step, case_status, status, payment_status, documents, total_amount, updated_at, created_at, event_id, events(id, title, title_ar, date, location), assigned_employee:users!registrations_assigned_employee_id_fkey(id, full_name, avatar_url)').eq('client_id', id).order('updated_at', { ascending: false })
  const registrationIds = (registrations || []).map((r: any) => r.id)
  const [{ data: appointments }, { data: edits }] = await Promise.all([
    registrationIds.length ? supabase.from('visa_availability_slots').select('id, slot_date, slot_time, status, updated_at, assigned_registration_id').in('assigned_registration_id', registrationIds) : Promise.resolve({ data: [] as any[] }),
    registrationIds.length ? supabase.from('registration_edits').select('id, registration_id, field_label, new_value, edited_by, editor_user_id, created_at').in('registration_id', registrationIds).order('created_at', { ascending: false }).limit(20) : Promise.resolve({ data: [] as any[] }),
  ])
  return <CustomerDetails customer={customer} registrations={(registrations || []) as any[]} appointments={(appointments || []) as any[]} edits={(edits || []) as any[]} />
}
