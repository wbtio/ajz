import { cn } from '@/lib/utils'
import { CaseQrLink } from './case-qr-link'

export function ApplicationSummary({
  clientName,
  caseNumber,
  registrationId,
  assignee,
  status,
  lastEditor,
  nextAppointment,
  missingDocuments,
}: {
  clientName: string
  caseNumber: string
  registrationId: string
  assignee: string
  status: string
  lastEditor: string
  nextAppointment: string
  missingDocuments: number
}) {
  const items = [
    ['Client', clientName || '—'],
    ['Case', caseNumber || 'Draft'],
    ['Owner', assignee || 'Unassigned'],
    ['Status', status],
    ['Last edit', lastEditor || '—'],
    ['Appointment', nextAppointment || 'Not booked'],
  ]
  return (
    <div className="jaz-no-scrollbar flex min-w-0 items-center gap-0 overflow-x-auto rounded-md border border-slate-200/80 bg-white text-[10px] shadow-[0_1px_2px_rgba(15,23,42,0.03)]" aria-label="Application summary">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-[100px] shrink-0 border-r border-slate-100 px-2.5 py-1.5 last:border-r-0 sm:min-w-0 sm:flex-1">
          <span className="block truncate text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
          <span className="block truncate font-semibold text-slate-700" title={value}>{value}</span>
        </div>
      ))}
      <div className={cn('min-w-[88px] shrink-0 px-2.5 py-1.5 sm:min-w-0 sm:flex-[0.7]', missingDocuments > 0 ? 'bg-amber-50/70' : 'bg-emerald-50/60')}>
        <span className="block text-[9px] font-medium uppercase tracking-wide text-slate-400">Documents</span>
        <span className={cn('block font-semibold', missingDocuments > 0 ? 'text-amber-700' : 'text-emerald-700')}>
          {missingDocuments > 0 ? `${missingDocuments} missing` : 'Complete'}
        </span>
      </div>
      {registrationId && <CaseQrLink registrationId={registrationId} />}
    </div>
  )
}
