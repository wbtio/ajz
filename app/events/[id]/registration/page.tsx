import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ClipboardList, Calendar, MapPin, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { ConferenceForm } from '@/components/conference/conference-form'
import { formatDateTime } from '@/lib/utils'
import type { FormField } from '@/lib/types'

const TEMPLATE_EVENT_AR_TITLE = 'تنفس البصرة 2026'

interface RegistrationPageProps {
  params: Promise<{ id: string }>
}

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

export default async function EventRegistrationPage({ params }: RegistrationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  const currentEventFields = getRegistrationFieldsFromEvent(event)

  let fields = currentEventFields

  if (fields.length === 0) {
    const { data: templateEvent } = await supabase
      .from('events')
      .select('registration_config, conference_config, date')
      .ilike('title_ar', `%${TEMPLATE_EVENT_AR_TITLE}%`)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    fields = getRegistrationFieldsFromEvent(templateEvent)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 md:py-14">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للفعالية
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-100 text-red-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">التسجيل</h2>
              <div className="w-10 h-1 rounded-full mt-1.5 bg-red-600" />
            </div>
          </div>

          {/* بطاقة معلومات الفعالية */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 mb-1">أنت تسجل في:</p>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">
                    {event.title_ar || event.title}
                  </h3>
                  {(event.title_ar && event.title && event.title !== event.title_ar) && (
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      {event.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">التاريخ</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDateTime(event.date)}
                    </p>
                    {event.end_date && event.end_date !== event.date && (
                      <p className="text-xs text-gray-600">
                        إلى {formatDateTime(event.end_date)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">الموقع</p>
                    <p className="text-sm font-bold text-gray-900">
                      {event.location_ar || event.location}
                    </p>
                    {event.country_ar && (
                      <p className="text-xs text-gray-600">{event.country_ar}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden max-w-3xl">
            <div className="h-1 bg-red-600" />
            <CardContent className="p-5 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                نموذج التقديم - التسجيل
              </h3>

              {fields.length > 0 ? (
                <ConferenceForm
                  eventId={event.id}
                  sectionSlug="registration"
                  fields={fields}
                  submitLabel="إرسال طلب التسجيل"
                />
              ) : (
                <p className="text-gray-500">لا توجد حقول تسجيل متاحة حالياً.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
