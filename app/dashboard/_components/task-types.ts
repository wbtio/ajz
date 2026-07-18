import type { Recurrence } from "@/lib/recurrence";

export type { Recurrence } from "@/lib/recurrence";

export type ColumnStatus = "todo" | "in_progress" | "done";
export type Category = "development" | "events" | "visas" | "partners" | "marketing" | "general";
export type Priority = "low" | "medium" | "high";

export interface Attachment {
  name: string;
  url: string;
  type?: string | null;
  size?: number | null;
  uploaded_at: string;
}

export interface Task {
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
  attachments: Attachment[];
}

export interface Member {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
}

export interface CurrentUser {
  role: string | null;
  full_name: string | null;
  email: string;
}

export const normalizeTask = (task: Task): Task => ({
  ...task,
  attachments: Array.isArray(task.attachments) ? task.attachments : [],
});
