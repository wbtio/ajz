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

// سجل نشاط دقيق لعضو الفريق: كل صفحة زارها وكل إجراء سجّلناه له (analytics_events)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("id, event_type, path, metadata, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
