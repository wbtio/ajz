import { DraftEventForm } from '../_components/draft-event-form'

export const metadata = {
  title: 'Add Draft Event | JAZ Admin',
}

export default function NewDraftEventPage() {
  return (
    <div className="space-y-6 text-left [font-family:var(--font-plus-jakarta-sans),sans-serif]" dir="ltr" lang="en">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Draft Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new event to the draft list.
        </p>
      </div>

      <DraftEventForm />
    </div>
  )
}
