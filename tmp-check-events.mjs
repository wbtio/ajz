import { createClient } from "@supabase/supabase-js";

const url = "https://tnghigrmyvuqazucpcgg.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2hpZ3JteXZ1cWF6dWNwY2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyOTMxMywiZXhwIjoyMDgzNjA1MzEzfQ.muCMcgTKsfSRe3K8aRUJaF6nY9X1u7XCy05-us0ukh8";

const supabase = createClient(url, key);

const { data: events, error } = await supabase
  .from("events")
  .select("id, title, title_ar, status, conference_config, registration_config")
  .order("created_at", { ascending: false });

if (error) {
  console.log("Error:", error.message);
} else {
  console.log(`Total events: ${events.length}\n`);
  let hasConfCount = 0;
  let hasRegCount = 0;
  
  for (const ev of events) {
    const hasConf = ev.conference_config && Object.keys(ev.conference_config).length > 0;
    const hasReg = Array.isArray(ev.registration_config) && ev.registration_config.length > 0;
    
    if (hasConf) hasConfCount++;
    if (hasReg) hasRegCount++;
  }
  
  console.log(`Events with conference_config: ${hasConfCount}`);
  console.log(`Events with registration_config: ${hasRegCount}`);
  
  // Show first 20 that DON'T have config
  console.log('\n--- Events WITHOUT config ---');
  let shown = 0;
  for (const ev of events) {
    const hasConf = ev.conference_config && Object.keys(ev.conference_config).length > 0;
    const hasReg = Array.isArray(ev.registration_config) && ev.registration_config.length > 0;
    
    if (!hasConf || !hasReg) {
      console.log(`[${ev.status || "?"}] ${ev.title_ar || ev.title || "بدون عنوان"}`);
      console.log(`  ID: ${ev.id.substring(0, 8)}`);
      console.log(`  conference_config: ${hasConf ? "✅" : "❌"}`);
      console.log(`  registration_config: ${hasReg ? "✅" : "❌"}`);
      console.log("");
      shown++;
      if (shown >= 20) break;
    }
  }
}
