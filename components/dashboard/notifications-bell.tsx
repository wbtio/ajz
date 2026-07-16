'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function timeAgoEnglish(iso: string) {
    const elapsedMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (elapsedMinutes < 60) return relativeTime.format(-Math.max(1, elapsedMinutes), 'minute')
    const elapsedHours = Math.floor(elapsedMinutes / 60)
    if (elapsedHours < 24) return relativeTime.format(-elapsedHours, 'hour')
    const elapsedDays = Math.floor(elapsedHours / 24)
    if (elapsedDays < 30) return relativeTime.format(-elapsedDays, 'day')
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(iso))
}

const NOTIFICATION_POLL_MS = 120_000

// تنبيه قصير وواضح، نغمتان فقط حتى يلفت انتباه الفريق من دون إزعاج.
function playAlertSound() {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AudioCtx()
        const notes = [659.25, 880] // E5, A5 — نغمة صاعدة هادئة وواضحة
        notes.forEach((freq, i) => {
            const start = ctx.currentTime + i * 0.16
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, start)
            gain.gain.setValueAtTime(0, start)
            gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(start)
            osc.stop(start + 0.26)
        })
        setTimeout(() => ctx.close().catch(() => {}), 800)
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

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications')
            if (!res.ok) return
            const data: Notification[] = await res.json()

            // نشغّل الصوت فقط عند ظهور إشعارات غير مقروءة جديدة لم نرَها من قبل (وليس عند أول تحميل للصفحة)
            if (seenIds.current) {
                const newUnread = data.filter((n) => !n.is_read && !seenIds.current!.has(n.id))
                if (newUnread.length > 0) {
                    playAlertSound()
                    newUnread.filter((notification) => notification.type !== 'task_assigned').slice(0, 2).forEach((notification) => {
                        toast(notification.title, {
                            description: notification.body || 'A new team notification needs your attention.',
                            duration: 7_000,
                            action: {
                                label: 'Open',
                                onClick: () => router.push(notification.link_url || metaFor(notification.type).fallbackHref),
                            },
                        })
                    })
                }
            }
            window.dispatchEvent(new CustomEvent('jaz:notifications-synced', {
                detail: data.filter((notification) => !notification.is_read && notification.type === 'task_assigned'),
            }))
            seenIds.current = new Set(data.map((n) => n.id))

            setNotifications(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, NOTIFICATION_POLL_MS)
        return () => clearInterval(interval)
    }, [fetchNotifications])

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
        const previousNotifications = notifications
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        try {
            const response = await fetch('/api/notifications', { method: 'PATCH' })
            if (!response.ok) throw new Error('Request failed')
        } catch (e) {
            console.error(e)
            setNotifications(previousNotifications)
            toast.error('Could not mark notifications as read. Try again.')
        }
    }

    const handleClickNotification = async (n: Notification) => {
        if (!n.is_read) {
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
            try {
                const response = await fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })
                if (!response.ok) throw new Error('Request failed')
            } catch {
                setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: false } : x)))
                toast.error('Could not update the notification status.')
            }
        }
        setOpen(false)
        router.push(n.link_url || metaFor(n.type).fallbackHref)
    }

    return (
        <div className="relative" ref={containerRef} dir="ltr">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative flex size-9 items-center justify-center rounded-lg border border-stone-200/70 bg-white text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/35"
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell className="h-4 w-4" aria-hidden />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                        <span className="text-sm font-bold text-stone-800">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                            >
                                <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                                Mark all as read
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
                                <p className="text-xs font-medium text-stone-400">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const { icon: Icon, className } = metaFor(n.type)
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleClickNotification(n)}
                                        className={cn(
                                            'flex w-full items-start gap-3 border-b border-stone-50 px-4 py-3 text-left transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B0000]/35',
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
                                            <p className="mt-1 text-[10px] text-stone-400">{timeAgoEnglish(n.created_at)}</p>
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
