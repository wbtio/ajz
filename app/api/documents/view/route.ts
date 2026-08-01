import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path");
    const bucket = req.nextUrl.searchParams.get("bucket") || "registration-documents";

    if (!path) {
      return NextResponse.json({ error: "A path is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // التأكد من أن المستخدم مسجل دخول وله صلاحية (مسؤول أو موظف)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authorised" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "team")) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    // توليد رابط مؤقت صالح لمدة 60 ثانية
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json({ error: "Could not find the file or build the link" }, { status: 404 });
    }

    // إعادة التوجيه للرابط المؤقت الآمن
    return NextResponse.redirect(data.signedUrl);
  } catch (err) {
    console.error("Signed URL API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
