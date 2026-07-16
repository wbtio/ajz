'use client'

import { useEffect, useState } from 'react'
import { Check, ClipboardList, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AssignmentNotification {
    id: string
    title: string
    body: string | null
    task_id: string | null
    link_url: string | null
}

export function TaskAssignmentPrompt() {
    const router = useRouter()
    const [notification, setNotification] = useState<AssignmentNotification | null>(null)
    const [accepting, setAccepting] = useState(false)

    useEffect(() => {
        const handleSync = (event: Event) => {
            const detail = (event as CustomEvent<AssignmentNotification[]>).detail
            const next = detail?.find((item) => item.task_id)
            if (next) setNotification(next)
        }
        window.addEventListener('jaz:notifications-synced', handleSync)
        return () => window.removeEventListener('jaz:notifications-synced', handleSync)
    }, [])

    if (!notification) return null

    const acceptAssignment = async () => {
        setAccepting(true)
        try {
            const response = await fetch(`/api/notifications/${notification.id}`, { method: 'PATCH' })
            if (!response.ok) throw new Error('Unable to accept assignment')
            setNotification(null)
            router.push(notification.link_url || '/dashboard/team-tasks')
        } catch {
            setAccepting(false)
        }
    }

    return (
        <div className="border-t border-stone-200/70 bg-stone-50 p-2.5" role="status" aria-live="assertive">
            <div className="rounded-lg border border-[#8B0000]/20 bg-white p-2.5 shadow-sm">
                <div className="flex items-start gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#8B0000]">
                        <ClipboardList className="size-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-stone-900">New task assigned</p>
                        <p className="mt-0.5 truncate text-[10px] text-stone-500">{notification.body || 'A task needs your attention.'}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={acceptAssignment}
                    disabled={accepting}
                    className="mt-2 flex h-7 w-full items-center justify-center gap-1 rounded-md bg-[#8B0000] text-[10px] font-bold text-white transition-colors hover:bg-[#6B0000] disabled:opacity-60"
                >
                    {accepting ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Check className="size-3" aria-hidden />}
                    Accept and open task
                </button>
            </div>
        </div>
    )
}
