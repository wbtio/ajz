'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Icon } from '@iconify/react'

export function OurServices() {
  const { t, locale, dir } = useI18n()
  const shouldReduceMotion = useReducedMotion() ?? false

  const services = (t.homepage.services.items || []).slice(0, 4)

  // Nice premium icons for the 8 services
  const icons = [
    'solar:globus-bold-duotone',                         // International Exhibition
    'solar:users-group-two-rounded-bold-duotone',        // Delegation Management
    'solar:letter-bold-duotone',                         // Invitation Letter
    'solar:handshake-bold-duotone',                      // B2B Matchmaking
    'solar:calendar-mark-bold-duotone',                  // Event Org
    'solar:link-bold-duotone',                           // Partnership Dev
    'solar:compass-bold-duotone',                        // Market Entry
    'solar:shield-user-bold-duotone'                     // Gov Liaison
  ]

  return (
    <div className="w-full text-start" data-purpose="our-services">
      <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-200/60 pb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.services.title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {services.map((service: string, index: number) => (
          <motion.div
            key={index}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.01 }}
            className="border border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-[#8B0000]/20 p-4 rounded-xl text-center flex flex-col items-center justify-center min-h-[96px] transition-all duration-300 hover:shadow-md group"
          >
            <div className="text-slate-500 group-hover:text-[#8B0000] transition-colors duration-300 mb-2">
              <Icon icon={icons[index % icons.length]} className="w-5.5 h-5.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug text-center max-w-[20ch]">
              {service}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
