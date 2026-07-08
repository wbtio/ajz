// قصّ لقطة عالية الدقة من صورة الجواز لكل حقل — يُستخدم في قارئ الجوازات المستقل
// وفي مراجعة الذكاء الاصطناعي لتسجيلات الفعاليات على حدٍّ سواء:
// 1) معالجة الصورة (تكبير + تدرج رمادي + ثنائية + إطار + تقويم ميل) قبل Tesseract
// 2) Tesseract بـ PSM.SPARSE_TEXT ودقة 300 DPI وحفظ المسافات
// 3) إحداثيات Tesseract تُربَط بإحداثيات الصورة الأصلية (إزالة الإطار ÷ عامل التكبير)
// 4) القصّ من الصورة الأصلية بدقة عالية (تكبير 4× + تنعيم عالي الجودة)
import { locateFields, type OcrWord } from "@/lib/passport-locate";
import { preprocessForOcr, mapToOriginal } from "@/lib/passport-preprocess";

export async function makePassportCrops(
  file: File,
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const crops: Record<string, string> = {};
  let bmp: ImageBitmap | undefined;
  try {
    const preprocessed = await preprocessForOcr(file);
    const { canvas: procCanvas, scale, border } = preprocessed;
    bmp = preprocessed.original;

    const { createWorker, PSM } = await import("tesseract.js");
    const worker = await createWorker("eng");
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });
    const { data } = await worker.recognize(procCanvas, {}, { blocks: true });
    await worker.terminate();

    const words: OcrWord[] = (data.blocks ?? []).flatMap((b) =>
      b.paragraphs.flatMap((p) =>
        p.lines.flatMap((l) =>
          l.words.map((w) => ({
            text: w.text,
            bbox: mapToOriginal(w.bbox, scale, border),
          })),
        ),
      ),
    );
    const boxes = locateFields(words, fields);

    for (const [key, box] of Object.entries(boxes)) {
      // هامش سخيّ: يُظهر الحقل بسياقه (تسمية الحقل + القيمة)
      const h = box.y1 - box.y0;
      const padX = h * 1.5;
      const padY = h * 0.6;
      const sx = Math.max(0, box.x0 - padX);
      const sy = Math.max(0, box.y0 - padY);
      const sw = Math.min(bmp.width, box.x1 + padX) - sx;
      const sh = Math.min(bmp.height, box.y1 + padY) - sy;
      if (sw < 8 || sh < 8) continue;

      const canvas = document.createElement("canvas");
      const cropScale = Math.min(4, 800 / sw);
      canvas.width = Math.round(sw * cropScale);
      canvas.height = Math.round(sh * cropScale);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      crops[key] = canvas.toDataURL("image/jpeg", 0.92);
    }
  } catch {
    // اللقطات ميزة مساعدة — فشلها لا يعطّل القراءة نفسها
  } finally {
    bmp?.close();
  }
  return crops;
}
