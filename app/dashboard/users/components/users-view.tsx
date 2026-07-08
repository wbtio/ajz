'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Search, Mail, Phone, Edit, Power, PowerOff, Loader2, Shield, UserCog, User as UserIcon,
} from 'lucide-react'
import { DASHBOARD_PAGES, DEFAULT_TEAM_PATHS } from '@/lib/permissions'
import { formatDate, cn } from '@/lib/utils'
import type { User } from '@/lib/database.types'

interface Props {
    users: User[]
}

type RoleChoice = 'user' | 'team' | 'admin'

const emptyEditState = {
    roleChoice: 'user' as RoleChoice,
    permissions: [...DEFAULT_TEAM_PATHS] as string[],
}

export function UsersView({ users }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [form, setForm] = useState(emptyEditState)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState<string | null>(null)

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return users.filter((u) => {
            if (statusFilter === 'active' && !u.is_active) return false
            if (statusFilter === 'inactive' && u.is_active) return false
            if (q && !(u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone?.includes(q))) return false
            return true
        })
    }, [users, search, statusFilter])

    const openEdit = (user: User) => {
        setEditingUser(user)
        setForm({ roleChoice: 'user', permissions: [...DEFAULT_TEAM_PATHS] })
        setError('')
    }

    const togglePermission = (path: string) => {
        setForm((f) => ({
            ...f,
            permissions: f.permissions.includes(path) ? f.permissions.filter((p) => p !== path) : [...f.permissions, path],
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setError('')
        setSaving(true)
        try {
            const body: Record<string, unknown> = {}
            if (form.roleChoice !== 'user') {
                body.role = form.roleChoice
                if (form.roleChoice === 'team') body.permissions = form.permissions
            }
            const res = await fetch(`/api/team-members/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'حدث خطأ')
            setEditingUser(null)
            router.refresh()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (user: User) => {
        const willActivate = !user.is_active
        if (!willActivate && !confirm(`تعطيل حساب "${user.full_name || user.email}"؟ لن يتمكن من تسجيل الدخول حتى يُعاد تفعيله.`)) return
        setBusyId(user.id)
        try {
            const res = await fetch(`/api/team-members/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: willActivate }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'حدث خطأ')
            router.refresh()
        } catch (err) {
            alert((err as Error).message)
        } finally {
            setBusyId(null)
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg border border-slate-100 p-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                        className="pr-8 h-8 text-sm bg-slate-50 border-slate-100"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="h-8 rounded-md border border-slate-100 bg-slate-50 px-2.5 text-sm text-slate-600"
                >
                    <option value="all">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">معطّل</option>
                </select>
                <span className="text-xs text-slate-400">{filtered.length} من {users.length}</span>
            </div>

            <Card className="overflow-hidden border-slate-100">
                <CardContent className="p-0">
                    {filtered.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/60">
                                    <tr>
                                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">العميل</th>
                                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">الهاتف</th>
                                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">الحالة</th>
                                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">تاريخ التسجيل</th>
                                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((user) => (
                                        <tr key={user.id} className={cn('hover:bg-slate-50/60', !user.is_active && 'opacity-60')}>
                                            <td className="py-2 px-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900 truncate">{user.full_name || 'بدون اسم'}</p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate" dir="ltr">
                                                            <Mail className="w-3 h-3 shrink-0" /> {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3 text-xs text-slate-600">
                                                {user.phone ? (
                                                    <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3 text-slate-400" /> {user.phone}</span>
                                                ) : '-'}
                                            </td>
                                            <td className="py-2 px-3">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full',
                                                    user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
                                                )}>
                                                    {user.is_active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                                                    {user.is_active ? 'نشط' : 'معطّل'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-xs text-slate-500">
                                                {user.created_at ? formatDate(user.created_at) : '-'}
                                            </td>
                                            <td className="py-2 px-3">
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(user)} title="ترقية / صلاحيات">
                                                        <Edit className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn('h-7 w-7 p-0', user.is_active ? 'text-amber-600' : 'text-emerald-600')}
                                                        onClick={() => handleToggleActive(user)}
                                                        disabled={busyId === user.id}
                                                        title={user.is_active ? 'تعطيل' : 'تفعيل'}
                                                    >
                                                        {busyId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 text-sm py-10">
                            {users.length === 0 ? 'لا يوجد عملاء مسجَّلين حتى الآن' : 'لا توجد نتائج مطابقة للبحث/الفلترة'}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base">{editingUser?.full_name || editingUser?.email}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">ترقية إلى لوحة التحكم</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, roleChoice: 'user' }))}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                                        form.roleChoice === 'user' ? 'border-slate-400 bg-slate-50 text-slate-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50',
                                    )}
                                >
                                    <UserIcon className="w-3.5 h-3.5" /> عميل عادي
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, roleChoice: 'team' }))}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                                        form.roleChoice === 'team' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50',
                                    )}
                                >
                                    <UserCog className="w-3.5 h-3.5" /> عضو فريق
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, roleChoice: 'admin' }))}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                                        form.roleChoice === 'admin' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50',
                                    )}
                                >
                                    <Shield className="w-3.5 h-3.5" /> مدير
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">اختيار "عضو فريق" أو "مدير" ينقل الحساب فورًا لصفحة "الفريق" ويمنحه وصول للوحة التحكم.</p>
                        </div>

                        {form.roleChoice === 'team' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الصفحات المسموح له بالوصول إليها</label>
                                <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto">
                                    {DASHBOARD_PAGES.map((page) => (
                                        <label key={page.path} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <Checkbox
                                                checked={form.permissions.includes(page.path)}
                                                onCheckedChange={() => togglePermission(page.path)}
                                            />
                                            {page.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>إلغاء</Button>
                            <Button type="submit" size="sm" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
