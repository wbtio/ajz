'use client'

import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

interface CalendarEvent {
  id: string | number
  title?: string
  date?: string | Date
  [key: string]: any
}

interface DashboardCalendarGridProps {
  events: CalendarEvent[]
  linkPrefix?: string
}

export function DashboardCalendarGrid({ events, linkPrefix = '/dashboard/events' }: DashboardCalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      if (!event.date) return false
      const eventDate = new Date(event.date)
      return isSameDay(day, eventDate)
    })
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-650" />
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-2.5 py-1 text-xs font-medium text-indigo-650 hover:bg-indigo-50 border rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b text-center bg-slate-50/30">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-xs font-semibold text-slate-500 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={idx}
              className={`min-h-[120px] bg-white p-2 flex flex-col justify-between ${
                isCurrentMonth ? 'text-slate-900' : 'text-slate-350'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday ? 'bg-indigo-650 text-white shadow-sm' : ''
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[85px] no-scrollbar">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`${linkPrefix}/${event.id}`}
                    className="block text-[10px] p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium truncate transition-colors border border-indigo-100"
                    title={event.title || 'Untitled'}
                  >
                    {event.title || 'Untitled'}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
