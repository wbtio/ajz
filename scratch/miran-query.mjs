import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
for (const [label, q] of [
  ['clients', s.from('clients').select('*').or('passport_number.eq.B00548044,full_name_as_passport.ilike.MIRAN AKRAM%')],
  ['drift_events', s.from('drift_events').select('*').or('title.ilike.%CIGRE%,title.ilike.%PARIS SESSION%')],
  ['events', s.from('events').select('*').or('title.ilike.%CIGRE%,title.ilike.%PARIS SESSION%')],
  ['registrations', s.from('registrations').select('id,case_number,full_name,client_id,event_id,case_status,current_step,documents,form_data,additional_data').or('case_number.eq.JAZ-2026-00001,full_name.ilike.MIRAN AKRAM%')],
]) { const {data,error}=await q; console.log(label, JSON.stringify({data,error},null,2)) }
