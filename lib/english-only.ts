const ARABIC_SCRIPT_PATTERN = /[\u0600-\u06ff\u0750-\u077f\u0870-\u089f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/g
const ARABIC_SCRIPT_TEST = /[\u0600-\u06ff\u0750-\u077f\u0870-\u089f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/

/** Removes Arabic-script characters while preserving Latin text, numbers, and punctuation. */
export function sanitizeEnglishText(value: string): string {
  return value.replace(ARABIC_SCRIPT_PATTERN, '')
}

export function containsArabicScript(value: string): boolean {
  return ARABIC_SCRIPT_TEST.test(value)
}

export function englishDisplayText(value: unknown, fallback = '—'): string {
  const sanitized = sanitizeEnglishText(String(value || '')).trim()
  return sanitized || fallback
}
