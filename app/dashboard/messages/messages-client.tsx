'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  Search,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'

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
  const [isLoading, setIsLoading] = useState(false)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">رسائل التواصل</h1>
          <p className="text-sm text-gray-500">إدارة الرسائل الواردة من نموذج اتصل بنا</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.refresh()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="بحث في الرسائل..."
          className="w-full pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <Card key={msg.id} className={cn(
              "overflow-hidden border-gray-100 transition-all hover:shadow-md",
              msg.status === 'unread' ? "border-r-4 border-r-blue-500" : ""
            )}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                          msg.status === 'unread' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                        )}>
                          {msg.full_name[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {msg.full_name}
                            {msg.status === 'unread' && (
                              <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">جديد</span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-500">{msg.email} • {msg.phone || 'بدون رقم هاتف'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-1">{msg.subject || 'بدون موضوع'}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {msg.created_at ? formatDateTime(msg.created_at) : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 justify-end">
                      {msg.status === 'unread' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(msg.id, 'read')}
                          className="flex items-center gap-2 text-blue-600 border-blue-100 hover:bg-blue-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تمييز كمقروء
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(msg.id, 'unread')}
                          className="flex items-center gap-2 text-gray-500 border-gray-100 hover:bg-gray-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                          إعادة كغير مقروء
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-2 text-red-600 border-red-100 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-500 font-medium">لا توجد رسائل واردة حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
