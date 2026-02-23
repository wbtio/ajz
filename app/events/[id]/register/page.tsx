'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Calendar, MapPin } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { Event, User } from '@/lib/database.types'
import type { FormField } from '@/lib/types'
import { Input } from '@/components/ui/input'

const TEMPLATE_EVENT_AR_TITLE = 'تنفس البصرة 2026'

function getRegistrationFieldsFromEvent(eventData: any): FormField[] {
  if (!eventData) return []

  const directFields = Array.isArray(eventData.registration_config)
    ? eventData.registration_config
    : []

  if (directFields.length > 0) {
    return directFields as FormField[]
  }

  const conferenceFields = Array.isArray(eventData?.conference_config?.registration?.form_fields)
    ? eventData.conference_config.registration.form_fields
    : []

  return conferenceFields as FormField[]
}

interface RegisterPageProps {
  params: Promise<{ id: string }>
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')
  const [error, setError] = useState('')
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      const supabase = createClient()

      // Get current user (optional)
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUser(profile)

        // Check if already registered
        const { data: existingReg } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('event_id', id)
          .single()

        if (existingReg) {
          setIsRegistered(true)
          setTicketNumber(existingReg.ticket_number || '')
        }
      }
      // Get event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      setEvent(eventData)

      const currentEventFields = getRegistrationFieldsFromEvent(eventData)

      if (currentEventFields.length > 0) {
        setFormFields(currentEventFields)
        return
      }

      // Fallback: use template form from "تنفس البصرة 2026" if current event has no configured form
      const { data: templateEvent } = await supabase
        .from('events')
        .select('registration_config, conference_config, date')
        .ilike('title_ar', `%${TEMPLATE_EVENT_AR_TITLE}%`)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()

      const templateFields = getRegistrationFieldsFromEvent(templateEvent)
      setFormFields(templateFields)
    }

    fetchData()
  }, [params, router])

  const handleRegister = async () => {
    if (!event || !user?.id) return

    setIsLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        user_id: user.id,
        event_id: event.id,
        status: 'confirmed',
        additional_data: dynamicFormData,
        // Optional: you can extract specialized fields if needed
        // full_name: Object.values(dynamicFormData)[0] as string || user?.full_name || null,
        // email: user?.email || null,
      })
      .select()
      .single()

    if (error) {
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.')
      setIsLoading(false)
      return
    }

    setIsRegistered(true)
    setTicketNumber(data.ticket_number || '')
    setIsLoading(false)
  }

  if (!event) {
    return (
      <div className="pt-36 pb-12">
        <Container className="max-w-lg">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">جاري التحميل...</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="pt-40 pb-12 min-h-screen bg-gray-50/50">
      <Container className="max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 px-2">
          <Link href={`/events/${event.id}`} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للفعالية
          </Link>
        </div>

        <Card className="shadow-lg border-gray-100 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 py-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {isRegistered ? 'تم التسجيل بنجاح!' : 'تأكيد التسجيل للفعالية'}
            </h1>
          </CardHeader>
          <CardContent className="p-8">
            {isRegistered ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  تم استلام طلبك بنجاح
                </h2>
                <p className="text-gray-500 mb-8">
                  شكراً لتسجيلك، سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.
                </p>
                
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <Link href="/events" className="w-full">
                    <Button className="w-full h-12 rounded-xl">
                      تصفح فعاليات أخرى
                    </Button>
                  </Link>
                  <Link href="/" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl">
                      العودة للرئيسية
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Event Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:block p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">
                        {event.title_ar || event.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2.5 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{formatDateTime(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{event.location_ar || event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info Section */}
                {user && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      معلومات المسجل
                    </label>
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {(user.full_name || user.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{user.full_name || 'مستخدم'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Fields Section */}
                {formFields.length > 0 && (
                  <div className="space-y-5 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        معلومات إضافية مطلوبة
                      </label>
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">مطلوب *</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                      {formFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            {field.label_ar || field.label_en}
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] resize-none text-sm"
                              required={field.required}
                              placeholder={`يرجى إدخال ${field.label_ar || field.label_en}...`}
                              value={dynamicFormData[field.id] || ''}
                              onChange={(e) => setDynamicFormData({ ...dynamicFormData, [field.id]: e.target.value })}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              required={field.required}
                              value={dynamicFormData[field.id] || ''}
                              onChange={(e) => setDynamicFormData({ ...dynamicFormData, [field.id]: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm h-12"
                            >
                              <option value="">{`اختر ${field.label_ar || field.label_en}...`}</option>
                              {(field.options || []).map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="relative">
                              <Input
                                type={field.type}
                                required={field.required}
                                className="bg-gray-50 border-gray-200 rounded-xl h-12 px-4 focus:ring-blue-500/20 text-sm"
                                placeholder={`يرجى إدخال ${field.label_ar || field.label_en}...`}
                                value={dynamicFormData[field.id] || ''}
                                onChange={(e) => setDynamicFormData({ ...dynamicFormData, [field.id]: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all rounded-xl"
                    onClick={handleRegister}
                    isLoading={isLoading}
                  >
                    إتمام التسجيل الآن
                  </Button>
                  <p className="text-center text-[11px] text-gray-400 mt-4">
                    بالنقر على إتمام التسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Container >
    </div >
  )
}
