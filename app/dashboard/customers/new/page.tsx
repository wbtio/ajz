import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewCustomerForm } from './new-customer-form'

export default function NewCustomerPage() {
  return <div dir="ltr" lang="en" className="space-y-6">
    <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-[var(--jaz-muted)] hover:text-[var(--jaz-sovereign)]"><ArrowLeft className="size-4" /> Back to customer directory</Link>
    <header><p className="jaz-meta mb-2">Relationship management · Customer directory</p><h1 className="text-3xl font-bold text-[var(--jaz-ink)]">Add customer</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--jaz-muted)]">Create an independent customer record. Applications can be linked later.</p></header>
    <NewCustomerForm />
  </div>
}
