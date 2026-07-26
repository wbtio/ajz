'use client'

import { toast } from 'sonner'
import { Archive, CheckCircle2, Download, FileCode, Lock, Printer, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatFileSize } from './wizard-helpers'
import { useWizardEvent, useWizardPayment, useWizardShell, useWizardVisa } from './wizard-view-context'

const PAYMENT_CATEGORIES = [
  ['Visa Application & Services', 'Visa Application & Services'],
  ['Event Registration', 'Event Registration'],
  ['Invitation Letter', 'Invitation Letter'],
  ['Travel Insurance', 'Travel Insurance'],
  ['Appointment Booking', 'Appointment Booking'],
  ['Document Processing', 'Document Processing'],
  ['Consultation', 'Consultation'],
  ['Training / Event Package', 'Training / Event Package'],
  ['Other', 'Other'],
]

const PAYMENT_METHODS = [
  ['Bank Transfer', 'Bank Transfer'],
  ['Cash', 'Cash'],
  ['Asiacell Transfer', 'Asiacell Transfer'],
  ['Zain Cash', 'Zain Cash'],
  ['Qi Card', 'Qi Card'],
  ['Visa / Mastercard', 'Visa / Mastercard'],
  ['POS Terminal', 'POS Terminal'],
  ['K Pay', 'K Pay'],
  ['Online Payment', 'Online Payment'],
  ['Cheque', 'Cheque'],
  ['Other', 'Other'],
]

// EUR was already read, saved and rendered by the rest of the flow but was
// missing from this list, so a euro-priced event showed an empty currency.
const CURRENCIES = [
  ['USD', 'USD - US Dollar ($)'],
  ['IQD', 'IQD - Iraqi Dinar'],
  ['EUR', 'EUR - Euro (€)'],
]

export function PaymentStep() {
  const { step, registration, client, caseNumber, currentUser, setStep } = useWizardShell()
  const { selectedEvent } = useWizardEvent()
  const { visaDestination } = useWizardVisa()
  const payment = useWizardPayment()

  if (step !== 6 || !registration) return null

  const money = (value: number) => `${payment.currencySymbol} ${value.toFixed(2)}`
  const paymentBadge = payment.amountPaid <= 0 ? 'Awaiting payment' : payment.balanceDue > 0 ? 'Partially Paid' : 'Fully Paid'
  const paymentBadgeClass = payment.amountPaid <= 0
    ? 'bg-slate-100 text-slate-600 border-slate-200'
    : payment.balanceDue > 0
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200'

  return (
    <div className="w-full space-y-2.5 animate-in fade-in duration-300">
      <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 className="size-4 text-emerald-600" />
        <span>The visa package has been prepared successfully. You can now proceed with payment and receipt issuance.</span>
      </div>

      <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
        {/* Client summary */}
        <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
          <h3 className="sr-only">Client and case summary</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <span className="text-slate-400 block">Full Name</span>
              <span className="font-bold text-slate-700">{client?.full_name_as_passport}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Passport Number</span>
              <span dir="ltr" className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Event Name</span>
              <span className="font-bold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Destination Country</span>
              <span className="font-bold text-slate-700">{visaDestination || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Application ID</span>
              <span dir="ltr" className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          {/* Payment details */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">1. Payment Details</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Payment Category</label>
                <select value={payment.paymentCategory} onChange={(event) => payment.setPaymentCategory(event.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                  {PAYMENT_CATEGORIES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Payment Method</label>
                <select value={payment.paymentMethod} onChange={(event) => payment.setPaymentMethod(event.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                  {PAYMENT_METHODS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Payment Date</label>
                <Input type="date" value={payment.paymentDate} onChange={(event) => payment.setPaymentDate(event.target.value)} className="h-9 border-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Receipt Number</label>
                {/* Same value the generated PDF uses — this used to be a hardcoded 2026 string. */}
                <Input dir="ltr" value={payment.receiptId} disabled className="h-9 bg-slate-50 border-slate-200 text-slate-500 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Currency</label>
                <select value={payment.currency} onChange={(event) => payment.setCurrency(event.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                  {CURRENCIES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Handled By</label>
                <Input value={currentUser?.full_name || currentUser?.email || '—'} disabled className="h-9 bg-slate-50 border-slate-200 text-slate-500" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">Notes</label>
                <textarea value={payment.paymentNotes} onChange={(event) => payment.setPaymentNotes(event.target.value)} placeholder="Payment received..." className="w-full h-16 p-2 border border-slate-200 rounded-md bg-white focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Pricing / payment confirmation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-800">{payment.canEditFeeBreakdown ? '2. Pricing & Payment' : '2. Payment Confirmation'}</h3>
              <Badge variant="outline" className={cn('text-[10px]', payment.canEditFeeBreakdown ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600')}>
                {payment.canEditFeeBreakdown ? 'Finance access' : 'Confirm payment only'}
              </Badge>
            </div>

            {payment.canEditFeeBreakdown ? (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/20 text-xs">
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Event pricing (locked)</div>
                {payment.pricingItems.length === 0 ? (
                  <div className="px-3 py-2 text-slate-400 italic">No pricing items defined for this event yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 font-medium text-slate-700">
                    {payment.pricingItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2">
                        <span>{item.label}</span>
                        <span className="text-slate-800">{payment.currencySymbol} {item.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 border-t border-slate-100">Discount (optional)</div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-slate-700">Discount</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      value={payment.discount}
                      onChange={(event) => payment.setDiscount(Math.max(0, parseFloat(event.target.value) || 0))}
                      className="w-20 h-7 text-right p-1 border-slate-200 text-xs font-semibold text-rose-600"
                    />
                    <span className="text-slate-400">{payment.currencySymbol}</span>
                  </div>
                </div>

                <div className="bg-slate-100/80 p-3 border-t border-slate-200 font-bold text-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Amount</span>
                    <span>{payment.currencySymbol} {payment.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-700">
                    <span>Amount Paid <span className="text-[10px] font-normal text-slate-400">(what the customer paid)</span></span>
                    <div className="flex items-center gap-1">
                      <Input type="number" min="0" value={payment.amountPaid} onChange={(event) => payment.setAmountPaid(Math.max(0, parseFloat(event.target.value) || 0))} className="w-24 h-7 text-right p-1 border-slate-300 text-xs font-bold text-emerald-700" />
                      <span>{payment.currencySymbol}</span>
                    </div>
                  </div>
                  <div className={cn('flex justify-between items-center text-xs border-t border-slate-200/80 pt-1.5', payment.balanceDue > 0 ? 'text-amber-700' : 'text-slate-500')}>
                    <span>Balance Due</span>
                    <span>{payment.currencySymbol} {payment.balanceDue}</span>
                  </div>
                  <div className="mt-1">
                    <Badge className={paymentBadgeClass}>{paymentBadge}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-4 text-xs space-y-3">
                <p className="text-[11px] text-slate-500">Enter the amount the customer actually paid. The detailed service prices are visible to the finance team only.</p>
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>Amount Paid</span>
                  <div className="flex items-center gap-1">
                    <Input type="number" min="0" value={payment.amountPaid} onChange={(event) => payment.setAmountPaid(Math.max(0, parseFloat(event.target.value) || 0))} className="w-24 h-7 text-right p-1 border-slate-300 text-xs font-bold text-emerald-700" />
                    <span>{payment.currencySymbol}</span>
                  </div>
                </div>
                <div>
                  <Badge className={paymentBadgeClass}>{paymentBadge}</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Lock className="size-3.5" /> Service prices and totals are restricted to finance-authorized users.
                </p>
              </div>
            )}
          </div>

          {/* Receipt preview */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">3. Receipt Information</h3>
            <Card className="space-y-3 border-slate-200/80 p-3 text-xs shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-slate-400 block font-medium">Receipt ID</span>
                  <span dir="ltr" className="font-bold font-mono text-slate-800 text-sm">{payment.receiptId}</span>
                </div>
                <Badge className={paymentBadgeClass}>{paymentBadge}</Badge>
              </div>

              <div className="space-y-2 text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Client Name</span>
                  <span className="text-slate-800">{client?.full_name_as_passport}</span>
                </div>
                <div className="flex justify-between">
                  <span>Application ID</span>
                  <span dir="ltr" className="text-slate-800 font-mono">{caseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Event Name</span>
                  <span className="text-slate-800">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="text-slate-800">{PAYMENT_METHODS.find(([value]) => value === payment.paymentMethod)?.[1] || payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-dashed border-slate-100">
                  <span>Total Paid</span>
                  <span>{money(payment.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue Date</span>
                  <span>{new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>

              {payment.storedReceipt && (
                <div className="border border-slate-200 bg-white rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="size-8 text-rose-600" />
                    <div className="min-w-0">
                      <span className="font-bold block truncate text-slate-800" title={payment.storedReceipt.name}>{payment.storedReceipt.name}</span>
                      {/* Real size from storage instead of the old fixed "92 KB". */}
                      <span className="text-[10px] text-slate-400 font-mono">PDF file • {formatFileSize(payment.storedReceipt.size)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void payment.handleDownloadReceipt()} aria-label="Download receipt" className="size-8 text-slate-400 hover:text-slate-600 flex items-center justify-center p-0">
                    <Download className="size-4" />
                  </Button>
                </div>
              )}
              {payment.receiptArchivedAt && (
                <p className="text-[11px] text-emerald-700">Receipt archived on {new Date(payment.receiptArchivedAt).toLocaleString('en-GB')}</p>
              )}
            </Card>
          </div>
        </div>

        {/* Receipt actions */}
        <div className="space-y-2.5 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-800">4. Receipt Actions</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => void payment.handleGenerateReceipt()} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
              <FileCode className="size-4" /> Generate Both Receipts
            </Button>
            <Button variant="outline" size="sm" onClick={() => void payment.handleDownloadReceipt()} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
              <Download className="size-4" /> Download Company Receipt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (payment.clientReceiptUrl) window.open(payment.clientReceiptUrl, '_blank', 'noopener,noreferrer')
                else toast.error('Generate both receipts first.')
              }}
              className="border-emerald-200 text-emerald-700 gap-1.5 text-xs"
            >
              <Download className="size-4" /> Download Client Receipt
            </Button>
            {/* These two handlers existed but had no buttons wired to them. */}
            <Button variant="outline" size="sm" onClick={() => void payment.handlePrintReceipt()} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
              <Printer className="size-4" /> Print Receipt
            </Button>
            <Button variant="outline" size="sm" onClick={() => void payment.handleArchiveReceipt()} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
              <Archive className="size-4" /> Archive Receipt
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={() => setStep(5)} className="border-slate-200 text-slate-600">
            Back
          </Button>
          <div className="flex flex-wrap gap-2">
            {/* handleSavePaymentDraft existed but was never reachable from the UI,
                so everything typed here was lost unless a receipt was generated. */}
            <Button variant="outline" onClick={() => void payment.handleSavePaymentDraft()} className="border-slate-200 text-slate-600 gap-1.5">
              <Save className="size-4" /> Save payment details
            </Button>
            <Button onClick={() => void payment.handleAdvanceToDelivery()} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
              Continue to Next Step
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
