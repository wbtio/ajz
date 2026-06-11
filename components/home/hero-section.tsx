'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { WorldMap } from '@/components/ui/world-map'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'

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
  ]

  const statsItems: StatsBarItem[] = [
    {
      value: Number(t.homepage.hero.statPartnerCountriesVal),
      label: t.homepage.hero.statPartnerCountriesLabel,
      suffix: '+',
    },
    {
      value: Number(t.homepage.hero.statActivePartnersVal),
      label: t.homepage.hero.statActivePartnersLabel,
      suffix: '+',
    },
    {
      value: Number(t.homepage.hero.statJointInitiativesVal),
      label: t.homepage.hero.statJointInitiativesLabel,
      suffix: '+',
    },
    {
      value: Number(t.homepage.hero.statYouthBeneficiariesVal),
      label: t.homepage.hero.statYouthBeneficiariesLabel,
      suffix: '+',
    },
  ]

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative min-h-[440px] lg:min-h-[480px] bg-[#05142b] text-white overflow-hidden flex flex-col justify-between"
      data-purpose="hero"
    >
      {/* Interactive World Map Connection Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[#05142b]">
        {/* On mobile: cover background centered with lower opacity, larger scale, and shifted down further */}
        <div className="lg:hidden absolute inset-0 flex items-center justify-center opacity-55 translate-y-[40px]">
          <WorldMap 
            className="w-[200vw] max-w-[1000px] scale-125" 
            viewBox="120 50 530 180" 
            aspectClass="aspect-[530/180]"
          />
        </div>
        
        {/* On desktop: positioned on the 'end' side (left in RTL/Arabic, right in LTR/English) with a very large size and shifted down further */}
        <div className="hidden lg:flex absolute inset-y-0 end-[-15%] start-[35%] xl:start-[40%] items-center justify-center opacity-95 translate-y-[15px] xl:translate-y-[25px]">
          <WorldMap 
            className="w-[1500px] xl:w-[1900px] max-w-none scale-150" 
            viewBox="120 50 530 180" 
            aspectClass="aspect-[530/180]"
          />
        </div>
        
        {/* Gradients to blend and enhance text readability */}
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#05142b] via-[#05142b]/95 lg:via-[#05142b]/70 to-transparent pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05142b] to-[#05142b]/0 pointer-events-none"></div>
      </div>

      <Container className="relative z-10 max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full flex-grow flex items-center pt-20 pb-8 lg:pt-28 lg:pb-12">
        <motion.div
          variants={containerVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="max-w-3xl text-start"
        >
          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-4"
          >
            {t.homepage.hero.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-300 mb-6 leading-relaxed max-w-2xl font-medium"
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
                className={`py-3 px-4 rounded-lg text-center font-bold text-sm transition-all duration-300 ${cta.className}`}
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      {/* Stats Bar */}
      <StatsBar items={statsItems} overlap={false} className="relative z-10 w-full" />
    </section>
  )
}
