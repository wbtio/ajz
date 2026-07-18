/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from './wizard-view-context'

export function PaymentStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView()
  return <>
    {/* Step 6: Payment & Receipt */}
      {step === 6 && registration && (
        <div className="w-full space-y-2.5 animate-in fade-in duration-300">
          <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>The visa package has been prepared successfully. You can now proceed with payment and receipt issuance.</span>
          </div>

          <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
            {/* Client Summary card */}
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
              <h3 className="sr-only">Client and case summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
                <div>
                  <span className="text-slate-400 block">Full Name</span>
                  <span className="font-bold text-slate-700">{client?.full_name_as_passport}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Passport Number</span>
                  <span className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Event Name</span>
                  <span className="font-bold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || "Event not set"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Destination Country</span>
                  <span className="font-bold text-slate-700">{visaDestination || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Application ID</span>
                  <span className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
                </div>
              </div>
            </div>

            {/* Grid for invoice form elements */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
              {/* Payment details form */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">1. Payment Details</h3>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Payment Category</label>
                    <select value={paymentCategory} onChange={(e) => setPaymentCategory(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                      <option value="Visa Application & Services">Visa Application & Services</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Asiacell Transfer">Asiacell Transfer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Payment Date</label>
                    <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-9 border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Receipt Number</label>
                    <Input value={`RCPT-2026-${caseNumber.split("-").pop()}`} disabled className="h-9 bg-slate-50 border-slate-200 text-slate-500 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Currency</label>
                    <select className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                      <option>EUR - Euro (€)</option>
                      <option>IQD - Iraqi Dinar (د.ع)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Handled By</label>
                    <Input value={currentUser?.full_name || "Noor Al-Shakri"} disabled className="h-9 bg-slate-50 border-slate-200 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">Notes</label>
                    <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Payment received..." className="w-full h-16 p-2 border border-slate-200 rounded-md bg-white focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Fee breakdown: restricted to administrators and payment-authorized team members. */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-800">2. Fee Breakdown</h3>
                  <Badge variant="outline" className={cn("text-[10px]", canEditFeeBreakdown ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                    {canEditFeeBreakdown ? "Editing enabled" : "Restricted"}
                  </Badge>
                </div>
                {canEditFeeBreakdown ? (
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/20 text-xs">
                    <div className="divide-y divide-slate-100 font-medium text-slate-700">
                      {[
                        { key: "service", label: "Service Fee", val: fees.service },
                        { key: "event", label: "Event Registration Fee", val: fees.event },
                        { key: "invitation", label: "Invitation Letter Fee", val: fees.invitation },
                        { key: "coordination", label: "Visa Coordination Fee", val: fees.coordination },
                        { key: "appointment", label: "Appointment Fee", val: fees.appointment },
                        { key: "insurance", label: "Insurance Fee", val: fees.insurance },
                        { key: "printing", label: "Printing / Document Fee", val: fees.printing },
                        { key: "discount", label: "Discount", val: fees.discount, isDiscount: true },
                      ].map((fee) => (
                        <div key={fee.key} className="flex items-center justify-between p-2">
                          <span>{fee.label}</span>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={fee.val}
                              readOnly={!canEditFeeBreakdown}
                              aria-readonly={!canEditFeeBreakdown}
                              title={canEditFeeBreakdown ? "Edit fee" : "Payment permission required"}
                              onChange={(e) => {
                                if (!canEditFeeBreakdown) return;
                                const numericVal = parseFloat(e.target.value) || 0;
                                setFees((prev) => ({ ...prev, [fee.key]: numericVal }));
                              }}
                              className={`w-16 h-7 text-right p-1 border-slate-200 text-xs font-semibold ${!canEditFeeBreakdown ? "cursor-default bg-slate-100 focus-visible:ring-0" : "bg-white"} ${fee.isDiscount ? "text-rose-600" : "text-slate-800"}`}
                            />
                            <span className="text-slate-400">€</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-100/80 p-3 border-t border-slate-200 font-bold text-slate-800 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Total Amount</span>
                        <span>€ {totalAmount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-emerald-700">
                        <span>Amount Paid</span>
                        <div className="flex items-center gap-1">
                          <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} className="w-20 h-7 text-right p-1 border-slate-300 text-xs font-bold text-emerald-700" />
                          <span>€</span>
                        </div>
                      </div>
                      <div className={`flex justify-between items-center text-xs border-t border-slate-200/80 pt-1.5 ${balanceDue > 0 ? "text-amber-700" : "text-slate-500"}`}>
                        <span>Balance Due</span>
                        <span>€ {balanceDue}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-4 text-xs">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                      <span>Total Amount</span>
                      <span>€ {totalAmount}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Lock className="h-3.5 w-3.5" /> Detailed fee values are restricted to payment-authorized users.
                    </p>
                  </div>
                )}
              </div>

              {/* Generated Invoice Preview Card */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">3. Receipt Information</h3>
                <Card className="space-y-3 border-slate-200/80 p-3 text-xs shadow-sm">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-slate-400 block font-medium">Receipt ID</span>
                      <span className="font-bold font-mono text-slate-800 text-sm">RCPT-2026-{caseNumber.split("-").pop()}</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Paid</Badge>
                  </div>

                  <div className="space-y-2 text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Client Name</span>
                      <span className="text-slate-800">{client?.full_name_as_passport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Application ID</span>
                      <span className="text-slate-800 font-mono">{caseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Event Name</span>
                      <span className="text-slate-800">{selectedEvent?.title || selectedEvent?.title_ar || "Event not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method</span>
                      <span className="text-slate-800">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-dashed border-slate-100">
                      <span>Total Paid</span>
                      <span>€ {amountPaid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Issue Date</span>
                      <span>{new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                  </div>

                  {registration.documents?.find((d: any) => d.type === "receipt") && (
                    <div className="border border-slate-200 bg-white rounded-lg p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-8 h-8 text-rose-600" />
                        <div>
                  <span className="font-bold block text-slate-800">Company_Receipt_{caseNumber}.pdf</span>
                          <span className="text-[10px] text-slate-400 font-mono">PDF file • 92 KB • Completed</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={handleDownloadReceipt} aria-label="Download receipt" className="h-8 w-8 text-slate-400 hover:text-slate-600 flex items-center justify-center p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Physical Print & Receipt actions */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-800">4. Receipt Actions</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleGenerateReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                  <Printer className="w-4 h-4" /> Generate Both Receipts
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                  <Printer className="w-4 h-4" /> Print Receipt
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                  <Download className="w-4 h-4" /> Download Company Receipt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = (registration?.additional_data as any)?.client_receipt_pdf_url;
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                    else toast.error("Generate both receipts first.");
                  }}
                  className="border-emerald-200 text-emerald-700 gap-1.5 text-xs"
                >
                  <Download className="w-4 h-4" /> Download Client Receipt
                </Button>
                <Button variant="outline" size="sm" onClick={handleArchiveReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                  <FolderKanban className="w-4 h-4" /> Archive Receipt
                </Button>
                <Button variant="outline" size="sm" onClick={handleSavePaymentDraft} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                  <FileText className="w-4 h-4" /> Save Draft
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setStep(5)} className="border-slate-200 text-slate-600">
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!validateStepBeforeAdvance(7)) return;
                  setStep(7);
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
