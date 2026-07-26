'use client'

import { Bell, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Plus, Trash2, Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { IRAQI_GOVERNORATES, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS } from './wizard-constants'
import { useWizardDocuments, useWizardEvent, useWizardShell, useWizardVisa } from './wizard-view-context'

const SAVE_STATE_LABEL: Record<string, string> = {
  saved: 'Saved',
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  error: 'Save failed',
}

const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'Booked', label: 'Booked' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Rescheduled', label: 'Rescheduled' },
]

export function VisaStep() {
  const { step, registration, client, caseNumber, setStep } = useWizardShell()
  const { selectedEvent } = useWizardEvent()
  const { handleUploadDocument, findDocument, uploadingDocumentType } = useWizardDocuments()
  const visa = useWizardVisa()

  if (step !== 4 || !registration) return null

  const appointmentDocument = findDocument({ type: 'appointment_confirmation', aliases: ['appointment_confirmation', 'tls_appointment'], label: 'Appointment Confirmation' })
  const visaFormDocument = findDocument({ type: 'visa_application_form', aliases: ['visa_application_form'], label: 'Visa Application Form' })

  return (
    <div className="w-full space-y-2.5 animate-in fade-in duration-300">
      <div role="status" className="flex items-center justify-between gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs text-emerald-800">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
          <span>
            <strong className="font-semibold">Registration complete.</strong> Continue with the visa setup and appointment.
          </span>
        </span>
        <span className={cn('shrink-0 text-[11px] font-semibold', visa.visaSaveState === 'error' ? 'text-red-600' : 'text-emerald-700')}>
          {SAVE_STATE_LABEL[visa.visaSaveState]}
        </span>
      </div>

      <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
        {/* Client summary */}
        <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
          <h3 className="sr-only">Client and event summary</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Client</span>
              <span className="block truncate font-semibold text-slate-700">{client?.full_name_as_passport}</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Passport</span>
              <span dir="ltr" className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Date of birth</span>
              <span dir="ltr" className="font-bold text-slate-700">{client?.date_of_birth}</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Destination</span>
              <span className="font-bold text-slate-700">{visa.visaDestination || '—'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Event</span>
              <span className="block truncate font-semibold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Application ID</span>
              <span dir="ltr" className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
            </div>
          </div>
        </div>

        {/* Visa platform setup */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-x-1 gap-y-3 rounded-xl border border-slate-200/80 bg-[linear-gradient(to_bottom,rgba(254,242,242,0.82)_0_52%,rgba(240,253,244,0.78)_52%_100%)] p-3 sm:grid-cols-2 lg:grid-cols-[repeat(14,minmax(0,1fr))]">
            <h3 className="text-sm font-bold text-slate-800 lg:col-span-14">Embassy Appointment And Setup</h3>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Visa Country</label>
              <select
                value={visa.visaDestination && VISA_ROUTES.some((route) => route.country === visa.visaDestination) ? visa.visaDestination : visa.visaDestination ? 'Other' : ''}
                onChange={(event) => (event.target.value === 'Other' ? visa.setVisaDestination('Other') : visa.handleVisaDestinationChange(event.target.value))}
                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/15"
              >
                <option value="">Select visa country</option>
                {VISA_ROUTES.map((route) => (
                  <option key={route.country} value={route.country}>
                    {route.country}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {visa.visaDestination && !VISA_ROUTES.some((route) => route.country === visa.visaDestination) && (
                <Input
                  value={visa.visaDestination === 'Other' ? '' : visa.visaDestination}
                  onChange={(event) => visa.setVisaDestination(event.target.value)}
                  className="border-slate-200"
                  placeholder="Enter visa country"
                />
              )}
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Embassy / Consulate *</label>
              <Select
                value={visa.visaEmbassyCity}
                onValueChange={(city) => {
                  visa.setVisaEmbassyCity(city)
                  visa.setVisaEmbassy(visa.visaDestination && city ? `${visa.visaDestination} Embassy in ${city}` : '')
                }}
              >
                <SelectTrigger aria-label="Embassy or consulate city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {IRAQI_GOVERNORATES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {visa.visaEmbassy && <p className="truncate text-[11px] text-slate-500" title={visa.visaEmbassy}>{visa.visaEmbassy}</p>}
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Visa Type *</label>
              <select value={visa.visaType} onChange={(event) => visa.setVisaType(event.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                <option value="">—</option>
                {VISA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Visa Application</label>
              <Input value={visa.visaPlatform} onChange={(event) => visa.setVisaPlatform(event.target.value)} className="border-slate-200" placeholder="Official portal or platform" />
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Visa Center *</label>
              <select value={visa.visaSubmissionMethod} onChange={(event) => visa.setVisaSubmissionMethod(event.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                <option value="">—</option>
                {VISA_SUBMISSION_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 lg:col-span-14">
              <h4 className="text-sm font-bold text-slate-800">Visa Center Appointment</h4>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:col-span-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,.85fr)_minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end">
              <div className="min-w-0 space-y-1.5 lg:order-3">
                <label className="text-xs font-bold text-slate-600">Appointment Date *</label>
                <Input type="date" value={visa.visaAppointmentDate} onChange={(event) => visa.setVisaAppointmentDate(event.target.value)} min={new Date().toISOString().split('T')[0]} className="border-slate-200" />
              </div>
              <div className="min-w-0 space-y-1.5 lg:order-4">
                <label className="text-xs font-bold text-slate-600">Appointment Time *</label>
                <Input type="time" value={visa.visaAppointmentTime} onChange={(event) => visa.setVisaAppointmentTime(event.target.value)} className="border-slate-200" />
              </div>
              <div className="min-w-0 space-y-1.5 lg:order-5">
                <label className="text-xs font-bold text-slate-600">Appointment Number *</label>
                <Input dir="ltr" value={visa.visaAppointmentRefNumber} onChange={(event) => visa.setVisaAppointmentRefNumber(event.target.value)} className="border-slate-200 font-mono" />
              </div>
              <div className="min-w-0 space-y-1.5 lg:order-6">
                <label className="text-xs font-bold text-slate-600">Appointment Status *</label>
                <select
                  value={visa.visaAppointmentStatus}
                  onChange={(event) => visa.setVisaAppointmentStatus(event.target.value)}
                  className={cn(
                    'w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none',
                    visa.visaAppointmentStatus === 'Completed' ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : visa.visaAppointmentStatus === 'Pending' ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : visa.visaAppointmentStatus === 'Cancelled' ? 'border-red-300 bg-red-50 text-red-700'
                      : visa.visaAppointmentStatus === 'Rescheduled' ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700',
                  )}
                >
                  {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 space-y-1.5 lg:order-7">
                <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600"><span>Appointment Upload *</span></label>
                <input
                  type="file"
                  id="appointment-confirmation-file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => void handleUploadDocument(event, 'Appointment Confirmation', 'appointment_confirmation')}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingDocumentType === 'appointment_confirmation'}
                  onClick={() => document.getElementById('appointment-confirmation-file')?.click()}
                  className={cn('h-[43px] w-full text-xs', appointmentDocument ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-200 text-slate-600')}
                >
                  {uploadingDocumentType === 'appointment_confirmation' ? 'Uploading…' : appointmentDocument ? 'Uploaded confirmation' : 'Choose PDF File'}
                </Button>
              </div>
              <div className="min-w-0 space-y-1.5 lg:order-1">
                <label className="text-xs font-bold text-slate-600">Account Email *</label>
                <Input dir="ltr" value={visa.visaPortalEmail} onChange={(event) => visa.setVisaPortalEmail(event.target.value)} className="border-slate-200" />
              </div>
              <div className="min-w-0 space-y-1.5 lg:order-2">
                <label className="text-xs font-bold text-slate-600">Account Password *</label>
                {/* The password is stored encrypted and is never sent down with
                    the case. It is fetched only on an explicit reveal, which is
                    written to the activity log. */}
                <div className="relative">
                  <Input
                    dir="ltr"
                    type={visa.showPassword ? 'text' : 'password'}
                    value={visa.visaPortalPassword}
                    onChange={(event) => visa.handleVisaPasswordChange(event.target.value)}
                    placeholder={visa.visaPasswordIsStored && !visa.visaPortalPassword ? '•••••••• (stored, encrypted)' : ''}
                    className="border-slate-200 pl-16"
                  />
                  <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {visa.visaPasswordIsStored && !visa.visaPortalPassword && (
                      <button
                        type="button"
                        onClick={() => void visa.handleRevealVisaPassword()}
                        disabled={visa.isRevealingPassword}
                        aria-label="Reveal the stored password"
                        title="Reveal the stored password"
                        className="text-slate-400 hover:text-[#8B0000] disabled:opacity-50"
                      >
                        {visa.isRevealingPassword ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                      </button>
                    )}
                    <button type="button" onClick={() => visa.setShowPassword((current) => !current)} aria-label="Toggle password visibility" className="text-slate-400 hover:text-slate-600">
                      {visa.showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 lg:col-span-2 lg:col-start-13 lg:row-start-2">
              <label className="text-xs font-bold text-slate-600">Account Status *</label>
              {/* This used to gate the "Created" value behind a confirmation
                  code hardcoded as 0000 and printed in the prompt itself. */}
              <select
                value={visa.visaAccountStatus}
                onChange={(event) => visa.setVisaAccountStatus(event.target.value)}
                className={cn('w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none', visa.visaAccountStatus === 'Created' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700')}
              >
                <option value="In Progress">In Progress</option>
                <option value="Created">Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portal application status and form upload */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Application Completion & File Upload</h3>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">
              Auto-linked to visa case
            </Badge>
          </div>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[220px_260px_minmax(280px,1fr)]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Portal Application Status *</label>
              <select
                value={visa.visaPortalAppStatus}
                onChange={(event) => visa.setVisaPortalAppStatus(event.target.value)}
                className={cn('w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none', visa.visaPortalAppStatus === 'Completed' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700')}
              >
                <option value="Pending">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Application Reference Number</label>
              <Input dir="ltr" value={visa.visaAppRefNumber} onChange={(event) => visa.setVisaAppRefNumber(event.target.value)} className="border-slate-200 font-mono" placeholder="FRA1BG2026..." />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
                <span>Downloaded Visa Form / PDF Upload *</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="visa-form-file"
                  accept=".pdf"
                  disabled={visa.visaPortalAppStatus !== 'Completed'}
                  className="hidden"
                  onChange={(event) => void handleUploadDocument(event, 'Visa Application Form', 'visa_application_form')}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={visa.visaPortalAppStatus !== 'Completed' || uploadingDocumentType === 'visa_application_form'}
                  onClick={() => document.getElementById('visa-form-file')?.click()}
                  title={visa.visaPortalAppStatus === 'Completed' ? 'Upload the completed application form' : 'Set application status to Completed first'}
                  className={cn(
                    'w-full text-xs',
                    visaFormDocument ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : visa.visaPortalAppStatus === 'Completed' ? 'border-slate-200 text-slate-600'
                      : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
                  )}
                >
                  {uploadingDocumentType === 'visa_application_form' ? 'Uploading…' : visaFormDocument ? `Uploaded: ${visaFormDocument.name}` : 'Choose PDF File'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment reminders */}
        <div className="space-y-2.5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Bell className="size-4 text-[#8B0000]" /> Appointment reminders
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 md:grid-cols-[210px_minmax(240px,1fr)_auto] md:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Reminder date & time</label>
              <Input type="datetime-local" value={visa.newReminderAt} onChange={(event) => visa.setNewReminderAt(event.target.value)} className="border-slate-200 bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Reminder note</label>
              <Input value={visa.newReminderNote} onChange={(event) => visa.setNewReminderNote(event.target.value)} className="border-slate-200 bg-white" placeholder="Example: Prepare the passport and appointment letter" />
            </div>
            <Button type="button" onClick={visa.addVisaReminder} className="gap-2 whitespace-nowrap bg-[#8B0000] text-white hover:bg-[#6B0000]">
              <Plus className="size-4" /> Add reminder
            </Button>
          </div>

          {visa.visaReminders.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {visa.visaReminders.map((reminder) => (
                <div key={reminder.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span dir="ltr" className="font-mono text-xs font-bold text-slate-800">{new Date(reminder.remindAt).toLocaleString('en-GB')}</span>
                      {reminder.notifiedAt && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                          Sent
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-600">{reminder.note}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={reminder.sound ? 'Disable reminder sound' : 'Enable reminder sound'}
                      onClick={() => visa.setVisaReminders((current) => current.map((item) => (item.id === reminder.id ? { ...item, sound: !item.sound } : item)))}
                      className={cn('rounded-md p-2 transition-colors', reminder.sound ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}
                    >
                      <Volume2 className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete reminder"
                      onClick={() => visa.setVisaReminders((current) => current.filter((item) => item.id !== reminder.id))}
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-center text-[11px] text-slate-500">No reminders added.</p>
          )}
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={() => setStep(3)} className="border-slate-200 text-slate-600">
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void visa.handleSaveVisaDetails(false)} className="border-slate-200 text-slate-600">
              Save without continuing
            </Button>
            <Button onClick={() => void visa.handleSaveVisaDetails(true)} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
              Continue to Next Step
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
