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

// Standard Schengen application fields, ordered as they appear on the form.
const FIELD_DEFS: { key: string; label: string }[] = [
  { key: "surname", label: "Surname" },
  { key: "given_names", label: "First name(s)" },
  { key: "date_of_birth", label: "Date of birth" },
  { key: "place_of_birth", label: "Place of birth" },
  { key: "country_of_birth", label: "Country of birth" },
  { key: "nationality", label: "Current nationality" },
  { key: "sex", label: "Sex" },
  { key: "passport_number", label: "Passport number" },
  { key: "date_of_issue", label: "Date of issue" },
  { key: "date_of_expiry", label: "Date of expiry" },
  { key: "issuing_country", label: "Issuing country" },
];

// Schengen validity checks based on the issue and expiry dates.
function schengenChecks(fields: Record<string, string>): {
  level: "error" | "warn";
  message: string;
}[] {
  const notes: { level: "error" | "warn"; message: string }[] = [];
  const today = new Date();

  const expiry = fields.date_of_expiry ? new Date(fields.date_of_expiry) : null;
  if (expiry && !isNaN(expiry.getTime())) {
    if (expiry < today) {
      notes.push({ level: "error", message: "Passport expired. It cannot be used for an application." });
    } else {
      const sixMonths = new Date(today);
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      if (expiry < sixMonths) {
        notes.push({
          level: "warn",
          message:
            "Passport expires in less than 6 months. Schengen requires 3 months of validity after your return date; renewal is recommended.",
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
        message: "Passport was issued more than 10 years ago. Schengen consulates will not accept it.",
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
      setError("The selected file is not an image. Please upload a JPG or PNG file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("The image is larger than 8 MB.");
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
        setError("The passport could not be read.");
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
      setError("A connection error occurred while reading the passport.");
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
    <div className="mx-auto max-w-5xl" dir="ltr" lang="en">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b0000,#c2410c)] text-white shadow-[0_14px_30px_-18px_rgba(139,0,0,0.7)]">
          <ScanLine className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-950">
            Passport Scanner
          </h1>
          <p className="text-sm text-stone-500">
            Upload a passport image to extract Schengen application fields and check passport validity.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload and preview area */}
        <div>
          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-stone-300 bg-white/60 text-stone-500 transition-colors hover:border-red-400 hover:bg-red-50/40 hover:text-red-600"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-semibold">Choose a passport image</span>
              <span className="text-xs text-stone-400">JPG or PNG, up to 8 MB</span>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Passport preview"
                className="max-h-96 w-full object-contain"
              />
              <button
                type="button"
                onClick={reset}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Choose another image
              </button>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-sm">
                  <Loader2 className="h-7 w-7 animate-spin text-red-600" />
                  <span className="text-sm font-semibold text-stone-700">
                    Reading passport…
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

        {/* Extracted fields */}
        <div>
          {fields ? (
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-stone-700">
                    Extracted information
                  </h2>
                  {mrzVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                      <Check className="h-3 w-3" />
                      MRZ verified
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
                  {copied ? "Copied" : "Copy all"}
                </button>
              </div>
              {!mrzFound && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  MRZ area not found. Complete the fields manually using the full text below.
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
                      placeholder="Not read. Enter manually."
                    />
                    {crops[f.key] && (
                      // Passport crop for quick visual verification.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={crops[f.key]}
                        alt={`${f.label} crop from passport`}
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
                    {showRaw ? "Hide full text" : "Show extracted full text"}
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
              Extracted fields will appear here after you upload an image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
