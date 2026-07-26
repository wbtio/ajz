import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'
import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'

export const metadata = {
    title: 'Training Management | JAZ Admin',
}

export default async function TrainingsPage() {
  await requireDashboardAccess('/dashboard/trainings')

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Training Management</h1>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold text-gray-900">Training Programs</h2>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Training management page is under development</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
