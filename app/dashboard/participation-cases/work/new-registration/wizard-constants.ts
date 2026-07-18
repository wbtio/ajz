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
  { country: 'Bulgaria', label: 'Bulgaria · بلغاريا', embassy: 'Embassy of Bulgaria in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Croatia', label: 'Croatia · كرواتيا', embassy: 'Embassy of Croatia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Czech Republic', label: 'Czech Republic · التشيك', embassy: 'Embassy of the Czech Republic in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Denmark', label: 'Denmark · الدنمارك', embassy: 'Embassy of Denmark in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Estonia', label: 'Estonia · إستونيا', embassy: 'Embassy of Estonia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Finland', label: 'Finland · فنلندا', embassy: 'Embassy of Finland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'France', label: 'France · فرنسا', embassy: 'Embassy of France in Iraq', portal: 'France-Visas', submissionMethod: 'TLScontact', center: 'TLScontact Baghdad', city: 'Baghdad' },
  { country: 'Germany', label: 'Germany · ألمانيا', embassy: 'Embassy of Germany in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Greece', label: 'Greece · اليونان', embassy: 'Embassy of Greece in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Hungary', label: 'Hungary · المجر', embassy: 'Embassy of Hungary in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Iceland', label: 'Iceland · آيسلندا', embassy: 'Embassy of Iceland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Italy', label: 'Italy · إيطاليا', embassy: 'Embassy of Italy in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
  { country: 'Latvia', label: 'Latvia · لاتفيا', embassy: 'Embassy of Latvia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Liechtenstein', label: 'Liechtenstein · ليختنشتاين', embassy: 'Embassy of Liechtenstein in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Lithuania', label: 'Lithuania · ليتوانيا', embassy: 'Embassy of Lithuania in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Luxembourg', label: 'Luxembourg · لوكسمبورغ', embassy: 'Embassy of Luxembourg in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Malta', label: 'Malta · مالطا', embassy: 'Embassy of Malta in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Netherlands', label: 'Netherlands · هولندا', embassy: 'Embassy of the Netherlands in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Norway', label: 'Norway · النرويج', embassy: 'Embassy of Norway in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Poland', label: 'Poland · بولندا', embassy: 'Embassy of Poland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Portugal', label: 'Portugal · البرتغال', embassy: 'Embassy of Portugal in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Romania', label: 'Romania · رومانيا', embassy: 'Embassy of Romania in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Spain', label: 'Spain · إسبانيا', embassy: 'Embassy of Spain in Iraq', portal: 'Official visa portal', submissionMethod: 'BLS International', center: 'Verify BLS center', city: 'Baghdad' },
  { country: 'Slovakia', label: 'Slovakia · سلوفاكيا', embassy: 'Embassy of Slovakia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Slovenia', label: 'Slovenia · سلوفينيا', embassy: 'Embassy of Slovenia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Sweden', label: 'Sweden · السويد', embassy: 'Embassy of Sweden in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
  { country: 'Switzerland', label: 'Switzerland · سويسرا', embassy: 'Embassy of Switzerland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'VFS Global', city: 'Baghdad' },
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
