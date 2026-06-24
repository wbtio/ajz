"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  Calendar,
  Factory,
  Globe2,
  MapPin,
  Package,
  Ship,
  TrendingUp,
  Truck,
  Wrench,
} from "lucide-react";
import { RegistrationDialog } from "./registration-dialog";
import type { DesignProps } from "./types";

const ACCENT = "#ea580c";

/**
 * INDUSTRIAL & COMMERCIAL DEVELOPMENT
 * Visual identity: heavy industrial — blueprint grid, hazard-stripe accents,
 * oversized block numbering and structural slabs. Amber-orange on graphite.
 */
export function IndustrieDesign({ slug, sector, content, events }: DesignProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const name = isArabic ? content.nameAr : content.name;
  const focusAreas = (isArabic ? content.scopeAr : content.scope)
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const serviceIcons = [Factory, Globe2, Truck, Package, Ship, TrendingUp];

  return (
    <div className="bg-[#fafaf9] pb-20 text-stone-800" dir={dir} lang={locale}>
      {/* ===== HERO — industrial slab ===== */}
      <section className="relative w-full overflow-hidden bg-[#1c1917] text-white">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            src="/images/bg-industrie.png"
            alt={name}
            sizes="100vw"
            priority
            className="object-cover opacity-40"
          />
        </div>
        {/* blueprint grid */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff14 1px, transparent 1px), linear-gradient(90deg, #ffffff14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#1c1917] via-[#1c1917]/80 to-[#1c1917]/40" />
        {/* hazard stripe */}
        <div
          className="absolute inset-x-0 top-0 z-[2] h-2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #ea580c 0 14px, #1c1917 14px 28px)",
          }}
        />

        <Container className="relative z-10 py-28">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#ea580c]">
              <Wrench className="h-6 w-6 text-white" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-orange-300">
              {isArabic ? "الصناعة والتجارة" : "Industry & Trade"}
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl">
            {name}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-stone-300">
            {isArabic ? content.heroDescriptionAr : content.heroDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <RegistrationDialog
              sectorId={sector.id}
              sectorName={name}
              intro={content.registrationIntro}
              introAr={content.registrationIntroAr}
              accentColor={ACCENT}
              trigger={
                <Button
                  size="lg"
                  className="min-h-12 rounded-sm bg-[#ea580c] px-7 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#c2410c]"
                >
                  {isArabic ? "تسجيل المنشأة" : "Register Enterprise"}
                </Button>
              }
            />
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="group min-h-12 rounded-sm border border-white/25 bg-transparent px-7 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#sector-events" className="inline-flex items-center gap-2">
                {isArabic ? "المعارض" : "Trade Fairs"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* ===== FOCUS marquee strip ===== */}
      {focusAreas.length > 0 && (
        <div className="bg-[#ea580c] text-white">
          <Container>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em]">
              {focusAreas.map((area) => (
                <span key={area} className="flex items-center gap-3">
                  <span className="text-white/60">/</span>
                  {area}
                </span>
              ))}
            </div>
          </Container>
        </div>
      )}

      <Container className="mt-16 space-y-16">
        {/* ===== ABOUT ===== */}
        {content.aboutDescription && (
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
            <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-stone-900">
              {isArabic ? "عن القسم" : "About the\nDivision"}
            </h2>
            <p className="text-base leading-8 text-stone-600">
              {isArabic ? content.aboutDescriptionAr : content.aboutDescription}
            </p>
          </section>
        )}

        {/* ===== VISION / MISSION — slabs ===== */}
        {(content.vision || content.mission) && (
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-stone-300 bg-stone-300 md:grid-cols-2">
            {content.vision && (
              <div className="bg-[#1c1917] p-9 text-white">
                <div className="mb-5 inline-block border-b-2 border-[#ea580c] pb-1 font-mono text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                  {isArabic ? "الرؤية" : "Vision"}
                </div>
                <p className="text-[15px] leading-7 text-stone-300">
                  {isArabic ? content.visionAr : content.vision}
                </p>
              </div>
            )}
            {content.mission && (
              <div className="bg-white p-9">
                <div className="mb-5 inline-block border-b-2 border-[#ea580c] pb-1 font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#ea580c]">
                  {isArabic ? "المهمة" : "Mission"}
                </div>
                <p className="text-[15px] leading-7 text-stone-600">
                  {isArabic ? content.missionAr : content.mission}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== SERVICES — block numbered ===== */}
        {content.services && content.services.length > 0 && (
          <section>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-3 w-3 bg-[#ea580c]" />
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-stone-900">
                {isArabic ? "خدماتنا" : "Our Services"}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(isArabic ? content.servicesAr : content.services)?.map((service, i) => {
                const Icon = serviceIcons[i % serviceIcons.length];
                return (
                  <div
                    key={i}
                    className="group relative flex items-start gap-5 rounded-sm border border-stone-200 bg-white p-6 transition-colors hover:border-[#ea580c]"
                  >
                    <span className="font-mono text-4xl font-extrabold leading-none text-stone-200 transition-colors group-hover:text-[#ea580c]/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <Icon className="mb-3 h-5 w-5 text-[#ea580c]" />
                      <p className="text-sm leading-6 text-stone-600">{service}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== WHY ===== */}
        {content.whyJaz && content.whyJaz.length > 0 && (
          <section className="rounded-sm bg-[#1c1917] p-8 text-white sm:p-10">
            <h2 className="mb-8 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              {isArabic ? `لماذا ${content.nameAr}؟` : `Why ${content.name}?`}
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              {(isArabic ? content.whyJazAr : content.whyJaz)?.map((reason, i) => (
                <div key={i} className="flex items-start gap-4 border-t border-white/10 pt-5">
                  <span className="font-mono text-sm font-bold text-[#ea580c]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-6 text-stone-300">{reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== EVENTS ===== */}
        <div id="sector-events" className="scroll-mt-28">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="h-3 w-3 bg-[#ea580c]" />
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-stone-900">
                {isArabic ? "الفعاليات" : "Events"}
              </h2>
            </div>
            <Link href={`/events?sector=${slug}`}>
              <Button
                variant="outline"
                className="min-h-10 rounded-sm border-[#ea580c]/40 font-semibold uppercase tracking-wide text-[#ea580c] hover:bg-[#ea580c]/5 hover:text-[#ea580c]"
              >
                {isArabic ? "عرض الكل" : "View All"}
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group h-full rounded-sm border border-stone-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#ea580c]">
                    <h3 className="mb-3 text-lg font-bold text-stone-900 transition-colors group-hover:text-[#ea580c]">
                      {isArabic ? event.title_ar || event.title : event.title || event.title_ar}
                    </h3>
                    {event.sub_sector && (
                      <span className="mb-3 inline-block rounded-sm bg-[#ea580c]/10 px-2 py-0.5 text-[10px] font-medium text-[#ea580c]">
                        {event.sub_sector}
                      </span>
                    )}
                    <div className="space-y-2 text-sm text-stone-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                        <span>{[event.location, event.country].filter(Boolean).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-stone-200 bg-white py-12 text-center">
              <p className="mx-auto mb-4 max-w-[50ch] text-sm leading-relaxed text-stone-500">
                {isArabic
                  ? "لا توجد فعاليات قادمة مجدولة في هذا القسم حالياً."
                  : "No upcoming events scheduled in this division yet."}
              </p>
              <Link href="/events">
                <Button variant="outline" className="rounded-sm border-[#ea580c]/40 text-[#ea580c]">
                  {isArabic ? "تصفح جميع الفعاليات" : "Browse All Events"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
