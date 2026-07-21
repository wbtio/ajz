import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { DashboardShell } from '@/app/dashboard/_components/dashboard-shell'
import { TooltipProvider } from '@/components/ui/tooltip'
import { isDashboardRole } from '@/lib/permissions'
import { AuthProvider } from '@/components/auth/AuthProvider'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin-login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || !isDashboardRole(profile.role)) {
        redirect('/')
    }

    if (profile.is_active === false) {
        await supabase.auth.signOut()
        redirect('/admin-login')
    }

    const dashboardUser = {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        permissions: profile.permissions,
        is_active: profile.is_active,
    }

    return (
        <TooltipProvider>
            <AuthProvider initialUser={dashboardUser}>
                <DashboardShell user={profile}>
                    {children}
                </DashboardShell>
                <Toaster richColors position="top-center" dir="ltr" />
            </AuthProvider>
        </TooltipProvider>
    )
}
