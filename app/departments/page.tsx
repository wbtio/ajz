import { createClient } from "@/lib/supabase/server";
import { DepartmentsClient } from "./departments-client";

export const metadata = {
  title: "Our Departments | JAZ",
  description: "Explore the departments we cover at JAZ",
};

const ESTABLISHED_YEAR = 2012;

export default async function DepartmentsPage() {
  const supabase = await createClient();

  const [{ data: sectors }, { count: eventsCount }, { data: countriesRows }] =
    await Promise.all([
      supabase.from("sectors").select("*").order("created_at", { ascending: true }),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("events")
        .select("country")
        .eq("status", "published")
        .not("country", "is", null),
    ]);

  const uniqueCountries = new Set(
    (countriesRows || [])
      .map((row) => row.country?.trim().toLowerCase())
      .filter((value): value is string => Boolean(value)),
  ).size;

  const yearsOfExpertise = Math.max(
    1,
    new Date().getFullYear() - ESTABLISHED_YEAR,
  );

  const stats = {
    years: yearsOfExpertise,
    events: eventsCount ?? 0,
    countries: uniqueCountries,
    divisions: (sectors || []).length || 4,
  };

  return <DepartmentsClient sectors={sectors} stats={stats} />;
}

