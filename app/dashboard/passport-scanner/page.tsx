import { PassportScanner } from '@/app/dashboard/_components/passport-scanner'
import { requireDashboardAccess } from '@/lib/auth/require-dashboard-access'

export default async function PassportScannerPage() {
  await requireDashboardAccess('/dashboard/passport-scanner')

  return <PassportScanner />;
}
