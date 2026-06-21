import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MISTRAL_TRANSCRIBE_URL = "https://api.mistral.ai/v1/audio/transcriptions";
const MODEL = process.env.MISTRAL_STT_MODEL || "voxtral-mini-latest";

/**
 * Speech-to-text via Mistral Voxtral. Receives an audio blob (multipart form
 * field "file") from the browser recorder and returns the transcribed text.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Transcription is not configured. Set MISTRAL_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = incoming.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  // Roughly 25 MB cap to avoid abuse.
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio file too large" }, { status: 413 });
  }

  const form = new FormData();
  form.append("model", MODEL);
  form.append(
    "file",
    file,
    (file as File).name || "recording.webm"
  );

  try {
    const res = await fetch(MISTRAL_TRANSCRIBE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[transcribe] mistral error", res.status, text.slice(0, 300));
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string = (data?.text || "").trim();
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[transcribe] request failed:", err);
    return NextResponse.json({ error: "Transcription request failed" }, { status: 502 });
  }
}
