// تحديد موضع قيمة كل حقل على صورة الجواز اعتمادًا على كلمات OCR بإحداثيات هندسية حقيقية
// (تأتي من Tesseract في المتصفح) — لا تخمين من نموذج لغوي.

export interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

// أخطاء OCR الشائعة بين الأرقام والحروف المتشابهة شكلًا
const TO_LETTER: Record<string, string> = { "0": "O", "1": "I", "2": "Z", "5": "S", "8": "B" };
const TO_DIGIT: Record<string, string> = {
  O: "0", Q: "0", D: "0", I: "1", L: "1", Z: "2", S: "5", B: "8", G: "6",
};
const letterCanon = (s: string) => s.replace(/[01258]/g, (c) => TO_LETTER[c]);
const digitCanon = (s: string) => s.replace(/[OQDILZSBG]/g, (c) => TO_DIGIT[c]);

// مسافة التحرير بحد أقصى — خروج مبكر إذا تجاوزت الحد
function levenshteinAtMost(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

function union(a: Box, b: Box): Box {
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
  };
}

// كلمتان على نفس السطر إذا تداخل مداهما العمودي بأكثر من نصف ارتفاع الأقصر
function sameLine(a: Box, b: Box): boolean {
  const overlap = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  const minH = Math.min(a.y1 - a.y0, b.y1 - b.y0);
  return minH > 0 && overlap > minH * 0.5;
}

interface NormWord {
  n: string;
  bbox: Box;
}

// جودة تطابق كلمة OCR مع رمز من قيمة الحقل (0 = لا تطابق):
//  3 تساوٍ تام · 2.5 تساوٍ بعد توحيد الحروف/الأرقام المتشابهة · 2 احتواء ·
//  1.5 مسافة تحرير صغيرة (تتحمل خطأ OCR بحرف أو حرفين للكلمات الطويلة).
// شرط الطول في الاحتواء يمنع التطابق داخل كتلة MRZ الطويلة.
function matchQuality(word: string, token: string): number {
  if (word === token) return 3;
  if (letterCanon(word) === letterCanon(token)) return 2.5;
  if (token.length >= 3 && word.includes(token) && word.length <= token.length + 3)
    return 2;
  if (word.length >= 3 && token.includes(word) && token.length <= word.length + 3)
    return 2;
  const maxDist = token.length >= 9 ? 2 : token.length >= 5 ? 1 : 0;
  if (
    maxDist > 0 &&
    levenshteinAtMost(letterCanon(word), letterCanon(token), maxDist) <= maxDist
  )
    return 1.5;
  return 0;
}

// هل تطابق كلمة OCR مع رمز من قيمة الحقل بأي مستوى جودة؟
function tokenMatches(word: string, token: string): boolean {
  return matchQuality(word, token) > 0;
}

// تجميع الكلمات في أسطر أفقية: الكلمات على نفس الارتفاع تُجمَّع معًا
function groupLines(words: NormWord[]): NormWord[][] {
  const sorted = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
  const lines: NormWord[][] = [];
  for (const w of sorted) {
    let placed = false;
    for (const line of lines) {
      if (sameLine(w.bbox, line[0].bbox)) {
        line.push(w);
        placed = true;
        break;
      }
    }
    if (!placed) lines.push([w]);
  }
  for (const line of lines) line.sort((a, b) => a.bbox.x0 - b.bbox.x0);
  return lines;
}

// مطابقة سطرية شاملة: نبحث عن قيمة الحقل في نص كل سطر مُجمَّع.
// ثلاث طبقات: تطابق تام ← توحيد الحروف المتشابهة ← مطابقة ضبابية (Levenshtein).
// للتواريخ نجرّب صيغًا متعددة (YYYYMMDD، DDMMYYYY، DD MON YYYY، السنة فقط).
// للقيم القصيرة (< 4 حروف) نشترط محاذاة حدود الكلمات لتجنّب المطابقة الخاطئة.
function locateInLine(
  words: NormWord[],
  value: string,
  isDate = false,
): Box | null {
  const target = norm(value);
  if (target.length < 2) return null;

  // بناء قائمة الأهداف: النص الأصلي + بدائل للتواريخ
  const targets: { text: string; penalty: number }[] = [
    { text: target, penalty: 0 },
  ];
  if (isDate) {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, yr, mo, dy] = m;
      const monName = MONTHS[Number(mo) - 1] ?? "";
      const dyShort = String(Number(dy));
      targets.push({ text: dy + mo + yr, penalty: -0.05 });
      targets.push({ text: dyShort + monName + yr, penalty: -0.05 });
      targets.push({ text: dy + monName + yr, penalty: -0.05 });
      targets.push({ text: yr, penalty: -0.4 });
    }
  }

  const lines = groupLines(words);
  let best: { box: Box; score: number } | null = null;

  for (const line of lines) {
    let lineText = "";
    const wordRanges: { word: NormWord; start: number; end: number }[] = [];
    for (const w of line) {
      const start = lineText.length;
      lineText += w.n;
      wordRanges.push({ word: w, start, end: lineText.length });
    }

    // تخطّي أسطر MRZ (40+ حرفًا)
    if (lineText.length >= 40) continue;

    for (const { text: t, penalty } of targets) {
      if (t.length < 2) continue;

      let matchStart = -1;
      let matchEnd = 0;
      let score = -Infinity;

      // طبقة 1: تطابق تام (بحث فرعي)
      const idx = lineText.indexOf(t);
      if (idx >= 0) {
        matchStart = idx;
        matchEnd = idx + t.length;
        score = t.length / lineText.length + penalty;
      }

      // طبقة 2: توحيد الحروف المتشابهة (0↔O، 1↔I...)
      if (matchStart < 0) {
        const cLine = letterCanon(lineText);
        const cTarget = letterCanon(t);
        const cIdx = cLine.indexOf(cTarget);
        if (cIdx >= 0) {
          matchStart = cIdx;
          matchEnd = cIdx + t.length;
          score = t.length / lineText.length + penalty - 0.15;
        }
      }

      // طبقة 3: مطابقة ضبابية (Levenshtein) — تتحمل أخطاء OCR
      if (matchStart < 0 && t.length >= 4) {
        const maxDist = Math.max(1, Math.floor(t.length * 0.15));
        for (
          let s = 0;
          s + Math.max(2, t.length - maxDist) <= lineText.length;
          s++
        ) {
          for (
            let l = Math.max(2, t.length - maxDist);
            l <= Math.min(lineText.length - s, t.length + maxDist);
            l++
          ) {
            const seg = lineText.slice(s, s + l);
            const d = levenshteinAtMost(seg, t, maxDist);
            if (d <= maxDist) {
              const fs =
                (1 - d / t.length) * (t.length / lineText.length) +
                penalty -
                0.25;
              if (fs > score) {
                matchStart = s;
                matchEnd = s + l;
                score = fs;
              }
            }
          }
        }
      }

      if (matchStart < 0) continue;

      // الكلمات المغطّاة بنطاق المطابقة
      const overlapping = wordRanges.filter(
        (r) => r.start < matchEnd && r.end > matchStart,
      );
      if (overlapping.length === 0) continue;

      // للقيم القصيرة: اشترط محاذاة حدود الكلمات (لكي لا يطابق "UTO" داخل "AUTHORITIES")
      if (t.length < 4) {
        const firstW = overlapping[0];
        const lastW = overlapping[overlapping.length - 1];
        if (matchStart - firstW.start > 1 || lastW.end - matchEnd > 1) continue;
      }

      let box = overlapping[0].word.bbox;
      for (let i = 1; i < overlapping.length; i++) {
        box = union(box, overlapping[i].word.bbox);
      }

      if (!best || score > best.score) best = { box, score };
    }
  }

  return best?.box ?? null;
}

// مطابقة نصية: أطول تسلسل كلمات متتالية على نفس السطر يطابق رموز القيمة
function locateTokens(words: NormWord[], value: string): Box | null {
  const tokens = value
    .split(/\s+/)
    .map(norm)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return null;

  let best: { box: Box; score: number } | null = null;
  for (let i = 0; i < words.length; i++) {
    if (!tokenMatches(words[i].n, tokens[0])) continue;
    let box = words[i].bbox;
    // المطابقة التامة تتقدم على الاحتواء (حتى لا يفوز اسم الدولة في ترويسة الجواز مثلًا)
    let score = words[i].n === tokens[0] ? 1.5 : 1;
    let wi = i + 1;
    for (let ti = 1; ti < tokens.length && wi < words.length; ti++, wi++) {
      if (
        tokenMatches(words[wi].n, tokens[ti]) &&
        sameLine(words[wi].bbox, box)
      ) {
        box = union(box, words[wi].bbox);
        score += words[wi].n === tokens[ti] ? 1.5 : 1;
      } else {
        break;
      }
    }
    if (!best || score > best.score) best = { box, score };
  }
  return best?.box ?? null;
}

// مطابقة تاريخ: القيمة YYYY-MM-DD لكن الجواز يطبعه بصيغ مختلفة (12 AUG 1974، 12/08/1974...)
// نبحث عن كلمة تحتوي السنة، ونفضّل المرشح الذي بجواره (نفس السطر) اليوم أو الشهر.
function locateDate(words: NormWord[], iso: string): Box | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, year, month, day] = m;
  const monthName = MONTHS[Number(month) - 1] ?? "";
  const dayShort = String(Number(day));

  let best: { box: Box; score: number } | null = null;
  for (const w of words) {
    if (!w.n.includes(year) || w.n.length > 12) continue;
    let box = w.bbox;
    let score = 0;
    // الكلمة الواحدة قد تضم التاريخ كاملًا ("12AUG1974")
    if (w.n.includes(monthName) || w.n.includes(day) || w.n.includes(dayShort))
      score += 2;
    for (const other of words) {
      if (other === w || !sameLine(other.bbox, w.bbox)) continue;
      const gap = Math.max(other.bbox.x0 - box.x1, box.x0 - other.bbox.x1);
      const height = box.y1 - box.y0;
      if (gap > height * 4) continue; // بعيدة على نفس السطر — ليست جزء التاريخ
      if (
        other.n === monthName ||
        other.n === day ||
        other.n === dayShort ||
        other.n === month
      ) {
        box = union(box, other.bbox);
        score++;
      }
    }
    if (!best || score > best.score) best = { box, score };
  }
  return best?.box ?? null;
}

/**
 * لكل حقل قيمته المستخرجة، يعيد إطار موضعها على الصورة (بالبكسل) إن وُجد تطابق.
 * الحقول التي لا يُعثر لها على موضع مؤكَّد تُترك بلا إطار — لا نعرض لقطة مضلِّلة.
 */
export function locateFields(
  ocrWords: OcrWord[],
  fields: Record<string, string>
): Record<string, Box> {
  const words: NormWord[] = ocrWords
    .map((w) => ({ n: norm(w.text), bbox: w.bbox }))
    .filter((w) => w.n.length > 0);

  const out: Record<string, Box> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    const isDate = key.startsWith("date_");
    let box: Box | null;
    if (key === "sex") {
      box =
        words.find((w) => w.n === norm(value) && w.n.length <= 2)?.bbox ?? null;
    } else if (isDate) {
      // للتواريخ: locator مخصّص أولًا، ثم سطري بصيغ متعددة، ثم كلمي
      box =
        locateDate(words, value) ??
        locateInLine(words, value, true) ??
        locateTokens(words, value);
    } else {
      // لباقي الحقول: كلمي أولًا، ثم سطري (يتحمل التسميات والفصل/الدمج)
      box =
        locateTokens(words, value) ?? locateInLine(words, value, false);
    }
    if (box) out[key] = box;
  }
  return out;
}
