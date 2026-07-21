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
    //
    // The events catalog is intentionally split into two tables — see
    // supabase/migrations/015_split_events_into_website_and_drift.sql:
    //
    //   • public.events        — the website catalog, surfaced on
    //                            /dashboard/events (full management surface:
    //                            image, capacity, price, lifecycle, etc.).
    //   • public.drift_events  — used **only** by this new-registration
    //                            wizard. It is the dropdown attendees see,
    //                            decoupled from the website catalog so
    //                            drafts / hidden events cannot leak into the
    //                            applicant flow. Visibility is governed by
    //                            both `is_active = true` and
    //                            `status = 'active'`.
    const [{ data: events }, { data: employees }] = await Promise.all([
        supabase
            .from('drift_events')
            .select('id, title, title_ar, date, end_date, country, country_ar, location, location_ar, sector, event_type, status, registration_config, conference_config')
            .eq('is_active', true)
            .eq('status', 'active')
            .order('date', { ascending: false }),
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
