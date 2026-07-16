import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { canAccessPath } from '@/lib/permissions'
import { AiApplicationReview } from './ai-application-review'

export const dynamic = 'force-dynamic'

export default async function AiReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('users').select('role, permissions').eq('id', user.id).single()
  if (!profile || !canAccessPath(profile.role, '/dashboard/participation-cases/work/clients', profile.permissions as string[] | null)) redirect('/dashboard/home')
  const { data: registration } = await supabase.from('registrations').select('id, case_number, full_name, email, current_step, case_status, status, payment_status, documents, additional_data, clients(*), events(title, title_ar, date, location)').eq('id', id).maybeSingle()
  if (!registration) notFound()
  return <AiApplicationReview registration={registration} />
}
