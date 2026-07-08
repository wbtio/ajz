"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Calendar,
  Check,
  ChevronDown,
  Repeat,
  Search,
  Flame,
  TrendingUp,
  Target,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { VoiceInput } from "@/components/dashboard/voice-input";
import { useTracking } from "@/components/analytics/tracker";
import { RECURRENCE_LABELS, type Recurrence } from "@/lib/recurrence";

type ColumnStatus = "todo" | "in_progress" | "done";
type Category =
  | "development"
  | "events"
  | "visas"
  | "partners"
  | "marketing"
  | "general";
type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  priority: Priority;
  status: ColumnStatus;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  recurrence: Recurrence | null;
}

interface Member {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  avatar_url: string | null;
}

const memberName = (m: Member) => m.full_name || m.email;
const initials = (name: string) => name.charAt(0).toUpperCase();

const avatarPalette = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
];

const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % avatarPalette.length;
  return avatarPalette[hash];
};

const columns: {
  id: ColumnStatus;
  title: string;
  dot: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "todo",
    title: "قيد الانتظار",
    dot: "bg-slate-400",
    icon: <ClipboardList className="h-4 w-4 text-slate-500" />,
  },
  {
    id: "in_progress",
    title: "تحت المعالجة",
    dot: "bg-amber-500",
    icon: <Clock className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "done",
    title: "تم الإنجاز",
    dot: "bg-emerald-500",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  },
];

const categoryMeta: Record<Category, { label: string; className: string }> = {
  development: { label: "التطوير", className: "bg-indigo-50 text-indigo-700" },
  events: { label: "الفعاليات", className: "bg-sky-50 text-sky-700" },
  visas: { label: "الدعوات والتأشيرات", className: "bg-rose-50 text-rose-700" },
  partners: { label: "الشركاء", className: "bg-teal-50 text-teal-700" },
  marketing: { label: "التسويق", className: "bg-fuchsia-50 text-fuchsia-700" },
  general: { label: "عام", className: "bg-stone-100 text-stone-600" },
};

const priorityMeta: Record<Priority, { label: string; className: string; dot: string; rank: number }> = {
  high: { label: "عالية", className: "text-rose-700", dot: "bg-rose-500", rank: 0 },
  medium: { label: "متوسطة", className: "text-amber-700", dot: "bg-amber-500", rank: 1 },
  low: { label: "منخفضة", className: "text-stone-500", dot: "bg-stone-400", rank: 2 },
};

const emptyForm = {
  title: "",
  description: "",
  category: "general" as Category,
  priority: "medium" as Priority,
  assignee: "",
  due_date: "",
  recurrence: "" as Recurrence | "",
};

interface CurrentUser {
  role: string | null;
  full_name: string | null;
  email: string;
}

export function TeamTasksBoard({ currentUser }: { currentUser: CurrentUser }) {
  const isAdmin = currentUser.role === "admin";
  const myName = currentUser.full_name || currentUser.email;
  const { track } = useTracking();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    assignee: isAdmin ? "" : myName,
  }));
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);
  const [dueTime, setDueTime] = useState("09:00");
  const [dueMode, setDueMode] = useState<"duration" | "date">("duration");
  const [customHours, setCustomHours] = useState("");

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/team-tasks");
      if (!res.ok) throw new Error("تعذّر تحميل المهام");
      setTasks(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ في تحميل المهام");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    fetch("/api/team-members")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMembers(data))
      .catch(() => {});
  }, []);

  const updateTaskStatus = async (taskId: string, status: ColumnStatus) => {
    const current = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    if (current && current.status !== status) {
      track("team_task_status_changed", { title: current.title, from: current.status, to: status });
    }
    try {
      await fetch(`/api/team-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    const current = tasks.find((t) => t.id === taskId);
    try {
      await fetch(`/api/team-tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (current) track("team_task_deleted", { title: current.title });
      if (editingTaskId === taskId) setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm, assignee: isAdmin ? "" : myName });
    setDueTime("09:00");
    setCustomHours("");
    setDueMode("duration");
    setEditingTaskId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openTaskDetails = (task: Task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      assignee: task.assignee || "",
      due_date: task.due_date || "",
      recurrence: task.recurrence || "",
    });
    setDueTime(
      task.due_date
        ? `${String(new Date(task.due_date).getHours()).padStart(2, "0")}:${String(
            new Date(task.due_date).getMinutes()
          ).padStart(2, "0")}`
        : "09:00"
    );
    setDueMode(task.due_date ? "date" : "duration");
    setCustomHours("");
    setShowForm(true);
  };

  const saveTask = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      if (editingTaskId) {
        const res = await fetch(`/api/team-tasks/${editingTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            due_date: form.due_date || null,
            assignee: form.assignee.trim() || null,
            recurrence: form.recurrence || null,
          }),
        });
        if (!res.ok) throw new Error("تعذّر الحفظ");
        const updated: Task = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        track("team_task_edited", { title: updated.title });
      } else {
        const res = await fetch("/api/team-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            due_date: form.due_date || null,
            assignee: form.assignee.trim() || null,
          }),
        });
        if (!res.ok) throw new Error("تعذّر الحفظ");
        const created: Task = await res.json();
        setTasks((prev) => [created, ...prev]);
        track("team_task_created", { title: created.title });
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const dueDateObj = form.due_date ? new Date(form.due_date) : undefined;

  const durationOptions = [1, 2, 3, 4, 5];

  const applyDueIn = (hours: number) => {
    const date = new Date(Date.now() + hours * 3600 * 1000);
    setDueTime(
      `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`
    );
    setForm((f) => ({ ...f, due_date: date.toISOString() }));
    setDueOpen(false);
  };

  const applyDueAt = (daysFromNow: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    setDueTime(`${String(hour).padStart(2, "0")}:00`);
    setForm((f) => ({ ...f, due_date: date.toISOString() }));
    setDueOpen(false);
  };

  const applyDueDay = (day: Date) => {
    const [h, m] = dueTime.split(":").map(Number);
    const combined = new Date(day);
    combined.setHours(h, m, 0, 0);
    setForm((f) => ({ ...f, due_date: combined.toISOString() }));
  };

  const applyDueTime = (time: string) => {
    setDueTime(time);
    const [h, m] = time.split(":").map(Number);
    const combined = dueDateObj ? new Date(dueDateObj) : new Date();
    combined.setHours(h, m, 0, 0);
    setForm((f) => ({ ...f, due_date: combined.toISOString() }));
  };

  const formatDue = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("ar", {
      day: "numeric",
      month: "short",
    })} · ${d.toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const isOverdue = (task: Task) =>
    !!task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();

  const isDueToday = (task: Task) => {
    if (!task.due_date || task.status === "done") return false;
    const d = new Date(task.due_date);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // نظرة عامة على الإنتاجية: تُحسب دائمًا على كامل المهام بغض النظر عن الفلاتر
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(isOverdue).length;
    const dueToday = tasks.filter(isDueToday).length;
    const rate = total ? Math.round((done / total) * 100) : 0;
    return { total, done, overdue, dueToday, rate };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (q) {
        const hay = `${t.title} ${t.description ?? ""} ${t.assignee ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, categoryFilter, search]);

  const compareTasks = (a: Task, b: Task) => {
    const aOverdue = isOverdue(a) ? 0 : 1;
    const bOverdue = isOverdue(b) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    if (a.due_date && b.due_date) {
      const diff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (diff !== 0) return diff;
    } else if (a.due_date && !b.due_date) return -1;
    else if (!a.due_date && b.due_date) return 1;
    if (priorityMeta[a.priority].rank !== priorityMeta[b.priority].rank) {
      return priorityMeta[a.priority].rank - priorityMeta[b.priority].rank;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const tasksByColumn = (status: ColumnStatus) =>
    visibleTasks.filter((t) => t.status === status).sort(compareTasks);

  const toggleDone = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTaskStatus(task.id, task.status === "done" ? "todo" : "done");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <p className="text-lg font-medium text-stone-700">{error}</p>
        <button
          onClick={fetchTasks}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* الترويسة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-950">المهام اليومية</h1>
          <p className="mt-1 text-sm text-stone-500">
            نظّم مهام الفريق وتابع الإنجاز أولًا بأول
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          مهمة جديدة
        </button>
      </div>

      {/* نظرة عامة على الإنتاجية */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-stone-400">
            <Target className="h-4 w-4" />
            <span className="text-xs font-semibold">الإجمالي</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-rose-500">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-semibold">متأخرة</span>
          </div>
          <p className={cn("mt-2 text-2xl font-black", stats.overdue > 0 ? "text-rose-600" : "text-stone-900")}>
            {stats.overdue}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold">اليوم</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{stats.dueToday}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold">نسبة الإنجاز</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-black text-stone-900">{stats.rate}%</p>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* شريط الأدوات: بحث وفلترة */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-350" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المهام..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pe-9 ps-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
            categoryFilter === "all"
              ? "bg-stone-900 text-white"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          )}
        >
          الكل
        </button>
        {(Object.keys(categoryMeta) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
              categoryFilter === cat
                ? "bg-stone-900 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            )}
          >
            {categoryMeta[cat].label}
          </button>
        ))}
      </div>

      {/* اللوحة */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map((col) => (
          <div
            key={col.id}
            className={cn(
              "flex flex-col rounded-2xl border transition-colors duration-200",
              dragOverColumn === col.id
                ? "border-blue-300 bg-blue-50/40"
                : "border-stone-200 bg-stone-50/60"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(col.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedTask && draggedTask.status !== col.id) {
                updateTaskStatus(draggedTask.id, col.id);
              }
              setDraggedTask(null);
              setDragOverColumn(null);
            }}
            onDragLeave={() => setDragOverColumn(null)}
          >
            <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3">
              <span className={cn("h-2 w-2 rounded-full", col.dot)} />
              <h3 className="flex-1 text-sm font-bold text-stone-700">
                {col.title}
              </h3>
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-stone-200 bg-white px-1.5 text-[11px] font-bold text-stone-500">
                {tasksByColumn(col.id).length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-3">
              {tasksByColumn(col.id).map((task) => {
                const overdue = isOverdue(task);
                const dueToday = isDueToday(task);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task)}
                    onClick={() => openTaskDetails(task)}
                    className={cn(
                      "group cursor-pointer rounded-xl border border-stone-200 bg-white p-3.5 transition-all duration-150 hover:border-stone-300 hover:shadow-[0_8px_20px_-14px_rgba(15,23,42,0.25)]",
                      draggedTask?.id === task.id && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={(e) => toggleDone(task, e)}
                        title={task.status === "done" ? "إعادة فتح المهمة" : "تعليم كمنجزة"}
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          task.status === "done"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-stone-300 text-transparent hover:border-emerald-400"
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                              categoryMeta[task.category].className
                            )}
                          >
                            {categoryMeta[task.category].label}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold",
                              priorityMeta[task.priority].className
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                priorityMeta[task.priority].dot
                              )}
                            />
                            {priorityMeta[task.priority].label}
                          </span>
                          {task.recurrence && (
                            <span
                              title={`تتكرر ${RECURRENCE_LABELS[task.recurrence]}`}
                              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700"
                            >
                              <Repeat className="h-3 w-3" />
                            </span>
                          )}
                        </div>

                        <p
                          className={cn(
                            "text-sm font-semibold text-stone-800",
                            task.status === "done" && "text-stone-400 line-through"
                          )}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {task.assignee && (
                              <span
                                title={task.assignee}
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                  avatarColor(task.assignee)
                                )}
                              >
                                {initials(task.assignee)}
                              </span>
                            )}
                            {task.due_date && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                                  overdue
                                    ? "bg-rose-50 text-rose-600"
                                    : dueToday
                                    ? "bg-amber-50 text-amber-700"
                                    : "text-stone-400"
                                )}
                              >
                                <Calendar className="h-3 w-3" />
                                {formatDue(task.due_date)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="rounded-lg p-1.5 text-stone-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {tasksByColumn(col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-stone-300">
                  <ClipboardList className="mb-2 h-8 w-8" />
                  <p className="text-xs font-medium">لا توجد مهام</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* نافذة إنشاء / تعديل مهمة */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black text-stone-950">
                {editingTaskId ? (
                  <>
                    <Pencil className="h-5 w-5 text-blue-600" />
                    تفاصيل المهمة
                  </>
                ) : (
                  "مهمة جديدة"
                )}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* عضو الفريق يستطيع فقط تغيير حالة مهمته الخاصة، والمدير وحده يعدّل بقية الحقول */}
            {editingTaskId && !isAdmin ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {categoryMeta[form.category].label}
                  </p>
                  <p className="mt-1 text-base font-bold text-stone-900">{form.title}</p>
                  {form.description && (
                    <p className="mt-1.5 text-sm text-stone-500">{form.description}</p>
                  )}
                  {form.due_date && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDue(form.due_date)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    الحالة
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {columns.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          updateTaskStatus(editingTaskId, col.id);
                          setShowForm(false);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 py-2 text-xs font-bold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                      >
                        <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                        {col.title}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowForm(false);
                    deleteTask(editingTaskId);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف المهمة
                </button>
              </div>
            ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  عنوان المهمة *
                </label>
                <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 pe-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <input
                    autoFocus
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveTask();
                    }}
                    placeholder="مثال: تجهيز خطاب دعوة لعميل معرض دبي"
                    className="w-full flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                  <VoiceInput
                    title="تفريغ صوتي للعنوان"
                    onResult={(text) =>
                      setForm((f) => ({
                        ...f,
                        title: f.title ? `${f.title} ${text}` : text,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  الوصف
                </label>
                <div className="flex items-start gap-1.5 rounded-xl border border-stone-200 pe-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="تفاصيل إضافية (اختياري)"
                    className="w-full flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                  <VoiceInput
                    title="تفريغ صوتي للوصف"
                    className="mt-1.5"
                    onResult={(text) =>
                      setForm((f) => ({
                        ...f,
                        description: f.description
                          ? `${f.description} ${text}`
                          : text,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    التصنيف
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Category })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {(Object.keys(categoryMeta) as Category[]).map((c) => (
                      <option key={c} value={c}>
                        {categoryMeta[c].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    الأولوية
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as Priority })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    المسؤول
                  </label>
                  {!isAdmin ? (
                    <div className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                        {myName.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 truncate text-right text-stone-600">
                        {myName} (أنت)
                      </span>
                    </div>
                  ) : (
                  <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        {form.assignee ? (
                          <>
                            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", avatarColor(form.assignee))}>
                              {form.assignee.charAt(0).toUpperCase()}
                            </span>
                            <span className="flex-1 truncate text-right">
                              {form.assignee}
                            </span>
                          </>
                        ) : (
                          <span className="flex-1 text-right text-stone-400">
                            اختر المسؤول
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1.5" align="start">
                      {members.length === 0 ? (
                        <p className="p-3 text-center text-xs text-stone-400">
                          لا يوجد أعضاء
                        </p>
                      ) : (
                        <div className="max-h-56 overflow-y-auto">
                          {members.map((m) => {
                            const name = memberName(m);
                            const selected = form.assignee === name;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setForm({ ...form, assignee: name });
                                  setAssigneeOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-stone-50",
                                  selected && "bg-blue-50"
                                )}
                              >
                                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", avatarColor(name))}>
                                  {initials(name)}
                                </span>
                                <span className="flex-1 truncate text-right">
                                  {name}
                                </span>
                                {selected && (
                                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    موعد التسليم
                  </label>
                  <Popover
                    open={dueOpen}
                    onOpenChange={(o) => {
                      setDueOpen(o);
                      if (o) setDueMode(dueDateObj ? "date" : "duration");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <Calendar className="h-4 w-4 shrink-0 text-stone-400" />
                        {form.due_date ? (
                          <span className="flex-1 truncate text-right">
                            {formatDue(form.due_date)}
                          </span>
                        ) : (
                          <span className="flex-1 text-right text-stone-400">
                            بدون موعد — اختر مدة أو تاريخًا
                          </span>
                        )}
                        {form.due_date && (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm((f) => ({ ...f, due_date: "" }));
                              setCustomHours("");
                            }}
                            className="rounded-md p-0.5 text-stone-300 hover:bg-stone-100 hover:text-stone-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="start">
                      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
                        <button
                          type="button"
                          onClick={() => setDueMode("duration")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors",
                            dueMode === "duration"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-stone-500 hover:text-stone-700"
                          )}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          خلال مدة
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueMode("date")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors",
                            dueMode === "date"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-stone-500 hover:text-stone-700"
                          )}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          تاريخ محدد
                        </button>
                      </div>

                      {dueMode === "duration" ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-5 gap-1.5">
                            {durationOptions.map((h) => (
                              <button
                                key={h}
                                type="button"
                                onClick={() => applyDueIn(h)}
                                className="rounded-lg border border-stone-200 py-1.5 text-xs font-bold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                              >
                                {h} س
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              value={customHours}
                              onChange={(e) => setCustomHours(e.target.value)}
                              placeholder="عدد ساعات آخر"
                              className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              disabled={!customHours || Number(customHours) <= 0}
                              onClick={() => applyDueIn(Number(customHours))}
                              className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                            >
                              تطبيق
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 border-t border-stone-100 pt-2.5">
                            <button
                              type="button"
                              onClick={() => applyDueAt(0, 17)}
                              className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                            >
                              نهاية اليوم
                            </button>
                            <button
                              type="button"
                              onClick={() => applyDueAt(1, 9)}
                              className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                            >
                              غدًا صباحًا
                            </button>
                            <button
                              type="button"
                              onClick={() => applyDueAt(7, 9)}
                              className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                            >
                              الأسبوع القادم
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <CalendarPicker
                            selected={dueDateObj}
                            onSelect={applyDueDay}
                          />
                          <div className="mt-2 flex items-center gap-2 border-t border-stone-100 pt-2.5">
                            <Clock className="h-4 w-4 shrink-0 text-stone-400" />
                            <input
                              type="time"
                              value={dueTime}
                              onChange={(e) => applyDueTime(e.target.value)}
                              className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    التكرار
                  </label>
                  <select
                    value={form.recurrence}
                    onChange={(e) =>
                      setForm({ ...form, recurrence: e.target.value as Recurrence | "" })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">بدون تكرار</option>
                    {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
                      <option key={r} value={r}>
                        {RECURRENCE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-stone-400">
                    عند إنجاز هذه المهمة تُنشأ نسخة جديدة منها تلقائيًا بنفس التكرار
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveTask}
                  disabled={saving || !form.title.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingTaskId ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingTaskId ? "حفظ التغييرات" : "إضافة المهمة"}
                </button>
                {editingTaskId && (
                  <button
                    onClick={() => deleteTask(editingTaskId)}
                    className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
