"use client";

import { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "recording" | "loading";

interface VoiceInputProps {
  /** يُستدعى بالنص المُفرَّغ؛ append=true لإلحاقه بالموجود */
  onResult: (text: string) => void;
  title?: string;
  className?: string;
}

/**
 * زر ميكروفون للتفريغ الصوتي عبر Mistral Voxtral.
 * ضغطة = بدء التسجيل، ضغطة ثانية = إيقاف وإرسال، ثم يعيد النص.
 */
export function VoiceInput({
  onResult,
  title = "تفريغ صوتي",
  className,
}: VoiceInputProps) {
  const [state, setState] = useState<State>("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      alert("المتصفح لا يدعم التسجيل الصوتي");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) {
          setState("idle");
          return;
        }
        setState("loading");
        try {
          const fd = new FormData();
          fd.append("audio", blob, "audio.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (res.ok && data.text) {
            onResult(data.text as string);
          } else {
            alert(data.error || "تعذّر تفريغ الصوت");
          }
        } catch {
          alert("خطأ في الاتصال أثناء التفريغ");
        } finally {
          setState("idle");
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setState("recording");
    } catch {
      alert("تعذّر الوصول للميكروفون — تأكد من منح الإذن للمتصفح.");
      setState("idle");
    }
  }

  function stop() {
    recorderRef.current?.stop();
  }

  const onClick = () => {
    if (state === "recording") stop();
    else if (state === "idle") start();
  };

  return (
    <button
      type="button"
      title={
        state === "recording"
          ? "إيقاف التسجيل"
          : state === "loading"
          ? "جارٍ التفريغ…"
          : title
      }
      onClick={onClick}
      disabled={state === "loading"}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
        state === "recording"
          ? "animate-pulse bg-rose-100 text-rose-600"
          : "text-stone-400 hover:bg-stone-100 hover:text-[#8b0000]",
        className
      )}
    >
      {state === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "recording" ? (
        <Square className="h-4 w-4 fill-current" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
