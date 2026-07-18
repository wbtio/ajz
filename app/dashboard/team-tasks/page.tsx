import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamTasksBoard } from "./_components/team-tasks-board";
import { canAccessPath } from "@/lib/permissions";

export default async function TeamTasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role, permissions")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin-login");

  if (!canAccessPath(profile.role, "/dashboard/team-tasks", profile.permissions)) {
    redirect("/dashboard/home");
  }

  return <TeamTasksBoard currentUser={profile} />;
}
