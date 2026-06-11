"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Icon as Iconify } from "@iconify/react";
import type { Tables } from "@/lib/database.types";
import { useI18n } from "@/lib/i18n";

// Dynamic content block to support both English and Arabic
const translationsContent = {
  en: {
    heroTitle: "Our Departments",
    heroSubtitle:
      "JAZ operates through four integrated departments that work synergistically to connect Iraq with global opportunities, drive innovation, and deliver measurable impact across key sectors and stakeholder communities.",
    heroBadges: ["Integrated Expertise", "Shared Resources", "Unified Impact"],
    exploreBtn: "Explore Department",
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
  ar: {
    heroTitle: "أقسامنا",
    heroSubtitle:
      "تعمل جاز من خلال أربعة أقسام متكاملة تتعاون معاً لربط العراق بالفرص العالمية، ودفع عجلة الابتكار، وتحقيق أثر ملموس عبر القطاعات الرئيسية وفئات الشركاء المعنيين.",
    heroBadges: ["خبرات متكاملة", "موارد مشتركة", "أثر موحد"],
    exploreBtn: "استكشاف القسم",
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

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={dir} lang={locale}>
      {/* CSS overrides inside a styled tag to ensure colors/overlay look exactly like the HTML request */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-container {
          background: #001224;
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
      <section className="hero-container relative bg-[#001224] text-white py-10 xs:py-12 sm:py-16 md:py-20 lg:py-24 px-4 xs:px-5 sm:px-6 md:px-16">
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
      <section className="py-8 xs:py-10 sm:py-12 md:py-14 px-4 xs:px-5 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5">
          {content.cards.map((card) => {
            const slug = getSlugForDept(card.key, sectors);
            return (
              <div
                key={card.key}
                className="department-card p-3 xs:p-3.5 rounded-xl bg-white flex flex-col h-full"
              >
                <div className="relative mb-2 xs:mb-2.5 sm:mb-3 overflow-hidden rounded-lg">
                  <img
                    alt={card.title}
                    className="w-full h-24 xs:h-28 sm:h-32 md:h-36 object-cover transform hover:scale-105 transition-transform duration-500"
                    src={bgImageMap[card.key] || card.image}
                  />
                  <div className="absolute bottom-1.5 xs:bottom-2 left-1.5 xs:left-2 rtl:left-auto rtl:right-1.5 rtl:xs:left-auto rtl:xs:right-2 w-8 xs:w-9 h-8 xs:h-9 bg-white rounded-lg flex items-center justify-center shadow-md">
                    <Iconify icon={card.icon} className="w-4 xs:w-5 h-4 xs:h-5 text-gray-900" />
                  </div>
                </div>

                <h3 className="text-xs xs:text-sm sm:text-base font-bold text-slate-900 mb-1 xs:mb-1.5 sm:mb-2 leading-snug line-clamp-2">
                  {card.title}
                </h3>
                <p className="text-[10px] xs:text-[11px] sm:text-xs text-gray-600 mb-2.5 xs:mb-3 sm:mb-4 leading-snug line-clamp-3">
                  {card.description}
                </p>

                <Link href={`/departments/${slug}`} className="w-full mt-auto block">
                  <button className="w-full py-1.5 xs:py-2 bg-gray-900 text-white text-[10px] xs:text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                    {content.exploreBtn}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
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
      <section className="mt-auto bg-[#021c36] text-[#6f85a3] py-6 xs:py-8 sm:py-10 px-4 xs:px-5 sm:px-6 md:px-12 border-t border-b border-[#6f85a3]/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 xs:gap-6 sm:gap-8">
          <div className="text-center lg:text-start px-2">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 xs:mb-1.5 sm:mb-2">
              {content.ctaBar.title}
            </h2>
            <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-[#6f85a3]/80 leading-relaxed max-w-xl">
              {content.ctaBar.description}
            </p>
          </div>

          <div className="flex w-full flex-col sm:flex-row gap-2 xs:gap-3 items-center px-2 lg:px-0">
            <Link
              href="/contact?type=cooperation"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 xs:gap-2.5 rounded-full bg-[#f7e382] px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 text-[10px] xs:text-xs sm:text-sm font-bold text-[#000000] transition-all duration-300 hover:bg-[#f7e382]/90 active:scale-95"
            >
              <Iconify
                icon="solar:hand-shake-bold-duotone"
                className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0 text-[#000000]/80"
                aria-hidden
              />
              <span>{content.ctaBar.cooperation}</span>
              <Arrow
                className="h-3 xs:h-3.5 w-3 xs:w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                aria-hidden
              />
            </Link>
            <Link
              href="/contact"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 xs:gap-2.5 rounded-full border border-[#6f85a3]/30 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 text-[10px] xs:text-xs sm:text-sm font-semibold text-[#6f85a3] transition-all duration-300 hover:border-[#f7e382] hover:text-[#f7e382] active:scale-95"
            >
              <Iconify
                icon="solar:letter-bold-duotone"
                className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0 transition-colors duration-300 group-hover:text-[#f7e382]"
                aria-hidden
              />
              <span>{content.ctaBar.contact}</span>
              <Arrow
                className="h-3 xs:h-3.5 w-3 xs:w-3.5 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#f7e382] rtl:group-hover:-translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </section>
      {/* END: CTA Bar */}
    </div>
  );
}
