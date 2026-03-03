'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Building2, Heart, Cpu, GraduationCap } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Sector } from '@/lib/database.types'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2,
  Heart,
  Cpu,
  GraduationCap,
}

interface SectorsSectionProps {
  sectors: Sector[]
}

export function SectorsSection({ sectors }: SectorsSectionProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight


  return (
    <section className="py-16 lg:py-24 bg-white">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t.sectors.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {t.sectors.subtitle}
          </p>
        </motion.div>

          {/* Sectors Grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {sectors.map((sector) => {
              const IconComponent = iconMap[sector.icon || 'Building2'] || Building2
              return (
                <div key={sector.id}>
                  <Link href={`/sectors/${sector.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#8b0000]/5 group-hover:bg-[#8b0000] transition-colors duration-300"
                          >
                            <IconComponent
                              className="w-7 h-7 text-[#8b0000] group-hover:text-white transition-colors duration-300"
                            />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#8b0000] transition-colors">
                              {isRTL ? sector.name_ar : sector.name}
                            </h3>
                            <p className="text-gray-500 mb-4 line-clamp-3">
                              {isRTL ? sector.description_ar : sector.description}
                            </p>
                            <span className="inline-flex items-center text-[#8b0000] text-sm font-medium">
                              {isRTL ? 'اكتشف المزيد' : 'Explore more'}
                              <Arrow className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </motion.div>
      </Container>
    </section>
  )
}
