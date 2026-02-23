import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Building2, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata = {
    title: 'تسجيلات القطاعات | JAZ Admin',
}

export default async function SectorRegistrationsPage() {
    const supabase = await createClient()

    const { data: registrations, error } = await supabase
        .from('sector_registrations' as any)
        .select(`
            *,
            users:user_id (full_name, email),
            sectors:sector_id (name, name_ar, registration_config)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <Building2 className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">طلبات الشراكة في القطاعات</h1>
                    <p className="text-gray-500 text-sm">عرض وإدارة جميع الطلبات المقدمة عبر نماذج القطاعات</p>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        جميع الطلبات الواردة
                    </h2>
                </CardHeader>
                <CardContent className="p-0">
                    {registrations && registrations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/30">
                                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">القطاع</th>
                                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">مقدم الطلب</th>
                                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">البيانات المقدمة</th>
                                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">الحالة</th>
                                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {registrations.map((reg: any) => (
                                        <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900">
                                                    {(reg.sectors as any)?.name_ar || (reg.sectors as any)?.name || 'قطاع محذوف'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {reg.full_name || (reg.users as any)?.full_name || 'زائر'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {reg.email || (reg.users as any)?.email || '-'}
                                                    </span>
                                                    {reg.phone && (
                                                        <span className="text-xs text-gray-400 mt-0.5" dir="ltr">
                                                            {reg.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {(() => {
                                                    const data = reg.data || {};
                                                    if (Object.keys(data).length === 0) return <span className="text-gray-400 text-sm">-</span>;

                                                    // Get config to map labels
                                                    const config = (reg.sectors as any)?.registration_config || [];
                                                    
                                                    return (
                                                        <div className="space-y-2 max-w-sm">
                                                            {Object.entries(data).slice(0, 5).map(([key, value]) => {
                                                                const fieldConfig = Array.isArray(config) ? config.find((f: any) => f.id === key) : null;
                                                                const label = fieldConfig?.label_ar || fieldConfig?.label_en || key;
                                                                
                                                                return (
                                                                    <div key={key} className="text-sm border-r-2 border-gray-200 pr-2 mr-1">
                                                                        <span className="text-gray-500 ml-1 text-xs block">{label}:</span>
                                                                        <span className="text-gray-900 font-medium break-words block">{String(value)}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {Object.keys(data).length > 5 && (
                                                                <span className="text-xs text-blue-600 font-medium cursor-pointer">
                                                                    ... والمزيد
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                                    reg.status === 'confirmed' || reg.status === 'approved' 
                                                        ? 'bg-green-50 text-green-700 border-green-100'
                                                        : reg.status === 'rejected'
                                                            ? 'bg-red-50 text-red-700 border-red-100'
                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                    {reg.status === 'confirmed' || reg.status === 'approved' ? (
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    ) : reg.status === 'rejected' ? (
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Clock className="w-3.5 h-3.5" />
                                                    )}
                                                    {reg.status === 'confirmed' || reg.status === 'approved' ? 'تم القبول' :
                                                     reg.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                                                {reg.created_at ? formatDate(reg.created_at) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">لا توجد طلبات شراكة حتى الآن</p>
                            <p className="text-gray-500 text-sm">ستظهر الطلبات هنا بمجرد تقديمها من قبل الشركاء المحتملين</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
