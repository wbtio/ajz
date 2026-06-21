"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Icon as Iconify } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import type { Tables } from "@/lib/database.types";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/home";

// Dynamic content block to support both English and Arabic
const translationsContent = {
  en: {
    heroTitle: "Our Departments",
    heroSubtitle:
      "JAZ operates through four integrated departments that work synergistically to connect Iraq with global opportunities, drive innovation, and deliver measurable impact across key sectors and stakeholder communities.",
    heroBadges: ["Integrated Expertise", "Shared Resources", "Unified Impact"],
    exploreBtn: "Explore Department",
    gridSubtitle:
      "Four integrated departments working in concert to connect Iraq with global opportunities.",
    cards: [
      {
        key: "medical",
        title: "Healthcare & Life Sciences",
        description:
          "Advancing healthcare systems, medical innovation, and life sciences through global partnerships, exhibitions, and knowledge exchange.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtsY4UUmC9TD6oSqkKphpcJbWL8sZmm4jJ34FcysFP9gSNO5Vp9el_GAKlQ8MhRxnxWXKJH9dTXmkuJkVHWYUQSLyzissZgJ2s_Kk2TZMySbTjivMNlfGnLiHyAMQUMi0uY9kPDUPVoPxfWJQzFlGtb3v5bEooiuHLcmj8b5gXtOy_rIHaYRv8QigSVLErSfL-NCKAtLcMGFn-kKD_W1zamVJa4Vlw0CNGKHps-7NdNsDDTYz45TPx4Ck0",
        icon: "solar:heart-bold-duotone",
      },
      {
        key: "technology",
        title: "Digital Transformation & Technology",
        description:
          "Empowering Iraq's digital future by connecting technology leaders, enabling innovation, and accelerating digital transformation.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLvGTBekZcvHqm7N_vXxKbBpia_f_jNhqevl_O75wQ4TK9g5gQqYDecKFlXamJVxxVCEHzU7tWBVxoc57zsdplCP1Hj4eqT88Ig2HIwStwyKdNlMChnGMg93Ldt3-7iR52_OBkNslMINODDlNcgAKnbsSrvLZppP0-NemhzjwjCVffvLnBOQ9i-lAtJbGxYlCULVBB0uYRHXqrPOXaZ8bdJztkmlFUSSz7Vg9y49h9TyhWPapW9QgIlSFrE",
        icon: "solar:cpu-bold-duotone",
      },
      {
        key: "industrie",
        title: "Industrial & Commercial Development",
        description:
          "Driving industrial growth, trade, and sustainable development by connecting businesses, investors, and global markets.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLuk7UztS2hVIu9xIkG9xXbWkEcW8suoCErbbKKlOLvfvpk8zBp17krsepaxcXmiplSGIwPn43awogB_vPtx2J2j_v3nZ-4ep8EvSmKsjmQ2xPHt2dlOcaKsclJ397FaQ0Qqa0CoNs9SK8xFOa2FLy_fl5VFfKf_jKIdK1XlWWOzG_MFDPllZLw-IGU8o2Oj2ChLe0liENqpxPyhmaOSyAKSAOrIQn8zJEW1BuBZlFe6wU7w5a-9ivYYxpw",
        icon: "solar:city-bold-duotone",
      },
      {
        key: "academia",
        title: "Professional & Academic Affairs",
        description:
          "Strengthening academic institutions, professional networks, and research collaboration to build knowledge-driven communities.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtyF7fetE60NNg0VrvyIJMQ1O3imIeX6iMzqDOLUytKFVuDJqgvcmFHsDcD8J8A6oVLqQ02CFyan17hYa5VdhwEozN_WUNAsv_nFHUzckC5fxOh52snVzFz44mhaeIFr6wQo2Sf_kGsepJq5V0DlOOenjYL4dWuwErLLrxQIgyZCXaKPtxzPqK_OEoC1H00p8TBKl8Py2paHTWPcOoHo0zZXA8wKLyKsQJFNhw6tSt3VNPXnNHgsfc07Dk",
        icon: "solar:square-academic-cap-bold-duotone",
      },
    ],
    statsBar: {
      title: "Stronger Together, Greater Impact",
      description:
        "Our departments collaborate across sectors to deliver integrated solutions, create shared value, and amplify the impact of every partnership.",
      items: [
        { value: "4", label: "Integrated Departments" },
        { value: "100+", label: "Global Partners Engaged" },
        { value: "50+", label: "Countries Connected" },
        { value: "500+", label: "Projects & Initiatives Supported" },
        { value: "10+", label: "Years of Collective Impact" },
      ],
    },
    ctaBar: {
      title: "Let's Build the Future Together",
      description:
        "Partner with JAZ to unlock opportunities, drive innovation, and create lasting impact for Iraq and beyond.",
      cooperation: "Request Cooperation",
      contact: "Contact Us",
    },
  },
  ar: {    heroTitle: "أقسامنا",
    heroSubtitle:
      "تعمل جاز من خلال أربعة أقسام متكاملة تتعاون معاً لربط العراق بالفرص العالمية، ودفع عجلة الابتكار، وتحقيق أثر ملموس عبر القطاعات الرئيسية وفئات الشركاء المعنيين.",
    heroBadges: ["خبرات متكاملة", "موارد مشتركة", "أثر موحد"],
    exploreBtn: "استكشاف القسم",
    gridSubtitle:
      "أربعة أقسام متكاملة تعمل معاً لربط العراق بالفرص العالمية وقيادة الابتكار.",
    cards: [
      {
        key: "medical",
        title: "الرعاية الصحية وعلوم الحياة",
        description:
          "الارتقاء بأنظمة الرعاية الصحية، والابتكار الطبي، وعلوم الحياة من خلال الشراكات العالمية، والمعارض، وتبادل المعرفة.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtsY4UUmC9TD6oSqkKphpcJbWL8sZmm4jJ34FcysFP9gSNO5Vp9el_GAKlQ8MhRxnxWXKJH9dTXmkuJkVHWYUQSLyzissZgJ2s_Kk2TZMySbTjivMNlfGnLiHyAMQUMi0uY9kPDUPVoPxfWJQzFlGtb3v5bEooiuHLcmj8b5gXtOy_rIHaYRv8QigSVLErSfL-NCKAtLcMGFn-kKD_W1zamVJa4Vlw0CNGKHps-7NdNsDDTYz45TPx4Ck0",
        icon: "solar:heart-bold-duotone",
      },
      {
        key: "technology",
        title: "التحول الرقمي والتكنولوجيا",
        description:
          "تمكين المستقبل الرقمي للعراق من خلال ربط قادة التكنولوجيا، وتمكين الابتكار، وتسريع التحول الرقمي.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLvGTBekZcvHqm7N_vXxKbBpia_f_jNhqevl_O75wQ4TK9g5gQqYDecKFlXamJVxxVCEHzU7tWBVxoc57zsdplCP1Hj4eqT88Ig2HIwStwyKdNlMChnGMg93Ldt3-7iR52_OBkNslMINODDlNcgAKnbsSrvLZppP0-NemhzjwjCVffvLnBOQ9i-lAtJbGxYlCULVBB0uYRHXqrPOXaZ8bdJztkmlFUSSz7Vg9y49h9TyhWPapW9QgIlSFrE",
        icon: "solar:cpu-bold-duotone",
      },
      {
        key: "industrie",
        title: "التطوير الصناعي والتجاري",
        description:
          "دفع عجلة النمو الصناعي والتجارة والتنمية المستدامة من خلال ربط الشركات والمستثمرين والأسواق العالمية.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLuk7UztS2hVIu9xIkG9xXbWkEcW8suoCErbbKKlOLvfvpk8zBp17krsepaxcXmiplSGIwPn43awogB_vPtx2J2j_v3nZ-4ep8EvSmKsjmQ2xPHt2dlOcaKsclJ397FaQ0Qqa0CoNs9SK8xFOa2FLy_fl5VFfKf_jKIdK1XlWWOzG_MFDPllZLw-IGU8o2Oj2ChLe0liENqpxPyhmaOSyAKSAOrIQn8zJEW1BuBZlFe6wU7w5a-9ivYYxpw",
        icon: "solar:city-bold-duotone",
      },
      {
        key: "academia",
        title: "الشؤون المهنية والأكاديمية",
        description:
          "تعزيز المؤسسات الأكاديمية والشبكات المهنية والتعاون البحثي لبناء مجتمعات قائمة على المعرفة.",
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtyF7fetE60NNg0VrvyIJMQ1O3imIeX6iMzqDOLUytKFVuDJqgvcmFHsDcD8J8A6oVLqQ02CFyan17hYa5VdhwEozN_WUNAsv_nFHUzckC5fxOh52snVzFz44mhaeIFr6wQo2Sf_kGsepJq5V0DlOOenjYL4dWuwErLLrxQIgyZCXaKPtxzPqK_OEoC1H00p8TBKl8Py2paHTWPcOoHo0zZXA8wKLyKsQJFNhw6tSt3VNPXnNHgsfc07Dk",
        icon: "solar:square-academic-cap-bold-duotone",
      },
    ],
    statsBar: {
      title: "معاً أقوى، لأثر أكبر",
      description:
        "تتعاون أقسامنا عبر القطاعات لتقديم حلول متكاملة، وخلق قيمة مشتركة، ومضاعفة أثر كل شراكة.",
      items: [
        { value: "4", label: "أقسام متكاملة" },
        { value: "100+", label: "شريك عالمي مشارك" },
        { value: "50+", label: "دولة متصلة" },
        { value: "500+", label: "مشروع ومبادرة مدعومة" },
        { value: "10+", label: "سنوات من الأثر الجماعي" },
      ],
    },
    ctaBar: {
      title: "لنصنع المستقبل معاً",
      description:
        "شارك مع جاز لفتح الآفاق، ودفع عجلة الابتكار، وصنع أثر مستدام للعراق وخارجه.",
      cooperation: "طلب التعاون",
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

export function DepartmentsClient({
  sectors,
  stats,
}: {
  sectors: Tables<"sectors">[] | null;
  stats: any;
}) {
  const { locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const content = isRTL ? translationsContent.ar : translationsContent.en;
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={dir} lang={locale}>
      {/* CSS overrides inside a styled tag to ensure colors/overlay look exactly like the HTML request */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-container {
          background: #001a33;
          position: relative;
          overflow: hidden;
        }
        .globe-overlay {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background-image: url('https://lh3.googleusercontent.com/aida/AP1WRLuhWWWGSOcrukn_qIC3KbAdoGG27aKMITObmIQwNi2KuiC5zjCDhj1xA2zz_-I_lnQEhvPD-oikNfdZeo7L1qWAjfAM51WTX4tX53-CczTzLoXpZJZq9MKRcJpSGsFBDYrmDoY5OYGi81DYTMYS5kcRtWgnlmtNBAPwcbd5gSEPjq6ciZ3K_yWl-gFBzS4PnS3y-lq4kuKGAiP1hKsuye3dFlE6bFWbX5FLfSSOBv2596O7k8L0BmDi_1RQwX-ksgj6lRg3_8oJ2A');
          background-size: 200%;
          background-position: right top;
          opacity: 0.8;
          mask-image: linear-gradient(to left, black 60%, transparent);
          -webkit-mask-image: linear-gradient(to left, black 60%, transparent);
        }
        [dir="rtl"] .globe-overlay {
          right: auto;
          left: 0;
          background-position: left top;
          mask-image: linear-gradient(to right, black 60%, transparent);
          -webkit-mask-image: linear-gradient(to right, black 60%, transparent);
        }
        .department-card {
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        .department-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* BEGIN: Hero Section */}
      <section className="hero-container relative bg-[#001a33] text-white py-10 xs:py-12 sm:py-16 md:py-20 lg:py-24 px-4 xs:px-5 sm:px-6 md:px-16">
        <div className="globe-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl mt-6 xs:mt-8 sm:mt-10 lg:mt-12">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 xs:mb-5 tracking-tight text-white">
              {content.heroTitle}
            </h1>
            <p className="text-gray-300 text-sm xs:text-base sm:text-lg mb-6 xs:mb-8 sm:mb-10 leading-relaxed max-w-2xl">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 xs:gap-5 sm:gap-6 md:gap-10 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400">
              {content.heroBadges.map((badge, idx) => (
                <span key={idx} className="flex items-center gap-1.5 xs:gap-2">
                  <span className="w-1 h-1.5 xs:w-1.5 xs:h-1.5 bg-[#dcc18b] rounded-full" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Departments Grid */}
      <DepartmentsGrid
        cards={content.cards}
        exploreBtn={content.exploreBtn}
        subtitle={content.gridSubtitle}
        sectors={sectors}
        shouldReduceMotion={shouldReduceMotion}
      />
      {/* END: Departments Grid */}

      {/* BEGIN: Statistics Bar */}
      <section className="bg-gray-50 border-y border-slate-100 py-4 xs:py-5 sm:py-6 md:py-7 px-4 xs:px-5 sm:px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 xs:gap-5 sm:gap-6 lg:gap-10">
          <div className="max-w-[16rem] xs:max-w-xs sm:max-w-sm text-center lg:text-start shrink-0">
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-extrabold text-slate-900 mb-1 xs:mb-1 sm:mb-1.5 leading-tight">
              {content.statsBar.title}
            </h2>
            <p className="text-[10px] xs:text-[11px] sm:text-xs text-gray-600 leading-snug">
              {content.statsBar.description}
            </p>
          </div>

          <div className="w-full lg:w-auto overflow-x-auto lg:overflow-visible scrollbar-hide">
            <div className="flex justify-start lg:justify-end items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-5 xl:gap-8 text-center min-w-max lg:min-w-0 px-2 xs:px-4 sm:px-0">
              {content.statsBar.items.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5 xs:gap-0.5 sm:gap-1 min-w-[3.5rem] xs:min-w-[4rem] sm:min-w-[4.5rem] md:min-w-[5rem] shrink-0">
                  <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 leading-none tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wide text-gray-500 font-semibold leading-tight max-w-[3.5rem] xs:max-w-[4.5rem] sm:max-w-[5rem] md:max-w-[7.5rem]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* END: Statistics Bar */}

      {/* BEGIN: CTA Bar */}
      <section className="mt-auto bg-[#0b1426] text-white py-14 lg:py-20">
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
                href="/contact?type=cooperation"
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
  subtitle,
  sectors,
  shouldReduceMotion,
}: {
  cards: DeptCard[];
  exploreBtn: string;
  subtitle: string;
  sectors: Tables<"sectors">[] | null;
  shouldReduceMotion: boolean;
}) {
  const { locale } = useI18n();
  const isRTL = locale === "ar";

  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <SectionHeader title={isRTL ? "أقسامنا" : "Our Departments"} subtitle={subtitle} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-10 lg:mt-12">
          {cards.map((card, index) => {
            const slug = getSlugForDept(card.key, sectors);
            const imgSrc = bgImageMap[card.key] || card.image;
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
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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
                <div className="relative flex flex-col p-5 lg:p-6 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-base lg:text-lg leading-snug mb-2.5 text-balance transition-colors duration-300 group-hover:text-[#8b0000]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors duration-300 group-hover:text-[#8b0000]">
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
