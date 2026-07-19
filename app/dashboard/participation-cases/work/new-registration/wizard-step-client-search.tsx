/* eslint-disable */
// @ts-nocheck -- The controller owns the strongly typed model; step files only render it.
import { useWizardView } from "./wizard-view-context"; export function ClientSearchStep() {
  // prettier-ignore
  const { AlertTriangle, ApplicationSummary, Badge, Bell, Button, Card, CheckCircle2, ClientSummary, Clock, Download, EMPTY_SCHENGEN_VISA, EmailField, ExternalLink, Eye, EyeOff, FileCode, FileText, FolderKanban, IRAQI_GOVERNORATES, Input, Lock, MessageCircle, PhoneNumberField, Plus, Printer, REGISTRATION_STEPS, RefreshCw, RegistrationProgress, SCHENGEN_COUNTRIES, Search, SearchableChoice, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Trash2, Upload, User, VISA_DOCUMENTS, VISA_ROUTES, VISA_SUBMISSION_METHODS, VISA_TYPE_OPTIONS, Volume2, X, addVisaReminder, amountPaid, appNotes, applyChangeableUpdates, assignedEmployee, assignedTo, balanceDue, breadcrumbLabel, buildTravelPurpose, canEditFeeBreakdown, caseNumber, client, cn, companySpecialtyOther, currentUser, deliveryDocumentPaths, deliveryMessage, deliveryStatus, documentImportFile, documentImportText, documentImportType, emailValidation, employees, events, fees, findDocument, formatEventDate, fullNameIsValid, handleArchiveReceipt, handleContinueWithClient, handleCreateNewClient, handleDownloadReceipt, handleGenerateReceipt, handleMergeFiles, handlePrintReceipt, handleSaveDraftOnly, handleSaveEventDetails, handleSaveIntake, handleSavePaymentDraft, handleSaveVisaDetails, handleSearch, handleStep4FileUpload, handleVisaDestinationChange, hasSearched, includeClientInfoInPackage, inviterConfig, isImportingDocument, isPackageGenerating, isPending, jobTitleIsOther, jobTitleOther, latestActivity, mergeableDocuments, missingSummaryDocuments, nationalIdIsValid, newReminderAt, newReminderNote, onClose, openWhatsApp, packageDocument, packageDocumentPaths, packageName, participationType, passportNumberIsValid, paymentCategory, paymentDate, paymentMethod, paymentNotes, phoneCountry, phoneValidation, placeOfBirthCitiesByCountry, placeOfBirthCountries, processImportedDocument, registration, registrationDocuments, registrationId, requiredVisaDocuments, router, searchForm, searchResults, selectedEvent, selectedEventId, selectedPotentialMatch, setAmountPaid, setAppNotes, setAssignedTo, setCompanySpecialtyOther, setDeliveryDocumentPaths, setDeliveryMessage, setDocumentImportFile, setDocumentImportText, setDocumentImportType, setFees, setHasSearched, setIncludeClientInfoInPackage, setJobTitleIsOther, setJobTitleOther, setNewReminderAt, setNewReminderNote, setPackageDocumentPaths, setPackageName, setParticipationType, setPaymentCategory, setPaymentDate, setPaymentMethod, setPaymentNotes, setPhoneCountry, setSearchForm, setSearchResults, setSelectedEventId, setSelectedPotentialMatch, setShowDocumentImport, setShowPassword, setShowUpdatePrompt, setStep, setTravelPurpose, setVisaAccountStatus, setVisaAppRefNumber, setVisaAppointmentCenter, setVisaAppointmentChannel, setVisaAppointmentCity, setVisaAppointmentDate, setVisaAppointmentRefNumber, setVisaAppointmentStatus, setVisaAppointmentTime, setVisaEmbassy, setVisaEmbassyCity, setVisaPlatform, setVisaPortalAppStatus, setVisaPortalEmail, setVisaPortalPassword, setVisaReminders, setVisaSubmissionMethod, setVisaType, setWorkCityIsOther, setWorkCityOther, showDocumentImport, showPassword, showUpdatePrompt, step, stepStatus, summaryAppointment, summaryStatus, surnameIsValid, toast, totalAmount, travelPurpose, uploadError, uploadingDocumentType, validateStepBeforeAdvance, visaAccountStatus, visaAppRefNumber, visaAppointmentCenter, visaAppointmentChannel, visaAppointmentCity, visaAppointmentDate, visaAppointmentRefNumber, visaAppointmentStatus, visaAppointmentTime, visaDestination, visaEmbassyCity, visaPlatform, visaPortalAppStatus, visaPortalEmail, visaPortalPassword, visaReminders, visaSubmissionMethod, visaType, workCityIsOther, workCityOther } = useWizardView();
  const { ocrHighlightedFields, setOcrHighlightedFields, workPhoneCountry, setWorkPhoneCountry } = useWizardView();
  const ocrFieldClass = (field) => ocrHighlightedFields.includes(field) ? "ocr-field-highlight" : "";
  const markOcrFieldReviewed = (field) => setOcrHighlightedFields((current) => current.filter((item) => item !== field));
  return <>
      {step === 2 && (
        <div className="w-full animate-in fade-in duration-300">
          <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
            <style>{`.ocr-field-highlight input,.ocr-field-highlight button[role="combobox"]{border-color:#8B0000 !important;box-shadow:0 0 0 1px rgba(139,0,0,.12)}`}</style>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Search className="size-4 text-[#8B0000]" />
              <h2 className="text-base font-bold text-slate-800">Search for existing client</h2>
              <Button type="button" variant="outline" size="sm" className="ml-auto gap-1.5 border-[#8B0000]/30 text-[#8B0000] hover:bg-red-50" onClick={() => setShowDocumentImport(true)}>
                <Upload className="size-3.5" /> Import document
              </Button>
            </div>

            {showDocumentImport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-labelledby="document-import-title">
                <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 id="document-import-title" className="text-lg font-bold text-slate-900">
                        Import client document
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">Choose the document you want to use for client data.</p>
                    </div>
                    <button type="button" onClick={() => setShowDocumentImport(false)} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close import dialog">
                      ×
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setDocumentImportType("passport")} className={cn("rounded-md border px-3 py-2 text-sm font-semibold transition", documentImportType === "passport" ? "border-[#8B0000] bg-red-50 text-[#8B0000]" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                      Passport
                    </button>
                    <button type="button" onClick={() => setDocumentImportType("national-id")} className={cn("rounded-md border px-3 py-2 text-sm font-semibold transition", documentImportType === "national-id" ? "border-[#8B0000] bg-red-50 text-[#8B0000]" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                      National ID
                    </button>
                  </div>
                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-[#8B0000] hover:bg-red-50/30">
                    <Upload className="mb-2 size-6 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Drop a file here or choose a file</span>
                    <span className="mt-1 text-xs text-slate-500">PDF, JPG, PNG</span>
                    <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(event) => setDocumentImportFile(event.target.files?.[0] || null)} />
                  </label>
                  {documentImportFile && <p className="mt-2 text-xs text-emerald-700">Selected: {documentImportFile.name}</p>}
                  <div className="mt-4 space-y-2">
                    <label htmlFor="document-import-paste" className="text-xs font-semibold text-slate-600">
                      Or paste document text
                    </label>
                    <textarea id="document-import-paste" value={documentImportText} onChange={(event) => setDocumentImportText(event.target.value)} rows={3} placeholder={documentImportType === "passport" ? "Paste passport text or MRZ here" : "Paste the National ID text here"} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#8B0000]" />
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowDocumentImport(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={processImportedDocument} disabled={isImportingDocument}>
                      {isImportingDocument ? "Processing…" : "Continue"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-3 gap-y-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-12 xl:grid-cols-[70px_minmax(195px,2fr)_minmax(105px,1fr)_68px_minmax(110px,1.05fr)_minmax(125px,1.2fr)_minmax(100px,.9fr)_minmax(100px,.9fr)] xl:gap-x-2">
              <div className="flex flex-col gap-1.5 lg:order-1 lg:col-span-1 lg:w-[70px]">
                <label className="text-xs font-bold text-slate-600">Title</label>
                <Select value={searchForm.salutation} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, salutation: value }))}>
                  <SelectTrigger aria-label="Title or salutation">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Other"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div onClick={() => markOcrFieldReviewed("fullName")} className={cn("flex flex-col gap-1.5 lg:order-2 lg:col-span-3 xl:col-span-1", ocrFieldClass("fullName"))}>
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <Input
                  value={searchForm.fullName}
                  onChange={(e) => {
                    const normalizedValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z\s'.-]/g, "")
                      .replace(/\s{2,}/g, " ");
                    setSearchForm((prev) => ({ ...prev, fullName: normalizedValue }));
                  }}
                  placeholder="Enter full name"
                  aria-invalid={!fullNameIsValid}
                  maxLength={100}
                  title="Use letters only. Spaces, apostrophes, dots, and hyphens are allowed."
                  className={cn("border-slate-200", !fullNameIsValid && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                />
              </div>
              <div onClick={() => markOcrFieldReviewed("surname")} className={cn("flex flex-col gap-1.5 lg:order-3 lg:col-span-2 xl:col-span-1", ocrFieldClass("surname"))}>
                <label className="text-xs font-bold text-slate-600">Surname</label>
                <Input
                  value={searchForm.surname}
                  onChange={(e) => {
                    const normalizedValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z\s'.-]/g, "")
                      .replace(/\s{2,}/g, " ");
                    setSearchForm((prev) => ({ ...prev, surname: normalizedValue }));
                  }}
                  placeholder="Enter surname"
                  aria-invalid={!surnameIsValid}
                  maxLength={60}
                  title="Use letters only. Spaces, apostrophes, dots, and hyphens are allowed."
                  className={cn("max-w-[15ch] border-slate-200", !surnameIsValid && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                />
              </div>
              <div onClick={() => markOcrFieldReviewed("gender")} className={cn("flex flex-col gap-1.5 lg:order-4 lg:col-span-1 lg:w-[68px]", ocrFieldClass("gender"))}>
                <label className="text-xs font-bold text-slate-600">Gender</label>
                <Select value={searchForm.gender} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, gender: value }))}>
                  <SelectTrigger aria-label="Gender">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">M</SelectItem>
                    <SelectItem value="Female">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div onClick={() => markOcrFieldReviewed("passportNumber")} className={cn("space-y-1.5 lg:order-5 lg:col-span-2 xl:col-span-1", ocrFieldClass("passportNumber"))}>
                <label className="text-xs font-bold text-slate-600">Passport Number</label>
                <Input
                  value={searchForm.passportNumber}
                  onChange={(e) => {
                    const rawValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    const normalizedValue = rawValue ? `${rawValue[0].replace(/[^A-Z]/g, "")}${rawValue.slice(1).replace(/[^0-9]/g, "")}`.slice(0, 9) : "";
                    setSearchForm((prev) => ({ ...prev, passportNumber: normalizedValue }));
                  }}
                  placeholder="e.g. A12345678"
                  aria-invalid={!passportNumberIsValid}
                  maxLength={9}
                  pattern="[A-Za-z][0-9]{7,8}"
                  title="Use 1 English letter followed by 7 or 8 digits"
                  className={cn("border-slate-200 font-mono", !passportNumberIsValid && "border-red-300 focus:border-red-400 focus:ring-red-100")}
                />
              </div>
              <div className="space-y-1.5 lg:order-13 lg:col-span-7 xl:col-span-4">
                <label className="text-xs font-bold text-slate-600">Company Name</label>
                <Input value={searchForm.companyName} onChange={(e) => setSearchForm((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="Enter company name" className="border-slate-200" />
              </div>
              <div className="space-y-1.5 lg:order-13 lg:col-span-5 xl:col-span-4">
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
                      className="shrink-0 border-slate-200 px-3 text-xs text-slate-600"
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
              <div onClick={() => markOcrFieldReviewed("dateOfBirth")} className={cn("space-y-1.5 lg:order-6 lg:col-span-2 lg:w-[174px] xl:col-span-1 xl:w-auto", ocrFieldClass("dateOfBirth"))}>
                <label className="text-xs font-bold text-slate-600">Date of Birth</label>
                <Input type="date" value={searchForm.dateOfBirth} onChange={(e) => { const value = e.currentTarget.value; setSearchForm((prev) => ({ ...prev, dateOfBirth: value })) }} onInput={(e) => { const value = e.currentTarget.value; setSearchForm((prev) => ({ ...prev, dateOfBirth: value })) }} className="border-slate-200" />
              </div>
              <div onClick={() => markOcrFieldReviewed("placeOfBirthCountry")} className={cn("w-full max-w-[20ch] space-y-1.5 lg:order-7 lg:col-span-2 lg:max-w-[147px] xl:col-span-1 xl:max-w-none", ocrFieldClass("placeOfBirthCountry"))}>
                <label className="text-xs font-bold text-slate-600">Place of Birth Country</label>
                <SearchableChoice
                  value={searchForm.placeOfBirthCountry}
                  placeholder="Select country"
                  items={placeOfBirthCountries.map((country) => ({ value: country.code, label: country.label }))}
                  onSelect={(value) =>
                    setSearchForm((prev) => ({
                      ...prev,
                      placeOfBirthCountry: value,
                      placeOfBirthCity: "",
                      placeOfBirth: value && prev.placeOfBirthCity ? `${placeOfBirthCountries.find((country) => country.code === value)?.label || value}, ${prev.placeOfBirthCity}` : placeOfBirthCountries.find((country) => country.code === value)?.label || value,
                    }))
                  }
                />
              </div>
              <div onClick={() => markOcrFieldReviewed("placeOfBirthCity")} className={cn("w-full max-w-[19ch] space-y-1.5 lg:order-8 lg:col-span-2 lg:max-w-[148px] xl:col-span-1 xl:max-w-none", ocrFieldClass("placeOfBirthCity"))}>
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
                      placeOfBirth: prev.placeOfBirthCountry ? `${placeOfBirthCountries.find((country) => country.code === prev.placeOfBirthCountry)?.label || prev.placeOfBirthCountry}, ${value}` : value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 lg:order-9 lg:col-span-12 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-[155px_155px_155px_125px_minmax(344px,1fr)_238px] 2xl:gap-x-2 2xl:gap-y-0">
                <div onClick={() => markOcrFieldReviewed("passportIssueDate")} className={cn("space-y-1.5", ocrFieldClass("passportIssueDate"))}>
                  <label className="text-xs font-bold text-slate-600">Passport Issue Date</label>
                  <Input type="date" value={searchForm.passportIssueDate} onChange={(e) => { const value = e.currentTarget.value; setSearchForm((prev) => ({ ...prev, passportIssueDate: value })) }} onInput={(e) => { const value = e.currentTarget.value; setSearchForm((prev) => ({ ...prev, passportIssueDate: value })) }} className="border-slate-200" />
                </div>
                <div onClick={() => markOcrFieldReviewed("passportExpiryDate")} className={cn("space-y-1.5", ocrFieldClass("passportExpiryDate"))}>
                  <label className="text-xs font-bold text-slate-600">Passport Expiry Date</label>
                  <Input type="date" value={searchForm.passportExpiryDate} onChange={(e) => { const value = e.currentTarget.value; setSearchForm((prev) => ({ ...prev, passportExpiryDate: value })) }} onInput={(e) => { const value = e.currentTarget.value; setSearchForm((prev) => ({ ...prev, passportExpiryDate: value })) }} className="border-slate-200" />
                </div>
                <div onClick={() => markOcrFieldReviewed("nationalId")} className={cn("space-y-1.5", ocrFieldClass("nationalId"))}>
                  <label className="text-xs font-bold text-slate-600">National ID</label>
                  <Input value={searchForm.nationalId} onChange={(e) => { const normalizedValue = e.target.value.replace(/\D/g, "").slice(0, 12); setSearchForm((prev) => ({ ...prev, nationalId: normalizedValue })); }} placeholder="Enter 12-digit national ID" aria-invalid={!nationalIdIsValid} inputMode="numeric" maxLength={12} pattern="[0-9]{12}" title="Enter exactly 12 digits" className={cn("border-slate-200 font-mono", !nationalIdIsValid && "border-red-300 focus:border-red-400 focus:ring-red-100")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Marital Status</label>
                  <Select value={searchForm.maritalStatus} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, maritalStatus: value }))}>
                    <SelectTrigger aria-label="Marital status"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 min-w-0 2xl:w-[344px]">
                  <label className="text-xs font-bold text-slate-600">Email Address</label>
                  <EmailField value={searchForm.email} error={emailValidation.error} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, email: value }))} placeholder="ahmed.ali@example.com" />
                </div>
                <div className="space-y-1.5 min-w-0 2xl:relative 2xl:-translate-x-[161px]">
                  <label className="text-xs font-bold text-slate-600">Phone Number</label>
                  <PhoneNumberField value={searchForm.phone} country={phoneCountry} error={phoneValidation.error} onCountryChange={setPhoneCountry} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, phone: value }))} />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-3">
              <h3 className="text-sm font-bold text-slate-800">Company Information</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1.5 relative"><label className="text-xs font-bold text-slate-600">Job Title</label>{jobTitleIsOther ? <div className="flex gap-2"><Input autoFocus value={jobTitleOther} onChange={(e) => { setJobTitleOther(e.target.value); setSearchForm((prev) => ({ ...prev, jobTitle: e.target.value })); }} placeholder="Enter job title" className="border-slate-200" /><Button type="button" variant="outline" onClick={() => { setJobTitleIsOther(false); setJobTitleOther(""); setSearchForm((prev) => ({ ...prev, jobTitle: "" })); }} className="shrink-0 border-slate-200 px-3 text-xs">List</Button></div> : <Select value={searchForm.jobTitle} onValueChange={(value) => { if (value === "Other") { setJobTitleIsOther(true); setSearchForm((prev) => ({ ...prev, jobTitle: "" })); } else setSearchForm((prev) => ({ ...prev, jobTitle: value })); }}><SelectTrigger aria-label="Job title"><SelectValue placeholder="Select job title" /></SelectTrigger><SelectContent>{["Shareholder", "Owner", "Managing Director", "Authorized Manager", "General Manager", "Department Manager", "CEO", "CFO", "COO", "Engineer", "Accountant", "Sales Manager", "Other"].map((title) => <SelectItem key={title} value={title}>{title}</SelectItem>)}</SelectContent></Select>}</div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Department</label><Input value={searchForm.department} onChange={(e) => setSearchForm((prev) => ({ ...prev, department: e.target.value }))} className="border-slate-200" /></div>
                <div className="space-y-1.5 relative"><label className="text-xs font-bold text-slate-600">Work City</label>{workCityIsOther ? <div className="flex gap-2"><Input autoFocus value={workCityOther} onChange={(e) => { setWorkCityOther(e.target.value); setSearchForm((prev) => ({ ...prev, workCity: e.target.value })); }} placeholder="Enter work city" className="border-slate-200" /><Button type="button" variant="outline" onClick={() => { setWorkCityIsOther(false); setWorkCityOther(""); setSearchForm((prev) => ({ ...prev, workCity: "" })); }} className="shrink-0 border-slate-200 px-3 text-xs">List</Button></div> : <Select value={searchForm.workCity} onValueChange={(value) => { if (value === "Other") { setWorkCityIsOther(true); setSearchForm((prev) => ({ ...prev, workCity: "" })); } else setSearchForm((prev) => ({ ...prev, workCity: value })); }}><SelectTrigger aria-label="Work city"><SelectValue placeholder="Select governorate" /></SelectTrigger><SelectContent>{IRAQI_GOVERNORATES.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}<SelectItem value="Other">Other</SelectItem></SelectContent></Select>}</div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Work Phone</label><PhoneNumberField value={searchForm.workPhone} country={workPhoneCountry} error="" onCountryChange={setWorkPhoneCountry} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, workPhone: value }))} /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600">Work Email</label><Input value={searchForm.workEmail} onChange={(e) => setSearchForm((prev) => ({ ...prev, workEmail: e.target.value }))} dir="ltr" inputMode="email" className="border-slate-200" /></div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setStep(1)} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchForm({
                      fullName: "",
                      surname: "",
                      salutation: "",
                      gender: "",
                      maritalStatus: "",
                      passportNumber: "",
                      nationalId: "",
                      phone: "",
                      email: "",
                      companyName: "",
                      companySpecialty: "",
                      dateOfBirth: "",
                      placeOfBirthCountry: "",
                      placeOfBirthCity: "",
                      placeOfBirth: "",
                      passportIssueDate: "",
                      passportExpiryDate: "",
                      jobTitle: "",
                      department: "",
                      workCity: "",
                      workPhone: "",
                      workEmail: "",
                      residenceCountry: "Iraq",
                      previousSchengenVisa: false,
                      previousSchengenVisas: [],
                      hasOtherResidencePermit: false,
                      otherResidenceCountry: "",
                      otherResidenceNumber: "",
                      otherResidenceIssueDate: "",
                      otherResidenceExpiryDate: "",
                    });
                    setSearchResults([]);
                    setHasSearched(false);
                    setSelectedPotentialMatch(null);
                    setCompanySpecialtyOther("");
                  }}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </Button>
                <Button onClick={handleSearch} disabled={isPending} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm flex items-center justify-center gap-1.5">
                  {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
              </div>
            </div>
          </Card>

          {/* Search Results section with matching items */}
          {hasSearched && (
            <div className="space-y-2 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-800">
                  Search Results
                  <span className="text-xs text-slate-400 font-semibold ml-2">({searchResults.length} match(es) found)</span>
                </h3>
                <Button variant="ghost" size="sm" onClick={handleSearch} className="text-xs text-slate-500 gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </Button>
              </div>

              {searchResults.length === 0 ? (
                <Card className="border-slate-200 border-dashed p-10 text-center">
                  <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                  <h4 className="font-bold text-slate-700">No matching client found?</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">You can create a new client profile and proceed with registration.</p>
                  <Button onClick={handleCreateNewClient} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5 shadow-sm">
                    <Plus className="w-4 h-4" /> Create New Client
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((match, index) => {
                    const c = match.client;
                    const isSelected = selectedPotentialMatch?.client.id === c.id;

                    // Comparisons badges logic
                    const pMatch = searchForm.passportNumber && c.passport_number && searchForm.passportNumber.trim() !== c.passport_number.trim();
                    const nIdMatch = searchForm.nationalId && c.national_id && searchForm.nationalId.trim() === c.national_id.trim();
                    const dobMatch = searchForm.dateOfBirth && c.date_of_birth && searchForm.dateOfBirth === c.date_of_birth;
                    const companyMatch = searchForm.companyName && c.employer_name && searchForm.companyName.trim().toLowerCase() === c.employer_name.trim().toLowerCase();

                    return (
                      <Card key={c.id} className={`border transition-all duration-300 cursor-pointer ${isSelected ? "border-[#8B0000] ring-2 ring-[#8B0000]/10 shadow-md" : "border-slate-200 hover:border-slate-300 shadow-sm"}`} onClick={() => setSelectedPotentialMatch(match)}>
                        <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">{(c.full_name_as_passport || "C").slice(0, 2).toUpperCase()}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-800">{c.full_name_as_passport}</h4>
                                <Badge className={match.matchType === "Exact Match" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : match.matchType === "Strong Match" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                                  {match.matchType} — {match.score}%
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-500 mt-1 space-x-2">
                                <span>{c.title_salutation || "Mr."}</span>
                                <span>•</span>
                                <span>{c.employer_name || "Al Noor Trading Co."}</span>
                                <span>•</span>
                                <span>{c.email || "ahmed.ali@example.com"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-xs md:text-center">
                            <div>
                              <span className="text-slate-400 block font-medium">Passport</span>
                              <span className="font-semibold font-mono text-slate-700">{c.passport_number || "—"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className={pMatch ? "border-amber-200 text-amber-700 bg-amber-50" : "border-emerald-200 text-emerald-700 bg-emerald-50"}>
                                  {pMatch ? "Different" : "Match"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">National ID</span>
                              <span className="font-semibold font-mono text-slate-700">{c.national_id || "—"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className={nIdMatch ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-400 bg-slate-50"}>
                                  {nIdMatch ? "Match" : "—"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Date of Birth</span>
                              <span className="font-semibold text-slate-700">{c.date_of_birth || "—"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className={dobMatch ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-400 bg-slate-50"}>
                                  {dobMatch ? "Match" : "—"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Company</span>
                              <span className="font-semibold text-slate-700 truncate block max-w-[110px]">{c.employer_name || "—"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className={companyMatch ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-400 bg-slate-50"}>
                                  {companyMatch ? "Match" : "—"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Phone</span>
                              <span className="font-semibold text-slate-700 truncate block max-w-[100px]">{c.phone || "—"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                  Match
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Gender</span>
                              <span className="font-semibold text-slate-700">{c.sex || "Male"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                  Match
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Marital Status</span>
                              <span className="font-semibold text-slate-700">{c.marital_status || "Married"}</span>
                              <div className="mt-1">
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                  Match
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info("جاري فتح ملف العميل للمعاينة...");
                              }}
                              className="border-slate-200 text-slate-600 gap-1 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Profile
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Keep the available client/application flows in one compact row on desktop. */}
              {selectedPotentialMatch && (
                <Card className="mt-3 border-slate-200/80 bg-slate-50/40 p-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <Button onClick={() => handleContinueWithClient(selectedPotentialMatch, true)} className="h-9 bg-[#8B0000] text-xs font-bold text-white hover:bg-[#6B0000]">
                      New Application
                    </Button>
                    <Button onClick={handleCreateNewClient} variant="outline" className="h-9 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
                      New Client
                    </Button>
                    <Button onClick={() => handleContinueWithClient(selectedPotentialMatch, false)} variant="outline" className="h-9 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
                      Continue with Application (Existing)
                    </Button>
                  </div>
                </Card>
              )}

              {/* Info footer */}
              <div className="text-center text-xs text-slate-400 pt-4 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Matching is based on Name, Date of Birth, Place of Birth, National ID, and Company Name.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>;
}
