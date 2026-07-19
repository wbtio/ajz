/* eslint-disable */
// @ts-nocheck -- This view receives the already-typed WizardClient closure as a presentation model.
import { WizardViewContext } from './wizard-view-context'
import { ClientSearchStep } from './wizard-step-client-search'
import { ApplicationStep } from './wizard-step-application'
import { EventStep } from './wizard-step-event'
import { VisaStep } from './wizard-step-visa'
import { DocumentsStep } from './wizard-step-documents'
import { PaymentStep } from './wizard-step-payment'
import { DeliveryStep } from './wizard-step-delivery'
import { useState } from 'react'

// Presentation layer for the registration wizard. State and side effects remain in WizardClient.
type WizardViewProps = Record<string, any>;

export function WizardView(props: WizardViewProps) {
  const { step, setStep, breadcrumbLabel, onClose, router, registrationId, registration, client, searchForm, caseNumber, assignedEmployee, summaryStatus, latestActivity, summaryAppointment, missingSummaryDocuments, stepStatus, RegistrationProgress, ApplicationSummary, REGISTRATION_STEPS, X } = props;
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)


  return (
    <WizardViewContext.Provider value={props}>
    <div className="jaz-apps-dashboard mx-auto w-full max-w-[1440px] space-y-4 pb-10" dir="ltr">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 gap-4" aria-label={breadcrumbLabel}>
          <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
          <div className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">Step {step} of 7</div>
            <h1 className="text-xl sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {step === 1 && "Select Event"}
            {step === 2 && "Client Search & Create Profile"}
            {step === 3 && "New Application"}
            {step === 4 && "Visa Application & Appointment"}
            {step === 5 && "Document Assembly & Archiving"}
            {step === 6 && "Payment & Receipt"}
            {step === 7 && "Client File Delivery & Status"}
            </h1>
            <button type="button" aria-label="Show step help" aria-expanded={helpOpen} onClick={() => setHelpOpen((open) => !open)} className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-500 transition hover:border-[#8B0000] hover:text-[#8B0000] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20">?</button>
          </div>
          {helpOpen && <p className="mt-1.5 max-w-2xl rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-500 shadow-sm">{REGISTRATION_STEPS[step - 1]?.description}. Complete the required information before continuing.</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
        {registrationId && registration && <button type="button" onClick={() => setSummaryOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50">More details</button>}
        {onClose ? (
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors duration-150">
            <span className="hidden sm:inline">Close</span>
            <X className="size-4 sm:hidden" />
          </button>
        ) : (
          step === 1 && (
            <button onClick={() => router.push("/dashboard/home")} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors duration-150">
              Dashboard
            </button>
          )
        )}
        </div>
      </div>

      {registrationId && registration && <ApplicationSummary clientName={client?.full_name_as_passport || searchForm.fullName} caseNumber={caseNumber} registrationId={registrationId} assignee={assignedEmployee?.full_name || assignedEmployee?.email || ""} status={summaryStatus} lastEditor={latestActivity?.performed_by_name || "—"} nextAppointment={summaryAppointment} missingDocuments={missingSummaryDocuments} open={summaryOpen} onClose={() => setSummaryOpen(false)} />}

      <RegistrationProgress activeStep={step} canOpenAll={Boolean(registrationId)} stepStatus={stepStatus} onStepChange={setStep} />

      <ClientSearchStep />
<ApplicationStep />
<EventStep />
<VisaStep />
<DocumentsStep />
<PaymentStep />
<DeliveryStep />
    </div>
    </WizardViewContext.Provider>
  );
}
