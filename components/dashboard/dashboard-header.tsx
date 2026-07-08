'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DASHBOARD_PAGES } from '@/lib/permissions'
import { NotificationsBell } from '@/components/dashboard/notifications-bell'
import { PanelRightClose, PanelRightOpen, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeaderUser {
    email: string
    full_name: string | null
    role: string | null
}

interface DashboardHeaderProps {
    user: DashboardHeaderUser
    collapsed: boolean
    onToggleSidebar: () => void
}

export function DashboardHeader({ user, collapsed, onToggleSidebar }: DashboardHeaderProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const activePage = DASHBOARD_PAGES.find(
        (p) => pathname === p.path || pathname.startsWith(p.path + '/')
    )
    const title = activePage?.label || 'لوحة التحكم'
    const initial = user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-stone-200/70 bg-white px-4 shadow-[0_2px_20px_rgba(15,23,42,0.03)]">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200/70 bg-white text-stone-500 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                    title={collapsed ? 'إظهار القائمة الجانبية' : 'إخفاء القائمة الجانبية'}
                >
                    {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-[15px] font-black leading-tight tracking-tight text-stone-950">{title}</h1>
                    <p className="truncate text-[11px] font-medium leading-tight text-stone-400">
                        مرحباً، {user.full_name || 'مدير النظام'}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
                <NotificationsBell />

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        className="flex items-center gap-2 rounded-xl border border-stone-200/70 bg-white py-1 pl-2.5 pr-1 transition-all duration-200 hover:border-stone-300"
                    >
                        <ChevronDown className={cn('h-3.5 w-3.5 text-stone-400 transition-transform duration-200', menuOpen && 'rotate-180')} />
                        <div className="hidden text-right sm:block">
                            <p className="text-[13px] font-bold leading-tight text-stone-950">
                                {user.full_name || 'مدير النظام'}
                            </p>
                            <p className="text-[10px] leading-tight text-stone-400">
                                {user.role === 'admin' ? 'مدير النظام' : 'عضو فريق'}
                            </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(191,219,254,0.5))] text-sm font-bold text-blue-700">
                            {initial}
                        </div>
                    </button>

                    {menuOpen && (
                        <div className="absolute left-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
                            <div className="border-b border-stone-100 px-4 py-3">
                                <p className="truncate text-sm font-bold text-stone-900">
                                    {user.full_name || 'مدير النظام'}
                                </p>
                                <p className="truncate text-xs text-stone-400">{user.email}</p>
                            </div>
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                            >
                                <Settings className="h-4 w-4" />
                                الإعدادات
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                            >
                                <LogOut className="h-4 w-4" />
                                تسجيل الخروج
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
