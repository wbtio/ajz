import { redirect } from 'next/navigation'

export default async function ParticipationCasesRedirectPage() {
    redirect('/dashboard/participation-cases/work/clients')
}
