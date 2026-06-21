'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'

export function PartnershipProcess() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const steps = [
    { num: '01', title: t.homepage.process.discoverTitle, desc: t.homepage.process.discoverDesc },
    { num: '02', title: t.homepage.process.connectTitle, desc: t.homepage.process.connectDesc },
    { num: '03', title: t.homepage.process.collaborateTitle, desc: t.homepage.process.collaborateDesc },
    { num: '04', title: t.homepage.process.growTitle, desc: t.homepage.process.growDesc },
  ]

  const start = isRTL ? 87.5 : 12.5
  const end = isRTL ? 12.5 : 87.5

  const getHoverEndPercent = () => {
    if (hoveredIndex === null) return start
    const stepDiff = (end - start) / 3
    return start + hoveredIndex * stepDiff
  }

  const hoverEnd = getHoverEndPercent()

  return (
    <section className="bg-[#f5f7fa] py-8 lg:py-12" data-purpose="partnership-process">
      <Container>
        <SectionHeader
          title={t.homepage.process.title}
          subtitle={t.homepage.process.subtitle}
        />

        <div className="relative mt-8 lg:mt-10">
          {/* DESKTOP TIMELINE */}
          <div className="hidden md:block relative pb-2">
            {/* Horizontal line */}
            <div className="absolute left-0 right-0 top-7 h-[4px] -z-0">
              <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                <line
                  x1={`${start}%`}
                  y1="50%"
                  x2={`${end}%`}
                  y2="50%"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <motion.line
                  x1={`${start}%`}
                  y1="50%"
                  x2={`${end}%`}
                  y2="50%"
                  stroke="#64748b"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
                {!shouldReduceMotion && hoveredIndex !== null && (
                  <motion.line
                    x1={`${start}%`}
                    y1="50%"
                    x2={`${hoverEnd}%`}
                    y2="50%"
                    stroke="#8B0000"
                    strokeWidth="3"
                    className="drop-shadow-[0_0_6px_rgba(139,0,0,0.25)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </svg>
            </div>

            <div className="grid grid-cols-4 gap-6 relative z-10">
              {steps.map((step, index) => {
                const isStepActive = hoveredIndex !== null && index <= hoveredIndex
                return (
                  <div
                    key={step.num}
                    className="flex flex-col items-center text-center group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <motion.div
                      initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.12 }}
                      className={`w-14 h-14 rounded-full border-2 bg-[#f5f7fa] flex items-center justify-center font-black text-base mb-4 transition-all duration-300 relative ${
                        isStepActive
                          ? 'border-[#8B0000] text-[#8B0000] shadow-[0_0_16px_rgba(139,0,0,0.12)] scale-105'
                          : 'border-slate-300 text-slate-400 group-hover:border-[#8B0000]/60 group-hover:text-[#8B0000]/70'
                      }`}
                    >
                      {step.num}
                    </motion.div>

                    <h4
                      className={`font-extrabold text-sm lg:text-base mb-2 tracking-wide transition-colors duration-300 ${
                        isStepActive
                          ? 'text-[#8B0000]'
                          : 'text-slate-800 group-hover:text-[#8B0000]/85'
                      }`}
                    >
                      {step.title}
                    </h4>

                    <p className="text-sm text-slate-600 leading-relaxed max-w-[26ch]">
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* MOBILE TIMELINE */}
          <div className="md:hidden relative ps-8 pe-2">
            <div className="absolute top-5 bottom-4 start-5 w-[4px] -z-0 -translate-x-1/2 rtl:translate-x-1/2">
              <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
                <motion.line
                  x1="50%"
                  y1="0%"
                  x2="50%"
                  y2="100%"
                  stroke="#64748b"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
                {!shouldReduceMotion && hoveredIndex !== null && (
                  <motion.line
                    x1="50%"
                    y1="0%"
                    x2="50%"
                    y2={`${(hoveredIndex / 3) * 100}%`}
                    stroke="#8B0000"
                    strokeWidth="3"
                    className="drop-shadow-[0_0_6px_rgba(139,0,0,0.25)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </svg>
            </div>

            <div className="flex flex-col gap-8 relative z-10">
              {steps.map((step, index) => {
                const isStepActive = hoveredIndex !== null && index <= hoveredIndex
                return (
                  <div
                    key={step.num}
                    className="flex gap-4 items-start group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <motion.div
                      initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.12 }}
                      className={`w-10 h-10 rounded-full border-2 bg-[#f5f7fa] flex items-center justify-center font-black text-xs shrink-0 transition-all duration-300 relative ${
                        isStepActive
                          ? 'border-[#8B0000] text-[#8B0000] shadow-[0_0_10px_rgba(139,0,0,0.12)]'
                          : 'border-slate-300 text-slate-400 group-hover:border-[#8B0000]/60 group-hover:text-[#8B0000]/70'
                      }`}
                    >
                      {step.num}
                    </motion.div>

                    <div className="pt-1 text-start">
                      <h4
                        className={`font-extrabold text-sm mb-1.5 tracking-wide transition-colors duration-300 ${
                          isStepActive
                            ? 'text-[#8B0000]'
                            : 'text-slate-800 group-hover:text-[#8B0000]/85'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-[44ch]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
