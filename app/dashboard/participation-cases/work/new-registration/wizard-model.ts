/**
 * Typed view model for the registration wizard.
 *
 * The wizard used to hand its step components one untyped object with roughly
 * two hundred keys, and every step file opted out of type checking with
 * `@ts-nocheck`. That combination let steps destructure names the controller
 * never provided (`fees`, `applyChangeableUpdates`, `showUpdatePrompt`) and hid
 * a real bug where `visaEmbassy` was never passed down at all.
 *
 * The model is now split into slices, one per stage. The controller builds an
 * object of this exact shape, so a missing or misspelled key is a compile
 * error on both sides.
 *
 * UI primitives, icons, constants and helpers are NOT part of this model —
 * step files import those directly.
 */

import type { Dispatch, SetStateAction } from 'react'
import type { CountryCode } from 'libphonenumber-js'
import type {
  Employee,
  PreviousSchengenVisa,
  RegistrationDocument,
  RegistrationEvent,
  VisaAppointmentReminder,
  VisaDocumentDefinition,
} from './wizard-types'

/* eslint-disable @typescript-eslint/no-explicit-any */

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error'
export type StepStatus = 'complete' | 'warning'

export interface ClientSearchForm {
  fullName: string
  surname: string
  salutation: string
  gender: string
  maritalStatus: string
  passportNumber: string
  nationalId: string
  phone: string
  email: string
  companyName: string
  companySpecialty: string
  dateOfBirth: string
  placeOfBirthCountry: string
  placeOfBirthCity: string
  placeOfBirth: string
  passportIssueDate: string
  passportExpiryDate: string
  jobTitle: string
  department: string
  workCity: string
  workPhone: string
  workEmail: string
  residenceCountry: string
  previousSchengenVisa: boolean
  previousSchengenVisas: PreviousSchengenVisa[]
  hasOtherResidencePermit: boolean
  otherResidenceCountry: string
  otherResidenceNumber: string
  otherResidenceIssueDate: string
  otherResidenceExpiryDate: string
}

export interface FieldValidation {
  normalized: string
  error: string
}

export interface InviterConfig {
  host_org: string
  host_address: string
  host_contact_name: string
  host_contact_phone: string
  host_contact_email: string
  host_contact_position: string
}

export interface PricingItem {
  label: string
  price: number
}

/* ------------------------------------------------------------------ */
/*  Slices                                                            */
/* ------------------------------------------------------------------ */

export interface WizardShellSlice {
  step: number
  setStep: (step: number) => void
  registrationId: string | undefined
  registration: any
  client: any
  caseNumber: string
  currentUser: any
  employees: Employee[]
  assignedEmployee: Employee | undefined
  isPending: boolean
  onClose?: () => void
  breadcrumbLabel: string
  stepStatus: Record<number, StepStatus>
  summaryStatus: string
  summaryAppointment: string
  latestActivity: { performed_by_name?: string | null; created_at?: string | null } | null
  missingSummaryDocuments: number
  validateStepBeforeAdvance: (targetStep: number) => boolean
  reloadRegistration: () => Promise<void>
}

export interface WizardEventSlice {
  events: RegistrationEvent[]
  selectedEvent: RegistrationEvent | undefined
  selectedEventId: string
  setSelectedEventId: (id: string) => void
  participationType: string
  setParticipationType: (value: string) => void
  travelPurpose: string
  setTravelPurpose: (value: string) => void
  inviterConfig: InviterConfig
  handleSaveEventDetails: (advance?: boolean) => Promise<boolean>
  handleSaveEventDraft: () => Promise<boolean>
}

export interface WizardIntakeSlice {
  searchForm: ClientSearchForm
  setSearchForm: Dispatch<SetStateAction<ClientSearchForm>>
  fullNameIsValid: boolean
  surnameIsValid: boolean
  passportNumberIsValid: boolean
  nationalIdIsValid: boolean
  phoneValidation: FieldValidation
  workPhoneValidation: FieldValidation
  emailValidation: FieldValidation
  phoneCountry: CountryCode
  setPhoneCountry: (country: CountryCode) => void
  workPhoneCountry: CountryCode
  setWorkPhoneCountry: (country: CountryCode) => void
  companySpecialtyOther: string
  setCompanySpecialtyOther: (value: string) => void
  jobTitleIsOther: boolean
  setJobTitleIsOther: (value: boolean) => void
  jobTitleOther: string
  setJobTitleOther: (value: string) => void
  workCityIsOther: boolean
  setWorkCityIsOther: (value: boolean) => void
  workCityOther: string
  setWorkCityOther: (value: string) => void

  searchResults: any[]
  setSearchResults: Dispatch<SetStateAction<any[]>>
  hasSearched: boolean
  setHasSearched: (value: boolean) => void
  selectedPotentialMatch: any
  setSelectedPotentialMatch: (match: any) => void
  handleSearch: () => void
  handleContinueWithClient: (match: any, updateProfile: boolean) => void
  handleCreateNewClient: () => void
  populateCompanyInformationFromClient: (client: any) => void

  assignedTo: string
  setAssignedTo: (value: string) => void
  appNotes: string
  setAppNotes: (value: string) => void
  handleSaveIntake: () => Promise<void>
  handleSaveDraftOnly: () => Promise<void>
  clientSaveState: SaveState

  showDocumentImport: boolean
  setShowDocumentImport: (value: boolean) => void
  documentImportType: 'passport' | 'national-id'
  setDocumentImportType: (value: 'passport' | 'national-id') => void
  documentImportFile: File | null
  setDocumentImportFile: (file: File | null) => void
  documentImportText: string
  setDocumentImportText: (value: string) => void
  isImportingDocument: boolean
  processImportedDocument: () => Promise<void>
  ocrHighlightedFields: string[]
  setOcrHighlightedFields: (fields: string[]) => void
}

export interface WizardVisaSlice {
  visaDestination: string
  setVisaDestination: (value: string) => void
  visaEmbassy: string
  setVisaEmbassy: (value: string) => void
  visaEmbassyCity: string
  setVisaEmbassyCity: (value: string) => void
  visaType: string
  setVisaType: (value: string) => void
  visaPlatform: string
  setVisaPlatform: (value: string) => void
  visaSubmissionMethod: string
  setVisaSubmissionMethod: (value: string) => void
  visaPortalEmail: string
  setVisaPortalEmail: (value: string) => void
  visaPortalPassword: string
  handleVisaPasswordChange: (value: string) => void
  visaPasswordIsStored: boolean
  isRevealingPassword: boolean
  handleRevealVisaPassword: () => Promise<void>
  showPassword: boolean
  setShowPassword: Dispatch<SetStateAction<boolean>>
  visaAccountStatus: string
  setVisaAccountStatus: (value: string) => void
  visaAppRefNumber: string
  setVisaAppRefNumber: (value: string) => void
  visaPortalAppStatus: string
  setVisaPortalAppStatus: (value: string) => void
  visaAppointmentCenter: string
  setVisaAppointmentCenter: (value: string) => void
  visaAppointmentCity: string
  setVisaAppointmentCity: (value: string) => void
  visaAppointmentDate: string
  setVisaAppointmentDate: (value: string) => void
  visaAppointmentTime: string
  setVisaAppointmentTime: (value: string) => void
  visaAppointmentRefNumber: string
  setVisaAppointmentRefNumber: (value: string) => void
  visaAppointmentStatus: string
  setVisaAppointmentStatus: (value: string) => void
  visaReminders: VisaAppointmentReminder[]
  setVisaReminders: Dispatch<SetStateAction<VisaAppointmentReminder[]>>
  newReminderAt: string
  setNewReminderAt: (value: string) => void
  newReminderNote: string
  setNewReminderNote: (value: string) => void
  addVisaReminder: () => void
  visaSaveState: SaveState
  handleVisaDestinationChange: (country: string) => void
  handleSaveVisaDetails: (advance?: boolean, options?: { silent?: boolean }) => Promise<boolean>
}

export interface WizardDocumentsSlice {
  registrationDocuments: RegistrationDocument[]
  mergeableDocuments: RegistrationDocument[]
  packageDocument: RegistrationDocument | undefined
  packageDocumentPaths: string[]
  setPackageDocumentPaths: Dispatch<SetStateAction<string[]>>
  packageName: string
  setPackageName: (value: string) => void
  includeClientInfoInPackage: boolean
  setIncludeClientInfoInPackage: (value: boolean) => void
  isPackageGenerating: boolean
  handleMergeFiles: () => Promise<void>
  handleUploadDocument: (event: React.ChangeEvent<HTMLInputElement>, label: string, docType: string) => Promise<void>
  handleDeleteDocument: (document: RegistrationDocument) => Promise<void>
  uploadingDocumentType: string | null
  deletingDocumentPath: string | null
  uploadError: { type: string; message: string } | null
  requiredVisaDocuments: VisaDocumentDefinition[]
  findDocument: (definition: VisaDocumentDefinition) => RegistrationDocument | undefined
  handleAdvanceToPayment: () => Promise<void>
}

export interface WizardPaymentSlice {
  paymentCategory: string
  setPaymentCategory: (value: string) => void
  paymentMethod: string
  setPaymentMethod: (value: string) => void
  paymentDate: string
  setPaymentDate: (value: string) => void
  paymentNotes: string
  setPaymentNotes: (value: string) => void
  currency: string
  setCurrency: (value: string) => void
  currencySymbol: string
  pricingItems: PricingItem[]
  discount: number
  setDiscount: (value: number) => void
  totalAmount: number
  amountPaid: number
  setAmountPaid: (value: number) => void
  balanceDue: number
  canEditFeeBreakdown: boolean
  receiptId: string
  storedReceipt: RegistrationDocument | undefined
  clientReceiptUrl: string
  receiptArchivedAt: string
  handleGenerateReceipt: () => Promise<void>
  handleDownloadReceipt: () => Promise<void>
  handlePrintReceipt: () => Promise<void>
  handleArchiveReceipt: () => Promise<void>
  handleSavePaymentDraft: (options?: { silent?: boolean }) => Promise<boolean>
  handleAdvanceToDelivery: () => Promise<void>
}

export interface WizardDeliverySlice {
  deliveryDocumentPaths: string[]
  setDeliveryDocumentPaths: Dispatch<SetStateAction<string[]>>
  deliveryMessage: string
  setDeliveryMessage: (value: string) => void
  deliveryStatus: string
  deliverySaveState: 'idle' | 'saving'
  handleSaveDelivery: (markAsSent: boolean) => Promise<boolean>
  openWhatsApp: () => void
  openDeliveryEmail: () => void
}

export interface WizardModel {
  shell: WizardShellSlice
  event: WizardEventSlice
  intake: WizardIntakeSlice
  visa: WizardVisaSlice
  documents: WizardDocumentsSlice
  payment: WizardPaymentSlice
  delivery: WizardDeliverySlice
}
