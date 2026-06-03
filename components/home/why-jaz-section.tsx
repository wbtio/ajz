"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Icon } from "@iconify/react";
import { useI18n } from "@/lib/i18n";

export function WhyJazSection() {
  const { t, locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const shouldReduceMotion = useReducedMotion();

  const D = shouldReduceMotion ? 0 : 0.5;
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const vp = { once: true, margin: "-40px" as const };

  const fadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: D, ease },
    },
  };

  const staggerItems: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 },
    },
  };

  const inView = {
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: vp,
  };

  const pillars = [
    {
      title: t.about.pillarSuccessTitle,
      text: isRTL 
        ? "نقيس أثرنا بمدى نجاح شركائنا، ونحقق نتائج عملية واضحة."
        : "We measure our success by our clients' success and clear, tangible results.",
      icon: "solar:medal-ribbons-star-bold-duotone",
      color: "text-red-700",
      bgColor: "bg-red-50/60 border-red-100",
      num: "01",
    },
    {
      title: t.about.pillarRelationshipsTitle,
      text: isRTL
        ? "نبني شبكات وشراكات استراتيجية مستدامة لتعزيز الحضور التجاري."
        : "We focus on building long-term, high-impact strategic networks.",
      icon: "solar:compass-bold-duotone",
      color: "text-slate-900",
      bgColor: "bg-slate-50/60 border-slate-200/60",
      num: "02",
    },
    {
      title: t.about.pillarOpportunitiesTitle,
      text: isRTL
        ? "نحوّل العلاقات والفعاليات الدولية إلى مسارات نمو وتوسع حقيقي للأعمال."
        : "We turn global events into actionable business expansion pathways.",
      icon: "solar:widget-5-bold-duotone",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50/60 border-emerald-100",
      num: "03",
    },
  ];

  const shortDescription = isRTL
    ? "بوابة العراق الاستراتيجية لربط الطموح المحلي بالمعارض والمؤتمرات الدولية والشبكات الأكثر تأثيراً."
    : "Iraq’s strategic gateway connecting local ambition with premier international exhibitions and global networks.";

  const shortVision = isRTL
    ? "أن نكون البوابة الأكثر موثوقية في العراق نحو قطاع المعارض والمؤتمرات الدولية."
    : "To be Iraq's most trusted gateway to the global arena of exhibitions and conferences.";

  const shortMission = isRTL
    ? "تنسيق منصات استراتيجية يلتقي فيها صناع القرار لدفع عجلة النمو والتوسع."
    : "To coordinate strategic platforms where decision-makers converge to drive expansion.";

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative overflow-hidden bg-slate-50/10 border-y border-slate-200/30 transition-all duration-300 py-10 sm:py-12 lg:py-14"
    >
      <Container className="relative z-10 max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 px-4 items-start">
          {/* Left Column: Clean Strategic Overview */}
          <div className="text-start flex flex-col gap-5 py-1 h-full justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl leading-tight">
                {t.about.sectionSubtitle}
              </h2>
            </div>

            {/* Integrated Badges for Vision/Mission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/50 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.01)] text-start hover:border-slate-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.02)] transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm text-[#8b0000] bg-[#fef2f2] border-[#fee2e2]">
                  <Icon icon="solar:eye-bold-duotone" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider leading-none">{t.about.vision}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{shortVision}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/50 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.01)] text-start hover:border-slate-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.02)] transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm text-[#8b0000] bg-[#fef2f2] border-[#fee2e2]">
                  <Icon icon="solar:target-bold-duotone" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider leading-none">{t.about.mission}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{shortMission}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Pillars (Beautiful spaced cards) */}
          <div className="flex flex-col gap-3.5 justify-center border-t lg:border-t-0 lg:border-s border-slate-200/60 pt-6 lg:pt-0 lg:ps-6 w-full">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-slate-200/40 bg-white/70 p-4 transition-all duration-300 hover:border-red-700/20 hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.03)] text-start"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-all duration-300 text-[#8b0000] bg-[#fef2f2] border-[#fee2e2] group-hover:bg-[#8b0000] group-hover:text-white group-hover:border-[#8b0000]">
                    <Icon icon={pillar.icon} className="h-5 w-5 transition-colors duration-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 leading-none">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#8b0000] transition-colors">
                        {pillar.title}
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-slate-300 font-mono select-none">{pillar.num}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-normal mt-2">
                      {pillar.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
