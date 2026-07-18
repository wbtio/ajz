import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PassportScanner } from "@/app/dashboard/_components/passport-scanner";

export default async function PassportScannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin-login");

  return <PassportScanner />;
}
