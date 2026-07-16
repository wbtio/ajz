import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyUser, resolveUserIdByNameOrEmail } from "@/lib/notifications";
import { isRecurrence } from "@/lib/recurrence";

async function getCurrentProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  return profile;
}

async function hasAttachmentsColumn(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_schema", "public")
    .eq("table_name", "team_tasks")
    .eq("column_name", "attachments")
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function GET() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("team_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // عضو الفريق يرى فقط المهام المسندة له، أما المدير فيرى كل المهام
  if (profile.role !== "admin") {
    const name = profile.full_name || profile.email;
    const visible = (data ?? []).filter(
      (t) => t.assignee === name || t.assignee === profile.email
    );
    return NextResponse.json(visible);
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 401 });
  }

  // عضو الفريق لا يمكنه إسناد مهمة لغيره، فقط لنفسه
  const assignee =
    profile.role === "admin" ? body.assignee ?? null : profile.full_name || profile.email;
  const supportsAttachments = await hasAttachmentsColumn(supabase);

  const insertBody: Record<string, unknown> = {
    title: body.title,
    description: body.description ?? null,
    category: body.category ?? "general",
    priority: body.priority ?? "medium",
    status: body.status ?? "todo",
    assignee,
    due_date: body.due_date ?? null,
    recurrence: isRecurrence(body.recurrence) ? body.recurrence : null,
  };

  if (supportsAttachments) {
    insertBody.attachments = Array.isArray(body.attachments) ? body.attachments : [];
  }

  const { data, error } = await supabase
    .from("team_tasks")
    .insert(insertBody)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // إشعار العضو المسؤول بأن مهمة جديدة أُسندت له
  if (assignee && assignee !== (profile.full_name || profile.email)) {
    const assigneeId = await resolveUserIdByNameOrEmail(supabase, assignee);
    if (assigneeId) {
      await notifyUser(supabase, {
        userId: assigneeId,
        type: "task_assigned",
        title: "مهمة جديدة مسندة لك",
        body: data.title,
        taskId: data.id,
      });
    }
  }

  return NextResponse.json(data);
}
