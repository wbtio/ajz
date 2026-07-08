import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseJS } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  console.log("[Upload API] POST request received");
  try {
    // 1. Authenticate user via Next server client (using cookies)
    const userSupabase = await createServerSupabase();
    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    console.log("[Upload API] Auth user check:", user ? `Authenticated (ID: ${user.id})` : "Unauthenticated");

    if (!user) {
      return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 });
    }

    // Check user profile role
    const { data: profile } = await userSupabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("[Upload API] User profile role check:", profile?.role);

    if (!profile || (profile.role !== "admin" && profile.role !== "team")) {
      return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });
    }

    // 2. Parse form data
    console.log("[Upload API] Parsing formData...");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucketName = (formData.get("bucket") as string) || "events-bucket";
    const type = (formData.get("type") as string) || "document";

    if (!file) {
      console.warn("[Upload API] No file provided in formData");
      return NextResponse.json({ error: "لم يتم توفير ملف" }, { status: 400 });
    }

    console.log(`[Upload API] File received: name="${file.name}", size=${file.size} bytes, type="${file.type}", targetBucket="${bucketName}"`);

    if (file.size > MAX_SIZE) {
      console.warn(`[Upload API] File size ${file.size} exceeds MAX_SIZE ${MAX_SIZE}`);
      return NextResponse.json({ error: "حجم الملف كبير جداً (الحد الأقصى 10 ميغابايت)" }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client using service role key
    console.log("[Upload API] Initializing Supabase Admin Client...");
    const adminSupabase = createSupabaseJS(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const pathName = `registrations/${Date.now()}_${type}_${cleanFileName}`;

    console.log(`[Upload API] Uploading buffer to Supabase at path "${pathName}"...`);

    // 4. Try uploading to storage bucket
    let { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from(bucketName)
      .upload(pathName, buffer, {
        contentType: file.type,
        upsert: true
      });

    // If bucket not found, try to create it and retry upload
    if (uploadError && (uploadError.message.includes("not found") || uploadError.message.includes("Bucket"))) {
      console.log(`[Upload API] Bucket "${bucketName}" not found. Attempting to create bucket...`);
      try {
        await adminSupabase.storage.createBucket(bucketName, { public: true });
        console.log(`[Upload API] Bucket "${bucketName}" created. Retrying upload...`);
        const retryResult = await adminSupabase.storage
          .from(bucketName)
          .upload(pathName, buffer, {
            contentType: file.type,
            upsert: true
          });
        uploadData = retryResult.data;
        uploadError = retryResult.error;
      } catch (err) {
        console.error("[Upload API] Failed to auto-create bucket:", err);
      }
    }

    if (uploadError) {
      console.error("[Upload API] Supabase storage upload error:", uploadError);
      throw uploadError;
    }

    console.log("[Upload API] Upload success. Data:", uploadData);

    // 5. Get public URL
    const { data: { publicUrl } } = adminSupabase.storage.from(bucketName).getPublicUrl(pathName);
    console.log("[Upload API] Resolved public URL:", publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("[Upload API] Caught error inside handler:", err);
    return NextResponse.json(
      { error: err.message || "فشل رفع المستند" },
      { status: 500 }
    );
  }
}
