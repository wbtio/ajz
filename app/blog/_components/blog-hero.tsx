'use client'

import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'
import BlurText from '@/components/ui/blur-text'
import Aurora from '@/components/home/aurora'
import { useRef } from 'react'

interface BlogHeroProps {
  totalPosts: number
}

export function BlogHero({ totalPosts }: BlogHeroProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])
  const heroGlowScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.08])

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
      className="relative z-20 flex flex-col justify-between bg-[#001a33] text-white pt-24 pb-8 sm:pt-26 lg:pt-28 sm:pb-10 lg:pb-12 overflow-hidden"
    >
      {/* Aurora dynamic animated background with readability overlays */}
      <div className="absolute inset-0 overflow-hidden">
        <Aurora
          className="absolute inset-0"
          colorStops={['#052511', '#8B0000', '#001a33']}
          amplitude={1.2}
          blend={0.6}
          speed={0.4}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0, 26, 51,0.75)_0%,rgba(0, 26, 51,0.55)_35%,rgba(0, 26, 51,0.35)_65%,#001a33_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.05),transparent_36%),radial-gradient(circle_at_72%_34%,rgba(139,0,0,0.08),transparent_30%),radial-gradient(circle_at_18%_26%,rgba(22,163,74,0.06),transparent_26%)]" />
        
        {/* Responsive Minimalist News World Map Background Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.12] md:opacity-[0.18] pointer-events-none select-none transition-all duration-700"
          style={{
            backgroundImage: 'url(/news_hero_bg.png)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
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
            className="mt-16 sm:mt-20 lg:mt-24 flex w-full max-w-2xl lg:max-w-3xl flex-col items-start text-start"
          >
            {/* Main Title */}
            <motion.div variants={itemVariants} className="mb-4">
              <h1 className="font-black tracking-[-0.04em] text-white text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] drop-shadow-[0_4px_24px_rgba(255,255,255,0.08)]">
                {t.blogPage.title}
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="w-full">
              <motion.div
                whileInView={shouldReduceMotion ? undefined : { opacity: [0.75, 1, 0.85, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 2.4 }}
              >
                <BlurText
                  text={t.blogPage.subtitle}
                  delay={80}
                  animateBy="words"
                  direction="top"
                  className={`text-start text-slate-300 ${
                    isRTL
                      ? 'max-w-2xl text-[1.04rem] leading-[2.05] sm:text-[1.15rem] md:text-[1.3rem]'
                      : 'max-w-xl text-base leading-relaxed sm:text-lg md:text-xl'
                  }`}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  )
}
