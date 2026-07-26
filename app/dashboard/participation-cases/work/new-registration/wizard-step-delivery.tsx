'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, ExternalLink, FileText, FolderKanban, Mail, MessageCircle, Save, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatFileSize } from './wizard-helpers'
import { useWizardDelivery, useWizardDocuments, useWizardIntake, useWizardShell } from './wizard-view-context'

export function DeliveryStep() {
  const router = useRouter()
  const { step, client, setStep } = useWizardShell()
  const { searchForm } = useWizardIntake()
  const { registrationDocuments } = useWizardDocuments()
  const delivery = useWizardDelivery()

  if (step !== 7) return null

  const isSent = delivery.deliveryStatus === 'sent'
  const isSaving = delivery.deliverySaveState === 'saving'
  const recipientEmail = String(client?.email || searchForm.email || '').trim()

  return (
    <div className="w-full animate-in fade-in duration-300">
      <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
        <div className={cn('flex items-center justify-between gap-3 rounded-md border px-3 py-2', isSent ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900')}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isSent ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Clock className="size-4 text-amber-600" />}
            <span>{isSent ? 'Client file delivery has been recorded.' : 'The case is complete. Confirm delivery to the client.'}</span>
          </div>
          <Badge variant="outline" className={isSent ? 'border-emerald-200 text-emerald-700' : 'border-amber-200 text-amber-700'}>
            {isSent ? 'Sent' : 'Ready to send'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Files to share with the client</h3>
                <p className="text-[11px] text-slate-500 mt-1">Select all or only the files the client needs.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => delivery.setDeliveryDocumentPaths(registrationDocuments.map((document) => document.path))}
                className="h-8 text-[11px] text-[#8B0000]"
              >
                Select all
              </Button>
            </div>
            <div className="divide-y divide-slate-100">
              {registrationDocuments.length > 0 ? (
                registrationDocuments.map((document) => {
                  const selected = delivery.deliveryDocumentPaths.includes(document.path)
                  return (
                    <div key={`${document.type}-${document.path}`} className={cn('flex items-center gap-3 px-4 py-3 transition-colors', selected ? 'bg-slate-50/80' : 'bg-white')}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          delivery.setDeliveryDocumentPaths((current) => (selected ? current.filter((path) => path !== document.path) : [...current, document.path]))
                        }
                        className="size-4 accent-[#8B0000]"
                        aria-label={`Share ${document.name}`}
                      />
                      <FileText className="size-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{document.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{document.type} • {formatFileSize(document.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.path, '_blank', 'noopener,noreferrer')}
                        className="size-8 p-0 text-slate-400 hover:text-[#8B0000]"
                        aria-label={`View ${document.name}`}
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="px-4 py-10 text-center text-xs text-slate-500">No files have been saved for this case. Return to Docs to upload them.</div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Delivery message</h3>
              <p className="text-[11px] text-slate-500 mt-1">Write the message, then open WhatsApp or email to send it.</p>
            </div>
            <textarea
              value={delivery.deliveryMessage}
              onChange={(event) => delivery.setDeliveryMessage(event.target.value)}
              rows={6}
              placeholder="Write a short message to the client..."
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-6 text-slate-700 outline-none focus:border-[#8B0000]/40 focus:ring-2 focus:ring-[#8B0000]/10"
            />
            <div className="grid grid-cols-1 gap-2">
              <Button type="button" onClick={delivery.openWhatsApp} disabled={registrationDocuments.length === 0} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-2">
                <MessageCircle className="size-4" /> Open WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={delivery.openDeliveryEmail}
                disabled={!recipientEmail}
                className="border-slate-300 bg-white text-slate-700 hover:border-[#8B0000]/40 hover:bg-[#8B0000]/5 hover:text-[#8B0000] gap-2"
              >
                <Mail className="size-4" /> Send email
              </Button>
            </div>
            {/* Nothing on this step used to be persisted: the message, the file
                selection and the delivery status were all discarded when the
                wizard closed, so a case could never actually be closed. */}
            <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void delivery.handleSaveDelivery(false)}
                disabled={isSaving}
                className="border-slate-300 bg-white text-slate-700 gap-2"
              >
                <Save className="size-4" /> {isSaving ? 'Saving…' : 'Save draft'}
              </Button>
              <Button
                type="button"
                onClick={() => void delivery.handleSaveDelivery(true)}
                disabled={isSaving || delivery.deliveryDocumentPaths.length === 0}
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
              >
                <Send className="size-4" /> {isSent ? 'Update delivery record' : 'Confirm delivery & close case'}
              </Button>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => setStep(6)} className="border-slate-200 text-slate-600">
            Back to payment
          </Button>
          <Button onClick={() => router.push('/dashboard/participation-cases/work/clients')} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5">
            <FolderKanban className="size-4" /> Back to Applications
          </Button>
        </div>
      </Card>
    </div>
  )
}
