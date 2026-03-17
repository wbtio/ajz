'use client'

import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, HeartIcon as Heart, CpuIcon as Cpu } from 'lucide-animated'
import { Building2, GraduationCap } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Sector } from '@/lib/database.types'
import { useRef } from 'react'
import { mergeSectorWithContent } from '@/app/sectors/sector-content'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2: Building2 as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  Heart: Heart as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  Cpu: Cpu as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  GraduationCap: GraduationCap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
}

interface SectorsSectionProps {
  sectors: Sector[]
}

export function SectorsSection({ sectors }: SectorsSectionProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight
  const shouldReduceMotion = useReducedMotion()
  const mergedSectors = sectors
    .map((sector) => mergeSectorWithContent(sector))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [24, -18])
  const railScaleX = useTransform(scrollYProgress, [0.05, 0.9], shouldReduceMotion ? [1, 1] : [0.14, 1])
  const headerBeamX = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-22, 28])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
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
    visible: (index: number = 0) => ({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.65,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-28">
      <div className="home-grid-pattern absolute inset-0"></div>
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b0000] opacity-10 blur-[120px]"></div>
      <Container className="relative z-10">
        <motion.div
          style={{ y: contentY }}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7 lg:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#8b0000]/5 -z-10" />
          <div className="absolute inset-x-5 top-0 h-px overflow-hidden">
            <motion.div
              style={{ scaleX: railScaleX }}
              className={`h-full ${isRTL ? 'origin-right' : 'origin-left'} bg-gradient-to-r from-[#8b0000] via-cyan-400/80 to-transparent`}
            />
          </div>
          <motion.div
            style={{ x: headerBeamX }}
            className="pointer-events-none absolute inset-x-[18%] top-6 h-24 bg-[radial-gradient(circle,rgba(79,209,255,0.14),transparent_65%)] blur-3xl"
          />
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center sm:mb-14"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl">
              {t.sectors.title}
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t.sectors.subtitle}
            </p>
          </motion.div>

          {/* Sectors Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7"
          >
            {mergedSectors.map((sector, index) => {
              const IconComponent = iconMap[sector.icon || 'Building2'] || Building2
              return (
                <motion.div key={sector.id} variants={cardVariants} custom={index}>
                  <Link href={`/sectors/${sector.slug}`} className="block h-full">
                    <motion.div
                      whileHover={shouldReduceMotion ? { y: -8, scale: 1.01 } : { y: -10, scale: 1.012, rotate: index % 2 === 0 ? -0.35 : 0.35 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="group relative h-full overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-300 hover:border-white/80 hover:bg-white/80 hover:shadow-[0_24px_80px_rgba(139,0,0,0.12)]">
                        <CardContent className="relative flex h-full flex-col p-5 sm:p-6 lg:p-8">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50 z-10" />
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8b0000]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#8b0000]/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: shouldReduceMotion ? 0 : 0.08 }}
                            className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(139,0,0,0.08),_transparent_58%)]"
                          />
                          <div className={`flex items-start gap-4 sm:gap-6 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                            <motion.div
                              whileHover={shouldReduceMotion ? { scale: 1.08 } : { scale: 1.12, rotate: -8 }}
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8b0000]/6 transition-colors duration-300 group-hover:bg-[#8b0000] sm:h-14 sm:w-14"
                            >
                              <IconComponent
                                className="w-7 h-7 text-[#8b0000] group-hover:text-white transition-colors duration-300"
                              />
                            </motion.div>

                            <div className="flex flex-1 flex-col">
                              <h3 className="mb-2 text-lg font-bold text-slate-950 transition-colors group-hover:text-[#8b0000]">
                                {isRTL ? sector.name_ar : sector.name}
                              </h3>
                              <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-600 sm:text-base">
                                {isRTL ? sector.description_ar : sector.description}
                              </p>
                              <span className={`mt-auto inline-flex min-h-11 items-center text-sm font-semibold text-[#8b0000] ${isRTL ? 'self-end' : ''}`}>
                                {isRTL ? 'اكتشف المزيد' : 'Explore more'}
                                <Arrow className={`w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
