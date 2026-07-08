// معالجة صورة الجواز قبل Tesseract لرفع دقة تحديد المواقع إلى أقصى حد:
//  1) تكبير إلى ما يعادل ~300 DPI (عاصمة الحروف ≥ 20px) — Tesseract يعمل أفضل بدقة عالية
//  2) تحويل لتدرج رمادي — إزالة ضوضاء اللون
//  3) ثنائية Otsu (أبيض/أسود) — تباين نظيف يسهّل فصل الكلمات
//  4) إطار أبيض — توثيق Tesseract: "missing borders cause problems"
//  5) تقويم الميل البسيط — كشف درجة الانحراف وتصحيحها بـ Hough-like
//
// المرجع: https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html

export interface PreprocessedImage {
  canvas: HTMLCanvasElement;
  scale: number;
  border: number;
  original: ImageBitmap;
}

// تحويل إحداثيات Tesseract (الصورة المعالجة) إلى إحداثيات الصورة الأصلية
export function mapToOriginal(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  scale: number,
  border: number,
): { x0: number; y0: number; x1: number; y1: number } {
  return {
    x0: (bbox.x0 - border) / scale,
    y0: (bbox.y0 - border) / scale,
    x1: (bbox.x1 - border) / scale,
    y1: (bbox.y1 - border) / scale,
  };
}

// كشف زاوية الميل تقريبًا: نحسب فرق ارتفاع أعلى وأسفل الصورة
// إذا كانت الصورة مائلة، نُرجِع الزاوية بالدرجات؛ وإلا 0.
function detectSkewAngle(gray: Uint8ClampedArray, width: number, height: number): number {
  // نقprend عيّنة من 5 صفوف أفقية ونقيس موضع أول/آخر بكسل أسود
  const rows = 5;
  const stepY = Math.floor(height / (rows + 2));
  const angles: number[] = [];

  for (let r = 1; r <= rows; r++) {
    const y = r * stepY;
    if (y >= height) continue;

    // أول وآخر بكسل داكن في هذا الصف
    let firstX = -1;
    let lastX = -1;
    for (let x = 0; x < width; x++) {
      if (gray[y * width + x] < 128) {
        if (firstX < 0) firstX = x;
        lastX = x;
      }
    }
    if (firstX < 0 || lastX < 0) continue;

    // قارن مع الصف التالي
    const y2 = Math.min(y + stepY, height - 1);
    let firstX2 = -1;
    for (let x = 0; x < width; x++) {
      if (gray[y2 * width + x] < 128) {
        firstX2 = x;
        break;
      }
    }
    if (firstX2 < 0) continue;

    const dy = y2 - y;
    const dx = firstX2 - firstX;
    if (Math.abs(dx) > 2 && Math.abs(dx) < dy * 0.3) {
      angles.push(Math.atan2(dx, dy) * (180 / Math.PI));
    }
  }

  if (angles.length === 0) return 0;
  // وسيط القيم (أكثر устойчивًا من المتوسط)
  angles.sort((a, b) => a - b);
  return angles[Math.floor(angles.length / 2)];
}

export async function preprocessForOcr(
  file: File,
): Promise<PreprocessedImage> {
  const bmp = await createImageBitmap(file);

  // 1) عامل التكبير: نستهدف أطول ضلع ≥ 2500px (ما يعامل ~300 DPI لجواز)
  const targetLong = 2500;
  const scale = Math.max(1, targetLong / Math.max(bmp.width, bmp.height));

  // 2) إطار أبيض (Tesseract: "missing borders cause problems")
  const border = 40;

  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const fullW = w + border * 2;
  const fullH = h + border * 2;

  const canvas = document.createElement("canvas");
  canvas.width = fullW;
  canvas.height = fullH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  // خلفية بيضاء (الإطار)
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, fullW, fullH);

  // رسم الصورة مكبّرة بجودة عالية
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, border, border, w, h);

  // 3) تدرج رمادي
  const imgData = ctx.getImageData(border, border, w, h);
  const pixels = imgData.data;
  const gray = new Uint8ClampedArray(w * h);

  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    gray[j] = Math.round(
      0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2],
    );
  }

  // 4) كشف الميل وتصحيحه (إذا كان > 0.5 درجة)
  const skewAngle = detectSkewAngle(gray, w, h);
  if (Math.abs(skewAngle) > 0.5) {
    // أعد الرسم مع تدوير بسيط
    const tmp = document.createElement("canvas");
    tmp.width = fullW;
    tmp.height = fullH;
    const tmpCtx = tmp.getContext("2d")!;
    tmpCtx.fillStyle = "white";
    tmpCtx.fillRect(0, 0, fullW, fullH);
    tmpCtx.translate(fullW / 2, fullH / 2);
    tmpCtx.rotate((-skewAngle * Math.PI) / 180);
    tmpCtx.drawImage(canvas, -fullW / 2, -fullH / 2);
    // انسخ النتيجة
    ctx.clearRect(0, 0, fullW, fullH);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, fullW, fullH);
    ctx.drawImage(tmp, 0, 0);

    // أعد قراءة البيانات الرمادية بعد التصحيح
    const newData = ctx.getImageData(border, border, w, h);
    const newPixels = newData.data;
    for (let i = 0, j = 0; i < newPixels.length; i += 4, j++) {
      gray[j] = Math.round(
        0.299 * newPixels[i] +
          0.587 * newPixels[i + 1] +
          0.114 * newPixels[i + 2],
      );
    }
    // حدّث pixels أيضًا
    for (let i = 0; i < newPixels.length; i++) pixels[i] = newPixels[i];
  }

  // 5) ثنائية Otsu (أبيض/أسود)
  const hist = new Array(256).fill(0);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

  const total = gray.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 128;

  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += i * hist[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const betweenVar = wB * wF * (mB - mF) * (mB - mF);
    if (betweenVar > maxVar) {
      maxVar = betweenVar;
      threshold = i;
    }
  }

  // تطبيق الثنائية على pixels
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    const v = gray[j] > threshold ? 255 : 0;
    pixels[i] = v;
    pixels[i + 1] = v;
    pixels[i + 2] = v;
    // alpha يبقى 255
  }

  ctx.putImageData(imgData, border, border);

  return { canvas, scale, border, original: bmp };
}
