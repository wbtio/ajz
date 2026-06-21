import { createClient } from "@/lib/supabase/server";
import type { PlannerResult } from "./schema";

/** Hard cap on rows returned to the LLM to keep token usage low. */
const MAX_ROWS = 8;
const DEFAULT_ROWS = 6;

/** Trim long free-text so a single row never blows the token budget. */
function trim(value: unknown, max = 160): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function clampLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) return DEFAULT_ROWS;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_ROWS);
}

/**
 * Execute a planner result against Supabase using a strict whitelist of
 * columns and filters. Returns compact plain objects ready to hand to the LLM.
 */
export async function runQuery(
  plan: PlannerResult
): Promise<{ resource: string; rows: Record<string, unknown>[] }> {
  const supabase = await createClient();
  const f = plan.filters || {};
  const limit = clampLimit(plan.limit);
  const today = new Date().toISOString();

  switch (plan.resource) {
    case "events": {
      let q = supabase
        .from("events")
        .select(
          "title_ar, title, description_ar, date, end_date, location_ar, sector, sub_sector, country_ar, event_type, price, show_price"
        )
        .eq("status", "published");

      if (f.keyword) {
        const k = `%${f.keyword}%`;
        q = q.or(
          `title_ar.ilike.${k},title.ilike.${k},description_ar.ilike.${k},sector.ilike.${k},sub_sector.ilike.${k}`
        );
      }
      if (f.sector) q = q.ilike("sector", `%${f.sector}%`);
      if (f.country) q = q.or(`country_ar.ilike.%${f.country}%,country.ilike.%${f.country}%`);
      if (f.event_type) q = q.ilike("event_type", `%${f.event_type}%`);
      if (f.upcoming) q = q.gte("date", today);
      if (f.date_from) q = q.gte("date", f.date_from);
      if (f.date_to) q = q.lte("date", f.date_to);

      const { data } = await q.order("date", { ascending: true }).limit(limit);
      const rows = (data || []).map((e) => ({
        title: e.title_ar || e.title,
        date: e.date,
        end_date: e.end_date || undefined,
        location: e.location_ar || undefined,
        sector: e.sector || undefined,
        sub_sector: e.sub_sector || undefined,
        country: e.country_ar || undefined,
        type: e.event_type || undefined,
        price: e.show_price && e.price ? e.price : undefined,
        about: trim(e.description_ar),
      }));
      return { resource: "events", rows };
    }

    case "sectors": {
      let q = supabase
        .from("sectors")
        .select("name_ar, name, description_ar, slug")
        .eq("is_active", true);
      if (f.keyword) {
        const k = `%${f.keyword}%`;
        q = q.or(`name_ar.ilike.${k},name.ilike.${k},description_ar.ilike.${k}`);
      }
      const { data } = await q.order("sort_order", { ascending: true }).limit(limit);
      const rows = (data || []).map((s) => ({
        name: s.name_ar || s.name,
        about: trim(s.description_ar),
        slug: s.slug,
      }));
      return { resource: "sectors", rows };
    }

    case "trainings": {
      let q = supabase
        .from("trainings")
        .select("title_ar, title, description_ar, instructor_ar, duration, level, price, start_date")
        .eq("status", "published");
      if (f.keyword) {
        const k = `%${f.keyword}%`;
        q = q.or(`title_ar.ilike.${k},title.ilike.${k},description_ar.ilike.${k}`);
      }
      if (f.level) q = q.eq("level", f.level);
      if (f.upcoming) q = q.gte("start_date", today);
      const { data } = await q.order("start_date", { ascending: true }).limit(limit);
      const rows = (data || []).map((t) => ({
        title: t.title_ar || t.title,
        instructor: t.instructor_ar || undefined,
        duration: t.duration || undefined,
        level: t.level || undefined,
        price: t.price || undefined,
        start_date: t.start_date || undefined,
        about: trim(t.description_ar),
      }));
      return { resource: "trainings", rows };
    }

    case "posts": {
      let q = supabase
        .from("posts")
        .select("title_ar, title, excerpt_ar, excerpt, category, type, slug, published_at")
        .eq("status", "published");
      if (f.keyword) {
        const k = `%${f.keyword}%`;
        q = q.or(`title_ar.ilike.${k},title.ilike.${k},excerpt_ar.ilike.${k}`);
      }
      if (f.category) q = q.ilike("category", `%${f.category}%`);
      const { data } = await q.order("published_at", { ascending: false }).limit(limit);
      const rows = (data || []).map((p) => ({
        title: p.title_ar || p.title,
        excerpt: trim(p.excerpt_ar || p.excerpt),
        category: p.category || undefined,
        slug: p.slug,
        published_at: p.published_at || undefined,
      }));
      return { resource: "posts", rows };
    }

    case "partners": {
      let q = supabase
        .from("partner_opportunities")
        .select("title_ar, title_en, description_ar");
      if (f.keyword) {
        const k = `%${f.keyword}%`;
        q = q.or(`title_ar.ilike.${k},title_en.ilike.${k},description_ar.ilike.${k}`);
      }
      const { data } = await q.order("sort_order", { ascending: true }).limit(limit);
      const rows = (data || []).map((p) => ({
        title: p.title_ar || p.title_en,
        about: trim(p.description_ar),
      }));
      return { resource: "partners", rows };
    }

    case "links": {
      let q = supabase
        .from("links")
        .select("title_ar, title_en, description_ar, url, home_country, organization_type")
        .eq("is_active", true);
      if (f.keyword) {
        const k = `%${f.keyword}%`;
        q = q.or(`title_ar.ilike.${k},title_en.ilike.${k},description_ar.ilike.${k}`);
      }
      if (f.country) q = q.ilike("home_country", `%${f.country}%`);
      const { data } = await q.order("sort_order", { ascending: true }).limit(limit);
      const rows = (data || []).map((l) => ({
        title: l.title_ar || l.title_en,
        about: trim(l.description_ar),
        url: l.url,
        country: l.home_country || undefined,
        type: l.organization_type || undefined,
      }));
      return { resource: "links", rows };
    }

    default:
      return { resource: "none", rows: [] };
  }
}
