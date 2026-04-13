import { createClient } from '@/lib/supabase/server'
import { SectorRegistrationsView } from './components/sector-registrations-view'
import type { Tables } from '@/lib/database.types'

export const metadata = {
  title: 'تسجيلات القطاعات | JAZ Admin',
}

type RegistrationRecord = Tables<'sector_registrations'> & {
  users: Pick<Tables<'users'>, 'full_name' | 'email'> | null
  sectors: Pick<Tables<'sectors'>, 'id' | 'name' | 'name_ar' | 'slug' | 'color' | 'registration_config'> | null
}

export default async function SectorRegistrationsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sector_registrations' as any)
    .select(`
      *,
      users:user_id (full_name, email),
      sectors:sector_id (id, name, name_ar, slug, color, registration_config)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading sector registrations:', error)
  }

  const registrations = ((data ?? []) as unknown) as RegistrationRecord[]

  return <SectorRegistrationsView registrations={registrations} />
}
