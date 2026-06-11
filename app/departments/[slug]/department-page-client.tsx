"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const SectorRegistrationForm = dynamic(
  () =>
    import("@/app/departments/components/sector-registration-form").then(
      (mod) => mod.SectorRegistrationForm,
    ),
  {
    loading: () => (
      <div className="flex h-48 items-center justify-center bg-white rounded-xl border border-stone-200 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8b0000] border-t-transparent" />
          <span className="text-xs font-medium text-stone-500">Loading intake dossier...</span>
        </div>
      </div>
    ),
    ssr: false,
  },
);
import { useI18n } from "@/lib/i18n";
import type { Tables } from "@/lib/database.types";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  Cpu,
  GraduationCap,
  Heart,
  MapPin,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { SectorContentEntry } from "@/app/departments/department-content";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Building2,
  Heart,
  Cpu,
  GraduationCap,
};

const bgImageMap: Record<string, string> = {
  medical: "/images/bg-medical.png",
  technology: "/images/bg-technology.png",
  industrie: "/images/bg-industrie.png",
  academia: "/images/bg-academia.png",
};

interface DepartmentPageClientProps {
  slug: string;
  sector: Tables<"sectors">;
  content: SectorContentEntry;
  events: Tables<"events">[] | null;
}

export function DepartmentPageClient({
  slug,
  sector,
  content,
  events,
}: DepartmentPageClientProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const IconComponent = iconMap[sector.icon || "Building2"] || Building2;
  const accentColor = sector.color || content.accent || "#8b0000";
  const primaryName = isArabic ? content.nameAr : content.name;
  const heroDescription = isArabic
    ? content.heroDescriptionAr
    : content.heroDescription;
  const overviewTitle = isArabic
    ? content.overviewTitleAr
    : content.overviewTitle;
  const keywordChips = (isArabic ? content.scopeAr : content.scope)
    .split(/[،,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="pb-12" dir={dir} lang={locale}>
      {/* ===== IMMERSIVE HERO SECTION ===== */}      <section className="relative min-h-[36vh] lg:min-h-[40vh] w-full overflow-hidden bg-stone-950 text-white flex items-center">
          {/* Background image layer */}
          <div className="absolute inset-0 z-0">
            <Image
              fill
              src={bgImageMap[content.key] || "/images/bg-medical.png"}
              alt={primaryName}
              sizes="100vw"
              priority
              className="object-cover opacity-80 transition-all duration-700 hover:scale-[1.01]"
            />
          </div>

          {/* Clean minimal dark overlay for text contrast (removes heavy shadows/orbs) */}
          <div className="absolute inset-0 z-[1] bg-stone-950/30" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 w-full px-6 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-32 lg:px-14 lg:pb-20 lg:pt-36">
            <div className="max-w-4xl text-start space-y-6">
                {/* Badge row */}
                <div className="flex flex-wrap items-center justify-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 shadow-2xl"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      borderColor: `${accentColor}60`,
                      boxShadow: `0 0 40px ${accentColor}30`,
                    }}
                  >
                    <IconComponent
                      className="h-8 w-8"
                      style={{ color: accentColor }}
                    />
                  </div>
                  <div className="min-w-0 text-start">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold text-white tracking-[0.2em] uppercase border border-white/10"
                      style={{ backgroundColor: `${accentColor}cc` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                      {isArabic ? "قسم استراتيجي" : "Strategic Division"}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                  {primaryName}
                </h1>

                {/* Scope chips */}
                <div className="flex flex-wrap justify-start gap-2 pt-2">
                  {(keywordChips.length > 0 ? keywordChips : [overviewTitle]).map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90"
                      >
                        {keyword}
                      </span>
                    ),
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-start sm:gap-3 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="min-h-11 rounded-md bg-white px-5 text-sm font-semibold text-stone-950 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-950 transition-colors duration-200"
                      >
                        {isArabic
                          ? "فتح نموذج التسجيل"
                          : "Open Registration Form"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      dir={dir}
                      className="inset-0 left-0 top-0 h-screen w-screen max-h-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[#f5f7fa] p-0 shadow-none"
                    >
                      <div className="flex h-full min-h-0 flex-col">
                        <div className="flex items-center justify-between border-b border-stone-200 bg-white py-4 ps-16 pe-5 sm:ps-20 sm:pe-7">
                          <div
                            className={cn(
                              "flex items-center gap-3",
                              isArabic && "flex-row-reverse",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-2",
                                isArabic && "flex-row-reverse",
                              )}
                            >
                              <span className="h-2 w-2 rounded-full bg-[#8b0000]/20" />
                              <span className="h-2 w-2 rounded-full bg-[#8b0000]/40" />
                              <span className="h-2 w-2 rounded-full bg-[#8b0000]" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                              {isArabic ? "نافذة التسجيل" : "Registration Window"}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-stone-500">
                            {isArabic ? "ملف رسمي" : "Official Dossier"}
                          </span>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                          <div className="mx-auto w-full space-y-5 xl:max-w-[56rem] 2xl:max-w-[50vw]">
                            <DialogHeader className="sr-only">
                              <DialogTitle>
                                {isArabic ? "نموذج التسجيل" : "Registration Form"}
                              </DialogTitle>
                              <DialogDescription>
                                {isArabic
                                  ? content.registrationIntroAr
                                  : content.registrationIntro}
                              </DialogDescription>
                            </DialogHeader>

                            <SectorRegistrationForm
                              sectorId={sector.id}
                              sectorName={primaryName}
                              config={null}
                              intro={
                                isArabic
                                  ? content.registrationIntroAr
                                  : content.registrationIntro
                              }
                              variant="plain"
                              showHeader={true}
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="min-h-11 rounded-md border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-stone-950 transition-colors duration-200 group"
              >
                <Link
                  href="#sector-events"
                  className="inline-flex items-center gap-2"
                >
                  {isArabic ? "استكشف الفعاليات" : "Explore Events"}
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

        {/* ===== CONTENT SECTIONS ===== */}
        <Container>
        {(content.aboutDescription || content.vision || content.services || content.whyJaz) && (
          <div className="mt-16 mb-12 space-y-10">
            {/* About the Department */}
            {content.aboutDescription && (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  {isArabic ? "عن القسم" : "About the Department"}
                </h2>
                <p className="max-w-4xl text-base leading-8 text-slate-600">
                  {isArabic ? content.aboutDescriptionAr : content.aboutDescription}
                </p>
              </section>
            )}

            {/* Vision & Mission */}
            {(content.vision || content.mission) && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {content.vision && (
                  <div className="rounded-2xl bg-stone-950 p-8 text-white">
                    <h3 className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                      {isArabic ? "رؤيتنا" : "Our Vision"}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/80">
                      {isArabic ? content.visionAr : content.vision}
                    </p>
                  </div>
                )}
                {content.mission && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
                    <h3 className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                      {isArabic ? "مهمتنا" : "Our Mission"}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {isArabic ? content.missionAr : content.mission}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Our Services */}
            {content.services && content.services.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  {isArabic ? "خدماتنا" : "Our Services"}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(isArabic ? content.servicesAr : content.services)?.map((service, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{service}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Why JAZ */}
            {content.whyJaz && content.whyJaz.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  {isArabic ? `لماذا ${content.nameAr}؟` : `Why ${content.name}?`}
                </h2>
                <div className="space-y-3">
                  {(isArabic ? content.whyJazAr : content.whyJaz)?.map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-5"
                    >
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${accentColor}18` }}
                      >
                        <Check className="h-3 w-3" style={{ color: accentColor }} />
                      </div>
                      <p className="text-sm leading-6 text-slate-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div id="sector-events" className="scroll-mt-32">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-start text-2xl font-bold text-slate-900">
              {isArabic ? "الفعاليات ضمن هذا القسم" : "Events in This Division"}
            </h2>
            <Link href={`/events?sector=${slug}`} className="group">
              <Button
                variant="outline"
                className="min-h-10 border-[#8b0000]/25 text-[#8b0000] hover:bg-[#8b0000]/5 hover:text-[#8b0000] transition-all duration-300"
              >
                {isArabic ? "عرض الكل" : "View All"}
                <ArrowLeft
                  className={cn(
                    "h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5",
                    isArabic ? "me-2" : "ms-2 rotate-180",
                  )}
                  aria-hidden
                />
              </Button>
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="group h-full border border-slate-100/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
                    <CardContent className="p-6 text-start">
                      <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#8b0000]">
                        {isArabic
                          ? event.title_ar || event.title
                          : event.title || event.title_ar}
                      </h3>
                      {event.sub_sector && (
                        <span className="mb-2 inline-block rounded-full bg-[#8b0000]/10 px-2 py-0.5 text-[10px] font-medium text-[#8b0000]">
                          {event.sub_sector}
                        </span>
                      )}
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0">
                            {formatDate(event.date)}
                          </span>
                          <Calendar
                            className="h-4 w-4 shrink-0 opacity-70"
                            aria-hidden
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="min-w-0">
                            {[event.location, event.country]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                          <MapPin
                            className="h-4 w-4 shrink-0 opacity-70"
                            aria-hidden
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50/70 border border-slate-100 py-12 text-center">
              <p className="mb-4 text-sm text-slate-500 max-w-[50ch] mx-auto leading-relaxed">
                {isArabic
                  ? "لا توجد فعاليات قادمة مجدولة في هذا القسم حالياً. يمكنك تصفح جميع الفعاليات لاستكشاف الفرص المتاحة في الأقسام الأخرى."
                  : "No upcoming events scheduled in this division yet. Browse all events to discover opportunities across other sectors."}
              </p>
              <Link href="/events">
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
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
