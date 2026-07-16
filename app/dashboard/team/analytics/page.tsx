'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, ListChecks, TrendingUp, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TeamMember {
    id: string
    full_name: string | null
    email: string
    role: 'admin' | 'team'
    is_active: boolean
}

interface TeamTask {
    id: string
    title: string
    category: string
    status: 'todo' | 'in_progress' | 'done'
    assignee: string | null
    due_date: string | null
    created_at: string
    completed_at: string | null
    updated_at?: string | null
}

const categoryLabels: Record<string, string> = {
    development: 'Development',
    events: 'Events',
    visas: 'Invitations & visas',
    partners: 'Partners',
    marketing: 'Marketing',
    general: 'General',
}

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#f43f5e', '#14b8a6', '#d946ef', '#78716c']

export default function TeamAnalyticsPage() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [tasks, setTasks] = useState<TeamTask[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/team-members').then((r) => (r.ok ? r.json() : [])),
            fetch('/api/team-tasks').then((r) => (r.ok ? r.json() : [])),
        ])
            .then(([m, t]) => {
                setMembers(Array.isArray(m) ? m : [])
                setTasks(Array.isArray(t) ? t : [])
            })
            .finally(() => setLoading(false))
    }, [])

    const overall = useMemo(() => {
        const total = tasks.length
        const done = tasks.filter((t) => t.status === 'done').length
        const overdue = tasks.filter(
            (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
        ).length
        const completionHours = tasks
            .filter((t) => t.completed_at)
            .map((t) => (new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime()) / 3_600_000)
        const avgHours = completionHours.length
            ? completionHours.reduce((a, b) => a + b, 0) / completionHours.length
            : 0
        return {
            total,
            done,
            overdue,
            rate: total > 0 ? Math.round((done / total) * 100) : 0,
            avgHours: Math.round(avgHours * 10) / 10,
        }
    }, [tasks])

    const leaderboard = useMemo(() => {
        return members
            .filter((m) => m.role === 'team' || m.role === 'admin')
            .map((m) => {
                const name = m.full_name || m.email
                const assigned = tasks.filter((t) => t.assignee === name || t.assignee === m.email)
                const done = assigned.filter((t) => t.status === 'done').length
                const overdue = assigned.filter(
                    (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
                ).length
                return {
                    name,
                    total: assigned.length,
                    done,
                    overdue,
                    rate: assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0,
                }
            })
            .filter((m) => m.total > 0)
            .sort((a, b) => b.done - a.done)
    }, [members, tasks])

    const trend = useMemo(() => {
        const days = 14
        const buckets: { date: string; label: string; completed: number }[] = []
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            d.setHours(0, 0, 0, 0)
            buckets.push({ date: d.toISOString().slice(0, 10), label: formatDate(d).slice(5), completed: 0, created: 0, completionRate: 0 } as typeof buckets[number] & { created: number; completionRate: number })
        }
        const index = new Map(buckets.map((b, i) => [b.date, i]))
        for (const t of tasks) {
            const createdIndex = index.get(t.created_at.slice(0, 10))
            if (createdIndex !== undefined) (buckets[createdIndex] as typeof buckets[number] & { created: number }).created += 1
            if (!t.completed_at) continue
            const key = t.completed_at.slice(0, 10)
            const i = index.get(key)
            if (i !== undefined) buckets[i].completed += 1
        }
        return buckets.map((bucket) => ({
            ...bucket,
            completionRate: (bucket as typeof bucket & { created: number }).created > 0
                ? Math.round((bucket.completed / (bucket as typeof bucket & { created: number }).created) * 100)
                : 0,
        }))
    }, [tasks])

    const taskActivity = useMemo(() => {
        const duration = (task: TeamTask) => {
            if (!task.completed_at) return 'In progress'
            const hours = (new Date(task.completed_at).getTime() - new Date(task.created_at).getTime()) / 3_600_000
            return hours < 24 ? `${Math.max(1, Math.round(hours * 10) / 10)} h` : `${Math.round(hours / 24 * 10) / 10} d`
        }
        const memberName = new Map(members.map((member) => [member.full_name || member.email, member.full_name || member.email]))
        return [...tasks]
            .sort((a, b) => new Date(b.completed_at || b.updated_at || b.created_at).getTime() - new Date(a.completed_at || a.updated_at || a.created_at).getTime())
            .slice(0, 20)
            .map((task) => ({ ...task, memberName: memberName.get(task.assignee || '') || task.assignee || 'Unassigned', duration: duration(task) }))
    }, [members, tasks])

    const categoryBreakdown = useMemo(() => {
        const counts = new Map<string, number>()
        for (const t of tasks) {
            counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
        }
        return Array.from(counts.entries()).map(([key, value]) => ({
            name: categoryLabels[key] || key,
            value,
        }))
    }, [tasks])

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-5" dir="ltr">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/team">
                    <button className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100">
                        <ArrowRight className="w-4 h-4" />
                        Team members
                    </button>
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">A clear view of team productivity and task delivery</p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                            <ListChecks className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overall.total}</div>
                            <div className="text-xs text-gray-500">Total tasks</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overall.rate}%</div>
                            <div className="text-xs text-gray-500">Completion rate</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overall.avgHours || '-'}{overall.avgHours ? ' h' : ''}</div>
                            <div className="text-xs text-gray-500">Average completion time</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overall.overdue}</div>
                            <div className="text-xs text-gray-500">Overdue tasks</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Completed in the last 14 days</CardTitle>
                        <CardDescription>Tasks completed per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#059669" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tasks by category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] w-full">
                            {categoryBreakdown.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-gray-400">No task data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                            {categoryBreakdown.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Daily completion rate</CardTitle>
                    <CardDescription>Completed tasks compared with tasks created each day</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value) => [`${value}%`, 'Completion rate']} />
                                <Line type="monotone" dataKey="completionRate" name="Completion rate" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Task activity log</CardTitle>
                    <CardDescription>Recent work completed or updated by each team member</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead className="border-y bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Task</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Member</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Duration</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Completed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {taskActivity.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{task.title || 'Untitled task'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.memberName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.status === 'done' ? 'Completed' : task.status === 'in_progress' ? 'In progress' : 'To do'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.duration}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{task.completed_at ? formatDate(task.completed_at) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {taskActivity.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No task activity yet</div>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Member leaderboard</CardTitle>
                    <CardDescription>Ranked by completed tasks</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No assigned tasks yet</div>
                    ) : (
                        <>
                            <div className="w-full px-4 pt-4" style={{ height: Math.max(200, leaderboard.length * 44) }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={leaderboard}
                                        layout="vertical"
                                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="done" name="Completed" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={18} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="overflow-x-auto mt-2">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-y">
                                        <tr>
                                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Member</th>
                                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Total</th>
                                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Completed</th>
                                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Completion rate</th>
                                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Overdue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {leaderboard.map((m) => (
                                            <tr key={m.name}>
                                                <td className="py-2.5 px-4 text-sm font-medium text-gray-800">{m.name}</td>
                                                <td className="py-2.5 px-4 text-sm text-gray-600">{m.total}</td>
                                                <td className="py-2.5 px-4 text-sm text-gray-600">{m.done}</td>
                                                <td className="py-2.5 px-4 text-sm text-gray-600">{m.rate}%</td>
                                                <td className="py-2.5 px-4 text-sm">
                                                    {m.overdue > 0 ? (
                                                        <span className="text-rose-600 font-medium">{m.overdue}</span>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
