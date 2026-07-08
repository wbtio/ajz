import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CasesView } from './components/cases-view'

export const dynamic = 'force-dynamic'

export default async function ParticipationCasesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'team') {
        redirect('/dashboard/home')
    }

    // تسجيلات المشاركة المُدارة (لها case_number) أو كل التسجيلات
    const { data: cases } = await supabase
        .from('registrations')
        .select(`
            id,
            case_number,
            case_status,
            case_source,
            campaign_name,
            full_name,
            email,
            payment_status,
            total_amount,
            status,
            created_at,
            form_data,
            events(id, title, title_ar, date, country, country_ar, status),
            employee:users!registrations_assigned_employee_id_fkey(id, full_name)
        `)
        .not('case_number', 'is', null)
        .order('created_at', { ascending: false })

    // قائمة الفعاليات المتاحة
    const { data: events } = await supabase
        .from('events')
        .select('id, title, title_ar, date, country, country_ar, status')
        .order('date', { ascending: false })
        .limit(100)

    return (
        <CasesView
            initialCases={cases ?? []}
            events={events ?? []}
        />
    )
}
