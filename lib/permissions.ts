// ═══════════════════════════════════════════════════════════
//  نظام الصلاحيات المركزي (RBAC) — مصدر الحقيقة الوحيد للأدوار
//  عدّل هذا الملف وحده لتغيير من يرى أي صفحة في لوحة التحكم.
// ═══════════════════════════════════════════════════════════

export type AppRole = "admin" | "team";

/** كل صفحات لوحة التحكم القابلة للإسناد لعضو فريق. */
export const DASHBOARD_PAGES: { path: string; label: string; label_ar: string }[] = [
  { path: "/dashboard/home", label: "Dashboard", label_ar: "لوحة التحكم" },
  { path: "/dashboard/events", label: "Published Events", label_ar: "الفعاليات المنشورة" },
  { path: "/dashboard/blog", label: "Articles", label_ar: "المقالات" },
  { path: "/dashboard/links", label: "Quick Links", label_ar: "الروابط السريعة" },
  { path: "/dashboard/sectors", label: "Sectors", label_ar: "القطاعات" },
  { path: "/dashboard/partners", label: "Partners", label_ar: "الشركاء" },
  { path: "/dashboard/trainings", label: "Training Programs", label_ar: "البرامج التدريبية" },
  { path: "/dashboard/messages", label: "Messages", label_ar: "الرسائل" },
  { path: "/dashboard/newsletter", label: "Newsletter", label_ar: "النشرة البريدية" },
  { path: "/dashboard/users", label: "Users", label_ar: "المستخدمون" },
  { path: "/dashboard/registrations", label: "Event Registrations", label_ar: "تسجيلات الفعاليات" },
  { path: "/dashboard/sector-registrations", label: "Sector Registrations", label_ar: "تسجيلات القطاعات" },
  { path: "/dashboard/participation-cases", label: "Applications (overview)", label_ar: "ملفات المشاركة — نظرة عامة" },
  { path: "/dashboard/participation-cases/work/clients", label: "Applications (clients)", label_ar: "ملفات المشاركة — العملاء" },
  { path: "/dashboard/customers", label: "Customers", label_ar: "العملاء" },
  { path: "/dashboard/participation-cases/work/payment", label: "Finance & Payments", label_ar: "المالية والمدفوعات" },
  { path: "/dashboard/participation-cases/work/registration", label: "Event Registration", label_ar: "تسجيل الفعاليات" },
  { path: "/dashboard/participation-cases/work/invitations", label: "Invitations", label_ar: "الدعوات" },
  { path: "/dashboard/participation-cases/work/visa", label: "Visa & Insurance", label_ar: "التأشيرات والتأمين" },
  { path: "/dashboard/participation-cases/work/qc", label: "Quality Control", label_ar: "ضبط الجودة" },
  { path: "/dashboard/participation-cases/work/closure", label: "Closure & Follow-up", label_ar: "الإغلاق والمتابعة" },
  { path: "/dashboard/visa-availability", label: "Visa Availability", label_ar: "مواعيد التأشيرات" },
  { path: "/dashboard/draft-events", label: "Draft Events", label_ar: "مسودات الفعاليات" },
  { path: "/dashboard/event-discovery/sessions", label: "Event Discovery", label_ar: "استكشاف الفعاليات" },
  { path: "/dashboard/analytics", label: "Analytics", label_ar: "التحليلات" },
  { path: "/dashboard/team-tasks", label: "Daily Tasks", label_ar: "المهام اليومية" },
  { path: "/dashboard/team", label: "Team Members", label_ar: "أعضاء الفريق" },
  { path: "/tasks", label: "Change Requests", label_ar: "طلبات التعديل" },
  { path: "/dashboard/creative-prompts", label: "Creative Prompts", label_ar: "المحتوى الإبداعي" },
  { path: "/dashboard/passport-scanner", label: "Passport Scanner", label_ar: "قارئ الجوازات" },
  { path: "/dashboard/settings", label: "Settings", label_ar: "الإعدادات" },
];

/** الصفحات الافتراضية لعضو فريق جديد لم تُحدَّد له صلاحيات بعد. */
export const DEFAULT_TEAM_PATHS = ["/dashboard/team-tasks"];

/** Exact permission check for sensitive actions. Parent page access must not
 * silently grant access to a more sensitive child page. */
export function hasExactPermission(
  role: string | null | undefined,
  pathname: string,
  permissions?: string[] | null,
): boolean {
  if (role === "admin") return true;
  return role === "team" && (permissions ?? []).some(
    (permission) => permission.trim().replace(/\/$/, "") === pathname.replace(/\/$/, ""),
  );
}

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
