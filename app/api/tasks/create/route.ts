import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile } from "fs/promises";
import { join } from "path";

const BOT_TOKEN = "8674388050:AAGa1wagkeeW0gb9FE88RukpC3pAd7WWNu0";
const CHAT_ID = "8696377323";

async function sendTelegramMessage(task: {
  id: string;
  page: string;
  modification_type: string;
  description: string;
  status: string;
  created_at: string | null;
  image_url: string | null;
}) {
  const text = `
📋 <b>طلب جديد - تعديلات الموقع</b>
━━━━━━━━━━━━━━━
🆔 <b>الرقم:</b> <code>${task.id.slice(0, 8)}</code>
📄 <b>الصفحة:</b> ${task.page}
🔧 <b>نوع التعديل:</b> ${task.modification_type}
📝 <b>الوصف:</b> ${task.description}
📊 <b>الحالة:</b> ${getStatusArabic(task.status)}
🕐 <b>التاريخ:</b> ${task.created_at ? new Date(task.created_at).toLocaleString("ar-SA") : "غير محدد"}
━━━━━━━━━━━━━━━
<a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard/tasks">فتح لوحة التحكم</a>
`;

  try {
    if (task.image_url) {
      let sentPhoto = false;
      try {
        const filePath = join(process.cwd(), "public", task.image_url);
        const fileBuffer = await readFile(filePath);
        
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("caption", text);
        formData.append("parse_mode", "HTML");
        formData.append("photo", new Blob([fileBuffer]), "image.png");

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
        console.error("Error reading file or sending photo to Telegram:", err);
      }

      if (!sentPhoto) {
        // Fallback if reading file fails or Telegram API rejects it
        const fullUrl = task.image_url.startsWith('http') 
          ? task.image_url 
          : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${task.image_url}`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: text + `\n🖼 <a href="${fullUrl}">عرض الصورة المرفقة</a>`,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        page: body.page,
        modification_type: body.modification_type,
        description: body.description,
        status: "todo",
        image_url: body.image_url || null,
        image_annotation: body.image_annotation || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Telegram notification
    await sendTelegramMessage(data);

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Create task error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
