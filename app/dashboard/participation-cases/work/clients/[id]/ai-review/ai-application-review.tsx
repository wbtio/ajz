"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  History,
  Loader2,
  Paperclip,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type Review = {
  score: number;
  summary: string;
  errors: { title: string; detail: string; severity: "error" | "warning" }[];
  verified: string[];
  next_actions: string[];
};

type HistoryEntry = {
  id: string;
  created_at: string;
  score: number;
  review: Review;
  file_names: string[] | null;
  users?: { full_name: string | null; email: string | null } | null;
};

export function AiApplicationReview({ registration }: { registration: any }) {
  const [review, setReview] = useState<Review | null>(null);
  const [analyzedFiles, setAnalyzedFiles] = useState<string[]>([]);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);
  // Phases describe what the request is actually doing. The previous version
  // announced a "preparing documents" step that never ran.
  const [phase, setPhase] = useState("Sending the application for review…");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/participation-cases/ai-review?registrationId=${encodeURIComponent(registration.id)}`);
      if (!response.ok) return;
      const data = await response.json();
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch {
      // History is supplementary; a failure here must not block the review.
    }
  }, [registration.id]);

  const runReview = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarning("");
    setReview(null);
    setAnalyzedFiles([]);
    setPhase("Sending the application and its stored documents…");
    try {
      const response = await fetch("/api/participation-cases/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registration.id, context: registration }),
      });
      setPhase("AI is reading the documents and analyzing…");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Review failed.");
      setReview(data.review);
      setAnalyzedFiles(Array.isArray(data.analyzedFiles) ? data.analyzedFiles : []);
      if (data.warning) setWarning(data.warning);
      setPhase("Analysis complete");
      void loadHistory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review failed.");
      setPhase("");
    } finally {
      setLoading(false);
    }
  }, [registration, loadHistory]);

  useEffect(() => {
    void runReview();
    void loadHistory();
    // This review is intentionally started once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main dir="ltr" lang="en" className="mx-auto max-w-6xl space-y-5 pb-10">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5" role="status" aria-live="polite">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#8B0000]/10">
              <Loader2 className="size-7 animate-spin text-[#8B0000]" />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B0000]">AI application review</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Application review in progress</h2>
            <p className="mt-2 text-sm text-slate-500">{phase}</p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#8B0000]" /></div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/participation-cases/work/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#8B0000]"
        >
          <ArrowLeft className="size-4" /> Back to Applications
        </Link>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              aria-expanded={historyOpen}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              <History className="size-3.5" /> Previous reviews ({history.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => void runReview()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#8B0000]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#8B0000] transition-colors hover:bg-[#8B0000]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Run review again
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => void runReview()} className="mt-1.5 font-semibold underline underline-offset-2">
            Try again
          </button>
        </div>
      )}
      {warning && <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{warning}</p>}

      {historyOpen && history.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Previous reviews</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {history.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700">
                    {new Date(entry.created_at).toLocaleString("en-GB")}
                    <span className="ml-2 font-normal text-slate-400">
                      {entry.users?.full_name || entry.users?.email || "Staff member"}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {(entry.file_names?.length || 0) > 0 ? `${entry.file_names!.length} document(s) analyzed` : "No documents analyzed"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{entry.score}%</span>
                  <button
                    type="button"
                    onClick={() => { setReview(entry.review); setAnalyzedFiles(entry.file_names || []); setHistoryOpen(false); }}
                    className="text-[11px] font-semibold text-[#8B0000] underline underline-offset-2"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {review && (
        <section className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`rounded-xl border p-5 ${review.score >= 80 ? "border-emerald-200 bg-emerald-50" : review.score >= 50 ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600">Readiness score</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight text-slate-950">{review.score}%</p>
                </div>
                <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {review.score >= 80 ? "Ready" : review.score >= 50 ? "Needs review" : "Action required"}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80">
                <div className={`h-full rounded-full ${review.score >= 80 ? "bg-emerald-600" : review.score >= 50 ? "bg-amber-500" : "bg-rose-600"}`} style={{ width: `${Math.max(0, Math.min(review.score, 100))}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-slate-600">
                {analyzedFiles.length > 0
                  ? `Based on the fields and ${analyzedFiles.length} document(s) checked.`
                  : "Based on the application fields only — no documents were available to read."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What this means</p>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-800">{review.summary}</p>
              {analyzedFiles.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  <Paperclip className="size-3.5 shrink-0" aria-hidden />
                  {analyzedFiles.map((name) => (
                    <span key={name} className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">{name}</span>
                  ))}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <ReviewList
              title="Errors and warnings"
              icon={AlertTriangle}
              items={review.errors}
              tone="error"
            />
            <ReviewList
              title="Verified information"
              icon={ShieldCheck}
              items={review.verified}
              tone="success"
            />
            <ReviewList
              title="Next actions"
              icon={CheckCircle2}
              items={review.next_actions}
              tone="info"
            />
          </div>
        </section>
      )}
    </main>
  );
}

function ReviewList({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: typeof AlertTriangle;
  items: (string | { title: string; detail: string })[];
  tone: "error" | "success" | "info";
}) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div
      className={`rounded-xl border p-5 ${tone === "error" ? "border-amber-200 bg-amber-50/70" : tone === "success" ? "border-emerald-200 bg-emerald-50/70" : "border-blue-200 bg-blue-50/70"}`}
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="size-4" />
        {title}
      </h2>
      <ul className="mt-4 grid gap-2.5">
        {list.length ? (
          list.map((item, index) => {
            const detail = typeof item === "string" ? item : item.detail;
            const label = typeof item === "string" ? "" : item.title;
            return (
              <li key={`${label}-${detail}-${index}`} className="rounded-lg border border-white/80 bg-white/65 p-3 text-sm leading-5 text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${tone === "error" ? "bg-amber-200 text-amber-900" : tone === "success" ? "bg-emerald-200 text-emerald-900" : "bg-blue-200 text-blue-900"}`}>{index + 1}</span>
                  <span>
                    {label && <strong className="block text-[12px] font-bold text-slate-900">{label}</strong>}
                    <span className={label ? "mt-0.5 block" : "block"}>{detail}</span>
                  </span>
                </div>
              </li>
            );
          })
        ) : (
          <li className="rounded-lg border border-white/80 bg-white/65 p-3 text-sm text-slate-600">No items found.</li>
        )}
      </ul>
    </div>
  );
}
