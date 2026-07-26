'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Eye, FileText, Trash2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { VISA_DOCUMENTS } from './wizard-constants'
import { formatFileSize } from './wizard-helpers'
import { useWizardDocuments, useWizardEvent, useWizardShell, useWizardVisa } from './wizard-view-context'

export function DocumentsStep() {
  const [otherDocumentName, setOtherDocumentName] = useState('')
  const { step, registration, client, caseNumber, setStep } = useWizardShell()
  const { selectedEvent } = useWizardEvent()
  const { visaDestination } = useWizardVisa()
  const documents = useWizardDocuments()

  if (step !== 5 || !registration) return null

  const readyRequiredCount = documents.requiredVisaDocuments.filter((definition) => !!documents.findDocument(definition)).length
  const allRequiredReady = readyRequiredCount === documents.requiredVisaDocuments.length

  return (
    <div className="w-full space-y-2.5 animate-in fade-in duration-300">
      <Card className="space-y-3 border-slate-200/80 bg-slate-50/40 p-3 shadow-sm sm:p-4">
        {/* Client summary */}
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-5">
            <div>
              <span className="text-slate-500 block">Client</span>
              <span className="font-bold text-slate-800">{client?.full_name_as_passport}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Passport</span>
              <span dir="ltr" className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Event</span>
              <span className="font-bold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Destination</span>
              <span className="font-bold text-slate-700">{visaDestination || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Case ID</span>
              <span dir="ltr" className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
          {/* Collected documents checklist */}
          <section className="h-full space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">1</span>
                <h3 className="text-sm font-bold text-slate-800">Collected Documents</h3>
              </div>
              <Badge variant="outline" className={cn('text-[10px]', allRequiredReady ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                {readyRequiredCount}/{documents.requiredVisaDocuments.length} required ready
              </Badge>
            </div>
            <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
              {VISA_DOCUMENTS.map((definition) => {
                const storedDocument = documents.findDocument(definition)
                const inputId = `document-upload-${definition.type}`
                const isUploading = documents.uploadingDocumentType === definition.type
                const isDeleting = storedDocument ? documents.deletingDocumentPath === storedDocument.path : false
                const currentUploadError = documents.uploadError?.type === definition.type ? documents.uploadError.message : ''
                const label = definition.label
                return (
                  <div key={definition.type} className={cn('flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-xs', !storedDocument && definition.required ? 'bg-amber-50/50' : 'bg-white')}>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {storedDocument ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> : <span className="size-2 shrink-0 rounded-full bg-amber-400" />}
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 block">{label}</span>
                        {storedDocument ? (
                          <span className="text-slate-500 block truncate" title={storedDocument.name}>
                            {storedDocument.name}
                            {/* The size comes from storage; it used to be a hardcoded placeholder. */}
                            <span className="ml-1.5 font-mono text-[10px] text-slate-400">{formatFileSize(storedDocument.size)}</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 block">Not uploaded</span>
                        )}
                        {currentUploadError && <span className="text-red-600 mt-1 block leading-4">{currentUploadError}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {storedDocument && (
                        <>
                          <Button type="button" variant="ghost" size="sm" onClick={() => window.open(storedDocument.path, '_blank', 'noopener,noreferrer')} className="h-7 px-2 text-[10px] text-slate-500">
                            <Eye className="mr-1 size-3.5" /> View
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => void documents.handleDeleteDocument(storedDocument)}
                            aria-label={`Delete ${label}`}
                            className="h-7 px-2 text-[10px] text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                      <input id={inputId} type="file" accept=".pdf,image/*" className="hidden" onChange={(event) => void documents.handleUploadDocument(event, label, definition.type)} />
                      <Button type="button" variant="ghost" size="sm" disabled={isUploading} onClick={() => document.getElementById(inputId)?.click()} className="h-7 px-2 text-[10px] text-[#8B0000]">
                        {isUploading ? 'Uploading…' : storedDocument ? 'Replace' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-700">Other document</p>
                  <p className="text-[10px] text-slate-500">Name it, upload it, then include it in the package or delivery.</p>
                </div>
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-[#8B0000]/25 bg-white px-2.5 text-[11px] font-semibold text-[#8B0000] hover:bg-[#8B0000]/5">
                  <Upload className="size-3.5" /> Upload
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const name = otherDocumentName.trim()
                      if (!name) {
                        toast.error('Enter the document name first.')
                        event.currentTarget.value = ''
                        return
                      }
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'file'
                      void documents.handleUploadDocument(event, name, `other_document_${Date.now()}_${slug}`)
                      setOtherDocumentName('')
                    }}
                  />
                </label>
              </div>
              <Input value={otherDocumentName} onChange={(event) => setOtherDocumentName(event.target.value)} placeholder="Document name, for example: Company badge" className="h-8 border-slate-200 bg-white text-xs" />
              {documents.registrationDocuments
                .filter((document) => document.type.startsWith('other_document_'))
                .map((document) => (
                  <div key={document.path} className="flex min-w-0 items-center gap-2 border-t border-slate-200 pt-2 text-xs">
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                    <span className="min-w-0 flex-1 truncate font-semibold text-slate-700" title={document.name}>{document.name}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{formatFileSize(document.size)}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => window.open(document.path, '_blank', 'noopener,noreferrer')} className="h-7 px-2 text-[10px] text-slate-500">
                      <Eye className="mr-1 size-3.5" /> View
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={documents.deletingDocumentPath === document.path}
                      onClick={() => void documents.handleDeleteDocument(document)}
                      aria-label={`Delete ${document.name}`}
                      className="h-7 px-2 text-[10px] text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
            </div>
          </section>

          {/* Package assembly */}
          <section className="flex h-full flex-col space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">2</span>
                <h3 className="text-sm font-bold text-slate-800">Package Assembly</h3>
              </div>
              <span className="text-[11px] text-slate-500">
                {documents.packageDocumentPaths.length} of {documents.mergeableDocuments.length} files selected
              </span>
            </div>
            <div className="space-y-2 rounded-md bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-700">Choose files to merge</p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => documents.setPackageDocumentPaths(documents.mergeableDocuments.map((document) => document.path))} className="h-8 text-[11px] text-[#8B0000]">
                    Select all
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => documents.setPackageDocumentPaths([])} className="h-8 text-[11px] text-slate-500">
                    Clear
                  </Button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 border-y border-slate-200 py-2 text-xs">
                <input type="checkbox" checked={documents.includeClientInfoInPackage} onChange={(event) => documents.setIncludeClientInfoInPackage(event.target.checked)} className="size-4 accent-[#8B0000]" />
                <span className="min-w-0">
                  <span className="block font-bold text-slate-800">Include client information</span>
                  <span className="block text-[11px] text-slate-500">Applicant, visa, appointment details and index.</span>
                </span>
              </label>
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                {documents.mergeableDocuments.map((document) => {
                  const selected = documents.packageDocumentPaths.includes(document.path)
                  const order = documents.packageDocumentPaths.indexOf(document.path)
                  return (
                    <label
                      key={document.path}
                      draggable={selected}
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', document.path)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        const draggedPath = event.dataTransfer.getData('text/plain')
                        if (!draggedPath || draggedPath === document.path) return
                        documents.setPackageDocumentPaths((current) => {
                          if (!current.includes(draggedPath) || !current.includes(document.path)) return current
                          const next = current.filter((path) => path !== draggedPath)
                          next.splice(next.indexOf(document.path), 0, draggedPath)
                          return next
                        })
                      }}
                      className={cn('flex items-center gap-2 border-b border-slate-100 px-1 py-2 hover:bg-white', selected ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer')}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(event) => documents.setPackageDocumentPaths((current) => (event.target.checked ? [...current, document.path] : current.filter((path) => path !== document.path)))}
                        className="size-4 accent-[#8B0000]"
                      />
                      <span className="w-4 shrink-0 text-center text-[10px] font-bold text-slate-400">{selected ? order + 1 : '—'}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-slate-700" title={document.name}>
                          {document.name}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Select the files, then drag the numbered files into the order you want in the merged PDF.</p>
            </div>
            <div className="mt-auto space-y-2 border-t border-slate-200 pt-3">
              <label className="block text-[11px] font-semibold text-slate-500">Final PDF name</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input dir="ltr" value={documents.packageName} onChange={(event) => documents.setPackageName(event.target.value)} className="h-9 min-w-0 flex-1 border-slate-200 bg-white text-xs font-mono" />
                <Button
                  onClick={() => void documents.handleMergeFiles()}
                  disabled={documents.isPackageGenerating || (documents.packageDocumentPaths.length === 0 && !documents.includeClientInfoInPackage)}
                  className="h-9 shrink-0 gap-1.5 bg-[#8B0000] text-xs text-white hover:bg-[#6B0000]"
                >
                  <FileText className="size-4" /> {documents.isPackageGenerating ? 'Merging…' : documents.packageDocument ? 'Rebuild PDF' : 'Create PDF'}
                </Button>
              </div>
              {documents.packageDocument && (
                <button
                  type="button"
                  onClick={() => window.open(documents.packageDocument!.path, '_blank', 'noopener,noreferrer')}
                  className="flex max-w-full items-center gap-2 rounded-md py-1 text-left text-xs text-emerald-700 hover:text-emerald-800"
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span className="truncate font-semibold" title={documents.packageDocument.name}>
                    {documents.packageDocument.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-500">{formatFileSize(documents.packageDocument.size)} • View PDF</span>
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={() => setStep(4)} className="border-slate-200 text-slate-600">
            Back
          </Button>
          {/* This now persists current_step so the applications list reflects the real stage. */}
          <Button onClick={() => void documents.handleAdvanceToPayment()} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
            Continue to Next Step
          </Button>
        </div>
      </Card>
    </div>
  )
}
