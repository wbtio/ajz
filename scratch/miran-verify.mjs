import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const reg='a7d497b6-865c-4a86-922c-19009628ec9c'
for (const [label,q] of [
 ['registration_events',s.from('registration_events').select('*').eq('registration_id',reg)],
 ['case_registrations',s.from('case_registrations').select('*').eq('registration_id',reg)],
 ['storage',s.storage.from('events-bucket').list(`registrations/${reg}`,{limit:100})],
]) { const {data,error}=await q; console.log(label,JSON.stringify({data,error},null,2)) }
