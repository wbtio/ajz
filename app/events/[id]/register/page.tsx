'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowRight, CheckCircle, Calendar, MapPin, ChevronLeft,
  Shield, FileText, CreditCard, Upload, X, Info, Tag, Clock, Loader2,
} from 'lucide-react'
import { getRegistrationFieldsFromConferenceConfig, parseFormFields } from '@/lib/form-fields'
import { formatDateTime } from '@/lib/utils'
import type { Event, User } from '@/lib/database.types'
import type { FormField } from '@/lib/types'
import { isHiddenEvent } from '@/lib/events-visibility'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'البيانات', icon: FileText },
  { label: 'الخدمات', icon: Tag },
  { label: 'الوثائق', icon: Upload },
  { label: 'المراجعة', icon: CreditCard },
]

const SERVICE_PRICING = {
  insurance: 75000,
  applicationHelp: 50000,
  appointmentBooking: 40000,
}

function money(n: number) {
  return n > 0 ? `${n.toLocaleString('ar')} د.ع` : 'مجاني'
}

type SelectedService = {
  key: string
  label: string
  amount: number
  meta?: Record<string, string>
}

type DocQuality = 'checking' | 'clear' | 'unclear'

type DocOcr = {
  fields?: Record<string, string>
  mrzFound?: boolean
  mrzVerified?: boolean
  quality: DocQuality
}

type UploadedDoc = {
  name: string
  path: string
  uploadedAt: string
  ocr?: DocOcr
}

type DiffEntry = {
  field_key: string
  field_label?: string | null
  old_value?: string | null
  new_value?: string | null
}

const LOCKED_STATUSES = ['confirmed', 'approved', 'rejected', 'attended', 'cancelled', 'completed']

export default function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [regStatus, setRegStatus] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [justUpdated, setJustUpdated] = useState(false)
  const [error, setError] = useState('')
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, string>>({})
  const [registrationId, setRegistrationId] = useState<string | undefined>()
  const [step, setStep] = useState(1)
  const snapshotRef = useRef<{ data: Record<string, string>; services: SelectedService[]; documents: UploadedDoc[] } | null>(null)

  // الخدمات المدفوعة
  const [wantsInsurance, setWantsInsurance] = useState(false)
  const [insuranceCountry, setInsuranceCountry] = useState('')
  const [insuranceStart, setInsuranceStart] = useState('')
  const [insuranceEnd, setInsuranceEnd] = useState('')
  const [wantsApplicationHelp, setWantsApplicationHelp] = useState(false)
  const [wantsAppointment, setWantsAppointment] = useState(false)

  // الوثائق
  const [documents, setDocuments] = useState<UploadedDoc[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const selectedServices: SelectedService[] = useMemo(() => {
    const list: SelectedService[] = []
    if (wantsInsurance) {
      list.push({
        key: 'insurance',
        label: 'تأمين السفر',
        amount: SERVICE_PRICING.insurance,
        meta: { country: insuranceCountry, start: insuranceStart, end: insuranceEnd },
      })
    }
    if (wantsApplicationHelp) {
      list.push({ key: 'applicationHelp', label: 'مساعدة في التقديم', amount: SERVICE_PRICING.applicationHelp })
    }
    if (wantsAppointment) {
      list.push({ key: 'appointmentBooking', label: 'حجز موعد', amount: SERVICE_PRICING.appointmentBooking })
    }
    return list
  }, [event, wantsInsurance, insuranceCountry, insuranceStart, insuranceEnd, wantsApplicationHelp, wantsAppointment])

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.amount, 0)

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      const supabase = createClient()

      // 1) نحمّل الفعالية أولاً — نحتاج حقولها للتعبئة المسبقة
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (!eventData || isHiddenEvent(eventData)) {
        router.replace('/events')
        return
      }
      setEvent(eventData)

      const directFields = parseFormFields(eventData?.registration_config)
      const fields = directFields.length > 0
        ? directFields
        : getRegistrationFieldsFromConferenceConfig(eventData?.conference_config)
      setFormFields(fields)

      // 2) التسجيل مرتبط بحساب المستخدم — نطلب الدخول أولاً
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.replace(`/auth/login?redirect=${encodeURIComponent(`/events/${id}/register`)}`)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setUser(profile)

      // 3) نستكمل تسجيلاً سابقاً، أو نعبّئ تسجيلاً جديداً من الملف الشخصي
      const { data: existingReg } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('event_id', id)
        .maybeSingle()

      if (existingReg) {
        setRegistrationId(existingReg.id)
        setRegStatus(existingReg.status)
        const data = (existingReg.additional_data as Record<string, string>) ?? {}
        setDynamicFormData(data)
        const services = (existingReg.selected_services as SelectedService[] | null) ?? []
        setWantsInsurance(services.some(s => s.key === 'insurance'))
        const ins = services.find(s => s.key === 'insurance')
        if (ins?.meta) {
          setInsuranceCountry(ins.meta.country ?? '')
          setInsuranceStart(ins.meta.start ?? '')
          setInsuranceEnd(ins.meta.end ?? '')
        }
        setWantsApplicationHelp(services.some(s => s.key === 'applicationHelp'))
        setWantsAppointment(services.some(s => s.key === 'appointmentBooking'))
        const docs = (existingReg.documents as UploadedDoc[] | null) ?? []
        setDocuments(docs)

        if (existingReg.current_step >= 5) {
          setAlreadySubmitted(true)
          snapshotRef.current = { data, services, documents: docs }
          const status = (existingReg.status || '').toLowerCase()
          if (!LOCKED_STATUSES.includes(status) && searchParams.get('edit') === '1') {
            setIsEditing(true)
            setStep(1)
          }
        } else {
          setStep(Math.min(Math.max(existingReg.current_step, 1), 4))
        }
      } else {
        // تعبئة مسبقة من الملف الشخصي (بعد أن أصبحت الحقول معروفة)
        const prefill: Record<string, string> = {}
        for (const f of fields) {
          const label = f.label_ar || ''
          if (label.includes('شركة') && profile?.company_name) prefill[f.id] = profile.company_name
          else if (label.includes('بريد') && authUser.email) prefill[f.id] = authUser.email
          else if (label.includes('هاتف') && profile?.phone) prefill[f.id] = profile.phone
          else if (label.includes('دولة') && profile?.country) prefill[f.id] = profile.country
          else if (label.includes('الاسم') && !label.includes('شركة') && profile?.full_name) prefill[f.id] = profile.full_name
        }
        setDynamicFormData(prefill)
      }
    }
    fetchData()
  }, [params, router, searchParams])

  // ─── الخطوة 1: حفظ البيانات ──────────────────────
  async function goStep1Next() {
    const missing = formFields.some(f => f.required && !dynamicFormData[f.id]?.trim())
    if (missing) {
      setError('يرجى تعبئة جميع الحقول المطلوبة')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const supabase = createClient()
      const fullNameField = formFields.find(f => (f.label_ar || '').includes('الاسم') && !(f.label_ar || '').includes('شركة'))
      const emailField = formFields.find(f => f.type === 'email')

      const payload = {
        current_step: isEditing ? 5 : 2,
        full_name: (fullNameField && dynamicFormData[fullNameField.id]) || user?.full_name || null,
        email: (emailField && dynamicFormData[emailField.id]) || user?.email || null,
        additional_data: dynamicFormData,
      }

        if (registrationId) {
          await supabase.from('registrations').update(payload).eq('id', registrationId!)
        } else if (user?.id) {
        const { data } = await supabase
          .from('registrations')
          .insert({ ...payload, event_id: event!.id, user_id: user.id, status: 'pending' })
          .select()
          .single()
        if (data) setRegistrationId(data.id)
      }
      setStep(2)
    } catch {
      setError('حدث خطأ أثناء الحفظ')
    }
    setIsLoading(false)
  }

  // ─── الخطوة 2: حفظ الخدمات ───────────────────────
  async function goStep2Next() {
    setError('')
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('registrations').update({
        current_step: isEditing ? 5 : 3,
        selected_services: selectedServices,
        total_amount: totalAmount,
      }).eq('id', registrationId!)
      setStep(3)
    } catch {
      setError('حدث خطأ أثناء الحفظ')
    }
    setIsLoading(false)
  }

  // ─── رفع وثيقة ───────────────────────────────────
  async function onAddDocument(file: File) {
    if (!user?.id) return
    setUploadingDoc(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${event!.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('registration-documents')
        .upload(path, file, { contentType: file.type, upsert: true })
      if (upErr) throw upErr
      setDocuments(prev => [...prev, { name: file.name, path, uploadedAt: new Date().toISOString(), ocr: { quality: 'checking' } }])
      void checkDocumentQuality(path, file)
    } catch {
      setError('تعذّر رفع الوثيقة')
    }
    setUploadingDoc(false)
  }

  // ─── قراءة الوثيقة تلقائيًا والتحقق من وضوحها ────
  async function checkDocumentQuality(path: string, file: File) {
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await fetch('/api/passport-ocr', { method: 'POST', body: form })
      if (!res.ok) throw new Error('ocr failed')
      const data = await res.json()
      const fields = (data.fields || {}) as Record<string, string>
      const hasStructuredData = Object.values(fields).some(v => typeof v === 'string' && v.trim())
      const looksBlank = !hasStructuredData && (!data.rawText || String(data.rawText).trim().length < 20)
      // mrzFound قد يكون صحيحًا زورًا لو النموذج ملأ حقل mrz الإلزامي بحشو بدل تركه فارغًا،
      // لذا لا نثق فيه إلا إذا كان الشريط الممسوح طوله فعليًا يشبه MRZ حقيقي (٤٠+ حرف)
      const mrzLooksReal = typeof data.mrz === 'string' && data.mrz.replace(/\n/g, '').length >= 40
      const quality: DocQuality = data.mrzFound && mrzLooksReal
        ? (data.mrzVerified ? 'clear' : 'unclear')
        : (looksBlank ? 'unclear' : 'clear')
      setDocuments(prev => prev.map(d => d.path === path
        ? { ...d, ocr: { fields, mrzFound: Boolean(data.mrzFound), mrzVerified: Boolean(data.mrzVerified), quality } }
        : d))
    } catch {
      setDocuments(prev => prev.map(d => d.path === path ? { ...d, ocr: { quality: 'unclear' } } : d))
    }
  }

  // ─── الخطوة 3: حفظ الوثائق ───────────────────────
  async function goStep3Next() {
    if (documents.length === 0) {
      setError('يرجى رفع وثيقة واحدة على الأقل')
      return
    }
    if (documents.some(d => d.ocr?.quality === 'checking')) {
      setError('يرجى الانتظار حتى تكتمل قراءة الوثائق')
      return
    }
    if (documents.some(d => d.ocr?.quality === 'unclear')) {
      setError('إحدى الوثائق غير واضحة بما يكفي — يرجى حذفها ورفع صورة أوضح للمتابعة')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('registrations').update({
        current_step: isEditing ? 5 : 4,
        documents,
      }).eq('id', registrationId!)
      setStep(4)
    } catch {
      setError('حدث خطأ أثناء الحفظ')
    }
    setIsLoading(false)
  }

  // ─── الخطوة 4: تأكيد نهائي ───────────────────────
  async function onConfirm() {
    setError('')
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('registrations').update({
        current_step: 5,
        status: 'pending',
        payment_status: 'pending',
      }).eq('id', registrationId!)
      fetch('/api/registrations/notify-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      }).catch(() => {})
      setIsDone(true)
    } catch {
      setError('حدث خطأ أثناء التأكيد')
    }
    setIsLoading(false)
  }

  // ─── وضع التعديل: بناء الفروقات بين النسخة الأصلية والحالية ───
  function buildEditDiffs(): DiffEntry[] {
    const snap = snapshotRef.current
    if (!snap) return []
    const diffs: DiffEntry[] = []

    for (const f of formFields) {
      const oldV = snap.data[f.id] ?? ''
      const newV = dynamicFormData[f.id] ?? ''
      if (oldV !== newV) {
        diffs.push({
          field_key: f.id,
          field_label: f.label_ar || f.label_en,
          old_value: oldV || null,
          new_value: newV || null,
        })
      }
    }

    const oldServiceKeys = new Set(snap.services.map(s => s.key))
    const newServiceKeys = new Set(selectedServices.map(s => s.key))
    for (const s of selectedServices) {
      if (!oldServiceKeys.has(s.key)) {
        diffs.push({ field_key: `service_${s.key}`, field_label: 'خدمة مضافة', old_value: null, new_value: s.label })
      }
    }
    for (const s of snap.services) {
      if (!newServiceKeys.has(s.key)) {
        diffs.push({ field_key: `service_${s.key}`, field_label: 'خدمة محذوفة', old_value: s.label, new_value: null })
      }
    }

    const oldDocPaths = new Set(snap.documents.map(d => d.path))
    const newDocPaths = new Set(documents.map(d => d.path))
    for (const d of documents) {
      if (!oldDocPaths.has(d.path)) {
        diffs.push({ field_key: 'document', field_label: 'وثيقة مضافة', old_value: null, new_value: d.name })
      }
    }
    for (const d of snap.documents) {
      if (!newDocPaths.has(d.path)) {
        diffs.push({ field_key: 'document', field_label: 'وثيقة محذوفة', old_value: d.name, new_value: null })
      }
    }

    return diffs
  }

  // ─── وضع التعديل: حفظ التغييرات وتسجيلها بسجل التعديلات ───
  async function onUpdateSubmit() {
    setError('')
    setIsLoading(true)
    try {
      const supabase = createClient()
      const fullNameField = formFields.find(f => (f.label_ar || '').includes('الاسم') && !(f.label_ar || '').includes('شركة'))
      const emailField = formFields.find(f => f.type === 'email')
      const diffs = buildEditDiffs()

      await supabase.from('registrations').update({
        current_step: 5,
        full_name: (fullNameField && dynamicFormData[fullNameField.id]) || user?.full_name || null,
        email: (emailField && dynamicFormData[emailField.id]) || user?.email || null,
        additional_data: dynamicFormData,
        selected_services: selectedServices,
        total_amount: totalAmount,
        documents,
      }).eq('id', registrationId!)

      if (diffs.length > 0 && registrationId) {
        await fetch(`/api/registrations/${registrationId}/log-edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diffs }),
        })
      }

      snapshotRef.current = { data: dynamicFormData, services: selectedServices, documents }
      setIsEditing(false)
      setJustUpdated(true)
    } catch {
      setError('حدث خطأ أثناء تحديث الطلب')
    }
    setIsLoading(false)
  }

  // ─── Render ──────────────────────────────────────
  if (!event) {
    return (
      <div className="pt-28 sm:pt-32 lg:pt-36 pb-12">
        <Container className="max-w-lg">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">جاري التحميل...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (alreadySubmitted && !isEditing) {
    const isLocked = LOCKED_STATUSES.includes((regStatus || '').toLowerCase())

    if (isLocked) {
      return (
        <div className="pt-28 sm:pt-32 lg:pt-36 pb-12 min-h-screen bg-gray-50/50">
          <Container className="max-w-lg">
            <Card className="shadow-lg border-gray-100 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">تم استلام طلبك مسبقًا</h2>
                <p className="text-gray-500 mb-6">سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.</p>
                <Link href="/events">
                  <Button className="w-full h-12 rounded-xl">تصفح فعاليات أخرى</Button>
                </Link>
              </CardContent>
            </Card>
          </Container>
        </div>
      )
    }

    return (
      <div className="pt-28 sm:pt-32 lg:pt-36 pb-12 min-h-screen bg-gray-50/50">
        <Container className="max-w-lg">
          <Card className="shadow-lg border-gray-100 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">طلبك قيد المراجعة</h2>
              <p className="text-gray-500 mb-2">سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.</p>
              <p className="text-gray-400 text-sm mb-6">يمكنك تعديل بياناتك ما دام الطلب لم يُراجَع بعد.</p>
              {justUpdated && (
                <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm p-3 rounded-xl">
                  تم تحديث طلبك بنجاح
                </div>
              )}
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <Button
                  className="w-full h-12 rounded-xl"
                  onClick={() => { setJustUpdated(false); setIsEditing(true); setStep(1) }}
                >
                  تعديل الطلب
                </Button>
                <Link href="/events">
                  <Button variant="outline" className="w-full h-12 rounded-xl">تصفح فعاليات أخرى</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  if (isDone) {
    return (
      <div className="pt-28 sm:pt-32 lg:pt-36 pb-12 min-h-screen bg-gray-50/50">
        <Container className="max-w-lg">
          <Card className="shadow-lg border-gray-100 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">تم استلام طلبك بنجاح</h2>
              <p className="text-gray-500 mb-6">
                شكراً لتسجيلك في {event.title_ar || event.title}، سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.
              </p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <Link href="/events">
                  <Button className="w-full h-12 rounded-xl">تصفح فعاليات أخرى</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-12 rounded-xl">العودة للرئيسية</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-12 min-h-screen bg-gray-50/50">
      <Container className="max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowRight className="w-4 h-4" />
            العودة للفعالية
          </Link>
        </div>

        {/* بطاقة معلومات الفعالية */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden mb-6">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-700 mb-1">أنت تسجل في:</p>
                <h3 className="text-lg font-black text-gray-900 leading-tight">
                  {event.title_ar || event.title}
                </h3>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDateTime(event.date)}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {event.location_ar || event.location}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* مؤشر الخطوات */}
        <div className="flex items-center justify-between mb-2 px-2">
          {STEPS.map((s, i) => {
            const n = i + 1
            const active = n === step
            const done = n < step
            return (
              <div key={s.label} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => done && setStep(n)}
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all',
                    active && 'border-blue-600 bg-blue-600 text-white',
                    done && 'border-emerald-500 bg-emerald-500 text-white cursor-pointer hover:opacity-80',
                    !active && !done && 'border-gray-200 bg-white text-gray-400 cursor-default',
                  )}
                >
                  {done ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </button>
                <span className={cn(
                  'text-xs font-semibold hidden sm:block',
                  active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-400',
                )}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-1', done ? 'bg-emerald-500' : 'bg-gray-200')} />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-center text-[11px] text-gray-400 mb-6">
          الخطوة {step} من {STEPS.length} — يستغرق التسجيل عادة أقل من ٣ دقائق
        </p>

        <Card className="shadow-lg border-gray-100 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* ─── الخطوة 1: البيانات ─── */}
            {step === 1 && (
              <div className="space-y-5">
                {user && (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {(user.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )}

                {formFields.map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      {field.label_ar || field.label_en}
                      {field.required && <span className="text-red-500 mr-1"> *</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px] resize-none text-sm"
                        required={field.required}
                        placeholder={`يرجى إدخال ${field.label_ar || field.label_en}...`}
                        value={dynamicFormData[field.id] || ''}
                        onChange={e => setDynamicFormData({ ...dynamicFormData, [field.id]: e.target.value })}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={dynamicFormData[field.id] || ''}
                        onChange={e => setDynamicFormData({ ...dynamicFormData, [field.id]: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm h-12"
                      >
                        <option value="">{`اختر ${field.label_ar || field.label_en}...`}</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={field.type}
                        required={field.required}
                        className="bg-gray-50 border-gray-200 rounded-xl h-12 px-4 focus:ring-blue-500/20 text-sm"
                        placeholder={`يرجى إدخال ${field.label_ar || field.label_en}...`}
                        value={dynamicFormData[field.id] || ''}
                        onChange={e => setDynamicFormData({ ...dynamicFormData, [field.id]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                <Button className="w-full h-12 text-base font-bold rounded-xl" onClick={goStep1Next} disabled={isLoading}>
                  {isLoading ? 'جاري الحفظ...' : 'التالي'}
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
                {isEditing && (
                  <button
                    type="button"
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      const snap = snapshotRef.current
                      if (snap) {
                        setDynamicFormData(snap.data)
                        setDocuments(snap.documents)
                        setWantsInsurance(snap.services.some(s => s.key === 'insurance'))
                        setWantsApplicationHelp(snap.services.some(s => s.key === 'applicationHelp'))
                        setWantsAppointment(snap.services.some(s => s.key === 'appointmentBooking'))
                      }
                      setIsEditing(false)
                    }}
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>
            )}

            {/* ─── الخطوة 2: الخدمات المدفوعة ─── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsInsurance} onChange={e => setWantsInsurance(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">تأمين السفر</p>
                      <p className="text-xs text-gray-400">تأمين صحي للسفر</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{money(SERVICE_PRICING.insurance)}</span>
                  </label>
                  {wantsInsurance && (
                    <div className="px-3 space-y-2">
                      <Input placeholder="الدولة" value={insuranceCountry} onChange={e => setInsuranceCountry(e.target.value)} className="h-10 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="تاريخ البداية" value={insuranceStart} onChange={e => setInsuranceStart(e.target.value)} className="h-10 text-sm" />
                        <Input placeholder="تاريخ النهاية" value={insuranceEnd} onChange={e => setInsuranceEnd(e.target.value)} className="h-10 text-sm" />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsApplicationHelp} onChange={e => setWantsApplicationHelp(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">مساعدة في التقديم</p>
                      <p className="text-xs text-gray-400">مساعدة في إعداد المستندات</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{money(SERVICE_PRICING.applicationHelp)}</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsAppointment} onChange={e => setWantsAppointment(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">حجز موعد</p>
                      <p className="text-xs text-gray-400">حجز موعد مع المستشار</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{money(SERVICE_PRICING.appointmentBooking)}</span>
                  </label>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">الإجمالي</span>
                  <span className="text-lg font-bold text-blue-600">{money(totalAmount)}</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStep(1)}>رجوع</Button>
                  <Button className="flex-1 h-12 text-base font-bold rounded-xl" onClick={goStep2Next} disabled={isLoading}>
                    {isLoading ? 'جاري الحفظ...' : 'التالي'}
                    <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── الخطوة 3: الوثائق ─── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">ارفع صورة من جواز السفر أو أي وثيقة مطلوبة. مطلوب وثيقة واحدة على الأقل.</p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 shrink-0" /> قبل الرفع تأكد من:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-0.5 list-disc pr-5">
                    <li>الصورة واضحة وغير مهزوزة</li>
                    <li>الإضاءة جيدة بدون وميض على الصفحة</li>
                    <li>الوثيقة كاملة وكل الأركان الأربعة ظاهرة</li>
                    <li>الكتابة والأرقام مقروءة بوضوح</li>
                    <li>الصورة غير مائلة</li>
                  </ul>
                </div>

                {documents.map(doc => (
                  <div key={doc.path} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm truncate">{doc.name}</span>
                    {doc.ocr?.quality === 'checking' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                        <Loader2 className="w-3 h-3 animate-spin" /> قيد القراءة...
                      </span>
                    )}
                    {doc.ocr?.quality === 'clear' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> واضحة ومقروءة
                      </span>
                    )}
                    {doc.ocr?.quality === 'unclear' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 shrink-0">
                        <Info className="w-3.5 h-3.5" /> غير واضحة
                      </span>
                    )}
                    <button onClick={() => setDocuments(prev => prev.filter(d => d.path !== doc.path))}>
                      <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) onAddDocument(f)
                    }}
                  />
                  {uploadingDoc ? (
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">رفع وثيقة</span>
                    </>
                  )}
                </label>

                <div className="flex gap-3">
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStep(2)}>رجوع</Button>
                  <Button className="flex-1 h-12 text-base font-bold rounded-xl" onClick={goStep3Next} disabled={isLoading}>
                    {isLoading ? 'جاري الحفظ...' : 'التالي'}
                    <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── الخطوة 4: المراجعة والتأكيد ─── */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 mb-2">مراجعة الطلب</h3>

                  {selectedServices.map(s => (
                    <div key={s.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="flex-1 text-sm">{s.label}</span>
                      <span className="text-sm font-bold text-blue-600">{money(s.amount)}</span>
                    </div>
                  ))}

                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-lg font-bold">الإجمالي</span>
                    <span className="text-lg font-bold text-blue-600">{money(totalAmount)}</span>
                  </div>
                </div>

                {!isEditing && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      الدفع سيتم لاحقًا بعد مراجعة الإدارة لطلبك. سيصلك إشعار عند قبول طلبك مع تعليمات الدفع.
                    </p>
                  </div>
                )}

                {!isEditing && (
                  <p className="text-center text-xs text-gray-400">
                    بالنقر على تأكيد، أنت توافق على شروط الاستخدام وسياسة الخصوصية
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStep(3)}>رجوع</Button>
                  <Button
                    className="flex-1 h-12 text-base font-bold rounded-xl"
                    onClick={isEditing ? onUpdateSubmit : onConfirm}
                    disabled={isLoading}
                  >
                    {isEditing
                      ? (isLoading ? 'جاري التحديث...' : 'تحديث الطلب')
                      : (isLoading ? 'جاري التأكيد...' : 'تأكيد الطلب')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
