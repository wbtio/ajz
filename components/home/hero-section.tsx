'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'
import { Handshake, Globe } from 'lucide-react'
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
      label: t.homepage.hero.ctaCooperation,
      href: '/contact?subject=cooperation',
      icon: Handshake,
    },
    {
      label: t.homepage.hero.ctaParticipation,
      href: '/events',
      icon: Globe,
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
      className="relative min-h-[360px] lg:min-h-[400px] bg-[#001a33] text-white overflow-hidden flex flex-col justify-between"
      data-purpose="hero"
    >
      {/* Interactive World Map Connection Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[#001a33]">
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
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#001a33] via-[#001a33]/95 lg:via-[#001a33]/70 to-transparent pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#001a33] to-[#001a33]/0 pointer-events-none"></div>
      </div>

      <Container className="relative z-10 max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full flex-grow flex items-center pt-16 pb-6 lg:pt-20 lg:pb-8">
        <motion.div
          variants={containerVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="max-w-3xl text-start"
        >
          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-3"
          >
            {t.homepage.hero.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-300 mb-5 leading-relaxed max-w-2xl font-medium"
          >
            {t.homepage.hero.description}
          </motion.p>

          {/* CTA Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl"
          >
            {ctas.map((cta, index) => {
              const Icon = cta.icon
              return (
                <Link
                  key={index}
                  href={cta.href}
                  className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 text-start">
                    <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{cta.label}</h3>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </Link>
              )
            })}
          </motion.div>
        </motion.div>
      </Container>

      {/* Stats Bar */}
      <StatsBar items={statsItems} overlap={false} className="relative z-10 w-full" />
    </section>
  )
}
