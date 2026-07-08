import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/notifications";

interface DiffEntry {
  field_key: string;
  field_label?: string | null;
  old_value?: string | null;
  new_value?: string | null;
}

// يسجَّل هنا فقط تعديل المستخدم لتسجيله *قبل* موافقة/رفض الإدارة —
// الإدراج يمر عبر service role (لا نمنح المستخدمين صلاحية INSERT مباشرة على registration_edits).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 401 });
  }

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, user_id, status, event_id, full_name, events(title_ar, title)")
    .eq("id", id)
    .maybeSingle();

  if (!registration || registration.user_id !== user.id) {
    return NextResponse.json({ error: "التسجيل غير موجود" }, { status: 404 });
  }

  const status = (registration.status || "pending").toLowerCase();
  if (status !== "pending") {
    return NextResponse.json(
      { error: "لا يمكن تعديل الطلب بعد مراجعته من قبل الإدارة" },
      { status: 409 }
    );
  }

  const body = await req.json();
  const diffs = Array.isArray(body?.diffs) ? (body.diffs as DiffEntry[]) : [];
  if (diffs.length === 0) {
    return NextResponse.json({ success: true, logged: 0 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("registration_edits").insert(
    diffs.map((d) => ({
      registration_id: id,
      field_key: d.field_key,
      field_label: d.field_label ?? null,
      old_value: d.old_value ?? null,
      new_value: d.new_value ?? null,
      edited_by: "user",
      editor_user_id: user.id,
    }))
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const eventTitle =
    (registration.events as { title_ar?: string; title?: string } | null)?.title_ar ||
    (registration.events as { title_ar?: string; title?: string } | null)?.title ||
    "فعالية";

  // notifyAdmins يحتاج قراءة كل المستخدمين بدور admin — المستخدم العادي ممنوع من هذا بالـ RLS،
  // لذا نستخدم عميل service role هنا لا عميل الجلسة العادي
  await notifyAdmins(admin, {
    excludeUserId: user.id,
    type: "registration_edited",
    title: `تعديل على تسجيل: ${eventTitle}`,
    body: `${registration.full_name || "مستخدم"} عدّل بيانات تسجيله (${diffs.length} حقل).`,
  });

  return NextResponse.json({ success: true, logged: diffs.length });
}
