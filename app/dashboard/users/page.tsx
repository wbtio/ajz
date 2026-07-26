import { createClient } from '@/lib/supabase/server'
import { UsersView } from './components/users-view'
import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'

export const metadata = {
    title: 'Client Management | JAZ Admin',
}

export default async function UsersPage() {
    await requireDashboardAccess('/dashboard/users')

    // This page shows only website clients (those who registered an account from the website)
    // The role column defaults to 'user' on normal signup, while dashboard members (admin/team)
    // have their own separate "Team" page
    const supabase = await createClient()
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .or('role.is.null,role.not.in.(admin,team)')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Client Management</h1>
                <p className="text-sm text-slate-500">Registered website clients — you can promote any account to a team member or enable/disable access.</p>
            </div>
            <UsersView users={users || []} />
        </div>
    )
}
