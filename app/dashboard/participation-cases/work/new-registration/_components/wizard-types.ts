export interface RegistrationEvent {
  id: string
  title: string
  title_ar: string | null
  date: string
  end_date: string | null
  country: string | null
  country_ar: string | null
  location: string
  location_ar: string | null
  sector: string | null
  status?: string | null
  organizer?: string | null
  registration_config: any
}

export interface Employee {
  id: string
  full_name: string | null
  email: string
  role: string | null
}

export interface WizardClientProps {
  events: RegistrationEvent[]
  employees: Employee[]
  initialRegistrationId?: string
  initialStep?: number
  currentUser: any
  onClose?: () => void
}

export type VisaRoute = {
  country: string
  label: string
  embassy: string
  portal: string
  submissionMethod: string
  center: string
  city: string
}

export type RegistrationDocument = {
  name: string
  path: string
  type: string
  uploadedAt?: string
}

export type PreviousSchengenVisa = {
  country: string
  visa_number: string
  issue_date: string
  expiry_date: string
}

export type VisaAppointmentReminder = {
  id: string
  remindAt: string
  note: string
  sound: boolean
  notifiedAt?: string
}

export type VisaDocumentDefinition = {
  type: string
  aliases: string[]
  label: string
  required?: boolean
}
