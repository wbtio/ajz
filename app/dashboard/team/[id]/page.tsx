'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    Mail,
    Phone,
    Shield,
    UserCog,
    Power,
    PowerOff,
    Loader2,
    Calendar,
    ListChecks,
    TrendingUp,
    AlertTriangle,
    ClipboardList,
    Clock,
    CheckCircle2,
    Plus,
    Pencil,
    Trash2,
    History,
} from 'lucide-react'
import { DASHBOARD_PAGES, DEFAULT_TEAM_PATHS } from '@/lib/permissions'
import { describeActivity } from '@/lib/activity-labels'
import { formatDate, cn, timeAgo } from '@/lib/utils'

interface TeamMember {
    id: string
    full_name: string | null
    email: string
    phone: string | null
    role: 'admin' | 'team'
    permissions: string[] | null
    created_at: string | null
    is_active: boolean
}

interface TeamTask {
    id: string
    title: string
    status: 'todo' | 'in_progress' | 'done'
    category: string
    priority: 'low' | 'medium' | 'high'
    assignee: string | null
    due_date: string | null
    created_at: string
    updated_at: string | null
    completed_at: string | null
}

interface ActivityEvent {
    id: string
    event_type: string
    path: string
    metadata: Record<string, unknown> | null
    created_at: string
}

const activityIcon = (eventType: string) => {
    switch (eventType) {
        case 'team_task_created': return Plus
        case 'team_task_edited': return Pencil
        case 'team_task_status_changed': return CheckCircle2
        case 'team_task_deleted': return Trash2
        default: return History
    }
}

const statusMeta: Record<TeamTask['status'], { label: string; className: string; icon: React.ReactNode }> = {
    todo: { label: 'To do', className: 'bg-rose-50 text-rose-700', icon: <ClipboardList className="w-3 h-3" /> },
    in_progress: { label: 'In progress', className: 'bg-amber-50 text-amber-700', icon: <Clock className="w-3 h-3" /> },
    done: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
}

const priorityMeta: Record<TeamTask['priority'], { label: string; className: string }> = {
    high: { label: 'High', className: 'text-rose-700' },
    medium: { label: 'Medium', className: 'text-amber-700' },
    low: { label: 'Low', className: 'text-stone-500' },
}

export default function TeamMemberProfilePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [member, setMember] = useState<TeamMember | null>(null)
    const [tasks, setTasks] = useState<TeamTask[]>([])
    const [activity, setActivity] = useState<ActivityEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [memberRes, tasksRes, activityRes] = await Promise.all([
                fetch(`/api/team-members/${id}`),
                fetch('/api/team-tasks'),
                fetch(`/api/team-members/${id}/activity`),
            ])
            if (!memberRes.ok) {
                setNotFound(true)
                return
            }
            const memberData = await memberRes.json()
            setMember(memberData)
            const tasksData = await tasksRes.json()
            setTasks(Array.isArray(tasksData) ? tasksData : [])
            const activityData = await activityRes.json()
            setActivity(Array.isArray(activityData) ? activityData : [])
        } catch (e) {
            console.error(e)
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const memberTasks = useMemo(() => {
        if (!member) return []
        const name = member.full_name || member.email
        return tasks
            .filter((t) => t.assignee === name || t.assignee === member.email)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }, [tasks, member])

    const stats = useMemo(() => {
        const total = memberTasks.length
        const done = memberTasks.filter((t) => t.status === 'done').length
        const inProgress = memberTasks.filter((t) => t.status === 'in_progress').length
        const overdue = memberTasks.filter(
            (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
        ).length
        return {
            total,
            done,
            inProgress,
            overdue,
            rate: total > 0 ? Math.round((done / total) * 100) : 0,
        }
    }, [memberTasks])

    const handleToggleActive = async () => {
        if (!member) return
        const willActivate = !member.is_active
        if (!willActivate && !confirm(`Disable "${member.full_name || member.email}"? They will not be able to sign in until reactivated.`)) return
        try {
            const res = await fetch(`/api/team-members/${member.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: willActivate }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Something went wrong')
            setMember(data)
        } catch (err) {
            alert((err as Error).message)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (notFound || !member) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
                <p className="text-lg font-medium text-gray-700">Team member not found</p>
                <Link href="/dashboard/team" className="text-blue-600 hover:underline text-sm">
                    Back to Team Members
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6" dir="ltr">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/team')}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Team Members
                </Button>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-2xl font-bold text-blue-600">
                            {(member.full_name || member.email).charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{member.full_name || 'Unnamed member'}</h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {member.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                                {member.role === 'admin' ? 'Administrator' : 'Team member'}
                            </span>
                            <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                                member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                            )}>
                                {member.is_active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                                {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {member.email}</span>
                            {member.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {member.phone}</span>}
                            {member.created_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {formatDate(member.created_at)}</span>}
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className={member.is_active ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}
                    onClick={handleToggleActive}
                >
                    {member.is_active ? <PowerOff className="w-4 h-4 ml-2" /> : <Power className="w-4 h-4 ml-2" />}
                    {member.is_active ? 'Disable member' : 'Enable member'}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-2 p-2.5">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                            <ListChecks className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-[11px] text-gray-500">Total tasks</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-2 p-2.5">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{stats.rate}%</div>
                            <div className="text-[11px] text-gray-500">Completion rate</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-2 p-2.5">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{stats.inProgress}</div>
                            <div className="text-[11px] text-gray-500">In progress</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-2 p-2.5">
                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{stats.overdue}</div>
                            <div className="text-[11px] text-gray-500">Overdue tasks</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {member.role === 'team' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Allowed dashboard pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                            {(member.permissions && member.permissions.length > 0 ? member.permissions : DEFAULT_TEAM_PATHS).map((p) => (
                                <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                    {DASHBOARD_PAGES.find((d) => d.path === p)?.label || p}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Member tasks</CardTitle>
                    <CardDescription>All tasks assigned to this member in Daily Tasks</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {memberTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                            <ClipboardList className="w-10 h-10 mb-2" />
                            <p className="text-sm font-medium text-gray-400">No tasks assigned to this member</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {memberTasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                    <span className={cn('inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-bold', statusMeta[task.status].className)}>
                                        {statusMeta[task.status].icon}
                                        {statusMeta[task.status].label}
                                    </span>
                                    <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-800">{task.title}</span>
                                    <span className={cn('shrink-0 text-[11px] font-bold', priorityMeta[task.priority].className)}>
                                        {priorityMeta[task.priority].label}
                                    </span>
                                    {task.due_date && (
                                        <span className={cn(
                                            'shrink-0 text-[11px] text-gray-500 flex items-center gap-1',
                                            task.status !== 'done' && new Date(task.due_date) < new Date() && 'text-rose-600 font-medium'
                                        )}>
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(task.due_date)}
                                        </span>
                                    )}
                                    {task.status === 'done' && task.completed_at && (
                                        <span className="shrink-0 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Completed {formatDate(task.completed_at)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="w-4 h-4 text-gray-400" />
                        Action log
                    </CardTitle>
                    <CardDescription>Important actions performed by this member, in chronological order</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {activity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                            <History className="w-10 h-10 mb-2" />
                            <p className="text-sm font-medium text-gray-400">No actions recorded for this member yet</p>
                        </div>
                    ) : (
                        <div className="max-h-[28rem] overflow-y-auto divide-y">
                            {activity.map((e) => {
                                const Icon = activityIcon(e.event_type)
                                return (
                                    <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                            <Icon className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="flex-1 min-w-0 truncate text-sm text-gray-700">{describeActivity(e)}</span>
                                        <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(e.created_at)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
