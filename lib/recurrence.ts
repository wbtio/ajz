export type Recurrence = "daily" | "weekly" | "monthly";

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  daily: "يوميًا",
  weekly: "أسبوعيًا",
  monthly: "شهريًا",
};

export function isRecurrence(value: unknown): value is Recurrence {
  return value === "daily" || value === "weekly" || value === "monthly";
}

/** يحسب موعد التسليم التالي للنسخة الجديدة من مهمة متكررة */
export function nextDueDate(recurrence: Recurrence, fromDate: string | null): string {
  const base = fromDate ? new Date(fromDate) : new Date();
  if (recurrence === "daily") base.setDate(base.getDate() + 1);
  else if (recurrence === "weekly") base.setDate(base.getDate() + 7);
  else if (recurrence === "monthly") base.setMonth(base.getMonth() + 1);
  return base.toISOString();
}
