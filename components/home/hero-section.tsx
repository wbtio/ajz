'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import BlurText from '@/components/ui/blur-text'
import Grainient from '@/components/home/grainient'
import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CountingNumber } from '@/components/ui/counting-number'
import { Icon } from '@iconify/react'


export function HeroSection() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false
  const scrollLabel = isRTL ? 'مرر للأسفل' : 'Scroll'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])
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
      dir={dir}
      lang={locale}
      className="relative z-20 flex flex-col justify-between bg-[#0b1426] text-white pt-24 pb-0 sm:pt-28 lg:pt-30"
    >
      {/* Grainient background with readability overlays */}
      <div className="absolute inset-0 overflow-hidden">
        <Grainient
          className="absolute inset-0"
          color1="#0b1426"
          color2="#420606"
          color3="#052511"
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
          grainAmount={0.08}
          grainScale={2}
          grainAnimated={false}
          contrast={1.3}
          gamma={1.1}
          saturation={0.9}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,38,0.7)__0%,rgba(11,20,38,0.5)_35%,rgba(11,20,38,0.3)_65%,#0b1426_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.05),transparent_36%),radial-gradient(circle_at_72%_34%,rgba(139,0,0,0.08),transparent_30%),radial-gradient(circle_at_18%_26%,rgba(22,163,74,0.06),transparent_26%)]" />
        
        {/* Responsive Minimalist World Map Background Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] md:opacity-[0.09] pointer-events-none select-none transition-all duration-700"
          style={{
            backgroundImage: 'url(/world-map.svg)',
            backgroundPosition: 'center 0%',
            backgroundSize: '130% auto',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <motion.div
          style={{ scale: heroGlowScale }}
          className="absolute inset-x-[5%] top-0 h-[18rem] rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.06),transparent_65%)] blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(22,163,74,0.04),transparent_45%)]" />
        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15], scaleX: [0.92, 1.08, 0.92] }}
          transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-[12%] bottom-[30%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <div className="home-grid-transition absolute inset-x-0 bottom-0 h-[19rem] opacity-40" />
        <div className="absolute bottom-[-5.5rem] left-1/2 h-[12rem] w-[min(120%,88rem)] -translate-x-1/2 rounded-[100%] bg-white/5 blur-3xl" />
      </div>

      <Container className="relative max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full flex justify-start">
        <div className="flex flex-col items-start justify-start w-full text-start">
          {/* Text Content */}
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="-mt-2 flex w-full max-w-2xl lg:max-w-3xl flex-col items-start text-start lg:-mt-8"
          >
            {/* Badge (Hidden but occupies the same layout space to prevent shifting) */}
            <motion.div variants={itemVariants} className="mb-6 invisible pointer-events-none select-none" aria-hidden="true">
              <span
                className={`relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/90 backdrop-blur-md shadow-sm ${
                  isRTL ? 'text-[0.95rem] leading-7' : 'text-sm'
                }`}
              >
                <motion.span
                  aria-hidden="true"
                  animate={shouldReduceMotion ? undefined : { x: isRTL ? ['140%', '-180%'] : ['-140%', '180%'] }}
                  transition={shouldReduceMotion ? undefined : { duration: 3.8, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
                  className="absolute inset-y-0 start-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="h-2 w-2 rounded-full bg-red-deep shadow-[0_0_8px_rgba(139,0,0,0.6)]" />
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Logo */}
            <motion.h1 variants={itemVariants} className="mb-4">
              <motion.div
                style={{ y: logoY }}
                animate={shouldReduceMotion ? undefined : { rotate: [0, 0.45, 0], scale: [1, 1.015, 1] }}
                transition={shouldReduceMotion ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-[3/1] w-56 drop-shadow-[0_4px_24px_rgba(255,255,255,0.08)] sm:w-64 md:w-80 lg:w-[26rem]"
              >
                <Image
                  src="/Joint Annual Zone logo.png"
                  alt="Joint Annual Zone Logo"
                  fill
                  sizes="(max-width: 768px) 224px, (max-width: 1024px) 256px, 416px"
                  className={`object-contain py-1.5 brightness-0 invert ${isRTL ? 'object-right' : 'object-left'}`}
                  priority
                />
              </motion.div>
            </motion.h1>

            {/* Main Title */}
            {t.hero.subtitle && (
              <motion.div variants={itemVariants} className="mb-4">
                {/* Element completely removed per user request */}
              </motion.div>
            )}

            {/* Description */}
            <motion.div variants={itemVariants} className="w-full">
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
                  className={`mb-6 text-start text-navy-200/90 ${
                    isRTL
                      ? 'max-w-2xl text-[1.04rem] leading-[2.05] sm:text-[1.15rem] md:text-[1.3rem]'
                      : 'max-w-xl text-base leading-relaxed sm:text-lg md:text-xl'
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 w-full sm:w-auto">
              <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  size="lg"
                  className="min-h-12 bg-red-deep text-white hover:bg-red-deep-hover px-8 rounded-xl shadow-md shadow-red-deep/20 hover:shadow-lg hover:shadow-red-deep/40 transition-all duration-300"
                >
                  <Link href="/events">
                    {t.hero.browseEvents}
                    <Arrow className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-h-12 border-white/15 bg-white/5 px-8 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 rounded-xl shadow-sm hover:shadow-md"
                >
                  <Link href="/contact">
                    {t.hero.contactUs}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* Floating Executive Stats Card (Edge-to-Edge Divider with no entrance sliding animation) */}
      <div className="relative z-30 w-full mt-4 sm:mt-6 lg:mt-8 -mb-7 sm:-mb-8 lg:-mb-10">
        <div className="w-full bg-[#0b1426]/95 backdrop-blur-xl border-y border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)] py-2.5 sm:py-3">
          <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 divide-x rtl:divide-x-reverse divide-white/10">
              {/* Stat 1 */}
              <div className="flex items-center justify-center p-0.5 sm:p-1 gap-2.5 sm:gap-4">
                <Icon icon="solar:stars-minimalistic-bold-duotone" className="text-white/90 h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                <div className="flex flex-col items-start text-start">
                  <span className="text-base sm:text-xl lg:text-3.5xl font-black text-white flex items-center gap-0.5 leading-none">
                    <CountingNumber number={150} inView />
                    <span className="text-red-deep">+</span>
                  </span>
                  <span className="mt-1 text-[7px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none rtl:tracking-normal rtl:normal-case">
                    {isRTL ? 'الفعاليات المنظمة' : 'Elite Events'}
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center justify-center p-0.5 sm:p-1 gap-2.5 sm:gap-4">
                <Icon icon="solar:widget-5-bold-duotone" className="text-white/90 h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                <div className="flex flex-col items-start text-start">
                  <span className="text-base sm:text-xl lg:text-3.5xl font-black text-white flex items-center gap-0.5 leading-none">
                    <CountingNumber number={24} inView />
                    <span className="text-red-deep">+</span>
                  </span>
                  <span className="mt-1 text-[7px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none rtl:tracking-normal rtl:normal-case">
                    {isRTL ? 'القطاعات الحيوية' : 'Active Sectors'}
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center justify-center p-0.5 sm:p-1 gap-2.5 sm:gap-4">
                <Icon icon="solar:compass-bold-duotone" className="text-white/90 h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                <div className="flex flex-col items-start text-start">
                  <span className="text-base sm:text-xl lg:text-3.5xl font-black text-white flex items-center gap-0.5 leading-none">
                    <CountingNumber number={48} inView />
                    <span className="text-red-deep">+</span>
                  </span>
                  <span className="mt-1 text-[7px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none rtl:tracking-normal rtl:normal-case">
                    {isRTL ? 'الشركاء الدوليين' : 'Global Partners'}
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center justify-center p-0.5 sm:p-1 gap-2.5 sm:gap-4">
                <Icon icon="solar:square-academic-cap-bold-duotone" className="text-white/90 h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                <div className="flex flex-col items-start text-start">
                  <span className="text-base sm:text-xl lg:text-3.5xl font-black text-white flex items-center gap-0.5 leading-none">
                    <CountingNumber number={12} inView />
                    <span className="text-red-deep">k+</span>
                  </span>
                  <span className="mt-1 text-[7px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none rtl:tracking-normal rtl:normal-case">
                    {isRTL ? 'الحضور النخبوي' : 'Elite Attendees'}
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </motion.section>
  )
}
