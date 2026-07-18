'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Edit, Trash2, Loader2, Shield, UserCog, UserPlus, Mail, Phone, TrendingUp, AlertTriangle, Search, Power, PowerOff, Upload } from 'lucide-react'
import { DASHBOARD_PAGES, DEFAULT_TEAM_PATHS } from '@/lib/permissions'
import { formatDate, cn, timeAgo } from '@/lib/utils'
import { TeamStatsCards } from './components/team-stats-cards'

interface TeamMember {
    id: string
    full_name: string | null
    email: string
    phone: string | null
    role: 'admin' | 'team'
    permissions: string[] | null
    avatar_url: string | null
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
    avatar_url: 'https://api.dicebear.com/10.x/notionists/svg?seed=Amina&backgroundColor=f1f5f9&radius=50',
}

const AVATAR_PRESETS = [
    { seed: 'Amina', label: 'Amina', style: 'lorelei' },
    { seed: 'Dalia', label: 'Dalia', style: 'lorelei' },
    { seed: 'Farah', label: 'Farah', style: 'lorelei' },
    { seed: 'Hana', label: 'Hana', style: 'lorelei' },
    { seed: 'Jana', label: 'Jana', style: 'lorelei' },
    { seed: 'Lina', label: 'Lina', style: 'lorelei' },
    { seed: 'Basil', label: 'Basil', style: 'notionists' },
    { seed: 'Elias', label: 'Elias', style: 'notionists' },
    { seed: 'Ghaith', label: 'Ghaith', style: 'notionists' },
    { seed: 'Idris', label: 'Idris', style: 'notionists' },
    { seed: 'Kareem', label: 'Kareem', style: 'notionists' },
    { seed: 'Omar', label: 'Omar', style: 'notionists' },
].map(({ seed, label, style }) => ({
    seed: label,
    url: `https://api.dicebear.com/10.x/${style}/svg?seed=${seed}&backgroundColor=f1f5f9&radius=50`,
}))

const ACCESS_BADGE_COLORS = [
    'border-sky-200/80 bg-sky-50 text-sky-700',
    'border-emerald-200/80 bg-emerald-50 text-emerald-700',
    'border-violet-200/80 bg-violet-50 text-violet-700',
    'border-amber-200/80 bg-amber-50 text-amber-800',
    'border-rose-200/80 bg-rose-50 text-rose-700',
] as const

function accessBadgeColor(path: string) {
    let hash = 0
    for (let index = 0; index < path.length; index += 1) hash = (hash * 31 + path.charCodeAt(index)) >>> 0
    return ACCESS_BADGE_COLORS[hash % ACCESS_BADGE_COLORS.length]
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
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

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
        setAvatarFile(null)
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
            avatar_url: member.avatar_url || '',
        })
        setAvatarFile(null)
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

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('The image must be smaller than 5 MB.')
            return
        }
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = () => setForm((current) => ({ ...current, avatar_url: String(reader.result) }))
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            let avatarUrl = form.avatar_url
            if (avatarFile) {
                const uploadData = new FormData()
                uploadData.append('file', avatarFile)
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData })
                const uploadResult = await uploadRes.json()
                if (!uploadRes.ok || !uploadResult.url) {
                    throw new Error(uploadResult.error || 'Image upload failed')
                }
                avatarUrl = uploadResult.url
            }

            if (editingMember) {
                const res = await fetch(`/api/team-members/${editingMember.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: form.full_name,
                        phone: form.phone || null,
                        role: form.role,
                        permissions: form.permissions,
                        avatar_url: avatarUrl || null,
                    }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Request failed')
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
                        avatar_url: avatarUrl || null,
                    }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Request failed')
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
        if (!willActivate && !confirm(`Disable "${member.full_name || member.email}"? They will not be able to sign in until reactivated.`)) return
        try {
            const res = await fetch(`/api/team-members/${member.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: willActivate }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Request failed')
            fetchMembers()
        } catch (err) {
            alert((err as Error).message)
        }
    }

    const handleDelete = async (member: TeamMember) => {
        if (!confirm(`Remove "${member.full_name || member.email}" from the team? Dashboard access will be revoked.`)) return
        try {
            const res = await fetch(`/api/team-members/${member.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Request failed')
            fetchMembers()
        } catch (err) {
            alert((err as Error).message)
        }
    }

    return (
        <div className="space-y-5" dir="ltr">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/team/analytics">
                        <Button variant="outline">
                            <TrendingUp className="w-4 h-4 ml-2" />
                            Team Analytics
                        </Button>
                    </Link>
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 ml-2" />
                            Add member
                    </Button>
                </div>
            </div>

            <TeamStatsCards
                stats={{
                    memberCount: members.length,
                    taskCount: overallStats.total,
                    completionRate: overallStats.rate,
                    overdueCount: overallStats.overdue,
                }}
            />

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-9 text-left"
                                dir="ltr"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600"
                        >
                            <option value="all">All roles</option>
                            <option value="admin">Administrator</option>
                            <option value="team">Team member</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600"
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Member</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Access</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Tasks</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Last activity</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                                        <th className="py-3 px-4"></th>
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
                                                    <Avatar className="size-9 border border-slate-200 bg-slate-50">
                                                        <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || member.email} />
                                                        <AvatarFallback className="font-medium text-blue-600">
                                                            {(member.full_name || member.email).charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 truncate group-hover:underline">{member.full_name || 'Unnamed member'}</div>
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
                                                    {member.role === 'admin' ? 'Administrator' : 'Team member'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                                                    member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                                                )}>
                                                    {member.is_active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                                                    {member.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {member.role === 'admin' ? (
                                                    <span className="text-xs text-gray-500">All pages</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {(member.permissions && member.permissions.length > 0 ? member.permissions : DEFAULT_TEAM_PATHS).map((p) => (
                                                            <span key={p} className={cn('rounded border px-1.5 py-0.5 text-[10px] font-medium', accessBadgeColor(p))}>
                                                                {DASHBOARD_PAGES.find((d) => d.path === p)?.label || p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {stats.total === 0 ? (
                                                    <span className="text-xs text-gray-400">No tasks</span>
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
                                                                <AlertTriangle className="w-3 h-3" /> {stats.overdue} overdue
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
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(member)} title="Edit member">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={member.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
                                                        onClick={() => handleToggleActive(member)}
                                                        title={member.is_active ? 'Deactivate member' : 'Activate member'}
                                                    >
                                                        {member.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(member)} title="Remove member">
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
                                                {members.length === 0 ? 'No team members yet' : 'No members match the current filters'}
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
                <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-6 md:p-8" dir="ltr">
                    <DialogHeader className="text-left pb-4 border-b border-slate-100">
                        <DialogTitle className="text-lg font-bold text-slate-900">{editingMember ? 'Edit team member' : 'Add team member'}</DialogTitle>
                        <span className="text-xs text-slate-500 mt-1 block">Enter the member details and choose dashboard access.</span>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 text-xs font-medium p-3 rounded-lg border border-red-100">{error}</div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label className="text-xs font-medium text-slate-700">Profile image</Label>
                                <span className="text-[10px] text-slate-400">Choose an avatar</span>
                            </div>
                            <div className="grid grid-cols-6 gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className={cn(
                                        'flex aspect-square flex-col items-center justify-center gap-1 rounded-full border-2 bg-white text-slate-500 transition-all hover:scale-105 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
                                        form.avatar_url.startsWith('data:image/') ? 'border-[#8B0000] ring-2 ring-[#8B0000]/15' : 'border-dashed border-slate-300'
                                    )}
                                    aria-label="Upload profile image"
                                >
                                    {form.avatar_url.startsWith('data:image/') ? (
                                        <Avatar className="size-full"><AvatarImage src={form.avatar_url} alt="Uploaded profile" /></Avatar>
                                    ) : (
                                        <><Upload className="size-4" /><span className="text-[8px] font-medium">Upload</span></>
                                    )}
                                </button>
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                {AVATAR_PRESETS.map((avatar) => {
                                    const isSelected = form.avatar_url === avatar.url
                                    return (
                                        <button
                                            key={avatar.seed}
                                            type="button"
                                            onClick={() => setForm({ ...form, avatar_url: avatar.url })}
                                            className={cn(
                                                'flex aspect-square items-center justify-center rounded-full border-2 bg-white p-0.5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
                                                isSelected ? 'border-[#8B0000] ring-2 ring-[#8B0000]/15' : 'border-transparent hover:border-slate-300'
                                            )}
                                            aria-label={`Choose ${avatar.seed} avatar`}
                                            aria-pressed={isSelected}
                                        >
                                            <Avatar className="size-full">
                                                <AvatarImage src={avatar.url} alt="" />
                                                <AvatarFallback>{avatar.seed[0]}</AvatarFallback>
                                            </Avatar>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Full name</Label>
                                <Input 
                                    value={form.full_name} 
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
                                    required 
                                    className="h-10 text-sm border-slate-200 focus:border-slate-900 focus:ring-0 rounded-lg transition-all"
                                    placeholder="e.g. Amina Hassan"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Email address</Label>
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
                                <Label className="text-xs font-medium text-slate-700">Password</Label>
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
                                <Label className="text-xs font-medium text-slate-700">Phone (optional)</Label>
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
                            <Label className="text-xs font-medium text-slate-700">Dashboard role</Label>
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
                                        <span className="text-sm font-bold">Administrator (full access)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        Full access to the dashboard and team management.
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
                                        <span className="text-sm font-bold">Team member (limited access)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        Choose the pages this member can access and manage.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {form.role === 'team' && (
                            <div className="space-y-4">
                                <details className="group space-y-2 rounded-lg border border-slate-200 bg-slate-50/20" open>
                                    <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
                                        <span className="flex items-center justify-between">
                                            Allowed dashboard pages
                                            <span className="text-slate-400 transition-transform group-open:rotate-180">⌄</span>
                                        </span>
                                    </summary>
                                    <div className="grid grid-cols-1 gap-2 border-t border-slate-200 p-3 max-h-48 overflow-y-auto sm:grid-cols-2">
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
                                </details>

                                {form.permissions.includes('/dashboard/events') && (
                                    <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-lg" dir="ltr">
                                        <Label className="text-slate-900 font-bold text-xs block mb-1">Event workflow permissions</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {[
                                                { key: '/dashboard/events:registration', label: '1. Event registration' },
                                                { key: '/dashboard/events:design', label: '2. Design team' },
                                                { key: '/dashboard/events:leads', label: '3. Leads and TLS clients' },
                                                { key: '/dashboard/events:publishing', label: '4. Publishing and promotion' }
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
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={saving}
                                className="h-10 rounded-lg px-6 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
