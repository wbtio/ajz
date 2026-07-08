"use client";

import * as React from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

/** تقويم عربي بسيط (RTL) لاختيار تاريخ واحد — بدون تبعيات خارجية. */
export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(
    startOfMonth(selected ?? new Date())
  );

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { locale: ar });
    const end = endOfWeek(endOfMonth(month), { locale: ar });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const weekdays = React.useMemo(() => {
    const start = startOfWeek(new Date(), { locale: ar });
    return Array.from({ length: 7 }, (_, i) =>
      format(new Date(start.getTime() + i * 86400000), "EEEEEE", { locale: ar })
    );
  }, []);

  return (
    <div dir="rtl" className={cn("w-full select-none p-1", className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
          aria-label="الشهر السابق"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-stone-800">
          {format(month, "MMMM yyyy", { locale: ar })}
        </span>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
          aria-label="الشهر التالي"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {weekdays.map((w) => (
          <div
            key={w}
            className="flex h-7 items-center justify-center text-[11px] font-semibold text-stone-400"
          >
            {w}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const isSelected = selected && isSameDay(day, selected);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect?.(day)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors",
                !inMonth && "text-stone-300",
                inMonth && !isSelected && "text-stone-700 hover:bg-stone-100",
                isSelected &&
                  "bg-[#8b0000] font-bold text-white hover:bg-[#6d0000]",
                today && !isSelected && "font-bold text-[#8b0000]"
              )}
            >
              {format(day, "d", { locale: ar })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
