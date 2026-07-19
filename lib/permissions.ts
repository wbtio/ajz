// ═══════════════════════════════════════════════════════════
//  نظام الصلاحيات المركزي (RBAC) — مصدر الحقيقة الوحيد للأدوار
//  عدّل هذا الملف وحده لتغيير من يرى أي صفحة في لوحة التحكم.
// ═══════════════════════════════════════════════════════════

export type AppRole = "admin" | "team";

/** كل صفحات لوحة التحكم القابلة للإسناد لعضو فريق (بالاسم العربي للعرض في واجهة الإدارة). */
export const DASHBOARD_PAGES: { path: string; label: string }[] = [
  { path: "/dashboard/home", label: "Dashboard" },
  { path: "/dashboard/events", label: "Published Events" },
  { path: "/dashboard/blog", label: "Articles" },
  { path: "/dashboard/links", label: "Quick Links" },
  { path: "/dashboard/sectors", label: "Sectors" },
  { path: "/dashboard/partners", label: "Partners" },
  { path: "/dashboard/trainings", label: "Training Programs" },
  { path: "/dashboard/messages", label: "Messages" },
  { path: "/dashboard/users", label: "Users" },
  { path: "/dashboard/registrations", label: "Event Registrations" },
  { path: "/dashboard/sector-registrations", label: "Sector Registrations" },
  { path: "/dashboard/participation-cases", label: "Applications" },
  { path: "/dashboard/participation-cases/work/clients", label: "Applications" },
  { path: "/dashboard/customers", label: "Customers" },
  { path: "/dashboard/participation-cases/work/payment", label: "Finance & Payments" },
  { path: "/dashboard/participation-cases/work/registration", label: "Event Registration" },
  { path: "/dashboard/participation-cases/work/invitations", label: "Invitations" },
  { path: "/dashboard/participation-cases/work/visa", label: "Visa & Insurance" },
  { path: "/dashboard/participation-cases/work/qc", label: "Quality Control" },
  { path: "/dashboard/participation-cases/work/closure", label: "Closure & Follow-up" },
  { path: "/dashboard/visa-availability", label: "Visa Availability" },
  { path: "/dashboard/draft-events", label: "Draft Events" },
  { path: "/dashboard/event-discovery/sessions", label: "Event Discovery" },
  { path: "/dashboard/analytics", label: "Analytics" },
  { path: "/dashboard/team-tasks", label: "Daily Tasks" },
  { path: "/dashboard/creative-prompts", label: "Creative Prompts" },
  { path: "/dashboard/passport-scanner", label: "Passport Scanner" },
  { path: "/dashboard/settings", label: "Settings" },
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
