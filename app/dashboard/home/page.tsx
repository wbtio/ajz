import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Settings,
  TrendingUp,
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
}

type StatItem = {
  label: string
  value: number
  note: string
  href: string
  icon: LucideIcon
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
      .select('id, title, title_ar, date, location, status, image_url')
      .gte('date', now)
      .order('date', { ascending: true })
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

  const recentRegistrations = (recentRegistrationsResult.data || []) as RecentRegistration[]
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
    <div className="space-y-8 text-start" dir="rtl" lang="ar">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary/80" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="space-y-5">
            <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground">
              مركز الإدارة
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">لوحة التحكم</h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                نظرة مركزة على الفعاليات والتسجيلات وأهم المؤشرات اليومية، بواجهة أوضح ومهيأة للعربية.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/events/new">
                  <Plus className="me-2 size-4" />
                  فعالية جديدة
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/events">
                  عرض كل الفعاليات
                  <ArrowLeft className="ms-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroMetric
              label="فعاليات نشطة"
              value={activeEvents}
              note="تعمل الآن أو منشورة"
              icon={TrendingUp}
            />
            <HeroMetric
              label="فعاليات قادمة"
              value={upcomingEvents.length}
              note="خلال الفترة القادمة"
              icon={Calendar}
            />
            <HeroMetric
              label="تسجيلات حديثة"
              value={recentRegistrations.length}
              note="أحدث ما وصل للمنصة"
              icon={FileText}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/25"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.note}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <stat.icon className="size-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">أحدث التسجيلات</CardTitle>
                <CardDescription>عرض مختصر لآخر التسجيلات في الفعاليات.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/registrations">
                  عرض الكل
                  <ArrowLeft className="ms-2 size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              {recentRegistrations.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {recentRegistrations.map((registration, index) => (
                    <div key={registration.id}>
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                                {getRegistrationInitial(registration)}
                              </div>
                              <div className="min-w-0 flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground">
                                    {registration.users?.full_name || 'مستخدم غير معروف'}
                                  </p>
                                  <StatusBadge status={registration.status} />
                                </div>
                                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                                  {registration.users?.email || 'بدون بريد إلكتروني'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="bg-background text-foreground">
                                    {(registration.events?.title_ar || registration.events?.title || 'فعالية غير محددة').trim()}
                                  </Badge>
                                  {getRegistrationPreviewEntries(registration).map((entry) => (
                                    <Badge key={`${registration.id}-${entry.label}`} variant="secondary" className="max-w-full">
                                      <span className="truncate">
                                        {entry.label}: {entry.value}
                                      </span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            {formatArabicDate(registration.created_at)}
                          </div>
                        </div>
                      </div>
                      {index < recentRegistrations.length - 1 ? <Separator className="mt-4" /> : null}
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

          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">الفعاليات القادمة</CardTitle>
                <CardDescription>جدول مبسط للفعاليات المجدولة للفترة القادمة.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/events">
                  الجدول الزمني
                  <ArrowLeft className="ms-2 size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              {upcomingEvents.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {upcomingEvents.map((event, index) => (
                    <Link
                      key={event.id}
                      href={`/dashboard/events/${event.id}`}
                      className="group block rounded-2xl border border-border bg-muted/20 p-4 transition-colors hover:border-primary/25 hover:bg-muted/35"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex min-h-16 min-w-16 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
                          {event.image_url ? (
                            <Image
                              src={event.image_url}
                              alt={event.title_ar || event.title || 'صورة الفعالية'}
                              width={64}
                              height={64}
                              className="size-16 object-cover"
                            />
                          ) : (
                            <Calendar className="size-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-foreground">
                            {event.title_ar || event.title}
                          </h4>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3.5" />
                              {formatArabicDate(event.date)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {formatArabicTime(event.date)}
                            </span>
                          </div>
                        </div>
                        <div className="flex size-9 items-center justify-center rounded-xl bg-background text-muted-foreground transition-colors group-hover:text-foreground">
                          <MoreHorizontal className="size-4" />
                        </div>
                      </div>
                      {index < upcomingEvents.length - 1 ? <Separator className="mt-4" /> : null}
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  icon={Calendar}
                  title="لا توجد فعاليات قادمة"
                  description="ابدأ بإضافة فعالية جديدة لتظهر هنا في الجدول القادم."
                  ctaHref="/dashboard/events/new"
                  ctaLabel="إضافة فعالية"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-border bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">إجراءات سريعة</CardTitle>
              <CardDescription className="text-white/70">وصول مباشر إلى أهم المهام اليومية.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <QuickActionLink href="/dashboard/events/new" icon={Plus} label="فعالية جديدة" />
              <QuickActionLink href="/dashboard/sectors" icon={LayoutGrid} label="القطاعات" />
              <QuickActionLink href="/dashboard/users" icon={Users} label="المستخدمون" />
              <QuickActionLink href="/dashboard/settings" icon={Settings} label="الإعدادات" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-semibold">حالة الفعاليات</CardTitle>
              <CardDescription>توزيع سريع لحالة الفعاليات داخل النظام.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 p-5">
              <StatusRow label="نشطة / منشورة" count={activeEvents} total={totalEvents} tone="bg-emerald-500" />
              <StatusRow label="مسودة" count={draftEvents} total={totalEvents} tone="bg-amber-500" />
              <StatusRow label="مكتملة" count={completedEvents} total={totalEvents} tone="bg-sky-500" />
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/30 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <AlertCircle className="size-4" />
              <span>آخر تحديث للبيانات: منذ دقيقة</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function HeroMetric({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: number
  note: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-background text-muted-foreground">
          <Icon className="size-4" />
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

function QuickActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-4 text-center transition-colors hover:bg-white/14"
    >
      <Icon className="size-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
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

function getRegistrationPreviewEntries(registration: RecentRegistration) {
  const additionalData = registration.additional_data

  if (!additionalData || typeof additionalData !== 'object') {
    return []
  }

  const config = Array.isArray(registration.events?.registration_config)
    ? registration.events?.registration_config
    : []

  return Object.entries(additionalData)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .slice(0, 2)
    .map(([key, value]) => {
      const field = config.find((item) => item.id === key)
      return {
        label: field?.label_ar || field?.label_en || key,
        value: String(value),
      }
    })
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
