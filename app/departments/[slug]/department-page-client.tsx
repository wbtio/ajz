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
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-12" dir={dir} lang={locale}>
      <Container>
        <nav
          aria-label={isArabic ? "مسار التصفح" : "Breadcrumb"}
          className="mb-8 flex flex-wrap items-center justify-start gap-2 text-sm text-slate-600"
        >
          <Link href="/" className="hover:text-[#8b0000] transition-colors">
            {isArabic ? "الرئيسية" : "Home"}
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/departments" className="hover:text-[#8b0000] transition-colors">
            {isArabic ? "أقسامنا" : "Our Departments"}
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-medium text-slate-900">{primaryName}</span>
        </nav>
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-stone-950 text-white border border-stone-850 shadow-sm">
          {sector.cover_image && (
            <div className="absolute inset-0 z-0">
              <Image
                fill
                src={sector.cover_image}
                alt={primaryName}
                sizes="100vw"
                priority
                className="object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/45 rtl:bg-gradient-to-l" />
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: isArabic
                ? `radial-gradient(circle at 0% 0%, ${accentColor}66, transparent 34%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.08), transparent 32%)`
                : `radial-gradient(circle at 100% 0%, ${accentColor}66, transparent 34%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.08), transparent 32%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div
            className="absolute -end-12 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{ backgroundColor: `${accentColor}33` }}
          />
          <div className="absolute -bottom-24 -start-8 h-64 w-64 rounded-full bg-white/8 blur-3xl" />

          <div className="relative z-10 w-full px-6 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-16">
            <div className="max-w-3xl text-start me-auto">
              <div className="mb-6 flex flex-wrap items-center justify-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}40`,
                  }}
                >
                  <IconComponent
                    className="h-7 w-7"
                    style={{ color: accentColor }}
                  />
                </div>
                <div className="min-w-0 text-start">
                  <span
                    className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold text-white tracking-widest uppercase"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isArabic ? "قسم استراتيجي" : "Strategic Division"}
                  </span>
                </div>
              </div>

              <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
                {primaryName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/90 sm:text-lg lg:text-[1.15rem]">
                {heroDescription}
              </p>

              <div className="mt-6 flex flex-wrap justify-start gap-2">
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

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start sm:gap-3">
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
        </div>

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
