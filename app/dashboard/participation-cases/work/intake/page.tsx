import { redirect } from 'next/navigation'

// Intake has been merged into the main Cases page.
export default function IntakeRedirect() {
    redirect('/dashboard/participation-cases')
}
