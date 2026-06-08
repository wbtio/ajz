"use client";

import Link from "next/link";
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
        bullets: [
          "International Health Exhibitions",
          "Medical Partnerships & Delegations",
          "Healthcare Investment Facilitation",
          "Life Sciences & Biotech Innovation",
          "Capacity Building & Training",
        ],
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtsY4UUmC9TD6oSqkKphpcJbWL8sZmm4jJ34FcysFP9gSNO5Vp9el_GAKlQ8MhRxnxWXKJH9dTXmkuJkVHWYUQSLyzissZgJ2s_Kk2TZMySbTjivMNlfGnLiHyAMQUMi0uY9kPDUPVoPxfWJQzFlGtb3v5bEooiuHLcmj8b5gXtOy_rIHaYRv8QigSVLErSfL-NCKAtLcMGFn-kKD_W1zamVJa4Vlw0CNGKHps-7NdNsDDTYz45TPx4Ck0",
        icon: "solar:heart-bold-duotone",
      },
      {
        key: "technology",
        title: "Digital Transformation & Technology",
        description:
          "Empowering Iraq's digital future by connecting technology leaders, enabling innovation, and accelerating digital transformation.",
        bullets: [
          "Tech Exhibitions & Conferences",
          "Digital Government & Smart Solutions",
          "ICT Partnerships & Investment",
          "AI, Cybersecurity & Emerging Tech",
          "Digital Skills & Innovation Programs",
        ],
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLvGTBekZcvHqm7N_vXxKbBpia_f_jNhqevl_O75wQ4TK9g5gQqYDecKFlXamJVxxVCEHzU7tWBVxoc57zsdplCP1Hj4eqT88Ig2HIwStwyKdNlMChnGMg93Ldt3-7iR52_OBkNslMINODDlNcgAKnbsSrvLZppP0-NemhzjwjCVffvLnBOQ9i-lAtJbGxYlCULVBB0uYRHXqrPOXaZ8bdJztkmlFUSSz7Vg9y49h9TyhWPapW9QgIlSFrE",
        icon: "solar:cpu-bold-duotone",
      },
      {
        key: "industrie",
        title: "Industrial & Commercial Development",
        description:
          "Driving industrial growth, trade, and sustainable development by connecting businesses, investors, and global markets.",
        bullets: [
          "Industry & Trade Exhibitions",
          "Investment Promotion & Facilitation",
          "Supply Chain & Logistics Solutions",
          "Infrastructure & Industrial Projects",
          "Sustainable Development Initiatives",
        ],
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLuk7UztS2hVIu9xIkG9xXbWkEcW8suoCErbbKKlOLvfvpk8zBp17krsepaxcXmiplSGIwPn43awogB_vPtx2J2j_v3nZ-4ep8EvSmKsjmQ2xPHt2dlOcaKsclJ397FaQ0Qqa0CoNs9SK8xFOa2FLy_fl5VFfKf_jKIdK1XlWWOzG_MFDPllZLw-IGU8o2Oj2ChLe0liENqpxPyhmaOSyAKSAOrIQn8zJEW1BuBZlFe6wU7w5a-9ivYYxpw",
        icon: "solar:city-bold-duotone",
      },
      {
        key: "academia",
        title: "Professional & Academic Affairs",
        description:
          "Strengthening academic institutions, professional networks, and research collaboration to build knowledge-driven communities.",
        bullets: [
          "Academic Partnerships & MoUs",
          "Conferences & Academic Events",
          "Professional Development Programs",
          "Research Collaboration & Innovation",
          "Scholarships & Exchange Programs",
        ],
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
        bullets: [
          "المعارض الصحية الدولية",
          "الشراكات والوفود الطبية",
          "تسهيل الاستثمارات الصحية",
          "ابتكارات علوم الحياة والتقنية الحيوية",
          "بناء القدرات والتدريب",
        ],
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLtsY4UUmC9TD6oSqkKphpcJbWL8sZmm4jJ34FcysFP9gSNO5Vp9el_GAKlQ8MhRxnxWXKJH9dTXmkuJkVHWYUQSLyzissZgJ2s_Kk2TZMySbTjivMNlfGnLiHyAMQUMi0uY9kPDUPVoPxfWJQzFlGtb3v5bEooiuHLcmj8b5gXtOy_rIHaYRv8QigSVLErSfL-NCKAtLcMGFn-kKD_W1zamVJa4Vlw0CNGKHps-7NdNsDDTYz45TPx4Ck0",
        icon: "solar:heart-bold-duotone",
      },
      {
        key: "technology",
        title: "التحول الرقمي والتكنولوجيا",
        description:
          "تمكين المستقبل الرقمي للعراق من خلال ربط قادة التكنولوجيا، وتمكين الابتكار، وتسريع التحول الرقمي.",
        bullets: [
          "معارض ومؤتمرات التكنولوجيا",
          "الحكومة الرقمية والحلول الذكية",
          "شراكات واستثمارات الاتصالات وتكنولوجيا المعلومات",
          "الذكاء الاصطناعي، الأمن السيبراني والتكنولوجيا الناشئة",
          "برامج المهارات الرقمية والابتكار",
        ],
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLvGTBekZcvHqm7N_vXxKbBpia_f_jNhqevl_O75wQ4TK9g5gQqYDecKFlXamJVxxVCEHzU7tWBVxoc57zsdplCP1Hj4eqT88Ig2HIwStwyKdNlMChnGMg93Ldt3-7iR52_OBkNslMINODDlNcgAKnbsSrvLZppP0-NemhzjwjCVffvLnBOQ9i-lAtJbGxYlCULVBB0uYRHXqrPOXaZ8bdJztkmlFUSSz7Vg9y49h9TyhWPapW9QgIlSFrE",
        icon: "solar:cpu-bold-duotone",
      },
      {
        key: "industrie",
        title: "التطوير الصناعي والتجاري",
        description:
          "دفع عجلة النمو الصناعي والتجارة والتنمية المستدامة من خلال ربط الشركات والمستثمرين والأسواق العالمية.",
        bullets: [
          "معارض الصناعة والتجارة",
          "ترويج وتسهيل الاستثمار",
          "حلول سلاسل التوريد والخدمات اللوجستية",
          "مشاريع البنية التحتية والمشاريع الصناعية",
          "مبادرات التنمية المستدامة",
        ],
        image:
          "https://lh3.googleusercontent.com/aida/AP1WRLuk7UztS2hVIu9xIkG9xXbWkEcW8suoCErbbKKlOLvfvpk8zBp17krsepaxcXmiplSGIwPn43awogB_vPtx2J2j_v3nZ-4ep8EvSmKsjmQ2xPHt2dlOcaKsclJ397FaQ0Qqa0CoNs9SK8xFOa2FLy_fl5VFfKf_jKIdK1XlWWOzG_MFDPllZLw-IGU8o2Oj2ChLe0liENqpxPyhmaOSyAKSAOrIQn8zJEW1BuBZlFe6wU7w5a-9ivYYxpw",
        icon: "solar:city-bold-duotone",
      },
      {
        key: "academia",
        title: "الشؤون المهنية والأكاديمية",
        description:
          "تعزيز المؤسسات الأكاديمية والشبكات المهنية والتعاون البحثي لبناء مجتمعات قائمة على المعرفة.",
        bullets: [
          "الشراكات الأكاديمية ومذكرات التفاهم",
          "المؤتمرات والفعاليات الأكاديمية",
          "برامج التطوير المهني",
          "التعاون البحثي والابتكار",
          "المنح الدراسية وبرامج التبادل",
        ],
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

export function DepartmentsClient({
  sectors,
  stats,
}: {
  sectors: Tables<"sectors">[] | null;
  stats: any;
}) {
  const { locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const content = isRTL ? translationsContent.ar : translationsContent.en;

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
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
        .bullet-list li {
          position: relative;
          padding-left: 1.25rem;
          margin-bottom: 0.25rem;
        }
        .bullet-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #000;
        }
        [dir="rtl"] .bullet-list li {
          padding-left: 0;
          padding-right: 1.25rem;
        }
        [dir="rtl"] .bullet-list li::before {
          left: auto;
          right: 0;
        }
      ` }} />

      {/* BEGIN: Hero Section */}
      <section className="hero-container relative bg-[#001224] text-white py-20 px-6 md:px-16 lg:py-24">
        <div className="globe-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 tracking-tight text-white">
              {content.heroTitle}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-10 leading-relaxed max-w-2xl">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-6 md:gap-10 text-xs sm:text-sm font-semibold text-gray-400">
              {content.heroBadges.map((badge, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#dcc18b] rounded-full" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Departments Grid */}
      <section className="py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.cards.map((card) => {
            const slug = getSlugForDept(card.key, sectors);
            return (
              <div
                key={card.key}
                className="department-card p-4 rounded-xl bg-white flex flex-col h-full"
              >
                <div className="relative mb-5 overflow-hidden rounded-lg">
                  <img
                    alt={card.title}
                    className="w-full h-44 object-cover transform hover:scale-105 transition-transform duration-550"
                    src={card.image}
                  />
                  <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
                    <Iconify icon={card.icon} className="w-5.5 h-5.5 text-white" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed flex-grow">
                  {card.description}
                </p>

                <ul className="bullet-list text-xs sm:text-sm text-gray-800 mb-8 space-y-1">
                  {card.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>

                <Link href={`/departments/${slug}`} className="w-full mt-auto block">
                  <button className="w-full py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
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
      <section className="bg-gray-50 border-y border-slate-100 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10">
          <div className="max-w-md text-center lg:text-start">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
              {content.statsBar.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {content.statsBar.description}
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-8 sm:gap-12 text-center">
            {content.statsBar.items.map((stat, idx) => (
              <div key={idx} className="w-28 flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-tight max-w-[100px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* END: Statistics Bar */}

      {/* BEGIN: CTA Bar */}
      <section className="bg-[#001224] py-10 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-start text-white">
            <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
              {content.ctaBar.title}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xl">
              {content.ctaBar.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/contact?type=cooperation" className="w-full sm:w-auto">
              <button className="w-full bg-[#dcc18b] hover:bg-[#d4af37] text-gray-900 px-8 py-3 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-sm min-w-[200px]">
                {content.ctaBar.cooperation}
              </button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <button className="w-full border border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg font-bold text-xs sm:text-sm transition-colors min-w-[200px]">
                {content.ctaBar.contact}
              </button>
            </Link>
          </div>
        </div>
      </section>
      {/* END: CTA Bar */}
    </div>
  );
}
