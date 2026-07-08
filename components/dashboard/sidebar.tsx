'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import { canAccessPath } from '@/lib/permissions'
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    Settings,
    Building2,
    GraduationCap,
    MessageSquare,
    BookOpen,
    Link as LinkIcon,
    ChevronLeft,
    ClipboardList,
    Search,
    BarChart3,
    CheckSquare,
    ScanLine,
    Trophy,
    Sparkles,
    FolderKanban,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardUser {
    id: string
    email: string
    full_name: string | null
    role: string | null
    avatar_url: string | null
    permissions?: string[] | null
}

interface DashboardSidebarProps {
    user: DashboardUser
    collapsed?: boolean
}

interface NavItem {
    name: string
    href: string
    icon: typeof LayoutDashboard
    adminOnly?: boolean
}

export function DashboardSidebar({ user, collapsed = false }: DashboardSidebarProps) {
    const pathname = usePathname()
    const { t } = useTranslation()

    const navSections: { title: string; accent?: boolean; items: NavItem[] }[] = [
        {
            title: 'نظرة عامة',
            items: [
                { name: t.common.home, href: '/dashboard/home', icon: LayoutDashboard },
                { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            ],
        },
        {
            title: 'الفريق والإنجازات',
            accent: true,
            items: [
                { name: 'المهام اليومية', href: '/dashboard/team-tasks', icon: CheckSquare },
                { name: 'الفريق', href: '/dashboard/team', icon: Users, adminOnly: true },
                { name: 'قارئ الجوازات', href: '/dashboard/passport-scanner', icon: ScanLine },
                { name: 'طلبات التعديل', href: '/tasks', icon: ClipboardList, adminOnly: true },
            ],
        },
        {
            title: 'إدارة المشاركات',
            items: [
                { name: 'ملفات المشاركة', href: '/dashboard/participation-cases', icon: FolderKanban },
            ],
        },
        {
            title: 'إدارة الموقع',
            items: [
                { name: t.nav.events, href: '/dashboard/events', icon: Calendar },
                { name: t.nav.blog, href: '/dashboard/blog', icon: BookOpen },
                { name: t.nav.sectors, href: '/dashboard/sectors', icon: Building2 },
                { name: t.nav.partners, href: '/dashboard/partners', icon: Users },
                { name: t.nav.training, href: '/dashboard/trainings', icon: GraduationCap },
                { name: t.nav.links, href: '/dashboard/links', icon: LinkIcon },
                { name: t.nav.contact, href: '/dashboard/messages', icon: MessageSquare },
                { name: t.dashboard.users, href: '/dashboard/users', icon: Users },
                { name: t.dashboard.registrations, href: '/dashboard/registrations', icon: FileText },
                { name: t.dashboard.sectorRegistrations, href: '/dashboard/sector-registrations', icon: ClipboardList },
                { name: 'Event Discovery', href: '/dashboard/event-discovery/sessions', icon: Search },
            ],
        },
        {
            title: 'النظام',
            items: [
                { name: t.dashboard.settings, href: '/dashboard/settings', icon: Settings },
            ],
        },
    ]

    // إظهار الروابط المسموح بها لدور المستخدم فقط
    // صفحات إدارية حساسة (adminOnly) للمدير فقط، وباقي صفحات /dashboard تُفحص بصلاحيات العضو
    const visibleSections = navSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) =>
                item.adminOnly
                    ? user.role === 'admin'
                    : canAccessPath(user.role, item.href, user.permissions)
            ),
        }))
        .filter((section) => section.items.length > 0)

    return (
        <aside
            className={cn(
                'sticky top-0 z-30 h-screen shrink-0 overflow-hidden border-l border-stone-200/70 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-[width] duration-300 ease-in-out',
                collapsed ? 'w-0 border-l-0 shadow-none' : 'w-60'
            )}
        >
            <div className="flex h-screen w-60 flex-col">
                <div className="flex h-16 shrink-0 items-center border-b border-stone-200/70 px-4">
                    <Link href="/" className="group flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8b0000,#c2410c)] shadow-[0_10px_20px_-12px_rgba(139,0,0,0.7)] ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-105">
                            <span className="text-sm font-black text-white">J</span>
                        </div>
                        <div className="min-w-0">
                            <span className="block truncate text-sm font-black tracking-tight text-stone-950">JAZ Admin</span>
                            <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-400">Dashboard</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                    <nav className="space-y-4">
                        {visibleSections.map((section) => (
                            <div key={section.title}>
                                <div className="mb-1.5 flex items-center gap-1.5 px-1.5">
                                    {section.accent && <Trophy className="h-2.5 w-2.5 text-amber-500" />}
                                    <p
                                        className={cn(
                                            'text-[9px] font-semibold uppercase tracking-[0.16em]',
                                            section.accent ? 'text-amber-600/80' : 'text-stone-400'
                                        )}
                                    >
                                        {section.title}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        'space-y-1',
                                        section.accent &&
                                            'rounded-xl border border-amber-200/60 bg-[linear-gradient(160deg,rgba(255,251,235,0.6),rgba(255,255,255,0.4))] p-1'
                                    )}
                                >
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href ||
                                            (item.href !== '/dashboard/home' && pathname.startsWith(item.href))

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                title={item.name}
                                                className={cn(
                                                    'group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'border border-blue-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.92),rgba(255,255,255,0.98))] text-blue-700 shadow-[0_10px_20px_-16px_rgba(59,130,246,0.6)]'
                                                        : 'border border-transparent text-stone-500 hover:border-stone-200 hover:bg-white hover:text-stone-950'
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-blue-600" />
                                                )}

                                                <item.icon className={cn(
                                                    'h-4 w-4 shrink-0 transition-colors duration-200',
                                                    isActive ? 'text-blue-600' : 'text-stone-400 group-hover:text-stone-600'
                                                )} />
                                                <span className="flex-1 truncate">{item.name}</span>
                                                {isActive && (
                                                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="border-t border-stone-200/70 bg-white p-3">
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200/60 bg-[linear-gradient(135deg,rgba(255,251,235,0.7),rgba(255,255,255,0.9))] p-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-stone-800">فريق JAZ</p>
                            <p className="truncate text-[9px] font-medium text-stone-500">كل مهمة تُنجَز خطوة نحو الهدف</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
