"use client";

import { useI18n } from "@/lib/i18n";
import { StatsBar, type StatsBarItem } from "@/components/shared/stats-bar";

export interface SectorsStatsData {
  years: number;
  events: number;
  countries: number;
  divisions: number;
}

interface SectorsStatsProps {
  stats: SectorsStatsData;
}

export function SectorsStats({ stats }: SectorsStatsProps) {
  const { t } = useI18n();

  const items: StatsBarItem[] = [
    {
      value: stats.years,
      label: t.sectors.stats.years.label,
      suffix: t.sectors.stats.years.suffix,
      icon: "solar:stars-minimalistic-bold-duotone",
    },
    {
      value: stats.events,
      label: t.sectors.stats.events.label,
      suffix: t.sectors.stats.events.suffix,
      icon: "solar:calendar-mark-bold-duotone",
    },
    {
      value: stats.countries,
      label: t.sectors.stats.countries.label,
      suffix: t.sectors.stats.countries.suffix,
      icon: "solar:globus-bold-duotone",
    },
    {
      value: stats.divisions,
      label: t.sectors.stats.divisions.label,
      suffix: t.sectors.stats.divisions.suffix,
      icon: "solar:widget-5-bold-duotone",
    },
  ];

  return <StatsBar items={items} overlap={false} />;
}
