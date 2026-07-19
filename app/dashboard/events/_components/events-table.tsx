'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { englishDisplayText } from '@/lib/english-only'
import type { Event } from '@/lib/database.types'
import { useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EventsTableProps {
  initialEvents: Event[]
  totalFiltered: number
  currentPage: number
  totalPages: number
  from: number
}

export function EventsTable({
  initialEvents,
  totalFiltered,
  currentPage,
  totalPages,
  from,
}: EventsTableProps) {
  const events = initialEvents
  const searchParams = useSearchParams()

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    const queryString = params.toString()
    return queryString ? `/dashboard/events?${queryString}` : '/dashboard/events'
  }

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader className="border-b border-slate-55 pb-4">
        <h2 className="text-lg font-bold text-gray-900">All Events</h2>
      </CardHeader>
      <CardContent className="pt-6">
        {events.length > 0 ? (
          <>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-105 border border-slate-100">
                            {event.image_url ? (
                              <Image src={event.image_url} alt="" fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700">
                                <Calendar className="h-5 w-5 text-white/70" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/dashboard/events/${event.id}`}>
                              <p className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">
                                {englishDisplayText(event.title)}
                              </p>
                            </Link>
                            {englishDisplayText(event.sub_sector || event.sector, '') && (
                              <p className="text-xs text-slate-400 mt-0.5">{englishDisplayText(event.sub_sector || event.sector, '')}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{formatDate(event.date)}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {[englishDisplayText(event.location, ''), englishDisplayText(event.country, '')].filter(Boolean).join(', ') || '—'}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const config = (event.conference_config || {}) as {
                            workflow?: { step2?: { status?: string }; step3?: { status?: string }; step4?: { status?: string } }
                          }
                          const workflow = config.workflow
                          let completedSteps = 0

                          // Step 1: Registration
                          if (event.status === 'published' || event.status === 'completed' || event.status === 'draft') {
                            completedSteps = 1
                          }
                          // Step 2: Design
                          if (workflow?.step2?.status === 'completed') completedSteps = 2
                          // Step 3: Publishing
                          if (workflow?.step3?.status === 'completed') completedSteps = 3
                          // Step 4: Leads
                          if (workflow?.step4?.status === 'completed') completedSteps = 4

                          const percentage = (completedSteps / 4) * 100
                          
                          return (
                            <div className="min-w-[130px] space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-bold">Step {completedSteps} of 4</span>
                                <span className="font-semibold text-indigo-650">{percentage}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-50">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    completedSteps === 4 ? 'bg-gradient-to-l from-emerald-500 to-teal-400' : 'bg-gradient-to-l from-indigo-650 to-indigo-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-indigo-200 text-indigo-650 hover:bg-indigo-50 hover:text-indigo-700 text-xs flex items-center gap-1.5"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {from + 1}-{Math.min(from + events.length, totalFiltered)} of {totalFiltered}
              </p>
              <div className="flex items-center gap-2">
                <Link href={buildPageHref(currentPage - 1)} aria-disabled={currentPage <= 1}>
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} className="h-9 text-xs">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                </Link>
                <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-slate-50 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Link href={buildPageHref(currentPage + 1)} aria-disabled={currentPage >= totalPages}>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="h-9 text-xs">
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="mb-4 text-slate-500 text-sm">No events match the current filters.</p>
            <Link href="/dashboard/events/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Add First Event
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
