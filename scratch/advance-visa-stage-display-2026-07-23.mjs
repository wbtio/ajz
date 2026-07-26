import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const caseNumbers = [
  "JAZ-26-00002", "JAZ-26-00003", "JAZ-26-00004", "JAZ-2026-00001",
  "JAZ-26-00010", "JAZ-26-00011", "JAZ-26-00012", "JAZ-26-00013",
  "JAZ-26-00014", "JAZ-26-00015", "JAZ-26-00016",
];
const now = new Date().toISOString();
const result = [];

for (const caseNumber of caseNumbers) {
  const { data: rows, error: readError } = await supabase
    .from("registrations")
    .select("id,case_number,case_status,current_step,additional_data")
    .eq("case_number", caseNumber)
    .limit(2);
  if (readError) throw readError;
  if (!rows?.length) throw new Error(`Primary registration not found: ${caseNumber}`);
  if (rows.length !== 1) throw new Error(`Ambiguous primary registration: ${caseNumber}`);
  const row = rows[0];
  const completion = row.additional_data?.workflow_completion_status;
  if (row.current_step !== 4 || row.case_status !== "new_request" || completion !== "blocked") {
    throw new Error(`Guard failed for ${caseNumber}: ${row.case_status}/${row.current_step}/${completion}`);
  }
  const { error: updateError } = await supabase.from("registrations").update({
    case_status: "visa_in_progress",
    current_step: 5,
    updated_at: now,
  }).eq("id", row.id);
  if (updateError) throw updateError;
  const { error: eventError } = await supabase.from("registration_events").insert({
    registration_id: row.id,
    action: "visa_stage_display_advanced",
    description: "Visa data is persisted; moved the active workflow cursor to Documents while retaining document blockers.",
    performed_by: null,
    performed_by_name: "Codex (authorized by user)",
    metadata: { from_case_status: "new_request", to_case_status: "visa_in_progress", from_step: 4, to_step: 5, workflow_completion_status: "blocked" },
  });
  if (eventError) throw eventError;
  result.push({ caseNumber, id: row.id, fromStep: 4, toStep: 5 });
}

const { data: verified, error: verifyError } = await supabase
  .from("registrations")
  .select("case_number,case_status,current_step,additional_data")
  .in("case_number", caseNumbers);
if (verifyError) throw verifyError;
for (const row of verified || []) {
  if (row.case_status !== "visa_in_progress" || row.current_step !== 5 || row.additional_data?.workflow_completion_status !== "blocked") {
    throw new Error(`Verification failed for ${row.case_number}`);
  }
}
console.log(JSON.stringify({ updated: result.length, verified: verified?.length || 0, rows: result }, null, 2));
