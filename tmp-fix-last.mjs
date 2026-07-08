import { createClient } from "@supabase/supabase-js";

const url = "https://tnghigrmyvuqazucpcgg.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2hpZ3JteXZ1cWF6dWNwY2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyOTMxMywiZXhwIjoyMDgzNjA1MzEzfQ.muCMcgTKsfSRe3K8aRUJaF6nY9X1u7XCy05-us0ukh8";

const supabase = createClient(url, key);

// Find the exact ID
const { data: events } = await supabase
  .from('events')
  .select('id, title_ar')
  .ilike('title_ar', '%إيروك%');

console.log('Events found:', events);

if (events && events.length > 0) {
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

  const defaultRegistrationConfig = [
    { id: 'full_name', type: 'text', label_en: 'Full Name', label_ar: 'الاسم الكامل', required: true, options: [], options_ar: [] },
    { id: 'email', type: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', required: true, options: [], options_ar: [] },
    { id: 'phone', type: 'text', label_en: 'Phone', label_ar: 'رقم الهاتف', required: true, options: [], options_ar: [] },
    { id: 'company', type: 'text', label_en: 'Company', label_ar: 'الشركة', required: false, options: [], options_ar: [] },
    { id: 'position', type: 'text', label_en: 'Position', label_ar: 'المسمى الوظيفي', required: false, options: [], options_ar: [] },
    { id: 'country', type: 'text', label_en: 'Country', label_ar: 'الدولة', required: false, options: [], options_ar: [] },
  ];

  const { error } = await supabase
    .from('events')
    .update({
      conference_config: defaultConferenceConfig,
      registration_config: defaultRegistrationConfig
    })
    .eq('id', events[0].id);

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Fixed last event!');
  }
}
