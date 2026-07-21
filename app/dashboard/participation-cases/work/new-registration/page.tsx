import { redirect } from 'next/navigation'

export default async function NewRegistrationRedirectPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string; step?: string }>
}) {
    const params = await searchParams
    if (params.id) {
        const step = Number(params.step)
        const safeStep = Number.isInteger(step) && step >= 1 && step <= 7 ? step : 4
        redirect(`/dashboard/participation-cases/work/clients?registrationId=${encodeURIComponent(params.id)}&step=${safeStep}`)
    }
    redirect('/dashboard/participation-cases/work/clients?action=new')
}
