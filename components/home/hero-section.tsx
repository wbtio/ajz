'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import BlurText from '@/components/ui/blur-text'
import Grainient from '@/components/home/grainient'
import { useEffect, useRef, useState } from 'react'

interface HeroStat {
  value: number
  suffix?: string
  labelAr: string
  labelEn: string
}

function AnimatedMetric({
  value,
  suffix = '',
  locale,
  shouldReduceMotion,
  delayMs = 0,
}: {
  value: number
  suffix?: string
  locale: string
  shouldReduceMotion: boolean
  delayMs?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return

    let animationFrame = 0
    let timeoutId = 0
    const duration = 2200

    const startAnimation = () => {
      const startTime = performance.now()

      const updateValue = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 4)
        setDisplayValue(Math.round(value * easedProgress))

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(updateValue)
        }
      }

      animationFrame = window.requestAnimationFrame(updateValue)
    }

    timeoutId = window.setTimeout(startAnimation, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [delayMs, shouldReduceMotion, value])

  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-IQ' : 'en-US')
  const renderedValue = shouldReduceMotion ? value : displayValue

  return (
    <>
      {formatter.format(renderedValue)}
      {suffix}
    </>
  )
}

export function HeroSection() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false
  const scrollLabel = isRTL ? 'مرر للأسفل' : 'Scroll'
  const heroStats: HeroStat[] = [
    { value: 10, labelAr: 'سنوات الخبرة', labelEn: 'Years of Experience' },
    { value: 15, suffix: '+', labelAr: 'الدول', labelEn: 'Countries' },
    { value: 4500, suffix: '+', labelAr: 'عميل', labelEn: 'Trusted by customers' },
    { value: 560, labelAr: 'حدث', labelEn: 'Events' },
  ]
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])
  const orbY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, -48])
  const orbX = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, isRTL ? -28 : 28])
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

  const statsContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.16,
      },
    },
  }

  const statItemVariants: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.72,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <motion.section
      ref={sectionRef}
      dir={dir}
      lang={locale}
      className="relative z-20 flex min-h-[100dvh] items-center overflow-hidden text-slate-950"
    >
      {/* Grainient background with readability overlays */}
      <div className="absolute inset-0">
        <Grainient
          className="absolute inset-0"
          color1="#f6fbfb"
          color2="#ff5b5b"
          color3="#dff3d9"
          timeSpeed={shouldReduceMotion ? 0 : 0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.56)_0%,rgba(15,23,42,0.32)_24%,rgba(255,255,255,0.08)_52%,rgba(255,255,255,0.18)_74%,rgba(248,250,252,0.3)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.32),transparent_36%),radial-gradient(circle_at_72%_34%,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_18%_26%,rgba(255,255,255,0.14),transparent_26%)]" />
        {/* Top graphite glow */}
        <motion.div
          style={{ scale: heroGlowScale }}
          className="absolute inset-x-[5%] top-0 h-[18rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.3),transparent_65%)] blur-3xl"
        />
        {/* Silver mid glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.24),transparent_45%)]" />

        {/* Shimmer line */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15], scaleX: [0.92, 1.08, 0.92] }}
          transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-[12%] bottom-[30%] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        {/* Slate orb top-right */}
        <motion.div
          style={{ y: orbY, x: orbX }}
          className="absolute end-[4%] -top-16 h-44 w-44 rounded-full bg-white/18 blur-3xl sm:end-[8%] sm:-top-20 sm:h-72 sm:w-72"
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
        <div className="absolute bottom-[-5.5rem] left-1/2 h-[12rem] w-[min(120%,88rem)] -translate-x-1/2 rounded-[100%] bg-white/95 blur-3xl" />
      </div>

      <Container className="relative max-w-[1680px] px-4 pt-24 pb-14 sm:px-6 sm:pt-28 sm:pb-16 lg:px-10 lg:pt-48 lg:pb-24 xl:px-14 2xl:px-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,44rem)_1fr]">
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="-mt-2 me-auto flex w-full max-w-3xl flex-col items-start text-start lg:-mt-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span
                className={`relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full border border-slate-700/15 bg-white/45 px-4 py-2 text-slate-900 backdrop-blur-md ${
                  isRTL ? 'text-[0.95rem] leading-7' : 'text-sm'
                }`}
              >
                <motion.span
                  aria-hidden="true"
                  animate={shouldReduceMotion ? undefined : { x: isRTL ? ['140%', '-180%'] : ['-140%', '180%'] }}
                  transition={shouldReduceMotion ? undefined : { duration: 3.8, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
                  className="absolute inset-y-0 start-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                <span className="h-2 w-2 rounded-full bg-slate-700/75" />
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Decorative accent line */}
            {/* (removed) Decorative accent line */}

            {/* Logo */}
            <motion.h1 variants={itemVariants} className="mb-8">
              <motion.div
                style={{ y: logoY }}
                animate={shouldReduceMotion ? undefined : { rotate: [0, 0.45, 0], scale: [1, 1.015, 1] }}
                transition={shouldReduceMotion ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-[3/1] w-56 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] sm:w-64 md:w-80 lg:w-96"
              >
                <div className="absolute bottom-0 start-0 top-[6px] z-0 w-[168px] max-w-full">
                  <Image
                    src="/Joint Annual Zone logo.png"
                    alt="Joint Annual Zone Logo"
                    fill
                    className="object-contain object-start py-1.5"
                    priority
                  />
                </div>
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
                  className={`mb-8 text-start text-slate-700 sm:mb-10 ${
                    isRTL
                      ? 'max-w-2xl text-[1.04rem] leading-[2.05] sm:text-[1.15rem] md:text-[1.3rem]'
                      : 'max-w-xl text-base leading-relaxed sm:text-lg md:text-xl'
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="mb-8 w-full sm:mb-10">
              <motion.div
                variants={statsContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
              >
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.labelEn}
                    variants={statItemVariants}
                    whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-white/40 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,255,255,0.36))] shadow-[0_24px_65px_rgba(148,163,184,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-500 hover:border-white/65 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,255,255,0.42))] hover:shadow-[0_28px_75px_rgba(148,163,184,0.24),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  >
                    <div className="pointer-events-none absolute inset-[1px] rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.36),rgba(255,255,255,0.1)_46%,rgba(255,255,255,0.14)_100%)]" />
                    <motion.div
                      aria-hidden="true"
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              opacity: [0.5, 0.82, 0.5],
                              scale: [0.96, 1.04, 0.96],
                              x: isRTL ? [0, -12, 0] : [0, 12, 0],
                              y: [0, -8, 0],
                            }
                      }
                      transition={
                        shouldReduceMotion
                          ? undefined
                          : { duration: 7.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: index * 0.35 }
                      }
                      className="pointer-events-none absolute -start-10 -top-14 h-28 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.55)_34%,rgba(255,236,210,0.22)_56%,transparent_78%)] blur-2xl"
                    />
                    <div
                      className="pointer-events-none absolute -end-10 top-[42%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.16)_0%,rgba(255,255,255,0.18)_45%,transparent_75%)] opacity-75 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-10 h-24 w-28 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.2)_0%,rgba(255,255,255,0.14)_44%,transparent_74%)] opacity-70 blur-[34px] transition-opacity duration-500 group-hover:opacity-100 start-[14%]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                    <motion.div
                      aria-hidden="true"
                      animate={shouldReduceMotion ? undefined : { x: isRTL ? ['140%', '-175%'] : ['-140%', '175%'], opacity: [0, 0.12, 0.42, 0.1, 0] }}
                      transition={shouldReduceMotion ? undefined : { duration: 5.4, repeat: Infinity, repeatDelay: 1.25, ease: 'linear', delay: index * 0.22 }}
                      className={`pointer-events-none absolute inset-y-0 w-[62%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),rgba(255,255,255,0.88),rgba(255,255,255,0.18),transparent)] ${
                        isRTL ? 'right-[-35%] skew-x-[24deg]' : 'left-[-35%] skew-x-[-24deg]'
                      }`}
                    />
                    <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    <div className="relative flex min-h-24 flex-col items-start justify-center gap-2.5 p-4 text-start sm:min-h-28 sm:p-4">
                      <div className="flex w-full flex-col items-start gap-1.5">
                        <span className="text-2xl font-black leading-none text-slate-950 drop-shadow-[0_8px_18px_rgba(255,255,255,0.45)] sm:text-3xl">
                          <AnimatedMetric
                            value={stat.value}
                            suffix={stat.suffix}
                            locale={locale}
                            shouldReduceMotion={shouldReduceMotion}
                            delayMs={shouldReduceMotion ? 0 : 320 + index * 150}
                          />
                        </span>
                        <p className={`text-sm font-medium text-slate-600 sm:text-[0.95rem] ${isRTL ? 'leading-7' : 'leading-5'}`}>
                          {isRTL ? stat.labelAr : stat.labelEn}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="w-full sm:w-auto">
              <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-h-12 w-full border-slate-700/20 bg-white/55 px-8 text-slate-900 backdrop-blur-sm transition-all duration-300 hover:border-slate-700/35 hover:bg-white/75 sm:w-auto"
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
          className="pointer-events-none absolute bottom-14 end-6 z-20 hidden flex-col gap-4 md:flex lg:end-12"
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
              className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent"
            />
          ))}
        </motion.div>
      </Container>

      {/* Fade to slate-50 at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-72 bg-[linear-gradient(to_top,#ffffff_0%,rgba(255,255,255,0.96)_28%,rgba(255,255,255,0.66)_58%,transparent_100%)]" />

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: scrollCueOpacity }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 1.1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span
          className={`font-medium text-slate-700/80 ${
            isRTL
              ? 'text-[0.72rem] tracking-[0.12em]'
              : 'text-[0.65rem] uppercase tracking-[0.32em]'
          }`}
        >
          {scrollLabel}
        </span>
        <div className="flex h-14 w-8 justify-center rounded-full border border-slate-700/20 bg-white/40 backdrop-blur-sm">
          <motion.span
            animate={shouldReduceMotion ? undefined : { y: [6, 24, 6], opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
            transition={shouldReduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-2 h-2.5 w-2.5 rounded-full bg-slate-700/80"
          />
        </div>
      </motion.div>
    </motion.section>
  )
}
