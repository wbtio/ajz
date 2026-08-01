import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessPath } from "@/lib/permissions";

async function requireTeamManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, isAdmin: false, userId: null };

  const { data: profile } = await supabase.from("users").select("role, permissions").eq("id", user.id).single();
  return {
    ok: profile?.role === "admin" || canAccessPath(profile?.role, "/dashboard/team", profile?.permissions),
    isAdmin: profile?.role === "admin",
    userId: user.id,
  };
}

// بيانات عضو فريق واحد لصفحة الملف الشخصي
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ok } = await requireTeamManager();
  if (!ok) {
    return NextResponse.json({ error: "You are not allowed to do that" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, phone, role, avatar_url, permissions, created_at, is_active")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// تعديل بيانات/دور/صلاحيات عضو فريق
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ok, isAdmin, userId } = await requireTeamManager();
  if (!ok) {
    return NextResponse.json({ error: "You are not allowed to do that" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, phone, role, permissions, is_active, avatar_url } = body as {
    full_name?: string;
    phone?: string | null;
    role?: "admin" | "team";
    permissions?: string[];
    is_active?: boolean;
    avatar_url?: string | null;
  };

  if (is_active === false && id === userId) {
    return NextResponse.json({ error: "You cannot disable your own account" }, { status: 400 });
  }

  // منح الأدوار والصلاحيات وتعطيل الحسابات قرار إداري، لا يُفوَّض بصفحة
  if (!isAdmin && (role !== undefined || permissions !== undefined || is_active !== undefined)) {
    return NextResponse.json(
      { error: "Only an administrator can change roles, permissions or activation" },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const update: Record<string, unknown> = {};
  if (full_name !== undefined) update.full_name = full_name;
  if (phone !== undefined) update.phone = phone;
  if (role !== undefined) {
    update.role = role;
    update.permissions = role === "team" ? permissions ?? [] : null;
  } else if (permissions !== undefined) {
    update.permissions = permissions;
  }
  if (is_active !== undefined) update.is_active = is_active;
  if (avatar_url !== undefined) update.avatar_url = avatar_url;

  const { data, error } = await admin.from("users").update(update).eq("id", id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// إزالة عضو من الفريق: يفقد صلاحية دخول لوحة التحكم بإرجاعه إلى دور عميل عادي
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isAdmin, userId } = await requireTeamManager();
  if (!isAdmin) {
    return NextResponse.json({ error: "Only an administrator can remove members" }, { status: 403 });
  }

  if (id === userId) {
    return NextResponse.json({ error: "You cannot remove yourself from the team" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ role: "user", permissions: null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
