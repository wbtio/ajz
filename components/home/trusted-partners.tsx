'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'

const PARTNERS = [
  { label: 'MOT', name: { ar: 'وزارة التجارة', en: 'Ministry of Trade' } },
  { label: 'MOH', name: { ar: 'وزارة الصحة', en: 'Ministry of Health' } },
  { label: 'BCC', name: { ar: 'غرفة بغداد', en: 'Baghdad Chamber' } },
  { label: 'UOI', name: { ar: 'اتحاد الجامعات', en: 'Union of Iraqi Univ.' } },
  { label: 'BOC', name: { ar: 'غرفة البصرة', en: 'Basra Chamber' } },
  { label: 'NITC', name: { ar: 'المركز الوطني للحاسبات', en: 'National IT Center' } },
  { label: 'IFC', name: { ar: 'هيئة التمويل', en: 'Iraq Finance Corp' } },
  { label: 'BCO', name: { ar: 'شركة نفط البصرة', en: 'Basra Oil Co' } },
]

export function TrustedPartners() {
  const { t, locale } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <section
      className="bg-white py-8 lg:py-12 border-t border-slate-100"
      data-purpose="trusted-partners"
    >
      <Container>
        <SectionHeader
          title={t.homepage.partners.title}
          subtitle={t.homepage.partners.subtitle}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 lg:gap-4 mt-6 lg:mt-8">
          {PARTNERS.map((partner, index) => (
            <motion.div
              key={index}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              title={partner.name[locale]}
              className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200/70 bg-white px-3 py-3.5 transition-colors duration-300 hover:border-[#8B0000]/30 hover:bg-[#8B0000]/[0.02]"
            >
              <span className="text-base font-extrabold tracking-tight text-slate-700 transition-colors duration-300 group-hover:text-[#8B0000]">
                {partner.label}
              </span>
              <span className="text-[10px] font-medium text-slate-400 leading-tight text-center transition-colors duration-300 group-hover:text-slate-500">
                {partner.name[locale]}
              </span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
