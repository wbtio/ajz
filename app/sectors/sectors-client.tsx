'use client'

import { motion, useReducedMotion, Variants } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight } from 'lucide-animated'
import { Building2, GraduationCap } from 'lucide-react'
import { HeartIcon as Heart, CpuIcon as Cpu } from 'lucide-animated'
import type { Tables } from '@/lib/database.types'
import { useI18n } from '@/lib/i18n'
import { mergeSectorWithContent, getSectorContent } from './sector-content'

const sectorImageMap: Record<string, string> = {
  industrie: '/JAZ Industrie.svg',
  medical: '/JAZ Medical.svg',
  technology: '/JAZ Technology.svg',
  academia: '/JAZ Academia.svg',
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2: Building2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  Heart: Heart as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  Cpu: Cpu as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  GraduationCap: GraduationCap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
}

const neutralAccentPalette = ['#475569', '#64748b', '#6b7280', '#4b5563']

export function SectorsClient({ sectors }: { sectors: Tables<'sectors'>[] | null }) {
  const { locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight
  const shouldReduceMotion = useReducedMotion()
  const mergedSectors = (sectors || [])
    .map((sector) => mergeSectorWithContent(sector))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: (index: number = 0) => ({
      opacity: 0,
      y: 28,
      x: shouldReduceMotion ? 0 : (isRTL ? (index % 2 === 0 ? 18 : -18) : (index % 2 === 0 ? -18 : 18)),
      scale: 0.965,
    }),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <div className="bg-white pt-36 pb-14 sm:pb-16 lg:pb-20" dir={dir} lang={locale}>
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-10 text-center sm:mb-12"
        >
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl">
            {isRTL ? 'القطاعات' : 'Sectors'}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-5 lg:p-6"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {mergedSectors.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              dir="ltr"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-3"
            >
              {mergedSectors.map((sector, index) => {
                const accentColor = neutralAccentPalette[index % neutralAccentPalette.length]
                const sectorTitle = isRTL ? (sector.name_ar || sector.name) : (sector.name || sector.name_ar)

                const jazName = (() => {
                  if (!sectorTitle) return { prefix: 'JAZ', suffix: '' }
                  const parts = sectorTitle.split(' ')
                  if (parts[0]?.toLowerCase() === 'jaz') {
                    return { prefix: 'JAZ', suffix: parts.slice(1).join(' ') }
                  }
                  return { prefix: sectorTitle, suffix: '' }
                })()

                const sectorKey = getSectorContent(sector)?.key ?? ''
                const sectorImage = sectorImageMap[sectorKey] ?? null

                const titleBlock = (
                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <h3 className="text-xl font-bold leading-tight text-slate-950 sm:text-[1.35rem]">
                      <span className="block">{jazName.prefix}</span>
                      {jazName.suffix && <span className="block">{jazName.suffix}</span>}
                    </h3>
                  </div>
                )

                return (
                  <motion.div key={sector.id} variants={cardVariants} custom={index}>
                    <Link href={`/sectors/${sector.slug}`} className="block h-full">
                      <motion.div
                        whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Card dir={dir} lang={locale} className="group h-full rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                          <CardContent className="relative flex h-full min-h-[110px] flex-col p-3 text-start sm:min-h-[120px] sm:p-4">
                            {sectorImage && (
                              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.6rem]">
                                <Image
                                  src={sectorImage}
                                  alt=""
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-white/10" />
                              </div>
                            )}
                            <div className="relative mb-3 flex w-full min-w-0 items-start justify-between gap-3">
                              {titleBlock}
                            </div>

                            <span
                              className={`absolute bottom-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm transition-all duration-300 ${isRTL ? 'left-4' : 'right-4'}`}
                              style={{ color: accentColor }}
                            >
                              <Arrow className={`h-4 w-4 transition-all duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                            </span>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[1.75rem] border border-slate-200 bg-white/70 py-16 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
            >
              <p className="text-lg text-slate-500">{isRTL ? 'لا توجد قطاعات متاحة حالياً' : 'No sectors available at the moment'}</p>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  )
}
