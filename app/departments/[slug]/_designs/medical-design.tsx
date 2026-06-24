"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  HeartPulse,
  MapPin,
  Microscope,
  Plus,
  ShieldPlus,
  Stethoscope,
  Target,
} from "lucide-react";
import { RegistrationDialog } from "./registration-dialog";
import type { DesignProps } from "./types";

const ACCENT = "#b42318";

/**
 * MEDICAL / HEALTHCARE & LIFE SCIENCES
 * Visual identity: clinical and precise — ECG pulse motifs, a "vitals" data
 * strip, treatment-protocol numbering and clinical cross marks. Crimson on
 * clean clinical neutrals.
 */
export function MedicalDesign({ slug, sector, content, events }: DesignProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const name = isArabic ? content.nameAr : content.name;
  const focusAreas = (isArabic ? content.scopeAr : content.scope)
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const serviceIcons = [Stethoscope, Microscope, HeartPulse, ShieldPlus, Activity, Plus];

  return (
    <div className="bg-white pb-20" dir={dir} lang={locale}>
      {/* ===== HERO — clinical monitor ===== */}
      <section className="relative min-h-[64vh] w-full overflow-hidden bg-[#0c0a09] text-white">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            src="/images/bg-medical.png"
            alt={name}
            sizes="100vw"
            priority
            className="object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/70 to-[#0c0a09]/30" />

        {/* ECG pulse line motif */}
        <svg
          className="absolute inset-x-0 bottom-28 z-[2] h-24 w-full text-[#b42318]/50"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 50 H260 l20 -34 22 64 18 -78 26 96 20 -48 H520 l24 -20 18 40 22 -62 20 50 H1200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <Container className="relative z-10 flex min-h-[64vh] flex-col justify-end pb-16 pt-32">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b42318] shadow-[0_0_30px_#b4231880]">
              <HeartPulse className="h-6 w-6 text-white" />
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f87171]" />
              {isArabic ? "قطاع الرعاية الصحية" : "Healthcare Sector"}
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
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
                  className="min-h-12 rounded-lg bg-[#b42318] px-6 text-sm font-semibold text-white hover:bg-[#9a1f14]"
                >
                  {isArabic ? "فتح ملف التسجيل" : "Open Registration Form"}
                </Button>
              }
            />
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="group min-h-12 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#sector-events" className="inline-flex items-center gap-2">
                {isArabic ? "استكشف الفعاليات" : "Explore Events"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* ===== VITALS STRIP (focus areas) ===== */}
      {focusAreas.length > 0 && (
        <div className="border-y border-stone-200 bg-stone-50">
          <Container>
            <div className="grid grid-cols-1 divide-y divide-stone-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse">
              {focusAreas.slice(0, 3).map((area, i) => (
                <div key={area} className="flex items-center gap-3 px-2 py-6 sm:px-6">
                  <span className="font-mono text-xs font-bold text-[#b42318]">
                    0{i + 1}
                  </span>
                  <span className="h-8 w-px bg-stone-300" />
                  <span className="text-sm font-semibold text-stone-700">{area}</span>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      <Container className="mt-16 space-y-16">
        {/* ===== ABOUT — dossier ===== */}
        {content.aboutDescription && (
          <section className="relative ps-6">
            <span className="absolute inset-y-1 start-0 w-1 rounded-full bg-[#b42318]" />
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#b42318]">
              {isArabic ? "// السجل" : "// Clinical Dossier"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
              {isArabic ? "عن القسم" : "About the Department"}
            </h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-stone-600">
              {isArabic ? content.aboutDescriptionAr : content.aboutDescription}
            </p>
          </section>
        )}

        {/* ===== VISION / MISSION — clinical cards ===== */}
        {(content.vision || content.mission) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {content.vision && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#b42318]/15 bg-white p-8 shadow-[0_1px_0_#b4231810]">
                <Plus className="absolute end-5 top-5 h-16 w-16 text-[#b42318]/8" strokeWidth={1} />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b42318]/10">
                  <Activity className="h-6 w-6 text-[#b42318]" />
                </div>
                <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#b42318]">
                  {isArabic ? "رؤيتنا" : "Our Vision"}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-stone-600">
                  {isArabic ? content.visionAr : content.vision}
                </p>
              </div>
            )}
            {content.mission && (
              <div className="relative overflow-hidden rounded-2xl bg-[#0c0a09] p-8 text-white">
                <Target className="absolute end-5 top-5 h-16 w-16 text-white/5" strokeWidth={1} />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b42318]">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#f87171]">
                  {isArabic ? "مهمتنا" : "Our Mission"}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-white/75">
                  {isArabic ? content.missionAr : content.mission}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== SERVICES — treatment protocol ===== */}
        {content.services && content.services.length > 0 && (
          <section>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#b42318]">
              {isArabic ? "// البروتوكول" : "// Protocol"}
            </p>
            <h2 className="mt-2 mb-8 text-3xl font-bold tracking-tight text-stone-900">
              {isArabic ? "خدماتنا" : "Our Services"}
            </h2>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 md:grid-cols-2">
              {(isArabic ? content.servicesAr : content.services)?.map((service, i) => {
                const Icon = serviceIcons[i % serviceIcons.length];
                return (
                  <div
                    key={i}
                    className="group flex items-start gap-4 bg-white p-6 transition-colors hover:bg-[#b42318]/[0.03]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#b42318]/10 text-[#b42318] transition-colors group-hover:bg-[#b42318] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="pt-1.5 text-sm leading-6 text-stone-600">{service}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== WHY — clinical assurances ===== */}
        {content.whyJaz && content.whyJaz.length > 0 && (
          <section className="rounded-3xl border border-[#b42318]/15 bg-gradient-to-b from-[#b42318]/[0.04] to-transparent p-8 sm:p-10">
            <h2 className="mb-7 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {isArabic ? `لماذا ${content.nameAr}؟` : `Why ${content.name}?`}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(isArabic ? content.whyJazAr : content.whyJaz)?.map((reason, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-stone-100 bg-white p-5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#b42318]">
                    <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <p className="text-sm leading-6 text-stone-700">{reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== EVENTS ===== */}
        <SectorEvents slug={slug} events={events} isArabic={isArabic} />
      </Container>
    </div>
  );
}

function SectorEvents({
  slug,
  events,
  isArabic,
}: {
  slug: string;
  events: DesignProps["events"];
  isArabic: boolean;
}) {
  return (
    <div id="sector-events" className="scroll-mt-28">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#b42318]">
            {isArabic ? "// الأجندة" : "// Agenda"}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            {isArabic ? "الفعاليات ضمن هذا القسم" : "Events in This Division"}
          </h2>
        </div>
        <Link href={`/events?sector=${slug}`}>
          <Button
            variant="outline"
            className="min-h-10 border-[#b42318]/30 text-[#b42318] hover:bg-[#b42318]/5 hover:text-[#b42318]"
          >
            {isArabic ? "عرض الكل" : "View All"}
          </Button>
        </Link>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group h-full rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#b42318]/40 hover:shadow-[0_12px_32px_rgba(180,35,24,0.08)]">
                <h3 className="mb-3 text-lg font-bold text-stone-900 transition-colors group-hover:text-[#b42318]">
                  {isArabic ? event.title_ar || event.title : event.title || event.title_ar}
                </h3>
                {event.sub_sector && (
                  <span className="mb-3 inline-block rounded-full bg-[#b42318]/10 px-2 py-0.5 text-[10px] font-medium text-[#b42318]">
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
        <div className="rounded-2xl border border-stone-200 bg-stone-50 py-12 text-center">
          <p className="mx-auto mb-4 max-w-[50ch] text-sm leading-relaxed text-stone-500">
            {isArabic
              ? "لا توجد فعاليات قادمة مجدولة في هذا القسم حالياً."
              : "No upcoming events scheduled in this division yet."}
          </p>
          <Link href="/events">
            <Button variant="outline" className="border-stone-300">
              {isArabic ? "تصفح جميع الفعاليات" : "Browse All Events"}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
