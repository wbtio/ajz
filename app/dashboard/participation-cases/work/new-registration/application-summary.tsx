import { cn } from '@/lib/utils'
import { CaseQrLink } from './case-qr-link'
import { X } from 'lucide-react'

export function ApplicationSummary({
  clientName,
  caseNumber,
  registrationId,
  assignee,
  status,
  lastEditor,
  nextAppointment,
  missingDocuments,
  open,
  onClose,
}: {
  clientName: string
  caseNumber: string
  registrationId: string
  assignee: string
  status: string
  lastEditor: string
  nextAppointment: string
  missingDocuments: number
  open: boolean
  onClose: () => void
}) {
  const items = [
    ['Client', clientName || '—'],
    ['Case', caseNumber || 'Draft'],
    ['Owner', assignee || 'Unassigned'],
    ['Status', status],
    ['Last edit', lastEditor || '—'],
    ['Appointment', nextAppointment || 'Not booked'],
  ]
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/35 p-4 pt-20" role="dialog" aria-modal="true" aria-label="Application summary" onMouseDown={onClose}>
      <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B0000]">Application overview</p><h2 className="mt-1 text-lg font-bold text-slate-900">Application summary</h2></div>
          <button type="button" onClick={onClose} aria-label="Close application summary" className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Application summary details">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <span className="block truncate text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
          <span className="block truncate font-semibold text-slate-700" title={value}>{value}</span>
        </div>
      ))}
      <div className={cn('rounded-lg px-3 py-2.5', missingDocuments > 0 ? 'bg-amber-50/70' : 'bg-emerald-50/60')}>
        <span className="block text-[9px] font-medium uppercase tracking-wide text-slate-400">Documents</span>
        <span className={cn('block font-semibold', missingDocuments > 0 ? 'text-amber-700' : 'text-emerald-700')}>
          {missingDocuments > 0 ? `${missingDocuments} missing` : 'Complete'}
        </span>
      </div>
        </div>
        {registrationId && <div className="mt-4 flex justify-end"><CaseQrLink registrationId={registrationId} /></div>}
      </div>
    </div>
  )
}
