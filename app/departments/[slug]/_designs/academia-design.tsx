"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  Quote,
} from "lucide-react";
import { RegistrationDialog } from "./registration-dialog";
import type { DesignProps } from "./types";

const ACCENT = "#4338ca";
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/**
 * ACADEMIA / PROFESSIONAL & ACADEMIC AFFAIRS
 * Visual identity: scholarly editorial — serif display type, journal-style
 * two-column layout, roman-numeral chapters and a pull-quote. Indigo on paper.
 */
export function AcademiaDesign({ slug, sector, content, events }: DesignProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const name = isArabic ? content.nameAr : content.name;
  const focusAreas = (isArabic ? content.scopeAr : content.scope)
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#faf9f6] pb-20 text-slate-800" dir={dir} lang={locale}>
      {/* ===== HERO — title page ===== */}
      <section className="relative w-full overflow-hidden border-b-2 border-indigo-900/10 bg-[#1e1b4b] text-white">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            src="/images/bg-academia.png"
            alt={name}
            sizes="100vw"
            priority
            className="object-cover opacity-25"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#1e1b4b] via-[#1e1b4b]/85 to-[#1e1b4b]/60" />

        <Container className="relative z-10 py-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-indigo-300/30 bg-indigo-500/10">
            <GraduationCap className="h-7 w-7 text-indigo-200" />
          </div>
          <p className="mt-6 font-serif text-sm italic tracking-wide text-indigo-200/80">
            {isArabic ? "القسم المهني والأكاديمي" : "Professional & Academic Affairs"}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-indigo-300/40" />
          <h1 className="mx-auto mt-6 max-w-4xl text-balance font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-indigo-100/70">
            {isArabic ? content.heroDescriptionAr : content.heroDescription}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <RegistrationDialog
              sectorId={sector.id}
              sectorName={name}
              intro={content.registrationIntro}
              introAr={content.registrationIntroAr}
              accentColor={ACCENT}
              trigger={
                <Button
                  size="lg"
                  className="min-h-12 rounded-full bg-white px-7 text-sm font-semibold text-[#1e1b4b] hover:bg-indigo-50"
                >
                  {isArabic ? "تقديم الطلب" : "Submit Application"}
                </Button>
              }
            />
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="group min-h-12 rounded-full border border-white/25 bg-transparent px-7 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#sector-events" className="inline-flex items-center gap-2">
                {isArabic ? "الفعاليات العلمية" : "Scientific Events"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <Container className="mt-16 max-w-5xl space-y-16">
        {/* ===== ABOUT — editorial with drop motif ===== */}
        {content.aboutDescription && (
          <section className="grid grid-cols-1 gap-8 md:grid-cols-[180px_1fr]">
            <div className="md:text-end">
              <BookOpen className="h-7 w-7 text-indigo-700 md:ms-auto" />
              <h2 className="mt-3 font-serif text-2xl font-bold text-[#1e1b4b]">
                {isArabic ? "عن القسم" : "About"}
              </h2>
              <p className="mt-1 font-serif text-sm italic text-indigo-700/70">
                {isArabic ? content.overviewTitleAr : content.overviewTitle}
              </p>
            </div>
            <p className="border-indigo-900/10 text-[17px] leading-8 text-slate-700 md:border-s md:ps-8">
              {isArabic ? content.aboutDescriptionAr : content.aboutDescription}
            </p>
          </section>
        )}

        {/* ===== VISION — pull quote ===== */}
        {content.vision && (
          <section className="relative rounded-2xl bg-[#1e1b4b] px-8 py-12 text-center text-white sm:px-16">
            <Quote className="mx-auto h-10 w-10 text-indigo-400/50" />
            <p className="mx-auto mt-5 max-w-3xl font-serif text-xl italic leading-9 text-indigo-50 sm:text-2xl">
              {isArabic ? content.visionAr : content.vision}
            </p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">
              {isArabic ? "رؤيتنا" : "Our Vision"}
            </p>
          </section>
        )}

        {/* ===== MISSION ===== */}
        {content.mission && (
          <section className="rounded-2xl border border-indigo-900/10 bg-white p-8 sm:p-10">
            <h3 className="font-serif text-sm font-bold uppercase tracking-[0.25em] text-indigo-700">
              {isArabic ? "مهمتنا" : "Our Mission"}
            </h3>
            <p className="mt-4 text-[17px] leading-8 text-slate-700">
              {isArabic ? content.missionAr : content.mission}
            </p>
          </section>
        )}

        {/* ===== SERVICES — chapters ===== */}
        {content.services && content.services.length > 0 && (
          <section>
            <h2 className="mb-8 font-serif text-3xl font-bold text-[#1e1b4b]">
              {isArabic ? "خدماتنا" : "Our Services"}
            </h2>
            <div className="divide-y divide-indigo-900/10 border-y border-indigo-900/10">
              {(isArabic ? content.servicesAr : content.services)?.map((service, i) => (
                <div key={i} className="flex items-start gap-6 py-6">
                  <span className="font-serif text-3xl font-bold text-indigo-700/30">
                    {ROMAN[i] || i + 1}
                  </span>
                  <p className="pt-1 text-[16px] leading-7 text-slate-700">{service}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== WHY ===== */}
        {content.whyJaz && content.whyJaz.length > 0 && (
          <section>
            <h2 className="mb-7 font-serif text-3xl font-bold text-[#1e1b4b]">
              {isArabic ? `لماذا ${content.nameAr}؟` : `Why ${content.name}?`}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {(isArabic ? content.whyJazAr : content.whyJaz)?.map((reason, i) => (
                <div key={i} className="border-s-2 border-indigo-700/40 ps-5">
                  <p className="text-[15px] leading-7 text-slate-700">{reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== FOCUS AREAS as footnotes ===== */}
        {focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-indigo-900/10 pt-8">
            {focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-indigo-700/20 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-800"
              >
                {area}
              </span>
            ))}
          </div>
        )}

        {/* ===== EVENTS ===== */}
        <div id="sector-events" className="scroll-mt-28">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-3xl font-bold text-[#1e1b4b]">
              {isArabic ? "الفعاليات ضمن هذا القسم" : "Events in This Division"}
            </h2>
            <Link href={`/events?sector=${slug}`}>
              <Button
                variant="outline"
                className="min-h-10 rounded-full border-indigo-700/30 text-indigo-800 hover:bg-indigo-50 hover:text-indigo-900"
              >
                {isArabic ? "عرض الكل" : "View All"}
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group h-full rounded-2xl border border-indigo-900/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-indigo-700/30 hover:shadow-[0_12px_32px_rgba(67,56,202,0.08)]">
                    <h3 className="mb-3 font-serif text-lg font-bold text-[#1e1b4b] transition-colors group-hover:text-indigo-700">
                      {isArabic ? event.title_ar || event.title : event.title || event.title_ar}
                    </h3>
                    {event.sub_sector && (
                      <span className="mb-3 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        {event.sub_sector}
                      </span>
                    )}
                    <div className="space-y-2 text-sm text-slate-500">
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
            <div className="rounded-2xl border border-indigo-900/10 bg-white py-12 text-center">
              <p className="mx-auto mb-4 max-w-[50ch] text-sm leading-relaxed text-slate-500">
                {isArabic
                  ? "لا توجد فعاليات قادمة مجدولة في هذا القسم حالياً."
                  : "No upcoming events scheduled in this division yet."}
              </p>
              <Link href="/events">
                <Button variant="outline" className="rounded-full border-indigo-700/30 text-indigo-800">
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
