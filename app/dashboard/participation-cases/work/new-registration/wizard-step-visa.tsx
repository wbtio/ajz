/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from './wizard-view-context'

export function VisaStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView()
  return <>
    {/* Step 4: Visa Application & Appointment */}
      {step === 4 && registration && (
        <div className="w-full space-y-2.5 animate-in fade-in duration-300">
          <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs text-emerald-800">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
            <span>
              <strong className="font-semibold">Registration complete.</strong> Continue with the visa setup and appointment.
            </span>
          </div>

          <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
            {/* Client Summary card */}
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
              <h3 className="sr-only">Client and event summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Client</span>
                  <span className="block truncate font-semibold text-slate-700">{client?.full_name_as_passport}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Passport</span>
                  <span className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Date of birth</span>
                  <span className="font-bold text-slate-700">{client?.date_of_birth}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Destination</span>
                  <span className="font-bold text-slate-700">{visaDestination || "—"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Event</span>
                  <span className="block truncate font-semibold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || "Event not set"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Application ID</span>
                  <span className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
                </div>
              </div>
            </div>

            {/* Visa Platform Setup form */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-x-2 gap-y-3 rounded-xl border border-slate-200/80 bg-[linear-gradient(to_bottom,rgba(254,242,242,0.82)_0_52%,rgba(240,253,244,0.78)_52%_100%)] p-3 sm:grid-cols-2 lg:grid-cols-[repeat(14,minmax(0,1fr))]">
                <h3 className="text-sm font-bold text-slate-800 lg:col-span-14">Embassy Appointment And Setup</h3>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Visa County</label>
                  <select
                    value={visaDestination && VISA_ROUTES.some((route) => route.country === visaDestination) ? visaDestination : visaDestination ? "Other" : ""}
                    onChange={(e) => e.target.value === "Other" ? setVisaDestination("Other") : handleVisaDestinationChange(e.target.value)}
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
                  {visaDestination && !VISA_ROUTES.some((route) => route.country === visaDestination) && (
                    <Input value={visaDestination === "Other" ? "" : visaDestination} onChange={(e) => setVisaDestination(e.target.value)} className="border-slate-200" placeholder="Enter visa country" />
                  )}
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Embassy / Consulate *</label>
                  <Select
                    value={visaEmbassyCity}
                    onValueChange={(city) => {
                      setVisaEmbassyCity(city);
                      setVisaEmbassy(`${visaDestination} Embassy in ${city}`);
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
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Visa Type *</label>
                  <select
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="">—</option>
                    {VISA_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Visa Application Platform *</label>
                  <Input value={visaPlatform} onChange={(e) => setVisaPlatform(e.target.value)} className="border-slate-200" placeholder="Official portal or platform" aria-describedby="visa-platform-help" />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Visa Center *</label>
                  <select value={visaSubmissionMethod} onChange={(e) => setVisaSubmissionMethod(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
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
                <div className="space-y-1.5 lg:col-span-2 lg:order-3">
                  <label className="text-xs font-bold text-slate-600">Appointment Date *</label>
                  <Input type="date" value={visaAppointmentDate} onChange={(e) => setVisaAppointmentDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="border-slate-200" />
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:order-4">
                  <label className="text-xs font-bold text-slate-600">Appointment Time *</label>
                  <Input type="time" value={visaAppointmentTime} onChange={(e) => setVisaAppointmentTime(e.target.value)} className="border-slate-200" />
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:order-5">
                  <label className="text-xs font-bold text-slate-600">Appointment Number *</label>
                  <Input value={visaAppointmentRefNumber} onChange={(e) => setVisaAppointmentRefNumber(e.target.value)} className="border-slate-200 font-mono" />
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:order-6">
                  <label className="text-xs font-bold text-slate-600">Appointment Status *</label>
                  <select value={visaAppointmentStatus} onChange={(e) => setVisaAppointmentStatus(e.target.value)} className={cn("w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none", visaAppointmentStatus === "Completed" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : visaAppointmentStatus === "Pending" ? "border-amber-300 bg-amber-50 text-amber-700" : visaAppointmentStatus === "Cancelled" ? "border-red-300 bg-red-50 text-red-700" : visaAppointmentStatus === "Rescheduled" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700")}>
                    <option value="Booked">Booked</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:order-7">
                  <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600"><span>Appointment Upload *</span></label>
                  <input type="file" id="appt-confirm-file" accept=".pdf" className="hidden" onChange={(e) => handleStep4FileUpload(e, "Appointment Confirmation", "appointment_confirmation")} />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("appt-confirm-file")?.click()} className="h-[43px] w-full text-xs border-slate-200 text-slate-600">
                    {registration.documents?.find((d: any) => d.type === "appointment_confirmation") ? "Uploaded confirmation" : "Choose PDF File"}
                  </Button>
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:order-1">
                  <label className="text-xs font-bold text-slate-600">Portal Account Email *</label>
                  <Input value={visaPortalEmail} onChange={(e) => setVisaPortalEmail(e.target.value)} className="border-slate-200" />
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:order-2">
                  <label className="text-xs font-bold text-slate-600">Portal Account Password *</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={visaPortalPassword} onChange={(e) => setVisaPortalPassword(e.target.value)} className="border-slate-200 pr-10" />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 lg:col-span-2 lg:col-start-13 lg:row-start-2">
                  <label className="text-xs font-bold text-slate-600">Account Status *</label>
                  <select
                    value={visaAccountStatus}
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      if (nextStatus === "Created" && visaAccountStatus !== "Created") {
                        if (!window.confirm("هل أنت متأكد أن حساب الفيزا تم إنشاؤه فعلاً؟")) return;
                        if (window.prompt("للتأكيد، أدخل رمز الأمان: 0000") !== "0000") {
                          window.alert("رمز التأكيد غير صحيح. بقيت الحالة In Progress.");
                          return;
                        }
                      }
                      setVisaAccountStatus(nextStatus);
                    }}
                    className={cn("w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none", visaAccountStatus === "Created" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700")}
                  >
                    <option value="Created">Created</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Portal File uploads */}
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
                  <select value={visaPortalAppStatus} onChange={(e) => setVisaPortalAppStatus(e.target.value)} className={cn("w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none", visaPortalAppStatus === "Completed" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700")}>
                    <option value="Completed">Completed</option>
                    <option value="Pending">In Progress</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Application Reference Number</label>
                  <Input value={visaAppRefNumber} onChange={(e) => setVisaAppRefNumber(e.target.value)} className="border-slate-200 font-mono" placeholder="FRA1BG2026..." />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
                    <span>Downloaded Visa Form / PDF Upload *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="file" id="visa-form-file" accept=".pdf" disabled={visaPortalAppStatus !== "Completed"} className="hidden" onChange={(e) => handleStep4FileUpload(e, "Visa Application Form", "visa_application_form")} />
                    <Button type="button" variant="outline" disabled={visaPortalAppStatus !== "Completed"} onClick={() => document.getElementById("visa-form-file")?.click()} title={visaPortalAppStatus === "Completed" ? "Upload the completed application form" : "Set application status to Completed first"} className={cn("w-full text-xs", registration.documents?.find((d: any) => d.type === "visa_application_form") ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : visaPortalAppStatus === "Completed" ? "border-slate-200 text-slate-600" : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400")}>
                      {registration.documents?.find((d: any) => d.type === "visa_application_form") ? `Uploaded: ${registration.documents.find((d: any) => d.type === "visa_application_form")?.name || "Visa Application Form"}` : "Choose PDF File"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Embassy appointment booking details */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="hidden text-sm font-bold text-slate-800">Visa Center / Embassy Appointment</h3>
              <div className="hidden grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Appointment Date *</label>
                  <Input type="date" value={visaAppointmentDate} onChange={(e) => setVisaAppointmentDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Appointment Time *</label>
                  <Input type="time" value={visaAppointmentTime} onChange={(e) => setVisaAppointmentTime(e.target.value)} className="border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Appointment Number *</label>
                  <Input value={visaAppointmentRefNumber} onChange={(e) => setVisaAppointmentRefNumber(e.target.value)} className="border-slate-200 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Appointment Status *</label>
                  <select value={visaAppointmentStatus} onChange={(e) => setVisaAppointmentStatus(e.target.value)} className={cn("w-full h-10 px-3 border rounded-md text-sm font-semibold focus:outline-none", visaAppointmentStatus === "Completed" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : visaAppointmentStatus === "Pending" ? "border-amber-300 bg-amber-50 text-amber-700" : visaAppointmentStatus === "Cancelled" ? "border-red-300 bg-red-50 text-red-700" : visaAppointmentStatus === "Rescheduled" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700")}>
                    <option value="Booked">Booked</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
                    <span>Appointment Confirmation Upload *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="file" id="appt-confirm-file" accept=".pdf" className="hidden" onChange={(e) => handleStep4FileUpload(e, "Appointment Confirmation", "appointment_confirmation")} />
                    <Button variant="outline" onClick={() => document.getElementById("appt-confirm-file")?.click()} className={cn("w-full text-xs", registration.documents?.find((d: any) => d.type === "appointment_confirmation") ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-slate-200 text-slate-600")}>
                      {registration.documents?.find((d: any) => d.type === "appointment_confirmation") ? `Uploaded: ${registration.documents.find((d: any) => d.type === "appointment_confirmation")?.name || "Appointment Confirmation"}` : "Choose PDF File"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Bell className="h-4 w-4 text-[#8B0000]" /> Appointment reminders
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 md:grid-cols-[210px_minmax(240px,1fr)_auto] md:items-end">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Reminder date & time</label>
                    <Input type="datetime-local" value={newReminderAt} onChange={(e) => setNewReminderAt(e.target.value)} className="border-slate-200 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Reminder note</label>
                    <Input value={newReminderNote} onChange={(e) => setNewReminderNote(e.target.value)} className="border-slate-200 bg-white" placeholder="Example: Prepare the passport and appointment letter" />
                  </div>
                  <Button type="button" onClick={addVisaReminder} className="gap-2 whitespace-nowrap bg-[#8B0000] text-white hover:bg-[#6B0000]">
                    <Plus className="h-4 w-4" /> Add reminder
                  </Button>
                </div>

                {visaReminders.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {visaReminders.map((reminder) => (
                      <div key={reminder.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800">{new Date(reminder.remindAt).toLocaleString("en-GB")}</span>
                            {reminder.notifiedAt && (
                              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                                Sent
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-600">{reminder.note}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label={reminder.sound ? "Disable reminder sound" : "Enable reminder sound"} onClick={() => setVisaReminders((current) => current.map((item) => (item.id === reminder.id ? { ...item, sound: !item.sound } : item)))} className={cn("rounded-md p-2 transition-colors", reminder.sound ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Delete reminder" onClick={() => setVisaReminders((current) => current.filter((item) => item.id !== reminder.id))} className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-center text-[11px] text-slate-500">No reminders added.</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setStep(3)} className="border-slate-200 text-slate-600">
                Back
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => handleSaveVisaDetails(true)} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
                  Continue to Next Step
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
  </>
}
