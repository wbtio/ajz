import { createClient } from '@/lib/supabase/server'
import MessagesClient from './messages-client'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'رسائل التواصل | لوحة التحكم',
  description: 'إدارة رسائل التواصل الواردة',
}

export default async function MessagesPage() {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return <MessagesClient initialMessages={messages || []} />
}
