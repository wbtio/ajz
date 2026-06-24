"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  Boxes,
  Calendar,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  MapPin,
  Network,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { RegistrationDialog } from "./registration-dialog";
import type { DesignProps } from "./types";

const ACCENT = "#14b8a6";

/**
 * TECHNOLOGY / DIGITAL TRANSFORMATION
 * Visual identity: futuristic control-panel — circuit grid, terminal-style
 * monospace labels, glowing modules and bracketed numbering. Teal on near-black.
 */
export function TechnologyDesign({ slug, sector, content, events }: DesignProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const name = isArabic ? content.nameAr : content.name;
  const focusAreas = (isArabic ? content.scopeAr : content.scope)
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const serviceIcons = [Network, Boxes, Cloud, Cpu, Database, Terminal];

  return (
    <div className="bg-[#05080a] pb-20 text-slate-200" dir={dir} lang={locale}>
      {/* ===== HERO — control grid ===== */}
      <section className="relative min-h-[66vh] w-full overflow-hidden border-b border-teal-500/20">
        <div className="absolute inset-0 z-0">
          <Image
            fill
            src="/images/bg-technology.png"
            alt={name}
            sizes="100vw"
            priority
            className="object-cover opacity-30"
          />
        </div>
        {/* circuit grid */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(#14b8a622 1px, transparent 1px), linear-gradient(90deg, #14b8a622 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at 50% 40%, black, transparent 75%)",
          }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#05080a] via-[#05080a]/80 to-[#05080a]/40" />

        <Container className="relative z-10 flex min-h-[66vh] flex-col justify-center py-32">
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-500/30 bg-teal-500/5 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
            {isArabic ? "النظام متصل" : "System Online"}
          </div>

          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            {isArabic ? content.heroDescriptionAr : content.heroDescription}
          </p>

          {focusAreas.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
              {focusAreas.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="rounded border border-teal-500/25 bg-teal-500/[0.06] px-2.5 py-1 text-teal-300"
                >
                  {area}
                </span>
              ))}
            </div>
          )}

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
                  className="min-h-12 rounded-md bg-teal-500 px-6 text-sm font-semibold text-[#05080a] hover:bg-teal-400"
                >
                  {isArabic ? "بدء التسجيل" : "Initialize Registration"}
                </Button>
              }
            />
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="group min-h-12 rounded-md border border-teal-500/30 bg-transparent px-6 font-mono text-sm font-semibold text-teal-300 hover:bg-teal-500/10 hover:text-teal-200"
            >
              <Link href="#sector-events" className="inline-flex items-center gap-2">
                {isArabic ? "عرض الفعاليات" : "View Events"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <Container className="mt-16 space-y-16">
        {/* ===== ABOUT ===== */}
        {content.aboutDescription && (
          <section>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-teal-400">
              {isArabic ? "[ نظرة عامة ]" : "[ OVERVIEW ]"}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              {isArabic ? "عن القسم" : "About the Department"}
            </h2>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-7">
              <p className="max-w-4xl text-base leading-8 text-slate-400">
                {isArabic ? content.aboutDescriptionAr : content.aboutDescription}
              </p>
            </div>
          </section>
        )}

        {/* ===== VISION / MISSION — console panels ===== */}
        {(content.vision || content.mission) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {content.vision && (
              <ConsolePanel
                tag="vision.cfg"
                title={isArabic ? "رؤيتنا" : "Our Vision"}
                body={(isArabic ? content.visionAr : content.vision) ?? ""}
                glow
              />
            )}
            {content.mission && (
              <ConsolePanel
                tag="mission.cfg"
                title={isArabic ? "مهمتنا" : "Our Mission"}
                body={(isArabic ? content.missionAr : content.mission) ?? ""}
              />
            )}
          </div>
        )}

        {/* ===== SERVICES — module grid ===== */}
        {content.services && content.services.length > 0 && (
          <section>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-teal-400">
              {isArabic ? "[ الوحدات ]" : "[ MODULES ]"}
            </p>
            <h2 className="mt-3 mb-8 text-3xl font-bold tracking-tight text-white">
              {isArabic ? "خدماتنا" : "Our Services"}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(isArabic ? content.servicesAr : content.services)?.map((service, i) => {
                const Icon = serviceIcons[i % serviceIcons.length];
                return (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-teal-500/40 hover:bg-teal-500/[0.04]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-300 transition-colors group-hover:bg-teal-500 group-hover:text-[#05080a]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs text-teal-500/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">{service}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== WHY — diagnostics ===== */}
        {content.whyJaz && content.whyJaz.length > 0 && (
          <section className="rounded-3xl border border-teal-500/20 bg-teal-500/[0.03] p-8 sm:p-10">
            <div className="mb-7 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-teal-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {isArabic ? `لماذا ${content.nameAr}؟` : `Why ${content.name}?`}
              </h2>
            </div>
            <div className="space-y-2.5">
              {(isArabic ? content.whyJazAr : content.whyJaz)?.map((reason, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-teal-400 rtl:rotate-180" />
                  <p className="text-sm leading-6 text-slate-300">{reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== EVENTS ===== */}
        <div id="sector-events" className="scroll-mt-28">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-teal-400">
                {isArabic ? "[ الأجندة ]" : "[ AGENDA ]"}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                {isArabic ? "الفعاليات ضمن هذا القسم" : "Events in This Division"}
              </h2>
            </div>
            <Link href={`/events?sector=${slug}`}>
              <Button
                variant="outline"
                className="min-h-10 border-teal-500/40 bg-transparent text-teal-300 hover:bg-teal-500/10 hover:text-teal-200"
              >
                {isArabic ? "عرض الكل" : "View All"}
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group h-full rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:-translate-y-1 hover:border-teal-500/40 hover:bg-teal-500/[0.04]">
                    <h3 className="mb-3 text-lg font-bold text-white transition-colors group-hover:text-teal-300">
                      {isArabic ? event.title_ar || event.title : event.title || event.title_ar}
                    </h3>
                    {event.sub_sector && (
                      <span className="mb-3 inline-block rounded border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] text-teal-300">
                        {event.sub_sector}
                      </span>
                    )}
                    <div className="space-y-2 text-sm text-slate-400">
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
            <div className="rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <p className="mx-auto mb-4 max-w-[50ch] text-sm leading-relaxed text-slate-400">
                {isArabic
                  ? "لا توجد فعاليات قادمة مجدولة في هذا القسم حالياً."
                  : "No upcoming events scheduled in this division yet."}
              </p>
              <Link href="/events">
                <Button variant="outline" className="border-teal-500/40 bg-transparent text-teal-300 hover:bg-teal-500/10">
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

function ConsolePanel({
  tag,
  title,
  body,
  glow,
}: {
  tag: string;
  title: string;
  body: string;
  glow?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f12]"
      style={glow ? { boxShadow: "0 0 60px -20px #14b8a655" } : undefined}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-teal-500/60" />
        <span className="ms-2 font-mono text-xs text-slate-500">{tag}</span>
      </div>
      <div className="p-7">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-teal-300">
          {title}
        </h3>
        <p className="mt-3 text-[15px] leading-7 text-slate-300">{body}</p>
      </div>
    </div>
  );
}
