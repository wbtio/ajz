'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { AlertTriangle, Clock, Eye, Plus, RefreshCw, Search, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { EmailField, PhoneNumberField } from './wizard-fields'
import { SearchableChoice } from './searchable-choice'
import { IRAQI_GOVERNORATES, PLACE_OF_BIRTH_CITIES, PLACE_OF_BIRTH_COUNTRIES } from './wizard-constants'
import type { ClientSearchForm } from './wizard-model'
import { useWizardIntake, useWizardShell } from './wizard-view-context'

const EMPTY_SEARCH_FORM: ClientSearchForm = {
  fullName: '', surname: '', salutation: '', gender: '', maritalStatus: '',
  passportNumber: '', nationalId: '', phone: '', email: '', companyName: '',
  companySpecialty: '', dateOfBirth: '', placeOfBirthCountry: '', placeOfBirthCity: '',
  placeOfBirth: '', passportIssueDate: '', passportExpiryDate: '', jobTitle: '',
  department: '', workCity: '', workPhone: '', workEmail: '', residenceCountry: 'Iraq',
  previousSchengenVisa: false, previousSchengenVisas: [], hasOtherResidencePermit: false,
  otherResidenceCountry: '', otherResidenceNumber: '', otherResidenceIssueDate: '', otherResidenceExpiryDate: '',
}

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

const SAVE_STATE_LABEL: Record<string, string> = {
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  error: 'Save failed',
}

export function ClientSearchStep() {
  const [profileClient, setProfileClient] = useState<any>(null)
  const { step, setStep, isPending } = useWizardShell()
  const intake = useWizardIntake()

  const ocrFieldClass = (field: string) => (intake.ocrHighlightedFields.includes(field) ? 'ocr-field-highlight' : '')
  const markOcrFieldReviewed = (field: string) => intake.setOcrHighlightedFields(intake.ocrHighlightedFields.filter((item) => item !== field))

  if (step !== 2) return null

  const { searchForm, setSearchForm } = intake

  return (
    <div className="w-full animate-in fade-in duration-300">
      <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
        <style>{`.ocr-field-highlight input,.ocr-field-highlight button[role="combobox"]{border-color:#8B0000 !important;box-shadow:0 0 0 1px rgba(139,0,0,.12)}`}</style>

        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Search className="size-4 text-[#8B0000]" />
          <h2 className="text-base font-bold text-slate-800">Search for existing client</h2>
          {intake.clientSaveState !== 'saved' && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
              {intake.clientSaveState === 'saving' && <span className="animate-spin size-3 rounded-full border-2 border-current border-t-transparent" />}
              {SAVE_STATE_LABEL[intake.clientSaveState]}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('gap-1.5 border-[#8B0000]/30 text-[#8B0000] hover:bg-red-50', intake.clientSaveState === 'saved' && 'ml-auto')}
            onClick={() => intake.setShowDocumentImport(true)}
          >
            <Upload className="size-3.5" /> Import document
          </Button>
        </div>

        {intake.showDocumentImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-labelledby="document-import-title">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="document-import-title" className="text-lg font-bold text-slate-900">Import client document</h3>
                  <p className="mt-1 text-xs text-slate-500">Choose the document you want to use for client data.</p>
                </div>
                <button type="button" onClick={() => intake.setShowDocumentImport(false)} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close import dialog">
                  ×
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => intake.setDocumentImportType('passport')}
                  className={cn('rounded-md border px-3 py-2 text-sm font-semibold transition', intake.documentImportType === 'passport' ? 'border-[#8B0000] bg-red-50 text-[#8B0000]' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
                >
                  Passport
                </button>
                <button
                  type="button"
                  onClick={() => intake.setDocumentImportType('national-id')}
                  className={cn('rounded-md border px-3 py-2 text-sm font-semibold transition', intake.documentImportType === 'national-id' ? 'border-[#8B0000] bg-red-50 text-[#8B0000]' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
                >
                  National ID
                </button>
              </div>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-[#8B0000] hover:bg-red-50/30">
                <Upload className="mb-2 size-6 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Drop a file here or choose a file</span>
                <span className="mt-1 text-xs text-slate-500">PDF, JPG, PNG</span>
                <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(event) => intake.setDocumentImportFile(event.target.files?.[0] || null)} />
              </label>
              {intake.documentImportFile && <p className="mt-2 text-xs text-emerald-700">Selected: {intake.documentImportFile.name}</p>}
              <div className="mt-4 space-y-2">
                <label htmlFor="document-import-paste" className="text-xs font-semibold text-slate-600">Or paste document text</label>
                <textarea
                  id="document-import-paste"
                  value={intake.documentImportText}
                  onChange={(event) => intake.setDocumentImportText(event.target.value)}
                  rows={3}
                  placeholder={intake.documentImportType === 'passport' ? 'Paste passport text or MRZ here' : 'Paste the National ID text here'}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#8B0000]"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => intake.setShowDocumentImport(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void intake.processImportedDocument()} disabled={intake.isImportingDocument}>
                  {intake.isImportingDocument ? 'Processing…' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-3 gap-y-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-12 xl:grid-cols-[70px_minmax(195px,2fr)_minmax(105px,1fr)_68px_minmax(110px,1.05fr)_minmax(125px,1.2fr)_minmax(100px,.9fr)_minmax(100px,.9fr)] xl:gap-x-2">
          <div className="flex flex-col gap-1.5 lg:order-1 lg:col-span-1 lg:w-[70px]">
            <label className="text-xs font-bold text-slate-600">Title</label>
            <Select value={searchForm.salutation} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, salutation: value }))}>
              <SelectTrigger aria-label="Title or salutation"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Other'].map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div onClick={() => markOcrFieldReviewed('fullName')} className={cn('flex flex-col gap-1.5 lg:order-2 lg:col-span-3 xl:col-span-1', ocrFieldClass('fullName'))}>
            <label className="text-xs font-bold text-slate-600">Full Name</label>
            <Input
              dir="ltr"
              value={searchForm.fullName}
              onChange={(event) => {
                const normalizedValue = event.target.value.toUpperCase().replace(/[^A-Z\s'.-]/g, '').replace(/\s{2,}/g, ' ')
                setSearchForm((prev) => ({ ...prev, fullName: normalizedValue }))
              }}
              placeholder="Enter full name"
              aria-invalid={!intake.fullNameIsValid}
              maxLength={100}
              title="Use letters only. Spaces, apostrophes, dots, and hyphens are allowed."
              className={cn('border-slate-200', !intake.fullNameIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
            />
          </div>

          <div onClick={() => markOcrFieldReviewed('surname')} className={cn('flex flex-col gap-1.5 lg:order-3 lg:col-span-2 xl:col-span-1', ocrFieldClass('surname'))}>
            <label className="text-xs font-bold text-slate-600">Surname</label>
            <Input
              dir="ltr"
              value={searchForm.surname}
              onChange={(event) => {
                const normalizedValue = event.target.value.toUpperCase().replace(/[^A-Z\s'.-]/g, '').replace(/\s{2,}/g, ' ')
                setSearchForm((prev) => ({ ...prev, surname: normalizedValue }))
              }}
              placeholder="Enter surname"
              aria-invalid={!intake.surnameIsValid}
              maxLength={60}
              title="Use letters only."
              className={cn('max-w-[15ch] border-slate-200', !intake.surnameIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
            />
          </div>

          <div onClick={() => markOcrFieldReviewed('gender')} className={cn('flex flex-col gap-1.5 lg:order-4 lg:col-span-1 lg:w-[68px]', ocrFieldClass('gender'))}>
            <label className="text-xs font-bold text-slate-600">Gender</label>
            <Select value={searchForm.gender} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, gender: value }))}>
              <SelectTrigger aria-label="Gender"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">M</SelectItem>
                <SelectItem value="Female">F</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div onClick={() => markOcrFieldReviewed('passportNumber')} className={cn('space-y-1.5 lg:order-5 lg:col-span-2 xl:col-span-1', ocrFieldClass('passportNumber'))}>
            <label className="text-xs font-bold text-slate-600">Passport Number</label>
            <Input
              dir="ltr"
              value={searchForm.passportNumber}
              onChange={(event) => {
                const rawValue = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                const normalizedValue = rawValue ? `${rawValue[0].replace(/[^A-Z]/g, '')}${rawValue.slice(1).replace(/[^0-9]/g, '')}`.slice(0, 9) : ''
                setSearchForm((prev) => ({ ...prev, passportNumber: normalizedValue }))
              }}
              placeholder="e.g. A12345678"
              aria-invalid={!intake.passportNumberIsValid}
              maxLength={9}
              title="Use 1 English letter followed by 7 or 8 digits"
              className={cn('border-slate-200 font-mono', !intake.passportNumberIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
            />
          </div>

          <div className="space-y-1.5 lg:order-13 lg:col-span-7 xl:col-span-4">
            <label className="text-xs font-bold text-slate-600">Company Name</label>
            <Input value={searchForm.companyName} onChange={(event) => setSearchForm((prev) => ({ ...prev, companyName: event.target.value }))} placeholder="Enter company name" className="border-slate-200" />
          </div>

          <div className="space-y-1.5 lg:order-13 lg:col-span-5 xl:col-span-4">
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
                  className="shrink-0 border-slate-200 px-3 text-xs text-slate-600"
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

          <div onClick={() => markOcrFieldReviewed('dateOfBirth')} className={cn('space-y-1.5 lg:order-6 lg:col-span-2 lg:w-[174px] xl:col-span-1 xl:w-auto', ocrFieldClass('dateOfBirth'))}>
            <label className="text-xs font-bold text-slate-600">Date of Birth</label>
            <Input type="date" value={searchForm.dateOfBirth} onChange={(event) => { const value = event.currentTarget.value; setSearchForm((prev) => ({ ...prev, dateOfBirth: value })) }} className="border-slate-200" />
          </div>

          <div onClick={() => markOcrFieldReviewed('placeOfBirthCountry')} className={cn('w-full max-w-[20ch] space-y-1.5 lg:order-7 lg:col-span-2 lg:max-w-[147px] xl:col-span-1 xl:max-w-none', ocrFieldClass('placeOfBirthCountry'))}>
            <label className="text-xs font-bold text-slate-600">Place of Birth Country</label>
            <SearchableChoice
              value={searchForm.placeOfBirthCountry}
              placeholder="Select country"
              items={PLACE_OF_BIRTH_COUNTRIES.map((country) => ({ value: country.code, label: country.label }))}
              onSelect={(value) =>
                setSearchForm((prev) => ({
                  ...prev,
                  placeOfBirthCountry: value,
                  placeOfBirthCity: '',
                  placeOfBirth: PLACE_OF_BIRTH_COUNTRIES.find((country) => country.code === value)?.label || value,
                }))
              }
            />
          </div>

          <div onClick={() => markOcrFieldReviewed('placeOfBirthCity')} className={cn('w-full max-w-[19ch] space-y-1.5 lg:order-8 lg:col-span-2 lg:max-w-[148px] xl:col-span-1 xl:max-w-none', ocrFieldClass('placeOfBirthCity'))}>
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
                  placeOfBirth: prev.placeOfBirthCountry
                    ? `${PLACE_OF_BIRTH_COUNTRIES.find((country) => country.code === prev.placeOfBirthCountry)?.label || prev.placeOfBirthCountry}, ${value}`
                    : value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 lg:order-9 lg:col-span-12 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-[155px_155px_155px_125px_minmax(344px,1fr)_238px] 2xl:gap-x-2 2xl:gap-y-0">
            <div onClick={() => markOcrFieldReviewed('passportIssueDate')} className={cn('space-y-1.5', ocrFieldClass('passportIssueDate'))}>
              <label className="text-xs font-bold text-slate-600">Passport Issue Date</label>
              <Input type="date" value={searchForm.passportIssueDate} onChange={(event) => { const value = event.currentTarget.value; setSearchForm((prev) => ({ ...prev, passportIssueDate: value })) }} className="border-slate-200" />
            </div>
            <div onClick={() => markOcrFieldReviewed('passportExpiryDate')} className={cn('space-y-1.5', ocrFieldClass('passportExpiryDate'))}>
              <label className="text-xs font-bold text-slate-600">Passport Expiry Date</label>
              <Input type="date" value={searchForm.passportExpiryDate} onChange={(event) => { const value = event.currentTarget.value; setSearchForm((prev) => ({ ...prev, passportExpiryDate: value })) }} className="border-slate-200" />
            </div>
            <div onClick={() => markOcrFieldReviewed('nationalId')} className={cn('space-y-1.5', ocrFieldClass('nationalId'))}>
              <label className="text-xs font-bold text-slate-600">National ID</label>
              <Input
                dir="ltr"
                value={searchForm.nationalId}
                onChange={(event) => {
                  const normalizedValue = event.target.value.replace(/\D/g, '').slice(0, 12)
                  setSearchForm((prev) => ({ ...prev, nationalId: normalizedValue }))
                }}
                placeholder="Enter 12-digit national ID"
                aria-invalid={!intake.nationalIdIsValid}
                inputMode="numeric"
                maxLength={12}
                title="Enter exactly 12 digits"
                className={cn('border-slate-200 font-mono', !intake.nationalIdIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
              />
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
              <EmailField value={searchForm.email} error={intake.emailValidation.error} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, email: value }))} placeholder="ahmed.ali@example.com" />
            </div>
            <div className="space-y-1.5 min-w-0 2xl:relative 2xl:-translate-x-[161px]">
              <label className="text-xs font-bold text-slate-600">Phone Number</label>
              <PhoneNumberField value={searchForm.phone} country={intake.phoneCountry} error={intake.phoneValidation.error} onCountryChange={intake.setPhoneCountry} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, phone: value }))} />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-3">
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
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Work Phone</label>
              <PhoneNumberField value={searchForm.workPhone} country={intake.workPhoneCountry} error={intake.workPhoneValidation.error} onCountryChange={intake.setWorkPhoneCountry} onValueChange={(value) => setSearchForm((prev) => ({ ...prev, workPhone: value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Work Email</label>
              <Input value={searchForm.workEmail} onChange={(event) => setSearchForm((prev) => ({ ...prev, workEmail: event.target.value }))} dir="ltr" inputMode="email" className="border-slate-200" />
            </div>
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
                setSearchForm(EMPTY_SEARCH_FORM)
                intake.setSearchResults([])
                intake.setHasSearched(false)
                intake.setSelectedPotentialMatch(null)
                intake.setCompanySpecialtyOther('')
              }}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Clear
            </Button>
            <Button onClick={intake.handleSearch} disabled={isPending} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm flex items-center justify-center gap-1.5">
              {isPending ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Search results */}
      {intake.hasSearched && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-slate-800">
              Search Results
              <span className="ml-2 text-xs font-semibold text-slate-400">({intake.searchResults.length} match(es) found)</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={intake.handleSearch} className="text-xs text-slate-500 gap-1">
              <RefreshCw className="size-3" /> Refresh
            </Button>
          </div>

          {intake.searchResults.length === 0 ? (
            <Card className="border-slate-200 border-dashed p-10 text-center">
              <AlertTriangle className="mx-auto mb-2 size-10 text-amber-500" />
              <h4 className="font-bold text-slate-700">No matching client found?</h4>
              <p className="mt-1 mb-4 text-xs text-slate-500">You can create a new client profile and proceed with registration.</p>
              <Button onClick={intake.handleCreateNewClient} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5 shadow-sm">
                <Plus className="size-4" /> Create New Client
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {intake.searchResults.map((match) => {
                const candidate = match.client
                const isSelected = intake.selectedPotentialMatch?.client.id === candidate.id
                const passportDiffers = Boolean(searchForm.passportNumber && candidate.passport_number && searchForm.passportNumber.trim() !== candidate.passport_number.trim())
                const nationalIdMatches = Boolean(searchForm.nationalId && candidate.national_id && searchForm.nationalId.trim() === candidate.national_id.trim())
                const dobMatches = Boolean(searchForm.dateOfBirth && candidate.date_of_birth && searchForm.dateOfBirth === candidate.date_of_birth)
                const companyMatches = Boolean(searchForm.companyName && candidate.employer_name && searchForm.companyName.trim().toLowerCase() === candidate.employer_name.trim().toLowerCase())
                // Phone and marital status used to be hardcoded to "Match".
                const phoneDigits = searchForm.phone.replace(/\D/g, '')
                const phoneMatches = Boolean(phoneDigits && candidate.phone && String(candidate.phone).replace(/\D/g, '').endsWith(phoneDigits.slice(-8)))
                const maritalMatches = Boolean(searchForm.maritalStatus && candidate.marital_status && searchForm.maritalStatus.toLowerCase() === String(candidate.marital_status).toLowerCase())
                const matchTypeLabel = match.matchType === 'Exact Match' ? 'Exact Match' : match.matchType === 'Strong Match' ? 'Strong Match' : 'Potential Match'

                return (
                  <Card
                    key={candidate.id}
                    className={cn('border transition-all duration-300 cursor-pointer', isSelected ? 'border-[#8B0000] ring-2 ring-[#8B0000]/10 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm')}
                    onClick={() => intake.setSelectedPotentialMatch(match)}
                  >
                    <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">{candidate.full_name_as_passport}</h4>
                        <Badge className={match.matchType === 'Exact Match' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : match.matchType === 'Strong Match' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {matchTypeLabel} — {match.score}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-7 gap-3 text-xs md:text-center">
                        <MatchCell label="Passport" state={passportDiffers ? 'different' : 'match'} />
                        <MatchCell label="National ID" state={nationalIdMatches ? 'match' : 'unknown'} />
                        <MatchCell label="Date of Birth" state={dobMatches ? 'match' : 'unknown'} />
                        <MatchCell label="Company" state={companyMatches ? 'match' : 'unknown'} />
                        <MatchCell label="Phone" state={phoneMatches ? 'match' : 'unknown'} />
                        <MatchCell label="Marital Status" state={maritalMatches ? 'match' : 'unknown'} />
                        <div>
                          <span className="text-slate-400 block font-medium">Registered event</span>
                          <div className="mt-1 flex flex-wrap gap-1 justify-center">
                            {Array.isArray(candidate.registrations) && candidate.registrations.length > 0 ? (
                              <>
                                {candidate.registrations.slice(0, 1).map((registration: any) => (
                                  <span
                                    key={registration.id}
                                    className="inline-block max-w-[120px] truncate rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800"
                                    title={registration.events?.title_ar || registration.events?.title || 'Event'}
                                  >
                                    {registration.events?.title_ar || registration.events?.title || 'Event'}
                                  </span>
                                ))}
                                {candidate.registrations.length > 1 && <span className="text-[10px] text-slate-500">+{candidate.registrations.length - 1} more</span>}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400">None</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            setProfileClient(candidate)
                          }}
                          className="border-slate-200 text-slate-600 gap-1 text-xs"
                        >
                          <Eye className="size-3.5" /> View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {profileClient && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="client-profile-title"
              onMouseDown={(event) => event.target === event.currentTarget && setProfileClient(null)}
            >
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 id="client-profile-title" className="text-lg font-bold text-slate-900">Client profile</h3>
                    <p className="mt-1 text-xs text-slate-500">Review the client information and previous event registrations.</p>
                  </div>
                  <button type="button" onClick={() => setProfileClient(null)} className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close client profile">×</button>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  {[
                    ['Full name', profileClient.full_name_as_passport],
                    ['Title', profileClient.title_salutation],
                    ['Passport number', profileClient.passport_number],
                    ['Date of birth', profileClient.date_of_birth],
                    ['National ID', profileClient.national_id],
                    ['Phone', profileClient.phone],
                    ['Email', profileClient.email],
                    ['Company', profileClient.employer_name],
                    ['Job title', profileClient.job_title],
                    ['Work city', profileClient.work_city || profileClient.work_governorate],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
                      <div className="text-[11px] font-semibold text-slate-400">{label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 px-5 py-4">
                  <h4 className="text-sm font-bold text-slate-800">Previous event registrations</h4>
                  {Array.isArray(profileClient.registrations) && profileClient.registrations.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {profileClient.registrations.map((registration: any) => {
                        const event = registration.events
                        return (
                          <div key={registration.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2">
                            <div>
                              <div className="text-sm font-semibold text-sky-900">{event?.title_ar || event?.title || 'Event'}</div>
                              <div className="text-xs text-sky-700">
                                {event?.location || event?.location_ar || 'Location not specified'}
                                {event?.date ? ` • ${new Date(event.date).toLocaleDateString('en-GB')}` : ''}
                              </div>
                            </div>
                            {registration.case_number && <span dir="ltr" className="font-mono text-xs font-semibold text-sky-700">{registration.case_number}</span>}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">No previous event registrations found.</p>
                  )}
                </div>
                <div className="flex justify-end border-t border-slate-100 px-5 py-3">
                  <Button type="button" variant="outline" onClick={() => setProfileClient(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}

          {intake.selectedPotentialMatch && (
            <Card className="mt-3 border-slate-200/80 bg-slate-50/40 p-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Button onClick={() => intake.handleContinueWithClient(intake.selectedPotentialMatch, true)} className="h-9 bg-[#8B0000] text-xs font-bold text-white hover:bg-[#6B0000]">
                  New Application
                </Button>
                <Button onClick={intake.handleCreateNewClient} variant="outline" className="h-9 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
                  New Client
                </Button>
                <Button onClick={() => intake.handleContinueWithClient(intake.selectedPotentialMatch, false)} variant="outline" className="h-9 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
                  Continue with Application (Existing)
                </Button>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-center gap-1 pt-4 text-center text-xs text-slate-400">
            <Clock className="size-3.5" />
            <span>Matching is based on Name, Date of Birth, Place of Birth, National ID, and Company Name.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCell({ label, state }: { label: string; state: 'match' | 'different' | 'unknown' }) {
  const styles = {
    match: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    different: 'border-amber-200 text-amber-700 bg-amber-50',
    unknown: 'border-slate-200 text-slate-400 bg-slate-50',
  } as const
  const text = { match: 'Match', different: 'Different', unknown: '—' } as const
  return (
    <div>
      <span className="text-slate-400 block font-medium">{label}</span>
      <div className="mt-1">
        <Badge variant="outline" className={styles[state]}>{text[state]}</Badge>
      </div>
    </div>
  )
}
