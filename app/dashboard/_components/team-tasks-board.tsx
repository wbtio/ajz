"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
  Paperclip,
  Upload,
  ClipboardList,
  Clock,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { VoiceInput } from "@/app/dashboard/_components/voice-input";
import { useTracking } from "@/components/analytics/tracker";
import { RECURRENCE_LABELS, type Recurrence } from "@/lib/recurrence";
import { type Attachment, type Category, type ColumnStatus, type CurrentUser, type Member, type Priority, type Task, normalizeTask } from "./task-types";
import { AssigneeLabel, categoryMeta, columns, emptyForm, MemberAvatar, memberEmailLabel, memberName, priorityMeta } from "./task-config";

type DateFilter = "all" | "overdue" | "yesterday" | "today" | "tomorrow" | "this_week" | "next_week" | "later" | "no_due_date";

const dateFilterLabels: Record<DateFilter, string> = {
  all: "All dates",
  overdue: "Overdue",
  yesterday: "Yesterday",
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This week",
  next_week: "Next week",
  later: "Later",
  no_due_date: "No due date",
};

const normalizeWhatsAppNumber = (value: string | null | undefined) => {
  let digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("9640")) digits = `964${digits.slice(4)}`;
  else if (digits.startsWith("0")) digits = `964${digits.slice(1)}`;
  else if (digits.startsWith("7")) digits = `964${digits}`;
  return digits;
};

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
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    assignee: isAdmin ? "" : myName,
  }));
  const [saving, setSaving] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);
  const [dueTime, setDueTime] = useState("09:00");
  const [dueMode, setDueMode] = useState<"duration" | "date">("duration");
  const [customHours, setCustomHours] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/team-tasks");
      if (!res.ok) throw new Error("Unable to load tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data.map(normalizeTask) : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    if (membersLoaded) return members;
    try {
      const res = await fetch("/api/team-members");
      const data = res.ok ? await res.json() : [];
      const loadedMembers = Array.isArray(data) ? data : [];
      setMembers(loadedMembers);
      setMembersLoaded(true);
      return loadedMembers as Member[];
    } catch {
      return [] as Member[];
    }
  }

  useEffect(() => {
    void Promise.all([fetchTasks(), loadMembers()]);
  }, []);

  useEffect(() => {
    const refreshTasks = () => void fetchTasks();
    window.addEventListener("jaz:tasks-changed", refreshTasks);
    return () => window.removeEventListener("jaz:tasks-changed", refreshTasks);
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
    if (!confirm("Are you sure you want to delete this task?")) return;
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
    setAttachments([]);
    setDueTime("09:00");
    setCustomHours("");
    setDueMode("duration");
    setEditingTaskId(null);
  };

  const openCreateForm = () => {
    void loadMembers();
    resetForm();
    setShowForm(true);
  };

  const openTaskDetails = (task: Task) => {
    void loadMembers();
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
    setAttachments(Array.isArray(task.attachments) ? task.attachments : []);
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
            attachments,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || "Unable to save task");
        const updated = normalizeTask(result);
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
            attachments,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || "Unable to save task");
        const created = normalizeTask(result);
        setTasks((prev) => [created, ...prev]);
        track("team_task_created", { title: created.title });
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An error occurred while saving the task.");
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
    return `${d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })} · ${d.toLocaleTimeString("en-US", {
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

  const matchesDateFilter = useCallback((task: Task) => {
    if (dateFilter === "all") return true;
    if (!task.due_date) return dateFilter === "no_due_date";

    const due = new Date(task.due_date);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const dayOffset = Math.round((startOfDueDay.getTime() - startOfToday.getTime()) / 86_400_000);
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(startOfToday.getDate() - ((startOfToday.getDay() + 6) % 7));
    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);
    const startAfterNextWeek = new Date(startOfThisWeek);
    startAfterNextWeek.setDate(startOfThisWeek.getDate() + 14);

    switch (dateFilter) {
      case "overdue": return task.status !== "done" && due < now;
      case "yesterday": return dayOffset === -1;
      case "today": return dayOffset === 0;
      case "tomorrow": return dayOffset === 1;
      case "this_week": return startOfDueDay >= startOfThisWeek && startOfDueDay < startOfNextWeek;
      case "next_week": return startOfDueDay >= startOfNextWeek && startOfDueDay < startAfterNextWeek;
      case "later": return startOfDueDay >= startAfterNextWeek;
      default: return true;
    }
  }, [dateFilter]);

  // Productivity overview always uses all tasks, regardless of active filters.
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
      if (!matchesDateFilter(t)) return false;
      if (q) {
        const hay = `${t.title} ${t.description ?? ""} ${t.assignee ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, categoryFilter, matchesDateFilter, search]);

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

  const taskShareUrl = (taskId: string) => {
    if (typeof window === "undefined") return `/dashboard/team-tasks?task=${taskId}`;
    return `${window.location.origin}/dashboard/team-tasks?task=${taskId}`;
  };

  const memberByName = (name: string, memberList = members) => {
    const normalized = name.trim().toLocaleLowerCase();
    if (!normalized) return undefined;

    const exact = memberList.find((member) =>
      [member.id, member.full_name, member.email]
        .filter(Boolean)
        .some((value) => String(value).trim().toLocaleLowerCase() === normalized)
    );
    if (exact) return exact;

    const partialMatches = memberList.filter((member) => {
      const fullName = (member.full_name || "").trim().toLocaleLowerCase();
      return fullName && (fullName.startsWith(`${normalized} `) || normalized.startsWith(`${fullName} `));
    });
    return partialMatches.length === 1 ? partialMatches[0] : undefined;
  };

  const openWhatsAppShare = async (task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const memberList = await loadMembers();
    const recipient = memberByName(task.assignee || "", memberList);
    const phone = normalizeWhatsAppNumber(recipient?.phone);
    if (!phone) {
      alert(`No phone number is saved for the assignee${task.assignee ? ` (${task.assignee})` : ""}. Add a number in Team Members and try again.`);
      return;
    }
    const message = [
      `Task: ${task.title}`,
      task.description ? `Description: ${task.description}` : null,
      `Link: ${taskShareUrl(task.id)}`,
    ]
      .filter(Boolean)
      .join("\n");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openEmailShare = async (task: Task, recipientEmail?: string | null, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const memberList = await loadMembers();
    const to = (recipientEmail || memberByName(task.assignee || "", memberList)?.email || "").trim();
    if (!to) {
      alert("No email address is saved for this task's assignee.");
      return;
    }
    const subject = `New task: ${task.title}`;
    const body = [
      `Hello,`,
      ``,
      `A new task has been assigned for review:`,
      `- Title: ${task.title}`,
      task.description ? `- Description: ${task.description}` : null,
      `- Link: ${taskShareUrl(task.id)}`,
      ``,
      `Regards,`,
      `JAZ Admin`,
    ]
      .filter(Boolean)
      .join("\n");
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const uploadAttachmentFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingAttachment(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const payload = new FormData();
          payload.append("file", file);
          payload.append("bucket", "team-task-attachments");
          payload.append("type", "task-attachment");
          const res = await fetch("/api/upload-document", { method: "POST", body: payload });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Unable to upload file");
          }
          const data = await res.json();
          return {
            name: file.name,
            url: data.url,
            type: file.type || null,
            size: file.size,
            uploaded_at: new Date().toISOString(),
          } satisfies Attachment;
        })
      );
      setAttachments((current) => [...uploaded, ...current]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unable to upload file");
    } finally {
      setUploadingAttachment(false);
    }
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
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="ltr">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
            <Target className="h-3.5 w-3.5 text-stone-400" />
            <span className="text-xs font-medium text-stone-500">Total</span>
            <strong className="text-sm text-stone-900">{stats.total}</strong>
          </div>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-xs font-medium text-stone-500">Overdue</span>
            <strong className={cn("text-sm", stats.overdue > 0 ? "text-rose-600" : "text-stone-900")}>{stats.overdue}</strong>
          </div>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-stone-500">Today</span>
            <strong className="text-sm text-stone-900">{stats.dueToday}</strong>
          </div>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-stone-500">Completion</span>
            <strong className="text-sm text-stone-900">{stats.rate}%</strong>
            <div className="h-1.5 w-10 overflow-hidden rounded-full bg-stone-100" aria-hidden>
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.rate}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden />
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              aria-label="Filter tasks by due date"
              className="h-10 appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-8 pr-8 text-xs font-semibold text-stone-700 outline-none transition-colors hover:border-stone-300 focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]"
            >
              {(Object.keys(dateFilterLabels) as DateFilter[]).map((filter) => (
                <option key={filter} value={filter}>{dateFilterLabels[filter]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden />
          </label>
          <button
            onClick={openCreateForm}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#8B0000] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#6B0000]"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-350" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
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
          All
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

      {/* Task board */}
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
                        title={task.status === "done" ? "Reopen task" : "Mark as completed"}
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
                              title={`Repeats ${task.recurrence}`}
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

                        {task.attachments.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
                            <Paperclip className="h-3 w-3" />
                            {task.attachments.length} attachment{task.attachments.length === 1 ? "" : "s"}
                          </div>
                        )}

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {task.assignee && (
                              <AssigneeLabel member={memberByName(task.assignee)} name={task.assignee} />
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
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              aria-label="Delete task"
                              className="rounded-lg p-1.5 text-stone-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => openWhatsAppShare(task, e)}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                              Share via WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={(e) => openEmailShare(task, undefined, e)}
                              className="mt-2 ml-2 inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                            >
                              Share via email
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {tasksByColumn(col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-stone-300">
                  <ClipboardList className="mb-2 h-8 w-8" />
                  <p className="text-xs font-medium">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create or edit task dialog */}
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
                    Task details
                  </>
                ) : (
                  "New task"
                )}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
                </button>
              </div>

              {editingTaskId && isAdmin && (
                <button
                  type="button"
                  onClick={(e) => openWhatsAppShare(tasks.find((t) => t.id === editingTaskId) || {
                    id: editingTaskId,
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    priority: form.priority,
                    status: "todo",
                    assignee: form.assignee || null,
                    due_date: form.due_date || null,
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    completed_at: null,
                    completed_by: null,
                    recurrence: form.recurrence || null,
                    attachments,
                  }, e)}
                  className="mb-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  Share task via WhatsApp
                </button>
              )}

            {/* Team members can change their task status; admins can edit all fields. */}
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
                    Status
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

              </div>
            ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Task title *
                </label>
                <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 pe-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <input
                    autoFocus
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveTask();
                    }}
                    placeholder="Example: Prepare an invitation letter for a client"
                    className="w-full flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                  <VoiceInput
                    title="Voice input for title"
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
                  Description
                </label>
                <div className="flex items-start gap-1.5 rounded-xl border border-stone-200 pe-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Additional details (optional)"
                    className="w-full flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                  <VoiceInput
                    title="Voice input for description"
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

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Attachments
                </label>
                <div className="space-y-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800">Attach files</p>
                      <p className="text-xs text-stone-500">Upload a PDF, image, or document for the assigned team member.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#8B0000] shadow-sm ring-1 ring-inset ring-stone-200 transition-colors hover:bg-stone-50">
                      {uploadingAttachment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploadingAttachment ? 'Uploading' : 'Upload file'}
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => uploadAttachmentFiles(e.target.files)}
                      />
                    </label>
                  </div>

                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={`${file.url}-${index}`} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2">
                          <Paperclip className="h-4 w-4 shrink-0 text-stone-400" />
                          <div className="min-w-0 flex-1">
                            <a href={file.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-stone-800 hover:text-[#8B0000]">
                              {file.name}
                            </a>
                            <p className="text-[11px] text-stone-400">
                              {file.type || 'file'} · {Math.max(1, Math.round((file.size || 0) / 1024))} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))}
                            className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs text-stone-400">
                      No attachments yet. You can keep this task text-only or add a reference file.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    Category
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
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as Priority })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    Assignee
                  </label>
                  {!isAdmin ? (
                    <div className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
                      <MemberAvatar member={memberByName(myName)} name={myName} />
                      <span className="flex-1 truncate text-left text-stone-600">
                        {myName} (You)
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
                            <MemberAvatar member={memberByName(form.assignee)} name={form.assignee} />
                            <span className="flex-1 truncate text-left">
                              {form.assignee}
                            </span>
                          </>
                        ) : (
                          <span className="flex-1 text-left text-stone-400">
                            Select assignee
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1.5" align="start">
                      {members.length === 0 ? (
                        <p className="p-3 text-center text-xs text-stone-400">
                          No team members
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
                                <MemberAvatar member={m} name={name} size="size-7" />
                                <span className="flex-1 min-w-0 text-left">
                                  <span className="block truncate">{name}</span>
                                  <span className="block truncate text-[11px] font-normal text-stone-400">
                                    {memberEmailLabel(m)}
                                  </span>
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
                    Due date
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
                          <span className="flex-1 truncate text-left">
                            {formatDue(form.due_date)}
                          </span>
                        ) : (
                          <span className="flex-1 text-left text-stone-400">
                            No due date, choose a duration or date
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
                          Duration
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
                          Specific date
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
                                {h}h
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              value={customHours}
                              onChange={(e) => setCustomHours(e.target.value)}
                              placeholder="Custom hours"
                              className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              disabled={!customHours || Number(customHours) <= 0}
                              onClick={() => applyDueIn(Number(customHours))}
                              className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                            >
                              Apply
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 border-t border-stone-100 pt-2.5">
                            <button
                              type="button"
                              onClick={() => applyDueAt(0, 17)}
                              className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                            >
                              End of day
                            </button>
                            <button
                              type="button"
                              onClick={() => applyDueAt(1, 9)}
                              className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                            >
                              Tomorrow morning
                            </button>
                            <button
                              type="button"
                              onClick={() => applyDueAt(7, 9)}
                              className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:border-blue-400 hover:text-blue-700"
                            >
                              Next week
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
                    Recurrence
                  </label>
                  <select
                    value={form.recurrence}
                    onChange={(e) =>
                      setForm({ ...form, recurrence: e.target.value as Recurrence | "" })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">No recurrence</option>
                    {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
                      <option key={r} value={r}>
                        {r === "daily" ? "Daily" : r === "weekly" ? "Weekly" : "Monthly"}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-stone-400">
                    Completing this task automatically creates the next recurring copy.
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
                  {editingTaskId ? "Save changes" : "Add task"}
                </button>
                {editingTaskId && isAdmin && (
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
                  Cancel
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
