import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DraftEventForm } from '../../_components/draft-event-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Edit Draft Event | JAZ Admin',
}

export default async function EditDraftEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="space-y-6 text-left [font-family:var(--font-plus-jakarta-sans),sans-serif]" dir="ltr" lang="en">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Draft Event</h1>
          <p className="text-muted-foreground">
            Update the details of this draft event.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/draft-events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
      </div>

      <DraftEventForm eventId={id} initialData={event} />
    </div>
  )
}
