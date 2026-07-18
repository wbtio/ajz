/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from './wizard-view-context'

export function EventStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView()
  return <>
    {/* Step 1: Event Registration */}
      {step === 1 && (
        <div className="w-full space-y-2.5 animate-in fade-in duration-300">
          {client && registration && (
            <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Client profile created successfully. Continue by registering the client for an event.</span>
            </div>
          )}

          <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
            {client && registration && <ClientSummary client={client} caseNumber={caseNumber} />}

            {/* Event Details form */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Event Registration Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-12">
                  <label className="text-xs font-bold text-slate-600">Select Event *</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      const nextEventId = e.target.value;
                      const nextEvent = events.find((event) => event.id === nextEventId);
                      setSelectedEventId(nextEventId);
                      setTravelPurpose(buildTravelPurpose(nextEvent, participationType));
                    }}
                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select Event</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {[e.title || e.title_ar, e.location || e.country || e.location_ar || e.country_ar, formatEventDate(e.date)].filter(Boolean).join(" • ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 lg:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Participation Type *</label>
                  <select
                    value={participationType}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      const currentEvent = events.find((event) => event.id === selectedEventId);
                      setParticipationType(nextType);
                      setTravelPurpose(buildTravelPurpose(currentEvent, nextType));
                    }}
                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="Business Visitor">Business Visitor</option>
                    <option value="Exhibitor">Exhibitor</option>
                    <option value="Speaker">Speaker</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-9">
                  <label className="text-xs font-bold text-slate-600">Travel Purpose *</label>
                  <div className="min-h-10 px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-sm leading-5 text-slate-700">{travelPurpose}</div>
                </div>
              </div>
            </div>

            {/* Event Information auto-filled (Read-only) */}
            {selectedEvent && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Event Information (Auto-Filled)</h3>
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    Read-only
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200/60 bg-slate-50/60 px-3 py-2.5 text-xs sm:grid-cols-3 lg:grid-cols-5">
                  <div>
                    <span className="text-slate-400 block">Event Name</span>
                    <span className="font-semibold text-slate-700">{selectedEvent.title || selectedEvent.title_ar}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Event Type</span>
                    <span className="font-semibold text-slate-700">International Trade Exhibition</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sector</span>
                    <span className="font-semibold text-slate-700">{selectedEvent.sector || "Food & Beverage"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Country</span>
                    <span className="font-semibold text-slate-700">{selectedEvent.country || selectedEvent.country_ar}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">City</span>
                    <span className="font-semibold text-slate-700">{selectedEvent.location || selectedEvent.location_ar}</span>
                  </div>
                </div>

                {/* Inviting Organization Host information */}
                <div className="space-y-2.5 rounded-lg border border-[#8B0000]/30 bg-[#8B0000]/[0.025] p-3">
                  <h4 className="font-bold text-sm text-[#8B0000]">Inviting Organization / Host Information (Auto-Filled - Event Master Data)</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
                    <div>
                      <span className="text-slate-400 block">Organization Name</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_org}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 block">Address</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_address}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Inviting Person - First Name</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_contact_name.split(" ")[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Inviting Person - Last Name</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_contact_name.split(" ").slice(1).join(" ") || "Dupont"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Position</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_contact_position || "Manager"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_contact_email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone Number</span>
                      <span className="font-semibold text-slate-700">{inviterConfig.host_contact_phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
              {onClose ? (
                <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600">
                  Cancel / Exit
                </Button>
              ) : (
                <Button variant="outline" onClick={() => router.push("/dashboard/home")} className="border-slate-200 text-slate-600">
                  Back to Dashboard
                </Button>
              )}
              <div className="flex gap-2">
                {registrationId && (
                  <Button variant="outline" onClick={() => toast.success("Event draft saved.")} className="border-slate-200 text-slate-600">
                    Save Draft
                  </Button>
                )}
                <Button onClick={handleSaveEventDetails} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[125px] shadow-sm">
                  Continue to Client Search
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
  </>
}
