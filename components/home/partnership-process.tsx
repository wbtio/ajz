'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export function PartnershipProcess() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const steps = [
    {
      num: '01',
      title: t.homepage.process.discoverTitle,
      desc: t.homepage.process.discoverDesc,
    },
    {
      num: '02',
      title: t.homepage.process.connectTitle,
      desc: t.homepage.process.connectDesc,
    },
    {
      num: '03',
      title: t.homepage.process.collaborateTitle,
      desc: t.homepage.process.collaborateDesc,
    },
    {
      num: '04',
      title: t.homepage.process.growTitle,
      desc: t.homepage.process.growDesc,
    },
  ]

  return (
    <div className="w-full text-start" data-purpose="partnership-process">
      <h2 className="text-2xl font-black text-slate-900 mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.process.title}
      </h2>
      <p className="text-xs font-semibold text-slate-500 mb-10 pl-3.5">
        {t.homepage.process.subtitle}
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-start">
        {steps.map((step, index) => (
          <motion.div
            key={step.num}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="flex flex-col items-center md:items-start group"
          >
            {/* Timeline Progress Line */}
            <div className="w-full h-1 bg-slate-100 mb-4 relative rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 ${isRTL ? 'right-0' : 'left-0'} bg-[#0d4d5a] transition-all duration-500`}
                style={{ width: `${(index + 1) * 25}%` }}
              />
            </div>
            
            <span className="text-[10px] font-black text-slate-300 font-mono mb-1.5 select-none transition-colors duration-300 group-hover:text-[#0d4d5a]">
              {step.num}
            </span>
            
            <h4 className="font-extrabold text-[12px] text-slate-800 mb-2 uppercase tracking-wider group-hover:text-[#8B0000] transition-colors duration-300">
              {step.title}
            </h4>
            
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[20ch]">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
