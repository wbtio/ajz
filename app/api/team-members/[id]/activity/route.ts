import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  return profile?.role === "admin";
}

// Action log only: navigation and passive page views are intentionally excluded.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const supabase = await createClient();
  const [analyticsResult, registrationResult] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("id, event_type, path, metadata, created_at")
      .eq("user_id", id)
      // Keep the analytics stream focused on explicit task actions. Registration
      // changes come from registration_events below, avoiding page-view noise
      // and duplicate entries in the member history.
      .like("event_type", "team_task_%")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("registration_events")
      .select("id, registration_id, action, description, metadata, created_at")
      .eq("performed_by", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (analyticsResult.error) {
    return NextResponse.json({ error: analyticsResult.error.message }, { status: 500 });
  }
  if (registrationResult.error) {
    return NextResponse.json({ error: registrationResult.error.message }, { status: 500 });
  }

  const data = [
    ...(analyticsResult.data ?? []),
    ...(registrationResult.data ?? []).map((event) => ({
      id: `registration-${event.id}`,
      event_type: `registration_${event.action}`,
      path: `/dashboard/registrations/${event.registration_id}`,
      metadata: {
        ...(event.metadata && typeof event.metadata === "object" ? event.metadata : {}),
        description: event.description,
      },
      created_at: event.created_at,
    })),
  ].sort((a, b) => new Date(String(b.created_at ?? '')).getTime() - new Date(String(a.created_at ?? '')).getTime()).slice(0, 150);

  return NextResponse.json(data);
}
