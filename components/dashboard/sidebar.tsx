'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    Settings,
    LogOut,
    Building2,
    GraduationCap,
    MessageSquare,
    BookOpen,
    Link as LinkIcon,
    ChevronLeft,
    ClipboardList,
    Search,
    BarChart3,
    CheckSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardUser {
    id: string
    email: string
    full_name: string | null
    role: string | null
    avatar_url: string | null
}

interface DashboardSidebarProps {
    user: DashboardUser
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { t } = useTranslation()

    const navigation = [
        { name: t.common.home, href: '/dashboard/home', icon: LayoutDashboard },
        { name: t.nav.events, href: '/dashboard/events', icon: Calendar },
        { name: t.nav.blog, href: '/dashboard/blog', icon: BookOpen },
        { name: t.nav.links, href: '/dashboard/links', icon: LinkIcon },
        { name: t.nav.sectors, href: '/dashboard/sectors', icon: Building2 },
        { name: t.nav.partners, href: '/dashboard/partners', icon: Users },
        { name: t.nav.training, href: '/dashboard/trainings', icon: GraduationCap },
        { name: t.nav.contact, href: '/dashboard/messages', icon: MessageSquare },
        { name: t.dashboard.users, href: '/dashboard/users', icon: Users },
        { name: t.dashboard.registrations, href: '/dashboard/registrations', icon: FileText },
        { name: t.dashboard.sectorRegistrations, href: '/dashboard/sector-registrations', icon: ClipboardList },
        { name: 'Event Discovery', href: '/dashboard/event-discovery/sessions', icon: Search },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
        { name: t.dashboard.settings, href: '/dashboard/settings', icon: Settings },
    ]

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <aside className="sticky top-0 z-30 flex h-screen w-72 flex-col border-l border-stone-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,250,248,0.98)_100%)] shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
            <div className="border-b border-stone-200/70 p-6 pb-4">
                <Link href="/" className="group flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b0000,#c2410c)] shadow-[0_14px_30px_-18px_rgba(139,0,0,0.7)] ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-105">
                        <span className="text-xl font-black text-white">J</span>
                    </div>
                    <div>
                        <span className="block text-lg font-black tracking-tight text-stone-950">JAZ Admin</span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Dashboard</span>
                    </div>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                <div className="mb-4 rounded-[1.25rem] border border-stone-200/70 bg-white/70 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Navigation</p>
                </div>
                <nav className="space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard/home' && pathname.startsWith(item.href))
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'border border-blue-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.92),rgba(255,255,255,0.98))] text-blue-700 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.6)]'
                                        : 'border border-transparent text-stone-500 hover:border-stone-200 hover:bg-white hover:text-stone-950'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-blue-600" />
                                )}
                                
                                <item.icon className={cn(
                                    'h-5 w-5 transition-colors duration-200',
                                    isActive ? 'text-blue-600' : 'text-stone-400 group-hover:text-stone-600'
                                )} />
                                <span className="flex-1">{item.name}</span>
                                {isActive && (
                                    <ChevronLeft className="h-4 w-4 text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t border-stone-200/70 bg-white/70 p-4">
                <div className="mb-4 flex items-center gap-3 rounded-[1.25rem] border border-stone-200/70 bg-white p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(191,219,254,0.5))] font-bold text-blue-700">
                        {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-stone-950">
                            {user.full_name || 'مدير النظام'}
                        </p>
                        <p className="truncate text-[10px] font-medium text-stone-500">
                            {user.email}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-stone-600 transition-all duration-200 hover:border-rose-100 hover:bg-rose-50/80 hover:text-rose-600"
                >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    )
}
