"use client";

import { useRef, useState } from "react";
import {
  ScanLine,
  Upload,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { makePassportCrops } from "@/lib/passport-crops";

// حقول استمارة شنغن الموحّدة فقط، بترتيب الاستمارة (سفارات ألمانيا/فرنسا/إيطاليا).
const FIELD_DEFS: { key: string; label: string }[] = [
  { key: "surname", label: "اللقب — Surname" },
  { key: "given_names", label: "الاسم — First name(s)" },
  { key: "date_of_birth", label: "تاريخ الميلاد" },
  { key: "place_of_birth", label: "مكان الميلاد" },
  { key: "country_of_birth", label: "بلد الميلاد" },
  { key: "nationality", label: "الجنسية" },
  { key: "sex", label: "الجنس" },
  { key: "passport_number", label: "رقم الجواز" },
  { key: "date_of_issue", label: "تاريخ الإصدار" },
  { key: "date_of_expiry", label: "تاريخ الانتهاء" },
  { key: "issuing_country", label: "جهة الإصدار" },
];

// فحوصات صلاحية الجواز لشروط شنغن — تُحسب من تاريخي الإصدار والانتهاء
function schengenChecks(fields: Record<string, string>): {
  level: "error" | "warn";
  message: string;
}[] {
  const notes: { level: "error" | "warn"; message: string }[] = [];
  const today = new Date();

  const expiry = fields.date_of_expiry ? new Date(fields.date_of_expiry) : null;
  if (expiry && !isNaN(expiry.getTime())) {
    if (expiry < today) {
      notes.push({ level: "error", message: "الجواز منتهي الصلاحية — لا يُقبل للتقديم" });
    } else {
      const sixMonths = new Date(today);
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      if (expiry < sixMonths) {
        notes.push({
          level: "warn",
          message:
            "صلاحية الجواز أقل من 6 أشهر — شنغن تشترط صلاحية 3 أشهر بعد تاريخ العودة، يُفضَّل تجديده",
        });
      }
    }
  }

  const issue = fields.date_of_issue ? new Date(fields.date_of_issue) : null;
  if (issue && !isNaN(issue.getTime())) {
    const tenYearsAgo = new Date(today);
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (issue < tenYearsAgo) {
      notes.push({
        level: "error",
        message: "الجواز صادر قبل أكثر من 10 سنوات — سفارات شنغن لا تقبله",
      });
    }
  }

  return notes;
}

type Fields = Record<string, string>;

export function PassportScanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields | null>(null);
  const [mrz, setMrz] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [mrzFound, setMrzFound] = useState(true);
  const [mrzVerified, setMrzVerified] = useState(false);
  const [crops, setCrops] = useState<Record<string, string>>({});
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("الملف المختار ليس صورة — يُرجى رفع JPG أو PNG");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("حجم الصورة يتجاوز 8 ميغابايت");
      return;
    }
    setError(null);
    setFields(null);
    setMrz("");
    setRawText("");
    setMrzFound(true);
    setMrzVerified(false);
    setCrops({});
    setShowRaw(false);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/passport-ocr", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّرت قراءة الجواز");
        return;
      }
      const raw = (data.fields ?? {}) as Record<string, unknown>;
      const normalized: Fields = {};
      for (const { key } of FIELD_DEFS) {
        const v = raw[key];
        normalized[key] = v == null ? "" : String(v);
      }
      setFields(normalized);
      setMrz(data.mrz ? String(data.mrz) : "");
      setRawText(data.rawText ? String(data.rawText) : "");
      setMrzFound(Boolean(data.mrzFound));
      setMrzVerified(Boolean(data.mrzVerified));
      setCrops(await makePassportCrops(file, normalized));
    } catch {
      setError("خطأ في الاتصال أثناء القراءة");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setFields(null);
    setMrz("");
    setRawText("");
    setMrzFound(true);
    setMrzVerified(false);
    setCrops({});
    setShowRaw(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyAll() {
    if (!fields) return;
    const lines = FIELD_DEFS.filter((f) => fields[f.key]).map(
      (f) => `${f.label}: ${fields[f.key]}`
    );
    if (mrz) lines.push(`MRZ: ${mrz.replace(/\n/g, " / ")}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b0000,#c2410c)] text-white shadow-[0_14px_30px_-18px_rgba(139,0,0,0.7)]">
          <ScanLine className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-950">
            قارئ الجوازات
          </h1>
          <p className="text-sm text-stone-500">
            ارفع صورة الجواز وتطلع حقول استمارة شنغن جاهزة للتقديم — مع فحص تلقائي لصلاحية الجواز
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* منطقة الرفع/المعاينة */}
        <div>
          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-stone-300 bg-white/60 text-stone-500 transition-colors hover:border-red-400 hover:bg-red-50/40 hover:text-red-600"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-semibold">اضغط لاختيار صورة الجواز</span>
              <span className="text-xs text-stone-400">JPG أو PNG — حتى 8 ميغابايت</span>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="معاينة الجواز"
                className="max-h-96 w-full object-contain"
              />
              <button
                type="button"
                onClick={reset}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                صورة أخرى
              </button>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-sm">
                  <Loader2 className="h-7 w-7 animate-spin text-red-600" />
                  <span className="text-sm font-semibold text-stone-700">
                    جارٍ قراءة الجواز…
                  </span>
                </div>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* الحقول المستخرجة */}
        <div>
          {fields ? (
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-stone-700">
                    البيانات المستخرجة
                  </h2>
                  {mrzVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                      <Check className="h-3 w-3" />
                      MRZ متحقَّق
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={copyAll}
                  className="flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-700"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "تم النسخ" : "نسخ الكل"}
                </button>
              </div>
              {!mrzFound && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  لم يُعثر على منطقة MRZ — املأ الحقول يدويًّا من النص الكامل بالأسفل
                </div>
              )}
              {schengenChecks(fields).map((note) => (
                <div
                  key={note.message}
                  className={cn(
                    "mb-3 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs",
                    note.level === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {note.message}
                </div>
              ))}
              <div className="space-y-3">
                {FIELD_DEFS.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                      {f.label}
                    </label>
                    <input
                      value={fields[f.key]}
                      onChange={(e) =>
                        setFields((prev) =>
                          prev ? { ...prev, [f.key]: e.target.value } : prev
                        )
                      }
                      className={cn(
                        "w-full rounded-xl border bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors focus:border-red-400",
                        fields[f.key]
                          ? "border-stone-200"
                          : "border-amber-300 bg-amber-50/40"
                      )}
                      placeholder="غير مقروء — أدخله يدويًّا"
                    />
                    {crops[f.key] && (
                      // لقطة من الجواز نفسه لموضع هذا الحقل — للتدقيق البصري السريع
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={crops[f.key]}
                        alt={`لقطة ${f.label} من الجواز`}
                        dir="ltr"
                        className="mt-1.5 max-h-16 w-full rounded-lg border border-stone-200 bg-stone-100 object-contain"
                      />
                    )}
                  </div>
                ))}
                {mrz && (
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                      MRZ
                    </label>
                    <textarea
                      value={mrz}
                      onChange={(e) => setMrz(e.target.value)}
                      dir="ltr"
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 font-mono text-xs text-stone-900 outline-none focus:border-red-400"
                    />
                  </div>
                )}
              </div>
              {rawText && (
                <div className="mt-4 border-t border-stone-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRaw((v) => !v)}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    {showRaw ? "إخفاء النص الكامل" : "عرض النص الكامل المُستخرج"}
                  </button>
                  {showRaw && (
                    <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-600">
                      {rawText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-stone-200 bg-white/40 text-center text-sm text-stone-400">
              <ScanLine className="mb-2 h-7 w-7" />
              ستظهر الحقول المستخرجة هنا بعد رفع الصورة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
