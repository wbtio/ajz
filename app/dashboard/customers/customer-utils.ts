import type { CustomerRegistration } from './customer-types'

export const APPLICATION_STEPS = 7
export const REQUIRED_DOCUMENTS = ['passport_copy', 'visa_application_form', 'invitation', 'appointment_confirmation', 'insurance']

export function getInitials(value: string | null | undefined) {
  return (value || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
}

export function latestRegistration(registrations: CustomerRegistration[] = []) {
  return [...registrations].sort((a, b) => Date.parse(b.updated_at || b.created_at || '') - Date.parse(a.updated_at || a.created_at || ''))[0]
}

export function getProgress(registration?: CustomerRegistration | null) {
  return Math.max(0, Math.min(100, Math.round((Number(registration?.current_step || 0) / APPLICATION_STEPS) * 100)))
}

export function getMissingDocuments(registration?: CustomerRegistration | null) {
  const documents = Array.isArray(registration?.documents) ? registration.documents as Array<{ type?: string }> : []
  return REQUIRED_DOCUMENTS.filter((type) => !documents.some((document) => document.type === type)).length
}

export function getCustomerStatus(registration?: CustomerRegistration | null) {
  if (!registration) return 'No application'
  if (registration.case_status === 'completed' || registration.status === 'completed') return 'Completed'
  if (registration.payment_status === 'pending') return 'Payment pending'
  if (getMissingDocuments(registration)) return 'Missing documents'
  return 'In progress'
}
