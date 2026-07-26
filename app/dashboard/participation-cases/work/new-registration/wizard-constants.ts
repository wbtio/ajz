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

/**
 * Shared option lists. These used to live inside wizard-controller.tsx and were
 * forwarded to every step through the untyped view bag; step files now import
 * them directly.
 */
export const IRAQI_GOVERNORATES = ['Baghdad', 'Basra', 'Nineveh', 'Anbar', 'Najaf', 'Karbala', 'Babil', 'Wasit', 'Qadisiyah', 'Muthanna', 'Dhi Qar', 'Maysan', 'Kirkuk', 'Salah Al-Din', 'Diyala', 'Erbil', 'Duhok', 'Sulaymaniyah']

export const SCHENGEN_COUNTRIES = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland']

export const VISA_TYPE_OPTIONS = [
  { value: 'C', label: 'C' },
  { value: 'T', label: 'T' },
]

export const VISA_SUBMISSION_METHODS = [
  'TLScontact',
  'VFS Global',
  'VFS Global - Baghdad',
  'VFS Global - Erbil',
  'VFS Global - Basra',
  'TLScontact - Baghdad',
  'BLS International',
  'iDATA',
  'Embassy Direct',
  'Consulate Direct',
  'Online Portal',
  'Other',
]

export const VISA_ROUTES: VisaRoute[] = [
  { country: 'Austria', label: 'Austria', embassy: 'Embassy of Austria in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Belgium', label: 'Belgium', embassy: 'Embassy of Belgium in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Bulgaria', label: 'Bulgaria', embassy: 'Embassy of Bulgaria in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Croatia', label: 'Croatia', embassy: 'Embassy of Croatia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Czech Republic', label: 'Czech Republic', embassy: 'Embassy of the Czech Republic in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Denmark', label: 'Denmark', embassy: 'Embassy of Denmark in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Estonia', label: 'Estonia', embassy: 'Embassy of Estonia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Finland', label: 'Finland', embassy: 'Embassy of Finland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'France', label: 'France', embassy: 'Embassy of France in Iraq', portal: 'France-Visas', submissionMethod: 'TLScontact', center: 'TLScontact Baghdad', city: 'Baghdad' },
  { country: 'Germany', label: 'Germany', embassy: 'Embassy of Germany in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Greece', label: 'Greece', embassy: 'Embassy of Greece in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Hungary', label: 'Hungary', embassy: 'Embassy of Hungary in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Iceland', label: 'Iceland', embassy: 'Embassy of Iceland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Italy', label: 'Italy', embassy: 'Embassy of Italy in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Latvia', label: 'Latvia', embassy: 'Embassy of Latvia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Liechtenstein', label: 'Liechtenstein', embassy: 'Embassy of Liechtenstein in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Lithuania', label: 'Lithuania', embassy: 'Embassy of Lithuania in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Luxembourg', label: 'Luxembourg', embassy: 'Embassy of Luxembourg in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Malta', label: 'Malta', embassy: 'Embassy of Malta in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Netherlands', label: 'Netherlands', embassy: 'Embassy of the Netherlands in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Norway', label: 'Norway', embassy: 'Embassy of Norway in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Poland', label: 'Poland', embassy: 'Embassy of Poland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Portugal', label: 'Portugal', embassy: 'Embassy of Portugal in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Romania', label: 'Romania', embassy: 'Embassy of Romania in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Spain', label: 'Spain', embassy: 'Embassy of Spain in Iraq', portal: 'Official visa portal', submissionMethod: 'BLS International', center: 'Verify BLS center', city: 'Baghdad' },
  { country: 'Slovakia', label: 'Slovakia', embassy: 'Embassy of Slovakia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Slovenia', label: 'Slovenia', embassy: 'Embassy of Slovenia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Sweden', label: 'Sweden', embassy: 'Embassy of Sweden in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Switzerland', label: 'Switzerland', embassy: 'Embassy of Switzerland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'United Kingdom', label: 'United Kingdom', embassy: 'UK Visa Application Centre in Iraq', portal: 'UK Visas and Immigration', submissionMethod: 'VFS Global', center: 'Verify UK visa center', city: 'Baghdad' },
  { country: 'United States', label: 'United States', embassy: 'Embassy of the United States in Iraq', portal: 'U.S. Department of State', submissionMethod: 'Embassy Direct', center: 'US Embassy Baghdad', city: 'Baghdad' },
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
  { type: 'badge', aliases: ['badge', 'event_badge', 'access_badge'], label: 'Badge' },
  { type: 'residence_permit_document', aliases: ['residence_permit_document'], label: 'Residence permit file' },
  { type: 'previous_schengen_visa_document', aliases: ['previous_schengen_visa_document'], label: 'Previous Schengen visa file' },
]

export const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
export const PHONE_COUNTRY_OPTIONS = getCountries().map((country: CountryCode) => ({ country, code: getCountryCallingCode(country), label: countryNames.of(country) || country })).sort((a, b) => a.label.localeCompare(b.label))
export const PLACE_OF_BIRTH_COUNTRIES = PHONE_COUNTRY_OPTIONS.filter(option => option.country !== 'AC' && option.country !== 'TA').map(option => ({ code: option.country, label: option.label }))
