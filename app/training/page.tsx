'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Award, Users, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.13, duration: 0.45, ease: 'easeOut' as const },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.25 + i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export default function TrainingPage() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const features = [
    {
      icon: GraduationCap,
      title: t.trainingPage.features.experts.title,
      description: t.trainingPage.features.experts.description,
    },
    {
      icon: Award,
      title: t.trainingPage.features.certificates.title,
      description: t.trainingPage.features.certificates.description,
    },
    {
      icon: Users,
      title: t.trainingPage.features.interactive.title,
      description: t.trainingPage.features.interactive.description,
    },
  ]

  return (
    <div className="pt-32 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <Container>
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-[#8b0000]/5 text-[#8b0000] px-4 py-1.5 rounded-full mb-3 text-sm"
            variants={fadeUp}
            custom={0}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="font-medium">{t.trainingPage.badge}</span>
          </motion.div>

          <motion.h1
            className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3"
            variants={fadeUp}
            custom={1}
          >
            {t.trainingPage.title}
          </motion.h1>

          <TextGenerateEffect
            words={t.trainingPage.subtitle}
            className="text-base text-gray-600 max-w-xl mx-auto font-normal"
            duration={0.4}
            staggerDelay={0.03}
          />
        </motion.div>

        {/* Features — 3 compact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={scaleIn}
              custom={i}
            >
              <Card className="text-center hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  <motion.div
                    className="w-12 h-12 bg-[#8b0000]/5 rounded-xl flex items-center justify-center mx-auto mb-3"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <feature.icon className="w-6 h-6 text-[#8b0000]" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUp} custom={0}>
            <Card className="overflow-hidden">
              <CardContent className="py-14 text-center relative">
                {/* Decorative background dots */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'radial-gradient(circle, #8b0000 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000]/10 to-[#8b0000]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-[#8b0000]" />
                  </div>
                </motion.div>

                <motion.div
                  className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full mb-4 text-xs font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.trainingPage.emptyTitle}
                </motion.div>

                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto relative">
                  {t.trainingPage.emptyDescription}
                </p>

                <Link href="/contact">
                  <motion.div
                    className="inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button size="sm" className="bg-[#8b0000] hover:bg-[#a01010]">
                      {t.trainingPage.emptyButton}
                      <ArrowIcon className={`w-4 h-4 ${isRTL ? 'mr-1.5' : 'ml-1.5'}`} />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-10 bg-gradient-to-br from-[#8b0000] to-[#a01010] rounded-2xl p-6 lg:p-8 text-center text-white"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-xl lg:text-2xl font-bold mb-2">
            {t.trainingPage.ctaTitle}
          </h2>
          <p className="text-white/80 mb-5 max-w-xl mx-auto text-sm">
            {t.trainingPage.ctaDescription}
          </p>
          <Link href="/contact">
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button size="lg" className="bg-white text-[#8b0000] hover:bg-gray-50">
                {t.trainingPage.ctaButton}
                <ArrowIcon className={`w-4 h-4 ${isRTL ? 'mr-1.5' : 'ml-1.5'}`} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </Container>
    </div>
  )
}
