'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpLeft, ArrowUpRight, Building2, BriefcaseBusiness, GraduationCap, Handshake, ListChecks, Users } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'

const serviceIcons = [Building2, Handshake, GraduationCap]
const beneficiaryIcons = [Building2, BriefcaseBusiness, Users]

export default function ServicesPage() {
  const { t, locale, dir } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight

  const reveal = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  }

  return (
    <div className="min-h-screen bg-white text-[#0b1426]" dir={dir} lang={locale}>
      <section className="bg-[#0b1426] text-white" data-purpose="services-intro">
        <Container className="py-20 lg:py-[59.5px]">
          <motion.div initial={shouldReduceMotion ? false : 'hidden'} animate="visible" variants={reveal} className="max-w-3xl lg:pt-[44px] lg:mb-[-49px] lg:ms-[-10px]">
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">{t.servicesPage.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg lg:leading-[34.5px]">{t.servicesPage.hero.description}</p>
          </motion.div>
        </Container>
      </section>

      <main>
        <section className="py-[45px]" data-purpose="services-grid">
          <Container className="lg:py-6">
            <h2 className="text-2xl font-extrabold sm:text-3xl">{t.servicesPage.coreServices.title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">{t.servicesPage.coreServices.subtitle}</p>
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="mt-10 grid gap-x-10 md:grid-cols-3"
            >
              {t.servicesPage.coreServices.items.map((service, index) => {
                const Icon = serviceIcons[index]
                return (
                  <motion.article key={service.title} variants={reveal} className="border-t border-slate-200 py-6">
                    <Icon className="h-6 w-6 text-[#8b0000]" aria-hidden="true" />
                    <h3 className="mt-5 text-lg font-extrabold">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{service.desc}</p>
                  </motion.article>
                )
              })}
            </motion.div>
          </Container>
        </section>

        <section className="bg-[#f5f7fa] py-16 lg:py-24" data-purpose="work-process">
          <Container className="-mt-[68px] -mb-[69px] px-3 pt-0 lg:px-3">
            <div className="flex items-start gap-4">
              <ListChecks className="mt-1 h-7 w-7 shrink-0 text-[#8b0000]" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-extrabold sm:text-3xl">{t.servicesPage.workProcess.title}</h2>
                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  {t.servicesPage.workProcess.items.map((step, index) => (
                    <motion.article key={step.title} initial={shouldReduceMotion ? false : 'hidden'} whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={reveal} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8b0000] text-sm font-bold text-white">{index + 1}</span>
                      <div>
                        <h3 className="font-extrabold">{step.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{step.desc}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 lg:py-24" data-purpose="beneficiaries">
          <Container className="-mt-[71px] -mb-[71px]">
            <h2 className="text-2xl font-extrabold sm:text-3xl">{t.servicesPage.beneficiaries.title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">{t.servicesPage.beneficiaries.description}</p>
            <div className="mt-[5px] grid gap-8 md:grid-cols-3">
              {t.servicesPage.beneficiaries.items.map((item, index) => {
                const Icon = beneficiaryIcons[index]
                return <article key={item.title} className="border-t border-slate-200 pt-6"><Icon className="h-6 w-6 text-[#8b0000]" aria-hidden="true" /><h3 className="mt-5 font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p></article>
              })}
            </div>
          </Container>
        </section>

        <section className="bg-[#0b1426] py-[19px] text-white" data-purpose="support-cta">
          <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <h2 className="text-2xl font-extrabold">{t.servicesPage.cta.title}</h2>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-md bg-[#8b0000] px-5 py-3 text-sm font-bold transition-colors hover:bg-[#6b0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {t.servicesPage.cta.supportButton}<Arrow className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Container>
        </section>
      </main>
    </div>
  )
}
