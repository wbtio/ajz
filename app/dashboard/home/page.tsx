import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  LayoutGrid,
  Plus,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'لوحة التحكم | JAZ Admin',
}

type RegistrationFieldConfig = {
  id?: string
  label_ar?: string
  label_en?: string
}

type RegistrationUser = {
  full_name: string | null
  email: string | null
  avatar_url: string | null
} | null

type RegistrationEvent = {
  title: string | null
  title_ar: string | null
  registration_config: RegistrationFieldConfig[] | null
} | null

type RecentRegistration = {
  id: string
  status: string | null
  created_at: string | null
  additional_data: Record<string, unknown> | null
  users: RegistrationUser
  events: RegistrationEvent
}

type UpcomingEvent = {
  id: string
  title: string | null
  title_ar: string | null
  date: string
  location: string | null
  status: string | null
  image_url: string | null
  conference_config: any
}

type StatItem = {
  label: string
  value: number
  note: string
  href: string
  icon: LucideIcon
}

function getEventProgress(event: UpcomingEvent) {
  const config = event.conference_config || {}
  const workflow = config.workflow || {}
  
  // Step 1: Registration (Always completed once event exists)
  const step1 = true
  // Step 2: WhatsApp Leads (mapped from workflow step4)
  const step2 = workflow.step4?.status === 'completed'
  // Step 3: Design (mapped from workflow step2)
  const step3 = workflow.step2?.status === 'completed'
  // Step 4: Publishing & Promotion (mapped from workflow step3)
  const step4 = workflow.step3?.status === 'completed'
  // Step 5: Logistics & Bookings (mapped from workflow step5)
  const step5 = workflow.step5?.status === 'completed'

  const completedCount = [step1, step2, step3, step4, step5].filter(Boolean).length
  return {
    percentage: (completedCount / 5) * 100,
    completedCount,
    steps: [
      { name: 'التسجيل', completed: step1 },
      { name: 'العملاء', completed: step2 },
      { name: 'التصميم', completed: step3 },
      { name: 'الترويج', completed: step4 },
      { name: 'اللوجستيات', completed: step5 },
    ]
  }
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [
    eventsResult,
    usersResult,
    registrationsResult,
    sectorsResult,
    upcomingEventsResult,
    recentRegistrationsResult,
    eventsStatusResult,
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('sectors').select('*', { count: 'exact', head: true }),
    supabase
      .from('events')
      .select('id, title, title_ar, date, location, status, image_url, conference_config')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('registrations')
      .select(`
        id,
        status,
        created_at,
        additional_data,
        users:user_id (full_name, email, avatar_url),
        events:event_id (title, title_ar, registration_config)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('events').select('status'),
  ])

  const recentRegistrations = (recentRegistrationsResult.data || []) as unknown as RecentRegistration[]
  const upcomingEvents = (upcomingEventsResult.data || []) as UpcomingEvent[]

  const totalEvents = eventsStatusResult.data?.length || 0
  const activeEvents =
    eventsStatusResult.data?.filter((event) => event.status === 'published' || event.status === 'active').length || 0
  const draftEvents = eventsStatusResult.data?.filter((event) => event.status === 'draft').length || 0
  const completedEvents = eventsStatusResult.data?.filter((event) => event.status === 'completed').length || 0

  const stats: StatItem[] = [
    {
      label: 'القطاعات',
      value: sectorsResult.count || 0,
      note: 'إجمالي القطاعات المفعلة',
      href: '/dashboard/sectors',
      icon: LayoutGrid,
    },
    {
      label: 'الفعاليات',
      value: eventsResult.count || 0,
      note: 'كل الفعاليات في المنصة',
      href: '/dashboard/events',
      icon: Calendar,
    },
    {
      label: 'المستخدمون',
      value: usersResult.count || 0,
      note: 'عدد الحسابات المسجلة',
      href: '/dashboard/users',
      icon: Users,
    },
    {
      label: 'التسجيلات',
      value: registrationsResult.count || 0,
      note: 'إجمالي التسجيلات الواردة',
      href: '/dashboard/registrations',
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-4 text-start" dir="rtl" lang="ar">
      {/* Header — عنوان مضغوط بدون بانر ضخم */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">نظرة سريعة على الفعاليات والتسجيلات.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/events">
              كل الفعاليات
              <ArrowLeft className="ms-1.5 size-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/events/new">
              <Plus className="me-1.5 size-3.5" />
              فعالية جديدة
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI — بطاقات مسطّحة موحّدة الحجم */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30"
          >
            <stat.icon className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-none text-foreground tabular-nums">{stat.value}</p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="space-y-4">
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border p-4">
              <CardTitle className="text-sm font-bold">أحدث التسجيلات</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link href="/dashboard/registrations">
                  عرض الكل
                  <ArrowLeft className="ms-1 size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              {recentRegistrations.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getRegistrationInitial(registration)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-xs font-semibold text-foreground">
                            {registration.users?.full_name || 'مستخدم غير معروف'}
                          </p>
                          <StatusBadge status={registration.status} />
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {(registration.events?.title_ar || registration.events?.title || 'فعالية غير محددة').trim()}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatArabicDate(registration.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={FileText}
                  title="لا توجد تسجيلات حديثة"
                  description="ستظهر هنا آخر التسجيلات القادمة من صفحات الفعاليات."
                />
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border p-4">
              <CardTitle className="text-sm font-bold">مراحل تقدّم خطوات الفعاليات (Event Progress Pipeline)</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link href="/dashboard/events">
                  كل الفعاليات
                  <ArrowLeft className="ms-1 size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {upcomingEvents.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {upcomingEvents.map((event) => {
                    const progress = getEventProgress(event)
                    return (
                      <div key={event.id} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <Link href={`/dashboard/events/${event.id}`} className="hover:text-primary transition-colors">
                            <h4 className="text-xs font-bold text-foreground truncate max-w-[280px] md:max-w-[400px]">
                              {event.title_ar || event.title}
                            </h4>
                          </Link>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                            {progress.completedCount} / 5 خطوات
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-indigo-650 rounded-full transition-all duration-500" 
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>

                        {/* Steps Dots Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                          {progress.steps.map((st, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className={`size-2 rounded-full shrink-0 ${st.completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                              <span className={st.completed ? 'font-bold text-slate-700' : 'text-slate-400'}>{st.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyPanel
                  icon={Calendar}
                  title="لا توجد فعاليات نشطة"
                  description="ابدأ بإضافة فعالية جديدة لتظهر هنا في أنبوب خطوات التقدم."
                  ctaHref="/dashboard/events/new"
                  ctaLabel="إضافة فعالية"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-sm font-bold">حالة الفعاليات</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              <StatusRow label="نشطة / منشورة" count={activeEvents} total={totalEvents} tone="bg-emerald-500" />
              <StatusRow label="مسودة" count={draftEvents} total={totalEvents} tone="bg-amber-500" />
              <StatusRow label="مكتملة" count={completedEvents} total={totalEvents} tone="bg-sky-500" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === 'confirmed') {
    return (
      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="size-3.5" />
        مؤكد
      </Badge>
    )
  }

  if (status === 'cancelled') {
    return (
      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
        <XCircle className="size-3.5" />
        ملغي
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
      <Clock className="size-3.5" />
      قيد الانتظار
    </Badge>
  )
}



function StatusRow({
  label,
  count,
  total,
  tone,
}: {
  label: string
  count: number
  total: number
  tone: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: LucideIcon
  title: string
  description: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {ctaHref && ctaLabel ? (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

function getRegistrationInitial(registration: RecentRegistration) {
  const name = registration.users?.full_name || registration.users?.email || 'م'
  return name.trim().charAt(0).toUpperCase()
}

function formatArabicDate(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatArabicTime(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
