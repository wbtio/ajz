'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Shield, UserCog, UserPlus, Mail, Phone, ListChecks, Users, TrendingUp, AlertTriangle, Search, Power, PowerOff } from 'lucide-react'
import { DASHBOARD_PAGES, DEFAULT_TEAM_PATHS } from '@/lib/permissions'
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
    status: 'todo' | 'in_progress' | 'done'
    assignee: string | null
    due_date: string | null
    created_at: string
    updated_at: string | null
}

const emptyForm = {
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'team' as 'admin' | 'team',
    permissions: [...DEFAULT_TEAM_PATHS] as string[],
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [tasks, setTasks] = useState<TeamTask[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'team'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

    const fetchMembers = async () => {
        setLoading(true)
        try {
            const [membersRes, tasksRes] = await Promise.all([
                fetch('/api/team-members'),
                fetch('/api/team-tasks'),
            ])
            const data = await membersRes.json()
            setMembers(Array.isArray(data) ? data : [])
            const tasksData = await tasksRes.json()
            setTasks(Array.isArray(tasksData) ? tasksData : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const memberStats = useMemo(() => {
        const stats = new Map<string, { total: number; done: number; overdue: number; lastActivity: string | null }>()
        for (const member of members) {
            const name = member.full_name || member.email
            const assigned = tasks.filter((t) => t.assignee === name || t.assignee === member.email)
            const done = assigned.filter((t) => t.status === 'done').length
            const overdue = assigned.filter(
                (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
            ).length
            const lastActivity = assigned
                .map((t) => t.updated_at || t.created_at)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null
            stats.set(member.id, { total: assigned.length, done, overdue, lastActivity })
        }
        return stats
    }, [members, tasks])

    const overallStats = useMemo(() => {
        const total = tasks.length
        const done = tasks.filter((t) => t.status === 'done').length
        const overdue = tasks.filter(
            (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
        ).length
        return {
            total,
            done,
            overdue,
            rate: total > 0 ? Math.round((done / total) * 100) : 0,
        }
    }, [tasks])

    const filteredMembers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        return members.filter((m) => {
            if (roleFilter !== 'all' && m.role !== roleFilter) return false
            if (statusFilter === 'active' && !m.is_active) return false
            if (statusFilter === 'inactive' && m.is_active) return false
            if (q && !(m.full_name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))) return false
            return true
        })
    }, [members, searchQuery, roleFilter, statusFilter])

    const openCreate = () => {
        setEditingMember(null)
        setForm(emptyForm)
        setError('')
        setIsFormOpen(true)
    }

    const openEdit = (member: TeamMember) => {
        setEditingMember(member)
        setForm({
            full_name: member.full_name || '',
            email: member.email,
            password: '',
            phone: member.phone || '',
            role: member.role,
            permissions: member.permissions && member.permissions.length > 0 ? member.permissions : [...DEFAULT_TEAM_PATHS],
        })
        setError('')
        setIsFormOpen(true)
    }

    const togglePermission = (path: string) => {
        setForm((f) => ({
            ...f,
            permissions: f.permissions.includes(path)
                ? f.permissions.filter((p) => p !== path)
                : [...f.permissions, path],
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            if (editingMember) {
                const res = await fetch(`/api/team-members/${editingMember.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: form.full_name,
                        phone: form.phone || null,
                        role: form.role,
                        permissions: form.permissions,
                    }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'حدث خطأ')
            } else {
                const res = await fetch('/api/team-members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: form.full_name,
                        email: form.email,
                        password: form.password,
                        phone: form.phone || null,
                        role: form.role,
                        permissions: form.permissions,
                    }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'حدث خطأ')
            }
            setIsFormOpen(false)
            fetchMembers()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (member: TeamMember) => {
        const willActivate = !member.is_active
        if (!willActivate && !confirm(`تعطيل "${member.full_name || member.email}"؟ لن يتمكن من تسجيل الدخول حتى يُعاد تفعيله.`)) return
        try {
            const res = await fetch(`/api/team-members/${member.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: willActivate }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'حدث خطأ')
            fetchMembers()
        } catch (err) {
            alert((err as Error).message)
        }
    }

    const handleDelete = async (member: TeamMember) => {
        if (!confirm(`هل أنت متأكد من إزالة "${member.full_name || member.email}" من الفريق؟ سيفقد الوصول للوحة التحكم فورًا.`)) return
        try {
            const res = await fetch(`/api/team-members/${member.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'حدث خطأ')
            fetchMembers()
        } catch (err) {
            alert((err as Error).message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الفريق</h1>
                    <p className="text-sm text-gray-500 mt-1">أضف أعضاء الفريق وحدّد الصفحات التي يمكنهم الوصول إليها في لوحة التحكم</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/team/analytics">
                        <Button variant="outline">
                            <TrendingUp className="w-4 h-4 ml-2" />
                            لوحة الأداء
                        </Button>
                    </Link>
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة عضو
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{members.length}</div>
                            <div className="text-xs text-gray-500">عدد أعضاء الفريق</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                            <ListChecks className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overallStats.total}</div>
                            <div className="text-xs text-gray-500">إجمالي المهام</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overallStats.rate}%</div>
                            <div className="text-xs text-gray-500">نسبة الإنجاز الكلية</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{overallStats.overdue}</div>
                            <div className="text-xs text-gray-500">مهام متأخرة</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">أعضاء لوحة التحكم</CardTitle>
                    <CardDescription>المدير لديه وصول كامل، وعضو الفريق يرى فقط الصفحات المحدَّدة له</CardDescription>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                                className="pr-9"
                                dir="rtl"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600"
                        >
                            <option value="all">كل الأدوار</option>
                            <option value="admin">مدير</option>
                            <option value="team">عضو</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">معطّل</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">العضو</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الدور</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الصفحات المسموحة</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المهام</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">آخر نشاط</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">تاريخ الإضافة</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredMembers.map((member) => {
                                        const stats = memberStats.get(member.id) ?? { total: 0, done: 0, overdue: 0, lastActivity: null }
                                        const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
                                        return (
                                        <tr key={member.id} className={cn('hover:bg-gray-50', !member.is_active && 'opacity-60')}>
                                            <td className="py-3 px-4">
                                                <Link href={`/dashboard/team/${member.id}`} className="flex items-center gap-3 group">
                                                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {(member.full_name || member.email).charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 truncate group-hover:underline">{member.full_name || 'بدون اسم'}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                            <Mail className="w-3 h-3 shrink-0" /> {member.email}
                                                        </div>
                                                        {member.phone && (
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Phone className="w-3 h-3 shrink-0" /> {member.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                                    member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {member.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                                                    {member.role === 'admin' ? 'مدير' : 'عضو'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                                                    member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                                                )}>
                                                    {member.is_active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                                                    {member.is_active ? 'نشط' : 'معطّل'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {member.role === 'admin' ? (
                                                    <span className="text-xs text-gray-500">كل الصفحات</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {(member.permissions && member.permissions.length > 0 ? member.permissions : DEFAULT_TEAM_PATHS).map((p) => (
                                                            <span key={p} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                {DASHBOARD_PAGES.find((d) => d.path === p)?.label || p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {stats.total === 0 ? (
                                                    <span className="text-xs text-gray-400">لا توجد مهام</span>
                                                ) : (
                                                    <div className="min-w-[120px] space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-600 font-medium">{stats.done}/{stats.total}</span>
                                                            <span className="text-gray-400">{rate}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    'h-full rounded-full',
                                                                    rate === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                                )}
                                                                style={{ width: `${rate}%` }}
                                                            />
                                                        </div>
                                                        {stats.overdue > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-medium">
                                                                <AlertTriangle className="w-3 h-3" /> {stats.overdue} متأخرة
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">
                                                {stats.lastActivity ? timeAgo(stats.lastActivity) : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {member.created_at ? formatDate(member.created_at) : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(member)} title="تعديل">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={member.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
                                                        onClick={() => handleToggleActive(member)}
                                                        title={member.is_active ? 'تعطيل' : 'تفعيل'}
                                                    >
                                                        {member.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(member)} title="إزالة نهائية">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        )
                                    })}
                                    {filteredMembers.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-gray-500">
                                                {members.length === 0 ? 'لا يوجد أعضاء بعد' : 'لا توجد نتائج مطابقة للبحث/الفلترة'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-6 md:p-8" dir="rtl">
                    <DialogHeader className="text-right pb-4 border-b border-slate-100">
                        <DialogTitle className="text-lg font-bold text-slate-900">{editingMember ? 'تعديل بيانات عضو الفريق' : 'إضافة عضو جديد للفريق'}</DialogTitle>
                        <span className="text-xs text-slate-500 mt-1 block">يرجى إدخال البيانات المطلوبة وتحديد الصلاحيات للوصول إلى لوحة التحكم.</span>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 text-xs font-medium p-3 rounded-lg border border-red-100">{error}</div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">الاسم الكامل</Label>
                                <Input 
                                    value={form.full_name} 
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
                                    required 
                                    className="h-10 text-sm border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg transition-all"
                                    placeholder="مثال: منتظر احمد الاقوى في الكون" 
                                    dir="rtl" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">البريد الإلكتروني</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    disabled={!!editingMember}
                                    className="h-10 text-sm border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                    placeholder="name@company.com"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!editingMember ? (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-700">كلمة المرور</Label>
                                    <Input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                        minLength={6}
                                        className="h-10 text-sm border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg transition-all"
                                        placeholder="••••••••"
                                        dir="ltr"
                                    />
                                </div>
                            ) : null}

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">رقم الهاتف (اختياري)</Label>
                                <Input 
                                    value={form.phone || ''} 
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                                    className="h-10 text-sm border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg transition-all"
                                    placeholder="07700000000" 
                                    dir="ltr" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">الدور في لوحة التحكم</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'admin' })}
                                    className={`flex flex-col items-start p-4 rounded-lg border text-right transition-all duration-150 ${
                                        form.role === 'admin' 
                                            ? 'border-slate-900 bg-slate-50 text-slate-900 font-semibold shadow-sm' 
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-655'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-4 h-4 text-slate-700" />
                                        <span className="text-sm font-bold">مدير (وصول كامل)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        يمنح العضو وصولاً كاملاً لكل صفحات لوحة التحكم، وإضافة وتعديل بيانات أعضاء الفريق.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'team' })}
                                    className={`flex flex-col items-start p-4 rounded-lg border text-right transition-all duration-150 ${
                                        form.role === 'team' 
                                            ? 'border-slate-900 bg-slate-50 text-slate-900 font-semibold shadow-sm' 
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-655'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <UserCog className="w-4 h-4 text-slate-700" />
                                        <span className="text-sm font-bold">عضو (صلاحيات محددة)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        يسمح لك بتحديد صفحات معينة فقط يمكن للعضو تصفحها وإدارتها في لوحة التحكم.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {form.role === 'team' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-755">الصفحات المسموح للعضو بالوصول إليها</Label>
                                    <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-4 max-h-56 overflow-y-auto bg-slate-50/20">
                                        {DASHBOARD_PAGES.map((page) => {
                                            const isChecked = form.permissions.includes(page.path);
                                            return (
                                                <label 
                                                    key={page.path} 
                                                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                                        isChecked 
                                                            ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium' 
                                                            : 'border-slate-100 bg-white hover:bg-slate-50/50 text-slate-600'
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={() => {
                                                            const hasPage = form.permissions.includes(page.path)
                                                            let newPerms = hasPage
                                                                ? form.permissions.filter((p) => p !== page.path)
                                                                : [...form.permissions, page.path]
                                                            
                                                            // Auto toggle sub-permissions for events
                                                            if (page.path === '/dashboard/events') {
                                                                if (hasPage) {
                                                                    newPerms = newPerms.filter(p => !p.startsWith('/dashboard/events:'))
                                                                } else {
                                                                    newPerms = [...newPerms, '/dashboard/events:registration', '/dashboard/events:design', '/dashboard/events:publishing', '/dashboard/events:leads']
                                                                }
                                                            }
                                                            setForm(f => ({ ...f, permissions: newPerms }))
                                                        }}
                                                    />
                                                    <span>{page.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {form.permissions.includes('/dashboard/events') && (
                                    <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-lg" dir="rtl">
                                        <Label className="text-slate-900 font-bold text-xs block mb-1">صلاحيات خطوات إدارة الفعاليات بالتفصيل</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {[
                                                { key: '/dashboard/events:registration', label: '1. تسجيل الفعالية' },
                                                { key: '/dashboard/events:design', label: '2. فريق التصميم' },
                                                { key: '/dashboard/events:leads', label: '3. الرد وتأشيرات TLS والعملاء' },
                                                { key: '/dashboard/events:publishing', label: '4. النشر والترويج' }
                                            ].map((step) => {
                                                const isStepChecked = form.permissions.includes(step.key);
                                                return (
                                                    <label 
                                                        key={step.key} 
                                                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                                            isStepChecked 
                                                                ? 'border-slate-400 bg-white text-slate-900 font-medium' 
                                                                : 'border-transparent bg-transparent/20 hover:bg-white/40 text-slate-600'
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            checked={isStepChecked}
                                                            onCheckedChange={() => {
                                                                const hasSub = form.permissions.includes(step.key)
                                                                const newPerms = hasSub
                                                                    ? form.permissions.filter(p => p !== step.key)
                                                                    : [...form.permissions, step.key]
                                                                setForm(f => ({ ...f, permissions: newPerms }))
                                                            }}
                                                        />
                                                        <span>{step.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsFormOpen(false)}
                                className="h-10 rounded-lg px-5 text-sm font-medium border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                            >
                                إلغاء
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={saving}
                                className="h-10 rounded-lg px-6 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    'حفظ التغييرات'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
