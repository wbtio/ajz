'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'

const SERVICE_ICONS = [
  'solar:globus-bold-duotone',
  'solar:handshake-bold-duotone',
  'solar:square-academic-cap-bold-duotone',
  'solar:calendar-mark-bold-duotone',
  'solar:link-bold-duotone',
  'solar:compass-bold-duotone',
  'solar:shield-user-bold-duotone',
]

export function OurServices() {
  const { t } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false

  const services = (t.homepage.services.items ?? []).slice(0, 3)
  const serviceAccents = ['#8B0000', '#16a34a', '#b08d4b']

  return (
    <section
      className="relative bg-[#f5f7fa] text-[#0f172a] py-6 lg:py-8 overflow-hidden"
      data-purpose="our-services"
    >
      <Container className="relative">
        <SectionHeader
          title={t.homepage.services.title}
          action={{ label: t.homepage.services.viewAll, href: '/services' }}
        />

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mt-6 lg:mt-8">
          {services.map((service, index) => {
            const isLead = index === 0
            return (
              <motion.li
                key={index}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className={[
                  'group relative overflow-hidden flex items-center gap-4 rounded-xl border border-slate-200 bg-white transition-all duration-300',
                  isLead
                    ? 'md:row-span-2 min-h-[190px] px-6 py-6 lg:px-8 lg:py-8'
                    : 'min-h-[88px] px-4 py-4 lg:px-5 lg:py-5',
                  'hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50',
                ].join(' ')}
              >
                <Link
                  href="/services"
                  className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8B0000]"
                  aria-label={service}
                />

                {/* Icon */}
                <span
                  className={[
                    'shrink-0 rounded-lg flex items-center justify-center border border-slate-200 transition-all duration-300 group-hover:text-white',
                    isLead ? 'w-14 h-14' : 'w-11 h-11',
                  ].join(' ')}
                  style={{
                    color: serviceAccents[index],
                    backgroundColor: `${serviceAccents[index]}18`,
                  }}
                >
                  <Icon icon={SERVICE_ICONS[index % SERVICE_ICONS.length]} className={isLead ? 'w-7 h-7' : 'w-5 h-5'} />
                </span>

                {/* Label */}
                <span className={[
                  'flex-1 text-slate-900 leading-snug transition-colors duration-300 group-hover:text-[#8B0000]',
                  isLead ? 'text-lg lg:text-2xl font-black' : 'text-sm sm:text-base font-bold',
                ].join(' ')}>
                  {service}
                </span>

                {/* Arrow */}
                <svg
                  className="w-4 h-4 shrink-0 text-slate-400 transition-all duration-300 rtl:rotate-180 group-hover:text-[#8B0000] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
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
