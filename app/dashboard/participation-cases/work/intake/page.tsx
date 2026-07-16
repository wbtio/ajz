import { redirect } from 'next/navigation'

// دُمجت «استقبال الطلبات» مع صفحة «الطلبات» الرئيسية.
export default function IntakeRedirect() {
    redirect('/dashboard/participation-cases')
}
