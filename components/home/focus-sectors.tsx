'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import type { Sector } from '@/lib/database.types'

interface FocusSectorsProps {
  sectors?: Sector[]
}

const sectorMeta = {
  medical: {
    icon: 'solar:heart-bold-duotone',
    accent: '#b42318',
    bg: 'hover:border-[#b42318]/20 hover:bg-[#b42318]/5',
  },
  technology: {
    icon: 'solar:cpu-bold-duotone',
    accent: '#0f766e',
    bg: 'hover:border-[#0f766e]/20 hover:bg-[#0f766e]/5',
  },
  industrie: {
    icon: 'solar:city-bold-duotone',
    accent: '#b5a36e',
    bg: 'hover:border-[#b5a36e]/20 hover:bg-[#b5a36e]/5',
  },
  academia: {
    icon: 'solar:square-academic-cap-bold-duotone',
    accent: '#0c4a6e',
    bg: 'hover:border-[#0c4a6e]/20 hover:bg-[#0c4a6e]/5',
  },
}

export function FocusSectors({ sectors = [] }: FocusSectorsProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  // Fallback static sectors if DB is empty
  const staticSectors = [
    {
      id: 'medical',
      slug: 'medical',
      title: t.homepage.sectors.medicalTitle,
      description: t.homepage.sectors.medicalDesc,
      meta: sectorMeta.medical,
    },
    {
      id: 'technology',
      slug: 'technology',
      title: t.homepage.sectors.techTitle,
      description: t.homepage.sectors.techDesc,
      meta: sectorMeta.technology,
    },
    {
      id: 'industrie',
      slug: 'industrie',
      title: t.homepage.sectors.indTitle,
      description: t.homepage.sectors.indDesc,
      meta: sectorMeta.industrie,
    },
    {
      id: 'academia',
      slug: 'academia',
      title: t.homepage.sectors.acadTitle,
      description: t.homepage.sectors.acadDesc,
      meta: sectorMeta.academia,
    },
  ]

  // Map dynamic sectors from DB to get their corresponding styles
  const displaySectors = staticSectors.map(s => {
    const dbSector = sectors.find(db => db.slug === s.slug)
    if (dbSector) {
      return {
        ...s,
        title: isRTL ? dbSector.name_ar || dbSector.name : dbSector.name || dbSector.name_ar,
        description: isRTL ? dbSector.description_ar || dbSector.description : dbSector.description || dbSector.description_ar,
      }
    }
    return s
  })

  return (
    <div className="w-full text-start" data-purpose="focus-sectors">
      <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.sectors.title}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {displaySectors.map((sector, index) => (
          <motion.div
            key={sector.id}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={shouldReduceMotion ? {} : { y: -3, scale: 1.01 }}
            className={`border border-slate-200/60 p-5 rounded-xl bg-white text-center flex flex-col justify-between hover:shadow-md transition-all duration-300 min-h-[220px] ${sector.meta.bg} relative group`}
          >
            <Link href={`/departments/${sector.slug}`} className="absolute inset-0 z-10" aria-label={sector.title} />
            
            <div className="flex flex-col items-center">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${sector.meta.accent}10`, color: sector.meta.accent }}
              >
                <Icon icon={sector.meta.icon} className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-[13px] sm:text-[14px] leading-tight mb-2 group-hover:text-[#8B0000] transition-colors duration-300">
                {sector.title}
              </h3>
            </div>
            
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed mt-auto">
              {sector.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
