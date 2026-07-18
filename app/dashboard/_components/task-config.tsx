import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Category, ColumnStatus, Member, Priority, Recurrence } from "./task-types";

export const columns: { id: ColumnStatus; title: string; dot: string; icon: React.ReactNode }[] = [
  { id: "todo", title: "To do", dot: "bg-slate-400", icon: <ClipboardList className="h-4 w-4 text-slate-500" /> },
  { id: "in_progress", title: "In progress", dot: "bg-amber-500", icon: <Clock className="h-4 w-4 text-amber-600" /> },
  { id: "done", title: "Completed", dot: "bg-emerald-500", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
];

export const categoryMeta: Record<Category, { label: string; className: string }> = {
  development: { label: "Development", className: "bg-indigo-50 text-indigo-700" },
  events: { label: "Events", className: "bg-sky-50 text-sky-700" },
  visas: { label: "Invitations & visas", className: "bg-rose-50 text-rose-700" },
  partners: { label: "Partners", className: "bg-teal-50 text-teal-700" },
  marketing: { label: "Marketing", className: "bg-fuchsia-50 text-fuchsia-700" },
  general: { label: "General", className: "bg-stone-100 text-stone-600" },
};

export const priorityMeta: Record<Priority, { label: string; className: string; dot: string; rank: number }> = {
  high: { label: "High", className: "text-rose-700", dot: "bg-rose-500", rank: 0 },
  medium: { label: "Medium", className: "text-amber-700", dot: "bg-amber-500", rank: 1 },
  low: { label: "Low", className: "text-stone-500", dot: "bg-stone-400", rank: 2 },
};

export const emptyForm = {
  title: "",
  description: "",
  category: "general" as Category,
  priority: "medium" as Priority,
  assignee: "",
  due_date: "",
  recurrence: "" as Recurrence | "",
};

const avatarPalette = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-fuchsia-100 text-fuchsia-700", "bg-cyan-100 text-cyan-700", "bg-indigo-100 text-indigo-700", "bg-orange-100 text-orange-700"];
const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % avatarPalette.length;
  return avatarPalette[hash];
};

export function MemberAvatar({ member, name, size = "size-6" }: { member?: Member; name: string; size?: string }) {
  return <Avatar className={cn(size, "shrink-0")} title={name}><AvatarImage src={member?.avatar_url || undefined} alt={name} /><AvatarFallback className={cn("text-[10px] font-bold", avatarColor(name))}>{name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>;
}

export function AssigneeLabel({ member, name }: { member?: Member; name: string }) {
  return <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-stone-500" title={name}><MemberAvatar member={member} name={name} /><span className="truncate font-medium text-stone-600">{name}</span></div>;
}

export const memberName = (member: Member) => member.full_name || member.email;
export const memberEmailLabel = (member: Member) => member.email || "";
