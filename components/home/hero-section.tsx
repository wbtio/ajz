'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import ColorBends from '@/components/home/color-bends'

export function HeroSection() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <section className="relative min-h-[85vh] flex items-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <ColorBends
            className="absolute inset-0"
            colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
            rotation={0}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.1}
            transparent
            autoRotate={0}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>


      <Container className="relative pt-32 pb-12 lg:pt-48 lg:pb-20 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              {t.hero.title}
            </span>
            <br />
            <span className="text-white">
              {t.hero.subtitle}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-200 mb-10 max-w-xl leading-relaxed"
          >
            {t.hero.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-5 mb-16"
          >
            <Link href="/events">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 border-none">
                  {t.hero.browseEvents}
                  <Arrow className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </motion.div>
            </Link>
            <Link href="/contact">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                  {t.hero.contactUs}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

      </Container>
    </section>
  )
}
