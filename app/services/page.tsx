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
  const stats = [
    {
      val: '+10',
      label: isRTL ? t.servicesPage.stats.expLabel : t.servicesPage.stats.expLabel,
      icon: 'solar:medal-ribbons-star-bold-duotone',
    },
    {
      val: isRTL ? t.servicesPage.stats.citiesVal : t.servicesPage.stats.citiesVal,
      label: isRTL ? t.servicesPage.stats.citiesLabel : t.servicesPage.stats.citiesLabel,
      icon: 'solar:globus-bold-duotone',
    },
    {
      val: isRTL ? t.servicesPage.stats.sectorsVal : t.servicesPage.stats.sectorsVal,
      label: isRTL ? t.servicesPage.stats.sectorsLabel : t.servicesPage.stats.sectorsLabel,
      icon: 'solar:widget-5-bold-duotone',
    },
    {
      val: isRTL ? t.servicesPage.stats.govVal : t.servicesPage.stats.govVal,
      label: isRTL ? t.servicesPage.stats.govLabel : t.servicesPage.stats.govLabel,
      icon: 'solar:users-group-two-rounded-bold-duotone',
    },
  ]

  // Icons matching each of the 8 services
  const serviceIcons = [
    'solar:globus-bold-duotone',                  // International Event Access
    'solar:users-group-two-rounded-bold-duotone', // Delegation Coordination
    'solar:letter-bold-duotone',                  // Invitation & Registration
    'solar:share-bold-duotone',                   // Official Pub & Promotion
    'solar:link-bold-duotone',                    // Institutional Partnerships
    'solar:compass-bold-duotone',                 // Market Outreach
    'solar:handshake-bold-duotone',               // B2B Matchmaking
    'solar:shield-user-bold-duotone'              // Logistics & Protocol
  ]

  const coreServices = t.servicesPage.coreServices.items || []
  const whyJazItems = t.servicesPage.info.whyJaz.items || []

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

        <Container className="relative z-10 w-full text-start px-6 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight">
              {t.servicesPage.hero.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8 font-medium">
              {t.servicesPage.hero.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-[#cba76d] hover:bg-[#bba362] text-[#001a33] font-bold px-6 py-5 rounded-[4px] text-xs shadow-md border-0 shrink-0"
              >
                <Link href="/contact?subject=cooperation">
                  {t.servicesPage.hero.ctaCooperation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-[#001a33] border border-blue-900 text-white font-bold px-6 py-5 rounded-[4px] text-xs hover:bg-blue-900 shrink-0"
              >
                <Link href="/events">
                  {t.servicesPage.hero.ctaParticipation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-[#001a33] border border-blue-900 text-white font-bold px-6 py-5 rounded-[4px] text-xs hover:bg-blue-900 shrink-0"
              >
                <Link href="/invitation-support">
                  {t.servicesPage.hero.ctaInvitation}
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Stats Bar */}
      <section
        className="bg-[#001226] text-white py-5 border-t border-blue-900/40 relative z-10"
        data-purpose="stats-bar"
      >
        <Container className="px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-white/10">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-2 sm:p-0">
                <span className="text-base sm:text-lg font-black text-white leading-none mb-1.5 flex items-center gap-1.5 justify-center">
                  <Icon icon={stat.icon} className="text-[#cba76d] h-5 w-5 shrink-0" />
                  {stat.val}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <main className="py-16 bg-white">
        <Container className="px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#001a33] mb-8 text-start flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
            {t.servicesPage.coreServices.title}
          </h2>

          {/* Services Grid */}
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            data-purpose="services-grid"
          >
            {coreServices.map((service: any, index: number) => (
              <motion.div key={index} variants={cardVariants} className="h-full">
                <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between group">
                  <CardContent className="p-6 text-start flex flex-col h-full">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#001a33]/5 text-[#001a33] mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Icon icon={serviceIcons[index % serviceIcons.length]} className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-[#001a33] mb-3 leading-tight group-hover:text-[#8b0000] transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
                      {service.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Secondary Info Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-purpose="secondary-info">
            {/* How We Work */}
            <div className="lg:col-span-4 border border-[#e5e7eb] rounded-[4px] p-6 min-h-[180px] bg-white text-start shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <h4 className="font-extrabold text-base text-[#001a33] mb-4 border-b border-slate-100 pb-2">
                {t.servicesPage.info.howWeWork.title}
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                {t.servicesPage.info.howWeWork.desc}
              </p>
            </div>

            {/* Industries We Support */}
            <div className="lg:col-span-5 border border-[#e5e7eb] rounded-[4px] p-6 min-h-[180px] bg-white text-start shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <h4 className="font-extrabold text-base text-[#001a33] mb-4 border-b border-slate-100 pb-2">
                {t.servicesPage.info.industries.title}
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                {t.servicesPage.info.industries.desc}
              </p>
            </div>

            {/* Why Work With JAZ? */}
            <div className="lg:col-span-3 border border-[#e5e7eb] rounded-[4px] p-6 bg-white flex flex-col text-start shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <h4 className="font-extrabold text-base text-[#001a33] mb-4 border-b border-slate-100 pb-2">
                {t.servicesPage.info.whyJaz.title}
              </h4>
              <ul className="text-[10px] space-y-2 text-gray-600 font-bold list-disc pl-4 rtl:pr-4 rtl:pl-0">
                {whyJazItems.map((item: string, index: number) => (
                  <li key={index} className="marker:text-[#cba76d]">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </main>

      {/* Call To Action */}
      <section className="pb-16 bg-white">
        <Container className="px-6">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#001a33] rounded-[4px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-white border border-white/5 shadow-lg relative overflow-hidden"
            data-purpose="cta-bar"
          >
            {/* Soft decorative visual glow */}
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(203,167,109,0.08),transparent_70%)] pointer-events-none select-none" />
            
            <div className="text-start md:max-w-2xl mb-6 md:mb-0 relative z-10">
              <h3 className="text-xl sm:text-2xl font-black mb-2 text-white leading-tight">
                {t.servicesPage.cta.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium opacity-90">
                {t.servicesPage.cta.description}
              </p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto shrink-0 justify-start relative z-10">
              <Button
                asChild
                className="flex-grow md:flex-grow-0 px-8 py-5 bg-[#cba76d] text-[#001a33] font-bold hover:bg-[#bba362] rounded-[4px] text-xs shadow-md border-0 shrink-0 h-10"
              >
                <Link href="/contact?subject=cooperation">
                  {t.servicesPage.cta.cooperation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-grow md:flex-grow-0 px-8 py-5 border border-white text-white font-bold hover:bg-white hover:text-[#001a33] rounded-[4px] text-xs transition-all duration-300 shrink-0 h-10"
              >
                <Link href="/contact">
                  {t.servicesPage.cta.contact}
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
