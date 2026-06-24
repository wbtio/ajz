'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { SectionHeader } from '@/components/home'

export function AboutClient() {
  const { t, locale, dir } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false

  const sectionRef = useRef<HTMLElement | null>(null)

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

  const valueIcons = [
    { icon: 'solar:shield-check-bold-duotone', color: '#8b0000' },
    { icon: 'solar:medal-ribbons-star-bold-duotone', color: '#b08d4b' },
    { icon: 'solar:hand-stars-bold-duotone', color: '#001a33' },
    { icon: 'solar:lightbulb-bolt-bold-duotone', color: '#16a34a' },
    { icon: 'solar:graph-bold-duotone', color: '#8b0000' },
  ]

  const reachIcons = [
    { icon: 'solar:city-bold-duotone', color: '#8b0000' },
    { icon: 'solar:square-academic-cap-bold-duotone', color: '#001a33' },
    { icon: 'solar:earth-bold-duotone', color: '#16a34a' },
    { icon: 'solar:users-group-two-rounded-bold-duotone', color: '#b08d4b' },
  ]

  const offices = [
    { title: t.about.basraTitle, desc: t.about.basraDesc, dot: '#001a33' },
    { title: t.about.baghdadTitle, desc: t.about.baghdadDesc, dot: '#8b0000' },
    { title: t.about.erbilTitle, desc: t.about.erbilDesc, dot: '#16a34a' },
  ]

  return (
    <div className="min-h-screen bg-white text-[#001a33]" dir={dir} lang={locale}>

      {/* Stats Bar */}
      <StatsBar items={statsItems} overlap={false} className="relative z-10 w-full" />

      <main>
        {/* ============ IDENTITY — white band ============ */}
        <section className="bg-white py-8 lg:py-12">
          <Container>
            <SectionHeader
              title={t.about.whoWeAreTitle}
              subtitle={t.about.whoWeAreSubtitle}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 mt-6">
              {/* Who We Are text */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7"
              >
                <p className="text-sm lg:text-base leading-relaxed text-slate-700 font-medium max-w-prose">
                  {t.about.whoWeAreText}
                </p>
              </motion.div>

              {/* Mission & Vision */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 lg:border-s lg:border-slate-200/70 lg:ps-6"
              >
                <div className="space-y-3">
                  {/* Mission */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon="solar:target-bold-duotone" className="h-4 w-4 text-[#8B0000] shrink-0" />
                      <h4 className="text-xs font-extrabold text-slate-900">{t.about.mission}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.about.missionText}
                    </p>
                  </div>
                  {/* Vision */}
                  <div className="pt-3 border-t border-slate-200/70">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon="solar:eye-bold-duotone" className="h-4 w-4 text-[#16a34a] shrink-0" />
                      <h4 className="text-xs font-extrabold text-slate-900">{t.about.vision}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t.about.visionText}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* ============ VALUES — navy band ============ */}
        <section className="bg-[#0b1426] text-white py-6 lg:py-8">
          <Container>
            <SectionHeader
              dark
              title={t.about.ourValues}
              subtitle={t.about.ourValuesSubtitle}
            />

            <ul className="grid grid-cols-1 md:grid-cols-2 mt-5 lg:mt-6">
              {values.map((val: { title: string; desc: string }, index: number) => {
                const isOdd = index % 2 === 0
                const isLast = index === values.length - 1
                const isLastRow = index >= values.length - 2
                const ic = valueIcons[index] || { icon: 'solar:star-bold-duotone', color: '#001a33' }
                return (
                  <motion.li
                    key={index}
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: (index % 2) * 0.05 }}
                    className={[
                      'group flex items-center gap-3 px-2 py-3 lg:px-4 lg:py-4',
                      'border-b border-white/10',
                      isOdd ? 'md:border-e md:border-white/10' : '',
                      isLast && !isOdd ? 'md:border-b-0' : '',
                      isLastRow ? 'md:border-b-0' : '',
                    ].join(' ')}
                  >
                    <span
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border border-white/10 bg-white/[0.04] transition-colors duration-300"
                      style={{ color: ic.color }}
                    >
                      <Icon icon={ic.icon} className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block font-extrabold text-sm text-white mb-0.5">{val.title}</span>
                      <span className="block text-xs text-slate-300 leading-relaxed">{val.desc}</span>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          </Container>
        </section>


        {/* ============ WHERE WE OPERATE — platinum band ============ */}
        <section className="bg-[#f5f7fa] py-6 lg:py-8">
          <Container>
            <SectionHeader
              title={t.about.whereWeOperate}
              subtitle={t.about.whereWeOperateSubtitle}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-5 lg:mt-6">
              {offices.map((office, index) => (
                <motion.div
                  key={index}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  className="group relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 lg:p-6 min-h-[140px] transition-colors duration-300 hover:border-slate-300"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: office.dot }}
                    />
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {office.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-auto">
                    {office.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ WHY JAZ + REACH — white band ============ */}
        <section className="bg-white py-8 lg:py-12">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Why JAZ — ruled checklist */}
              <div className="lg:col-span-7">
                <SectionHeader
                  title={t.about.whyJaz}
                  subtitle={t.about.whyJazSubtitle}
                />

                <ul className="mt-6 lg:mt-8 divide-y divide-slate-200/70">
                  {(t.about.whyJazItems || []).map((item: string, index: number) => (
                    <motion.li
                      key={index}
                      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group flex items-center gap-4 lg:gap-5 py-3 lg:py-4 first:pt-0"
                    >
                      <span className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[#8b0000]/[0.06] text-[#8b0000] transition-colors duration-300 group-hover:bg-[#8b0000]/[0.1]">
                        <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5" />
                      </span>
                      <span className="text-sm lg:text-base font-semibold text-slate-800 leading-snug">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Nationwide Reach — stat list */}
              <div className="lg:col-span-5 lg:border-s lg:border-slate-200/70 lg:ps-8">
                <SectionHeader
                  title={t.about.nationwideReach}
                />

                <div className="mt-6 lg:mt-8 space-y-5 lg:space-y-6">
                  {reachItems.map((item: { count: string; label: string }, idx: number) => {
                    const ic = reachIcons[idx] || { icon: 'solar:star-bold-duotone', color: '#001a33' }
                    return (
                      <motion.div
                        key={idx}
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.4, delay: idx * 0.06 }}
                        className="flex items-start gap-4"
                      >
                        <span
                          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200/70"
                          style={{ color: ic.color }}
                        >
                          <Icon icon={ic.icon} className="w-5 h-5" />
                        </span>
                        <div className="leading-tight pt-0.5">
                          <div className="text-lg lg:text-xl font-black leading-tight mb-0.5" style={{ color: ic.color }}>
                            {item.count}
                          </div>
                          <p className="text-xs lg:text-sm text-slate-500 font-semibold">{item.label}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ============ CTA — navy band ============ */}
        <section className="bg-[#0b1426] text-white py-5 lg:py-8" data-purpose="cta-bar">
          <Container>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                  <Icon icon="solar:hand-shake-bold-duotone" className="h-8 w-8 text-[#b08d4b]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-balance">
                    {t.about.ctaTitle}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    {t.about.ctaDesc}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href="/contact?subject=cooperation"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#8b0000] px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#6b0000] active:scale-95"
                >
                  <span>{t.about.ctaCooperation}</span>
                  <svg className="w-4 h-4 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/10 active:scale-95"
                >
                  <span>{t.about.ctaContact}</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  )
}
