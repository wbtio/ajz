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

  // Stats bar data from the HTML
  const stats = [
    {
      val: '+10',
      label: isRTL ? 'سنوات من الخبرة' : 'Years of Experience',
      icon: 'solar:medal-ribbons-star-bold-duotone',
    },
    {
      val: isRTL ? 'البصرة • بغداد • أربيل' : 'Basra • Baghdad • Erbil',
      label: isRTL ? 'ربط العالم بالعراق' : 'Connecting the World to Iraq',
      icon: 'solar:globus-bold-duotone',
    },
    {
      val: isRTL ? 'وصول لقطاعات متعددة' : 'Multi-sector Access',
      label: isRTL ? 'الصحة • التقنية • الصناعة • الأكاديميا' : 'Health • Tech • Industry • Academia',
      icon: 'solar:widget-5-bold-duotone',
    },
    {
      val: isRTL ? 'تنسيق حكومي وتجاري' : 'Gov & Business Coordination',
      label: isRTL ? 'بناء الشراكات الاستراتيجية' : 'Building Strategic Partnerships',
      icon: 'solar:users-group-two-rounded-bold-duotone',
    },
  ]

  const values = t.about.valuesItems || []
  const reachItems = t.about.reachItems || []

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]" dir={dir} lang={locale}>
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
      <div className="bg-[#051c34] text-white py-5 relative z-10">
        <Container className="px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-white/10">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-2 sm:p-0">
                <span className="text-base sm:text-[20px] font-bold text-white leading-none mb-1 flex items-center gap-1.5 justify-center">
                  <Icon icon={stat.icon} className="text-[#d6bc80] h-5 w-5 shrink-0" />
                  {stat.val}
                </span>
                <span className="text-[11px] font-medium text-white/60 leading-none">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Main Grid Section 1 */}
      <section className="py-12 bg-[#f8f9fa]">
        <Container className="px-6">
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Who We Are */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col h-full">
                  <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                    {t.about.whoWeAreTitle}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#43474d] font-normal">
                    {t.about.whoWeAreText}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mission */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col h-full">
                  <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                    {t.about.mission}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#43474d] font-normal">
                    {t.about.missionText}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col h-full">
                  <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                    {t.about.vision}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#43474d] font-normal">
                    {t.about.visionText}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Where We Operate */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#191c1d] mb-3 border-b border-slate-100 pb-2">
                      {t.about.whereWeOperate}
                    </h3>
                    <div className="relative w-full h-44 mb-4 flex justify-center items-center overflow-hidden bg-white">
                      <Image
                        src="/iraq-map.png"
                        alt="Iraq Map Highlighting Erbil, Baghdad, and Basra"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-auto border-t border-slate-100 pt-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#191c1d]">{t.about.erbilTitle}</h4>
                      <p className="text-[10px] text-[#43474d] leading-normal">{t.about.erbilDesc}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191c1d]">{t.about.baghdadTitle}</h4>
                      <p className="text-[10px] text-[#43474d] leading-normal">{t.about.baghdadDesc}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191c1d]">{t.about.basraTitle}</h4>
                      <p className="text-[10px] text-[#43474d] leading-normal">{t.about.basraDesc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Main Grid Section 2 */}
      <section className="pb-16 bg-[#f8f9fa]">
        <Container className="px-6">
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-20px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Why JAZ */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col h-full">
                  <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                    {t.about.whyJaz}
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#43474d] leading-relaxed list-disc list-inside">
                    {(t.about.whyJazItems || []).map((item: string, idx: number) => (
                      <li key={idx} className="marker:text-[#d6bc80]">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Our Values */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col h-full">
                  <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                    {t.about.ourValues}
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-[11px] text-[#43474d]">
                    {values.map((val: any, idx: number) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="font-extrabold text-[#191c1d]">{val.title}: </span>
                        {val.desc}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leadership */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col justify-between h-full gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                      {t.about.leadership}
                    </h3>
                    <div className="relative w-full h-24 rounded border border-slate-100 overflow-hidden">
                      <Image
                        alt="JAZ Leadership Presence in Iraq"
                        src="https://lh3.googleusercontent.com/aida/AP1WRLtIKcWK2U1lzwUu_HPydojCy8s8UQBKcGZpTn-cJqoUbLrBnnQR7OESoe43oPv92CRFAeJhKEV7g6KD00uy2id2u3IKfAXQAI2QfpLPSdlSZY0UNEqxOjdms8isNxVx6RC6--kdiQ5D3TsjaoE_aKHtF1gDH-rxyFjBKSHq3R7hgsgTNw-MJJfVLcO6gfimu8f30ZxlVKAEnSxwiziVYwphIwbsjXbbmSJkvxhlA_FVA7jUz7To3VVPXg"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-[#43474d] font-normal mt-auto">
                    {t.about.leadershipText}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Nationwide Reach */}
            <motion.div variants={cardVariants} className="h-full">
              <Card className="h-full bg-white border border-[#e5e7eb] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-6 text-start flex flex-col justify-between h-full">
                  <h3 className="text-base font-bold text-[#191c1d] mb-4 border-b border-slate-100 pb-2">
                    {t.about.nationwideReach}
                  </h3>
                  
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 space-y-2 text-[10px]">
                      {reachItems.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-extrabold text-[#191c1d] text-xs leading-none mb-0.5">
                            {item.count}
                          </div>
                          <p className="text-[#43474d] text-[9px] font-bold leading-normal">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="w-28 opacity-70 select-none pointer-events-none relative aspect-square shrink-0">
                      <Image
                        src="/iraq-map.png"
                        alt="Miniature Iraq Map"
                        fill
                        className="object-contain"
                        sizes="120px"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Footer CTA Container */}
      <footer className="pb-12 bg-[#f8f9fa]">
        <Container className="px-6">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#051c34] rounded-[4px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white border border-white/5"
          >
            <div className="text-start md:max-w-2xl">
              <h3 className="text-lg sm:text-[20px] font-bold mb-1 text-white leading-tight">
                {t.about.ctaTitle}
              </h3>
              <p className="text-sm text-white/60 font-normal">
                {t.about.ctaDesc}
              </p>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto shrink-0 justify-start">
              <Button
                asChild
                className="px-6 py-2 bg-[#d6bc80] text-[#021c36] font-bold hover:brightness-110 rounded-[4px] transition-all duration-300 shadow-md active:scale-[0.98] text-sm shrink-0 h-10 border-0"
              >
                <Link href="/contact?subject=cooperation">
                  {t.about.ctaCooperation}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-6 py-2 border border-white/40 text-white font-bold hover:bg-white/10 rounded-[4px] transition-all duration-300 text-sm shrink-0 h-10"
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
