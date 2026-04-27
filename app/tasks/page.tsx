"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  GripVertical,
  Loader2,
  AlertCircle,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Task {
  id: string;
  page: string;
  modification_type: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  image_url: string | null;
  image_annotation: unknown;
  created_at: string;
  updated_at: string | null;
}

type ColumnStatus = "todo" | "in_progress" | "done";

interface Column {
  id: ColumnStatus;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const columns: Column[] = [
  {
    id: "todo",
    title: "مهمة",
    icon: <ClipboardList className="h-5 w-5" />,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    id: "in_progress",
    title: "تحت المعالجة",
    icon: <Clock className="h-5 w-5" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "done",
    title: "تم الإنجاز",
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function PublicTasksBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnStatus | null>(null);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, status: ColumnStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, status: ColumnStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, status: ColumnStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const tasksByColumn = (status: ColumnStatus) =>
    tasks.filter((t) => t.status === status);

  const getPageLabel = (page: string) => {
    const map: Record<string, string> = {
      dashboard: "لوحة التحكم",
      site: "الموقع",
      official: "الموقع الرسمي",
    };
    return map[page] || page;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      text: "تعديل نص",
      design: "تعديل تصميم",
      image: "تعديل صورة",
      length: "تعديل طول",
      shape: "تعديل شكل",
      other: "أخرى",
    };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-stone-50 to-stone-100">
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8b0000,#c2410c)] shadow-md">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-stone-950">JAZ Tasks</h1>
              <p className="text-[11px] font-medium text-stone-400">نظام إدارة طلبات التعديل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks/new"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              طلب جديد
            </Link>
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors sm:flex"
            >
              العودة للموقع
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-950">لوحة المهام</h2>
            <p className="mt-1 text-sm text-stone-500">
              سحب المهام بين الأعمدة لتغيير الحالة
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm border border-stone-200">
            <span className="text-sm font-medium text-stone-600">
              إجمالي الطلبات:
            </span>
            <span className="text-lg font-bold text-blue-600">{tasks.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {columns.map((col) => (
            <div
              key={col.id}
              className={cn(
                "flex flex-col rounded-3xl border-2 border-dashed transition-colors duration-200",
                dragOverColumn === col.id
                  ? "border-blue-300 bg-blue-50/50"
                  : "border-stone-200 bg-white"
              )}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={handleDragLeave}
            >
              <div
                className={cn(
                  "flex items-center gap-3 rounded-t-3xl px-5 py-4",
                  col.bg
                )}
              >
                <span className={col.color}>{col.icon}</span>
                <h3 className="flex-1 text-base font-bold text-stone-800">
                  {col.title}
                </h3>
                <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-white px-2 text-xs font-bold shadow-sm text-stone-600">
                  {tasksByColumn(col.id).length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                {tasksByColumn(col.id).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className={cn(
                      "group cursor-move rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-stone-300",
                      draggedTask?.id === task.id && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600">
                            {getPageLabel(task.page)}
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                            {getTypeLabel(task.modification_type)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-stone-800 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-stone-400">
                            {new Date(task.created_at).toLocaleDateString("ar-SA")}
                          </span>
                          <div className="flex items-center gap-1">
                            {task.image_url && (
                              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                                صورة
                              </span>
                            )}
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {tasksByColumn(col.id).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-stone-300">
                    <ClipboardList className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">لا توجد مهام</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-stone-950">
                تفاصيل الطلب
              </h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    الصفحة
                  </p>
                  <p className="text-base font-bold text-stone-800">
                    {getPageLabel(selectedTask.page)}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    نوع التعديل
                  </p>
                  <p className="text-base font-bold text-stone-800">
                    {getTypeLabel(selectedTask.modification_type)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  الوصف
                </p>
                <p className="text-base leading-relaxed text-stone-800 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>

              {selectedTask.image_url && (
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                    الصورة المرفقة
                  </p>
                  <img
                    src={selectedTask.image_url}
                    alt="Task attachment"
                    className="w-full rounded-xl border border-stone-200"
                  />
                </div>
              )}

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                  تاريخ الإنشاء
                </p>
                <p className="text-sm font-medium text-stone-700">
                  {new Date(selectedTask.created_at).toLocaleString("ar-SA")}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    deleteTask(selectedTask.id);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
