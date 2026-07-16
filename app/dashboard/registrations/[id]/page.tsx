"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Upload,
  ExternalLink,
  Clock,
  CheckCircle2,
  Loader2,
  Paperclip,
  StickyNote,
  User,
  Sparkles,
  History,
  Pencil,
  Wallet,
  IdCard,
  Building2,
  CalendarClock,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { makePassportCrops } from "@/lib/passport-crops";

// ─── Types ───────────────────────────────────────────────
interface SelectedService {
  key: string;
  label: string;
  amount: number;
  meta?: Record<string, string>;
}

interface Registration {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string | null;
  notes: string | null;
  form_data: Record<string, unknown> | null;
  additional_data: Record<string, unknown> | null;
  documents: unknown[] | null;
  created_at: string | null;
  updated_at: string | null;
  selected_services: SelectedService[];
  total_amount: number;
  payment_status: string | null;
}

interface EmbassyRequirement {
  key: string;
  label: string;
  done: boolean;
}

interface EmbassyApplication {
  platform: "TLS" | "VFS" | null;
  reference_number: string;
  appointment_date: string;
  appointment_time: string;
  requirements: EmbassyRequirement[];
  status?: string;
}

const DEFAULT_EMBASSY_APPLICATION: EmbassyApplication = {
  platform: null,
  reference_number: "",
  appointment_date: "",
  appointment_time: "",
  status: "pending",
  requirements: [
    { key: "flight", label: "حجز تذاكر الطيران", done: false },
    { key: "hotel", label: "حجز الفندق", done: false },
  ],
};

type WorkflowStage =
  | "new"
  | "contacted"
  | "documents_requested"
  | "documents_received"
  | "approved"
  | "rejected"
  | "completed";

const STAGES: { key: WorkflowStage; label: string; color: string }[] = [
  { key: "new", label: "جديد", color: "bg-slate-500" },
  { key: "contacted", label: "تم التواصل", color: "bg-blue-500" },
  { key: "documents_requested", label: "طلبت الوثائق", color: "bg-amber-500" },
  { key: "documents_received", label: "استلمت الوثائق", color: "bg-purple-500" },
  { key: "approved", label: "مقبول", color: "bg-emerald-500" },
  { key: "completed", label: "مكتمل", color: "bg-emerald-600" },
  { key: "rejected", label: "مرفوض", color: "bg-red-500" },
];

interface TimelineEntry {
  id: string;
  type: "note" | "status_change" | "file" | "edit";
  content: string;
  oldStatus?: string;
  newStatus?: string;
  fileName?: string;
  fileLink?: string;
  created_at: string;
}

interface RegistrationEdit {
  id: string;
  field_key: string;
  field_label: string | null;
  old_value: string | null;
  new_value: string | null;
  edited_by: string;
  created_at: string;
}

interface LinkedAppointment {
  id: string;
  slot_date: string;
  slot_time: string;
  status: string;
  visa_centers: { name: string; city: string } | null;
}

// ─── Helpers ─────────────────────────────────────────────
function extractPhones(data: Record<string, unknown>): string[] {
  const phones: string[] = [];
  for (const val of Object.values(data)) {
    const str = String(val).replace(/\s/g, "");
    if (/^[\+]?[0-9]{8,15}$/.test(str) || /^0[0-9]{9,11}$/.test(str)) {
      phones.push(String(val));
    }
  }
  return phones;
}

function formatFieldKey(key: string): string {
  const match = key.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) return `${formatFieldKey(match[1])} (${match[2]})`;

  const map: Record<string, string> = {
    company_name: "الشركة", company: "الشركة", companyName: "الشركة",
    job_title: "المسمى الوظيفي", jobTitle: "المسمى الوظيفي", position: "المسمى الوظيفي",
    passport_number: "رقم الجواز", passportNumber: "رقم الجواز", passport: "رقم الجواز",
    nationality: "الجنسية",
    date_of_birth: "تاريخ الميلاد", dateOfBirth: "تاريخ الميلاد", dob: "تاريخ الميلاد",
    date_of_expiry: "تاريخ انتهاء الجواز", dateOfExpiry: "تاريخ انتهاء الجواز",
    sex: "الجنس", gender: "الجنس",
    notes: "الملاحظات", note: "الملاحظات",
    full_name: "الاسم الكامل", fullName: "الاسم الكامل", name: "الاسم الكامل",
    email: "البريد الإلكتروني", phone: "رقم الهاتف", sector: "القطاع",
    given_names: "الاسم الأول", surname: "اللقب / العائلة", issuing_country: "بلد الإصدار",
  };
  if (map[key]) return map[key];
  return key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim().replace(/^\w/, (c) => c.toUpperCase());
}

function money(n: number | null | undefined): string {
  if (!n || n <= 0) return "مجاني";
  return `${n.toLocaleString("ar")} د.ع`;
}

// كل استمارة/مستند يضيف حقوله بلاحقة "(اسم المستند)" — نجمعها في مجموعات منفصلة
// بدل عرضها كقائمة واحدة مندمجة يصعب تمييز مصدر كل قيمة فيها.
interface FormGroup {
  title: string | null;
  entries: [string, unknown][];
}

function groupFormEntries(entries: [string, unknown][]): FormGroup[] {
  const suffixRe = /^(.+?)\s*\((.+?)\)$/;
  const general: [string, unknown][] = [];
  const groups = new Map<string, [string, unknown][]>();

  for (const entry of entries) {
    const match = entry[0].match(suffixRe);
    if (match) {
      const groupKey = match[2];
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push(entry);
    } else {
      general.push(entry);
    }
  }

  const result: FormGroup[] = [];
  if (general.length) result.push({ title: null, entries: general });
  for (const [title, groupEntries] of groups) result.push({ title, entries: groupEntries });
  return result;
}

// عنوان المجموعة يظهر مرة واحدة في رأسها — لا داعي لتكراره داخل كل سطر
function stripGroupSuffix(key: string, title: string | null): string {
  if (!title) return key;
  const suffix = ` (${title})`;
  return key.endsWith(suffix) ? key.slice(0, -suffix.length) : key;
}

function mapStatusToStage(status: string | null): string {
  if (!status) return "new";
  const map: Record<string, string> = {
    pending: "new", confirmed: "approved", approved: "approved",
    rejected: "rejected", cancelled: "rejected", completed: "completed",
  };
  return map[status] || "new";
}

// ─── Component ───────────────────────────────────────────
export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [currentStage, setCurrentStage] = useState<string>("new");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [scanningPath, setScanningPath] = useState<string | null>(null);
  const [scanningDocName, setScanningDocName] = useState<string>("");
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [ocrCrops, setOcrCrops] = useState<Record<string, string>>({});
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [edits, setEdits] = useState<RegistrationEdit[]>([]);
  const [embassy, setEmbassy] = useState<EmbassyApplication>(DEFAULT_EMBASSY_APPLICATION);
  const [newRequirement, setNewRequirement] = useState("");
  const [linkedAppointment, setLinkedAppointment] = useState<LinkedAppointment | null>(null);

  const supabase = createClient();

  // ─── Load Registration ─────────────────────────────────
  const loadRegistration = useCallback(async () => {
    const { data } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!data) { setLoading(false); return; }

    // الموقع الإلكتروني يحفظ في additional_data، التطبيق في form_data
    const additionalData = (data.additional_data as Record<string, unknown>) || {};
    const formData = (data.form_data as Record<string, unknown>) || {};
    const hasWebsiteFields = Object.keys(additionalData).length > 0 &&
      !Object.keys(additionalData).every((k) => /^field_\d+$/.test(k));
    const mergedData = hasWebsiteFields
      ? { ...additionalData, ...formData }
      : { ...formData, ...additionalData };

    setReg({
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      status: data.status || "pending",
      notes: data.notes || "",
      form_data: mergedData,
      additional_data: additionalData,
      documents: (data.documents as any[]) || null,
      created_at: data.created_at,
      updated_at: data.updated_at,
      selected_services: (data.selected_services as SelectedService[] | null) || [],
      total_amount: data.total_amount || 0,
      payment_status: data.payment_status || "pending",
    });
    setCurrentStage(mapStatusToStage(data.status));

    const savedEmbassy = data.embassy_application as EmbassyApplication | null;
    setEmbassy(
      savedEmbassy
        ? { ...DEFAULT_EMBASSY_APPLICATION, ...savedEmbassy }
        : DEFAULT_EMBASSY_APPLICATION
    );

    // سجل التعديلات — يبقى دائمًا حتى بعد تحديث الصفحة (بعكس التايملاين الجلسة السابق)
    const [editsResult, appointmentResult] = await Promise.all([
      supabase.from("registration_edits").select("*").eq("registration_id", id).order("created_at", { ascending: false }),
      supabase.from("visa_availability_slots").select("id, slot_date, slot_time, status, visa_centers(name, city)").eq("assigned_registration_id", id).order("slot_date", { ascending: true }).order("slot_time", { ascending: true }).limit(1).maybeSingle(),
    ]);
    const editRows = editsResult.data;
    setLinkedAppointment((appointmentResult.data as LinkedAppointment | null) || null);
    const loadedEdits = (editRows as RegistrationEdit[] | null) || [];
    setEdits(loadedEdits);
    setTimeline(
      loadedEdits.map((e) => ({
        id: e.id,
        type: "edit",
        content: `تعديل المستخدم — ${e.field_label || formatFieldKey(e.field_key)}: "${e.old_value || "—"}" ← "${e.new_value || "—"}"`,
        created_at: e.created_at,
      }))
    );

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { loadRegistration(); }, [loadRegistration]);

  // ─── Actions ─────────────────────────────────────────
  async function addNote() {
    if (!note.trim() || !reg) return;
    setSavingNote(true);
    const ts = new Date().toISOString();
    const noteText = note.trim();

    const existingNotes = reg.notes || "";
    const newNotes = existingNotes
      ? `${existingNotes}\n---\n[${ts}] ${noteText}`
      : `[${ts}] ${noteText}`;
    const { error } = await supabase.from("registrations")
      .update({ notes: newNotes, updated_at: ts }).eq("id", reg.id);
    if (error) {
      alert("تعذّر حفظ الملاحظة. حاول مرة أخرى.");
      setSavingNote(false);
      return;
    }

    const entry: TimelineEntry = {
      id: crypto.randomUUID(), type: "note", content: noteText, created_at: ts,
    };
    setTimeline((prev) => [entry, ...prev]);
    setReg((prev) => (prev ? { ...prev, notes: newNotes } : prev));
    setNote("");
    setSavingNote(false);
  }

  async function changeStage(newStage: WorkflowStage) {
    if (!reg) return;
    const oldStage = currentStage;
    const dbStatus = newStage === "approved" ? "confirmed"
      : newStage === "rejected" ? "rejected"
      : newStage === "completed" ? "completed"
      : "pending";
    const ts = new Date().toISOString();

    const { error } = await supabase.from("registrations")
      .update({ status: dbStatus, updated_at: ts }).eq("id", reg.id);
    if (error) {
      alert("تعذّر تحديث مرحلة المعالجة. حاول مرة أخرى.");
      return;
    }

    setCurrentStage(newStage);
    setReg((prev) => (prev ? { ...prev, status: dbStatus, updated_at: ts } : prev));
    const entry: TimelineEntry = {
      id: crypto.randomUUID(), type: "status_change",
      content: `تغيير الحالة: ${STAGES.find((s) => s.key === oldStage)?.label || oldStage} → ${STAGES.find((s) => s.key === newStage)?.label}`,
      oldStatus: oldStage, newStatus: newStage, created_at: ts,
    };
    setTimeline((prev) => [entry, ...prev]);
  }

  async function togglePayment() {
    if (!reg) return;
    const newStatus = reg.payment_status === "paid" ? "pending" : "paid";
    const ts = new Date().toISOString();
    const { error } = await supabase.from("registrations")
      .update({ payment_status: newStatus, updated_at: ts }).eq("id", reg.id);
    if (error) {
      alert("تعذّر تحديث حالة الدفع. حاول مرة أخرى.");
      return;
    }
    setReg((prev) => (prev ? { ...prev, payment_status: newStatus } : prev));
    setTimeline((prev) => [{
      id: crypto.randomUUID(), type: "status_change",
      content: newStatus === "paid" ? "تم تحديد الدفع كمكتمل" : "تم إلغاء تحديد الدفع كمكتمل",
      created_at: ts,
    }, ...prev]);
  }

  async function saveEmbassy(next: EmbassyApplication, logMessage?: string) {
    if (!reg) return;
    const ts = new Date().toISOString();
    const prevEmbassy = embassy;
    setEmbassy(next);
    const { error } = await supabase.from("registrations")
      .update({ embassy_application: next as any, updated_at: ts }).eq("id", reg.id);
    if (error) {
      alert("تعذّر حفظ بيانات طلب السفارة. حاول مرة أخرى.");
      setEmbassy(prevEmbassy);
      return;
    }
    if (logMessage) {
      setTimeline((prev) => [{
        id: crypto.randomUUID(), type: "status_change", content: logMessage, created_at: ts,
      }, ...prev]);
    }
  }

  function setEmbassyPlatform(platform: "TLS" | "VFS") {
    const next = { ...embassy, platform: embassy.platform === platform ? null : platform };
    saveEmbassy(next, `تم تحديد منصة طلب السفارة: ${platform}`);
  }

  function setEmbassyReference(reference_number: string) {
    setEmbassy((prev) => ({ ...prev, reference_number }));
  }

  function setEmbassyAppointment(field: "appointment_date" | "appointment_time", value: string) {
    setEmbassy((prev) => ({ ...prev, [field]: value }));
  }

  function commitEmbassyDetails() {
    saveEmbassy(embassy, "تم تحديث تفاصيل طلب السفارة والموعد");
  }

  function toggleRequirement(key: string) {
    const next = {
      ...embassy,
      requirements: embassy.requirements.map((r) =>
        r.key === key ? { ...r, done: !r.done } : r
      ),
    };
    const target = next.requirements.find((r) => r.key === key);
    saveEmbassy(next, `${target?.label}: ${target?.done ? "مكتمل" : "غير مكتمل"}`);
  }

  function addRequirement() {
    const label = newRequirement.trim();
    if (!label) return;
    const next = {
      ...embassy,
      requirements: [...embassy.requirements, { key: crypto.randomUUID(), label, done: false }],
    };
    saveEmbassy(next, `تمت إضافة متطلب جديد: ${label}`);
    setNewRequirement("");
  }

  function removeRequirement(key: string) {
    const target = embassy.requirements.find((r) => r.key === key);
    const next = { ...embassy, requirements: embassy.requirements.filter((r) => r.key !== key) };
    saveEmbassy(next, target ? `تمت إزالة المتطلب: ${target.label}` : undefined);
  }

  async function scanStoredPassport(path: string, docName: string) {
    setScanningPath(path);
    setScanningDocName(docName);
    setOcrCrops({});
    try {
      const res = await fetch(`/api/passport-ocr/scan-stored?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);
        setShowOcrModal(true);

        // لقطات مرجعية لكل حقل من الصورة نفسها — للتدقيق البصري قبل الاعتماد على القراءة الآلية
        if (/\.(jpe?g|png)$/i.test(path) && data.fields) {
          try {
            const imgRes = await fetch(`/api/documents/view?path=${encodeURIComponent(path)}`);
            const blob = await imgRes.blob();
            const file = new File([blob], docName, { type: blob.type || "image/jpeg" });
            setOcrCrops(await makePassportCrops(file, data.fields));
          } catch {
            // اللقطات ميزة مساعدة فقط — تجاهل فشلها
          }
        }
      } else {
        alert("تعذّر قراءة الجواز. يرجى التأكد من وضوح الصورة وتجربة مستند آخر.");
      }
    } catch {
      alert("حدث خطأ أثناء فحص الجواز.");
    }
    setScanningPath(null);
  }

  async function applyOcrFields(fields: Record<string, string>, docName: string) {
    if (!reg) return;
    const ts = new Date().toISOString();
    const cleanDocName = docName.replace(/\.[^/.]+$/, "");
    const existing = (reg.form_data || {}) as Record<string, unknown>;
    const updatedData = {
      ...existing,
      [`الاسم الأول (${cleanDocName})`]: fields.given_names || "",
      [`اللقب / العائلة (${cleanDocName})`]: fields.surname || "",
      [`رقم الجواز (${cleanDocName})`]: fields.passport_number || "",
      [`تاريخ الميلاد (${cleanDocName})`]: fields.date_of_birth || "",
      [`تاريخ الانتهاء (${cleanDocName})`]: fields.date_of_expiry || "",
      [`الجنسية (${cleanDocName})`]: fields.nationality || "",
      [`بلد الإصدار (${cleanDocName})`]: fields.issuing_country || "",
    };
    const { error } = await supabase.from("registrations")
      .update({ form_data: updatedData as any, updated_at: ts }).eq("id", reg.id);
    if (!error) {
      setReg((prev) => (prev ? { ...prev, form_data: updatedData } : prev));
      setTimeline((prev) => [{
        id: crypto.randomUUID(), type: "status_change",
        content: `تم تحليل المستند (${cleanDocName}) وتحديث الاستمارة تلقائياً بنجاح`,
        created_at: ts,
      }, ...prev]);
      setShowOcrModal(false);
    } else {
      alert("تعذّر تحديث بيانات الاستمارة في قاعدة البيانات.");
    }
  }

  async function uploadDocument(file: File) {
    if (!reg) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${reg.id}/${Date.now()}.${ext}`;
      const { data: storageData, error: upError } = await supabase.storage
        .from("registration-documents")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upError) throw upError;

      const newDoc = { name: file.name, path: storageData.path, uploadedAt: new Date().toISOString() };
      const updatedDocs = [...(reg.documents || []), newDoc];
      const ts = new Date().toISOString();

      await supabase.from("registrations")
        .update({ documents: updatedDocs as any, updated_at: ts }).eq("id", reg.id);
      setReg((prev) => (prev ? { ...prev, documents: updatedDocs } : prev));

      setTimeline((prev) => [{
        id: crypto.randomUUID(), type: "file",
        content: `تم رفع وثيقة جديدة: ${file.name}`,
        fileName: file.name,
        fileLink: `/api/documents/view?path=${encodeURIComponent(storageData.path)}`,
        created_at: ts,
      }, ...prev]);
    } catch (err) {
      console.error("Document upload error:", err);
      alert("تعذّر رفع الوثيقة.");
    }
    setUploading(false);
  }

  // ─── Loading / Not Found ──────────────────────────────
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-slate-500">لم يُعثر على التسجيل</p>
        <Button variant="outline" onClick={() => router.back()}>رجوع</Button>
      </div>
    );
  }

  const phones = extractPhones(reg.form_data || {});
  // نستبعد القيم المعروضة أصلًا في بطاقة "بيانات التواصل" لتفادي التكرار
  const contactValues = new Set<string>([reg.email, ...phones].filter(Boolean) as string[]);
  const formDataEntries = Object.entries(reg.form_data || {})
    .filter(([, v]) => v !== "" && v != null)
    .filter(([, v]) => !contactValues.has(String(v)));
  const formGroups = groupFormEntries(formDataEntries);
  const documents = (reg.documents as any[]) || [];

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowRight className="h-4 w-4" />
          رجوع
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate">{reg.full_name || "بدون اسم"}</h1>
          <p className="text-xs text-slate-500">متابعة عملية التسجيل — {reg.id.substring(0, 8)}</p>
        </div>
        <Badge
          className={cn(
            "border",
            currentStage === "approved" || currentStage === "completed"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : currentStage === "rejected"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          {STAGES.find((s) => s.key === currentStage)?.label || currentStage}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* ── Left column: stage + contact + form data + documents + payment ── */}
        <div className="space-y-3">

          {/* Workflow stage — أول شي يشوفه الإدمن، هو الإجراء الأساسي */}
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              مرحلة المعالجة
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((stage) => (
                <button
                  key={stage.key}
                  onClick={() => changeStage(stage.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                    currentStage === stage.key
                      ? `${stage.color} text-white`
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {stage.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Embassy application (TLS/VFS) + requirements checklist */}
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              طلب السفارة والمتطلبات
            </h2>

            <div className="space-y-3">
              {linkedAppointment && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2 text-emerald-800">
                    <CalendarClock className="h-4 w-4 shrink-0" />
                    <span className="truncate font-semibold">Linked appointment: {linkedAppointment.visa_centers?.name || 'Visa center'}{linkedAppointment.visa_centers?.city ? ` · ${linkedAppointment.visa_centers.city}` : ''}</span>
                  </div>
                  <span className="shrink-0 font-bold text-emerald-700">{linkedAppointment.slot_date} · {String(linkedAppointment.slot_time).slice(0, 5)}</span>
                </div>
              )}
              {/* Platform + reference number */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">المنصة:</span>
                {(["TLS", "VFS"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setEmbassyPlatform(p)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                      embassy.platform === p
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    )}
                  >
                    {p}
                  </button>
                ))}
                <input
                  value={embassy.reference_number}
                  onChange={(e) => setEmbassyReference(e.target.value)}
                  onBlur={commitEmbassyDetails}
                  placeholder="رقم مرجعي للطلب"
                  className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  dir="ltr"
                />
              </div>

              {/* Appointment date/time */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <CalendarClock className="h-3.5 w-3.5" />
                  الموعد:
                </span>
                <input
                  type="date"
                  value={embassy.appointment_date}
                  onChange={(e) => setEmbassyAppointment("appointment_date", e.target.value)}
                  onBlur={commitEmbassyDetails}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                />
                <input
                  type="time"
                  value={embassy.appointment_time}
                  onChange={(e) => setEmbassyAppointment("appointment_time", e.target.value)}
                  onBlur={commitEmbassyDetails}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                />
              </div>

              {/* Embassy application status dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">حالة طلب تأشيرة السفارة:</span>
                <select
                  value={embassy.status || "pending"}
                  onChange={(e) => {
                    const next = { ...embassy, status: e.target.value };
                    saveEmbassy(next, `تم تحديث حالة طلب تأشيرة السفارة إلى: ${e.target.value}`);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ok">حالة الطلب اوكي (OK)</option>
                  <option value="pending">قيد الانتظار (لم يبدأ التجهيز)</option>
                  <option value="preparing_files">جاري تجهيز الملف والترجمة</option>
                  <option value="appointment_booked">تم حجز موعد TLS / السفارة</option>
                  <option value="submitted">تم تقديم الملف للقنصلية</option>
                  <option value="approved">تم منح التأشيرة بنجاح (Approved)</option>
                  <option value="rejected">تم الرفض من السفارة (Rejected)</option>
                </select>
              </div>

              {/* Requirements checklist */}
              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                {embassy.requirements.map((r) => (
                  <div key={r.key} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <button
                      onClick={() => toggleRequirement(r.key)}
                      className={cn(
                        "flex flex-1 items-center gap-2 text-right text-xs font-semibold",
                        r.done ? "text-emerald-700" : "text-red-600",
                      )}
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full", r.done ? "bg-emerald-500" : "bg-red-500")} />
                      {r.label}
                    </button>
                    <button onClick={() => removeRequirement(r.key)} className="text-slate-300 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addRequirement(); }}
                    placeholder="إضافة متطلب إضافي..."
                    className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={addRequirement} disabled={!newRequirement.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact info */}
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <User className="h-3.5 w-3.5" />
              بيانات التواصل
            </h2>
            <div className="flex flex-wrap gap-2">
              {phones.map((phone, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-700" dir="ltr">{phone}</span>
                  <a
                    href={`https://wa.me/${phone.replace(/[\s+\-]/g, "").replace(/^0/, "964")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
              {reg.email && (
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-700" dir="ltr">{reg.email}</span>
                </div>
              )}
              {phones.length === 0 && !reg.email && (
                <p className="text-xs text-slate-400">لا توجد بيانات تواصل</p>
              )}
            </div>
          </Card>

          {/* Form data — مجمّعة حسب كل استمارة/مستند بدل قائمة واحدة مندمجة */}
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <FileText className="h-3.5 w-3.5" />
              بيانات الاستمارة
              {formGroups.length > 1 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                  {formGroups.length} استمارات
                </span>
              )}
            </h2>
            {formGroups.length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد بيانات</p>
            ) : (
              <div className="space-y-3">
                {formGroups.map((group, gi) => {
                  const matchedDoc = group.title
                    ? documents.find((d) => (d.name || "").replace(/\.[^/.]+$/, "") === group.title)
                    : null;
                  return (
                    <div key={group.title ?? `general-${gi}`}>
                      {group.title && (
                        <div className="flex items-center justify-between gap-2 rounded-t-lg border border-b-0 border-indigo-100 bg-indigo-50/60 px-2.5 py-1.5">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                            <IdCard className="h-3.5 w-3.5" />
                            {group.title}
                          </span>
                          {matchedDoc && (
                            <a
                              href={`/api/documents/view?path=${encodeURIComponent(matchedDoc.path)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              عرض المستند
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                      <div
                        className={cn(
                          "grid grid-cols-1 gap-x-4 sm:grid-cols-2",
                          group.title && "rounded-b-lg border border-t-0 border-slate-100 px-2.5",
                        )}
                      >
                        {group.entries.map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
                            <span className="text-xs font-semibold text-slate-500">{formatFieldKey(stripGroupSuffix(key, group.title))}</span>
                            <span className="text-sm font-medium text-slate-700 text-left">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Services & payment */}
          {reg.selected_services.length > 0 || reg.total_amount > 0 ? (
            <Card className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Wallet className="h-3.5 w-3.5" />
                الخدمات المطلوبة والدفع
              </h2>
              <div className="space-y-1.5">
                {reg.selected_services.map((s) => (
                  <div key={s.key} className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{s.label}</span>
                      {s.meta && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {Object.values(s.meta).filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 shrink-0">{money(s.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-sm font-bold text-slate-900">الإجمالي</span>
                  <span className="text-sm font-bold text-slate-900">{money(reg.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2.5 mt-1.5">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    reg.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                  )}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {reg.payment_status === "paid" ? "مدفوع" : "غير مدفوع"}
                  </span>
                  <Button size="sm" variant="outline" onClick={togglePayment}>
                    {reg.payment_status === "paid" ? "تحديد كغير مدفوع" : "تحديد كمدفوع"}
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Documents */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Paperclip className="h-3.5 w-3.5" />
                الوثائق المرفوعة
              </h2>
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f); }} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  رفع وثيقة
                </span>
              </label>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-1.5">
                {documents.map((doc: any, i: number) => {
                  const viewUrl = `/api/documents/view?path=${encodeURIComponent(doc.path)}`;
                  const isImageOrPdf = /\.(jpe?g|png|pdf)$/i.test(doc.path);
                  const ocr = doc.ocr as { fields?: Record<string, string>; quality?: string } | undefined;
                  const ocrFields = ocr?.fields || {};
                  const hasAutoOcr = ocr?.quality === "clear" && Object.values(ocrFields).some((v) => v);
                  return (
                    <div key={i} className="space-y-1.5 rounded-lg bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2">
                        <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-sm font-medium text-slate-700 truncate">{doc.name || `وثيقة ${i + 1}`}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                        </a>
                        {hasAutoOcr && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Sparkles className="h-3 w-3" /> قُرئت تلقائيًا
                          </span>
                        )}
                        {ocr?.quality === "unclear" && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            غير واضحة
                          </span>
                        )}
                        {isImageOrPdf && (
                          <button
                            onClick={() => scanStoredPassport(doc.path, doc.name || "document")}
                            disabled={!!scanningPath}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                          >
                            {scanningPath === doc.path ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                            {hasAutoOcr ? "إعادة القراءة" : "قراءة الجواز AI"}
                          </button>
                        )}
                      </div>
                      {hasAutoOcr && (
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2">
                          <div className="truncate text-[11px] text-slate-500" dir="ltr">
                            {[ocrFields.given_names, ocrFields.surname, ocrFields.passport_number].filter(Boolean).join(" · ") || "—"}
                          </div>
                          <button
                            onClick={() => applyOcrFields(ocrFields, doc.name || "document")}
                            className="shrink-0 text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            تطبيق على الاستمارة
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <Paperclip className="h-6 w-6 text-slate-300 mb-2" />
                <p className="text-xs">لا توجد وثائق مرفوعة بعد.</p>
              </div>
            )}
          </Card>

          {/* Edit history — persisted, survives page refresh */}
          {edits.length > 0 && (
            <Card className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                <History className="h-3.5 w-3.5" />
                سجل التعديلات
              </h2>
              <div className="space-y-1.5">
                {edits.map((e) => (
                  <div key={e.id} className="rounded-lg border border-orange-100 bg-orange-50/40 p-2.5">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        {e.field_label || formatFieldKey(e.field_key)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        عدّله المستخدم
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 line-through">{e.old_value || "—"}</span>
                      <span className="text-slate-400">←</span>
                      <span className="font-semibold text-slate-800">{e.new_value || "—"}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(e.created_at).toLocaleString("ar-IQ")}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right column: note + timeline ── */}
        <div className="space-y-3">

          {/* Add note */}
          <Card className="p-4">
            <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-slate-500">
              <StickyNote className="h-3.5 w-3.5" />
              إضافة ملاحظة
            </h2>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب ملاحظة عن المتابعة..."
              rows={3}
              className="resize-none text-sm"
            />
            <Button onClick={addNote} disabled={!note.trim() || savingNote} size="sm" className="mt-2 w-full">
              {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
              حفظ الملاحظة
            </Button>
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              سجل المتابعة
            </h2>

            {/* Show persisted notes */}
            {reg.notes && (
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500 mb-3">
                {reg.notes}
              </div>
            )}

            {timeline.length === 0 && !reg.notes ? (
              <p className="py-6 text-center text-xs text-slate-400">
                لا توجد ملاحظات بعد — أضف ملاحظة أو غيّر الحالة لبدء التتبع
              </p>
            ) : (
              <div className="space-y-2.5">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex gap-2.5 border-b border-slate-100 pb-2.5 last:border-0">
                    <div className="flex-shrink-0">
                      {entry.type === "note" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
                          <StickyNote className="h-3 w-3 text-blue-500" />
                        </div>
                      )}
                      {entry.type === "status_change" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50">
                          <CheckCircle2 className="h-3 w-3 text-amber-500" />
                        </div>
                      )}
                      {entry.type === "file" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                          <FileText className="h-3 w-3 text-emerald-500" />
                        </div>
                      )}
                      {entry.type === "edit" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50">
                          <Pencil className="h-3 w-3 text-orange-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700">{entry.content}</p>
                      {entry.fileLink && (
                        <a href={entry.fileLink} target="_blank" rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                          <ExternalLink className="h-3 w-3" />
                          فتح الملف
                        </a>
                      )}
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(entry.created_at).toLocaleString("ar-IQ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* OCR Modal */}
      {showOcrModal && ocrResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowOcrModal(false)}>
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b pb-3" dir="rtl">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-900">نتائج تحليل الجواز بالذكاء الاصطناعي</h3>
            </div>
            <p className="text-xs text-slate-500" dir="rtl">
              تم استخراج البيانات التالية من المستند. قارن كل قيمة باللقطة المأخوذة من الجواز نفسه قبل الحفظ.
            </p>
            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-sm" dir="rtl">
              {([
                ["given_names", "الاسم الأول"],
                ["surname", "اسم العائلة / اللقب"],
                ["passport_number", "رقم الجواز"],
                ["date_of_birth", "تاريخ الميلاد"],
                ["date_of_expiry", "تاريخ الانتهاء"],
                ["nationality", "الجنسية"],
              ] as [string, string][]).map(([key, label], i) => {
                const val = ocrResult.fields?.[key];
                const crop = ocrCrops[key];
                return (
                  <div key={key} className={cn("p-3", i % 2 === 0 ? "bg-slate-50" : "")}>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">{label}</span>
                      <span className="text-slate-900 font-semibold font-mono">{val || "—"}</span>
                    </div>
                    {crop && (
                      // لقطة مقصوصة من الجواز نفسه لموضع هذا الحقل — تدقيق بصري سريع
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={crop}
                        alt={`لقطة ${label} من الجواز`}
                        dir="ltr"
                        className="mt-2 max-h-14 w-full rounded-lg border border-slate-200 bg-white object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2" dir="rtl">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold"
                onClick={() => applyOcrFields(ocrResult.fields, scanningDocName)}>
                تحديث بيانات الاستمارة تلقائياً
              </Button>
              <Button variant="outline" onClick={() => setShowOcrModal(false)}>إغلاق</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
