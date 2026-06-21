'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { WorldMap } from '@/components/ui/world-map'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'

const EASE_QUINT = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function HeroSection() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_QUINT },
    },
  }

  const ctas = [
    {
      label: t.homepage.hero.ctaCooperation,
      href: '/contact?subject=cooperation',
      icon: 'solar:handshake-bold-duotone',
    },
    {
      label: t.homepage.hero.ctaParticipation,
      href: '/events',
      icon: 'solar:globus-bold-duotone',
    },
  ]

  const statsItems: StatsBarItem[] = [
    { value: Number(t.homepage.hero.statPartnerCountriesVal), label: t.homepage.hero.statPartnerCountriesLabel, suffix: '+' },
    { value: Number(t.homepage.hero.statActivePartnersVal), label: t.homepage.hero.statActivePartnersLabel, suffix: '+' },
    { value: Number(t.homepage.hero.statJointInitiativesVal), label: t.homepage.hero.statJointInitiativesLabel, suffix: '+' },
    { value: Number(t.homepage.hero.statYouthBeneficiariesVal), label: t.homepage.hero.statYouthBeneficiariesLabel, suffix: '+' },
  ]

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative min-h-[420px] lg:min-h-[480px] bg-[#0b1426] text-white overflow-hidden flex flex-col justify-between"
      data-purpose="hero"
    >
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[#0b1426]">
        <div className="lg:hidden absolute inset-0 flex items-center justify-center opacity-55 translate-y-[30px]">
          <WorldMap className="w-[130vw] max-w-[640px] scale-95" viewBox="120 50 530 180" aspectClass="aspect-[530/180]" />
        </div>
        <div className="hidden lg:flex absolute inset-y-0 end-[-15%] start-[35%] xl:start-[40%] items-center justify-center opacity-95 translate-y-[10px] xl:translate-y-[20px]">
          <WorldMap className="w-[950px] xl:w-[1200px] max-w-none scale-100" viewBox="120 50 530 180" aspectClass="aspect-[530/180]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#0b1426] via-[#0b1426]/95 lg:via-[#0b1426]/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b1426] to-[#0b1426]/0 pointer-events-none" />
      </div>

      <Container className="relative z-10 max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-grow flex items-center pt-24 pb-4 lg:pt-32 lg:pb-6">
        <motion.div
          variants={containerVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="max-w-3xl text-start"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.15] tracking-tight mb-3 text-balance"
          >
            {t.homepage.hero.title}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-300 mb-5 leading-relaxed max-w-2xl text-pretty"
          >
            {t.homepage.hero.description}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className="group/action inline-flex items-center gap-2.5 py-2.5 px-4 bg-white/[0.06] rounded-jaz border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <Icon icon={cta.icon} className="w-5 h-5 text-white shrink-0" />
                <span className="font-bold text-sm">{cta.label}</span>
                <svg
                  className={`w-4 h-4 text-white/60 shrink-0 transition-all duration-300 ${isRTL ? 'rotate-180' : ''} group-hover/action:text-white group-hover/action:translate-x-0.5 rtl:group-hover/action:-translate-x-0.5`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      <StatsBar items={statsItems} overlap={false} className="relative z-10 w-full" />
    </section>
  )
}
