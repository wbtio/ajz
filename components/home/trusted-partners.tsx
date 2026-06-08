'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export function TrustedPartners() {
  const { t, locale, dir } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false

  const partners = [
    { label: 'MOT', name: 'Ministry of Trade' },
    { label: 'MOH', name: 'Ministry of Health' },
    { label: 'BCC', name: 'Baghdad Chamber' },
    { label: 'UOI', name: 'Union of Iraqi Univ.' },
    { label: 'BOC', name: 'Basra Chamber' },
    { label: 'NITC', name: 'National IT Center' },
    { label: 'IFC', name: 'Iraq Finance Corp' },
    { label: 'BCO', name: 'Basra Oil Co' }
  ]

  return (
    <div className="w-full text-start" data-purpose="trusted-partners">
      <h2 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.partners.title}
      </h2>
      
      <div className="grid grid-cols-4 gap-4">
        {partners.map((partner, index) => (
          <motion.div
            key={index}
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center mx-auto hover:border-[#8B0000]/30 hover:bg-white hover:shadow-sm transition-all duration-300 group cursor-pointer"
            title={partner.name}
          >
            <span className="text-[9px] font-black text-slate-500 group-hover:text-[#8B0000] transition-colors duration-300 font-mono tracking-tighter">
              {partner.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
