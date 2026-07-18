import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Names are entered manually and may contain accidental leading/trailing spaces. */
export function normalizeAssigneeIdentity(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export async function resolveUserIdByNameOrEmail(
  supabase: SupabaseServerClient,
  nameOrEmail: string
): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("role", ["admin", "team"]);

  const match = (data ?? []).find(
    (u) =>
      normalizeAssigneeIdentity(u.full_name) === normalizeAssigneeIdentity(nameOrEmail) ||
      normalizeAssigneeIdentity(u.email) === normalizeAssigneeIdentity(nameOrEmail)
  );
  return match?.id ?? null;
}

export async function notifyUser(
  supabase: SupabaseServerClient,
  params: { userId: string; type: string; title: string; body?: string; taskId?: string; linkUrl?: string }
) {
  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    task_id: params.taskId ?? null,
    link_url: params.linkUrl ?? null,
  });
}

export async function notifyAdmins(
  supabase: SupabaseServerClient,
  params: { excludeUserId?: string; type: string; title: string; body?: string; taskId?: string; linkUrl?: string }
) {
  const { data } = await supabase.from("users").select("id").eq("role", "admin");
  const targets = (data ?? []).filter((u) => u.id !== params.excludeUserId);
  if (targets.length === 0) return;

  await supabase.from("notifications").insert(
    targets.map((u) => ({
      user_id: u.id,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      task_id: params.taskId ?? null,
      link_url: params.linkUrl ?? null,
    }))
  );
}
