import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamTasksBoard } from "@/components/dashboard/team-tasks-board";

export default async function TeamTasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin-login");

  return <TeamTasksBoard currentUser={profile} />;
}
