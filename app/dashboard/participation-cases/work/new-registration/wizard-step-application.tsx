'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CheckCircle2, Plus, Trash2, Upload, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { EmailField, PhoneNumberField } from './wizard-fields'
import { SearchableChoice } from './searchable-choice'
import { IRAQI_GOVERNORATES, PLACE_OF_BIRTH_CITIES, PLACE_OF_BIRTH_COUNTRIES, SCHENGEN_COUNTRIES } from './wizard-constants'
import { EMPTY_SCHENGEN_VISA } from './wizard-helpers'
import { useWizardDocuments, useWizardEvent, useWizardIntake, useWizardShell } from './wizard-view-context'

const JOB_TITLES = ['Shareholder', 'Owner', 'Managing Director', 'Authorized Manager', 'General Manager', 'Department Manager', 'CEO', 'CFO', 'COO', 'Engineer', 'Accountant', 'Sales Manager']

const COMPANY_SPECIALTIES: [string, string][] = [
  ['Construction & Engineering', 'Construction & Engineering'],
  ['Manufacturing & Factory', 'Manufacturing & Factory'],
  ['Technology & IT', 'Technology & IT'],
  ['Healthcare & Pharmaceutical', 'Healthcare & Pharmaceutical'],
  ['Education & Training', 'Education & Training'],
  ['Finance & Banking', 'Finance & Banking'],
  ['Energy & Utilities', 'Energy & Utilities'],
  ['Government Institution', 'Government Institution'],
  ['Retail & Trading', 'Retail & Trading'],
  ['Transport & Logistics', 'Transport & Logistics'],
]

export function ApplicationStep() {
  const { step, registration, caseNumber, setStep, employees } = useWizardShell()
  const { selectedEvent } = useWizardEvent()
  const intake = useWizardIntake()
  const { registrationDocuments, uploadingDocumentType, uploadError, handleUploadDocument } = useWizardDocuments()

  if (step !== 3 || !registration) return null

  const { searchForm, setSearchForm } = intake
  const dateOfBirthInvalid = Boolean(searchForm.dateOfBirth && (new Date(searchForm.dateOfBirth) > new Date() || !/^\d{4}-\d{2}-\d{2}$/.test(searchForm.dateOfBirth)))

  const eventDate = selectedEvent?.date ? new Date(selectedEvent.date) : null
  const minimumExpiry = eventDate && !Number.isNaN(eventDate.getTime()) ? new Date(eventDate) : null
  if (minimumExpiry) minimumExpiry.setMonth(minimumExpiry.getMonth() + 3)
  const expiryInvalid = Boolean(searchForm.passportExpiryDate && minimumExpiry && new Date(searchForm.passportExpiryDate) < minimumExpiry)

  const applicationDate = registration.created_at && !Number.isNaN(new Date(registration.created_at).getTime())
    ? new Date(registration.created_at).toLocaleDateString('en-GB')
    : '—'
  // The first recorded activity is who opened the application; this used to be
  // a name hardcoded into the markup.
  const createdByName = Array.isArray(registration.registration_events)
    ? [...registration.registration_events].sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)))[0]?.performed_by_name
    : ''

  return (
    <div className="w-full space-y-2.5 animate-in fade-in duration-300">
      <div role="status" className="flex items-center justify-between rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-emerald-800">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>Client selected successfully. Existing information has been loaded.</span>
        </div>
      </div>

      <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <User className="size-4 text-[#8B0000]" />
            <h2 className="text-base font-bold text-slate-800">Client information</h2>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Read-only client profile</span>
        </div>

        <fieldset disabled className="pointer-events-none space-y-4 select-none">
          {/* Read-only client fields. They are edited from the client search step. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-1.5 relative lg:order-2 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600">Full Name</label>
              <Input dir="ltr" value={searchForm.fullName} onChange={(event) => setSearchForm((prev) => ({ ...prev, fullName: event.target.value.toUpperCase() }))} className="border-slate-200" />
            </div>
            <div className="space-y-1.5 relative lg:order-3 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Surname</label>
              <Input dir="ltr" value={searchForm.surname} onChange={(event) => setSearchForm((prev) => ({ ...prev, surname: event.target.value.toUpperCase() }))} className="border-slate-200" />
            </div>
            <div className="space-y-1.5 lg:order-1 lg:col-span-1">
              <label className="text-xs font-bold text-slate-600">Title</label>
              <select value={searchForm.salutation} onChange={(event) => setSearchForm((prev) => ({ ...prev, salutation: event.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            </div>
            <div className="space-y-1.5 lg:order-4 lg:col-span-1">
              <label className="text-xs font-bold text-slate-600">Gender</label>
              <select value={searchForm.gender} onChange={(event) => setSearchForm((prev) => ({ ...prev, gender: event.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="space-y-1.5 lg:order-11 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Marital Status</label>
              <select value={searchForm.maritalStatus} onChange={(event) => setSearchForm((prev) => ({ ...prev, maritalStatus: event.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="space-y-1.5 relative lg:order-5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Passport Number</label>
              <Input
                dir="ltr"
                value={searchForm.passportNumber}
                onChange={(event) =>
                  setSearchForm((prev) => ({
                    ...prev,
                    passportNumber: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9),
                  }))
                }
                className="border-slate-200 font-mono"
              />
            </div>
            <div className="space-y-1.5 relative lg:order-11 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">National ID</label>
              <Input dir="ltr" value={searchForm.nationalId} onChange={(event) => setSearchForm((prev) => ({ ...prev, nationalId: event.target.value.replace(/\D/g, '').slice(0, 12) }))} inputMode="numeric" className="border-slate-200 font-mono" />
            </div>
            <div className="space-y-1.5 relative lg:order-6 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date of Birth</label>
              <Input
                type="date"
                value={searchForm.dateOfBirth}
                onChange={(event) => setSearchForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
                className={cn('border-slate-200', dateOfBirthInvalid && 'border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500')}
                aria-invalid={dateOfBirthInvalid}
              />
              {dateOfBirthInvalid && <p className="text-[11px] font-medium text-red-600">Enter a valid date of birth. The year must match the ID card.</p>}
            </div>
            <div className="space-y-1.5 relative lg:order-7 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Place of Birth Country</label>
              <SearchableChoice
                value={searchForm.placeOfBirthCountry}
                placeholder="Select country"
                items={PLACE_OF_BIRTH_COUNTRIES.map((country) => ({ value: country.code, label: country.label }))}
                onSelect={(value) =>
                  setSearchForm((prev) => ({
                    ...prev,
                    placeOfBirthCountry: value,
                    placeOfBirth: `${PLACE_OF_BIRTH_COUNTRIES.find((country) => country.code === value)?.label || value}${prev.placeOfBirthCity ? `, ${prev.placeOfBirthCity}` : ''}`,
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
                items={(PLACE_OF_BIRTH_CITIES[searchForm.placeOfBirthCountry] || []).map((city) => ({ value: city, label: city }))}
                onSelect={(value) =>
                  setSearchForm((prev) => ({
                    ...prev,
                    placeOfBirthCity: value,
                    placeOfBirth: `${PLACE_OF_BIRTH_COUNTRIES.find((country) => country.code === prev.placeOfBirthCountry)?.label || prev.placeOfBirthCountry}, ${value}`,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 relative lg:order-9 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Passport Issue Date</label>
              <Input type="date" value={searchForm.passportIssueDate} onChange={(event) => setSearchForm((prev) => ({ ...prev, passportIssueDate: event.target.value }))} className="border-slate-200" />
            </div>
            <div className="space-y-1.5 relative lg:order-10 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600">Passport Expiry Date</label>
              <Input
                type="date"
                value={searchForm.passportExpiryDate}
                onChange={(event) => setSearchForm((prev) => ({ ...prev, passportExpiryDate: event.target.value }))}
                className={cn('border-slate-200', expiryInvalid && 'border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500')}
                aria-invalid={expiryInvalid}
              />
              {expiryInvalid && <p className="text-[11px] font-medium text-red-600">Passport expiry must be at least 3 months after the event date.</p>}
            </div>
            <div className="space-y-1.5 md:col-span-2 lg:order-15 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600">Phone Number</label>
              <PhoneNumberField value={searchForm.phone} country={intake.phoneCountry} error={intake.phoneValidation.error} onCountryChange={intake.setPhoneCountry} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, phone: value }))} />
            </div>
            <div className="space-y-1.5 lg:order-14 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600">Email Address</label>
              <EmailField value={searchForm.email} error={intake.emailValidation.error} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, email: value }))} />
            </div>
            <div className="space-y-1.5 lg:order-12 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600">Company Name</label>
              <Input value={searchForm.companyName} onChange={(event) => setSearchForm((prev) => ({ ...prev, companyName: event.target.value }))} className="border-slate-200" />
            </div>
            <div className="space-y-1.5 lg:order-13 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600">Company Specialty</label>
              {searchForm.companySpecialty === 'Other' ? (
                <div className="flex gap-2">
                  <Input autoFocus value={intake.companySpecialtyOther} onChange={(event) => intake.setCompanySpecialtyOther(event.target.value)} placeholder="Enter company specialty" className="border-slate-200" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchForm((prev) => ({ ...prev, companySpecialty: '' }))
                      intake.setCompanySpecialtyOther('')
                    }}
                    className="shrink-0 border-slate-200 px-3 text-xs"
                  >
                    List
                  </Button>
                </div>
              ) : (
                <Select value={searchForm.companySpecialty} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, companySpecialty: value }))}>
                  <SelectTrigger aria-label="Company specialty"><SelectValue placeholder="Select company specialty" /></SelectTrigger>
                  <SelectContent>
                    {COMPANY_SPECIALTIES.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800">Company Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600">Job Title</label>
                {intake.jobTitleIsOther ? (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      value={intake.jobTitleOther}
                      onChange={(event) => {
                        intake.setJobTitleOther(event.target.value)
                        setSearchForm((prev) => ({ ...prev, jobTitle: event.target.value }))
                      }}
                      placeholder="Enter job title"
                      className="border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        intake.setJobTitleIsOther(false)
                        intake.setJobTitleOther('')
                        setSearchForm((prev) => ({ ...prev, jobTitle: '' }))
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
                      if (value === 'Other') {
                        intake.setJobTitleIsOther(true)
                        setSearchForm((prev) => ({ ...prev, jobTitle: '' }))
                      } else {
                        setSearchForm((prev) => ({ ...prev, jobTitle: value }))
                      }
                    }}
                  >
                    <SelectTrigger aria-label="Job title"><SelectValue placeholder="Select job title" /></SelectTrigger>
                    <SelectContent>
                      {JOB_TITLES.map((title) => (
                        <SelectItem key={title} value={title}>{title}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600">Department</label>
                <Input value={searchForm.department} onChange={(event) => setSearchForm((prev) => ({ ...prev, department: event.target.value }))} className="border-slate-200" />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600">Work City</label>
                {intake.workCityIsOther ? (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      value={intake.workCityOther}
                      onChange={(event) => {
                        intake.setWorkCityOther(event.target.value)
                        setSearchForm((prev) => ({ ...prev, workCity: event.target.value }))
                      }}
                      placeholder="Enter work city"
                      className="border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        intake.setWorkCityIsOther(false)
                        intake.setWorkCityOther('')
                        setSearchForm((prev) => ({ ...prev, workCity: '' }))
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
                      if (value === 'Other') {
                        intake.setWorkCityIsOther(true)
                        setSearchForm((prev) => ({ ...prev, workCity: '' }))
                      } else {
                        setSearchForm((prev) => ({ ...prev, workCity: value }))
                      }
                    }}
                  >
                    <SelectTrigger aria-label="Work city"><SelectValue placeholder="Select governorate" /></SelectTrigger>
                    <SelectContent>
                      {IRAQI_GOVERNORATES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600">Work Phone</label>
                <Input value={searchForm.workPhone} onChange={(event) => setSearchForm((prev) => ({ ...prev, workPhone: event.target.value }))} dir="ltr" inputMode="tel" className="border-slate-200" />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600">Work Email</label>
                <Input value={searchForm.workEmail} onChange={(event) => setSearchForm((prev) => ({ ...prev, workEmail: event.target.value }))} dir="ltr" inputMode="email" className="border-slate-200" />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Residency & Schengen information */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-800">Residency & Schengen Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-600">Residency Country</label>
              <SearchableChoice
                value={searchForm.residenceCountry}
                placeholder="Select country"
                items={PLACE_OF_BIRTH_COUNTRIES.map((country) => ({ value: country.label, label: country.label }))}
                onSelect={(value) => setSearchForm((prev) => ({ ...prev, residenceCountry: value }))}
              />
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-600">Previous Schengen Visa?</label>
              <select
                value={searchForm.previousSchengenVisa ? 'yes' : 'no'}
                onChange={(event) =>
                  setSearchForm((prev) => {
                    const enabled = event.target.value === 'yes'
                    return {
                      ...prev,
                      previousSchengenVisa: enabled,
                      previousSchengenVisas: enabled ? (prev.previousSchengenVisas.length === 0 ? [{ ...EMPTY_SCHENGEN_VISA }] : prev.previousSchengenVisas) : [],
                    }
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
              <select
                value={searchForm.hasOtherResidencePermit ? 'yes' : 'no'}
                onChange={(event) => setSearchForm((prev) => ({ ...prev, hasOtherResidencePermit: event.target.value === 'yes' }))}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          {searchForm.hasOtherResidencePermit && (
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Residency Country</label>
                <SearchableChoice
                  value={searchForm.otherResidenceCountry}
                  placeholder="Select country"
                  items={PLACE_OF_BIRTH_COUNTRIES.map((country) => ({ value: country.label, label: country.label }))}
                  onSelect={(value) => setSearchForm((prev) => ({ ...prev, otherResidenceCountry: value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Permit Number</label>
                <Input value={searchForm.otherResidenceNumber} onChange={(event) => setSearchForm((prev) => ({ ...prev, otherResidenceNumber: event.target.value }))} placeholder="Permit number" dir="ltr" className="border-slate-200 bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Permit Issue Date</label>
                <Input type="date" value={searchForm.otherResidenceIssueDate} onChange={(event) => setSearchForm((prev) => ({ ...prev, otherResidenceIssueDate: event.target.value }))} className="border-slate-200 bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Permit Expiry Date</label>
                <Input type="date" value={searchForm.otherResidenceExpiryDate} onChange={(event) => setSearchForm((prev) => ({ ...prev, otherResidenceExpiryDate: event.target.value }))} className="border-slate-200 bg-white" />
              </div>
              <ResidencyDocumentRow
                documentType="residence_permit_document"
                title="Residence permit file"
                emptyHint="Upload the residence permit document."
                documents={registrationDocuments}
                uploadingDocumentType={uploadingDocumentType}
                uploadError={uploadError}
                onUpload={handleUploadDocument}
              />
            </div>
          )}

          {searchForm.previousSchengenVisa && (
            <div className="space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Previous Schengen Visas (Last 5 Years)</h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">Enter the details for each previous visa.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: [...prev.previousSchengenVisas, { ...EMPTY_SCHENGEN_VISA }] }))}
                  className="border-slate-200 bg-white"
                >
                  <Plus className="size-3.5" /> Add Visa
                </Button>
              </div>
              <div className="space-y-3">
                {searchForm.previousSchengenVisas.map((visa, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Country</label>
                      <SearchableChoice
                        value={visa.country}
                        placeholder="Select Schengen country"
                        items={SCHENGEN_COUNTRIES.map((country) => ({ value: country, label: country }))}
                        onSelect={(value) =>
                          setSearchForm((prev) => ({
                            ...prev,
                            previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, country: value } : item)),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Visa Number</label>
                      <Input
                        value={visa.visa_number}
                        onChange={(event) =>
                          setSearchForm((prev) => ({
                            ...prev,
                            previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, visa_number: event.target.value } : item)),
                          }))
                        }
                        dir="ltr"
                        className="border-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Permit Issue Date</label>
                      <Input
                        type="date"
                        value={visa.issue_date}
                        onChange={(event) =>
                          setSearchForm((prev) => ({
                            ...prev,
                            previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, issue_date: event.target.value } : item)),
                          }))
                        }
                        className="border-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Permit Expiry Date</label>
                      <Input
                        type="date"
                        value={visa.expiry_date}
                        onChange={(event) =>
                          setSearchForm((prev) => ({
                            ...prev,
                            previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => (itemIndex === index ? { ...item, expiry_date: event.target.value } : item)),
                          }))
                        }
                        className="border-slate-200"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove Schengen visa ${index + 1}`}
                      onClick={() => setSearchForm((prev) => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.filter((_, itemIndex) => itemIndex !== index) }))}
                      className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <ResidencyDocumentRow
                documentType="previous_schengen_visa_document"
                title="Previous Schengen visa file"
                emptyHint="Upload a copy of a previous Schengen visa."
                documents={registrationDocuments}
                uploadingDocumentType={uploadingDocumentType}
                uploadError={uploadError}
                onUpload={handleUploadDocument}
                className="border-t border-slate-200 pt-3"
              />
            </div>
          )}
        </div>

        {/* Application metadata */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Application Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Application ID</label>
              <Input dir="ltr" value={caseNumber} disabled className="bg-slate-50 border-slate-200 text-slate-500 font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Application Date</label>
              <Input value={applicationDate} disabled className="bg-slate-50 border-slate-200 text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Order By</label>
              {/* This used to be a hardcoded staff name. */}
              <Input value={createdByName || '—'} disabled className="bg-slate-50 border-slate-200 text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Assigned To</label>
              <select value={intake.assignedTo} onChange={(event) => intake.setAssignedTo(event.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                <option value="">Select Staff</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name || employee.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Notes (Internal Notes)</label>
            <textarea
              value={intake.appNotes}
              onChange={(event) => intake.setAppNotes(event.target.value)}
              placeholder="Client requires urgent registration..."
              className="min-h-16 w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={() => setStep(2)} className="border-slate-200 text-slate-600">
            Back to Search
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void intake.handleSaveDraftOnly()} className="border-slate-200 text-slate-600">
              Save Draft
            </Button>
            <Button onClick={() => void intake.handleSaveIntake()} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
              Continue to Visa Application
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ResidencyDocumentRow({
  documentType,
  title,
  emptyHint,
  documents,
  uploadingDocumentType,
  uploadError,
  onUpload,
  className,
}: {
  documentType: string
  title: string
  emptyHint: string
  documents: { type: string; name: string }[]
  uploadingDocumentType: string | null
  uploadError: { type: string; message: string } | null
  onUpload: (event: React.ChangeEvent<HTMLInputElement>, label: string, docType: string) => Promise<void>
  className?: string
}) {
  const uploadedDocument = documents.find((document) => document.type === documentType)
  const isUploading = uploadingDocumentType === documentType

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 sm:col-span-2 lg:col-span-4', className)}>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-700">{title}</p>
        <p className={cn('mt-0.5 truncate text-[11px]', uploadedDocument ? 'text-emerald-700' : 'text-slate-500')} title={uploadedDocument?.name}>
          {uploadedDocument ? `Saved: ${uploadedDocument.name}` : emptyHint}
        </p>
        {uploadError?.type === documentType && <p className="mt-1 text-[11px] text-red-600">{uploadError.message}</p>}
      </div>
      <label className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-[#8B0000]/25 bg-white px-3 text-xs font-semibold text-[#8B0000] hover:bg-[#8B0000]/5">
        <Upload className="size-3.5" /> {isUploading ? 'Uploading…' : uploadedDocument ? 'Replace file' : 'Add File'}
        <input type="file" accept=".pdf,image/*" className="sr-only" disabled={isUploading} onChange={(event) => void onUpload(event, title, documentType)} />
      </label>
    </div>
  )
}
