import { AlertTriangle, ListChecks, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type TeamStats = {
    memberCount: number
    taskCount: number
    completionRate: number
    overdueCount: number
}

const STAT_ITEMS = [
    { key: 'memberCount', label: 'Team members', icon: Users, iconClass: 'bg-blue-100 text-blue-600', suffix: '' },
    { key: 'taskCount', label: 'Total tasks', icon: ListChecks, iconClass: 'bg-purple-100 text-purple-600', suffix: '' },
    { key: 'completionRate', label: 'Completion rate', icon: TrendingUp, iconClass: 'bg-emerald-100 text-emerald-600', suffix: '%' },
    { key: 'overdueCount', label: 'Overdue tasks', icon: AlertTriangle, iconClass: 'bg-rose-100 text-rose-600', suffix: '' },
] as const

export function TeamStatsCards({ stats }: { stats: TeamStats }) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STAT_ITEMS.map(({ key, label, icon: Icon, iconClass, suffix }) => (
                <Card key={key}>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{stats[key]}{suffix ?? ''}</div>
                            <div className="text-xs text-gray-500">{label}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
