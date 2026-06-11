'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'

export function AboutClient() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  const statsItems: StatsBarItem[] = [
    {
      value: Number(t.about.statPartnerCountriesVal),
      label: t.about.statPartnerCountriesLabel,
      suffix: '+',
    },
    {
      value: Number(t.about.statActivePartnersVal),
      label: t.about.statActivePartnersLabel,
      suffix: '+',
    },
    {
      value: Number(t.about.statJointInitiativesVal),
      label: t.about.statJointInitiativesLabel,
      suffix: '+',
    },
    {
      value: Number(t.about.statYouthBeneficiariesVal),
      label: t.about.statYouthBeneficiariesLabel,
      suffix: '+',
    },
  ]

  const values = t.about.valuesItems || []
  const reachItems = t.about.reachItems || []

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0b1426] home-grid-pattern relative" dir={dir} lang={locale}>
      {/* Hero Section */}
      <section
        className="relative h-[360px] bg-black text-white overflow-hidden flex items-center"
        data-purpose="hero"
      >
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/about-hero-bg.png"
            alt="About JAZ Background"
            fill
            priority
            className="object-cover object-right opacity-60"
            sizes="100vw"
          />
          {/* Dark overlay matching HTML hero style */}
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black via-black/75 to-transparent"></div>
        </div>

        <Container className="relative z-10 w-full text-start px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight">
              {t.about.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-xl font-normal opacity-90">
              {t.about.sectionSubtitle}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Stats Bar */}
      <StatsBar items={statsItems} overlap={false} className="relative z-10 w-full" />

      {/* Main Bento Grid Section 1 - Identity & Operations */}
      <section className="py-8 bg-transparent">
        <Container className="px-6">
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-5"
          >
            {/* Who We Are (2 Columns) */}
            <motion.div variants={cardVariants} className="lg:col-span-2 h-full">
              <Card className="h-full border-[#0b1426]/10 rounded-[10px] hover:shadow-[0_12px_32px_rgba(15,23,42,0.04)] hover:border-[#0b1426]/20 transition-all duration-300 ease-out flex flex-col justify-between group">
                <CardContent className="p-5 text-start flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#0b1426]/5">
                      <div className="p-2 rounded-lg bg-[#0b1426]/5 text-[#0b1426] shrink-0">
                        <Icon icon="solar:info-square-bold-duotone" className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-[#0b1426] leading-none">
                        {t.about.whoWeAreTitle}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#43474d] font-normal">
                      {t.about.whoWeAreText}
                    </p>
                  </div>
                  {/* Decorative tag for layout rhythm */}
                  <div className="mt-4 flex justify-start">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold text-[#8b0000] bg-[#8b0000]/5 rounded-full uppercase tracking-wider">
                      <Icon icon="solar:shield-check-bold" className="w-3 h-3" />
                      Iraq Sovereign Platform
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mission & Vision (2 Columns) */}
            <motion.div variants={cardVariants} className="lg:col-span-2 h-full">
              <Card className="h-full border-[#0b1426]/10 rounded-[10px] hover:shadow-[0_12px_32px_rgba(15,23,42,0.04)] hover:border-[#0b1426]/20 transition-all duration-300 ease-out flex flex-col justify-between group">
                <CardContent className="p-5 text-start flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#0b1426]/5">
                      <div className="p-2 rounded-lg bg-[#0b1426]/5 text-[#0b1426] shrink-0">
                        <Icon icon="solar:compass-bold-duotone" className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-[#0b1426] leading-none">
                        {isRTL ? 'رسالتنا ورؤيتنا' : 'Mission & Vision'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
                      {/* Mission */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:target-bold-duotone" className="h-4.5 w-4.5 text-[#8B0000] shrink-0 animate-pulse" />
                          <h4 className="text-xs sm:text-sm font-bold text-[#0b1426]">{t.about.mission}</h4>
                        </div>
                        <p className="text-xs text-[#43474d] leading-relaxed font-normal">
                          {t.about.missionText}
                        </p>
                      </div>
                      
                      {/* Vision */}
                      <div className="space-y-2 border-t md:border-t-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#0b1426]/5 pt-4 md:pt-0 md:pl-6 rtl:md:pl-0 rtl:md:pr-6">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:eye-bold-duotone" className="h-4.5 w-4.5 text-[#16a34a] shrink-0" />
                          <h4 className="text-xs sm:text-sm font-bold text-[#0b1426]">{t.about.vision}</h4>
                        </div>
                        <p className="text-xs text-[#43474d] leading-relaxed font-normal">
                          {t.about.visionText}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Where We Operate (4 Columns - Horizontal layout on desktop) */}
            <motion.div variants={cardVariants} className="lg:col-span-4 h-full">
              <Card className="h-full border-[#0b1426]/10 rounded-[10px] hover:shadow-[0_12px_32px_rgba(15,23,42,0.04)] hover:border-[#0b1426]/20 transition-all duration-300 ease-out flex flex-col justify-between group">
                <CardContent className="p-5 text-start flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#0b1426]/5">
                      <div className="p-2 rounded-lg bg-[#0b1426]/5 text-[#0b1426] shrink-0">
                        <Icon icon="solar:map-point-bold-duotone" className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-[#0b1426] leading-none">
                        {t.about.whereWeOperate}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="relative md:col-span-3 w-full h-32 flex justify-center items-center overflow-hidden bg-white rounded-lg border border-[#0b1426]/5 p-1">
                        <Image
                          src="/iraq-map.png"
                          alt="Iraq Map Highlighting Erbil, Baghdad, and Basra"
                          fill
                          className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      </div>
                      
                      <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-start gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#16a34a] mt-1 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-[#0b1426] leading-none">{t.about.erbilTitle}</h4>
                            <p className="text-[10px] text-[#43474d] leading-normal mt-0.5">{t.about.erbilDesc}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#8B0000] mt-1 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-[#0b1426] leading-none">{t.about.baghdadTitle}</h4>
                            <p className="text-[10px] text-[#43474d] leading-normal mt-0.5">{t.about.baghdadDesc}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#0b1426] mt-1 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-[#0b1426] leading-none">{t.about.basraTitle}</h4>
                            <p className="text-[10px] text-[#43474d] leading-normal mt-0.5">{t.about.basraDesc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Main Bento Grid Section 2 - Values & Reach */}
      <section className="pb-10 bg-transparent">
        <Container className="px-6">
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-5"
          >
            {/* Our Values (2 Columns - Structured 2D grid of values) */}
            <motion.div variants={cardVariants} className="lg:col-span-2 h-full">
              <Card className="h-full border-[#0b1426]/10 rounded-[10px] hover:shadow-[0_12px_32px_rgba(15,23,42,0.04)] hover:border-[#0b1426]/20 transition-all duration-300 ease-out flex flex-col justify-between group">
                <CardContent className="p-5 text-start flex flex-col h-full">
                  <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#0b1426]/5">
                    <div className="p-2 rounded-lg bg-[#8B0000]/8 text-[#8B0000] shrink-0">
                      <Icon icon="solar:heart-bold-duotone" className="h-5 w-5 animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-[#0b1426] leading-none">
                      {t.about.ourValues}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 mt-1">
                    {values.map((val: any, idx: number) => {
                      const iconMapValue = [
                        { icon: 'solar:shield-check-bold-duotone', color: 'text-[#8b0000]' }, // Integrity
                        { icon: 'solar:medal-ribbons-star-bold-duotone', color: 'text-[#d6bc80]' }, // Excellence
                        { icon: 'solar:hand-stars-bold-duotone', color: 'text-[#0b1426]' }, // Collaboration
                        { icon: 'solar:lightbulb-bolt-bold-duotone', color: 'text-[#16a34a]' }, // Innovation
                        { icon: 'solar:graph-bold-duotone', color: 'text-[#8b0000]' }, // Impact
                      ][idx] || { icon: 'solar:star-bold-duotone', color: 'text-[#0b1426]' }

                      return (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className={cn("p-1 rounded bg-slate-50 flex items-center justify-center shrink-0 mt-0.5", iconMapValue.color)}>
                            <Icon icon={iconMapValue.icon} className="h-4.5 w-4.5" />
                          </div>
                          <div className="leading-tight">
                            <span className="font-extrabold text-[#0b1426] text-xs block mb-0.5">{val.title}</span>
                            <span className="text-[#43474d] text-[11px] leading-relaxed block">{val.desc}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Why JAZ (1 Column) */}
            <motion.div variants={cardVariants} className="lg:col-span-1 h-full">
              <Card className="h-full border-[#8B0000]/15 rounded-[10px] hover:shadow-[0_12px_32px_rgba(139,0,0,0.04)] hover:border-[#8B0000]/30 transition-all duration-300 ease-out flex flex-col justify-between group">
                <CardContent className="p-5 text-start flex flex-col h-full">
                  <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#8B0000]/10">
                    <div className="p-1.5 rounded-lg bg-[#8B0000]/8 text-[#8B0000] shrink-0">
                      <Icon icon="solar:help-bold-duotone" className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0b1426] leading-none">
                      {t.about.whyJaz}
                    </h3>
                  </div>
                  <div className="space-y-2 mt-1.5">
                    {(t.about.whyJazItems || []).map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Icon icon="solar:check-circle-bold-duotone" className="text-[#16a34a] h-4 w-4 shrink-0 mt-0.5" />
                        <span className="text-xs text-[#43474d] font-normal leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Nationwide Reach (1 Column) */}
            <motion.div variants={cardVariants} className="lg:col-span-1 h-full">
              <Card className="h-full border-[#0b1426]/10 rounded-[10px] hover:shadow-[0_12px_32px_rgba(15,23,42,0.04)] hover:border-[#0b1426]/20 transition-all duration-300 ease-out flex flex-col justify-between group">
                <CardContent className="p-5 text-start flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#0b1426]/5">
                      <div className="p-1.5 rounded-lg bg-[#0b1426]/5 text-[#0b1426] shrink-0">
                        <Icon icon="solar:chart-square-bold-duotone" className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0b1426] leading-none">
                        {t.about.nationwideReach}
                      </h3>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 space-y-2">
                        {reachItems.map((item: any, idx: number) => {
                          const statMapValue = [
                            { icon: 'solar:city-bold-duotone', color: 'text-[#8B0000]' },
                            { icon: 'solar:square-academic-cap-bold-duotone', color: 'text-[#0b1426]' },
                            { icon: 'solar:earth-bold-duotone', color: 'text-[#16a34a]' },
                            { icon: 'solar:users-group-two-rounded-bold-duotone', color: 'text-[#d6bc80]' },
                          ][idx] || { icon: 'solar:star-bold-duotone', color: 'text-[#0b1426]' }

                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <Icon icon={statMapValue.icon} className={cn("h-4.5 w-4.5 shrink-0 mt-0.5", statMapValue.color)} />
                              <div className="leading-tight">
                                <div className={cn("font-black text-xs sm:text-sm leading-none mb-0.5", statMapValue.color)}>
                                  {item.count}
                                </div>
                                <p className="text-[#43474d] text-[9px] font-semibold leading-none">{item.label}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="w-16 opacity-60 select-none pointer-events-none relative aspect-square shrink-0 group-hover:scale-105 group-hover:opacity-85 transition-all duration-500">
                        <Image
                          src="/iraq-map.png"
                          alt="Miniature Iraq Map"
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Footer CTA Container */}
      <footer className="pb-10 bg-transparent">
        <Container className="px-6">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#0b1426] rounded-[10px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white border border-[#8B0000]/15 shadow-lg relative overflow-hidden"
          >
            {/* Subtle light effect in the footer bg */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#8b0000]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#16a34a]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="text-start md:max-w-2xl relative z-10">
              <h3 className="text-base sm:text-lg font-bold mb-1 text-white leading-tight">
                {t.about.ctaTitle}
              </h3>
              <p className="text-xs text-white/60 font-normal">
                {t.about.ctaDesc}
              </p>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto shrink-0 justify-start relative z-10">
              <Button
                asChild
                className="px-5 py-1.5 bg-[#8B0000] text-white font-bold hover:bg-[#6B0000] rounded-[6px] transition-all duration-300 shadow-md active:scale-[0.98] text-xs shrink-0 h-9 border-0"
              >
                <Link href="/contact?subject=cooperation">
                  {t.about.ctaCooperation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-5 py-1.5 border border-white/20 text-white font-bold hover:bg-white/10 rounded-[6px] transition-all duration-300 text-xs shrink-0 h-9"
              >
                <Link href="/contact">
                  {t.about.ctaContact}
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </footer>
    </div>
  )
}

