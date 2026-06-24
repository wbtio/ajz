'use client'

import { useEffect, useState } from 'react'
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
    watermark: 'solar:medical-kit-bold-duotone',
    accent: '#b42318',
  },
  technology: {
    icon: 'solar:cpu-bold-duotone',
    watermark: 'solar:code-bold-duotone',
    accent: '#0f766e',
  },
  industrie: {
    icon: 'solar:city-bold-duotone',
    watermark: 'solar:buildings-bold-duotone',
    accent: '#b08d4b',
  },
  academia: {
    icon: 'solar:square-academic-cap-bold-duotone',
    watermark: 'solar:book-bookmark-bold-duotone',
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
      watermark: string
      accent: string
    }
  }
  index: number
}

function SectorDecoration({ slug, accent }: { slug: string; accent: string }) {
  switch (slug) {
    case 'medical':
      return (
        <svg
          className="absolute bottom-0 left-0 w-full h-20 pointer-events-none"
          viewBox="0 0 280 80"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,40 L50,40 L55,40 L60,20 L66,60 L72,10 L78,55 L84,40 L130,40 L135,40 L140,25 L146,55 L152,40 L200,40 L205,40 L210,28 L216,52 L222,40 L280,40"
            stroke={accent}
            strokeWidth="1.5"
            opacity="0.14"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )
    case 'technology':
      return (
        <svg
          className="absolute bottom-0 left-0 w-full h-20 pointer-events-none"
          viewBox="0 0 280 80"
          preserveAspectRatio="none"
          fill="none"
        >
          <path d="M20,70 L20,45 L65,45 L65,20 L90,20" stroke={accent} strokeWidth="1" opacity="0.14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M110,70 L110,30 L165,30" stroke={accent} strokeWidth="1" opacity="0.14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M210,60 L210,25 L255,25" stroke={accent} strokeWidth="1" opacity="0.14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <circle cx="20" cy="70" r="2.5" fill={accent} opacity="0.18" />
          <circle cx="65" cy="20" r="2.5" fill={accent} opacity="0.18" />
          <circle cx="110" cy="70" r="2.5" fill={accent} opacity="0.18" />
          <circle cx="165" cy="30" r="2.5" fill={accent} opacity="0.18" />
          <circle cx="210" cy="60" r="2.5" fill={accent} opacity="0.18" />
          <circle cx="255" cy="25" r="2.5" fill={accent} opacity="0.18" />
        </svg>
      )
    case 'industrie':
      return (
        <svg
          className="absolute bottom-0 left-0 w-full h-16 pointer-events-none"
          viewBox="0 0 280 64"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,64 L0,48 L24,48 L24,36 L44,36 L44,48 L68,48 L68,26 L96,26 L96,40 L114,40 L114,22 L142,22 L142,44 L164,44 L164,32 L186,32 L186,44 L214,44 L214,38 L244,38 L244,44 L280,44 L280,64 Z"
            fill={accent}
            opacity="0.09"
          />
          <rect x="72" y="32" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="80" y="32" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="72" y="40" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="80" y="40" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="118" y="28" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="126" y="28" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="118" y="36" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="126" y="36" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="28" y="40" width="3" height="3" fill={accent} opacity="0.14" />
          <rect x="36" y="40" width="3" height="3" fill={accent} opacity="0.14" />
        </svg>
      )
    case 'academia':
      return (
        <svg
          className="absolute bottom-1 right-1 w-28 h-16 pointer-events-none"
          viewBox="0 0 120 70"
          fill="none"
        >
          <path
            d="M60,22 Q42,12 20,16 L20,52 Q42,47 60,57 Q78,47 100,52 L100,16 Q78,12 60,22 Z"
            fill={accent}
            opacity="0.08"
          />
          <path d="M60,22 L60,57" stroke={accent} strokeWidth="1" opacity="0.14" />
          <path d="M28,24 L52,20 M28,30 L52,26 M28,36 L52,32" stroke={accent} strokeWidth="0.8" opacity="0.12" strokeLinecap="round" />
          <path d="M68,20 L92,24 M68,26 L92,30 M68,32 L92,36" stroke={accent} strokeWidth="0.8" opacity="0.12" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function SectorCard({ sector, index }: SectorCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const shouldReduceMotion = mounted ? (prefersReducedMotion ?? false) : false
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rawIconX = useMotionValue(0)
  const rawIconY = useMotionValue(0)

  const iconX = useSpring(rawIconX, { stiffness: 120, damping: 12 })
  const iconY = useSpring(rawIconY, { stiffness: 120, damping: 12 })

  const glow = useMotionTemplate`radial-gradient(120px circle at ${mouseX}px ${mouseY}px, ${sector.meta.accent}10, transparent 75%)`

  useEffect(() => {
    setMounted(true)
  }, [])

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

      {/* Static accent wash */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl z-0"
        style={{ background: `linear-gradient(135deg, ${sector.meta.accent}0a 0%, transparent 55%)` }}
      />

      {/* Watermark icon */}
      <Icon
        icon={sector.meta.watermark}
        className="absolute -bottom-3 -right-3 w-24 h-24 pointer-events-none z-0"
        style={{ color: sector.meta.accent, opacity: 0.05 }}
      />

      {/* Sector-specific decoration */}
      <SectorDecoration slug={sector.slug} accent={sector.meta.accent} />

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
