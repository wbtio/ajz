import type { Json } from './database.types'
import type { FormField } from './types'

const FORM_FIELD_TYPES: FormField['type'][] = ['text', 'number', 'email', 'date', 'select', 'textarea']
const FORM_FIELD_WIDTHS: NonNullable<FormField['width']>[] = ['full', 'half']

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalString(value: unknown): value is string | undefined {
  return typeof value === 'undefined' || typeof value === 'string'
}

function isOptionalStringArray(value: unknown): value is string[] | undefined {
  return typeof value === 'undefined' || (Array.isArray(value) && value.every((item) => typeof item === 'string'))
}

export function isFormField(value: unknown): value is FormField {
  if (!isJsonObject(value)) {
    return false
  }

  const width = value.width

  return (
    typeof value.id === 'string' &&
    typeof value.label_en === 'string' &&
    typeof value.label_ar === 'string' &&
    typeof value.type === 'string' &&
    FORM_FIELD_TYPES.includes(value.type as FormField['type']) &&
    typeof value.required === 'boolean' &&
    isOptionalStringArray(value.options) &&
    isOptionalStringArray(value.options_ar) &&
    isOptionalString(value.defaultValue) &&
    isOptionalString(value.description_en) &&
    isOptionalString(value.description_ar) &&
    isOptionalString(value.placeholder_en) &&
    isOptionalString(value.placeholder_ar) &&
    (typeof width === 'undefined' || (typeof width === 'string' && FORM_FIELD_WIDTHS.includes(width as NonNullable<FormField['width']>)))
  )
}

export function parseFormFields(value: Json | null | undefined): FormField[] {
  if (!Array.isArray(value)) {
    return []
  }

  const fields: FormField[] = []

  for (const item of value) {
    if (isFormField(item)) {
      fields.push(item)
    }
  }

  return fields
}

export function getRegistrationFieldsFromConferenceConfig(value: Json | null | undefined): FormField[] {
  if (!isJsonObject(value)) {
    return []
  }

  const registration = value.registration

  if (!isJsonObject(registration)) {
    return []
  }

  return parseFormFields(registration.form_fields)
}
