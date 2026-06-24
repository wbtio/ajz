import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, isChatConfigured, type ChatMessage } from "@/lib/chatbot/llm";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * AI generator for an event's HTML content page.
 *
 * Two hard rules drive the prompt:
 *  1. The output must match the JAZ ("Sovereign Zone Meridian") brand identity.
 *  2. The user-supplied CONTENT text must be reproduced verbatim — never
 *     translated, rephrased, summarised, corrected, or reordered.
 *
 * Everything else (which sections to include) is opt-in through `options`.
 */

type GenerateOptions = {
  hero?: boolean;
  agenda?: boolean;
  speakers?: boolean;
  cta?: boolean;
  faq?: boolean;
  contact?: boolean;
  gallery?: boolean;
};

type GenerateBody = {
  content?: string;
  instructions?: string;
  options?: GenerateOptions;
  eventTitle?: string;
};

const MAX_CONTENT_LEN = 12000;

/** JAZ brand identity — kept in sync with DESIGN.md. */
const BRAND_BRIEF = `
BRAND IDENTITY — "JAZ / Sovereign Zone Meridian" (follow strictly):
- Tone: executive, institutional, prestigious. No startup hype, no decorative clutter, no floating blobs.
- Colors (use exactly these):
    Primary red  #8B0000  (hover #6B0000) — CTAs / key highlights only, on <=10% of the page.
    Accent green #16a34a — international / success markers only.
    Navy dark    #0b1426 — dark section backgrounds & headings.
    White        #ffffff — default background.
    Platinum     #f5f7fa — secondary panel backgrounds.
    Border       rgba(15,23,42,0.1).
    Body text    #0f172a. Greys must be tinted toward the navy, never pure grey.
- Typography: import "Plus Jakarta Sans" (latin) and "IBM Plex Sans Arabic" (arabic) from Google Fonts.
    Display headings: weight 900, large (clamp(2rem,5vw,3.5rem)), line-height 1.2.
    Body: weight 400, line-height 1.7.
- Radii: small 6px, medium 10px, large 16px. Generous, structured whitespace; wide section gaps.
- Layout is clean and high-contrast; sections feel distinct.
`.trim();

export async function POST(req: NextRequest) {
  if (!isChatConfigured()) {
    return NextResponse.json(
      { error: "خدمة الذكاء الاصطناعي غير مفعّلة. يرجى ضبط CHAT_API_KEY في .env.local." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = (body.content || "").trim().slice(0, MAX_CONTENT_LEN);
  if (!content) {
    return NextResponse.json(
      { error: "يرجى إدخال النص/المحتوى الذي تريد بناء الصفحة حوله." },
      { status: 400 }
    );
  }

  const instructions = (body.instructions || "").trim().slice(0, 2000);
  const options = body.options || {};
  const eventTitle = (body.eventTitle || "").trim().slice(0, 200);

  // Translate the opt-in toggles into explicit section instructions.
  const sectionLabels: Record<keyof GenerateOptions, string> = {
    hero: "A bold hero header section with the main title.",
    agenda: "An agenda / schedule section.",
    speakers: "A speakers / participants section.",
    cta: 'A registration call-to-action button styled in the primary red (link it to "../register" if no other link is given).',
    faq: "A frequently-asked-questions section.",
    contact: "A contact / location information section.",
    gallery: "An image gallery placeholder section.",
  };
  const requestedSections = (Object.keys(sectionLabels) as (keyof GenerateOptions)[])
    .filter((k) => options[k])
    .map((k) => `- ${sectionLabels[k]}`);

  const sectionsBlock = requestedSections.length
    ? `Include these OPTIONAL sections (and only these — do not invent others):\n${requestedSections.join("\n")}`
    : "Do not add optional sections beyond what the content itself implies.";

  const system: ChatMessage = {
    role: "system",
    content:
      `You are an expert front-end designer who builds polished HTML pages for the JAZ event platform.\n\n` +
      `${BRAND_BRIEF}\n\n` +
      `ABSOLUTE TEXT RULE (highest priority):\n` +
      `The user provides CONTENT below. Every word of it must appear in the output EXACTLY as written — ` +
      `same language (Arabic or English), same wording, same order. You must NOT translate, rephrase, ` +
      `summarise, shorten, expand, correct spelling, or change any text the user gave. ` +
      `You may only wrap that text in HTML structure and styling, and add neutral structural labels ` +
      `(e.g. section headings) ONLY when a requested section needs one — never put words in the user's mouth.\n\n` +
      `LANGUAGE/DIRECTION: Detect the content language. If it is mainly Arabic, set <div dir="rtl"> and right-aligned, ` +
      `Arabic-appropriate typography; otherwise dir="ltr".\n\n` +
      `OUTPUT FORMAT:\n` +
      `Return ONE self-contained HTML fragment only. Start directly with markup (no \`\`\` fences, no commentary, ` +
      `no <html>/<head>/<body> tags). Include a single <style> block scoped under a unique wrapper class, ` +
      `and a Google Fonts <link> or @import for the brand fonts. Use semantic, responsive HTML. ` +
      `All CSS must be inline in the <style> block — do not reference external stylesheets except the font.\n\n` +
      `${sectionsBlock}`,
  };

  const userParts = [
    eventTitle ? `EVENT TITLE (for context only, reuse verbatim if you display it): ${eventTitle}` : "",
    instructions ? `ADDITIONAL USER INSTRUCTIONS (apply unless they conflict with the brand or the text rule):\n${instructions}` : "",
    `CONTENT (reproduce every word verbatim):\n"""\n${content}\n"""`,
  ].filter(Boolean);

  const messages: ChatMessage[] = [system, { role: "user", content: userParts.join("\n\n") }];

  try {
    let html = await chatCompletion({ messages, maxTokens: 8000, temperature: 0.4 });
    // Defensive: strip any stray code fences the model may add.
    html = html
      .replace(/^\s*```(?:html)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    if (!html) {
      return NextResponse.json(
        { error: "لم يتم توليد أي محتوى. حاول مرة أخرى." },
        { status: 502 }
      );
    }
    return NextResponse.json({ html });
  } catch (err) {
    console.error("[generate-html] failed:", err);
    return NextResponse.json(
      { error: "فشل توليد المحتوى. يرجى المحاولة مرة أخرى." },
      { status: 502 }
    );
  }
}
