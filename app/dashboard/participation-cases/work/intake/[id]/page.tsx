import { redirect } from 'next/navigation'

// دُمجت تفاصيل الاستقبال مع صفحة الطلب الكاملة.
export default async function IntakeDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    redirect(`/dashboard/participation-cases/${id}`)
}
