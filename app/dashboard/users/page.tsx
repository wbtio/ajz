import { createClient } from '@/lib/supabase/server'
import { UsersView } from './components/users-view'

export const metadata = {
    title: 'إدارة العملاء | JAZ Admin',
}

export default async function UsersPage() {
    const supabase = await createClient()

    // هذه الصفحة تعرض عملاء الموقع فقط (من سجّلوا حساب من الموقع)
    // عمود role له قيمة افتراضية 'user' عند التسجيل العادي، وأعضاء لوحة التحكم (مدير/فريق)
    // لهم صفحة "الفريق" المنفصلة
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .or('role.is.null,role.not.in.(admin,team)')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-xl font-bold text-slate-900">إدارة العملاء</h1>
                <p className="text-sm text-slate-500">عملاء الموقع المسجَّلين — يمكنك ترقية أي حساب لعضو فريق أو تفعيل/تعطيل الوصول.</p>
            </div>
            <UsersView users={users || []} />
        </div>
    )
}
