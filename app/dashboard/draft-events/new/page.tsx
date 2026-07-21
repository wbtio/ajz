import { DraftEventForm } from '../_components/draft-event-form'
import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Add Draft Event | JAZ Admin',
}

export default async function NewDraftEventPage() {
  await requireDashboardAccess('/dashboard/draft-events/new')
  return (
    <div className="space-y-6 text-left [font-family:var(--font-plus-jakarta-sans),sans-serif]" dir="ltr" lang="en">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Draft Event</h1>
          <p className="text-muted-foreground">
            Fill in the details below to add a new event to the draft list.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/draft-events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit
          </Link>
        </Button>
      </div>

      <DraftEventForm />
    </div>
  )
}
