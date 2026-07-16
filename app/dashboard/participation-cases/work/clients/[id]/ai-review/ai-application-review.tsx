"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type Review = {
  score: number;
  summary: string;
  errors: { title: string; detail: string; severity: "error" | "warning" }[];
  verified: string[];
  next_actions: string[];
};

export function AiApplicationReview({ registration }: { registration: any }) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("Preparing application review…");
  const [error, setError] = useState("");
  async function runReview() {
    setLoading(true);
    setError("");
    setReview(null);
    setPhase("Preparing application fields…");
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      setPhase("Preparing stored documents…");
      const encoded: never[] = [];
      setPhase("Sending application and documents…");
      const response = await fetch("/api/participation-cases/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          context: registration,
          files: encoded,
        }),
      });
      setPhase("AI is analyzing…");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Review failed.");
      setReview(data.review);
      setPhase("Analysis complete");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : phase || "Review failed.",
      );
      setPhase("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runReview();
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
      <Link
        href="/dashboard/participation-cases/work/clients"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#8B0000]"
      >
        <ArrowLeft className="size-4" /> Back to Applications
      </Link>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
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
              <p className="mt-2 text-[11px] text-slate-600">Based on the fields and documents checked.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What this means</p>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-800">{review.summary}</p>
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
  return (
    <div
      className={`rounded-xl border p-5 ${tone === "error" ? "border-amber-200 bg-amber-50/70" : tone === "success" ? "border-emerald-200 bg-emerald-50/70" : "border-blue-200 bg-blue-50/70"}`}
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="size-4" />
        {title}
      </h2>
      <ul className="mt-4 grid gap-2.5">
        {items.length ? (
          items.map((item, index) => {
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
