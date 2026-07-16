import { redirect } from 'next/navigation'

export default async function NewRegistrationRedirectPage() {
    redirect('/dashboard/participation-cases/work/clients?action=new')
}
