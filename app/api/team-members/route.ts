import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessPath } from "@/lib/permissions";

async function canManageTeam(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("users")
    .select("role, permissions")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" || canAccessPath(profile?.role, "/dashboard/team", profile?.permissions);
}

// قائمة أعضاء لوحة التحكم (مدير/فريق) لاختيار المسؤول عن المهمة، ولصفحة إدارة الفريق
export async function GET() {
  const supabase = await createClient();
  if (!(await canManageTeam(supabase))) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, phone, role, avatar_url, permissions, created_at, is_active")
    .in("role", ["admin", "team"])
    .order("full_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// إضافة عضو فريق جديد: ينشئ حساب مصادقة (Auth) + صف في users بالدور والصلاحيات المحدَّدة
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();

  const { data: requesterProfile } = requester
    ? await supabase.from("users").select("role, permissions").eq("id", requester.id).single()
    : { data: null };

  if (!requesterProfile || (requesterProfile.role !== "admin" && !canAccessPath(requesterProfile.role, "/dashboard/team", requesterProfile.permissions))) {
    return NextResponse.json({ error: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, email, password, phone, role, permissions, avatar_url } = body as {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: "admin" | "team";
    permissions?: string[];
    avatar_url?: string | null;
  };

  if (!full_name || !email || !password || !role) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message || "تعذّر إنشاء الحساب" }, { status: 400 });
  }

  // صف public.users يُنشأ تلقائيًا عبر trigger، نكمّله بالدور والصلاحيات
  const { data: updated, error: updateError } = await admin
    .from("users")
    .update({
      full_name,
      phone: phone || null,
      role,
      permissions: role === "team" ? permissions ?? [] : null,
      avatar_url: avatar_url || null,
    })
    .eq("id", created.user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated, { status: 201 });
}
