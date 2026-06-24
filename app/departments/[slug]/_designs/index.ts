import dynamic from "next/dynamic";
import type { SectorContentEntry } from "@/app/departments/department-content";
import type { DesignProps } from "./types";

const MedicalDesign = dynamic(() =>
  import("./medical-design").then((m) => m.MedicalDesign)
);
const TechnologyDesign = dynamic(() =>
  import("./technology-design").then((m) => m.TechnologyDesign)
);
const AcademiaDesign = dynamic(() =>
  import("./academia-design").then((m) => m.AcademiaDesign)
);
const IndustrieDesign = dynamic(() =>
  import("./industrie-design").then((m) => m.IndustrieDesign)
);

/**
 * Each sector maps to its own dedicated design component. Content always comes
 * from `department-content.ts`; only the visual identity differs per sector.
 * Components are loaded via next/dynamic so a department route only ships the
 * one design it actually renders.
 */
const designRegistry: Record<
  SectorContentEntry["key"],
  React.ComponentType<DesignProps>
> = {
  medical: MedicalDesign,
  technology: TechnologyDesign,
  academia: AcademiaDesign,
  industrie: IndustrieDesign,
};

export function getSectorDesign(key: SectorContentEntry["key"]) {
  return designRegistry[key] ?? MedicalDesign;
}

export type { DesignProps };
