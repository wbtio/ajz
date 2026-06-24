"use client";

import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SectorRegistrationForm = dynamic(
  () =>
    import("@/app/departments/components/sector-registration-form").then(
      (mod) => mod.SectorRegistrationForm,
    ),
  {
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-xl border border-stone-200 bg-white p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          <span className="text-xs font-medium text-stone-500">
            Loading intake dossier...
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

interface RegistrationDialogProps {
  /** The element that opens the dialog (a styled button per design). */
  trigger: React.ReactNode;
  sectorId: string;
  sectorName: string;
  intro: string;
  introAr: string;
  /** Sector accent — used to tint the modal chrome so it stays on-brand. */
  accentColor: string;
}

/**
 * Shared, sector-agnostic registration modal. Every department design wraps it
 * with its own trigger button so the page identity stays distinct while the
 * intake form itself remains consistent.
 */
export function RegistrationDialog({
  trigger,
  sectorId,
  sectorName,
  intro,
  introAr,
  accentColor,
}: RegistrationDialogProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        dir={dir}
        className="inset-0 left-0 top-0 h-screen w-screen max-h-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[#f5f7fa] p-0 shadow-none"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div
            className="flex items-center justify-between border-b border-stone-200 bg-white py-4 ps-16 pe-5 sm:ps-20 sm:pe-7"
            style={{ boxShadow: `inset 0 -2px 0 ${accentColor}22` }}
          >
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
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `${accentColor}33` }}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `${accentColor}66` }}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
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
                  {isArabic ? introAr : intro}
                </DialogDescription>
              </DialogHeader>

              <SectorRegistrationForm
                sectorId={sectorId}
                sectorName={sectorName}
                config={null}
                intro={isArabic ? introAr : intro}
                variant="plain"
                showHeader={true}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
