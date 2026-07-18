/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from './wizard-view-context'

export function ApplicationStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView()
  return <>
    {/* Step 3: New Application / Intake Review */}
      {step === 3 && registration && (
        <div className="w-full space-y-2.5 animate-in fade-in duration-300">
          {/* Success notify bar */}
          <div role="status" className="flex items-center justify-between rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-emerald-800">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Client selected successfully. Existing information has been loaded.</span>
            </div>
          </div>

          <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <User className="size-4 text-[#8B0000]" />
                <h2 className="text-base font-bold text-slate-800">Client information</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Editable client profile</span>
            </div>

            {/* Read-Only and Changeable client fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
              {/* Read-only / Locked fields */}
              <div className="space-y-1.5 relative lg:order-2 lg:col-span-3">
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <Input value={searchForm.fullName} onChange={(e) => setSearchForm((prev) => ({ ...prev, fullName: e.target.value.toUpperCase() }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 relative lg:order-3 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Surname</label>
                <Input value={searchForm.surname} onChange={(e) => setSearchForm((prev) => ({ ...prev, surname: e.target.value.toUpperCase() }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 lg:order-1 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600">Title</label>
                <select value={searchForm.salutation} onChange={(e) => setSearchForm((prev) => ({ ...prev, salutation: e.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>
              <div className="space-y-1.5 lg:order-4 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600">Gender</label>
                <select value={searchForm.gender} onChange={(e) => setSearchForm((prev) => ({ ...prev, gender: e.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-1.5 lg:order-11 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Marital Status</label>
                <select value={searchForm.maritalStatus} onChange={(e) => setSearchForm((prev) => ({ ...prev, maritalStatus: e.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="space-y-1.5 relative lg:order-5 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Passport Number</label>
                <Input
                  value={searchForm.passportNumber}
                  onChange={(e) =>
                    setSearchForm((prev) => ({
                      ...prev,
                      passportNumber: e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 9),
                    }))
                  }
                  className="border-slate-200 font-mono"
                />
              </div>
              <div className="space-y-1.5 relative lg:order-11 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">National ID</label>
                <Input value={searchForm.nationalId} onChange={(e) => setSearchForm((prev) => ({ ...prev, nationalId: e.target.value.replace(/\D/g, "").slice(0, 12) }))} inputMode="numeric" className="border-slate-200 font-mono" />
              </div>
              <div className="space-y-1.5 relative lg:order-6 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Date of Birth</label>
                <Input type="date" value={searchForm.dateOfBirth} onChange={(e) => setSearchForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 relative lg:order-7 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Place of Birth Country</label>
                <SearchableChoice
                  value={searchForm.placeOfBirthCountry}
                  placeholder="Select country"
                  items={placeOfBirthCountries.map((country) => ({ value: country.code, label: country.label }))}
                  onSelect={(value) =>
                    setSearchForm((prev) => ({
                      ...prev,
                      placeOfBirthCountry: value,
                      placeOfBirth: `${placeOfBirthCountries.find((country) => country.code === value)?.label || value}${prev.placeOfBirthCity ? `, ${prev.placeOfBirthCity}` : ""}`,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5 relative lg:order-8 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Place of Birth City</label>
                <SearchableChoice
                  value={searchForm.placeOfBirthCity}
                  placeholder="Select city"
                  disabled={!searchForm.placeOfBirthCountry}
                  items={(placeOfBirthCitiesByCountry[searchForm.placeOfBirthCountry] || []).map((city) => ({ value: city, label: city }))}
                  onSelect={(value) =>
                    setSearchForm((prev) => ({
                      ...prev,
                      placeOfBirthCity: value,
                      placeOfBirth: `${placeOfBirthCountries.find((country) => country.code === prev.placeOfBirthCountry)?.label || prev.placeOfBirthCountry}, ${value}`,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5 relative lg:order-9 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Passport Date of Issue</label>
                <Input type="date" value={searchForm.passportIssueDate} onChange={(e) => setSearchForm((prev) => ({ ...prev, passportIssueDate: e.target.value }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 relative lg:order-10 lg:col-span-2">
                <label className="text-xs font-bold text-slate-600">Passport Date of Expiry</label>
                <Input type="date" value={searchForm.passportExpiryDate} onChange={(e) => setSearchForm((prev) => ({ ...prev, passportExpiryDate: e.target.value }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:order-15 lg:col-span-3">
                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                <PhoneNumberField value={searchForm.phone} country={phoneCountry} error={phoneValidation.error} onCountryChange={setPhoneCountry} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, phone: value }))} />
              </div>
              <div className="space-y-1.5 lg:order-14 lg:col-span-3">
                <label className="text-xs font-bold text-slate-600">Email Address</label>
                <EmailField value={searchForm.email} error={emailValidation.error} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, email: value }))} />
              </div>
              <div className="space-y-1.5 lg:order-12 lg:col-span-3">
                <label className="text-xs font-bold text-slate-600">Company Name</label>
                <Input value={searchForm.companyName} onChange={(e) => setSearchForm((prev) => ({ ...prev, companyName: e.target.value }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 lg:order-13 lg:col-span-3">
                <label className="text-xs font-bold text-slate-600">Company Specialty</label>
                {searchForm.companySpecialty === "Other" ? (
                  <div className="flex gap-2">
                    <Input autoFocus value={companySpecialtyOther} onChange={(e) => setCompanySpecialtyOther(e.target.value)} placeholder="Enter company specialty" className="border-slate-200" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSearchForm((prev) => ({ ...prev, companySpecialty: "" }));
                        setCompanySpecialtyOther("");
                      }}
                      className="shrink-0 border-slate-200 px-3 text-xs"
                    >
                      List
                    </Button>
                  </div>
                ) : (
                  <Select value={searchForm.companySpecialty} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, companySpecialty: value }))}>
                    <SelectTrigger aria-label="Company specialty">
                      <SelectValue placeholder="Select company specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction & Engineering">Construction & Engineering</SelectItem>
                      <SelectItem value="Manufacturing & Factory">Manufacturing & Factory</SelectItem>
                      <SelectItem value="Technology & IT">Technology & IT</SelectItem>
                      <SelectItem value="Healthcare & Pharmaceutical">Healthcare & Pharmaceutical</SelectItem>
                      <SelectItem value="Education & Training">Education & Training</SelectItem>
                      <SelectItem value="Finance & Banking">Finance & Banking</SelectItem>
                      <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                      <SelectItem value="Government Institution">Government Institution</SelectItem>
                      <SelectItem value="Retail & Trading">Retail & Trading</SelectItem>
                      <SelectItem value="Transport & Logistics">Transport & Logistics</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-800">Company Information</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[0.9fr_0.9fr_0.9fr_1fr_1.3fr]">
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Job Title</label>
                  {jobTitleIsOther ? (
                    <div className="flex gap-2">
                      <Input
                        autoFocus
                        value={jobTitleOther}
                        onChange={(e) => {
                          setJobTitleOther(e.target.value);
                          setSearchForm((prev) => ({ ...prev, jobTitle: e.target.value }));
                        }}
                        placeholder="Enter job title"
                        className="border-slate-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setJobTitleIsOther(false);
                          setJobTitleOther("");
                          setSearchForm((prev) => ({ ...prev, jobTitle: "" }));
                        }}
                        className="shrink-0 border-slate-200 px-3 text-xs"
                      >
                        List
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={searchForm.jobTitle}
                      onValueChange={(value) => {
                        if (value === "Other") {
                          setJobTitleIsOther(true);
                          setSearchForm((prev) => ({ ...prev, jobTitle: "" }));
                        } else setSearchForm((prev) => ({ ...prev, jobTitle: value }));
                      }}
                    >
                      <SelectTrigger aria-label="Job title">
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shareholder">Shareholder</SelectItem>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Managing Director">Managing Director</SelectItem>
                        <SelectItem value="Authorized Manager">Authorized Manager</SelectItem>
                        <SelectItem value="General Manager">General Manager</SelectItem>
                        <SelectItem value="Department Manager">Department Manager</SelectItem>
                        <SelectItem value="CEO">CEO</SelectItem>
                        <SelectItem value="CFO">CFO</SelectItem>
                        <SelectItem value="COO">COO</SelectItem>
                        <SelectItem value="Engineer">Engineer</SelectItem>
                        <SelectItem value="Accountant">Accountant</SelectItem>
                        <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Department</label>
                  <Input value={searchForm.department} onChange={(e) => setSearchForm((prev) => ({ ...prev, department: e.target.value }))} className="border-slate-200" />
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Work City</label>
                  {workCityIsOther ? (
                    <div className="flex gap-2">
                      <Input
                        autoFocus
                        value={workCityOther}
                        onChange={(e) => {
                          setWorkCityOther(e.target.value);
                          setSearchForm((prev) => ({ ...prev, workCity: e.target.value }));
                        }}
                        placeholder="Enter work city"
                        className="border-slate-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setWorkCityIsOther(false);
                          setWorkCityOther("");
                          setSearchForm((prev) => ({ ...prev, workCity: "" }));
                        }}
                        className="shrink-0 border-slate-200 px-3 text-xs"
                      >
                        List
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={searchForm.workCity}
                      onValueChange={(value) => {
                        if (value === "Other") {
                          setWorkCityIsOther(true);
                          setSearchForm((prev) => ({ ...prev, workCity: "" }));
                        } else setSearchForm((prev) => ({ ...prev, workCity: value }));
                      }}
                    >
                      <SelectTrigger aria-label="Work city">
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {IRAQI_GOVERNORATES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Work Phone</label>
                  <Input value={searchForm.workPhone} onChange={(e) => setSearchForm((prev) => ({ ...prev, workPhone: e.target.value }))} dir="ltr" inputMode="tel" className="border-slate-200" />
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Work Email</label>
                  <Input value={searchForm.workEmail} onChange={(e) => setSearchForm((prev) => ({ ...prev, workEmail: e.target.value }))} dir="ltr" inputMode="email" className="border-slate-200" />
                </div>
              </div>
            </div>

            {/* Residency & Schengen Information */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-800">Residency & Schengen Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Keep the residency controls readable: the previous 12-column grid
                    left each unspanned field only one column wide on large screens. */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Residency Country</label>
                  <SearchableChoice value={searchForm.residenceCountry} placeholder="Select country" items={placeOfBirthCountries.map((country) => ({ value: country.label, label: country.label }))} onSelect={(value) => setSearchForm((prev) => ({ ...prev, residenceCountry: value }))} />
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-600">Previous Schengen Visa?</label>
                  <select
                    value={searchForm.previousSchengenVisa ? "yes" : "no"}
                    onChange={(e) =>
                      setSearchForm((prev) => {
                        const enabled = e.target.value === "yes";
                        return {
                          ...prev,
                          previousSchengenVisa: enabled,
                          previousSchengenVisas: enabled ? (prev.previousSchengenVisas.length === 0 ? [{ ...EMPTY_SCHENGEN_VISA }] : prev.previousSchengenVisas) : [],
                        };
                      })
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="space-y-1.5 relative sm:col-span-2 lg:col-span-1">
                  <label className="text-xs font-bold text-slate-600">Other Residence Permit?</label>
                  <select value={searchForm.hasOtherResidencePermit ? "yes" : "no"} onChange={(e) => setSearchForm((prev) => ({ ...prev, hasOtherResidencePermit: e.target.value === "yes" }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {searchForm.hasOtherResidencePermit && (
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Residence Permit Country</label>
                    <SearchableChoice value={searchForm.otherResidenceCountry} placeholder="Select country" items={placeOfBirthCountries.map((country) => ({ value: country.label, label: country.label }))} onSelect={(value) => setSearchForm((prev) => ({ ...prev, otherResidenceCountry: value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Permit Number</label>
                    <Input value={searchForm.otherResidenceNumber} onChange={(e) => setSearchForm((prev) => ({ ...prev, otherResidenceNumber: e.target.value }))} placeholder="Permit number" dir="ltr" className="border-slate-200 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Permit Issue Date</label>
                    <Input type="date" value={searchForm.otherResidenceIssueDate} onChange={(e) => setSearchForm((prev) => ({ ...prev, otherResidenceIssueDate: e.target.value }))} className="border-slate-200 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Permit Expiry Date</label>
                    <Input type="date" value={searchForm.otherResidenceExpiryDate} onChange={(e) => setSearchForm((prev) => ({ ...prev, otherResidenceExpiryDate: e.target.value }))} className="border-slate-200 bg-white" />
                  </div>
                </div>
              )}

              {searchForm.previousSchengenVisa && (
                <div className="space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Previous Schengen Visas (Last 5 Years)</h4>
                      <p className="mt-0.5 text-[11px] text-slate-500">Enter the details for each previous visa.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: [...prev.previousSchengenVisas, { ...EMPTY_SCHENGEN_VISA }] }))} className="border-slate-200 bg-white">
                      <Plus className="size-3.5" /> Add Visa
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {searchForm.previousSchengenVisas.map((visa, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Country</label>
                          <SearchableChoice value={visa.country} placeholder="Select Schengen country" items={SCHENGEN_COUNTRIES.map((country) => ({ value: country, label: country }))} onSelect={(value) => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, country: value } : item)) }))} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Visa Number</label>
                          <Input value={visa.visa_number} onChange={(e) => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, visa_number: e.target.value } : item)) }))} dir="ltr" className="border-slate-200" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Issue Date</label>
                          <Input type="date" value={visa.issue_date} onChange={(e) => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, issue_date: e.target.value } : item)) }))} className="border-slate-200" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Expiry Date</label>
                          <Input type="date" value={visa.expiry_date} onChange={(e) => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, expiry_date: e.target.value } : item)) }))} className="border-slate-200" />
                        </div>
                        <Button type="button" variant="ghost" size="sm" aria-label={`Remove Schengen visa ${index + 1}`} onClick={() => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.filter((_, itemIndex) => itemIndex !== index) }))} className="text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Application metadata section */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Application Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Application ID</label>
                  <Input value={caseNumber} disabled className="bg-slate-50 border-slate-200 text-slate-500 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Application Date</label>
                  <Input value={new Date(registration.created_at).toLocaleDateString("en-US")} disabled className="bg-slate-50 border-slate-200 text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Created By</label>
                  <Input value={registration.employee?.full_name || "Noor Al-Shakri"} disabled className="bg-slate-50 border-slate-200 text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Assigned To</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                    <option value="">Select Staff</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name || emp.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Notes (Internal Notes)</label>
                <textarea value={appNotes} onChange={(e) => setAppNotes(e.target.value)} placeholder="Client requires urgent registration..." className="min-h-16 w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20" />
              </div>
            </div>

            {/* Wizard Step buttons */}
            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setStep(2)} className="border-slate-200 text-slate-600">
                Back to Search
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraftOnly} className="border-slate-200 text-slate-600">
                  Save Draft
                </Button>
                <Button onClick={handleSaveIntake} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
                  Continue to Visa Application
                </Button>
              </div>
            </div>
          </Card>

        </div>
      )}
  </>
}
