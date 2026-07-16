import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canAccessPath } from '@/lib/permissions'
import { StationList } from '../components/station-list'

export const dynamic = 'force-dynamic'

export default async function ClosureStation() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id, role, permissions')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'team') redirect('/dashboard/home')
    if (!canAccessPath(profile?.role, '/dashboard/participation-cases/work/closure', profile?.permissions as string[] | null)) {
        redirect('/dashboard/home')
    }

    const { data: cases } = await supabase
        .from('registrations')
        .select(`
            id, case_number, case_status, full_name, email, created_at, form_data,
            events(id, title, title_ar, date)
        `)
        .in('case_status', ['completed', 'closed', 'cancelled', 'on_hold'])
        .order('created_at', { ascending: false })

    return (
        <StationList
            cases={cases ?? []}
            station="closure"
            title="الإغلاق والمتابعة"
            desc="الملفات المكتملة والمغلقة والملغاة"
        />
    )
}
