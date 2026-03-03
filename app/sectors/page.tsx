import { createClient } from '@/lib/supabase/server'
import { SectorsClient } from './sectors-client'

export const metadata = {
  title: 'Strategic Sectors | JAZ',
  description: 'Explore the strategic sectors we cover at JAZ',
}

export default async function SectorsPage() {
  const supabase = await createClient()

  const { data: sectors } = await supabase
    .from('sectors')
    .select('*')
    .order('created_at', { ascending: true })

  return <SectorsClient sectors={sectors} />
}

