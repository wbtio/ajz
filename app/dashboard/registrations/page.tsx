import { createClient } from '@/lib/supabase/server'
import { UnifiedRegistrationsView } from './components/unified-registrations-view'
import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'

export const metadata = {
    title: 'تسجيلات الفعاليات | JAZ Admin',
}

export default async function RegistrationsPage() {
    await requireDashboardAccess('/dashboard/registrations')

    const supabase = await createClient()
    const { data: registrations } = await supabase
        .from('registrations')
        .select(`
            id, full_name, email, status, notes, form_data,
            additional_data, payment_status, total_amount,
            documents, created_at, updated_at, event_id, user_id,
            events ( title_ar, title )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">تسجيلات الفعاليات</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    جميع التسجيلات الواردة من تطبيق الجوال والموقع الإلكتروني
                </p>
            </div>
            <UnifiedRegistrationsView
                registrations={registrations || []}
            />
        </div>
    )
}
