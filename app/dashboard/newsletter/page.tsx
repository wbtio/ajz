import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'
import { createClient } from '@/lib/supabase/server'
import NewsletterClient from './newsletter-client'

export const metadata = {
  title: 'Newsletter Subscribers | Dashboard',
  description: 'People who subscribed to the JAZ newsletter from the website',
}

export default async function NewsletterPage() {
  const profile = await requireDashboardAccess('/dashboard/newsletter')

  const supabase = await createClient()
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, locale, source, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <NewsletterClient
      initialSubscribers={subscribers ?? []}
      isAdmin={profile.role === 'admin'}
    />
  )
}
