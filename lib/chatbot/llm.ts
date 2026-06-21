/**
 * Thin wrapper around any OpenAI-compatible /chat/completions endpoint.
 * Configured for OpenCode (Go) by default, but the base URL / model / key are
 * all read from environment variables so the provider can be swapped freely.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const BASE_URL =
  process.env.CHAT_API_BASE_URL?.replace(/\/$/, "") ||
  "https://opencode.ai/zen/go/v1";
const MODEL = process.env.CHAT_MODEL || "deepseek-v4-flash";
const API_KEY = process.env.CHAT_API_KEY || "";
// Most OpenCode Go models are reasoning models (slow + token-heavy). We disable
// the thinking pass for speed. Set CHAT_THINKING_DISABLED=0 if your model
// rejects this parameter (e.g. a plain OpenAI model).
const DISABLE_THINKING = process.env.CHAT_THINKING_DISABLED !== "0";

export function isChatConfigured() {
  return Boolean(API_KEY);
}

type CompletionOptions = {
  messages: ChatMessage[];
  /** Keep this small — we are token-budget conscious. */
  maxTokens?: number;
  temperature?: number;
  /** Ask the model to return strict JSON (best-effort across providers). */
  json?: boolean;
};

export async function chatCompletion({
  messages,
  maxTokens = 500,
  temperature = 0.3,
  json = false,
}: CompletionOptions): Promise<string> {
  if (!API_KEY) {
    throw new Error("CHAT_API_KEY is not set");
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  if (json) {
    // Most OpenAI-compatible providers honour this; harmless if ignored
    // because we also parse defensively in the caller.
    body.response_format = { type: "json_object" };
  }
  if (DISABLE_THINKING) {
    body.thinking = { type: "disabled" };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Chat API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  return (content || "").trim();
}

/**
 * Extract a JSON object from a model response that may be wrapped in prose or
 * ```json fences. Returns null if nothing parseable is found.
 */
export function parseJsonLoose<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  // Strip code fences
  let s = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  // Fast path
  try {
    return JSON.parse(s) as T;
  } catch {
    // Fall back to first balanced { ... }
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      s = s.slice(start, end + 1);
      try {
        return JSON.parse(s) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
