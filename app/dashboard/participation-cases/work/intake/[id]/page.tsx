import { redirect } from 'next/navigation'

// Intake details have been merged into the full case page.
export default async function IntakeDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    redirect(`/dashboard/participation-cases/${id}`)
}
