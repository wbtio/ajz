import { createClient } from "@/lib/supabase/server";
import { filterVisibleEvents } from "@/lib/events-visibility";
import { EventsPageView } from "./events-page-view";
import { mergeSectorWithContent } from "@/app/departments/department-content";

export const metadata = {
  title: 'الفعاليات والمعارض — JAZ Iraq | Joint Annual Zone',
  description:
    'تصفّح جميع الفعاليات والمعارض والمؤتمرات الدولية التي تنظّمها JAZ في العراق والعالم. سجّل مشاركتك وانضم إلى وفودنا الدولية.',
  keywords: ['فعاليات JAZ', 'معارض دولية العراق', 'مؤتمرات عراق', 'JAZ events Iraq', 'معارض تجارية'],
  openGraph: {
    title: 'الفعاليات والمعارض | JAZ Iraq',
    description: 'تصفّح الفعاليات والمعارض الدولية التي تنظّمها JAZ.',
    url: 'https://jaz.iq/events',
    images: [{ url: '/about-banner.png', width: 1200, height: 630, alt: 'JAZ Events' }],
  },
  alternates: { canonical: 'https://jaz.iq/events' },
};

interface EventsPageProps {
  searchParams: Promise<{
    sector?: string
    search?: string
    type?: string
    status?: string
    price?: string
  }>;
}

const ESTABLISHED_YEAR = 2022;

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // بناء استعلام الفعاليات
  let eventsQuery = supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  // تطبيق فلتر الحالة (Status: published, completed)
  if (params.status === 'open') {
    eventsQuery = eventsQuery.eq("status", "published");
  } else if (params.status === 'completed') {
    eventsQuery = eventsQuery.eq("status", "completed");
  } else {
    // افتراضياً نعرض كلاً من المنشورة والمكتملة (ونتجنب مسودات أو ملغية غير منشورة للجمهور)
    eventsQuery = eventsQuery.in("status", ["published", "completed"]);
  }

  // تطبيق فلتر القطاع
  if (params.sector) {
    eventsQuery = eventsQuery.eq("sector", params.sector);
  }

  // تطبيق فلتر نوع الفعالية (Event Type: local, international)
  if (params.type === 'local') {
    eventsQuery = eventsQuery.eq("event_type", "local");
  } else if (params.type === 'international') {
    eventsQuery = eventsQuery.eq("event_type", "international");
  }

  // تطبيق فلتر السعر (Price: free, paid)
  if (params.price === 'free') {
    eventsQuery = eventsQuery.or("price.eq.0,price.is.null");
  } else if (params.price === 'paid') {
    eventsQuery = eventsQuery.gt("price", 0);
  }

  // تطبيق البحث
  if (params.search) {
    eventsQuery = eventsQuery.or(
      `title.ilike.%${params.search}%,title_ar.ilike.%${params.search}%`,
    );
  }

  // جلب البيانات بشكل متوازي (نتائج مفلترة + إحصائيات شاملة مستقلة عن الفلاتر)
  const nowIso = new Date().toISOString();
  const [
    sectorsResult,
    eventsResult,
    totalEventsResult,
    upcomingEventsResult,
    countriesResult,
  ] = await Promise.all([
    supabase
      .from("sectors")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    eventsQuery,
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("status", ["published", "completed"]),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("date", nowIso),
    supabase
      .from("events")
      .select("country")
      .in("status", ["published", "completed"])
      .not("country", "is", null),
  ]);

  const sectors = (sectorsResult.data ?? []).map((sector) =>
    mergeSectorWithContent(sector),
  );
  const events = filterVisibleEvents(eventsResult.data);
  const hasActiveFilters = Boolean(
    params.sector || params.search || params.type || params.status || params.price
  );

  const uniqueCountries = new Set(
    (countriesResult.data || [])
      .map((row) => row.country?.trim().toLowerCase())
      .filter((value): value is string => Boolean(value)),
  ).size;

  const stats = {
    total: totalEventsResult.count ?? 0,
    upcoming: upcomingEventsResult.count ?? 0,
    countries: uniqueCountries,
    divisions: sectors.length || 4,
    years: Math.max(1, new Date().getFullYear() - ESTABLISHED_YEAR),
  };

  return (
    <EventsPageView
      sectors={sectors ?? []}
      events={events ?? []}
      hasActiveFilters={hasActiveFilters}
      stats={stats}
    />
  );
}
