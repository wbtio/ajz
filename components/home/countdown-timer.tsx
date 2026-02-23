'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface CountdownTimerProps {
  targetDate: string
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate))
  const { t, locale } = useI18n()

  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center gap-1.5 invisible">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-blue-50 text-blue-700 min-w-[2.5rem] py-1 rounded-lg flex flex-col items-center border border-blue-100/50">
              <span className="text-sm font-black tabular-nums">00</span>
              <span className="text-[9px] font-bold text-blue-400 -mt-1">--</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (timeLeft.total <= 0) {
    return (
      <div className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full inline-block mb-3">
        {t.events.happening}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <div className="flex flex-col items-center">
        <div className="bg-blue-50 text-blue-700 min-w-[2.5rem] py-1 rounded-lg flex flex-col items-center border border-blue-100/50">
          <span className="text-sm font-black tabular-nums">{timeLeft.days}</span>
          <span className="text-[9px] font-bold text-blue-400 -mt-1">{t.time.day}</span>
        </div>
      </div>
      <span className="text-blue-200 font-bold mb-3">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-blue-50 text-blue-700 min-w-[2.5rem] py-1 rounded-lg flex flex-col items-center border border-blue-100/50">
          <span className="text-sm font-black tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold text-blue-400 -mt-1">{t.time.hour}</span>
        </div>
      </div>
      <span className="text-blue-200 font-bold mb-3">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-blue-50 text-blue-700 min-w-[2.5rem] py-1 rounded-lg flex flex-col items-center border border-blue-100/50">
          <span className="text-sm font-black tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold text-blue-400 -mt-1">{t.time.minute}</span>
        </div>
      </div>
      <span className="text-blue-200 font-bold mb-3">:</span>
      <div className="flex flex-col items-center">
        <div className="bg-blue-50 text-blue-700 min-w-[2.5rem] py-1 rounded-lg flex flex-col items-center border border-blue-100/50">
          <span className="text-sm font-black tabular-nums animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold text-blue-400 -mt-1">{locale === 'ar' ? 'ثانية' : 'sec'}</span>
        </div>
      </div>
    </div>
  )
}
