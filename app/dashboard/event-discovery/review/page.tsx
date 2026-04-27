import { redirect } from 'next/navigation'

export default function ReviewInterfacePage() {
    // For now, redirect to results with pending filter
    // In the future, this could be a dedicated "focus mode" queue for reviewers
    redirect('/dashboard/event-discovery/results?reviewStatus=pending')
}
