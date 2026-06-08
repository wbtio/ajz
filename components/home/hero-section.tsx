'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'

export function HeroSection() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  }

  const ctas = [
    {
      label: isRTL ? t.homepage.hero.ctaCooperation : t.homepage.hero.ctaCooperation,
      href: '/contact?subject=cooperation',
      className: 'bg-[#b5a36e] hover:bg-[#a2915f] text-white shadow-lg active:scale-[0.98]',
    },
    {
      label: isRTL ? t.homepage.hero.ctaParticipation : t.homepage.hero.ctaParticipation,
      href: '/events',
      className: 'bg-[#0a2142] hover:bg-[#081b37] border border-slate-700/60 text-white shadow-lg active:scale-[0.98]',
    },
    {
      label: isRTL ? t.homepage.hero.ctaPartner : t.homepage.hero.ctaPartner,
      href: '/contact?subject=partnership',
      className: 'bg-[#0d4d5a] hover:bg-[#0b3e49] text-white shadow-lg active:scale-[0.98]',
    },
    {
      label: isRTL ? t.homepage.hero.ctaInvitation : t.homepage.hero.ctaInvitation,
      href: '/invitation-support',
      className: 'bg-[#0a2142] hover:bg-[#081b37] border border-slate-700/60 text-white shadow-lg active:scale-[0.98]',
    },
  ]

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative min-h-[700px] bg-[#05142b] text-white overflow-hidden flex flex-col justify-between"
      data-purpose="hero"
    >
      {/* Background Image with Dark Blue Gradient Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* On mobile: cover background with lower opacity */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src="/hero-globe-bg.png"
            alt="World Globe Background"
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
        </div>
        
        {/* On desktop: positioned on the 'end' side (right in LTR, left in RTL) with high opacity and object-contain */}
        <div className="hidden lg:block absolute inset-y-0 end-0 start-1/2">
          <Image
            src="/hero-globe-bg.png"
            alt="World Globe Connection Map"
            fill
            priority
            className="object-contain object-center scale-105 opacity-80"
            sizes="50vw"
          />
        </div>
        
        {/* Gradients to blend it beautifully */}
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#05142b] via-[#05142b]/85 lg:via-[#05142b]/40 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05142b] to-transparent"></div>
      </div>

      <Container className="relative z-10 max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full flex-grow flex items-center py-20 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="max-w-3xl text-start"
        >
          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-6"
          >
            {t.homepage.hero.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl font-medium"
          >
            {t.homepage.hero.description}
          </motion.p>

          {/* CTA Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl"
          >
            {ctas.map((cta, index) => (
              <Button
                key={index}
                asChild
                className={`py-6 px-6 rounded-lg text-center font-bold text-sm transition-all duration-300 ${cta.className}`}
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      {/* Floating Executive Stats Bar */}
      <div
        className="relative z-10 w-full bg-[#0a2142]/90 backdrop-blur-md py-6 border-t border-white/10"
        data-purpose="statistics-bar"
      >
        <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-start divide-y md:divide-y-0 md:divide-x md:rtl:divide-x-reverse divide-white/10">
            {/* Stat 1: Years Experience */}
            <div className="flex flex-col items-center md:items-start px-4">
              <span className="text-3xl font-black text-white leading-none mb-1.5 flex items-center gap-1.5">
                <Icon icon="solar:medal-ribbons-star-bold-duotone" className="text-[#b5a36e] h-8 w-8 shrink-0" />
                {t.homepage.hero.statExpVal}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                {t.homepage.hero.statExpLabel}
              </span>
            </div>

            {/* Stat 2: Connecting the World */}
            <div className="flex flex-col items-center md:items-start px-6 md:px-8 py-4 md:py-0">
              <span className="text-xl font-black text-white leading-none mb-1.5 flex items-center gap-1.5">
                <Icon icon="solar:globus-bold-duotone" className="text-[#b5a36e] h-6 w-6 shrink-0" />
                {t.homepage.hero.statConnectingVal}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                {t.homepage.hero.statConnectingLabel}
              </span>
            </div>

            {/* Stat 3: Multi-sector Access */}
            <div className="flex flex-col items-center md:items-start px-6 md:px-8 py-4 md:py-0">
              <span className="text-xl font-black text-white leading-none mb-1.5 flex items-center gap-1.5">
                <Icon icon="solar:widget-5-bold-duotone" className="text-[#b5a36e] h-6 w-6 shrink-0" />
                {t.homepage.hero.statSectorsVal}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                {t.homepage.hero.statSectorsLabel}
              </span>
            </div>

            {/* Stat 4: Gov & Business Coordination */}
            <div className="flex flex-col items-center md:items-start px-6 md:px-8 py-4 md:py-0">
              <span className="text-xl font-black text-white leading-none mb-1.5 flex items-center gap-1.5">
                <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-[#b5a36e] h-6 w-6 shrink-0" />
                {t.homepage.hero.statGovVal}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                {t.homepage.hero.statGovLabel}
              </span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
