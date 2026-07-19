import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { DashboardShell } from '@/app/dashboard/_components/dashboard-shell'
import { TooltipProvider } from '@/components/ui/tooltip'
import { isDashboardRole } from '@/lib/permissions'

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

    return (
        <TooltipProvider>
            <DashboardShell user={profile}>
                {children}
            </DashboardShell>
            <Toaster richColors position="top-center" dir="ltr" />
        </TooltipProvider>
    )
}
