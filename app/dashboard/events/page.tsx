import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, Users, Globe, MapPin, Calendar, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EventsFilters } from './_components/events-filters'
import { StatsCards } from './_components/stats-cards'

export const metadata = {
  title: 'إدارة الفعاليات | JAZ Admin',
}

type SearchParams = {
  search?: string
  status?: string
  type?: string
  page?: string
}

const PAGE_SIZE = 10

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = (await searchParams) ?? {}

  const search = params.search?.trim() ?? ''
  const status = params.status?.trim() ?? ''
  const type = params.type?.trim() ?? ''
  const currentPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,title_ar.ilike.%${search}%,sector.ilike.%${search}%,sub_sector_ar.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (type) {
    query = query.eq('event_type', type)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: eventsData, count: filteredCount }, { data: allEventsData }] = await Promise.all([
    query.range(from, to),
    supabase.from('events').select('id,status,date'),
  ])

  const events = eventsData ?? []
  const allEvents = allEventsData ?? []
  const totalFiltered = filteredCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    total: allEvents.length,
    published: allEvents.filter((event) => event.status === 'published').length,
    completed: allEvents.filter((event) => event.status === 'completed').length,
    upcoming: allEvents.filter((event) => new Date(event.date) >= today).length,
  }

  const buildPageHref = (page: number) => {
    const qp = new URLSearchParams()

    if (search) qp.set('search', search)
    if (status) qp.set('status', status)
    if (type) qp.set('type', type)
    if (page > 1) qp.set('page', String(page))

    const queryString = qp.toString()
    return queryString ? `/dashboard/events?${queryString}` : '/dashboard/events'
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الفعاليات</h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فعالية
          </Button>
        </Link>
      </div>

      <StatsCards
        total={stats.total}
        published={stats.published}
        completed={stats.completed}
        upcoming={stats.upcoming}
      />

      <EventsFilters />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-900">جميع الفعاليات</h2>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الفعالية</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {event.image_url ? (
                                <Image src={event.image_url} alt="" fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                                  <Calendar className="h-5 w-5 text-white/60" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{event.title_ar || event.title}</p>
                              {(event.sub_sector_ar || event.sector) && (
                                <p className="text-xs text-gray-400">{event.sub_sector_ar || event.sector}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.event_type === 'international' ? (
                            <Badge className="gap-1 border border-blue-200 bg-blue-50 text-[10px] text-blue-700">
                              <Globe className="h-3 w-3" />
                              دولية
                            </Badge>
                          ) : (
                            <Badge className="gap-1 border border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                              <MapPin className="h-3 w-3" />
                              محلية
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{formatDate(event.date)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {[event.location_ar || event.location, event.country_ar || event.country].filter(Boolean).join('، ')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              event.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : event.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {event.status === 'published'
                              ? 'منشور'
                              : event.status === 'cancelled'
                                ? 'ملغي'
                                : event.status === 'completed'
                                  ? 'مكتمل'
                                  : 'مسودة'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/events/${event.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Users className="ml-2 h-4 w-4" />
                                التسجيلات
                              </Button>
                            </Link>
                            <div className="mx-1 h-4 w-px bg-gray-200"></div>
                            {event.html_content_url && (
                              <Link href={`/events/${event.id}/content`} target="_blank" title="عرض محتوى HTML">
                                <button className="p-2 text-gray-500 transition-colors hover:text-green-600">
                                  <FileText className="h-4 w-4" />
                                </button>
                              </Link>
                            )}
                            <Link href={`/events/${event.id}`} title="عرض الفعالية">
                              <button className="p-2 text-gray-500 transition-colors hover:text-blue-600">
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/dashboard/events/edit?id=${event.id}`} title="تعديل">
                              <button className="p-2 text-gray-500 transition-colors hover:text-blue-600">
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                            <button className="p-2 text-gray-500 transition-colors hover:text-red-600" title="حذف">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  عرض {from + 1} - {Math.min(from + events.length, totalFiltered)} من {totalFiltered}
                </p>
                <div className="flex items-center gap-2">
                  <Link href={buildPageHref(currentPage - 1)} aria-disabled={currentPage <= 1}>
                    <Button variant="outline" size="sm" disabled={currentPage <= 1}>
                      <ChevronRight className="ml-1 h-4 w-4" />
                      السابق
                    </Button>
                  </Link>
                  <span className="rounded-md border px-3 py-1 text-sm text-gray-700">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <Link href={buildPageHref(currentPage + 1)} aria-disabled={currentPage >= totalPages}>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>
                      التالي
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-500">لا توجد فعاليات مطابقة للفلاتر الحالية</p>
              <Link href="/dashboard/events/new">
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة أول فعالية
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
