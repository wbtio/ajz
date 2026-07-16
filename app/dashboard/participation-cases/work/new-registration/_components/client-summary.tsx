import { BriefcaseBusiness, CalendarDays, Fingerprint, MapPin, UserRound } from 'lucide-react'

type ClientSummaryData = {
    full_name_as_passport?: string | null
    passport_number?: string | null
    date_of_birth?: string | null
    place_of_birth?: string | null
    employer_name?: string | null
}

const fields = [
    { key: 'full_name_as_passport', label: 'Full name', icon: UserRound },
    { key: 'passport_number', label: 'Passport number', icon: Fingerprint, mono: true },
    { key: 'date_of_birth', label: 'Date of birth', icon: CalendarDays },
    { key: 'place_of_birth', label: 'Place of birth', icon: MapPin },
    { key: 'employer_name', label: 'Company', icon: BriefcaseBusiness },
] as const

export function ClientSummary({ client, caseNumber }: { client: ClientSummaryData; caseNumber: string }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-labelledby="client-summary-title">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                <h2 id="client-summary-title" className="text-xs font-bold text-slate-800">Client summary</h2>
                <span className="font-mono text-[11px] font-bold text-[#8B0000]">{caseNumber || 'Draft application'}</span>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
                {fields.map((field) => (
                    <div key={field.key} className="min-w-0 px-4 py-3">
                        <dt className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><field.icon className="size-3.5 text-slate-400" />{field.label}</dt>
                        <dd className={`mt-1 truncate text-xs font-bold text-slate-800 ${'mono' in field && field.mono ? 'font-mono' : ''}`} title={client[field.key] || undefined}>{client[field.key] || 'Not provided'}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}
