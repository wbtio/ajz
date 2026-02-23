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
    ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/database.types'

interface DashboardSidebarProps {
    user: User
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
        { name: t.dashboard.settings, href: '/dashboard/settings', icon: Settings },
    ]

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <aside className="w-72 bg-white border-l border-gray-100 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
            {/* Header / Logo */}
            <div className="p-6 pb-2">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-all duration-300">
                        <span className="text-white font-bold text-xl">J</span>
                    </div>
                    <div>
                        <span className="block text-lg font-bold text-gray-900 tracking-tight">JAZ Admin</span>
                        <span className="block text-[10px] text-gray-400 font-medium tracking-wider uppercase">Dashboard</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard/home' && pathname.startsWith(item.href))
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium relative overflow-hidden',
                                    isActive
                                        ? 'bg-blue-50/80 text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full" />
                                )}
                                
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors duration-200",
                                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                                <span className="flex-1">{item.name}</span>
                                {isActive && (
                                    <ChevronLeft className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-3 mb-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {user.full_name || 'مدير النظام'}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate font-medium">
                            {user.email}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50/80 hover:border-red-100 border border-transparent rounded-lg transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    )
}
