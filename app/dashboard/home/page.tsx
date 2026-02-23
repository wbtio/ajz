import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Calendar,
    Users,
    FileText,
    TrendingUp,
    Plus,
    ArrowRight,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Layers,
    LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import { AnimatedStatCard } from '@/components/dashboard/animated-stat-card'

export const metadata = {
    title: 'لوحة التحكم | JAZ Admin',
}

export default async function DashboardHomePage() {
    const supabase = await createClient()

    // Get current date for filtering
    const now = new Date().toISOString()

    // Fetch Stats & Data in parallel
    const [
        eventsResult,
        usersResult,
        registrationsResult,
        sectorsResult,
        upcomingEventsResult,
        recentRegistrationsResult,
        eventsStatusResult
    ] = await Promise.all([
        // 1. Total Events
        supabase.from('events').select('*', { count: 'exact', head: true }),
        // 2. Total Users
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // 3. Total Registrations
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        // 4. Total Sectors
        supabase.from('sectors').select('*', { count: 'exact', head: true }),
        // 5. Upcoming Events (Next 5)
        supabase.from('events')
            .select('id, title, title_ar, date, location, status, image_url')
            .gte('date', now)
            .order('date', { ascending: true })
            .limit(5),
        // 6. Recent Registrations (Last 5)
        supabase.from('registrations')
            .select(`
                *,
                users:user_id (full_name, email, avatar_url),
                events:event_id (title, title_ar, registration_config)
            `)
            .order('created_at', { ascending: false })
            .limit(5),
        // 7. Events status distribution
        supabase.from('events').select('status')
    ])

    const recentRegistrations = recentRegistrationsResult.data || []
    const upcomingEvents = upcomingEventsResult.data || []

    // Calculate Event Stats
    const totalEvents = eventsStatusResult.data?.length || 0
    const activeEvents = eventsStatusResult.data?.filter(e => e.status === 'published' || e.status === 'active').length || 0
    const draftEvents = eventsStatusResult.data?.filter(e => e.status === 'draft').length || 0
    const completedEvents = eventsStatusResult.data?.filter(e => e.status === 'completed').length || 0

    const stats = [
        {
            name: 'عدد القطاعات',
            value: sectorsResult.count || 0,
            icon: LayoutGrid,
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            bgLight: 'bg-indigo-50',
            href: '/dashboard/sectors'
        },
        {
            name: 'إجمالي الفعاليات',
            value: eventsResult.count || 0,
            icon: Calendar,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgLight: 'bg-blue-50',
            href: '/dashboard/events'
        },
        {
            name: 'عدد الزوار (المستخدمين)',
            value: usersResult.count || 0,
            icon: Users,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgLight: 'bg-green-50',
            href: '/dashboard/users'
        },
        {
            name: 'إجمالي التسجيلات',
            value: registrationsResult.count || 0,
            icon: FileText,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgLight: 'bg-purple-50',
            href: '/dashboard/registrations'
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500 mt-1">نظرة عامة على أداء المنصة والفعاليات</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/events">
                            عرض كل الفعاليات
                        </Link>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/dashboard/events/new">
                            <Plus className="w-4 h-4 ml-2" />
                            فعالية جديدة
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <AnimatedStatCard
                        key={stat.name}
                        index={index}
                        name={stat.name}
                        value={stat.value}
                        color={stat.color}
                        textColor={stat.textColor}
                        bgLight={stat.bgLight}
                        href={stat.href}
                        icon={<stat.icon className={`w-6 h-6 ${stat.textColor}`} />}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Recent Registrations */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">أحدث التسجيلات</CardTitle>
                                <CardDescription>آخر عمليات التسجيل في الفعاليات</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Link href="/dashboard/registrations">
                                    عرض الكل
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentRegistrations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-right">
                                                <th className="py-3 px-4 text-sm font-medium text-gray-500">المستخدم</th>
                                                <th className="py-3 px-4 text-sm font-medium text-gray-500">الفعالية</th>
                                                <th className="py-3 px-4 text-sm font-medium text-gray-500">بيانات إضافية</th>
                                                <th className="py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                                                <th className="py-3 px-4 text-sm font-medium text-gray-500">التاريخ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recentRegistrations.map((reg) => (
                                                <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs">
                                                                {(reg.users as any)?.full_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900">
                                                                    {(reg.users as any)?.full_name || 'غير معروف'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(reg.users as any)?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm text-gray-700">
                                                            {(reg.events as any)?.title_ar || (reg.events as any)?.title}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {reg.additional_data && Object.keys(reg.additional_data as object).length > 0 ? (
                                                            <div className="text-xs space-y-1 bg-gray-50 p-2 rounded border border-gray-100 max-w-xs">
                                                                {Object.entries(reg.additional_data as object).map(([key, value]) => {
                                                                    const config = (reg.events as any)?.registration_config as any[];
                                                                    const fieldConfig = Array.isArray(config) ? config.find(f => f.id === key) : null;
                                                                    const label = fieldConfig?.label_ar || fieldConfig?.label_en || key;

                                                                    return (
                                                                        <div key={key} className="flex gap-2">
                                                                            <span className="font-bold text-gray-600 shrink-0">
                                                                                {label}:
                                                                            </span>
                                                                            <span className="text-gray-900 break-words">{String(value)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <StatusBadge status={reg.status} />
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-500">
                                                        {new Date(reg.created_at || '').toLocaleDateString('ar-IQ')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FileText className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">لا توجد تسجيلات حديثة</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">الفعاليات القادمة</CardTitle>
                                <CardDescription>الفعاليات المجدولة للفترة القادمة</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Link href="/dashboard/events">
                                    الجدول الزمني
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((event) => (
                                        <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                {event.image_url ? (
                                                    <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                                        <Calendar className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{event.title_ar || event.title}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(event.date).toLocaleDateString('ar-IQ')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(event.date).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                    <Link href={`/dashboard/events/${event.id}`}>
                                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">لا توجد فعاليات قادمة</p>
                                        <Button variant="ghost" asChild className="mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Link href="/dashboard/events/new">جدولة فعالية جديدة</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <QuickActionButton href="/dashboard/events/new" icon={Plus} label="فعالية جديدة" />
                            <QuickActionButton href="/dashboard/sectors" icon={Plus} label="قطاع جديد" />
                            <QuickActionButton href="/dashboard/users" icon={Users} label="المستخدمين" />
                            <QuickActionButton href="/dashboard/settings" icon={MoreHorizontal} label="الإعدادات" />
                        </CardContent>
                    </Card>

                    {/* Events Status Summary */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">حالة الفعاليات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <StatusRow label="نشطة / منشورة" count={activeEvents} total={totalEvents} color="bg-green-500" />
                            <StatusRow label="مسودة" count={draftEvents} total={totalEvents} color="bg-yellow-500" />
                            <StatusRow label="مكتملة" count={completedEvents} total={totalEvents} color="bg-blue-500" />
                        </CardContent>
                    </Card>

                    {/* System Info (Optional) */}
                    <Card className="border-gray-100 shadow-sm bg-gray-50/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <AlertCircle className="w-4 h-4" />
                                <span>آخر تحديث للبيانات: منذ دقيقة</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function processGrowthData(users: { created_at: string }[]) {
    const months: { [key: string]: number } = {}
    const now = new Date()

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = d.toLocaleDateString('ar-IQ', { month: 'long' })
        months[monthName] = 0
    }

    // Count users per month
    users.forEach(user => {
        const d = new Date(user.created_at)
        const monthName = d.toLocaleDateString('ar-IQ', { month: 'long' })
        if (months[monthName] !== undefined) {
            months[monthName]++
        }
    })

    // Convert to array format for Recharts
    return Object.entries(months).map(([name, value]) => ({
        name,
        value
    }))
}

function StatusBadge({ status }: { status: string | null }) {
    if (status === 'confirmed') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                مؤكد
            </span>
        )
    }
    if (status === 'cancelled') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                <XCircle className="w-3.5 h-3.5" />
                ملغي
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
            <Clock className="w-3.5 h-3.5" />
            قيد الانتظار
        </span>
    )
}

function QuickActionButton({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
        >
            <Icon className="w-5 h-5 mb-2" />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    )
}

function StatusRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{count}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
