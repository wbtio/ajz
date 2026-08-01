import { DASHBOARD_PAGES } from "@/lib/permissions";

// Admin pages that are not assignable to a team member, so they are absent from
// DASHBOARD_PAGES, but still need a name in the activity log.
const EXTRA_PAGE_LABELS: { path: string; label: string }[] = [
  { path: "/dashboard/team", label: "Team management" },
  { path: "/dashboard/team/analytics", label: "Team analytics" },
  { path: "/tasks", label: "Change requests" },
];

function labelForPath(path: string): string {
  const exact = [...DASHBOARD_PAGES, ...EXTRA_PAGE_LABELS].find((p) => p.path === path);
  if (exact) return exact.label;

  // A specific team member page: /dashboard/team/<uuid>
  if (/^\/dashboard\/team\/[^/]+$/.test(path)) return "Team member profile";

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

/** Turns a raw analytics_events row into a readable line for the activity log. */
export function describeActivity(e: ActivityEvent): string {
  const meta = e.metadata ?? {};
  const title = typeof meta.title === "string" ? meta.title : null;

  switch (e.event_type) {
    case "page_view":
      return `Opened page: ${labelForPath(e.path)}`;
    case "team_task_created":
      return `Created a task: ${title ?? ""}`;
    case "team_task_status_changed": {
      const from = typeof meta.from === "string" ? meta.from : null;
      const to = typeof meta.to === "string" ? meta.to : null;
      const statusLabel: Record<string, string> = { todo: "To do", in_progress: "In progress", done: "Done" };
      if (from && to) {
        return `Moved task "${title ?? ""}" from ${statusLabel[from] ?? from} to ${statusLabel[to] ?? to}`;
      }
      return `Updated the status of task: ${title ?? ""}`;
    }
    case "team_task_deleted":
      return `Deleted task: ${title ?? ""}`;
    case "team_task_edited":
      return `Edited task: ${title ?? ""}`;
    case "registration_visa_updated":
      return `Updated visa details on application: ${String(meta.description ?? "")}`;
    case "registration_payment_updated":
      return `Updated payment details on application: ${String(meta.description ?? "")}`;
    case "registration_document_uploaded":
      return `Uploaded a document to application: ${String(meta.description ?? "")}`;
    case "registration_client_updated":
      return `Updated client details on application: ${String(meta.description ?? "")}`;
    case "registration_status_changed":
      return `Changed application status: ${String(meta.description ?? "")}`;
    case "registration_case_created":
      return `Created a new application: ${String(meta.description ?? "")}`;
    default:
      return e.event_type;
  }
}
