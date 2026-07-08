import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { formatDate } from '@/lib/utils'
import { filterVisibleEvents } from '@/lib/events-visibility'
import {
  Ticket, Pencil, MapPin, Calendar, ArrowLeft, Clock, CheckCircle2,
  XCircle, FileText, Sparkles,
} from 'lucide-react'

export const metadata = {
  title: 'حسابي | JAZ',
  robots: { index: false, follow: false },
}

const POSITION_LABELS: Record<string, string> = {
  owner: 'مالك',
  authorized_manager: 'مدير مفوّض',
  employee: 'موظف',
  other: 'أخرى',
}

const LOCKED_STATUSES = ['confirmed', 'approved', 'rejected', 'attended', 'cancelled', 'completed']

type StatusMeta = { label: string; cls: string; Icon: typeof Clock }

function statusMeta(status: string | null, step: number): StatusMeta {
  if (step < 5) return { label: 'غير مكتمل', cls: 'bg-slate-100 text-slate-600', Icon: FileText }
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
    case 'approved':
      return { label: 'مقبول', cls: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 }
    case 'attended':
      return { label: 'تم الحضور', cls: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 }
    case 'rejected':
      return { label: 'مرفوض', cls: 'bg-red-50 text-red-600', Icon: XCircle }
    case 'cancelled':
      return { label: 'ملغى', cls: 'bg-red-50 text-red-600', Icon: XCircle }
    default:
      return { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-600', Icon: Clock }
  }
}

function money(n: number | null) {
  if (!n || n <= 0) return null
  return `${Number(n).toLocaleString('ar')} د.ع`
}

function initials(name: string | null, email: string) {
  const src = (name && name.trim()) || email.split('@')[0] || ''
  const parts = src.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '؟'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account')

  const [{ data: profile }, { data: regs }, { data: sectors }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('registrations')
      .select('*, events(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('sectors').select('*').eq('is_active', true),
  ])

  const registrations = (regs || []).filter((r) => r.events)
  const mySector = sectors?.find((s) => s.id === profile?.preferred_sector_id)

  // ── توصيات مخصّصة حسب قطاع المستخدم ──
  const registeredEventIds = new Set(registrations.map((r) => r.event_id))
  let recommended: NonNullable<typeof regs>[number]['events'][] = []
  if (profile?.preferred_sector_id) {
    const { data: sectorEvents } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .eq('sector_id', profile.preferred_sector_id)
      .order('date', { ascending: true })
      .limit(12)
    recommended = filterVisibleEvents(sectorEvents)
      .filter((e) => !registeredEventIds.has(e.id))
      .slice(0, 4)
  }

  const submittedCount = registrations.filter((r) => r.current_step >= 5).length
  const confirmedCount = registrations.filter(
    (r) => ['confirmed', 'approved', 'attended'].includes((r.status || '').toLowerCase()),
  ).length
  const draftCount = registrations.filter((r) => r.current_step < 5).length

  const name = profile?.full_name || (user.email?.split('@')[0] ?? 'مستخدم')

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-slate-50 pt-20 sm:pt-24 pb-14">
      <Container className="max-w-2xl">
        {/* ── بطاقة الملف (هادئة ومضغوطة) ── */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={name} width={44} height={44} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-slate-600">{initials(profile?.full_name ?? null, user.email ?? '')}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-900 truncate">{name}</h1>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <Link
              href="/account/edit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              تعديل
            </Link>
          </div>

          {/* شريط إحصائيات نحيف */}
          <div className="mt-4 flex items-center rounded-xl bg-slate-50 divide-x divide-x-reverse divide-slate-200">
            {[
              { label: 'طلباتي', value: submittedCount },
              { label: 'مقبولة', value: confirmedCount },
              { label: 'غير مكتملة', value: draftCount },
            ].map((s) => (
              <div key={s.label} className="flex-1 px-3 py-2 text-center">
                <span className="text-base font-bold text-slate-900">{s.value}</span>
                <span className="ms-1.5 text-[11px] text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* معلومات مضغوطة */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <Field label="الهاتف" value={profile?.phone} />
            <Field label="القطاع" value={mySector ? (mySector.name_ar || mySector.name_en || mySector.name) : null} />
            <Field label="التخصص الفرعي" value={profile?.sub_sector} />
            <Field label="الشركة" value={profile?.company_name} />
            <Field label="المنصب" value={profile?.company_position ? (POSITION_LABELS[profile.company_position] ?? profile.company_position) : null} />
            <Field label="المدينة" value={profile?.city} />
            <Field label="الدولة" value={profile?.country} />
          </div>
        </div>

        {/* ── طلباتي وتذاكري ── */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <Ticket className="w-4 h-4 text-[#8b0000]" />
          <h2 className="text-sm font-bold text-slate-900">طلباتي وتذاكري</h2>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
            <p className="text-sm font-bold text-slate-800">لا توجد تسجيلات بعد</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">تصفّح الفعاليات وسجّل في ما يناسبك</p>
            <Link href="/events" className="inline-flex items-center gap-1.5 rounded-lg bg-[#8b0000] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#a8201a]">
              تصفّح الفعاليات
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {registrations.map((reg) => {
              const ev = reg.events!
              const meta = statusMeta(reg.status, reg.current_step)
              const isDraft = reg.current_step < 5
              const canEdit = !isDraft && !LOCKED_STATUSES.includes((reg.status || '').toLowerCase())
              const total = money(reg.total_amount)
              return (
                <div key={reg.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">{ev.title_ar || ev.title}</h3>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        {ev.date && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(ev.date)}
                          </span>
                        )}
                        {(ev.location_ar || ev.location) && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {ev.location_ar || ev.location}
                          </span>
                        )}
                        {reg.ticket_number ? (
                          <span className="font-mono font-semibold text-slate-600">#{reg.ticket_number}</span>
                        ) : total ? (
                          <span className="font-semibold text-slate-600">{total}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}>
                        <meta.Icon className="w-2.5 h-2.5" />
                        {meta.label}
                      </span>
                      {isDraft ? (
                        <Link
                          href={`/events/${ev.id}/register`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#8b0000] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#a8201a]"
                        >
                          أكمل تسجيلك
                          <ArrowLeft className="w-3 h-3" />
                        </Link>
                      ) : canEdit ? (
                        <Link
                          href={`/events/${ev.id}/register?edit=1`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          <Pencil className="w-3 h-3" />
                          تعديل الطلب
                        </Link>
                      ) : (
                        <Link
                          href={`/events/${ev.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          عرض
                          <ArrowLeft className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── فعاليات مناسبة لك ── */}
        {recommended.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-[#8b0000]" />
              <h2 className="text-sm font-bold text-slate-900">فعاليات مناسبة لك</h2>
              {mySector && (
                <span className="text-[11px] text-slate-400 truncate">
                  · {mySector.name_ar || mySector.name_en || mySector.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recommended.map((ev) => ev && (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="group flex gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-slate-300"
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {ev.image_url && (
                      <Image src={ev.image_url} alt={ev.title_ar || ev.title || ''} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{ev.title_ar || ev.title}</h3>
                    {ev.date && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        {formatDate(ev.date)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-slate-800 truncate">{value || '—'}</p>
    </div>
  )
}
