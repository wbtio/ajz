import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const metadata = {
    title: 'إدارة المستخدمين | JAZ Admin',
}

export default async function UsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">إدارة المستخدمين</h1>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold text-gray-900">جميع المستخدمين</h2>
                </CardHeader>
                <CardContent>
                    {users && users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الاسم</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">البريد الإلكتروني</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الهاتف</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الدور</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">تاريخ التسجيل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.full_name || 'غير محدد'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">{user.email}</td>
                                            <td className="py-3 px-4 text-gray-500">{user.phone || '-'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {user.created_at ? formatDate(user.created_at) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">لا يوجد مستخدمين حتى الآن</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
