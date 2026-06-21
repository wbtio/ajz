"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessagesSquare } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface ContactBannerProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function ContactBanner({
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: ContactBannerProps) {
  const { locale, dir } = useI18n();
  const isArabic = locale === "ar";
  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section
      dir={dir}
      lang={locale}
      className={cn(
        "relative overflow-hidden bg-[#001a33] py-8 text-white sm:py-10",
        className,
      )}
      aria-label={isArabic ? "دعوة للتواصل" : "Contact call to action"}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 0% 0%, rgba(139,0,0,0.18), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(15,118,110,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(/world-map.svg)",
          backgroundPosition: "center",
          backgroundSize: "130% auto",
          backgroundRepeat: "no-repeat",
        }}
      />

      <Container className="relative max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
        >
          <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#8b0000]/20 text-[#ff7a72] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-11 sm:w-11"
            >
              <MessagesSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0 text-start">
              <h2 className="text-base font-extrabold leading-tight text-white sm:text-lg lg:text-xl">
                {title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-white/70 sm:text-sm lg:text-[0.95rem]">
                {description}
              </p>
            </div>
          </div>

          <Link
            href={ctaHref}
            className={cn(
              "group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#8b0000] px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_-10px_rgba(139,0,0,0.6)] transition-all duration-300 hover:bg-[#a01010] hover:shadow-[0_18px_32px_-10px_rgba(139,0,0,0.7)] sm:text-sm",
            )}
          >
            {ctaLabel}
            <Arrow
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              aria-hidden
            />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
