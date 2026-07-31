import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile } from "fs/promises";
import { join } from "path";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramMessage(task: {
  id: string;
  page: string;
  modification_type: string;
  description: string;
  status: string;
  created_at: string | null;
  base64_image?: string | null;
}) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID غير مضبوطة");
    return;
  }

  // النص قادم من زائر مجهول، وتيليغرام يرفض الرسالة كلها إذا احتوت HTML غير سليم
  const text = `
📋 <b>طلب جديد - تعديلات الموقع</b>
━━━━━━━━━━━━━━━
🆔 <b>الرقم:</b> <code>${escapeHtml(task.id.slice(0, 8))}</code>
📄 <b>الصفحة:</b> ${escapeHtml(task.page)}
🔧 <b>نوع التعديل:</b> ${escapeHtml(task.modification_type)}
📝 <b>الوصف:</b> ${escapeHtml(task.description)}
📊 <b>الحالة:</b> ${getStatusArabic(task.status)}
🕐 <b>التاريخ:</b> ${task.created_at ? new Date(task.created_at).toLocaleString("ar-SA") : "غير محدد"}
━━━━━━━━━━━━━━━
<a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard/tasks">فتح لوحة التحكم</a>
`;

  try {
    if (task.base64_image) {
      let sentPhoto = false;
      try {
        const base64Data = task.base64_image.replace(/^data:image\/\w+;base64,/, "");
        const fileBuffer = Buffer.from(base64Data, "base64");
        
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("caption", text);
        formData.append("parse_mode", "HTML");
        const file = new File([fileBuffer], "image.png", { type: "image/png" });
        formData.append("photo", file);

        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          body: formData,
        });
        
        if (res.ok) {
          sentPhoto = true;
        } else {
          console.error("Telegram sendPhoto failed:", await res.text());
        }
      } catch (err) {
        console.error("Error sending base64 photo to Telegram:", err);
      }

      if (!sentPhoto) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: text + "\n⚠️ <b>تنبيه:</b> يوجد صورة مرفقة ولكن تعذر إرسالها بسبب خطأ تقني.",
            parse_mode: "HTML",
          }),
        });
      }
    } else {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      });
    }
  } catch (e) {
    console.error("Telegram send failed:", e);
  }
}

function getStatusArabic(status: string) {
  const map: Record<string, string> = {
    todo: "🔴 مهمة",
    in_progress: "🟠 تحت المعالجة",
    done: "🟢 تم الإنجاز",
  };
  return map[status] || status;
}

/** حدود الإدخال — هذا المسار عام عمداً (نموذج /tasks/new)، فلا بد من تقييده */
const MAX_TEXT = 2000;
const MAX_IMAGE_CHARS = 8 * 1024 * 1024; // ≈ ٦ ميغابايت بعد فك ترميز base64

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_TEXT) return null;
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const page = cleanText(body.page);
    const modificationType = cleanText(body.modification_type);
    const description = cleanText(body.description);

    if (!page || !modificationType || !description) {
      return NextResponse.json(
        { error: "البيانات المرسلة غير مكتملة أو تتجاوز الحد المسموح" },
        { status: 400 }
      );
    }

    const image =
      typeof body.base64_image === "string" &&
      body.base64_image.length <= MAX_IMAGE_CHARS
        ? body.base64_image
        : null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        page,
        modification_type: modificationType,
        description,
        status: "todo",
        image_url: null, // Not saving to database as per user request
        image_annotation: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Telegram notification with the base64 image (not saved to server)
    await sendTelegramMessage({
      ...data,
      base64_image: image
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Create task error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
