"use client";

import { Container } from "@/components/ui/container";
import { GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function TrainingPage() {
  const { locale } = useI18n();
  const isRTL = locale === "ar";

  return (
    <div className="bg-white pt-28 sm:pt-32 lg:pt-36 pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <Container>
        {/* Core Content Container — Solid, prestigious executive surface */}
        <div className="relative overflow-hidden rounded-xl border border-[#001a33]/10 bg-white p-8 lg:p-12">
          {/* Elegant decorative background pattern */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(139,0,0,0.04),transparent_50%)]" />
          
          <div className="relative z-10 mx-auto max-w-4xl text-center py-16 sm:py-24">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B0000]/10 text-[#8B0000] border border-[#8B0000]/15 shadow-sm shadow-[#8B0000]/5">
              <GraduationCap className="h-8 w-8 animate-pulse" />
            </div>

            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#001a33] lg:text-4xl">
              {isRTL ? "قريباً" : "Coming Soon"}
            </h2>
            
            <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              {isRTL 
                ? "انتهت برامجنا التدريبية لعام 2026. ترقبوا إطلاق برامج جديدة في عام 2027!"
                : "Our 2026 training programs have concluded. Stay tuned for our upcoming 2027 programs!"}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
