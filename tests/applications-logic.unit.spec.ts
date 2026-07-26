import { expect, test } from '@playwright/test'

import {
  buildClientResidencyPatch,
  buildClientSnapshot,
} from '../app/dashboard/participation-cases/work/new-registration/wizard-snapshots'
import { formatFileSize, normalizeRegistrationDocuments } from '../app/dashboard/participation-cases/work/new-registration/wizard-helpers'
import { getApplicantSex, getEmployerName, type ApplicationRow } from '../app/dashboard/participation-cases/work/clients/application-query'
import { decryptField, encryptField, isEncrypted } from '../lib/secure-field'
import type { ClientSearchForm } from '../app/dashboard/participation-cases/work/new-registration/wizard-model'

const baseForm: ClientSearchForm = {
  fullName: 'AHMED ALI', surname: 'HASSAN', salutation: 'Mr.', gender: 'Male', maritalStatus: 'married',
  passportNumber: 'A1234567', nationalId: '123456789012', phone: '07712345678', email: 'a@b.com',
  companyName: 'Acme', companySpecialty: 'Technology & IT', dateOfBirth: '1990-01-01',
  placeOfBirthCountry: 'IQ', placeOfBirthCity: 'Baghdad', placeOfBirth: 'Iraq, Baghdad',
  passportIssueDate: '2020-01-01', passportExpiryDate: '2030-01-01', jobTitle: 'CEO',
  department: 'Board', workCity: 'Baghdad', workPhone: '07800000000', workEmail: 'w@b.com',
  residenceCountry: 'Iraq', previousSchengenVisa: false, previousSchengenVisas: [],
  hasOtherResidencePermit: false, otherResidenceCountry: '', otherResidenceNumber: '',
  otherResidenceIssueDate: '', otherResidenceExpiryDate: '',
}

const baseRow = (overrides: Partial<ApplicationRow> = {}): ApplicationRow => ({
  id: 'r1', event_id: 'e1', full_name: 'AHMED ALI', email: null, case_number: 'JAZ-1',
  case_status: null, current_step: 1, created_at: null, updated_at: null, payment_status: 'unpaid',
  documents: [], assigned_employee_id: null, additional_data: {}, client_snapshot: null,
  clients: null, assigned_employee: null, registration_events: [],
  ...overrides,
})

test.describe('client snapshot', () => {
  test('carries every field the save paths rely on', () => {
    const snapshot = buildClientSnapshot({
      searchForm: baseForm,
      phone: '+9647712345678',
      workPhone: '+9647800000000',
      companySpecialty: 'Technology & IT',
    })

    expect(snapshot.full_name).toBe('AHMED ALI')
    expect(snapshot.phone).toBe('+9647712345678')
    expect(snapshot.work_phone).toBe('+9647800000000')
    // company_specialty was missing from two of the three duplicated copies.
    expect(snapshot.company_specialty).toBe('Technology & IT')
    expect(snapshot.other_residence_permit.has_permit).toBe(false)
  })

  test('clears residence permit details when the applicant has none', () => {
    const withPermit = { ...baseForm, hasOtherResidencePermit: false, otherResidenceCountry: 'Germany', otherResidenceNumber: 'X1' }
    const patch = buildClientResidencyPatch(withPermit)
    expect(patch.other_residence_permit).toEqual({ has_permit: false, country: '', number: '', expiry_date: '', issue_date: '' })
  })

  test('keeps residence permit details when the applicant has one', () => {
    const withPermit = {
      ...baseForm,
      hasOtherResidencePermit: true,
      otherResidenceCountry: 'Germany',
      otherResidenceNumber: 'X1',
      otherResidenceIssueDate: '2024-01-01',
      otherResidenceExpiryDate: '2026-01-01',
    }
    expect(buildClientResidencyPatch(withPermit).other_residence_permit).toEqual({
      has_permit: true, country: 'Germany', number: 'X1', issue_date: '2024-01-01', expiry_date: '2026-01-01',
    })
  })
})

test.describe('document helpers', () => {
  test('normalizes documents regardless of which url key was stored', () => {
    const documents = normalizeRegistrationDocuments([
      { name: 'Passport', path: 'https://x/p.pdf', type: 'passport_copy', size: 2048 },
      { label: 'Legacy', file_url: 'https://x/l.pdf', type: 'invitation' },
      { name: 'Broken', type: 'insurance' },
      'not an object',
    ])

    expect(documents).toHaveLength(2)
    expect(documents[0]).toMatchObject({ name: 'Passport', path: 'https://x/p.pdf', size: 2048 })
    expect(documents[1]).toMatchObject({ name: 'Legacy', path: 'https://x/l.pdf' })
  })

  test('returns an empty list when documents is not an array', () => {
    expect(normalizeRegistrationDocuments({ type: 'passport' })).toEqual([])
    expect(normalizeRegistrationDocuments(null)).toEqual([])
  })

  test('formats real sizes and falls back for legacy rows', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    // Rows uploaded before size was recorded must not show a fake number.
    expect(formatFileSize(undefined)).toBe('—')
    expect(formatFileSize(0)).toBe('—')
  })
})

test.describe('applications list helpers', () => {
  test('reads the employer from the snapshot first, then the client row', () => {
    expect(getEmployerName(baseRow({ client_snapshot: { company_name: 'Snapshot Co' }, clients: { employer_name: 'Client Co', sex: null } }))).toBe('Snapshot Co')
    expect(getEmployerName(baseRow({ clients: { employer_name: 'Client Co', sex: null } }))).toBe('Client Co')
    expect(getEmployerName(baseRow({ clients: [{ employer_name: 'Array Co', sex: null }] }))).toBe('Array Co')
    expect(getEmployerName(baseRow())).toBeNull()
  })

  test('resolves applicant sex from the client row or the snapshot', () => {
    // The list previously read form_data.sex, which wizard cases never set.
    expect(getApplicantSex(baseRow({ clients: { employer_name: null, sex: 'Female' } }))).toBe('Female')
    expect(getApplicantSex(baseRow({ client_snapshot: { gender: 'Male' } }))).toBe('Male')
    expect(getApplicantSex(baseRow())).toBeNull()
  })
})

test.describe('sensitive field encryption', () => {
  test.beforeEach(() => {
    process.env.FIELD_ENCRYPTION_KEY = 'test-key-for-unit-tests'
  })

  test('round-trips a password without storing it in the clear', () => {
    const ciphertext = encryptField('s3cr3t-portal-pw')
    expect(ciphertext).toBeTruthy()
    expect(ciphertext).not.toContain('s3cr3t-portal-pw')
    expect(isEncrypted(ciphertext!)).toBe(true)
    expect(decryptField(ciphertext!)).toBe('s3cr3t-portal-pw')
  })

  test('produces a different ciphertext each time', () => {
    expect(encryptField('same')).not.toBe(encryptField('same'))
  })

  test('passes through legacy plaintext values unchanged', () => {
    expect(decryptField('legacy-plaintext')).toBe('legacy-plaintext')
    expect(decryptField(null)).toBe('')
  })

  test('returns empty string for tampered ciphertext', () => {
    const ciphertext = encryptField('secret')!
    expect(decryptField(`${ciphertext}tampered`)).toBe('')
  })
})
