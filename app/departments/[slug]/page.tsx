import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSectorContent,
  mergeSectorWithContent,
} from "@/app/departments/department-content";
import { DepartmentPageClient } from "./department-page-client";
import { filterVisibleEvents } from "@/lib/events-visibility";

interface DepartmentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sector } = await supabase
    .from("sectors")
    .select("slug, name, name_ar, name_en, description")
    .eq("slug", slug)
    .single();

  if (!sector) {
    return { title: "Department Not Found | JAZ" };
  }

  const content = getSectorContent(sector);

  return {
    title: `${content?.name || sector.name_en} | JAZ`,
    description: content?.shortDescription || sector.description,
  };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sector } = await supabase
    .from("sectors")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!sector) {
    notFound();
  }

  const sectorView = mergeSectorWithContent(sector);
  const sectorContent = getSectorContent(sector);

  if (!sectorContent) {
    notFound();
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("sector", slug)
    .eq("status", "published")
    .order("date", { ascending: true })
    .limit(6);

  return (
    <DepartmentPageClient
      slug={slug}
      sector={sectorView}
      content={sectorContent}
      events={filterVisibleEvents(events)}
    />
  );
}

