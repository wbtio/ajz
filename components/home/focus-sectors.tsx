'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useMotionTemplate, useSpring, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'
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
    accent: '#b08d4b',
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
  index: number
}

function SectorCard({ sector, index }: SectorCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rawIconX = useMotionValue(0)
  const rawIconY = useMotionValue(0)

  const iconX = useSpring(rawIconX, { stiffness: 120, damping: 12 })
  const iconY = useSpring(rawIconY, { stiffness: 120, damping: 12 })

  const glow = useMotionTemplate`radial-gradient(120px circle at ${mouseX}px ${mouseY}px, ${sector.meta.accent}10, transparent 75%)`

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (shouldReduceMotion) return
    const { left, top, width } = currentTarget.getBoundingClientRect()
    const x = clientX - left
    const y = clientY - top
    mouseX.set(x)
    mouseY.set(y)

    const iconCenterX = width / 2
    const iconCenterY = 48
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
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      className="relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 lg:p-5 min-h-[130px] overflow-hidden transition-colors duration-300"
      style={{
        borderColor: !shouldReduceMotion && isHovered ? `${sector.meta.accent}40` : undefined,
      }}
    >
      <Link
        href={`/departments/${sector.slug}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
        aria-label={sector.title}
      />

      {/* Cursor glow */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl z-0"
          style={{ background: glow }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Icon */}
      <motion.div
        className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300"
        style={{
          backgroundColor: `${sector.meta.accent}0d`,
          color: sector.meta.accent,
          x: shouldReduceMotion ? 0 : iconX,
          y: shouldReduceMotion ? 0 : iconY,
        }}
      >
        <Icon icon={sector.meta.icon} className="w-5 h-5" />
      </motion.div>

      {/* Title */}
      <h3
        className="relative z-10 font-extrabold text-slate-900 text-sm lg:text-base leading-snug mb-1.5 transition-colors duration-300"
        style={{ color: isHovered ? sector.meta.accent : undefined }}
      >
        {sector.title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-xs text-slate-600 leading-relaxed mt-auto text-pretty">
        {sector.description}
      </p>
    </motion.div>
  )
}

export function FocusSectors({ sectors = [] }: FocusSectorsProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'

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

  const displaySectors = staticSectors.map((s) => {
    const dbSector = sectors.find((db) => db.slug === s.slug)
    if (dbSector) {
      return {
        ...s,
        title: isRTL ? dbSector.name_ar || dbSector.name : dbSector.name || dbSector.name_ar,
        description: isRTL
          ? dbSector.description_ar || dbSector.description
          : dbSector.description || dbSector.description_ar,
      }
    }
    return s
  })

  return (
    <section className="bg-white py-4 lg:py-6" data-purpose="focus-sectors">
      <Container>
        <SectionHeader
          title={t.homepage.sectors.title}
          action={{ label: t.homepage.sectors.viewAll, href: '/departments' }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-4 lg:mt-5">
          {displaySectors.map((sector, index) => (
            <SectorCard key={sector.id} sector={sector} index={index} />
          ))}
        </div>
      </Container>
    </section>
  )
}
