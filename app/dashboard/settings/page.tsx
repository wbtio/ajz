import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export const metadata = {
    title: 'الإعدادات | JAZ Admin',
}

export default function SettingsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h1>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold text-gray-900">إعدادات النظام</h2>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">صفحة الإعدادات قيد التطوير</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
