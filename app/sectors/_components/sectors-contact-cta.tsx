"use client";

import { useI18n } from "@/lib/i18n";
import { ContactBanner } from "@/components/shared/contact-banner";

export function SectorsContactCTA() {
  const { t } = useI18n();

  return (
    <ContactBanner
      title={t.sectors.contactBanner.title}
      description={t.sectors.contactBanner.description}
      ctaLabel={t.sectors.contactBanner.cta}
      ctaHref="/contact"
    />
  );
}
