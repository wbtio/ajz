"use client";

import type { Tables } from "@/lib/database.types";
import type { SectorContentEntry } from "@/app/departments/department-content";
import { getSectorDesign } from "./_designs";

interface DepartmentPageClientProps {
  slug: string;
  sector: Tables<"sectors">;
  content: SectorContentEntry;
  events: Tables<"events">[] | null;
}

/**
 * Dispatcher: every sector renders its own dedicated design component
 * (see `_designs/`). The data is identical across sectors — only the visual
 * identity changes, selected here by `content.key`.
 */
export function DepartmentPageClient(props: DepartmentPageClientProps) {
  const Design = getSectorDesign(props.content.key);
  return <Design {...props} />;
}
