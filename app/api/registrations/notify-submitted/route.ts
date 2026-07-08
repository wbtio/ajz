import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/notifications";

// يُستدعى من صفحة التسجيل في فعالية بعد التأكيد النهائي (الخطوة 4)
// لإشعار الإدارة بطلب تسجيل جديد يحتاج مراجعة
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 401 });
  }

  const body = await req.json();
  const registrationId = body?.registrationId as string | undefined;
  if (!registrationId) {
    return NextResponse.json({ error: "معرّف التسجيل مفقود" }, { status: 400 });
  }

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, user_id, full_name, events(title_ar, title)")
    .eq("id", registrationId)
    .maybeSingle();

  if (!registration || registration.user_id !== user.id) {
    return NextResponse.json({ error: "التسجيل غير موجود" }, { status: 404 });
  }

  const eventTitle =
    (registration.events as { title_ar?: string; title?: string } | null)?.title_ar ||
    (registration.events as { title_ar?: string; title?: string } | null)?.title ||
    "فعالية";

  // notifyAdmins يحتاج قراءة كل المستخدمين بدور admin — المستخدم العادي ممنوع من هذا بالـ RLS،
  // لذا نستخدم عميل service role هنا لا عميل الجلسة العادي
  await notifyAdmins(createAdminClient(), {
    type: "event_registration",
    title: `تسجيل جديد — ${eventTitle}`,
    body: `${registration.full_name || "مستخدم"} سجّل في ${eventTitle}`,
    linkUrl: "/dashboard/registrations",
  });

  return NextResponse.json({ success: true });
}
