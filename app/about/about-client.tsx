"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, Variants } from "framer-motion";
import { Target, Eye, Handshake, Trophy, Sparkles, Award } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { ContactBanner } from "@/components/shared/contact-banner";
import { StatsBar } from "@/components/shared/stats-bar";
import Aurora from "@/components/home/aurora";
import BlurText from "@/components/ui/blur-text";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function AboutClient() {
  const { t, locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const shouldReduceMotion = useReducedMotion() ?? false;

  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 72]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6]);
  const heroGlowScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.08]);

  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const statsItems = [
    {
      value: 50,
      suffix: "+",
      label: isArabic ? "معرض ناجح" : "Successful Exhibitions",
      icon: "solar:widget-3-bold-duotone",
    },
    {
      value: 100,
      suffix: "K+",
      label: isArabic ? "زائر" : "Visitors",
      icon: "solar:users-group-rounded-bold-duotone",
    },
    {
      value: 200,
      suffix: "+",
      label: isArabic ? "شريك استراتيجي" : "Partners",
      icon: "solar:handshake-bold-duotone",
    },
    {
      value: 10,
      suffix: "+",
      label: isArabic ? "سنوات خبرة" : "Years Experience",
      icon: "solar:stars-minimalistic-bold-duotone",
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      {/* Hero Section - Replicated Premium Layout */}
      <motion.section
        ref={sectionRef}
        dir={dir}
        lang={locale}
        className="relative z-20 flex flex-col justify-between bg-[#0b1426] text-white pt-24 pb-8 sm:pt-26 lg:pt-28 sm:pb-10 lg:pb-12 overflow-hidden"
      >
        {/* Aurora dynamic animated background with readability overlays */}
        <div className="absolute inset-0 overflow-hidden">
          <Aurora
            className="absolute inset-0"
            colorStops={["#052511", "#8B0000", "#0b1426"]}
            amplitude={1.2}
            blend={0.6}
            speed={0.4}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,38,0.75)_0%,rgba(11,20,38,0.55)_35%,rgba(11,20,38,0.35)_65%,#0b1426_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.05),transparent_36%),radial-gradient(circle_at_72%_34%,rgba(139,0,0,0.08),transparent_30%),radial-gradient(circle_at_18%_26%,rgba(22,163,74,0.06),transparent_26%)]" />

          {/* About Banner Background Image Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.12] md:opacity-[0.18] pointer-events-none select-none transition-all duration-700"
            style={{
              backgroundImage: "url('/about-banner.png')",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />

          <motion.div
            style={{ scale: heroGlowScale }}
            className="absolute inset-x-[5%] top-0 h-[18rem] rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.06),transparent_65%)] blur-3xl"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(22,163,74,0.04),transparent_45%)]" />
          <motion.div
            animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15], scaleX: [0.92, 1.08, 0.92] }}
            transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
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
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 sm:mt-10 lg:mt-14 flex w-full max-w-2xl lg:max-w-3xl flex-col items-start text-start"
            >
              {/* Main Title */}
              <motion.div variants={heroItemVariants} className="mb-4">
                <h1 className="font-black tracking-[-0.04em] text-white text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] drop-shadow-[0_4px_24px_rgba(255,255,255,0.08)]">
                  {t.about.title}
                </h1>
              </motion.div>

              {/* Description */}
              <motion.div variants={heroItemVariants} className="w-full">
                <motion.div
                  whileInView={shouldReduceMotion ? undefined : { opacity: [0.75, 1, 0.85, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.4 }}
                >
                  <BlurText
                    text={t.about.sectionSubtitle}
                    delay={80}
                    animateBy="words"
                    direction="top"
                    className={`text-start text-navy-200/90 ${
                      isArabic
                        ? "max-w-2xl text-[1.04rem] leading-[2.05] sm:text-[1.15rem] md:text-[1.3rem]"
                        : "max-w-xl text-base leading-relaxed sm:text-lg md:text-xl"
                    }`}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </motion.section>

      {/* Stats Bar */}
      <StatsBar items={statsItems} overlap={false} />

      {/* Main Content */}
      <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-12 md:py-20 space-y-16 md:space-y-24 mt-8 lg:mt-12">
        {/* About Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#8b0000]/5 px-3 py-1 text-xs font-bold text-[#8b0000]">
            <Sparkles className="h-3 w-3" />
            {t.about.aboutLabel}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 leading-tight">
            {t.about.partnerTitle}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            {t.about.longDescription}
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            {t.about.partnerText}
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-slate-100 hover:border-[#8b0000]/20 hover:shadow-md transition-all duration-300 bg-white">
              <CardContent className="p-6 sm:p-8 flex items-start gap-4 text-start">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b0000]/10 text-[#8b0000]">
                  <Target className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                    {t.about.mission}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                    {t.about.missionText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full border-slate-100 hover:border-[#8b0000]/20 hover:shadow-md transition-all duration-300 bg-white">
              <CardContent className="p-6 sm:p-8 flex items-start gap-4 text-start">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b0000]/10 text-[#8b0000]">
                  <Eye className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                    {t.about.vision}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                    {t.about.visionText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pillars */}
        <div className="space-y-10 md:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              {t.about.pillarsTitle}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
              {t.about.pillarsDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            <Card className="border-slate-100 bg-white group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#8b0000] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              <CardContent className="p-6 flex flex-col h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Trophy className="h-5 w-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-[#8b0000] transition-colors duration-300">
                  {t.about.pillarSuccessTitle}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 flex-grow">
                  {t.about.pillarSuccessText}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#8b0000] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              <CardContent className="p-6 flex flex-col h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Handshake className="h-5 w-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-[#8b0000] transition-colors duration-300">
                  {t.about.pillarRelationshipsTitle}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 flex-grow">
                  {t.about.pillarRelationshipsText}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#8b0000] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              <CardContent className="p-6 flex flex-col h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Award className="h-5 w-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-[#8b0000] transition-colors duration-300">
                  {t.about.pillarOpportunitiesTitle || (isArabic ? "خلق الفرص" : "Creating Opportunities")}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 flex-grow">
                  {t.about.pillarOpportunitiesText || (isArabic ? "نربط قطاع الأعمال بالمعارض والمؤتمرات الدولية الأكثر تأثيراً." : "We connect businesses with the most impactful international exhibitions.")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>

      {/* Footer Contact Banner */}
      <ContactBanner
        title={t.blogPage.contactBanner.title}
        description={t.blogPage.contactBanner.description}
        ctaLabel={t.blogPage.contactBanner.cta}
        ctaHref="/contact"
        className="mt-12 sm:mt-14 lg:mt-20"
      />
    </div>
  );
}
