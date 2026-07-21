import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'
import { SettingsClient } from './components/settings-client'

export const metadata = {
    title: 'الإعدادات | JAZ Admin',
}

export default async function SettingsPage() {
    await requireDashboardAccess('/dashboard/settings')
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h1>
            <SettingsClient />
        </div>
    )
}
