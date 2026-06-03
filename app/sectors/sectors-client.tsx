"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Icon as Iconify } from "@iconify/react";
import { Container } from "@/components/ui/container";
import type { Tables } from "@/lib/database.types";
import { useI18n } from "@/lib/i18n";
import { mergeSectorWithContent } from "./sector-content";
import { SectorsHero } from "./_components/sectors-hero";
import { SectorsStats, type SectorsStatsData } from "./_components/sectors-stats";
import { SectorsMethodology } from "./_components/sectors-methodology";
import { SectorsContactCTA } from "./_components/sectors-contact-cta";

const iconMap: Record<string, string> = {
  Building2: "solar:city-bold-duotone",
  Heart: "solar:heart-bold-duotone",
  Cpu: "solar:cpu-bold-duotone",
  GraduationCap: "solar:square-academic-cap-bold-duotone",
};

export function SectorsClient({
  sectors,
  stats,
}: {
  sectors: Tables<"sectors">[] | null;
  stats: SectorsStatsData;
}) {
  const { locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const mergedSectors = (sectors || [])
    .map((sector) => mergeSectorWithContent(sector))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      <SectorsHero />
      <SectorsStats stats={stats} />

      <section className="bg-white pb-6 pt-8 sm:pb-8 sm:pt-10 lg:pt-12">
        <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {mergedSectors.map((sector) => {
              const sectorTitle = isRTL
                ? sector.name_ar || sector.name
                : sector.name || sector.name_ar;
              const sectorDesc = isRTL
                ? sector.description_ar || sector.description
                : sector.description || sector.description_ar;
              const iconName =
                iconMap[sector.icon ?? "Building2"] || "solar:city-bold-duotone";
              const accentColor = sector.color || "#8B0000";

              return (
                <Link
                  href={`/sectors/${sector.slug}`}
                  key={sector.id}
                  className="block h-full"
                >
                  <div className="group flex h-full items-start gap-3.5 p-4 bg-white border border-slate-900/10 rounded-xl transition-all duration-200 hover:border-slate-200 hover:shadow-sm sm:p-5">
                    <Iconify
                      icon={iconName}
                      className="h-7 w-7 shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ color: accentColor }}
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="text-base font-extrabold leading-tight text-slate-900 sm:text-lg">
                        {sectorTitle}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        {sectorDesc}
                      </p>

                      <span
                        className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold"
                        style={{ color: accentColor }}
                      >
                        {isRTL ? "استكشاف" : "Explore"}
                        <Arrow className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <SectorsMethodology />
      <SectorsContactCTA />
    </div>
  );
}
