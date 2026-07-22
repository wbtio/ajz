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
        <section className="relative overflow-hidden bg-white py-8 lg:py-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden text-[#001a33]" aria-hidden="true">
            <Icon icon="solar:earth-bold-duotone" className="absolute -end-8 top-8 h-64 w-64 opacity-[0.035]" />
            <Icon icon="solar:buildings-3-bold-duotone" className="absolute start-[46%] bottom-[-3rem] h-48 w-48 opacity-[0.025]" />
            <Icon icon="solar:hand-shake-bold-duotone" className="absolute end-[28%] top-16 h-28 w-28 opacity-[0.03]" />
          </div>
          <Container>
            <div className="relative z-10">
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
                <p className="whitespace-pre-line text-sm lg:text-base leading-relaxed text-slate-700 font-medium max-w-prose">
                  {t.about.whoWeAreText}
                </p>
              </motion.div>

              </div>
            </div>
          </Container>
        </section>

        {/* ============ MISSION & VISION ============ */}
        <section className="bg-[#f5f7fa] py-7 lg:py-9">
          <Container>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: locale === 'ar' ? 'رسالتنا' : 'Our Mission',
                  text: locale === 'ar'
                    ? 'تسعى الجاز إلى تنظيم المعارض والمؤتمرات وتنسيق المشاركات المهنية والمؤسسية، بما يتيح للمؤسسات والشركات الوصول إلى الفعاليات الدولية المتخصصة بطريقة منظمة وفعالة.'
                    : 'Our Company seeks to organize exhibitions and conferences and coordinate professional and institutional participation, enabling institutions, businesses to access specialized international events in a structured and effective manner.',
                },
                {
                  title: locale === 'ar' ? 'رؤيتنا' : 'Our Vision',
                  text: locale === 'ar'
                    ? 'أن تكون جاز جهة فاعلة في تنظيم المعارض والمؤتمرات، وتمثيل الحضور والمؤسسي في المنصات الدولية المتخصصة.'
                    : 'To be an active entity in organizing exhibitions and conferences and institutional presence on specialized international platforms.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h2 className="text-lg font-extrabold text-[#101a33]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ VALUES — navy band ============ */}
        <section className="bg-[#f0f0f0] text-[#0b1426] py-6 lg:py-8">
          <Container>
            <SectionHeader
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
                      'border-b border-slate-500/20',
                      isOdd ? 'md:border-e md:border-slate-500/20' : '',
                      isLast && !isOdd ? 'md:border-b-0' : '',
                      isLastRow ? 'md:border-b-0' : '',
                    ].join(' ')}
                  >
                    <span
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border border-slate-500/20 bg-white/40 transition-colors duration-300"
                      style={{ color: ic.color }}
                    >
                      <Icon icon={ic.icon} className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block font-extrabold text-sm text-[#0b1426] mb-0.5">{val.title}</span>
                      <span className="block text-xs text-slate-700 leading-relaxed">{val.desc}</span>
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
            />

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 mt-4">
              {offices.map((office, index) => (
                <motion.div
                  key={index}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  className="group flex items-center rounded-xl border border-slate-200/70 bg-white px-4 py-3 transition-colors duration-300 hover:border-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: office.dot }}
                    />
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {office.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ WHY JAZ + REACH — white band ============ */}
        <section className="bg-white py-8 lg:py-12">
          <Container>
            <div className="grid grid-cols-1">
              {/* Why JAZ — ruled checklist */}
              <div className="max-w-4xl">
                <SectionHeader
                  title={t.about.whyJaz}
                  subtitle={t.about.whyJazSubtitle}
                />

                <ul className="mt-6 lg:mt-8 divide-y divide-slate-200/70">
                  {(t.about.whyJazItems || []).slice(0, 3).map((item: string, index: number) => (
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
                      <span className="whitespace-pre-line text-sm lg:text-base font-semibold text-slate-800 leading-snug">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

            </div>
          </Container>
        </section>

        {/* ============ TEAM — directly before the existing final CTA ============ */}
        <section className="bg-[#f5f7fa] py-8 lg:py-10" dir={dir}>
          <Container>
            <div className="max-w-3xl text-start">
              <SectionHeader
                title={locale === 'ar' ? 'فريقنا' : 'Meet Our Team'}
                subtitle={locale === 'ar' ? 'الفريق المتخصص الذي يقف وراء نجاحنا.' : 'The dedicated team behind our success.'}
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2">
              {(locale === 'ar'
                ? [
                    ['نور الشكرجي', 'الرئيس التنفيذي', 'قيادة الرؤية الاستراتيجية والنمو المؤسسي.'],
                    ['نيكولاس نيكلتس', 'المدير التنفيذي', 'إدارة العمليات والتطوير التنظيمي.'],
                    ['مينا سالم', 'مديرة المبيعات', 'تطوير العلاقات مع العملاء والشركاء.'],
                    ['رامي العزاوي', 'مدير العمليات', 'الإشراف على كفاءة وفعالية عمل الشركة.'],
                    ['muntazar ahmed', 'مدير تقنية المعلومات', 'ضمان أمن وموثوقية حلولنا التقنية.'],
                    ['علاء عبد الكريم', 'منسق الفعاليات', 'تنظيم وتنسيق فعاليات مميزة لعملائنا.'],
                    ['ماريا جورج', 'منسقة العملاء', 'ضمان رضا العملاء والدعم الاستثنائي.'],
                    ['ميركل', 'مديرة العلاقات العامة', 'إدارة الاتصالات العامة والإعلامية للشركة.'],
                    ['كوزمينا', 'مديرة تطوير الأعمال', 'تحديد فرص النمو والشراكات الجديدة.'],
                  ]
                : [
                    ['Noor Al-Shakargji', 'Chief Executive Officer', 'Leading the strategic vision and institutional growth.'],
                    ['Nicholas Nicklets', 'Executive Director', 'Managing daily operations and organizational development.'],
                    ['Mina Salem', 'Sales Manager', 'Building strong client relationships and new partnerships.'],
                    ['Rami Al-Azzawi', 'Operations Manager', 'Overseeing the efficiency and effectiveness of the company.'],
                    ['muntazar ahmed', 'IT Manager', 'Ensuring the security and reliability of our technology.'],
                    ['Alaa Abdul-Karim', 'Events Coordinator', 'Organizing and coordinating memorable events for our clients.'],
                    ['Maria George', 'Client Coordinator', 'Ensuring client satisfaction and exceptional support.'],
                    ['Merkel', 'Public Relations Manager', 'Managing the company’s public image and media communications.'],
                    ['Kuzmina', 'Business Development Manager', 'Identifying new growth opportunities and partnerships.'],
                  ]
              ).map(([name, role]) => (
                <div
                  key={name}
                  className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-5 text-start shadow-sm lg:h-[65px] lg:px-3 lg:py-1 ${
                    name === 'Kuzmina' || name === 'كوزمينا' ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#001a33] text-sm font-extrabold text-white lg:h-7 lg:w-7">
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-[#101a33]">{name}</h3>
                    <p className="truncate text-xs font-semibold text-[#8b0000]">{role}</p>
                  </div>
                  {(name === 'Kuzmina' || name === 'كوزمينا') && (
                    <a
                      href="mailto:contact@jaz.iq"
                      className="ms-auto shrink-0 whitespace-nowrap ps-4 text-xs font-semibold text-[#8b0000] underline-offset-2 hover:underline"
                    >
                      contact@jaz.iq
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ CTA — navy band ============ */}
        <section className="bg-[#0b1426] text-white py-5 lg:py-[26px]" data-purpose="cta-bar">
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
