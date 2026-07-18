'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DASHBOARD_PAGES } from '@/lib/permissions'
import { PanelLeftClose, PanelLeftOpen, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationsBell } from '@/app/dashboard/_components/notifications-bell'

interface DashboardHeaderUser {
    email: string
    full_name: string | null
    role: string | null
    avatar_url?: string | null
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
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const activePage = DASHBOARD_PAGES.find(
        (p) => pathname === p.path || pathname.startsWith(p.path + '/')
    )
    const title = activePage?.label || 'Dashboard'
    const initial = user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-stone-200/70 bg-white px-4" dir="ltr">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-stone-200/70 bg-white text-stone-500 transition-[background-color,border-color,color] duration-200 hover:border-red-200 hover:bg-red-50/60 hover:text-[#8B0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/35"
                    title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
                    aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
                >
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-[15px] font-black leading-tight tracking-tight text-stone-950">{title}</h1>
                    <p className="truncate text-[11px] font-medium leading-tight text-stone-400">
                        Welcome, {user.full_name || 'Administrator'}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
                <NotificationsBell />
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        className="flex items-center gap-2 rounded-lg border border-stone-200/70 bg-white py-1 pl-2.5 pr-1 transition-[background-color,border-color] duration-200 hover:border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/35"
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        aria-label="Open account menu"
                    >
                        <ChevronDown className={cn('h-3.5 w-3.5 text-stone-400 transition-transform duration-200', menuOpen && 'rotate-180')} />
                        <div className="hidden text-left sm:block">
                            <p className="text-[13px] font-bold leading-tight text-stone-950">
                                {user.full_name || 'Administrator'}
                            </p>
                            <p className="text-[10px] leading-tight text-stone-400">
                                {user.role === 'admin' ? 'Administrator' : 'Team member'}
                            </p>
                        </div>
                        <Avatar className="size-8 border border-stone-200">
                            <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                            <AvatarFallback className="bg-[linear-gradient(135deg,rgba(139,0,0,0.12),rgba(254,226,226,0.5))] text-sm font-bold text-[#8B0000]">{initial}</AvatarFallback>
                        </Avatar>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg" role="menu">
                            <div className="border-b border-stone-100 px-4 py-3">
                                <p className="truncate text-sm font-bold text-stone-900">
                                    {user.full_name || 'Administrator'}
                                </p>
                                <p className="truncate text-xs text-stone-400">{user.email}</p>
                            </div>
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                            >
                                <Settings className="h-4 w-4" aria-hidden />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                            >
                                <LogOut className="h-4 w-4" aria-hidden />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
