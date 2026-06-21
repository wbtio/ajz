'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeaderAction {
  label: string
  href: string
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: SectionHeaderAction
  dark?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  dark = false,
  className,
}: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="max-w-2xl">
        <motion.h2
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'text-2xl sm:text-3xl lg:text-[2.25rem] font-black leading-[1.15] text-balance',
            dark ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'mt-2.5 text-[0.95rem] sm:text-base leading-relaxed max-w-xl text-pretty',
              dark ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {action && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={action.href}
            className={cn(
              'group inline-flex items-center gap-2 self-start sm:self-auto text-sm font-bold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000] rounded-sm',
              dark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-700 hover:text-[#8B0000]',
            )}
          >
            {action.label}
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-200 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
