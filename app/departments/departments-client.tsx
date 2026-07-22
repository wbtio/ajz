"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Icon as Iconify } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import type { Tables } from "@/lib/database.types";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/ui/container";
import { SectorsStats, type SectorsStatsData } from "./_components/sectors-stats";

// Dynamic content block to support both English and Arabic
const translationsContent = {
  en: {
    heroTitle: "Our Departments",
    heroSubtitle:
      "Our Company operates through specialized departments that reflect the nature of the exhibitions, conferences, and professional events it organizes and coordinates participation in. These departments aim to direct each participation according to the appropriate professional and institutional field, helping institutions, businesses, and professionals’ access specialized events relevant to their areas of work.",
    heroBadges: ["Integrated Expertise", "Shared Resources", "Unified Impact"],
    exploreBtn: "Explore Department",
    cards: [
      {
        key: "medical",
        title: "Healthcare & Life Sciences",
        description:
          "This department covers specialized events in the healthcare and medical sectors, including medical equipment, laboratories, pharmaceutical industries, and health technologies.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtsY4UUmC9TD6oSqkKphpcJbWL8sZmm4jJ34FcysFP9gSNO5Vp9el_GAKlQ8MhRxnxWXKJH9dTXmkuJkVHWYUQSLyzissZgJ2s_Kk2TZMySbTjivMNlfGnLiHyAMQUMi0uY9kPDUPVoPxfWJQzFlGtb3v5bEooiuHLcmj8b5gXtOy_rIHaYRv8QigSVLErSfL-NCKAtLcMGFn-kKD_W1zamVJa4Vlw0CNGKHps-7NdNsDDTYz45TPx4Ck0",
        icon: "solar:heart-bold-duotone",
      },
      {
        key: "technology",
        title: "Digital Transformation & Technology",
        description:
          "This department focuses on events related to technology, digital solutions, artificial intelligence, cybersecurity, and technological innovation.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLvGTBekZcvHqm7N_vXxKbBpia_f_jNhqevl_O75wQ4TK9g5gQqYDecKFlXamJVxxVCEHzU7tWBVxoc57zsdplCP1Hj4eqT88Ig2HIwStwyKdNlMChnGMg93Ldt3-7iR52_OBkNslMINODDlNcgAKnbsSrvLZppP0-NemhzjwjCVffvLnBOQ9i-lAtJbGxYlCULVBB0uYRHXqrPOXaZ8bdJztkmlFUSSz7Vg9y49h9TyhWPapW9QgIlSFrE",
        icon: "solar:cpu-bold-duotone",
      },
      {
        key: "industrie",
        title: "Industrial & Commercial Development",
        description:
          "This department focuses on exhibitions and conferences related to industrial and commercial sectors, including industry, trade, investment, construction, energy, and logistics.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLuk7UztS2hVIu9xIkG9xXbWkEcW8suoCErbbKKlOLvfvpk8zBp17krsepaxcXmiplSGIwPn43awogB_vPtx2J2j_v3nZ-4ep8EvSmKsjmQ2xPHt2dlOcaKsclJ397FaQ0Qqa0CoNs9SK8xFOa2FLy_fl5VFfKf_jKIdK1XlWWOzG_MFDPllZLw-IGU8o2Oj2ChLe0liENqpxPyhmaOSyAKSAOrIQn8zJEW1BuBZlFe6wU7w5a-9ivYYxpw",
        icon: "solar:city-bold-duotone",
      },
      {
        key: "academia",
        title: "Professional & Academic Affairs",
        description:
          "This department covers scientific conferences, professional programs, academic events, and opportunities for knowledge and expertise exchange.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtyF7fetE60NNg0VrvyIJMQ1O3imIeX6iMzqDOLUytKFVuDJqgvcmFHsDcD8J8A6oVLqQ02CFyan17hYa5VdhwEozN_WUNAsv_nFHUzckC5fxOh52snVzFz44mhaeIFr6wQo2Sf_kGsepJq5V0DlOOenjYL4dWuwErLLrxQIgyZCXaKPtxzPqK_OEoC1H00p8TBKl8Py2paHTWPcOoHo0zZXA8wKLyKsQJFNhw6tSt3VNPXnNHgsfc07Dk",
        icon: "solar:square-academic-cap-bold-duotone",
      },
    ],
    ctaBar: {
      title: "Choose the Department Relevant to Your Field",
      description:
        "The professional departments help guide institutions, businesses, and professionals toward exhibitions and conferences that are most relevant to their fields of work and professional interests.",
      cooperation: "Explore Events",
      contact: "Contact Us",
    },
  },
  ar: {    heroTitle: "أقسامنا",
    heroSubtitle:
      "تعمل الجاز من خلال أقسام متخصصة تعكس طبيعة المعارض والمؤتمرات والفعاليات المهنية التي تنظمها وتنسق المشاركة فيها. تهدف هذه الأقسام إلى توجيه كل مشاركة وفق المجال المهني والمؤسسي المناسب، بما يساعد المؤسسات والشركات والمهنيين على الوصول إلى الفعاليات المتخصصة ذات الصلة بطبيعة أعمالهم.",
    heroBadges: ["خبرات متكاملة", "موارد مشتركة", "أثر موحد"],
    exploreBtn: "استكشاف القسم",
    cards: [
      {
        key: "medical",
        title: "الرعاية الصحية وعلوم الحياة",
        description:
          "يعنى هذا القسم بالفعاليات المتخصصة في القطاع الصحي والطبي، بما يشمل الأجهزة الطبية، المختبرات، الصناعات الدوائية، والتقنيات الصحية.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtsY4UUmC9TD6oSqkKphpcJbWL8sZmm4jJ34FcysFP9gSNO5Vp9el_GAKlQ8MhRxnxWXKJH9dTXmkuJkVHWYUQSLyzissZgJ2s_Kk2TZMySbTjivMNlfGnLiHyAMQUMi0uY9kPDUPVoPxfWJQzFlGtb3v5bEooiuHLcmj8b5gXtOy_rIHaYRv8QigSVLErSfL-NCKAtLcMGFn-kKD_W1zamVJa4Vlw0CNGKHps-7NdNsDDTYz45TPx4Ck0",
        icon: "solar:heart-bold-duotone",
      },
      {
        key: "technology",
        title: "التحول الرقمي والتكنولوجيا",
        description:
          "يركز هذا القسم على الفعاليات المرتبطة بالتكنولوجيا، الحلول الرقمية، الذكاء الاصطناعي، الأمن السيبراني، والابتكار التقني.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLvGTBekZcvHqm7N_vXxKbBpia_f_jNhqevl_O75wQ4TK9g5gQqYDecKFlXamJVxxVCEHzU7tWBVxoc57zsdplCP1Hj4eqT88Ig2HIwStwyKdNlMChnGMg93Ldt3-7iR52_OBkNslMINODDlNcgAKnbsSrvLZppP0-NemhzjwjCVffvLnBOQ9i-lAtJbGxYlCULVBB0uYRHXqrPOXaZ8bdJztkmlFUSSz7Vg9y49h9TyhWPapW9QgIlSFrE",
        icon: "solar:cpu-bold-duotone",
      },
      {
        key: "industrie",
        title: "التطوير الصناعي والتجاري",
        description:
          "يركز هذا القسم على المعارض والمؤتمرات المرتبطة بالقطاعات الصناعية والتجارية، بما يشمل الصناعة، التجارة، الاستثمار، البناء، الطاقة، والخدمات اللوجستية.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLuk7UztS2hVIu9xIkG9xXbWkEcW8suoCErbbKKlOLvfvpk8zBp17krsepaxcXmiplSGIwPn43awogB_vPtx2J2j_v3nZ-4ep8EvSmKsjmQ2xPHt2dlOcaKsclJ397FaQ0Qqa0CoNs9SK8xFOa2FLy_fl5VFfKf_jKIdK1XlWWOzG_MFDPllZLw-IGU8o2Oj2ChLe0liENqpxPyhmaOSyAKSAOrIQn8zJEW1BuBZlFe6wU7w5a-9ivYYxpw",
        icon: "solar:city-bold-duotone",
      },
      {
        key: "academia",
        title: "الشؤون المهنية والأكاديمية",
        description:
          "يعنى هذا القسم بالمؤتمرات العلمية، البرامج المهنية، الفعاليات الأكاديمية، وفرص تبادل المعرفة والخبرات.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtyF7fetE60NNg0VrvyIJMQ1O3imIeX6iMzqDOLUytKFVuDJqgvcmFHsDcD8J8A6oVLqQ02CFyan17hYa5VdhwEozN_WUNAsv_nFHUzckC5fxOh52snVzFz44mhaeIFr6wQo2Sf_kGsepJq5V0DlOOenjYL4dWuwErLLrxQIgyZCXaKPtxzPqK_OEoC1H00p8TBKl8Py2paHTWPcOoHo0zZXA8wKLyKsQJFNhw6tSt3VNPXnNHgsfc07Dk",
        icon: "solar:square-academic-cap-bold-duotone",
      },
    ],
    ctaBar: {
      title: "اختر القسم المناسب لمجال عملك",
      description:
        "تساعد الأقسام المهنية في توجيه المؤسسات والشركات والمهنيين نحو المعارض والمؤتمرات الأقرب إلى طبيعة أعمالهم واهتماماتهم المهنية.",
      cooperation: "استعرض الفعاليات",
      contact: "اتصل بنا",
    },
  },
};

// Helper function to resolve dynamic slugs from DB
const getSlugForDept = (key: string, sectors: Tables<"sectors">[] | null) => {
  if (sectors) {
    const found = sectors.find((s) => {
      const slug = s.slug.toLowerCase();
      if (key === "medical") return slug.includes("medical") || slug.includes("health");
      if (key === "technology") return slug.includes("tech") || slug.includes("technology");
      if (key === "industrie")
        return (
          slug.includes("industrial") ||
          slug.includes("commercial") ||
          slug.includes("industrie")
        );
      if (key === "academia")
        return (
          slug.includes("academic") ||
          slug.includes("education") ||
          slug.includes("academia")
        );
      return false;
    });
    if (found) return found.slug;
  }
  // Static fallbacks
  if (key === "medical") return "medical-healthcare";
  if (key === "technology") return "technology";
  if (key === "industrie") return "commercial-industrial";
  if (key === "academia") return "education";
  return key;
};

const bgImageMap: Record<string, string> = {
  medical: "/images/bg-medical.png",
  technology: "/images/bg-technology.png",
  industrie: "/images/bg-industrie.png",
  academia: "/images/bg-academia.png",
};

const sectorIcons: Record<string, string[]> = {
  medical: [
    "solar:heart-bold-duotone",
    "solar:medical-kit-bold-duotone",
    "solar:user-heart-bold-duotone",
    "solar:hand-stars-bold-duotone",
    "solar:shield-check-bold-duotone",
  ],
  technology: [
    "solar:cpu-bold-duotone",
    "solar:code-bold-duotone",
    "solar:lightbulb-bolt-bold-duotone",
    "solar:global-bold-duotone",
    "solar:link-bold-duotone",
  ],
  industrie: [
    "solar:city-bold-duotone",
    "solar:buildings-bold-duotone",
    "solar:globus-bold-duotone",
    "solar:hand-shake-bold-duotone",
    "solar:graph-bold-duotone",
  ],
  academia: [
    "solar:square-academic-cap-bold-duotone",
    "solar:book-bookmark-bold-duotone",
    "solar:medal-ribbons-star-bold-duotone",
    "solar:users-group-rounded-bold-duotone",
    "solar:target-bold-duotone",
  ],
};

// Deterministic scattered positions for 5 icons (top,left in %, rotation in deg, size in rem)
// Avoids layout shift / SSR hydration mismatches vs Math.random()
const scatteredPositions = [
  { top: 8, left: 12, rotate: -18, size: 1.9 },
  { top: 22, left: 68, rotate: 14, size: 2.3 },
  { top: 54, left: 8, rotate: 10, size: 2.1 },
  { top: 64, left: 72, rotate: -22, size: 1.7 },
  { top: 78, left: 40, rotate: 6, size: 2.0 },
];

export function DepartmentsClient({
  sectors,
  stats,
}: {
  sectors: Tables<"sectors">[] | null;
  stats: SectorsStatsData;
}) {
  const { locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const content = isRTL ? translationsContent.ar : translationsContent.en;
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={dir} lang={locale}>
      {/* BEGIN: Hero Section */}
      <section className="relative bg-[#001a33] text-white py-10 xs:py-12 sm:py-16 md:py-20 lg:py-[19px] px-4 xs:px-5 sm:px-6 md:px-16">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl mt-6 xs:mt-8 sm:mt-10 lg:mt-[57px] lg:ms-[23px] lg:mb-px lg:pt-[37px]">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 xs:mb-5 tracking-tight text-white">
              {content.heroTitle}
            </h1>
            <p className="text-gray-300 text-sm xs:text-base sm:text-lg mb-6 xs:mb-8 sm:mb-10 leading-relaxed max-w-2xl lg:max-w-[819px]">
              {content.heroSubtitle}
            </p>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Statistics Bar (shared component, placed right after hero like other pages) */}
      <SectorsStats stats={stats} />
      {/* END: Statistics Bar */}

      {/* BEGIN: Departments Grid */}
      <DepartmentsGrid
        cards={content.cards}
        exploreBtn={content.exploreBtn}
        sectors={sectors}
        shouldReduceMotion={shouldReduceMotion}
      />
      {/* END: Departments Grid */}

      {/* BEGIN: CTA Bar */}
      <section className="mt-auto bg-[#0b1426] text-white py-5 lg:py-8">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                <Iconify
                  icon="solar:hand-shake-bold-duotone"
                  className="h-8 w-8 text-[#b08d4b]"
                  aria-hidden
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-balance">
                  {content.ctaBar.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  {content.ctaBar.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#8b0000] px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#6b0000] active:scale-95"
              >
                <span>{content.ctaBar.cooperation}</span>
                <Arrow
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/10 active:scale-95"
              >
                <Iconify
                  icon="solar:letter-bold-duotone"
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />
                <span>{content.ctaBar.contact}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
      {/* END: CTA Bar */}
    </div>
  );
}

type DeptCard = {
  key: string;
  title: string;
  description: string;
  image: string;
  icon: string;
};

function DepartmentsGrid({
  cards,
  exploreBtn,
  sectors,
  shouldReduceMotion,
}: {
  cards: DeptCard[];
  exploreBtn: string;
  sectors: Tables<"sectors">[] | null;
  shouldReduceMotion: boolean;
}) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {cards.map((card, index) => {
            const slug = getSlugForDept(card.key, sectors);
            const imgSrc = bgImageMap[card.key] || card.image;
            const hoverIcons = sectorIcons[card.key] ?? [];
            return (
              <motion.article
                key={card.key}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={shouldReduceMotion ? {} : { y: -5 }}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/70 transition-colors duration-300 hover:border-slate-300"
              >
                <Link
                  href={`/departments/${slug}`}
                  className="absolute inset-0 z-20"
                  aria-label={card.title}
                />

                {/* Image */}
                <div className="relative aspect-[2/1] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src={imgSrc}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
                  <div className="absolute bottom-3 start-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <Iconify icon={card.icon} className="w-5 h-5 text-slate-900" />
                  </div>
                </div>

                {/* Body */}
                <div className="relative flex flex-col p-5 lg:p-6 flex-1 overflow-hidden">
                  {/* Scattered sector icons behind the body content (40% opacity on hover) */}
                  {hoverIcons.length > 0 && (
                    <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-40">
                      {hoverIcons.map((ic, i) => {
                        const pos = scatteredPositions[i % scatteredPositions.length];
                        return (
                          <Iconify
                            key={`${card.key}-hov-${i}`}
                            icon={ic}
                            className="absolute text-[#8b0000] will-change-transform"
                            style={{
                              top: `${pos.top}%`,
                              left: `${pos.left}%`,
                              fontSize: `${pos.size}rem`,
                              transform: `rotate(${pos.rotate}deg)`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  <h3 className="relative z-10 font-extrabold text-slate-900 text-base lg:text-lg leading-snug mb-2.5 text-balance transition-colors duration-300 group-hover:text-[#8b0000]">
                    {card.title}
                  </h3>
                  <p className="relative z-10 text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>

                  <div className="relative z-10 mt-5 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors duration-300 group-hover:text-[#8b0000]">
                    <span>{exploreBtn}</span>
                    <svg
                      className="w-3.5 h-3.5 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
