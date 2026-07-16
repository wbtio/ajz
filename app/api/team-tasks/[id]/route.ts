import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmins, notifyUser, resolveUserIdByNameOrEmail } from "@/lib/notifications";
import { isRecurrence, nextDueDate } from "@/lib/recurrence";

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

function isOwner(profile: { full_name: string | null; email: string }, assignee: string | null) {
  return assignee !== null && (assignee === profile.full_name || assignee === profile.email);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 401 });
  }

  const { data: task, error: fetchError } = await supabase
    .from("team_tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
  }

  const isAdmin = profile.role === "admin";
  if (!isAdmin && !isOwner(profile, task.assignee)) {
    return NextResponse.json({ error: "هذه المهمة مسندة لعضو آخر" }, { status: 403 });
  }
  const supportsAttachments = await hasAttachmentsColumn(supabase);

  // عضو الفريق يستطيع فقط تحديث حالة مهمته الخاصة، والمدير وحده يعدّل بقية الحقول
  const allowed = isAdmin
    ? (supportsAttachments
      ? (["title", "description", "category", "priority", "status", "assignee", "due_date", "recurrence", "attachments"] as const)
      : (["title", "description", "category", "priority", "status", "assignee", "due_date", "recurrence"] as const))
    : (["status"] as const);

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  // تسجيل من ومتى أنجز المهمة فعليًا في قاعدة البيانات، وإلغاؤه إذا رجعت المهمة لحالة سابقة
  if (update.status === "done" && task.status !== "done") {
    update.completed_at = new Date().toISOString();
    update.completed_by = profile.id;
  } else if (update.status && update.status !== "done" && task.status === "done") {
    update.completed_at = null;
    update.completed_by = null;
  }

  const { data, error } = await supabase
    .from("team_tasks")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // عند إنجاز مهمة متكررة، تُنشأ نسخة جديدة تلقائيًا بدل إعادة إضافتها يدويًا
  if (update.status === "done" && task.status !== "done" && isRecurrence(task.recurrence)) {
    const nextInsert: Record<string, unknown> = {
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: "todo",
      assignee: task.assignee,
      due_date: nextDueDate(task.recurrence, task.due_date),
      recurrence: task.recurrence,
    };
    if (supportsAttachments) {
      nextInsert.attachments = task.attachments ?? [];
    }

    const { data: nextTask } = await supabase
      .from("team_tasks")
      .insert(nextInsert)
      .select()
      .single();

    if (nextTask && task.assignee) {
      const assigneeId = await resolveUserIdByNameOrEmail(supabase, task.assignee);
      if (assigneeId) {
        await notifyUser(supabase, {
          userId: assigneeId,
          type: "task_assigned",
          title: "نسخة جديدة من مهمة متكررة",
          body: nextTask.title,
          taskId: nextTask.id,
        });
      }
    }
  }

  // إشعار الإدارة عند إنجاز عضو الفريق لمهمته
  if (update.status === "done" && task.status !== "done" && !isAdmin) {
    await notifyAdmins(supabase, {
      excludeUserId: profile.id,
      type: "task_completed",
      title: `${profile.full_name || profile.email} أنجز مهمة`,
      body: data.title,
      taskId: data.id,
    });
  }

  // إشعار العضو الجديد عند إعادة إسناد المهمة له من المدير
  if (isAdmin && "assignee" in body && update.assignee && update.assignee !== task.assignee) {
    const assigneeId = await resolveUserIdByNameOrEmail(supabase, update.assignee as string);
    if (assigneeId && assigneeId !== profile.id) {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 401 });
  }

  const { data: task, error: fetchError } = await supabase
    .from("team_tasks")
    .select("assignee")
    .eq("id", id)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
  }

  if (profile.role !== "admin" && !isOwner(profile, task.assignee)) {
    return NextResponse.json({ error: "هذه المهمة مسندة لعضو آخر" }, { status: 403 });
  }

  const { error } = await supabase.from("team_tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
