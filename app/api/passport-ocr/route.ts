import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// قراءة بيانات الجواز عبر Mistral Document AI (OCR + Annotations):
//  1) نداء OCR واحد مع document_annotation_format يعيد كل الحقول منظَّمة JSON
//     (النموذج يرى الجواز كاملًا: الحقول المطبوعة + MRZ).
//  2) نفكّ MRZ من النص الخام ونتحقّق من أرقام التحقق (check digits) المدمجة فيه —
//     إذا صحّت، قيم MRZ تتغلّب على قيم الـ Annotation لأنها مضمونة رياضيًّا.

// حقول استمارة شنغن الموحّدة فقط (التقديم على سفارات ألمانيا/فرنسا/إيطاليا)
const FIELD_KEYS = [
  "surname",
  "given_names",
  "date_of_birth",
  "place_of_birth",
  "country_of_birth",
  "nationality",
  "sex",
  "passport_number",
  "date_of_issue",
  "date_of_expiry",
  "issuing_country",
] as const;

const ANNOTATION_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "passport_fields",
    strict: true,
    schema: {
      title: "PassportFields",
      type: "object",
      additionalProperties: false,
      required: [...FIELD_KEYS, "mrz"],
      properties: {
        surname: { type: "string", description: "Surname / family name exactly as printed" },
        given_names: { type: "string", description: "Given (first and middle) names exactly as printed" },
        date_of_birth: { type: "string", description: "Date of birth in YYYY-MM-DD" },
        place_of_birth: { type: "string", description: "Place (city) of birth as printed" },
        country_of_birth: { type: "string", description: "Country of birth, from the place-of-birth line if it includes a country, otherwise the issuing country" },
        nationality: { type: "string", description: "Nationality, prefer the 3-letter code (e.g. IRQ)" },
        sex: { type: "string", description: "M or F" },
        passport_number: { type: "string", description: "Passport number exactly as printed" },
        date_of_issue: { type: "string", description: "Date of issue in YYYY-MM-DD" },
        date_of_expiry: { type: "string", description: "Date of expiry in YYYY-MM-DD" },
        issuing_country: { type: "string", description: "Issuing country/authority, prefer the 3-letter code" },
        mrz: {
          type: "string",
          description:
            "The two machine-readable lines at the bottom of the passport, copied VERBATIM character by character including every < symbol, separated by a newline",
        },
      },
    },
  },
};

const ANNOTATION_PROMPT = `This image is a passport. Extract only the fields needed for a Schengen visa application form, exactly as they appear.
Rules:
- Cross-check printed fields against the MRZ (the two <<< lines at the bottom); the MRZ is authoritative.
- All dates must be in YYYY-MM-DD format.
- Use an empty string "" for any field that is not visible or not readable. Never guess.
- Copy the MRZ lines verbatim, preserving every < character.`;

// ── أدوات MRZ (صيغة TD3: سطران × 44 حرفًا) ──

// رقم التحقق وفق ICAO 9303: أوزان 7-3-1، الأرقام بقيمتها، A=10..Z=35، < = 0
function checkDigit(s: string): number {
  let sum = 0;
  const weights = [7, 3, 1];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const v =
      c >= "0" && c <= "9"
        ? c.charCodeAt(0) - 48
        : c >= "A" && c <= "Z"
          ? c.charCodeAt(0) - 55
          : 0;
    sum += v * weights[i % 3];
  }
  return sum % 10;
}

function mrzDate(yymmdd: string, kind: "birth" | "expiry"): string | null {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = Number(yymmdd.slice(0, 2));
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  if (mm < "01" || mm > "12" || dd < "01" || dd > "31") return null;
  const currentYY = new Date().getFullYear() % 100;
  // الميلاد: سنتان أكبر من الحالية تعني القرن الماضي. الانتهاء دائمًا مستقبلي.
  const century = kind === "expiry" ? 2000 : yy > currentYY + 1 ? 1900 : 2000;
  return `${century + yy}-${mm}-${dd}`;
}

function cleanName(part: string): string {
  return part.replace(/</g, " ").replace(/\s+/g, " ").trim();
}

interface MrzResult {
  fields: Partial<Record<(typeof FIELD_KEYS)[number], string>>;
  mrz: string;
  /** أرقام التحقق الثلاثة (رقم الجواز، الميلاد، الانتهاء) كلها صحيحة */
  valid: boolean;
}

function parseMrz(text: string): MrzResult | null {
  // أسطر MRZ: حروف كبيرة/أرقام/رمز الحشو <، نتسامح 40–44 حرفًا لأخطاء القراءة
  const candidates = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, "").toUpperCase())
    .filter((l) => /^[A-Z0-9<]{40,44}$/.test(l));

  let l1 = "";
  let l2 = "";
  for (let i = 0; i < candidates.length - 1; i++) {
    if (candidates[i].startsWith("P")) {
      l1 = candidates[i].padEnd(44, "<");
      l2 = candidates[i + 1].padEnd(44, "<");
      break;
    }
  }
  if (!l1 || !l2) return null;

  const issuingCountry = l1.slice(2, 5).replace(/</g, "");
  const [surnameRaw, givenRaw = ""] = l1.slice(5).split("<<");
  const surname = cleanName(surnameRaw);
  const given = cleanName(givenRaw);

  const passportNumber = l2.slice(0, 9).replace(/</g, "");
  const nationality = l2.slice(10, 13).replace(/</g, "");
  const dob = mrzDate(l2.slice(13, 19), "birth");
  const sexRaw = l2.slice(20, 21);
  const sex = sexRaw === "M" || sexRaw === "F" ? sexRaw : "";
  const expiry = mrzDate(l2.slice(21, 27), "expiry");

  const valid =
    checkDigit(l2.slice(0, 9)) === Number(l2[9]) &&
    checkDigit(l2.slice(13, 19)) === Number(l2[19]) &&
    checkDigit(l2.slice(21, 27)) === Number(l2[27]);

  return {
    fields: {
      surname,
      given_names: given,
      passport_number: passportNumber,
      nationality,
      issuing_country: issuingCountry,
      date_of_birth: dob ?? "",
      sex,
      date_of_expiry: expiry ?? "",
    },
    mrz: `${l1}\n${l2}`,
    valid,
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY غير مضبوط" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const image = form.get("image");
  if (!(image instanceof Blob)) {
    return NextResponse.json({ error: "لا توجد صورة" }, { status: 400 });
  }

  if (image.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: "حجم الصورة كبير جدًا (الحد 8 ميغابايت)" },
      { status: 400 }
    );
  }

  if (!image.type || !image.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "الملف المرفوع ليس صورة صالحة" },
      { status: 400 }
    );
  }

  const mime = image.type || "image/jpeg";
  const buffer = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

  let res: Response;
  try {
    res = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: { type: "image_url", image_url: dataUrl },
        document_annotation_format: ANNOTATION_FORMAT,
        document_annotation_prompt: ANNOTATION_PROMPT,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "خطأ في الاتصال بخدمة القراءة" },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error("Mistral OCR error:", detail);
    return NextResponse.json({ error: "تعذّرت قراءة الجواز" }, { status: 502 });
  }

  const data = await res.json();
  const rawText: string = (data.pages ?? [])
    .map((p: { markdown?: string }) => p.markdown ?? "")
    .join("\n")
    .trim();

  // 1) حقول الـ Annotation (النموذج يرى الجواز كاملًا)
  const fields: Record<string, string> = {};
  let annotationMrz = "";
  try {
    const ann = JSON.parse(data.document_annotation ?? "{}");
    for (const key of FIELD_KEYS) {
      const v = ann[key];
      fields[key] = typeof v === "string" ? v.trim() : "";
    }
    annotationMrz = typeof ann.mrz === "string" ? ann.mrz.trim() : "";
  } catch {
    for (const key of FIELD_KEYS) fields[key] = "";
  }

  // 2) تفكيك MRZ (من النص الخام أولًا، ثم من نسخة الـ Annotation)
  const parsed = parseMrz(rawText) ?? parseMrz(annotationMrz);

  if (parsed) {
    for (const [key, value] of Object.entries(parsed.fields)) {
      if (!value) continue;
      // أرقام التحقق صحيحة → MRZ يتغلّب؛ وإلا يكمّل الفراغات فقط
      if (parsed.valid || !fields[key]) fields[key] = value;
    }
  }

  return NextResponse.json({
    fields,
    mrz: parsed?.mrz ?? annotationMrz,
    rawText,
    mrzFound: Boolean(parsed || annotationMrz),
    mrzVerified: parsed?.valid ?? false,
  });
}
