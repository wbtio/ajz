'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon as Iconify } from '@iconify/react'
import { cn, timeAgo } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  is_read: boolean
  created_at: string
}

function iconFor(type: string) {
  if (type === 'registration_approved') return { icon: 'solar:check-circle-bold-duotone', cls: 'bg-emerald-100 text-emerald-600' }
  if (type === 'registration_rejected') return { icon: 'solar:close-circle-bold-duotone', cls: 'bg-red-100 text-red-600' }
  return { icon: 'solar:bell-bold-duotone', cls: 'bg-blue-100 text-blue-600' }
}

export function UserNotificationsBell({ isRtl }: { isRtl: boolean }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      setNotifications(await res.json())
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
    } catch {
      /* silent */
    }
  }

  const onClickNotification = (n: Notification) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
      fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {})
    }
    setOpen(false)
    router.push('/account')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={isRtl ? 'الإشعارات' : 'Notifications'}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md"
      >
        <Iconify icon="solar:bell-bold-duotone" className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#8b0000] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-bold text-slate-800">{isRtl ? 'الإشعارات' : 'Notifications'}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-[#8b0000] hover:underline">
                <Iconify icon="solar:check-read-line-duotone" className="w-3.5 h-3.5" />
                {isRtl ? 'تعليم الكل كمقروء' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Iconify icon="svg-spinners:180-ring" className="w-5 h-5 text-slate-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <Iconify icon="solar:bell-off-bold-duotone" className="mb-2 w-8 h-8" />
                <p className="text-xs font-medium text-slate-400">{isRtl ? 'لا توجد إشعارات' : 'No notifications'}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = iconFor(n.type)
                return (
                  <button
                    key={n.id}
                    onClick={() => onClickNotification(n)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-start transition-colors hover:bg-slate-50',
                      !n.is_read && 'bg-blue-50/40',
                    )}
                  >
                    <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', meta.cls)}>
                      <Iconify icon={meta.icon} className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">{n.title}</p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{n.body}</p>}
                      <p className="mt-1 text-[10px] text-slate-400">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b0000]" />}
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
