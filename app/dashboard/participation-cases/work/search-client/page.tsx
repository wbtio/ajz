import { redirect } from 'next/navigation'

export default async function SearchClientRedirectPage() {
    redirect('/dashboard/participation-cases/work/clients?action=new')
}
