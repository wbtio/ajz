import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canAccessPath } from '@/lib/permissions'
import { CustomersTable } from './customers-table'

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, permissions')
    .eq('id', user.id)
    .single()

  if (!profile || !canAccessPath(profile.role, '/dashboard/customers', profile.permissions as string[] | null)) {
    redirect('/dashboard/home')
  }

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id, full_name_as_passport, first_name, last_name, email, phone, whatsapp_number,
      nationality, city, employer_name, job_title, department, workplace_type,
      work_address, work_city, work_governorate, work_phone, work_email,
      source_event_name, jaz_sector, preferred_contact_method, imported_source_date,
      imported_employee_name, referred_by, inquiry_reason, follow_up_date, source_note,
      passport_number, passport_expiry_date, updated_at,
      registrations(
        id, case_number, current_step, case_status, status, payment_status, documents, additional_data,
        updated_at, created_at, events(id, title, title_ar, date),
        assigned_employee:users!registrations_assigned_employee_id_fkey(id, full_name, avatar_url)
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(1000)

  if (error) console.error('Customers directory query failed', error)

  return <CustomersTable clients={(clients || []) as any[]} />
}
