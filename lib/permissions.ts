// ═══════════════════════════════════════════════════════════
//  نظام الصلاحيات المركزي (RBAC) — مصدر الحقيقة الوحيد للأدوار
//  عدّل هذا الملف وحده لتغيير من يرى أي صفحة في لوحة التحكم.
// ═══════════════════════════════════════════════════════════

export type AppRole = "admin" | "team";

/** كل صفحات لوحة التحكم القابلة للإسناد لعضو فريق (بالاسم العربي للعرض في واجهة الإدارة). */
export const DASHBOARD_PAGES: { path: string; label: string }[] = [
  { path: "/dashboard/home", label: "الرئيسية" },
  { path: "/dashboard/events", label: "الفعاليات" },
  { path: "/dashboard/blog", label: "المدونة" },
  { path: "/dashboard/links", label: "الروابط" },
  { path: "/dashboard/sectors", label: "القطاعات" },
  { path: "/dashboard/partners", label: "الشركاء" },
  { path: "/dashboard/trainings", label: "التدريب" },
  { path: "/dashboard/messages", label: "الرسائل" },
  { path: "/dashboard/users", label: "العملاء" },
  { path: "/dashboard/registrations", label: "تسجيلات الفعاليات" },
  { path: "/dashboard/sector-registrations", label: "تسجيلات القطاعات" },
  { path: "/dashboard/participation-cases", label: "ملفات المشاركة" },
  { path: "/dashboard/event-discovery/sessions", label: "اكتشاف الفعاليات" },
  { path: "/dashboard/analytics", label: "التحليلات" },
  { path: "/dashboard/team-tasks", label: "المهام اليومية" },
  { path: "/dashboard/passport-scanner", label: "قارئ الجوازات" },
  { path: "/dashboard/settings", label: "الإعدادات" },
];

/** الصفحات الافتراضية لعضو فريق جديد لم تُحدَّد له صلاحيات بعد. */
export const DEFAULT_TEAM_PATHS = ["/dashboard/team-tasks"];

/** هل هذا الدور مسموح له دخول لوحة التحكم أصلاً؟ */
export function isDashboardRole(role?: string | null): boolean {
  return role === "admin" || role === "team";
}

/**
 * هل يستطيع هذا المستخدم الوصول لهذا المسار داخل لوحة التحكم؟
 *  - المدير (admin): وصول كامل دائمًا.
 *  - عضو الفريق (team): فقط الصفحات المذكورة في permissions الخاصة به
 *    (أو الصفحات الافتراضية إن لم تُحدَّد له صلاحيات).
 */
export function canAccessPath(
  role: string | null | undefined,
  pathname: string,
  permissions?: string[] | null
): boolean {
  if (role === "admin") return true;
  if (role !== "team") return false;

  const allowed =
    permissions && permissions.length > 0 ? permissions : DEFAULT_TEAM_PATHS;

  const path = pathname.toLowerCase();
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}

/** الصفحة الافتراضية التي يُوجَّه إليها كل دور بعد الدخول. */
export function defaultRouteForRole(
  role: string | null | undefined,
  permissions?: string[] | null
): string {
  if (role === "admin") return "/dashboard/home";
  if (role === "team") {
    const allowed =
      permissions && permissions.length > 0 ? permissions : DEFAULT_TEAM_PATHS;
    return allowed[0];
  }
  return "/";
}
