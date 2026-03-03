'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import ColorBends from '@/components/home/color-bends'
import BlurText from '@/components/ui/blur-text'

export function HeroSection() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <section className="relative min-h-[85vh] flex items-center text-white overflow-hidden z-10">
      {/* Background */}
      <div className="absolute inset-0">
        <ColorBends
          className="absolute inset-0"
          colors={["#8b0000", "#a52a2a", "#b87333"]}
          rotation={0}
          speed={0.15}
          scale={1}
          frequency={1}
          warpStrength={0.8}
          mouseInfluence={0.5}
          parallax={0.3}
          noise={0.08}
          transparent
          autoRotate={0}
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Gradient fade into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <Container className="relative pt-32 pb-12 lg:pt-48 lg:pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl flex flex-col items-start"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sm text-gray-200">
              <span className="w-2 h-2 rounded-full bg-[#8b0000] animate-pulse" />
              {t.hero.badge}
            </span>
          </motion.div>

          {/* Decorative accent line */}
          <motion.div
            variants={itemVariants}
            className="w-12 h-0.5 bg-[#8b0000] rounded-full mb-8"
          />

          {/* Logo */}
          <motion.h1
            variants={itemVariants}
            className="mb-8"
          >
            <div className="relative w-64 md:w-80 lg:w-96 aspect-[3/1]">
              <Image
                src="/Joint Annual Zone logo.png"
                alt="Joint Annual Zone Logo"
                fill
                className="object-contain ltr:object-left rtl:object-right"
                priority
              />
            </div>
          </motion.h1>

          {/* Description */}
          <motion.div variants={itemVariants}>
            <BlurText
              text={t.hero.description}
              delay={80}
              animateBy="words"
              direction="top"
              className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed"
            />
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            <Link href="/events">
              <Button size="lg" className="h-12 px-8 bg-[#8b0000] hover:bg-[#a01010] text-white border-none transition-all duration-300 shadow-lg shadow-[#8b0000]/20">
                {t.hero.browseEvents}
                <Arrow className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                {t.hero.contactUs}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
