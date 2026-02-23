import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

export const metadata = {
    title: 'إدارة التدريب | JAZ Admin',
}

export default function TrainingsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">إدارة التدريب</h1>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold text-gray-900">برامج التدريب</h2>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">صفحة إدارة التدريب قيد التطوير</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
