"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SectorRegistrationForm } from "@/app/departments/components/sector-registration-form";
import { getSectorContent } from "@/app/departments/department-content";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { GraduationCap, Mail, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type TrainingRegistrationSector = Pick<
  Tables<"sectors">,
  "id" | "slug" | "name" | "name_ar" | "registration_config"
>;

export default function TrainingPage() {
  const { t, locale, dir } = useI18n();
  const isRTL = locale === "ar";
  const [registrationSector, setRegistrationSector] =
    useState<TrainingRegistrationSector | null>(null);
  const [isLoadingSector, setIsLoadingSector] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTrainingSector() {
      const supabase = createClient();
      const { data } = await supabase
        .from("sectors")
        .select("id, slug, name, name_ar, registration_config")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!isMounted) return;

      const matchedSector =
        (data || []).find(
          (sector) => getSectorContent(sector)?.key === "academia",
        ) || null;
      const matchedContent = matchedSector
        ? getSectorContent(matchedSector)
        : null;
      setRegistrationSector(
        matchedSector && matchedContent
          ? {
              ...matchedSector,
              name: matchedContent.name,
              name_ar: matchedContent.nameAr,
            }
          : matchedSector,
      );
      setIsLoadingSector(false);
    }

    void loadTrainingSector();

    return () => {
      isMounted = false;
    };
  }, []);

  const registrationIntro = isRTL
    ? "إذا كنتم ترغبون بالتسجيل أو إبداء الاهتمام ببرامج التدريب والتطوير القادمة لعام ٢٠٢٦، يمكنكم تعبئة النموذج التالي وسيتواصل معكم فريقنا."
    : "If you would like to register your interest in our upcoming training and development programs for 2026, please complete the form below and our team will get in touch.";

  return (
    <div className="bg-white pt-28 sm:pt-32 lg:pt-36 pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <Container>
        {/* Core Content Container — Solid, prestigious executive surface */}
        <div className="relative overflow-hidden rounded-xl border border-[#0b1426]/10 bg-white p-8 lg:p-12">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-sm bg-[#8B0000]/6 text-[#8B0000]">
              <GraduationCap className="h-8 w-8" />
            </div>

            <h2 className="mb-8 text-2xl font-bold text-[#0b1426] lg:text-3xl">
              {t.trainingPage.emptyTitle}
            </h2>

            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    disabled={isLoadingSector || !registrationSector}
                    className="min-h-12 rounded-sm bg-[#8B0000] px-6 text-white transition-all duration-200 ease-out hover:bg-[#6B0000] active:scale-[0.98] focus:ring-2 focus:ring-[#8B0000]/20 focus:outline-none shadow-sm font-semibold cursor-pointer"
                  >
                    {isRTL ? "سجل اهتمامك واحجز مقعدك" : "Pre-Register & Secure Your Spot"}
                  </Button>
                </DialogTrigger>
                <DialogContent
                  dir={dir}
                  className="max-h-[90vh] w-[96vw] max-w-4xl overflow-y-auto rounded-xl border border-[#8b0000]/10 bg-white p-6 sm:p-8"
                >
                  <DialogHeader className={isRTL ? "text-right" : "text-left"}>
                    <DialogTitle className="text-2xl text-[#0b1426]">
                      {isRTL ? "نموذج التسجيل المسبق" : "Pre-Registration Form"}
                    </DialogTitle>
                    <DialogDescription
                      className={
                        isRTL
                          ? "text-right leading-7 text-slate-600"
                          : "text-left leading-7 text-slate-600"
                      }
                    >
                      {registrationIntro}
                    </DialogDescription>
                  </DialogHeader>
                  {registrationSector && (
                    <SectorRegistrationForm
                      sectorId={registrationSector.id}
                      sectorName={
                        isRTL
                          ? registrationSector.name_ar
                          : registrationSector.name
                      }
                      config={null}
                      intro={registrationIntro}
                      variant="plain"
                      className="pt-2"
                      showHeader={false}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <Button
                asChild
                className="h-12 rounded-sm bg-[#0b1426] px-6 text-white transition-all duration-200 ease-out hover:bg-[#0b1426]/90 active:scale-[0.98] font-semibold cursor-pointer"
              >
                <Link href="/departments">
                  <Users className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
                  {isRTL
                    ? "تصفح الأقسام"
                    : "Explore Departments"}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-sm border border-[#0b1426]/10 bg-white px-6 text-[#0b1426]/80 transition-all duration-200 ease-out hover:bg-[#f5f7fa] hover:text-[#0b1426] active:scale-[0.98] font-semibold cursor-pointer"
              >
                <Link href="/contact">
                  <Mail className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
                  {t.trainingPage.emptyButton}
                </Link>
              </Button>
            </div>

            {/* Features List — styled as premium secondary backing panel */}
            <div
              className={`rounded-xl border border-[#0b1426]/8 bg-[#f5f7fa] p-6 ${isRTL ? "text-right" : "text-left"}`}
            >
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[#0b1426]/60">
                {isRTL
                  ? "ما يميز برامجنا التدريبية"
                  : "What makes our training programs special"}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div
                  className={`flex items-center gap-3 rounded-sm bg-white border border-[#0b1426]/5 p-3.5 shadow-sm ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#8B0000]/6 text-[#8B0000]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {t.trainingPage.features.experts.title}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 rounded-sm bg-white border border-[#0b1426]/5 p-3.5 shadow-sm ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#8B0000]/6 text-[#8B0000]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {t.trainingPage.features.certificates.title}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 rounded-sm bg-white border border-[#0b1426]/5 p-3.5 shadow-sm ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#8B0000]/6 text-[#8B0000]">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {t.trainingPage.features.interactive.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
