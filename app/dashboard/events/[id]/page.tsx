import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EventDetailsClient } from './components/event-details-client'

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

    // Fetch Current User Role and Permissions to set initial UI lock state
    const { data: { user: authUser } } = await supabase.auth.getUser()
    let userRole = 'team'
    let userPermissions: string[] = []

    if (authUser) {
        const { data: profile } = await supabase
            .from('users')
            .select('role, permissions')
            .eq('id', authUser.id)
            .single()
        
        if (profile) {
            userRole = profile.role || 'team'
            userPermissions = profile.permissions || []
        }
    }

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

