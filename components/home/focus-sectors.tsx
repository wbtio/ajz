'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useMotionTemplate, useSpring, useReducedMotion } from 'framer-motion'
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
  },
  technology: {
    icon: 'solar:cpu-bold-duotone',
    accent: '#0f766e',
  },
  industrie: {
    icon: 'solar:city-bold-duotone',
    accent: '#b5a36e',
  },
  academia: {
    icon: 'solar:square-academic-cap-bold-duotone',
    accent: '#0c4a6e',
  },
}

interface SectorCardProps {
  sector: {
    id: string
    slug: string
    title: string
    description: string | null
    meta: {
      icon: string
      accent: string
    }
  }
}

function SectorCard({ sector }: SectorCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false
  const [isHovered, setIsHovered] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rawIconX = useMotionValue(0)
  const rawIconY = useMotionValue(0)
  
  const iconX = useSpring(rawIconX, { stiffness: 120, damping: 12 })
  const iconY = useSpring(rawIconY, { stiffness: 120, damping: 12 })

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (shouldReduceMotion) return
    const { left, top, width } = currentTarget.getBoundingClientRect()
    const x = clientX - left
    const y = clientY - top
    mouseX.set(x)
    mouseY.set(y)
    
    // Magnetic pull towards cursor relative to icon's approximate center (center of card horizontally, ~44px down)
    const iconCenterX = width / 2
    const iconCenterY = 44
    const deltaX = x - iconCenterX
    const deltaY = y - iconCenterY
    
    const maxPull = 6
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance > 0) {
      const pullFactor = Math.min(maxPull / distance, 0.1)
      rawIconX.set(deltaX * pullFactor)
      rawIconY.set(deltaY * pullFactor)
    }
  }

  function handleMouseLeave() {
    setIsHovered(false)
    rawIconX.set(0)
    rawIconY.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? {} : { y: -3 }}
      className="sector-card-crimson border border-slate-200/60 p-5 rounded-xl bg-white text-center flex flex-col justify-between transition-all duration-300 min-h-[200px] relative group overflow-hidden"
      style={{
        borderColor: !shouldReduceMotion && isHovered ? `${sector.meta.accent}30` : undefined,
        boxShadow: !shouldReduceMotion && isHovered ? `0 8px 24px ${sector.meta.accent}05` : undefined
      }}
    >
      <Link href={`/departments/${sector.slug}`} className="absolute inset-0 z-10" aria-label={sector.title} />
      
      {/* Interactive Vector Grid & Glow Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl z-0 select-none">
        <svg 
          className="absolute inset-0 w-full h-full opacity-[0.03] stroke-slate-900 transition-opacity duration-300 group-hover:opacity-[0.06]" 
          width="100%" 
          height="100%"
        >
          <defs>
            <pattern id={`grid-${sector.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 18" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${sector.id})`} />
        </svg>
        
        {!shouldReduceMotion && (
          <motion.div
            className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
            style={{
              background: useMotionTemplate`radial-gradient(90px circle at ${mouseX}px ${mouseY}px, ${sector.meta.accent}08, transparent 80%)`
            }}
          />
        )}
      </div>

      <div className="flex flex-col items-center relative z-10">
        <motion.div 
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
          style={{ 
            backgroundColor: `${sector.meta.accent}08`, 
            color: sector.meta.accent,
            x: shouldReduceMotion ? 0 : iconX,
            y: shouldReduceMotion ? 0 : iconY
          }}
        >
          <Icon icon={sector.meta.icon} className="w-5.5 h-5.5" />
        </motion.div>
        
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight mb-2 group-hover:text-[#8B0000] transition-colors duration-300">
          {sector.title}
        </h3>
      </div>
      
      <p className="text-[12px] font-medium text-slate-600 leading-relaxed mt-auto relative z-10">
        {sector.description}
      </p>
    </motion.div>
  )
}

export function FocusSectors({ sectors = [] }: FocusSectorsProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'

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
      <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-200/60 pb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.sectors.title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displaySectors.map((sector) => (
          <SectorCard key={sector.id} sector={sector} />
        ))}
      </div>
    </div>
  )
}
