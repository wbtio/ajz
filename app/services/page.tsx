'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { Handshake, Mail } from 'lucide-react'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { SectionHeader } from '@/components/home'

export default function ServicesPage() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const sectionRef = useRef<HTMLElement | null>(null)

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

  // Stats bar data from the HTML
  const stats: StatsBarItem[] = isRTL
    ? [
        { value: 10, label: 'سنوات من التنسيق', icon: 'solar:medal-ribbons-star-bold-duotone', suffix: '+' },
        { value: 3, label: 'مكاتب العراق', icon: 'solar:globus-bold-duotone', suffix: '' },
        { value: 4, label: 'قطاعات نشطة', icon: 'solar:widget-5-bold-duotone', suffix: '+' },
        { value: 50, label: 'شراكات قنصلية', icon: 'solar:users-group-two-rounded-bold-duotone', suffix: '+' },
      ]
    : [
        { value: 10, label: 'Years of Coordination', icon: 'solar:medal-ribbons-star-bold-duotone', suffix: '+' },
        { value: 3, label: 'Iraq Offices', icon: 'solar:globus-bold-duotone', suffix: '' },
        { value: 4, label: 'Active Industries', icon: 'solar:widget-5-bold-duotone', suffix: '+' },
        { value: 50, label: 'Consular Partnerships', icon: 'solar:users-group-two-rounded-bold-duotone', suffix: '+' },
      ]

  // Icons matching each of the 4 service pillars
  const serviceIcons = [
    'solar:globus-bold-duotone',                  // Global Event & Delegation Access
    'solar:handshake-bold-duotone',               // Bilateral Institutional Alliances
    'solar:compass-bold-duotone',                 // In-Country Market Representation
    'solar:shield-user-bold-duotone'              // Consular Logistics & Media Integration
  ]

  const coreServices = t.servicesPage.coreServices.items || []

  return (
    <div className="min-h-screen bg-white text-[#001a33]" dir={dir} lang={locale}>
      {/* Hero Section */}
      <section
        ref={sectionRef}
        className="relative min-h-[400px] bg-[#001a33] text-white overflow-hidden flex items-center"
        data-purpose="hero-section"
      >
        {/* Background Image with Dark Blue Gradient Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* On mobile: cover background with lower opacity */}
          <div className="lg:hidden absolute inset-0">
            <Image
              src="/services-hero-bg.png"
              alt="Services Globe Background"
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
          </div>
          
          {/* On desktop: positioned on the 'end' side (right in LTR, left in RTL) */}
          <div className="hidden lg:block absolute inset-y-0 end-0 start-1/3">
            <Image
              src="/services-hero-bg.png"
              alt="Services Connection Map"
              fill
              priority
              className="object-cover object-right opacity-80"
              sizes="60vw"
            />
          </div>
          
          {/* Linear blending gradients */}
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#001a33] via-[#001a33]/85 lg:via-[#001a33]/40 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#001a33] to-transparent"></div>
        </div>

        <Container className="relative z-10 w-full text-start py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight">
              {t.servicesPage.hero.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-8 font-medium">
              {t.servicesPage.hero.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact?subject=cooperation"
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <Handshake className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.servicesPage.hero.ctaCooperation}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
              <Link
                href="/invitation-support"
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.servicesPage.hero.ctaInvitation}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
 
      {/* Stats Bar */}
      <StatsBar items={stats} overlap={false} />
 
      {/* Main Content */}
      <main className="bg-white py-16 lg:py-24">
        <Container>
          <SectionHeader
            title={t.servicesPage.coreServices.title}
            subtitle={t.servicesPage.coreServices.subtitle}
          />

          {/* Services Grid — ruled 2-column index */}
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 md:grid-cols-2 mt-10 lg:mt-14"
            data-purpose="services-grid"
          >
            {coreServices.map((service: { title: string; desc: string }, index: number) => {
              const isOdd = index % 2 === 0
              const isLast = index === coreServices.length - 1
              const isLastRow = index >= coreServices.length - 2
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className={[
                    'group flex gap-4 items-start text-start p-5 lg:p-6',
                    'border-b border-slate-200/70',
                    isOdd ? 'md:border-e md:border-slate-200/70' : '',
                    isLast && isOdd ? 'md:border-b-0' : '',
                    isLastRow ? 'md:border-b-0' : '',
                  ].join(' ')}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#001a33]/[0.04] border border-slate-200/60 text-[#001a33] shrink-0 transition-all duration-300 group-hover:bg-[#8b0000] group-hover:border-[#8b0000] group-hover:text-white">
                    <Icon icon={serviceIcons[index % serviceIcons.length]} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 mb-2 leading-tight transition-colors duration-300 group-hover:text-[#8b0000]">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                      {service.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </main>
 
      {/* Call To Action */}
      <section className="bg-[#0b1426] text-white py-5 lg:py-8" data-purpose="cta-bar">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                <Handshake className="h-8 w-8 text-[#b08d4b]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-balance">
                  {t.servicesPage.cta.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  {t.servicesPage.cta.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/contact?subject=cooperation"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#8b0000] px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#6b0000] active:scale-95"
              >
                <span>{t.servicesPage.cta.cooperation}</span>
                <svg className="w-4 h-4 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/10 active:scale-95"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>{t.servicesPage.cta.contact}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
