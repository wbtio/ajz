import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// هذا الـlayout غلاف بسيط للمحطات.
// لا نعرض شريط تنقّل بين المحطات هنا — الموظف ينتقل فقط عبر الـsidebar
// الذي يعرض المحطات المسموح بها له حصراً، حتى لا يستطيع القفز لمحطة خارج صلاحيته.
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
