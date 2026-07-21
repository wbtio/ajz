import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { EventDetailsClient } from './components/event-details-client'
import { canAccessPath, isDashboardRole } from '@/lib/permissions'

interface EventDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export const metadata = {
    title: 'Event Details and Management | JAZ Admin',
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Check permissions
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/admin-login')

    const { data: profile } = await supabase
        .from('users')
        .select('role, permissions')
        .eq('id', authUser.id)
        .single()

    if (!profile || !isDashboardRole(profile.role) || !canAccessPath(profile.role, '/dashboard/events', profile.permissions)) {
        redirect('/dashboard/home')
    }

    // Fetch Event Details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (eventError || !event) {
        notFound()
    }

    // Fetch Registrations for the check-in list & embassy bookings
    const { data: registrations, error: regsError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false })

    if (regsError) {
        console.error('Error fetching registrations:', regsError)
    }

    // Use the already fetched profile for UI state
    const userRole = profile.role || 'team'
    const userPermissions = profile.permissions || []

    return (
        <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
            <EventDetailsClient 
                initialEvent={event} 
                registrations={registrations || []} 
                userRole={userRole}
                userPermissions={userPermissions}
            />
        </div>
    )
}

