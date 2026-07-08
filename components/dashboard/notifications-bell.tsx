'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Bell,
    CheckCheck,
    ClipboardCheck,
    ClipboardList,
    Loader2,
    Mail,
    Handshake,
    Building2,
    CalendarCheck,
    PenLine,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

interface Notification {
    id: string
    type: string
    title: string
    body: string | null
    task_id: string | null
    link_url: string | null
    is_read: boolean
    created_at: string
}

const typeMeta: Record<string, { icon: typeof Bell; className: string; fallbackHref: string }> = {
    task_assigned: { icon: ClipboardList, className: 'bg-blue-100 text-blue-600', fallbackHref: '/dashboard/team-tasks' },
    task_completed: { icon: ClipboardCheck, className: 'bg-emerald-100 text-emerald-600', fallbackHref: '/dashboard/team-tasks' },
    registration_edited: { icon: PenLine, className: 'bg-amber-100 text-amber-600', fallbackHref: '/dashboard/registrations' },
    event_registration: { icon: CalendarCheck, className: 'bg-sky-100 text-sky-600', fallbackHref: '/dashboard/registrations' },
    sector_registration: { icon: Building2, className: 'bg-indigo-100 text-indigo-600', fallbackHref: '/dashboard/sector-registrations' },
    contact_message: { icon: Mail, className: 'bg-rose-100 text-rose-600', fallbackHref: '/dashboard/messages' },
    partner_submission: { icon: Handshake, className: 'bg-fuchsia-100 text-fuchsia-600', fallbackHref: '/dashboard/partners' },
}

const metaFor = (type: string) => typeMeta[type] ?? { icon: ClipboardList, className: 'bg-blue-100 text-blue-600', fallbackHref: '/dashboard/team-tasks' }

// تنبيه صوتي قوي وقصير (أقل من 3 ثوانٍ) — ثلاث نغمات متصاعدة عبر Web Audio API، بلا حاجة لملف صوتي
function playAlertSound() {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AudioCtx()
        const notes = [880, 1046.5, 1318.5] // A5, C6, E6 — نغمة تنبيه واضحة وحادة
        notes.forEach((freq, i) => {
            const start = ctx.currentTime + i * 0.22
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, start)
            gain.gain.setValueAtTime(0, start)
            gain.gain.linearRampToValueAtTime(0.5, start + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(start)
            osc.stop(start + 0.34)
        })
        setTimeout(() => ctx.close().catch(() => {}), 1200)
    } catch {
        // بعض المتصفحات تمنع الصوت قبل أول تفاعل من المستخدم — نتجاهل الخطأ بصمت
    }
}

export function NotificationsBell() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)
    const seenIds = useRef<Set<string> | null>(null)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (!res.ok) return
            const data: Notification[] = await res.json()

            // نشغّل الصوت فقط عند ظهور إشعارات غير مقروءة جديدة لم نرَها من قبل (وليس عند أول تحميل للصفحة)
            if (seenIds.current) {
                const hasNewUnread = data.some((n) => !n.is_read && !seenIds.current!.has(n.id))
                if (hasNewUnread) playAlertSound()
            }
            seenIds.current = new Set(data.map((n) => n.id))

            setNotifications(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 15000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const unreadCount = notifications.filter((n) => !n.is_read).length

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        try {
            await fetch('/api/notifications', { method: 'PATCH' })
        } catch (e) {
            console.error(e)
        }
    }

    const handleClickNotification = async (n: Notification) => {
        if (!n.is_read) {
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
            fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {})
        }
        setOpen(false)
        router.push(n.link_url || metaFor(n.type).fallbackHref)
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/70 bg-white text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800"
                title="التنبيهات"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                        <span className="text-sm font-bold text-stone-800">التنبيهات</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                تعليم الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-stone-300" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-stone-300">
                                <Bell className="mb-2 h-8 w-8" />
                                <p className="text-xs font-medium text-stone-400">لا توجد تنبيهات</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const { icon: Icon, className } = metaFor(n.type)
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleClickNotification(n)}
                                        className={cn(
                                            'flex w-full items-start gap-3 border-b border-stone-50 px-4 py-3 text-right transition-colors hover:bg-stone-50',
                                            !n.is_read && 'bg-blue-50/50'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                                className
                                            )}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-stone-800">{n.title}</p>
                                            {n.body && (
                                                <p className="mt-0.5 truncate text-[11px] text-stone-500">{n.body}</p>
                                            )}
                                            <p className="mt-1 text-[10px] text-stone-400">{timeAgo(n.created_at)}</p>
                                        </div>
                                        {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
