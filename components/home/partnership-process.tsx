'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export function PartnershipProcess() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const steps = [
    {
      num: '01',
      title: t.homepage.process.discoverTitle,
      desc: t.homepage.process.discoverDesc,
    },
    {
      num: '02',
      title: t.homepage.process.connectTitle,
      desc: t.homepage.process.connectDesc,
    },
    {
      num: '03',
      title: t.homepage.process.collaborateTitle,
      desc: t.homepage.process.collaborateDesc,
    },
    {
      num: '04',
      title: t.homepage.process.growTitle,
      desc: t.homepage.process.growDesc,
    },
  ]

  // Centers of elements: 12.5%, 37.5%, 62.5%, 87.5%
  // In RTL layout, steps render from right to left physically.
  const start = isRTL ? 87.5 : 12.5
  const end = isRTL ? 12.5 : 87.5

  const getHoverEndPercent = () => {
    if (hoveredIndex === null) return start
    const stepDiff = (end - start) / 3
    return start + hoveredIndex * stepDiff
  }

  const hoverEnd = getHoverEndPercent()

  return (
    <div className="w-full text-start" data-purpose="partnership-process">
      <h2 className="text-2xl font-black text-slate-900 mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.process.title}
      </h2>
      <p className="text-sm font-semibold text-slate-600 mb-10 pl-3.5">
        {t.homepage.process.subtitle}
      </p>
      
      <div className="relative">
        
        {/* DESKTOP TIMELINE */}
        <div className="hidden md:block relative pb-4">
          {/* Horizontal SVG line background */}
          <div className="absolute left-0 right-0 top-6 h-[4px] -z-0">
            <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <line 
                x1={`${start}%`} 
                y1="50%" 
                x2={`${end}%`} 
                y2="50%" 
                stroke="#e2e8f0" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
              />
              <motion.line 
                x1={`${start}%`} 
                y1="50%" 
                x2={`${end}%`} 
                y2="50%" 
                stroke="#94a3b8" 
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              {!shouldReduceMotion && hoveredIndex !== null && (
                <motion.line 
                  x1={`${start}%`} 
                  y1="50%" 
                  x2={`${hoverEnd}%`} 
                  y2="50%" 
                  stroke="#8B0000" 
                  strokeWidth="3"
                  className="drop-shadow-[0_0_6px_rgba(139,0,0,0.3)]"
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
                    transition={{ duration: 0.3, delay: index * 0.15 }}
                    className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center font-bold text-sm mb-4 transition-all duration-300 relative ${
                      isStepActive 
                        ? 'border-[#8B0000] text-[#8B0000] shadow-[0_0_12px_rgba(139,0,0,0.15)] scale-105' 
                        : 'border-slate-200 text-slate-400 group-hover:border-[#8B0000]/60 group-hover:text-[#8B0000]/60'
                    }`}
                  >
                    {step.num}
                  </motion.div>

                  <h4 className={`font-extrabold text-xs sm:text-sm mb-2 uppercase tracking-wider transition-colors duration-300 ${
                    isStepActive ? 'text-[#8B0000]' : 'text-slate-800 group-hover:text-[#8B0000]/85'
                  }`}>
                    {step.title}
                  </h4>
                  
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed max-w-[24ch]">
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* MOBILE TIMELINE */}
        <div className="md:hidden relative pl-6 pr-2 rtl:pl-2 rtl:pr-6">
          <div className="absolute top-4 bottom-4 left-6 rtl:right-6 rtl:left-auto w-[4px] -z-0 -translate-x-1/2 rtl:translate-x-1/2">
            <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <line 
                x1="50%" 
                y1="0%" 
                x2="50%" 
                y2="100%" 
                stroke="#e2e8f0" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
              />
              <motion.line 
                x1="50%" 
                y1="0%" 
                x2="50%" 
                y2="100%" 
                stroke="#94a3b8" 
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              {!shouldReduceMotion && hoveredIndex !== null && (
                <motion.line 
                  x1="50%" 
                  y1="0%" 
                  x2="50%" 
                  y2={`${(hoveredIndex / 3) * 100}%`} 
                  stroke="#8B0000" 
                  strokeWidth="3"
                  className="drop-shadow-[0_0_6px_rgba(139,0,0,0.3)]"
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
                    transition={{ duration: 0.3, delay: index * 0.15 }}
                    className={`w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 relative ${
                      isStepActive 
                        ? 'border-[#8B0000] text-[#8B0000] shadow-[0_0_8px_rgba(139,0,0,0.15)]' 
                        : 'border-slate-200 text-slate-400 group-hover:border-[#8B0000]/60 group-hover:text-[#8B0000]/60'
                    }`}
                  >
                    {step.num}
                  </motion.div>

                  <div className="pt-0.5 text-start">
                    <h4 className={`font-extrabold text-xs sm:text-sm mb-1 uppercase tracking-wider transition-colors duration-300 ${
                      isStepActive ? 'text-[#8B0000]' : 'text-slate-800 group-hover:text-[#8B0000]/85'
                    }`}>
                      {step.title}
                    </h4>
                    
                    <p className="text-[12px] font-medium text-slate-600 leading-relaxed max-w-[40ch]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
