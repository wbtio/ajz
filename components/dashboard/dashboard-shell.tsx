'use client'

import { useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

interface DashboardUser {
    id: string
    email: string
    full_name: string | null
    role: string | null
    avatar_url: string | null
    permissions?: string[] | null
}

interface DashboardShellProps {
    user: DashboardUser
    children: React.ReactNode
}

const SIDEBAR_STORAGE_KEY = 'jaz-dashboard-sidebar-collapsed'

export function DashboardShell({ user, children }: DashboardShellProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        let frame = 0
        try {
            const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
            const nextCollapsed = stored !== null
                ? stored === '1'
                : window.matchMedia('(max-width: 1023px)').matches
            frame = window.requestAnimationFrame(() => {
                setCollapsed(nextCollapsed)
                setMounted(true)
            })
        } catch {
            frame = window.requestAnimationFrame(() => setMounted(true))
        }
        return () => window.cancelAnimationFrame(frame)
    }, [])

    const toggleSidebar = () => {
        setCollapsed((prev) => {
            const next = !prev
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
            } catch {}
            return next
        })
    }

    return (
        <div className="flex min-h-screen bg-slate-100 [font-family:var(--font-plus-jakarta-sans),sans-serif]" dir="ltr" lang="en">
            <DashboardSidebar user={user} collapsed={collapsed || !mounted} />
            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardHeader user={user} collapsed={collapsed} onToggleSidebar={toggleSidebar} />
                <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    )
}
