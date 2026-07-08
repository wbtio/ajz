import { createClient } from "@supabase/supabase-js";

const url = "https://tnghigrmyvuqazucpcgg.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2hpZ3JteXZ1cWF6dWNwY2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyOTMxMywiZXhwIjoyMDgzNjA1MzEzfQ.muCMcgTKsfSRe3K8aRUJaF6nY9X1u7XCy05-us0ukh8";

const supabase = createClient(url, key);

// Default conference config structure (matches what's in edit/page.tsx)
const defaultConferenceConfig = {
  home: { enabled: true, content_ar: '', content_en: '' },
  theme: { enabled: true, content_ar: '', content_en: '', topics: [] },
  sponsors: { enabled: true, content_ar: '', content_en: '', form_fields: [], topics: [] },
  exhibitors: { enabled: true, content_ar: '', content_en: '', form_fields: [], topics: [] },
  partners: { enabled: true, content_ar: '', content_en: '', form_fields: [], topics: [] },
  registration: { 
    enabled: true, 
    content_ar: '', 
    content_en: '', 
    form_fields: [
      { id: 'full_name', type: 'text', label_en: 'Full Name', label_ar: 'الاسم الكامل', required: true, options: [], options_ar: [] },
      { id: 'email', type: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', required: true, options: [], options_ar: [] },
      { id: 'phone', type: 'text', label_en: 'Phone', label_ar: 'رقم الهاتف', required: true, options: [], options_ar: [] },
      { id: 'company', type: 'text', label_en: 'Company', label_ar: 'الشركة', required: false, options: [], options_ar: [] },
      { id: 'position', type: 'text', label_en: 'Position', label_ar: 'المسمى الوظيفي', required: false, options: [], options_ar: [] },
      { id: 'country', type: 'text', label_en: 'Country', label_ar: 'الدولة', required: false, options: [], options_ar: [] },
    ], 
    topics: [] 
  },
  program: { enabled: true, sessions: [] },
};

// Default registration_config - array of form fields for the registrations table
const defaultRegistrationConfig = [
  { id: 'full_name', type: 'text', label_en: 'Full Name', label_ar: 'الاسم الكامل', required: true, options: [], options_ar: [] },
  { id: 'email', type: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', required: true, options: [], options_ar: [] },
  { id: 'phone', type: 'text', label_en: 'Phone', label_ar: 'رقم الهاتف', required: true, options: [], options_ar: [] },
  { id: 'company', type: 'text', label_en: 'Company', label_ar: 'الشركة', required: false, options: [], options_ar: [] },
  { id: 'position', type: 'text', label_en: 'Position', label_ar: 'المسمى الوظيفي', required: false, options: [], options_ar: [] },
  { id: 'country', type: 'text', label_en: 'Country', label_ar: 'الدولة', required: false, options: [], options_ar: [] },
];

async function updateAllEvents() {
  // Get all events
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title_ar, title, conference_config, registration_config')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error.message);
    return;
  }

  console.log(`Found ${events.length} events\n`);

  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    const hasConf = event.conference_config && Object.keys(event.conference_config).length > 0;
    const hasReg = Array.isArray(event.registration_config) && event.registration_config.length > 0;
    
    if (hasConf && hasReg) {
      console.log(`⏭️  Skipping: ${event.title_ar || event.title} (already has config)`);
      skipped++;
      continue;
    }

    const updates = {};
    if (!hasConf) updates.conference_config = defaultConferenceConfig;
    if (!hasReg) updates.registration_config = defaultRegistrationConfig;

    const { error: updateError } = await supabase
      .from('events')
      .update(updates)
      .eq('id', event.id);

    if (updateError) {
      console.error(`❌ Failed to update ${event.title_ar || event.title}:`, updateError.message);
    } else {
      console.log(`✅ Updated: ${event.title_ar || event.title} (conf: ${!hasConf}, reg: ${!hasReg})`);
      updated++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${events.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

updateAllEvents();
