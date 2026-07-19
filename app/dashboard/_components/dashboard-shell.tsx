'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { DashboardSidebar } from '@/app/dashboard/_components/sidebar'
import { DashboardHeader } from '@/app/dashboard/_components/dashboard-header'
import { containsArabicScript, sanitizeEnglishText } from '@/lib/english-only'

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
    const lastEnglishOnlyWarningAt = useRef(0)

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

    const enforceEnglishOnly = (event: FormEvent<HTMLDivElement>) => {
        const target = event.target
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
        if (target instanceof HTMLInputElement && ['file', 'date', 'datetime-local', 'time', 'number', 'checkbox', 'radio', 'range', 'color'].includes(target.type)) return
        if (!containsArabicScript(target.value)) return

        const selectionStart = target.selectionStart ?? target.value.length
        const beforeCursor = target.value.slice(0, selectionStart)
        const sanitizedBeforeCursor = sanitizeEnglishText(beforeCursor)
        target.value = sanitizeEnglishText(target.value)
        target.setSelectionRange?.(sanitizedBeforeCursor.length, sanitizedBeforeCursor.length)

        const now = Date.now()
        if (now - lastEnglishOnlyWarningAt.current > 2500) {
            toast.warning('Dashboard fields accept English only.')
            lastEnglishOnlyWarningAt.current = now
        }
    }

    return (
        <div
            className="flex min-h-screen bg-slate-100 [font-family:var(--font-plus-jakarta-sans),sans-serif]"
            dir="ltr"
            lang="en"
            onInputCapture={enforceEnglishOnly}
        >
            <DashboardSidebar user={user} collapsed={collapsed || !mounted} />
            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardHeader user={user} collapsed={collapsed} onToggleSidebar={toggleSidebar} />
                <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    )
}
