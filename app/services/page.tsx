'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'

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
              <Button
                asChild
                className="bg-[#cba76d] hover:bg-[#bba362] text-[#001a33] font-bold px-6 py-5 rounded-[6px] text-xs shadow-md border-0 shrink-0"
              >
                <Link href="/contact?subject=cooperation">
                  {t.servicesPage.hero.ctaCooperation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-[#001a33] border border-blue-900 text-white font-bold px-6 py-5 rounded-[6px] text-xs hover:bg-blue-900 shrink-0"
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
      <StatsBar items={stats} overlap={false} />
 
      {/* Main Content */}
      <main className="py-16 bg-white">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-black text-[#001a33] mb-10 text-start flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
            {t.servicesPage.coreServices.title}
          </h2>
 
          {/* Services Grid */}
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 mb-16"
            data-purpose="services-grid"
          >
            {coreServices.map((service: any, index: number) => (
              <motion.div key={index} variants={cardVariants} className="flex gap-5 items-start text-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#001a33]/5 text-[#001a33] shrink-0 mt-1">
                  <Icon icon={serviceIcons[index % serviceIcons.length]} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#001a33] mb-2 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium max-w-md">
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </main>
 
      {/* Call To Action */}
      <section className="pb-16 bg-white">
        <Container>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#001a33] rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-white border border-white/5 shadow-md relative overflow-hidden"
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
                className="flex-grow md:flex-grow-0 px-8 py-5 bg-[#cba76d] text-[#001a33] font-bold hover:bg-[#bba362] rounded-[6px] text-xs shadow-md border-0 shrink-0 h-10"
              >
                <Link href="/contact?subject=cooperation">
                  {t.servicesPage.cta.cooperation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-grow md:flex-grow-0 px-8 py-5 border border-white text-white font-bold hover:bg-white hover:text-[#001a33] rounded-[6px] text-xs transition-all duration-300 shrink-0 h-10"
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
