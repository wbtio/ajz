import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'
import { createClient } from '@/lib/supabase/server'
import MessagesClient from './messages-client'

export const metadata = {
  title: 'Contact Messages | Dashboard',
  description: 'Manage incoming contact messages',
}

export default async function MessagesPage() {
  await requireDashboardAccess('/dashboard/messages')

  const supabase = await createClient()

  // Fetch messages
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return <MessagesClient initialMessages={messages || []} />
}
