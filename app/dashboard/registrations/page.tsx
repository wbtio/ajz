import { createClient } from '@/lib/supabase/server'
import { SubmissionsView } from './components/registrations-view'

export const metadata = {
    title: 'إدارة التسجيلات | JAZ Admin',
}

export default async function RegistrationsPage() {
    const supabase = await createClient()

    const { data: submissions } = await supabase
        .from('conference_submissions')
        .select(`
            *,
            events:event_id (title, title_ar, conference_config)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة التسجيلات</h1>
                <p className="text-sm text-muted-foreground mt-1">عرض وإدارة جميع طلبات التسجيل والرعاية والشراكات</p>
            </div>
            <SubmissionsView submissions={submissions || []} />
        </div>
    )
}
