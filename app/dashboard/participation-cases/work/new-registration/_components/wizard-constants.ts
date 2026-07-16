import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'
import type { VisaDocumentDefinition, VisaRoute } from './wizard-types'

export const PLACE_OF_BIRTH_CITIES: Record<string, string[]> = {
  IQ: ['Baghdad', 'Basra', 'Erbil', 'Mosul', 'Najaf', 'Karbala', 'Sulaymaniyah', 'Duhok', 'Fallujah', 'Ramadi', 'Kut', 'Diwaniyah', 'Hilla', 'Samawah', 'Nasiriyah', 'Amarah', 'Kirkuk', 'Tikrit', 'Samarra', 'Baqubah', 'Shatrah', 'Zakho', 'Halabja', 'Ranya'],
  AE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  SA: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Taif', 'Abha', 'Tabuk'],
  TR: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Konya', 'Gaziantep'],
  JO: ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Salt'],
  LB: ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Byblos'],
  EG: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Mansoura'],
  SY: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama', 'Tartus'],
  IR: ['Tehran', 'Mashhad', 'Isfahan', 'Shiraz', 'Tabriz', 'Qom'],
  KW: ['Kuwait City', 'Hawalli', 'Salmiya'], QA: ['Doha', 'Al Rayyan', 'Al Wakrah'],
  BH: ['Manama', 'Muharraq', 'Riffa'], OM: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Dallas', 'Miami'],
  GB: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds'],
}

export const VISA_ROUTES: VisaRoute[] = [
  { country: 'Austria', label: 'Austria · النمسا', embassy: 'Embassy of Austria in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Belgium', label: 'Belgium · بلجيكا', embassy: 'Embassy of Belgium in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'France', label: 'France · فرنسا', embassy: 'Embassy of France in Iraq', portal: 'France-Visas', submissionMethod: 'TLScontact', center: 'TLScontact Baghdad', city: 'Baghdad' },
  { country: 'Germany', label: 'Germany · ألمانيا', embassy: 'Embassy of Germany in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Italy', label: 'Italy · إيطاليا', embassy: 'Embassy of Italy in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Spain', label: 'Spain · إسبانيا', embassy: 'Embassy of Spain in Iraq', portal: 'Official visa portal', submissionMethod: 'BLS International', center: 'Verify BLS center', city: 'Baghdad' },
  { country: 'United Kingdom', label: 'United Kingdom · بريطانيا', embassy: 'UK Visa Application Centre in Iraq', portal: 'UK Visas and Immigration', submissionMethod: 'VFS Global', center: 'Verify UK visa center', city: 'Baghdad' },
  { country: 'United States', label: 'United States · أمريكا', embassy: 'Embassy of the United States in Iraq', portal: 'U.S. Department of State', submissionMethod: 'Embassy Direct', center: 'US Embassy Baghdad', city: 'Baghdad' },
]

export const VISA_DOCUMENTS: VisaDocumentDefinition[] = [
  { type: 'passport_copy', aliases: ['passport_copy', 'passport'], label: 'Passport, Visa & Residence', required: true },
  { type: 'visa_application_form', aliases: ['visa_application_form'], label: 'Visa application form', required: true },
  { type: 'invitation', aliases: ['invitation', 'invitation_letter'], label: 'Invitation letter', required: true },
  { type: 'appointment_confirmation', aliases: ['appointment_confirmation', 'tls_appointment'], label: 'Appointment confirmation', required: true },
  { type: 'insurance', aliases: ['insurance', 'travel_insurance'], label: 'Travel insurance', required: true },
  { type: 'company_letter', aliases: ['company_letter', 'employment_letter'], label: 'Company letter' },
  { type: 'travel_booking', aliases: ['travel_booking', 'flight_booking'], label: 'Travel booking' },
  { type: 'hotel_booking', aliases: ['hotel_booking', 'accommodation'], label: 'Hotel booking' },
]

export const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
export const PHONE_COUNTRY_OPTIONS = getCountries().map((country: CountryCode) => ({ country, code: getCountryCallingCode(country), label: countryNames.of(country) || country })).sort((a, b) => a.label.localeCompare(b.label))
export const PLACE_OF_BIRTH_COUNTRIES = PHONE_COUNTRY_OPTIONS.filter(option => option.country !== 'AC' && option.country !== 'TA').map(option => ({ code: option.country, label: option.label }))
