import type { ClientSearchForm } from './wizard-model'

/**
 * The per-application snapshot of the client's details.
 *
 * This object was previously spelled out three times inside
 * wizard-controller.tsx (draft save, intake save, autosave), which meant a
 * field added to one copy silently went missing from the others.
 */

export interface SnapshotInputs {
  searchForm: ClientSearchForm
  /** Phone normalized to E.164 by the validator. */
  phone: string
  /** Work phone normalized to E.164 by the validator. */
  workPhone: string
  /** Company specialty after resolving the "Other" free-text option. */
  companySpecialty?: string
}

export function buildResidencePermit(searchForm: ClientSearchForm) {
  const has = searchForm.hasOtherResidencePermit
  return {
    has_permit: has,
    country: has ? searchForm.otherResidenceCountry : '',
    number: has ? searchForm.otherResidenceNumber : '',
    expiry_date: has ? searchForm.otherResidenceExpiryDate : '',
    issue_date: has ? searchForm.otherResidenceIssueDate : '',
  }
}

export function buildClientSnapshot({ searchForm, phone, workPhone, companySpecialty }: SnapshotInputs) {
  return {
    full_name: searchForm.fullName || null,
    surname: searchForm.surname || null,
    salutation: searchForm.salutation || null,
    gender: searchForm.gender || null,
    marital_status: searchForm.maritalStatus || null,
    passport_number: searchForm.passportNumber || null,
    passport_issue_date: searchForm.passportIssueDate || null,
    passport_expiry_date: searchForm.passportExpiryDate || null,
    national_id: searchForm.nationalId || null,
    date_of_birth: searchForm.dateOfBirth || null,
    place_of_birth: searchForm.placeOfBirth || null,
    phone: phone || null,
    email: searchForm.email || null,
    company_name: searchForm.companyName || null,
    company_specialty: companySpecialty || searchForm.companySpecialty || null,
    job_title: searchForm.jobTitle || null,
    department: searchForm.department || null,
    work_city: searchForm.workCity || null,
    work_phone: workPhone || null,
    work_email: searchForm.workEmail || null,
    residence_country: searchForm.residenceCountry || null,
    previous_schengen_visa: searchForm.previousSchengenVisa,
    schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
    other_residence_permit: buildResidencePermit(searchForm),
    timestamp: new Date().toISOString(),
  }
}

/** The subset of snapshot fields that also belong on the reusable client row. */
export function buildClientResidencyPatch(searchForm: ClientSearchForm) {
  return {
    residence_country: searchForm.residenceCountry || null,
    previous_schengen_visa: searchForm.previousSchengenVisa,
    schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
    other_residence_permit: buildResidencePermit(searchForm),
  }
}
