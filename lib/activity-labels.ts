import { DASHBOARD_PAGES } from "@/lib/permissions";

// صفحات إدارية لا تظهر في DASHBOARD_PAGES (لأنها غير قابلة للإسناد لعضو فريق) لكنها تحتاج تسمية عربية في سجل النشاط
const EXTRA_PAGE_LABELS: { path: string; label: string }[] = [
  { path: "/dashboard/team", label: "إدارة الفريق" },
  { path: "/dashboard/team/analytics", label: "تحليلات الفريق" },
  { path: "/tasks", label: "طلبات التعديل" },
];

function labelForPath(path: string): string {
  const exact = [...DASHBOARD_PAGES, ...EXTRA_PAGE_LABELS].find((p) => p.path === path);
  if (exact) return exact.label;

  // صفحة عضو فريق معيّن: /dashboard/team/<uuid>
  if (/^\/dashboard\/team\/[^/]+$/.test(path)) return "ملف عضو في الفريق";

  const prefixMatch = [...DASHBOARD_PAGES, ...EXTRA_PAGE_LABELS]
    .filter((p) => path.startsWith(p.path + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0];
  if (prefixMatch) return prefixMatch.label;

  return path;
}

interface ActivityEvent {
  event_type: string;
  path: string;
  metadata: Record<string, unknown> | null;
}

/** يحوّل حدث analytics_events خام إلى وصف عربي مفهوم لسجل نشاط عضو الفريق */
export function describeActivity(e: ActivityEvent): string {
  const meta = e.metadata ?? {};
  const title = typeof meta.title === "string" ? meta.title : null;

  switch (e.event_type) {
    case "page_view":
      return `فتح صفحة: ${labelForPath(e.path)}`;
    case "team_task_created":
      return `أنشأ مهمة جديدة: ${title ?? ""}`;
    case "team_task_status_changed": {
      const from = typeof meta.from === "string" ? meta.from : null;
      const to = typeof meta.to === "string" ? meta.to : null;
      const statusAr: Record<string, string> = { todo: "قيد الانتظار", in_progress: "تحت المعالجة", done: "تم الإنجاز" };
      if (from && to) {
        return `غيّر حالة مهمة «${title ?? ""}» من ${statusAr[from] ?? from} إلى ${statusAr[to] ?? to}`;
      }
      return `حدّث حالة مهمة: ${title ?? ""}`;
    }
    case "team_task_deleted":
      return `حذف مهمة: ${title ?? ""}`;
    case "team_task_edited":
      return `عدّل تفاصيل مهمة: ${title ?? ""}`;
    case "registration_visa_updated":
      return `حدّث تفاصيل التأشيرة في الطلب: ${String(meta.description ?? "")}`;
    case "registration_payment_updated":
      return `حدّث بيانات الدفع في الطلب: ${String(meta.description ?? "")}`;
    case "registration_document_uploaded":
      return `رفع وثيقة في الطلب: ${String(meta.description ?? "")}`;
    case "registration_client_updated":
      return `حدّث بيانات العميل في الطلب: ${String(meta.description ?? "")}`;
    case "registration_status_changed":
      return `غيّر حالة الطلب: ${String(meta.description ?? "")}`;
    case "registration_case_created":
      return `أنشأ طلباً جديداً: ${String(meta.description ?? "")}`;
    default:
      return e.event_type;
  }
}
