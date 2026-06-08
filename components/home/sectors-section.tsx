"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Icon } from "@iconify/react";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";
import type { Sector } from "@/lib/database.types";
import { mergeSectorWithContent, getSectorContent } from "@/app/departments/department-content";
import type { Tables } from "@/lib/database.types";

type Event = Tables<"events">;

interface SectorsSectionProps {
  sectors: Sector[];
  events?: Event[];
}

const iconMap: Record<string, string> = {
  Building2: "solar:city-bold-duotone",
  Heart: "solar:heart-bold-duotone",
  Cpu: "solar:cpu-bold-duotone",
  GraduationCap: "solar:square-academic-cap-bold-duotone",
};

export function SectorsSection({ sectors, events = [] }: SectorsSectionProps) {
  const { t, locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const lastWheelTime = useRef(0);

  // Merge database sectors with static details and sort
  const mergedSectors = useMemo(() => {
    return sectors
      .map((sector) => mergeSectorWithContent(sector))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [sectors]);

  // Count active events per sector
  const activeEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      if (event.sector_id) {
        counts[event.sector_id] = (counts[event.sector_id] || 0) + 1;
      }
    });
    return counts;
  }, [events]);

  // Auto-rotating timer logic
  useEffect(() => {
    if (isHovered || shouldReduceMotion || mergedSectors.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mergedSectors.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [mergedSectors.length, isHovered, shouldReduceMotion]);

  // Premium Wheel Scroll Navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (mergedSectors.length === 0) return;
    const now = Date.now();
    if (now - lastWheelTime.current < 700) return; // 700ms throttle
    if (Math.abs(e.deltaY) < 15) return; // Ignore small movements

    if (e.deltaY > 0) {
      setActiveIndex((prev) => (prev + 1) % mergedSectors.length);
      lastWheelTime.current = now;
    } else if (e.deltaY < 0) {
      setActiveIndex((prev) => (prev - 1 + mergedSectors.length) % mergedSectors.length);
      lastWheelTime.current = now;
    }
  };

  // Select active sector data
  const activeSector = mergedSectors[activeIndex] || mergedSectors[0];
  const activeEventCount = activeSector ? activeEventCounts[activeSector.id] || 0 : 0;
  
  // Fetch static details like accent color and background watermark
  const activeContent = activeSector ? getSectorContent(activeSector) : null;
  const accentColor = activeContent?.accent || "#8B0000";

  const activeTitle = isRTL
    ? activeSector?.name_ar || activeSector?.name
    : activeSector?.name || activeSector?.name_ar;

  const activeDescription = isRTL
    ? activeSector?.description_ar || activeSector?.description
    : activeSector?.description || activeSector?.description_ar;

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      dir={dir}
      lang={locale}
      className="relative overflow-hidden bg-slate-50 pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="absolute inset-0 home-grid-pattern opacity-30 pointer-events-none" />
      <Container className="relative z-10 max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full">
        {/* Header */}
        <div className="mb-6 text-start max-w-4xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl leading-tight">
            {t.sectors.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-[75ch]">
            {t.sectors.subtitle}
          </p>
        </div>

        {mergedSectors.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 lg:items-stretch" onWheel={handleWheel}>
            {/* Tabs */}
            <div className="flex flex-col gap-1.5 lg:col-span-5 order-2 lg:order-1 justify-between">
              {mergedSectors.map((sector, index) => {
                const isSelected = index === activeIndex;
                const content = getSectorContent(sector);
                const sectorAccent = content?.accent || "#475569";
                const sectorTitle = isRTL ? sector.name_ar || sector.name : sector.name || sector.name_ar;

                return (
                  <button
                    key={sector.id}
                    onClick={() => setActiveIndex(index)}
                    className={`relative flex items-center gap-3 rounded-xl py-2.5 px-3.5 text-start transition-all duration-300 w-full outline-none select-none z-10 group overflow-hidden border ${
                      isSelected
                        ? "bg-white border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
                        : "border-transparent bg-transparent hover:bg-slate-200/40"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="v4ActiveTabLine"
                        className="absolute inset-y-0 start-0 w-1 pointer-events-none rounded-r-md"
                        style={{ backgroundColor: sectorAccent }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <div
                      className="relative z-10 flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: isSelected ? `${sectorAccent}12` : "#e2e8f0",
                      }}
                    >
                      <Icon
                        icon={iconMap[sector.icon || "Building2"] || "solar:city-bold-duotone"}
                        className="h-5.5 w-5.5 transition-colors duration-300"
                        style={{ color: isSelected ? sectorAccent : "#64748b" }}
                      />
                    </div>
                    <div className="relative z-10 flex-1 min-w-0">
                      <span className={`block text-sm sm:text-base font-bold leading-snug ${isSelected ? "text-slate-950 font-extrabold" : "text-slate-600 group-hover:text-slate-950"}`}>
                        {sectorTitle}
                      </span>
                    </div>
                    <ArrowIcon
                      className={`relative z-10 h-4 w-4 shrink-0 transition-all duration-300 ${
                        isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40"
                      }`}
                      style={{ color: sectorAccent }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Cinematic Expand Spotlight detailed card */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <motion.div 
                layout
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.02)] h-full"
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4 text-start h-full justify-between"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <motion.div
                        layoutId={`v4-icon-spot-${activeIndex}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
                        style={{ backgroundColor: `${accentColor}12` }}
                      >
                        <Icon
                          icon={iconMap[activeSector.icon || "Building2"] || "solar:city-bold-duotone"}
                          className="h-6 w-6"
                          style={{ color: accentColor }}
                        />
                      </motion.div>
                      {activeEventCount > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">
                          <span>{activeEventCount} {isRTL ? t.sectors.activeEvents : t.sectors.activeEvents}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <motion.h3 layout className="text-lg font-extrabold text-slate-950 leading-tight mb-1.5 sm:text-xl">
                        {activeTitle}
                      </motion.h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-[70ch]">
                        {activeDescription}
                      </p>
                    </div>

                    <div className="flex justify-start pt-1">
                      <Link
                        href={`/departments/${activeSector.slug}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg active:scale-95 text-center group/btn"
                        style={{ backgroundColor: accentColor }}
                      >
                        <span>{t.sectors.learnMore}</span>
                        <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
