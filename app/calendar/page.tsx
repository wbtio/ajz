import { createClient } from '@/lib/supabase/server'
import { CalendarView } from './calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  return <CalendarView events={events || []} />
}
