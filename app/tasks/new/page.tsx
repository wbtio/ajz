"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  Upload,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Pen,
  Scissors,
  RefreshCw,
  Square,
  Pencil,
  MousePointerClick,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const mainPages = [
  { value: "site", label: "الموقع" },
  { value: "dashboard", label: "لوحة التحكم (للمدير)" },
];

const siteSubPages = [
  { value: "home", label: "الصفحة الرئيسية (Home)" },
  { value: "header", label: "الهيدر (Header)" },
  { value: "footer", label: "الفوتر (Footer)" },
  { value: "events", label: "صفحة الفعاليات" },
  { value: "about", label: "من نحن" },
  { value: "contact", label: "تواصل معنا" },
  { value: "blog", label: "المدونة" },
  { value: "partners", label: "الشراكات" },
  { value: "training", label: "التدريب" },
  { value: "sectors", label: "القطاعات" },
  { value: "calendar", label: "التقويم" },
  { value: "links", label: "روابط مهمة" },
  { value: "other", label: "صفحة أخرى" },
];

const dashboardSubPages = [
  { value: "dash_home", label: "الرئيسية" },
  { value: "dash_events", label: "الفعاليات" },
  { value: "dash_blog", label: "المدونة" },
  { value: "dash_links", label: "الروابط" },
  { value: "dash_sectors", label: "القطاعات" },
  { value: "dash_partners", label: "الشراكات" },
  { value: "dash_training", label: "التدريب" },
  { value: "dash_messages", label: "الرسائل" },
  { value: "dash_users", label: "المستخدمين" },
  { value: "dash_registrations", label: "التسجيلات" },
  { value: "dash_analytics", label: "التحليلات" },
  { value: "dash_settings", label: "الإعدادات" },
  { value: "other", label: "صفحة أخرى" },
];

const modificationTypes = [
  { value: "text", label: "تعديل نص" },
  { value: "design", label: "تعديل تصميم" },
  { value: "image", label: "تعديل صورة" },
  { value: "length", label: "تعديل طول" },
  { value: "shape", label: "تعديل شكل" },
  { value: "color", label: "تعديل لون" },
  { value: "position", label: "تعديل موضع" },
  { value: "other", label: "أخرى" },
];

interface AnnotationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FreehandStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export default function NewTaskPage() {
  const [page, setPage] = useState("");
  const [subPage, setSubPage] = useState("");
  const [subPageOther, setSubPageOther] = useState("");
  const [modificationType, setModificationType] = useState("");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<"rect" | "free">("rect");
  const [annotation, setAnnotation] = useState<AnnotationRect | null>(null);
  const [freehandStrokes, setFreehandStrokes] = useState<FreehandStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setAnnotation(null);
      setFreehandStrokes([]);
      setCurrentStroke([]);
      setCroppedPreview(null);
    };
    reader.readAsDataURL(file);
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagePreview) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw freehand strokes
      freehandStrokes.forEach((stroke) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        stroke.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      });

      // Draw current stroke
      if (currentStroke.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        currentStroke.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }

      // Draw rectangle annotation
      if (annotation) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 4;
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
      }
    };
    img.src = imagePreview;
  }, [imagePreview, annotation, freehandStrokes, currentStroke]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!imagePreview) return;
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);

    if (drawMode === "free") {
      setCurrentStroke([coords]);
    } else {
      startPos.current = coords;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !imagePreview) return;
    e.preventDefault();
    const coords = getCanvasCoordinates(e);

    if (drawMode === "free") {
      setCurrentStroke((prev) => [...prev, coords]);
    } else if (startPos.current) {
      const rect = {
        x: Math.min(startPos.current.x, coords.x),
        y: Math.min(startPos.current.y, coords.y),
        width: Math.abs(coords.x - startPos.current.x),
        height: Math.abs(coords.y - startPos.current.y),
      };
      // Temporary rect drawing handled by drawCanvas via state
      setAnnotation(rect);
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !imagePreview) return;
    e.preventDefault();
    setIsDrawing(false);
    const coords = getCanvasCoordinates(e);

    if (drawMode === "free") {
      if (currentStroke.length > 2) {
        setFreehandStrokes((prev) => [
          ...prev,
          { points: [...currentStroke, coords], color: "#ef4444", width: 3 },
        ]);
      }
      setCurrentStroke([]);
    } else if (startPos.current) {
      const rect = {
        x: Math.min(startPos.current.x, coords.x),
        y: Math.min(startPos.current.y, coords.y),
        width: Math.abs(coords.x - startPos.current.x),
        height: Math.abs(coords.y - startPos.current.y),
      };
      if (rect.width > 10 && rect.height > 10) {
        setAnnotation(rect);
      } else {
        setAnnotation(null);
      }
      startPos.current = null;
    }
  };

  const cropSelection = () => {
    if (!annotation || !canvasRef.current || !imagePreview) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = annotation.width;
    canvas.height = annotation.height;

    const img = new Image();
    img.onload = () => {
      // 1. Draw the image section
      ctx.drawImage(
        img,
        annotation.x,
        annotation.y,
        annotation.width,
        annotation.height,
        0,
        0,
        annotation.width,
        annotation.height
      );

      // 2. Draw freehand strokes that fall inside the crop region
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      freehandStrokes.forEach((stroke) => {
        const pointsInRegion = stroke.points.filter(
          (p) =>
            p.x >= annotation.x &&
            p.x <= annotation.x + annotation.width &&
            p.y >= annotation.y &&
            p.y <= annotation.y + annotation.height
        );
        if (pointsInRegion.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        pointsInRegion.forEach((p, i) => {
          const cx = p.x - annotation.x;
          const cy = p.y - annotation.y;
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
      });

      // 3. Draw the red border
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, annotation.width, annotation.height);

      setCroppedPreview(canvas.toDataURL("image/png"));
    };
    img.src = imagePreview;
  };

  const clearAnnotation = () => {
    setAnnotation(null);
    setFreehandStrokes([]);
    setCurrentStroke([]);
    setCroppedPreview(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnnotation(null);
    setFreehandStrokes([]);
    setCurrentStroke([]);
    setCroppedPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page || !subPage || !modificationType || !description.trim()) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const subPageLabel =
        subPage === "other"
          ? subPageOther || "صفحة أخرى"
          : (
              (page === "site" ? siteSubPages : dashboardSubPages).find(
                (p) => p.value === subPage
              )?.label || subPage
            );

      const fullDescription = `الصفحة: ${subPageLabel}\n\n${description.trim()}`;

      const body: Record<string, unknown> = {
        page: page === "site" ? "الموقع" : "لوحة التحكم",
        modification_type: modificationType === "other" ? customType || "أخرى" : modificationType,
        description: fullDescription,
      };

      if (imageUrl) body.image_url = imageUrl;
      if (annotation) body.image_annotation = annotation;
      if (freehandStrokes.length > 0) body.image_annotation = { strokes: freehandStrokes, rect: annotation };

      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSubmitted(true);
        setPage("");
        setSubPage("");
        setSubPageOther("");
        setModificationType("");
        setCustomType("");
        setDescription("");
        clearImage();
      } else {
        alert("حدث خطأ أثناء إرسال الطلب");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="mb-2 text-2xl font-black text-stone-950">
            تم إرسال الطلب بنجاح!
          </h2>
          <p className="mb-8 text-stone-500">
            سيتم مراجعة طلبك ومعالجته في أقرب وقت
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white hover:bg-blue-700 transition-colors"
            >
              إرسال طلب آخر
            </button>
            <Link
              href="/tasks"
              className="w-full rounded-2xl border border-stone-200 bg-white px-6 py-4 text-base font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              العودة للمهام
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/tasks"
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 shadow-sm hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Link>
          <h1 className="text-2xl font-black text-stone-950">
            طلب تعديل جديد
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-white p-6 md:p-8 shadow-xl"
        >
          <div className="space-y-4">
            <label className="block text-base font-bold text-stone-800">
              الصفحة <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mainPages.map((p: { value: string; label: string }) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPage(p.value)}
                  className={`rounded-2xl border-2 px-5 py-4 text-base font-bold transition-all ${
                    page === p.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {page && (
            <div className="space-y-3">
              <label className="block text-base font-bold text-stone-800">
                الصفحة الفرعية <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={subPage}
                  onChange={(e) => {
                    setSubPage(e.target.value);
                    setSubPageOther("");
                  }}
                  className="w-full appearance-none rounded-2xl border-2 border-stone-200 bg-white p-4 pr-10 text-base font-medium text-stone-800 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">اختر الصفحة...</option>
                  {(page === "site" ? siteSubPages : dashboardSubPages).map(
                    (sp: { value: string; label: string }) => (
                      <option key={sp.value} value={sp.value}>
                        {sp.label}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              </div>

              {subPage === "other" && (
                <input
                  type="text"
                  value={subPageOther}
                  onChange={(e) => setSubPageOther(e.target.value)}
                  placeholder="اكتب اسم الصفحة..."
                  className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 text-base text-stone-800 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                  required
                />
              )}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-base font-bold text-stone-800">
              نوع التعديل <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {modificationTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setModificationType(t.value)}
                  className={`rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-all ${
                    modificationType === t.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {modificationType === "other" && (
            <div className="space-y-3">
              <label className="block text-base font-bold text-stone-800">
                نوع التعديل المخصص <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="مثلا: تعديل خط، تعديل مسافة، إلخ..."
                className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 text-base text-stone-800 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                required={modificationType === "other"}
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-base font-bold text-stone-800">
              وصف التعديل <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح التعديل المطلوب بالتفصيل..."
              rows={5}
              className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 text-base text-stone-800 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-base font-bold text-stone-800">
              صورة (اختياري)
            </label>
            {!imagePreview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-10 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
                <Upload className="h-10 w-10 text-stone-400" />
                <span className="text-base font-semibold text-stone-600">
                  اضغط لرفع صورة أو اسحبها هنا
                </span>
                <span className="text-xs text-stone-400">
                  PNG, JPG, GIF حتى 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-stone-200">
                  <div
                    ref={containerRef}
                    className="relative cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  >
                    <canvas
                      ref={canvasRef}
                      className="h-auto w-full"
                      style={{ touchAction: "none" }}
                    />
                  </div>
                  {annotation && (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
                      تم التحديد - اضغط قص للمعاينة
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl border border-stone-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDrawMode("rect")}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                        drawMode === "rect"
                          ? "bg-blue-50 text-blue-700"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <Square className="h-3.5 w-3.5" />
                      مستطيل
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawMode("free")}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                        drawMode === "free"
                          ? "bg-blue-50 text-blue-700"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      حر
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearAnnotation}
                    className="flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    مسح الرسم
                  </button>
                  <button
                    type="button"
                    onClick={cropSelection}
                    className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Scissors className="h-4 w-4" />
                    قص التحديد
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف الصورة
                  </button>
                </div>

                {croppedPreview && (
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="mb-2 text-sm font-bold text-stone-700">
                      المعاينة المقطعة:
                    </p>
                    <img
                      src={croppedPreview}
                      alt="Cropped selection"
                      className="max-h-60 rounded-xl border border-stone-200"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  <MousePointerClick className="h-4 w-4 shrink-0" />
                  {drawMode === "rect"
                    ? "ارسم مستطيل على الصورة للتحديد. ثم اضغط \"قص التحديد\"."
                    : "ارسم بالقلم بحرية على الصورة للتوضيح."}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !page || !subPage || !modificationType || !description.trim()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  إرسال الطلب
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
