/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from './wizard-view-context'

export function DeliveryStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView()
  return <>
    {/* Step 7: Client File Delivery & Status */}
      {step === 7 && (
        <div className="w-full animate-in fade-in duration-300">
          <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
            <div className={cn("flex items-center justify-between gap-3 rounded-md border px-3 py-2", deliveryStatus === "sent" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-900")}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {deliveryStatus === "sent" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                <span>{deliveryStatus === "sent" ? "Client file delivery has been recorded." : "The case is complete. Confirm delivery to the client."}</span>
              </div>
              <Badge variant="outline" className={deliveryStatus === "sent" ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}>
                {deliveryStatus === "sent" ? "Sent" : "Ready to send"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Files to share with the client</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Select all or only the files the client needs.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDeliveryDocumentPaths(registrationDocuments.map((document) => document.path))} className="h-8 text-[11px] text-[#8B0000]">
                    Select all
                  </Button>
                </div>
                <div className="divide-y divide-slate-100">
                  {registrationDocuments.length > 0 ? (
                    registrationDocuments.map((document) => {
                      const selected = deliveryDocumentPaths.includes(document.path);
                      return (
                        <div key={`${document.type}-${document.path}`} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", selected ? "bg-slate-50/80" : "bg-white")}>
                          <input type="checkbox" checked={selected} onChange={() => setDeliveryDocumentPaths((current) => (selected ? current.filter((path) => path !== document.path) : [...current, document.path]))} className="size-4 accent-[#8B0000]" aria-label={`Share ${document.name}`} />
                          <FileText className="size-4 shrink-0 text-slate-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 truncate">{document.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{document.type}</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => window.open(document.path, "_blank", "noopener,noreferrer")} className="h-8 w-8 p-0 text-slate-400 hover:text-[#8B0000]" aria-label={`View ${document.name}`}>
                            <ExternalLink className="size-3.5" />
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-10 text-center text-xs text-slate-500">No files have been saved for this case. Return to Docs to upload them.</div>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">WhatsApp delivery message</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Write the message, then open WhatsApp to send it.</p>
                </div>
                <textarea value={deliveryMessage} onChange={(event) => setDeliveryMessage(event.target.value)} rows={6} placeholder="Write a short message to the client..." className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-6 text-slate-700 outline-none focus:border-[#8B0000]/40 focus:ring-2 focus:ring-[#8B0000]/10" />
                <div className="grid grid-cols-1 gap-2">
                  <Button type="button" onClick={openWhatsApp} disabled={registrationDocuments.length === 0} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-2">
                    <MessageCircle className="size-4" /> Open WhatsApp
                  </Button>
                </div>
              </section>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setStep(6)} className="border-slate-200 text-slate-600">
                Back to payment
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push("/dashboard/participation-cases/work/clients")} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5">
                  <FolderKanban className="w-4 h-4" /> Back to Applications
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
  </>
}
