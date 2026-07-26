import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// This layout is a simple wrapper for the stations.
// We don't show a navigation bar between stations here — the employee navigates only via the sidebar,
// which shows only the stations they're permitted to access, so they can't jump to a station outside their permissions.
export default async function WorkLayout({ children }: { children: React.ReactNode }) {
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

    return <>{children}</>
}
