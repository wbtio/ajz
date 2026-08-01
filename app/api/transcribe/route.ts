import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// أقصى حجم لملف صوتي واحد — يمنع رفع ملفات ضخمة تستهلك الرصيد
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

// تفريغ صوتي عبر Mistral Voxtral: يستقبل ملف صوت ويعيد نصّه.
// هذا المسار يستهلك رصيداً مدفوعاً، لذا يقتصر على موظفي لوحة التحكم.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "No audio file was provided" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: "The audio file is larger than the allowed limit" },
      { status: 413 }
    );
  }

  const upstream = new FormData();
  upstream.append("model", "voxtral-mini-latest");
  upstream.append("file", audio, "audio.webm");

  const res = await fetch("https://api.mistral.ai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Mistral transcription error:", detail);
    return NextResponse.json(
      { error: "Could not transcribe the audio" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ text: (data.text ?? "").trim() });
}
