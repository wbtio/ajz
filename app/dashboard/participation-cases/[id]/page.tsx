import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CaseDetailsClient } from './case-details-client'

export const dynamic = 'force-dynamic'

export default async function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'team') {
        redirect('/dashboard/home')
    }

    // التسجيل مع الفعالية والموظف
    const { data: registration } = await supabase
        .from('registrations')
        .select(`
            *,
            events(id, title, title_ar, date, end_date, country, country_ar, location, location_ar, sector, status),
            employee:users!registrations_assigned_employee_id_fkey(id, full_name, email)
        `)
        .eq('id', id)
        .maybeSingle()

    if (!registration) notFound()

    // سجل النشاط
    const { data: events } = await supabase
        .from('registration_events')
        .select('*')
        .eq('registration_id', id)
        .order('created_at', { ascending: false })

    return (
        <CaseDetailsClient
            registration={registration}
            events={events ?? []}
        />
    )
}
