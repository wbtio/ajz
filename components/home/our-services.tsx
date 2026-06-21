'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'

const SERVICE_ICONS = [
  'solar:globus-bold-duotone',
  'solar:users-group-two-rounded-bold-duotone',
  'solar:letter-bold-duotone',
  'solar:handshake-bold-duotone',
  'solar:calendar-mark-bold-duotone',
  'solar:link-bold-duotone',
  'solar:compass-bold-duotone',
  'solar:shield-user-bold-duotone',
]

export function OurServices() {
  const { t } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false

  const services = (t.homepage.services.items ?? []).slice(0, 4)
  const half = Math.ceil(services.length / 2)

  return (
    <section
      className="relative bg-[#0b1426] text-white py-4 lg:py-6 overflow-hidden"
      data-purpose="our-services"
    >
      <Container className="relative">
        <SectionHeader
          title={t.homepage.services.title}
          action={{ label: t.homepage.services.viewAll, href: '/services' }}
          dark
        />

        <ul className="grid grid-cols-1 md:grid-cols-2 mt-4 lg:mt-5">
          {services.map((service, index) => {
            const isOdd = index % 2 === 0
            const isLastMobile = index === services.length - 1
            const isLastRowDesktop = index >= services.length - 2
            return (
              <motion.li
                key={index}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (index % half) * 0.05 }}
                className={[
                  'group relative flex items-center gap-4 px-2 py-2.5 lg:px-3 lg:py-3',
                  'border-b border-white/10 transition-colors duration-300 group-hover:bg-white/[0.02]',
                  isOdd ? 'md:border-e md:border-white/10' : '',
                  isLastMobile ? 'border-b-0' : '',
                  isLastRowDesktop ? 'md:border-b-0' : '',
                ].join(' ')}
              >
                <Link
                  href="/services"
                  className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8B0000]"
                  aria-label={service}
                />

                {/* Icon */}
                <span className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/10 text-slate-300 transition-all duration-300 group-hover:bg-[#8B0000] group-hover:border-[#8B0000] group-hover:text-white">
                  <Icon icon={SERVICE_ICONS[index % SERVICE_ICONS.length]} className="w-5 h-5" />
                </span>

                {/* Label */}
                <span className="flex-1 text-sm sm:text-base font-bold text-slate-100 leading-snug transition-colors duration-300 group-hover:text-white">
                  {service}
                </span>

                {/* Arrow */}
                <svg
                  className="w-4 h-4 shrink-0 text-white/45 transition-all duration-300 rtl:rotate-180 group-hover:text-[#c0392b] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
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
              </motion.li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
