import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path");
    const bucket = req.nextUrl.searchParams.get("bucket") || "registration-documents";

    if (!path) {
      return NextResponse.json({ error: "المسار مطلوب" }, { status: 400 });
    }

    const supabase = await createClient();

    // التأكد من أن المستخدم مسجل دخول وله صلاحية (مسؤول أو موظف)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "team")) {
      return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });
    }

    // توليد رابط مؤقت صالح لمدة 60 ثانية
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json({ error: "تعذّر العثور على الملف أو توليد الرابط" }, { status: 404 });
    }

    // إعادة التوجيه للرابط المؤقت الآمن
    return NextResponse.redirect(data.signedUrl);
  } catch (err) {
    console.error("Signed URL API error:", err);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
