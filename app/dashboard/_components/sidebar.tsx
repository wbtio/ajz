'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
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
    ChevronRight,
    ChevronDown,
    ClipboardList,
    Search,
    BarChart3,
    CheckSquare,
    ScanLine,
    Trophy,
    Inbox,
    Timer,
    Wand2,
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
    const [taskSummary, setTaskSummary] = useState<{ open: number; nextDue: string | null }>({ open: 0, nextDue: null })

    const loadTaskSummary = useCallback(async () => {
        try {
            const response = await fetch('/api/team-tasks', { cache: 'no-store' })
            if (!response.ok) return
            const tasks = await response.json() as Array<{ status: string; due_date: string | null }>
            const openTasks = tasks.filter((task) => task.status !== 'done')
            const nextDue = openTasks
                .map((task) => task.due_date)
                .filter((date): date is string => Boolean(date))
                .sort()[0] ?? null
            setTaskSummary({ open: openTasks.length, nextDue })
        } catch {
            // The sidebar remains usable if the task API is temporarily unavailable.
        }
    }, [])

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => void loadTaskSummary())
        const refreshSummary = () => void loadTaskSummary()
        window.addEventListener('jaz:tasks-changed', refreshSummary)
        return () => {
            window.cancelAnimationFrame(frame)
            window.removeEventListener('jaz:tasks-changed', refreshSummary)
        }
    }, [loadTaskSummary])
    const navSections: { title: string; accent?: boolean; items: NavItem[] }[] = [
        {
            title: 'Overview',
            items: [
                { name: 'Dashboard', href: '/dashboard/home', icon: LayoutDashboard },
                { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            ],
        },
        {
            title: 'Team Operations',
            accent: true,
            items: [
                { name: 'Daily Tasks', href: '/dashboard/team-tasks', icon: CheckSquare },
                { name: 'Team Members', href: '/dashboard/team', icon: Users, adminOnly: true },
                { name: 'Passport Scanner', href: '/dashboard/passport-scanner', icon: ScanLine },
                { name: 'Change Requests', href: '/tasks', icon: ClipboardList, adminOnly: true },
                { name: 'Creative Prompts', href: '/dashboard/creative-prompts', icon: Wand2 },
            ],
        },
        {
            title: 'Application Operations',
            items: [
                { name: 'Applications', href: '/dashboard/participation-cases/work/clients', icon: Inbox },
                { name: 'Customers', href: '/dashboard/customers', icon: Users },
                { name: 'Visa Availability', href: '/dashboard/visa-availability', icon: Calendar },
                { name: 'Draft Events', href: '/dashboard/draft-events', icon: Calendar },
            ],
        },
        {
            title: 'Content Management',
            items: [
                { name: 'Published Events', href: '/dashboard/events', icon: Calendar },
                { name: 'Articles', href: '/dashboard/blog', icon: BookOpen },
                { name: 'Sectors', href: '/dashboard/sectors', icon: Building2 },
                { name: 'Partners', href: '/dashboard/partners', icon: Users },
                { name: 'Training Programs', href: '/dashboard/trainings', icon: GraduationCap },
                { name: 'Quick Links', href: '/dashboard/links', icon: LinkIcon },
                { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
                { name: 'Users', href: '/dashboard/users', icon: Users },
                { name: 'Registrations', href: '/dashboard/registrations', icon: FileText },
                { name: 'Sector Registrations', href: '/dashboard/sector-registrations', icon: ClipboardList },
                { name: 'Event Discovery', href: '/dashboard/event-discovery/sessions', icon: Search },
            ],
        },
        {
            title: 'System',
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: Settings },
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
                    ? user.role === 'admin' || canAccessPath(user.role, item.href, user.permissions)
                    : canAccessPath(user.role, item.href, user.permissions)
            ),
        }))
        .filter((section) => section.items.length > 0)

    const sectionForPath = (path: string) => visibleSections.find((section) =>
        section.items.some((item) => path === item.href || path.startsWith(`${item.href}/`))
    )?.title
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(visibleSections.map((section) => [section.title, section.title === sectionForPath(pathname)]))
    )

    return (
        <aside
            dir="ltr"
            aria-label="Dashboard navigation"
            className={cn(
                'sticky top-0 z-30 h-screen shrink-0 overflow-hidden border-r border-stone-200/70 bg-white transition-[width] duration-300 ease-in-out motion-reduce:transition-none',
                collapsed ? 'w-0 border-r-0' : 'w-60'
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
                    <nav className="flex flex-col gap-4">
                        {visibleSections.map((section) => {
                            const isOpen = openSections[section.title] || section.title === sectionForPath(pathname)
                            return (
                            <div key={section.title}>
                                <button
                                    type="button"
                                    onClick={() => setOpenSections((current) => ({ ...current, [section.title]: !current[section.title] }))}
                                    className="mb-1.5 flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-stone-50"
                                    aria-expanded={isOpen}
                                >
                                    {section.accent && <Trophy className="h-2.5 w-2.5 text-amber-500" />}
                                    <p
                                        className={cn(
                                            'text-[9px] font-semibold uppercase tracking-[0.16em]',
                                            section.accent ? 'text-amber-600/80' : 'text-stone-400'
                                        )}
                                    >
                                        {section.title}
                                    </p>
                                    <ChevronDown className={cn('ml-auto h-3.5 w-3.5 text-stone-400 transition-transform', !isOpen && '-rotate-90')} aria-hidden />
                                </button>
                                <div className={cn('flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200', isOpen ? 'max-h-[36rem] opacity-100' : 'max-h-0 opacity-0')}>
                                    {section.items.map((item) => {
                                        // Match nested pages only when the path boundary is explicit.
                                        // Without the trailing slash check, /dashboard/team-tasks
                                        // also activates /dashboard/team.
                                        const isActive = pathname === item.href ||
                                            (item.href !== '/dashboard/home' && pathname.startsWith(`${item.href}/`))

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                title={item.name}
                                                className={cn(
                                                    'group relative flex items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2 text-[13px] font-medium transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/35',
                                                    isActive
                                                        ? 'border border-red-200/70 bg-red-50/70 text-[#8B0000]'
                                                        : 'border border-transparent text-stone-500 hover:border-stone-200 hover:bg-white hover:text-stone-950'
                                                )}
                                            >
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#8B0000]" aria-hidden />
                                                )}

                                                <item.icon className={cn(
                                                    'h-4 w-4 shrink-0 transition-colors duration-200',
                                                    isActive ? 'text-[#8B0000]' : 'text-stone-400 group-hover:text-stone-600'
                                                )} />
                                                <span className="flex-1 truncate">{item.name}</span>
                                                {isActive && (
                                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-red-400 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                            )
                        })}
                    </nav>
                </div>

                <div className="border-t border-stone-200/70 bg-white p-3">
                    <Link href="/dashboard/team-tasks" className="block rounded-lg border border-stone-200 bg-stone-50 p-2 transition-colors hover:border-red-200 hover:bg-red-50/40">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B0000] text-white">
                                <Timer className="h-3.5 w-3.5" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-bold text-stone-800">Current tasks</p>
                                <p className="truncate text-[9px] font-medium text-stone-500">
                                    {taskSummary.open} open {taskSummary.open === 1 ? 'task' : 'tasks'}
                                </p>
                            </div>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#8B0000] shadow-sm">
                                {taskSummary.open}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-stone-500">
                            <Calendar className="h-3 w-3" aria-hidden />
                            {taskSummary.nextDue ? `Next due ${new Date(taskSummary.nextDue).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'No upcoming deadlines'}
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    )
}
