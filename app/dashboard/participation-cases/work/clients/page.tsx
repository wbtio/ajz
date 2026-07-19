import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canAccessPath } from '@/lib/permissions'
import { ProgressDashboardClient } from './progress-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function ClientsProgressPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id, role, permissions')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'team') {
        redirect('/dashboard/home')
    }

    if (!canAccessPath(profile?.role, '/dashboard/participation-cases/work/clients', profile?.permissions as string[] | null)) {
        redirect('/dashboard/home')
    }

    // Load independent lookups together so navigation does not create a waterfall.
    const [{ data: events }, { data: employees }] = await Promise.all([
        supabase
            .from('events')
            .select('id, title, title_ar, date, end_date, country, country_ar, location, location_ar, sector, event_type, status, registration_config, conference_config')
            .eq('status', 'draft')
            .order('date', { ascending: false })
            .limit(100),
        supabase
            .from('users')
            .select('id, full_name, email, role')
            .order('full_name', { ascending: true }),
    ])

    return (
        <ProgressDashboardClient
            events={events || []}
            employees={employees || []}
            currentUser={profile}
        />
    )
}
