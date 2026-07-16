import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { canAccessPath } from '@/lib/permissions'
import { StationDetail } from '../../components/station-detail'

export const dynamic = 'force-dynamic'

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id, role, permissions')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'team') redirect('/dashboard/home')
    if (!canAccessPath(profile?.role, '/dashboard/participation-cases/work/payment', profile?.permissions as string[] | null)) {
        redirect('/dashboard/home')
    }

    const { data: registration } = await supabase
        .from('registrations')
        .select(`*, events(id, title, title_ar, date, end_date, country, country_ar, location, location_ar, sector)`)
        .eq('id', id)
        .maybeSingle()

    if (!registration) notFound()

    return (
        <StationDetail
            registration={registration}
            station="payment"
            stationLabel="المالية والدفع"
            tab="payment"
        />
    )
}
