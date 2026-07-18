import { Calendar, Check, Paperclip, Repeat, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssigneeLabel, categoryMeta, priorityMeta } from "./task-config";
import type { Member, Task } from "./task-types";

interface TaskCardProps {
  task: Task;
  member?: Member;
  isAdmin: boolean;
  dragged: boolean;
  overdue: boolean;
  dueToday: boolean;
  onOpen: () => void;
  onToggleDone: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent) => void;
  onShareWhatsApp: (event: React.MouseEvent) => void;
  onShareEmail: (event: React.MouseEvent) => void;
  onDragStart: () => void;
}

export function TaskCard({ task, member, isAdmin, dragged, overdue, dueToday, onOpen, onToggleDone, onDelete, onShareWhatsApp, onShareEmail, onDragStart }: TaskCardProps) {
  const formatDue = (iso: string) => `${new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · ${new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div draggable onDragStart={onDragStart} onClick={onOpen} className={cn("group cursor-pointer rounded-xl border border-stone-200 bg-white p-3.5 transition-all duration-150 hover:border-stone-300 hover:shadow-[0_8px_20px_-14px_rgba(15,23,42,0.25)]", dragged && "opacity-50")}>
      <div className="flex items-start gap-2.5">
        <button onClick={onToggleDone} title={task.status === "done" ? "Reopen task" : "Mark as completed"} className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors", task.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 text-transparent hover:border-emerald-400")}>
          <Check className="h-3 w-3" strokeWidth={3} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold", categoryMeta[task.category].className)}>{categoryMeta[task.category].label}</span>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold", priorityMeta[task.priority].className)}><span className={cn("h-1.5 w-1.5 rounded-full", priorityMeta[task.priority].dot)} />{priorityMeta[task.priority].label}</span>
            {task.recurrence && <span title={`Repeats ${task.recurrence}`} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700"><Repeat className="h-3 w-3" /></span>}
          </div>
          <p className={cn("text-sm font-semibold text-stone-800", task.status === "done" && "text-stone-400 line-through")}>{task.title}</p>
          {task.description && <p className="mt-1 line-clamp-2 text-xs text-stone-500">{task.description}</p>}
          {task.attachments.length > 0 && <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-stone-500"><Paperclip className="h-3 w-3" />{task.attachments.length} attachment{task.attachments.length === 1 ? "" : "s"}</div>}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {task.assignee && <AssigneeLabel member={member} name={task.assignee} />}
              {task.due_date && <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold", overdue ? "bg-rose-50 text-rose-600" : dueToday ? "bg-amber-50 text-amber-700" : "text-stone-400")}><Calendar className="h-3 w-3" />{formatDue(task.due_date)}</span>}
            </div>
            {isAdmin && <button onClick={onDelete} aria-label="Delete task" className="rounded-lg p-1.5 text-stone-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>}
          </div>
          <button type="button" onClick={onShareWhatsApp} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">Share via WhatsApp</button>
          <button type="button" onClick={onShareEmail} className="mt-2 ml-2 inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100">Share via email</button>
        </div>
      </div>
    </div>
  );
}
