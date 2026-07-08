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

    useEffect(() => {
        setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1')
    }, [])

    const toggleSidebar = () => {
        setCollapsed((prev) => {
            const next = !prev
            localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
            return next
        })
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <DashboardSidebar user={user} collapsed={collapsed} />
            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardHeader user={user} collapsed={collapsed} onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    )
}
