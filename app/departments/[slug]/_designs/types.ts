import type { Tables } from "@/lib/database.types";
import type { SectorContentEntry } from "@/app/departments/department-content";

/**
 * Props shared by every per-sector design. Each design renders this data with a
 * completely different layout and visual identity, while the underlying content
 * always comes from `department-content.ts`.
 */
export interface DesignProps {
  slug: string;
  sector: Tables<"sectors">;
  content: SectorContentEntry;
  events: Tables<"events">[] | null;
}
