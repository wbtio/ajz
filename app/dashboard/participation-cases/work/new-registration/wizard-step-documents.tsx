/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from './wizard-view-context'

export function DocumentsStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView()
  return <>
    {/* Step 5: Document Assembly & Archiving */}
      {step === 5 && registration && (
        <div className="w-full space-y-2.5 animate-in fade-in duration-300">
          <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Visa application and appointment details saved successfully. Review the real case documents before archiving.</span>
          </div>

          <Card className="space-y-3 border-slate-200/80 bg-slate-50/40 p-3 shadow-sm sm:p-4">
            {/* Client Summary card */}
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-5">
                <div>
                  <span className="text-slate-500 block">Client</span>
                  <span className="font-bold text-slate-800">{client?.full_name_as_passport}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Passport</span>
                  <span className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Event</span>
                  <span className="font-bold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || "Event not set"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Destination</span>
                  <span className="font-bold text-slate-700">{visaDestination || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Case ID</span>
                  <span className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
                </div>
              </div>
            </div>

            <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
              {/* Collected Documents checklist */}
              <section className="h-full space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">1</span>
                    <h3 className="text-sm font-bold text-slate-800">Collected Documents</h3>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]", requiredVisaDocuments.every((definition) => !!findDocument(definition)) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                    {requiredVisaDocuments.filter((definition) => !!findDocument(definition)).length}/{requiredVisaDocuments.length} required ready
                  </Badge>
                </div>
                <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                  {VISA_DOCUMENTS.map((definition) => {
                    const storedDocument = findDocument(definition);
                    const inputId = `document-upload-${definition.type}`;
                    const isUploading = uploadingDocumentType === definition.type;
                    const currentUploadError = uploadError?.type === definition.type ? uploadError.message : "";
                    return (
                      <div key={definition.type} className={cn("flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-xs", !storedDocument && definition.required ? "bg-amber-50/50" : "bg-white")}>
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {storedDocument ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-800 block">{definition.label}</span>
                            {storedDocument ? (
                              <span className="text-slate-500 font-mono block truncate" title={storedDocument.name}>
                                {storedDocument.name}
                              </span>
                            ) : (
                              <span className="text-amber-700 block">Not uploaded</span>
                            )}
                            {currentUploadError && <span className="text-red-600 mt-1 block leading-4">{currentUploadError}</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {storedDocument && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => window.open(storedDocument.path, "_blank", "noopener,noreferrer")} className="h-7 px-2 text-[10px] text-slate-500">
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          )}
                          <input id={inputId} type="file" accept=".pdf,image/*" className="hidden" onChange={(event) => handleStep4FileUpload(event, definition.label, definition.type)} />
                          <Button type="button" variant="ghost" size="sm" disabled={isUploading} onClick={() => document.getElementById(inputId)?.click()} className="h-7 px-2 text-[10px] text-[#8B0000]">
                            {isUploading ? "Uploading…" : storedDocument ? "Replace" : "Upload"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Package Assembly inputs & actions */}
              <section className="flex h-full flex-col space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">2</span>
                    <h3 className="text-sm font-bold text-slate-800">Package Assembly</h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {packageDocumentPaths.length} of {mergeableDocuments.length} files selected
                  </span>
                </div>
                <div className="space-y-2 rounded-md bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Choose files to merge</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPackageDocumentPaths(mergeableDocuments.map((document) => document.path))} className="h-8 text-[11px] text-[#8B0000]">
                        Select all
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPackageDocumentPaths([])} className="h-8 text-[11px] text-slate-500">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 border-y border-slate-200 py-2 text-xs">
                    <input type="checkbox" checked={includeClientInfoInPackage} onChange={(event) => setIncludeClientInfoInPackage(event.target.checked)} className="h-4 w-4 accent-[#8B0000]" />
                    <span className="min-w-0">
                      <span className="block font-bold text-slate-800">Include client information</span>
                      <span className="block text-[11px] text-slate-500">Applicant, visa, appointment details and index.</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                    {mergeableDocuments.map((document, index) => (
                      <label key={document.path} className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-1 py-2 hover:bg-white">
                        <input type="checkbox" checked={packageDocumentPaths.includes(document.path)} onChange={(event) => setPackageDocumentPaths((current) => (event.target.checked ? [...current, document.path] : current.filter((path) => path !== document.path)))} className="h-4 w-4 accent-[#8B0000]" />
                        <span className="w-4 shrink-0 text-center text-[10px] font-bold text-slate-400">{index + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-slate-700" title={document.name}>
                            {document.name}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-auto space-y-2 border-t border-slate-200 pt-3">
                  <label className="block text-[11px] font-semibold text-slate-500">Final PDF name</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input value={packageName} onChange={(e) => setPackageName(e.target.value)} className="h-9 min-w-0 flex-1 border-slate-200 bg-white text-xs font-mono" />
                    <Button onClick={handleMergeFiles} disabled={isPackageGenerating || (packageDocumentPaths.length === 0 && !includeClientInfoInPackage)} className="h-9 shrink-0 gap-1.5 bg-[#8B0000] text-xs text-white hover:bg-[#6B0000]">
                      <FileText className="h-4 w-4" /> {isPackageGenerating ? "Merging…" : packageDocument ? "Rebuild PDF" : "Create PDF"}
                    </Button>
                  </div>
                  {packageDocument && (
                    <button type="button" onClick={() => window.open(packageDocument.path, "_blank", "noopener,noreferrer")} className="flex max-w-full items-center gap-2 rounded-md py-1 text-left text-xs text-emerald-700 hover:text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="truncate font-semibold" title={packageDocument.name}>
                        {packageDocument.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-500">View PDF</span>
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setStep(4)} className="border-slate-200 text-slate-600">
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!validateStepBeforeAdvance(6)) return;
                  setStep(6);
                }}
                className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm flex items-center justify-center gap-1.5"
              >
                Continue to Next Step
              </Button>
            </div>
          </Card>
        </div>
      )}
  </>
}
