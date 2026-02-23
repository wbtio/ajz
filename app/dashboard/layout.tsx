import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

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

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <DashboardSidebar user={profile} />
            <main className="flex-1 p-8">
                <TooltipProvider>
                    {children}
                </TooltipProvider>
            </main>
        </div>
    )
}
