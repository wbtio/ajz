"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, Variants } from "framer-motion";
import { Icon } from "@iconify/react";
import { Sparkles, Compass, CheckCircle2 } from "lucide-react";
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

export default function ServicesPage() {
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

  const services = [
    {
      title: t.about.matchmakingTitle,
      description: t.about.matchmakingText,
      icon: "solar:global-bold-duotone",
      color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    },
    {
      title: t.about.trainingTitle,
      description: t.about.trainingText,
      icon: "solar:square-academic-cap-bold-duotone",
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    {
      title: t.about.serviceExhibitionTitle,
      description: t.about.serviceExhibitionText,
      icon: "solar:widget-3-bold-duotone",
      color: "bg-red-500/10 text-red-600 border-red-500/20",
    },
    {
      title: t.about.serviceEventMgmtTitle,
      description: t.about.serviceEventMgmtText,
      icon: "solar:calendar-date-bold-duotone",
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    {
      title: t.about.serviceCustomerTitle,
      description: t.about.serviceCustomerText,
      icon: "solar:chat-round-dots-bold-duotone",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
  ];

  const statsItems = isArabic
    ? [
        {
          value: 150,
          label: "مؤتمرات ومعارض دولية",
          icon: "solar:global-bold-duotone",
          suffix: "+",
        },
        {
          value: 45,
          label: "برامج تدريبية معتمدة",
          icon: "solar:square-academic-cap-bold-duotone",
          suffix: "+",
        },
        {
          value: 2500,
          label: "متدرب ومشارك مستفيد",
          icon: "solar:users-group-rounded-bold-duotone",
          suffix: "+",
        },
        {
          value: 98,
          label: "نسبة رضا المؤسسات",
          icon: "solar:like-bold-duotone",
          suffix: "%",
        },
      ]
    : [
        {
          value: 150,
          label: "International Events",
          icon: "solar:global-bold-duotone",
          suffix: "+",
        },
        {
          value: 45,
          label: "Accredited Programs",
          icon: "solar:square-academic-cap-bold-duotone",
          suffix: "+",
        },
        {
          value: 2500,
          label: "Trained Professionals",
          icon: "solar:users-group-rounded-bold-duotone",
          suffix: "+",
        },
        {
          value: 98,
          label: "Client Satisfaction",
          icon: "solar:like-bold-duotone",
          suffix: "%",
        },
      ];

  const valueProps = isArabic
    ? [
        "خبرة محلية عميقة مع رؤية دولية واسعة.",
        "شراكات استراتيجية موثوقة وممتدة لأكثر من عقد.",
        "فريق متخصص يرافقك خطوة بخطوة لتحقيق نتائج قابلة للقياس.",
        "حلول متكاملة تغطي كافة جوانب الفعاليات والتدريب.",
      ]
    : [
        "Deep local expertise with an extensive global vision.",
        "Trusted strategic partnerships spanning over a decade.",
        "A dedicated team guiding you step-by-step to achieve measurable outcomes.",
        "Integrated solutions covering all event and training aspects.",
      ];

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      {/* Hero Section - Matching BlogHero Layout */}
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

          {/* Services Banner Background Image Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.12] md:opacity-[0.18] pointer-events-none select-none transition-all duration-700"
            style={{
              backgroundImage: "url('/services-banner.png')",
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
                  {t.about.servicesTitle}
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
                    text={t.about.servicesHeading}
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

      {/* Services Stats Bar */}
      <StatsBar items={statsItems} overlap={false} />

      {/* Main Content */}
      <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-12 md:py-20 space-y-16 md:space-y-24 mt-8 lg:mt-12">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#8b0000]/5 px-3 py-1 text-xs font-bold text-[#8b0000]">
            <Sparkles className="h-3 w-3" />
            {isArabic ? "بوابتك نحو التميز" : "Your Gateway to Excellence"}
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            {t.about.servicesDescription}
          </p>
        </motion.div>

        {/* Services List Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, idx) => {
            return (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full border-slate-100 hover:border-[#8b0000]/20 hover:shadow-md transition-all duration-300 bg-white group relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8b0000]/60 via-[#8b0000] to-[#8b0000]/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                  <CardContent className="p-6 flex flex-col items-start gap-4 text-start h-full">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-115 ${service.color}`}>
                      <Icon icon={service.icon} className="h-5.5 w-5.5" />
                    </span>
                    <div className="space-y-2 flex-grow">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#8b0000] transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                        {service.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* What sets us apart (Why JAZ) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center border-t border-slate-100 pt-16">
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5 text-start"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#8b0000]/5 px-3 py-1 text-xs font-bold text-[#8b0000]">
              <Compass className="h-3 w-3" />
              {isArabic ? "ريادة وتميز" : "Leadership & Distinction"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
              {t.about.whyTitle}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              {t.about.whyText}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isArabic ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {valueProps.map((prop, idx) => (
              <div key={idx} className="flex items-start gap-3 text-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <span className="text-xs sm:text-sm text-slate-700 font-medium">
                  {prop}
                </span>
              </div>
            ))}
          </motion.div>
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
