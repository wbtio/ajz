import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, parseJsonLoose, isChatConfigured, type ChatMessage } from "@/lib/chatbot/llm";
import { PLANNER_SCHEMA, SITE_OVERVIEW, type PlannerResult } from "@/lib/chatbot/schema";
import { runQuery } from "@/lib/chatbot/query";

export const runtime = "nodejs";

type IncomingMessage = { role: "user" | "assistant"; content: string };

/** Keep only the last few turns so prompts stay small. */
const MAX_HISTORY = 6;
const MAX_MSG_LEN = 600;

function isArabic(text: string) {
  return /[؀-ۿ]/.test(text);
}

function trimHistory(messages: IncomingMessage[]): IncomingMessage[] {
  return messages
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role,
      content: (m.content || "").slice(0, MAX_MSG_LEN),
    }));
}

export async function POST(req: NextRequest) {
  if (!isChatConfigured()) {
    return NextResponse.json(
      { error: "Chatbot is not configured. Set CHAT_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const history = trimHistory(body.messages || []);
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ error: "No question provided" }, { status: 400 });
  }

  const question = lastUser.content.trim();
  const replyLang = isArabic(question) ? "Arabic" : "English";
  const todayStr = new Date().toISOString().slice(0, 10);

  // ---- Stage 1: analyze the question into a resource + filters -------------
  let plan: PlannerResult = { resource: "none", filters: {} };
  try {
    const planRaw = await chatCompletion({
      maxTokens: 250,
      temperature: 0,
      json: true,
      messages: [
        {
          role: "system",
          content:
            `You are a query planner for a website chatbot. Today is ${todayStr}.\n` +
            `${PLANNER_SCHEMA}\n\n` +
            `Given the user's question (and brief history), respond with ONLY a JSON object:\n` +
            `{"resource": <one of events|sectors|trainings|posts|partners|links|none>, "filters": {..}, "limit": <1-8>}\n` +
            `Only include filters that are clearly implied. Translate sector/keyword values to simple English nouns when possible. Do not add commentary.`,
        },
        ...historyForPlanner(history),
      ],
    });
    const parsed = parseJsonLoose<PlannerResult>(planRaw);
    if (parsed && parsed.resource) {
      plan = {
        resource: parsed.resource,
        filters: parsed.filters || {},
        limit: parsed.limit,
      };
    }
  } catch (err) {
    console.error("[chatbot] planner failed:", err);
    // Fall through with resource:none — we can still answer generally.
  }

  // ---- Stage 2: fetch data from the database ------------------------------
  let context: { resource: string; rows: Record<string, unknown>[] } = {
    resource: "none",
    rows: [],
  };
  if (plan.resource !== "none") {
    try {
      context = await runQuery(plan);
    } catch (err) {
      console.error("[chatbot] query failed:", err);
    }
  }

  // ---- Stage 3: compose the final answer ----------------------------------
  const dataBlock =
    context.rows.length > 0
      ? `Relevant ${context.resource} from the database (JSON):\n${JSON.stringify(
          context.rows
        )}`
      : plan.resource !== "none"
      ? `No matching ${plan.resource} were found in the database.`
      : "";

  const answerMessages: ChatMessage[] = [
    {
      role: "system",
      content:
        `You are the friendly assistant for the JAZ website. ${SITE_OVERVIEW}\n` +
        `Answer in ${replyLang}. Be concise and helpful. Use short Markdown (bullet lists) when listing items.\n` +
        `Only use the data provided below — never invent events, dates, or details. ` +
        `If no data is provided or none matches, say you couldn't find anything and suggest the user browse the relevant page.\n\n` +
        (dataBlock || "(No database lookup was needed for this message.)"),
    },
    ...history.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
  ];

  try {
    const answer = await chatCompletion({
      messages: answerMessages,
      maxTokens: 800,
      temperature: 0.4,
    });
    return NextResponse.json({
      answer,
      meta: { resource: context.resource, count: context.rows.length },
    });
  } catch (err) {
    console.error("[chatbot] answer failed:", err);
    return NextResponse.json(
      { error: "Failed to generate a response. Please try again." },
      { status: 502 }
    );
  }
}

/** History for the planner — only the user turns matter, kept ultra short. */
function historyForPlanner(history: IncomingMessage[]): ChatMessage[] {
  return history
    .filter((m) => m.role === "user")
    .slice(-2)
    .map((m) => ({ role: "user" as const, content: m.content }));
}
