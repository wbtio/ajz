'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn, formatDateTime } from '@/lib/utils'

interface ContactMessage {
  id: string
  full_name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string | null
  created_at: string | null
}

export default function MessagesPage({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleStatusUpdate = async (id: string, newStatus: 'unread' | 'read' | 'archived') => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (!error) {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }
  }

  const filteredMessages = messages.filter(msg => 
    msg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unreadCount = messages.filter((msg) => msg.status === 'unread').length

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-stone-600">
              رسائل التواصل
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-950 md:text-3xl">رسائل التواصل</h1>
              <p className="mt-1 text-sm text-stone-600">
                عرض مختصر للرسائل الواردة من نموذج التواصل.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600">
              <Bell className="h-4 w-4 text-stone-500" />
              {unreadCount} غير مقروء
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
              className="h-10 rounded-2xl border-stone-200 bg-white px-4 text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm">
        <CardHeader className="border-b border-stone-200 bg-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-stone-950">صندوق الوارد</CardTitle>
              <CardDescription className="mt-1 text-sm text-stone-500">
                ابحث بالاسم أو البريد أو الموضوع، ثم راجع الرسالة بسرعة.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-500">
              <MessageSquare className="h-4 w-4 text-stone-500" />
              {filteredMessages.length} رسالة
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              type="text"
              placeholder="ابحث باسم المرسل أو البريد أو الموضوع"
              className="h-11 rounded-2xl border-stone-200 bg-stone-50 pr-11 text-sm shadow-none transition-colors focus:border-stone-300 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <Card
                  key={msg.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm',
                    msg.status === 'unread' ? 'border-r-4 border-r-stone-900' : ''
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold',
                              msg.status === 'unread' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                            )}
                          >
                            {msg.full_name[0].toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-stone-950">{msg.full_name}</h3>
                              {msg.status === 'unread' && (
                                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                                  جديد
                                </span>
                              )}
                            </div>

                            <div className="mt-2 space-y-1">
                              <p className="truncate text-sm font-medium text-stone-800">
                                {msg.subject || 'بدون موضوع'}
                              </p>
                              <p className="line-clamp-2 text-sm leading-6 text-stone-600">
                                {msg.message}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium text-stone-400">
                              <span className="truncate" dir="ltr">
                                {msg.email}
                              </span>
                              {msg.phone ? (
                                <span dir="ltr">{msg.phone}</span>
                              ) : null}
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {msg.created_at ? formatDateTime(msg.created_at) : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:shrink-0">
                        {msg.status === 'unread' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(msg.id, 'read')}
                            className="h-9 rounded-xl border-stone-200 px-3 text-stone-700 hover:bg-stone-50"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            قراءة
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(msg.id, 'unread')}
                            className="h-9 rounded-xl border-stone-200 px-3 text-stone-600 hover:bg-stone-50"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            إعادة
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(msg.id)}
                          className="h-9 rounded-xl border-rose-100 px-3 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <MessageSquare className="h-7 w-7 text-stone-300" />
                </div>
                <p className="font-medium text-stone-500">لا توجد رسائل واردة حالياً</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
