'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { StaffAccountsPanel } from './staff-accounts-panel'
import {
    Building2, Bell, Wrench, UserCircle, Save, Loader2,
    ShieldAlert, Plus, X, KeyRound, CheckCircle2, Users,
} from 'lucide-react'

// ── Shapes stored in public.app_settings ────────────────────────────────────
type Company = {
    name_en: string; name_ar: string; email: string; phone: string
    address_en: string; address_ar: string; website: string
}
type Notifications = {
    recipients: string[]
    on_new_registration: boolean
    on_new_contact_message: boolean
    on_new_task: boolean
}
type Maintenance = { enabled: boolean; message_ar: string; message_en: string }

type Profile = { full_name: string; phone: string; email: string; role: string }

const EMPTY_COMPANY: Company = {
    name_en: '', name_ar: '', email: '', phone: '',
    address_en: '', address_ar: '', website: '',
}
const EMPTY_NOTIFICATIONS: Notifications = {
    recipients: [], on_new_registration: true,
    on_new_contact_message: true, on_new_task: false,
}
const EMPTY_MAINTENANCE: Maintenance = { enabled: false, message_ar: '', message_en: '' }

const MIN_PASSWORD = 10

export function SettingsClient() {
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    const [company, setCompany] = useState<Company>(EMPTY_COMPANY)
    const [notifications, setNotifications] = useState<Notifications>(EMPTY_NOTIFICATIONS)
    const [maintenance, setMaintenance] = useState<Maintenance>(EMPTY_MAINTENANCE)
    const [profile, setProfile] = useState<Profile>({ full_name: '', phone: '', email: '', role: '' })

    const [newRecipient, setNewRecipient] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')

    const isAdmin = role === 'admin'

    // ── Load ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const { data: me } = await supabase
                    .from('users')
                    .select('full_name, phone, email, role')
                    .eq('id', user.id)
                    .single()
                if (me) {
                    setProfile({
                        full_name: me.full_name ?? '',
                        phone: me.phone ?? '',
                        email: me.email ?? user.email ?? '',
                        role: me.role ?? '',
                    })
                    setRole(me.role ?? null)
                }
            }

            try {
                const res = await fetch('/api/settings')
                if (res.ok) {
                    const { settings } = await res.json()
                    if (settings.company) setCompany({ ...EMPTY_COMPANY, ...settings.company })
                    if (settings.notifications)
                        setNotifications({ ...EMPTY_NOTIFICATIONS, ...settings.notifications })
                    if (settings.maintenance)
                        setMaintenance({ ...EMPTY_MAINTENANCE, ...settings.maintenance })
                }
            } catch {
                toast.error('تعذّر تحميل الإعدادات')
            }
            setLoading(false)
        }
        load()
    }, [])

    // ── Save one settings key ───────────────────────────────────────────────
    const saveSetting = useCallback(
        async (key: string, value: unknown, label: string) => {
            setSaving(key)
            try {
                const res = await fetch('/api/settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value }),
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json.error || 'فشل الحفظ')
                toast.success(`${label} — حُفظ`)
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'فشل الحفظ')
            } finally {
                setSaving(null)
            }
        },
        [],
    )

    // ── My account ──────────────────────────────────────────────────────────
    const saveProfile = async () => {
        setSaving('profile')
        try {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error('انتهت الجلسة')

            const { error } = await supabase
                .from('users')
                .update({ full_name: profile.full_name, phone: profile.phone })
                .eq('id', user.id)
            if (error) throw error
            toast.success('بياناتك — حُفظت')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'فشل الحفظ')
        } finally {
            setSaving(null)
        }
    }

    const changePassword = async () => {
        if (password.length < MIN_PASSWORD) {
            toast.error(`كلمة المرور يجب أن تكون ${MIN_PASSWORD} أحرف فأكثر`)
            return
        }
        if (password !== passwordConfirm) {
            toast.error('الكلمتان غير متطابقتين')
            return
        }
        setSaving('password')
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setPassword('')
            setPasswordConfirm('')
            toast.success('تم تغيير كلمة المرور')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'تعذّر التغيير')
        } finally {
            setSaving(null)
        }
    }

    const addRecipient = () => {
        const v = newRecipient.trim().toLowerCase()
        if (!v) return
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            toast.error('بريد غير صالح')
            return
        }
        if (notifications.recipients.includes(v)) {
            toast.error('مضاف مسبقاً')
            return
        }
        setNotifications((n) => ({ ...n, recipients: [...n.recipients, v] }))
        setNewRecipient('')
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-500 py-10">
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ التحميل…
            </div>
        )
    }

    const SaveButton = ({ id, onClick }: { id: string; onClick: () => void }) => (
        <Button
            onClick={onClick}
            disabled={saving === id}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
            {saving === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ
        </Button>
    )

    return (
        <div className="max-w-4xl space-y-6 pb-12" dir="rtl">
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="mb-4 flex-wrap h-auto">
                    <TabsTrigger value="account" className="gap-2">
                        <UserCircle className="w-4 h-4" /> حسابي
                    </TabsTrigger>
                    {isAdmin && (
                        <>
                            <TabsTrigger value="company" className="gap-2">
                                <Building2 className="w-4 h-4" /> بيانات الشركة
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="gap-2">
                                <Bell className="w-4 h-4" /> الإشعارات
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="gap-2">
                                <Users className="w-4 h-4" /> الموظفون
                            </TabsTrigger>
                            <TabsTrigger value="maintenance" className="gap-2">
                                <Wrench className="w-4 h-4" /> الصيانة
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                {/* ── حسابي ── */}
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">بياناتي</CardTitle>
                            <CardDescription>
                                تظهر هذه البيانات لزملائك في اللوحة وفي سجلّ الأعمال.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>الاسم الكامل</Label>
                                    <Input
                                        value={profile.full_name}
                                                data-arabic-allowed="true"
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        placeholder="الاسم كما يظهر لزملائك"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>رقم الهاتف</Label>
                                    <Input
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="07XXXXXXXXX"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>البريد الإلكتروني</Label>
                                    <Input value={profile.email} disabled dir="ltr" />
                                    <p className="text-xs text-slate-500">
                                        لتغيير البريد يلزم مدير النظام.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>الصلاحية</Label>
                                    <Input
                                        value={
                                            profile.role === 'admin'
                                                ? 'مدير'
                                                : profile.role === 'team'
                                                    ? 'موظف'
                                                    : profile.role || '—'
                                        }
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <SaveButton id="profile" onClick={saveProfile} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <KeyRound className="w-4 h-4" /> كلمة المرور
                            </CardTitle>
                            <CardDescription>
                                غيّرها متى شئت — {MIN_PASSWORD} أحرف فأكثر.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>كلمة مرور جديدة</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>تأكيد كلمة المرور</Label>
                                    <Input
                                        type="password"
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        placeholder="••••••••••"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            {password && password.length >= MIN_PASSWORD && password === passwordConfirm && (
                                <p className="text-xs text-green-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> جاهزة للحفظ
                                </p>
                            )}
                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={changePassword}
                                    disabled={saving === 'password' || !password}
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                >
                                    {saving === 'password' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <KeyRound className="w-4 h-4" />
                                    )}
                                    تغيير كلمة المرور
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <>
                        {/* ── بيانات الشركة ── */}
                        <TabsContent value="company">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">بيانات الشركة</CardTitle>
                                    <CardDescription>
                                        تُستخدم في الموقع والرسائل الرسمية. تُحفظ في قاعدة البيانات فيراها كل
                                        الموظفين من أي جهاز.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>اسم الشركة (عربي)</Label>
                                            <Input
                                                value={company.name_ar}
                                                data-arabic-allowed="true"
                                                onChange={(e) => setCompany({ ...company, name_ar: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>اسم الشركة (إنجليزي)</Label>
                                            <Input
                                                value={company.name_en}
                                                onChange={(e) => setCompany({ ...company, name_en: e.target.value })}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>بريد التواصل</Label>
                                            <Input
                                                type="email"
                                                value={company.email}
                                                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>الهاتف</Label>
                                            <Input
                                                value={company.phone}
                                                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الموقع الإلكتروني</Label>
                                        <Input
                                            value={company.website}
                                            onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>العنوان (عربي)</Label>
                                            <Textarea
                                                value={company.address_ar}
                                                data-arabic-allowed="true"
                                                onChange={(e) => setCompany({ ...company, address_ar: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>العنوان (إنجليزي)</Label>
                                            <Textarea
                                                value={company.address_en}
                                                onChange={(e) => setCompany({ ...company, address_en: e.target.value })}
                                                rows={3}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <SaveButton
                                            id="company"
                                            onClick={() => saveSetting('company', company, 'بيانات الشركة')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── الإشعارات ── */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">إشعارات البريد</CardTitle>
                                    <CardDescription>
                                        من يستلم تنبيهاً عند وصول طلب أو رسالة جديدة.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label>عناوين المستلمين</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newRecipient}
                                                onChange={(e) => setNewRecipient(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addRecipient()
                                                    }
                                                }}
                                                placeholder="name@jaz.iq"
                                                dir="ltr"
                                            />
                                            <Button type="button" variant="outline" onClick={addRecipient} className="gap-1">
                                                <Plus className="w-4 h-4" /> إضافة
                                            </Button>
                                        </div>
                                        {notifications.recipients.length === 0 ? (
                                            <p className="text-xs text-amber-700 flex items-center gap-1 pt-1">
                                                <ShieldAlert className="w-3 h-3" />
                                                لا مستلمين — لن يصل تنبيه لأحد.
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {notifications.recipients.map((r) => (
                                                    <span
                                                        key={r}
                                                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                                                        dir="ltr"
                                                    >
                                                        {r}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setNotifications((n) => ({
                                                                    ...n,
                                                                    recipients: n.recipients.filter((x) => x !== r),
                                                                }))
                                                            }
                                                            className="text-slate-400 hover:text-red-600"
                                                            aria-label={`حذف ${r}`}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 pt-4">
                                        {[
                                            ['on_new_registration', 'تسجيل جديد في فعالية'],
                                            ['on_new_contact_message', 'رسالة جديدة من نموذج التواصل'],
                                            ['on_new_task', 'مهمة جديدة'],
                                        ].map(([key, label]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <Label className="font-normal">{label}</Label>
                                                <Switch
                                                    checked={notifications[key as keyof Notifications] as boolean}
                                                    onCheckedChange={(v) =>
                                                        setNotifications((n) => ({ ...n, [key]: v }))
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <SaveButton
                                            id="notifications"
                                            onClick={() => saveSetting('notifications', notifications, 'الإشعارات')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── الصيانة ── */}
                        {/* ── الموظفون ── */}
                        <TabsContent value="staff">
                            <StaffAccountsPanel />
                        </TabsContent>

                        <TabsContent value="maintenance">
                            <Card className={maintenance.enabled ? 'border-amber-300' : undefined}>
                                <CardHeader>
                                    <CardTitle className="text-lg">وضع الصيانة</CardTitle>
                                    <CardDescription>
                                        يعرض للزوّار رسالة مؤدّبة بدل الموقع. لوحة التحكم تبقى تعمل لك ولموظفيك.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div
                                        className={`flex items-center justify-between rounded-lg border p-4 ${maintenance.enabled
                                            ? 'border-amber-300 bg-amber-50'
                                            : 'border-slate-200 bg-slate-50'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {maintenance.enabled ? 'الصيانة مُفعّلة' : 'الموقع يعمل طبيعياً'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {maintenance.enabled
                                                    ? 'الزوّار يرون رسالة الصيانة الآن.'
                                                    : 'الزوّار يتصفّحون الموقع بشكل طبيعي.'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={maintenance.enabled}
                                            onCheckedChange={(v) => setMaintenance((m) => ({ ...m, enabled: v }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>الرسالة (عربي)</Label>
                                        <Textarea
                                            value={maintenance.message_ar}
                                                data-arabic-allowed="true"
                                            onChange={(e) =>
                                                setMaintenance({ ...maintenance, message_ar: e.target.value })
                                            }
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الرسالة (إنجليزي)</Label>
                                        <Textarea
                                            value={maintenance.message_en}
                                            onChange={(e) =>
                                                setMaintenance({ ...maintenance, message_en: e.target.value })
                                            }
                                            rows={3}
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <SaveButton
                                            id="maintenance"
                                            onClick={() => saveSetting('maintenance', maintenance, 'وضع الصيانة')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {!isAdmin && (
                <p className="text-xs text-slate-500">
                    إعدادات الشركة والإشعارات والصيانة متاحة للمدير فقط.
                </p>
            )}
        </div>
    )
}
