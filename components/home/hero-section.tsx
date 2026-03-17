'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import BlurText from '@/components/ui/blur-text'
import Aurora from '@/components/home/aurora'
import { useRef } from 'react'

export function HeroSection() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion()
  const scrollLabel = isRTL ? 'مرر للأسفل' : 'Scroll'
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])
  const orbY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -48])
  const orbX = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 28])
  const mapScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.03])
  const logoY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -18])
  const heroGlowScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.08])
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.22], shouldReduceMotion ? [0.9, 0.9] : [0.95, 0])

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
    <motion.section
      ref={sectionRef}
      className="relative z-20 flex min-h-[92vh] items-center overflow-hidden text-white sm:min-h-[95vh]"
    >
      {/* Red + gray at top, white at bottom */}
      <div className="absolute inset-0">
        {/* Main gradient: red+gray top → slate-50 bottom */}
        <div className="absolute inset-0 bg-[linear-gradient(170deg,#8b0000_0%,#991b1b_12%,#4b5563_42%,#9ca3af_62%,#f9fafb_80%,#f8fafc_100%)]" />
        <Aurora
          className="absolute inset-0"
          colorStops={['#c0392b', '#7f8c8d', '#bdc3c7']}
          blend={0.30}
          amplitude={0.7}
          speed={shouldReduceMotion ? 0.2 : 0.6}
        />
        {/* Top red glow */}
        <motion.div
          style={{ scale: heroGlowScale }}
          className="absolute inset-x-[5%] top-0 h-[18rem] rounded-full bg-[radial-gradient(circle,rgba(185,28,28,0.35),transparent_65%)] blur-3xl"
        />
        {/* Gray mid glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(107,114,128,0.18),transparent_45%)]" />

        {/* Shimmer line */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15], scaleX: [0.92, 1.08, 0.92] }}
          transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-[12%] bottom-[30%] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        {/* Red orb top-right */}
        <motion.div
          style={{ y: orbY, x: orbX }}
          className="absolute -top-16 right-[4%] h-44 w-44 rounded-full bg-red-900/30 blur-3xl sm:-top-20 sm:right-[8%] sm:h-72 sm:w-72"
        />
        {/* Decorative circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
          className="absolute left-[8%] top-[16%] h-16 w-16 rounded-full border border-white/15 sm:left-[10%] sm:top-[18%] sm:h-28 sm:w-28"
        />
        {/* Thin white line accent */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
          className="absolute inset-x-[18%] top-[22%] h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
        />

        <div className="home-grid-transition absolute inset-x-0 bottom-0 h-[19rem] opacity-75" />
        <div className="absolute bottom-[-5.5rem] left-1/2 h-[12rem] w-[min(120%,88rem)] -translate-x-1/2 rounded-[100%] bg-slate-50/90 blur-3xl" />
      </div>

      {/* Fade to slate-50 at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-72 bg-[linear-gradient(to_top,#f8fafc_0%,rgba(248,250,252,0.92)_28%,rgba(248,250,252,0.54)_58%,transparent_100%)]" />

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: scrollCueOpacity }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 1.1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-white/60">
          {scrollLabel}
        </span>
        <div className="flex h-14 w-8 justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
          <motion.span
            animate={shouldReduceMotion ? undefined : { y: [6, 24, 6], opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
            transition={shouldReduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-2 h-2.5 w-2.5 rounded-full bg-white/80"
          />
        </div>
      </motion.div>

      <Container className="relative max-w-[1680px] px-4 pt-24 pb-14 sm:px-6 sm:pt-28 sm:pb-16 lg:px-10 lg:pt-48 lg:pb-24 xl:px-14 2xl:px-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,44rem)_1fr]">
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`-mt-2 mr-auto flex w-full max-w-3xl flex-col lg:-mt-8 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                <motion.span
                  aria-hidden="true"
                  animate={shouldReduceMotion ? undefined : { x: ['-140%', '180%'] }}
                  transition={shouldReduceMotion ? undefined : { duration: 3.8, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="h-2 w-2 rounded-full bg-white/70" />
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Decorative accent line */}
            <motion.div
              variants={itemVariants}
              className={`mb-7 h-0.5 w-12 rounded-full bg-white/60 ${isRTL ? 'origin-right' : 'origin-left'}`}
            />

            {/* Logo */}
            <motion.h1 variants={itemVariants} className="mb-8">
              <motion.div
                style={{ y: logoY }}
                animate={shouldReduceMotion ? undefined : { rotate: [0, 0.45, 0], scale: [1, 1.015, 1] }}
                transition={shouldReduceMotion ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-[3/1] w-56 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] sm:w-64 md:w-80 lg:w-96"
              >
                <Image
                  src="/Joint Annual Zone logo.png"
                  alt="Joint Annual Zone Logo"
                  fill
                  className="object-contain ltr:object-left rtl:object-right"
                  priority
                />
              </motion.div>
            </motion.h1>

            {/* Description */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileInView={shouldReduceMotion ? undefined : { opacity: [0.75, 1, 0.85, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 2.4 }}
              >
                <BlurText
                  text={t.hero.description}
                  delay={80}
                  animateBy="words"
                  direction="top"
                  className="mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:mb-10 sm:text-lg md:text-xl"
                />
              </motion.div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="w-full sm:w-auto">
              <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-h-12 w-full px-8 border-white/30 text-white bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 sm:w-auto"
                >
                  <Link href="/contact">
                    {t.hero.contactUs}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative side lines */}
        <motion.div
          style={{ scale: mapScale }}
          className={`pointer-events-none absolute bottom-14 ${isRTL ? 'left-6 lg:left-12' : 'right-6 lg:right-12'} hidden md:flex flex-col gap-4 z-20`}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
              whileInView={{ opacity: 0.4, x: 0 }}
              animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15], scaleX: [0.92, 1.08, 0.92] }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 3.8,
                delay: shouldReduceMotion ? 0 : index * 0.18,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              className="h-px w-32 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
            />
          ))}
        </motion.div>
      </Container>
    </motion.section>
  )
}
