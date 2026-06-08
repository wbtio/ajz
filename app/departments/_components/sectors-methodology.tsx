"use client";

import { Cpu, GraduationCap, Heart, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";

const reasonConfig = {
  medical: {
    accent: "#b42318",
    Icon: Heart,
  },
  technology: {
    accent: "#0f766e",
    Icon: Cpu,
  },
  academia: {
    accent: "#4338ca",
    Icon: GraduationCap,
  },
  industrie: {
    accent: "#9a3412",
    Icon: Sparkles,
  },
} as const;

type ReasonKey = keyof typeof reasonConfig;

const order: ReasonKey[] = ["medical", "technology", "academia", "industrie"];

export function SectorsMethodology() {
  const { t, locale, dir } = useI18n();
  const isArabic = locale === "ar";

  return (
    <section
      dir={dir}
      lang={locale}
      className="bg-slate-50/50 py-8 sm:py-10"
      aria-label={
        isArabic ? "منهجية اختيار الأقسام" : "Sectors selection methodology"
      }
    >
      <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mt-0 text-balance text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
            {t.sectors.methodology.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {t.sectors.methodology.subtitle}
          </p>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {order.map((key) => {
            const reason = t.sectors.methodology.reasons[key];
            const { accent, Icon } = reasonConfig[key];

            return (
              <li
                key={key}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
                  style={{
                    backgroundColor: `${accent}10`,
                    borderColor: `${accent}25`,
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: accent }}
                    aria-hidden
                  />
                </span>
                <span className="min-w-0 text-start">
                  <span className="block text-xs font-bold text-slate-900 sm:text-sm">
                    {reason.title}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
