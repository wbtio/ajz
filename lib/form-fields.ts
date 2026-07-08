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
    return DEFAULT_FORM_FIELDS
  }

  // جرّب قسم registration أولاً
  const registration = value.registration
  if (isJsonObject(registration)) {
    const fields = parseFormFields(registration.form_fields)
    if (fields.length > 0) return fields
  }

  // لو ما في قسم registration، جرّب أي قسم فيه form_fields
  for (const sectionVal of Object.values(value)) {
    if (isJsonObject(sectionVal)) {
      const fields = parseFormFields(sectionVal.form_fields)
      if (fields.length > 0) return fields
    }
  }

  // حقول افتراضية — حتى لا يرى الزائر رسالة "لا توجد حقول"
  return DEFAULT_FORM_FIELDS
}

const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'full_name', type: 'text', label_en: 'Full Name', label_ar: 'الاسم الكامل', required: true, options: undefined, options_ar: undefined, defaultValue: undefined, description_en: undefined, description_ar: undefined, placeholder_en: undefined, placeholder_ar: 'أدخل اسمك الكامل' },
  { id: 'email', type: 'email', label_en: 'Email', label_ar: 'البريد الإلكتروني', required: true, options: undefined, options_ar: undefined, defaultValue: undefined, description_en: undefined, description_ar: undefined, placeholder_en: undefined, placeholder_ar: 'example@email.com' },
  { id: 'phone', type: 'text', label_en: 'Phone', label_ar: 'رقم الهاتف', required: true, options: undefined, options_ar: undefined, defaultValue: undefined, description_en: undefined, description_ar: undefined, placeholder_en: undefined, placeholder_ar: '07XX XXX XXXX' },
  { id: 'company', type: 'text', label_en: 'Company', label_ar: 'الشركة', required: false, options: undefined, options_ar: undefined, defaultValue: undefined, description_en: undefined, description_ar: undefined, placeholder_en: undefined, placeholder_ar: 'اسم الشركة' },
  { id: 'position', type: 'text', label_en: 'Position', label_ar: 'المسمى الوظيفي', required: false, options: undefined, options_ar: undefined, defaultValue: undefined, description_en: undefined, description_ar: undefined, placeholder_en: undefined, placeholder_ar: 'المسمى الوظيفي' },
  { id: 'country', type: 'text', label_en: 'Country', label_ar: 'الدولة', required: false, options: undefined, options_ar: undefined, defaultValue: undefined, description_en: undefined, description_ar: undefined, placeholder_en: undefined, placeholder_ar: 'الدولة' },
]
