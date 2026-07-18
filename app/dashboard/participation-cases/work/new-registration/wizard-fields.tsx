'use client'

import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getEmailValidation, getPhoneValidation } from './wizard-helpers'
import { PHONE_COUNTRY_OPTIONS } from './wizard-constants'

export function EmailField({ value, error, onValueChange, placeholder = 'ahmed.ali@example.com' }: { value: string; error: string; onValueChange: (value: string) => void; placeholder?: string }) {
  const normalized = getEmailValidation(value).normalized
  return <div className="space-y-1"><Input value={value} onChange={event => onValueChange(event.target.value)} placeholder={placeholder} inputMode="email" dir="ltr" autoCapitalize="none" autoCorrect="off" className={cn('border-slate-200', error && 'border-red-300 focus-visible:ring-red-200')} />{error ? <p className="text-[11px] leading-5 text-red-600">{error}</p> : normalized ? <p className="text-[11px] leading-5 text-slate-500" dir="ltr">{normalized}</p> : null}</div>
}

export function PhoneNumberField({ value, country, error, onCountryChange, onValueChange, disabled = false }: { value: string; country: CountryCode; error: string; onCountryChange: (country: CountryCode) => void; onValueChange: (value: string) => void; disabled?: boolean }) {
  const callingCode = getCountryCallingCode(country)
  return <div className="space-y-1"><div className="flex min-w-0 rounded-md" dir="ltr"><select value={country} onChange={event => onCountryChange(event.target.value as CountryCode)} disabled={disabled} aria-label="Country calling code" title="Country calling code" className={cn('h-10 w-[76px] shrink-0 rounded-l-md border border-slate-200 bg-slate-50 px-2 text-center font-mono text-xs font-semibold text-slate-700 outline-none transition focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/10 sm:w-[82px]', disabled && 'cursor-not-allowed text-slate-400')}>{PHONE_COUNTRY_OPTIONS.map(option => <option key={option.country} value={option.country}>+{option.code}</option>)}</select><Input value={value} onChange={event => onValueChange(event.target.value)} placeholder={country === 'IQ' ? '771 234 5678' : `Local number (+${callingCode})`} disabled={disabled} inputMode="tel" dir="ltr" className={cn('min-w-0 max-w-[240px] flex-1 rounded-l-none border-slate-200 font-mono tracking-wide sm:max-w-[280px]', error && 'border-red-300 focus-visible:ring-red-200')} /></div>{error ? <p className="text-[11px] leading-5 text-red-600">{error}</p> : value.trim() ? <p className="text-[11px] leading-5 text-slate-500" dir="ltr">{getPhoneValidation(value, country).normalized}</p> : null}</div>
}
