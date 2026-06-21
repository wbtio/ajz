import Link from 'next/link'
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
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="max-w-2xl">
        <span
          aria-hidden
          className="block w-10 h-1 rounded-full bg-[#8B0000] mb-3"
        />
        <h2
          className={cn(
            'text-2xl sm:text-3xl lg:text-[2.25rem] font-black leading-[1.15] text-balance',
            dark ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              'mt-2 text-[0.95rem] sm:text-base leading-relaxed max-w-xl',
              dark ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            'group inline-flex items-center gap-2 self-start sm:self-auto text-sm font-bold whitespace-nowrap transition-colors duration-200',
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
      )}
    </div>
  )
}
