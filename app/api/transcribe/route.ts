import { NextRequest, NextResponse } from "next/server";

// تفريغ صوتي عبر Mistral Voxtral: يستقبل ملف صوت ويعيد نصّه
export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY غير مضبوط" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "لا يوجد ملف صوتي" }, { status: 400 });
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
      { error: "تعذّر تفريغ الصوت" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ text: (data.text ?? "").trim() });
}
