'use client'

import { useState, useEffect, useTransition, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    getCountries,
    getCountryCallingCode,
    parsePhoneNumberFromString,
    type CountryCode,
} from 'libphonenumber-js'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { hasExactPermission } from '@/lib/permissions'
import {
    searchClientsWithMatchingScore,
    continueWithClientAction,
    createNewClientAndApplication,
    uploadRegistrationDocument,
    recordRegistrationActivity,
} from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientSummary } from './_components/client-summary'
import { ApplicationSummary } from './_components/application-summary'
import { REGISTRATION_STEPS, RegistrationProgress } from './_components/registration-progress'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    User,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Eye,
    EyeOff,
    Check,
    X,
    ChevronLeft,
    Plus,
    Printer,
    Download,
    FolderKanban,
    Lock,
    Clock,
    FileCode,
    RefreshCw,
    ExternalLink,
    MessageCircle,
    Bell,
    Volume2,
    Trash2,
} from 'lucide-react'

const placeOfBirthCitiesByCountry: Record<string, string[]> = {
    IQ: [
        'Baghdad', 'Basra', 'Erbil', 'Mosul', 'Najaf', 'Karbala', 'Sulaymaniyah', 'Duhok',
        'Fallujah', 'Ramadi', 'Kut', 'Diwaniyah', 'Hilla', 'Samawah', 'Nasiriyah', 'Amarah',
        'Kirkuk', 'Tikrit', 'Samarra', 'Baqubah', 'Shatrah', 'Zakho', 'Halabja', 'Ranya',
    ],
    AE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
    SA: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Taif', 'Abha', 'Tabuk'],
    TR: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Konya', 'Gaziantep'],
    JO: ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Salt'],
    LB: ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Byblos'],
    EG: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Mansoura'],
    SY: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama', 'Tartus'],
    IR: ['Tehran', 'Mashhad', 'Isfahan', 'Shiraz', 'Tabriz', 'Qom'],
    KW: ['Kuwait City', 'Hawalli', 'Salmiya'],
    QA: ['Doha', 'Al Rayyan', 'Al Wakrah'],
    BH: ['Manama', 'Muharraq', 'Riffa'],
    OM: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'],
    US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Dallas', 'Miami'],
    GB: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds'],
}

type VisaRoute = {
    country: string
    label: string
    embassy: string
    portal: string
    submissionMethod: string
    center: string
    city: string
}

// This is a configurable starting catalogue. The operator can still edit the
// embassy and center because the real submission route can change by case.
const VISA_ROUTES: VisaRoute[] = [
    { country: 'Austria', label: 'Austria · النمسا', embassy: 'Embassy of Austria in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Belgium', label: 'Belgium · بلجيكا', embassy: 'Embassy of Belgium in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Bulgaria', label: 'Bulgaria · بلغاريا', embassy: 'Embassy of Bulgaria in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Embassy Direct', city: 'Baghdad' },
    { country: 'Croatia', label: 'Croatia · كرواتيا', embassy: 'Embassy of Croatia in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Czech Republic', label: 'Czech Republic · التشيك', embassy: 'Embassy of the Czech Republic in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Denmark', label: 'Denmark · الدنمارك', embassy: 'Embassy of Denmark in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Estonia', label: 'Estonia · إستونيا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Finland', label: 'Finland · فنلندا', embassy: 'Embassy of Finland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'France', label: 'France · فرنسا', embassy: 'Embassy of France in Iraq', portal: 'France-Visas', submissionMethod: 'TLScontact', center: 'TLScontact Baghdad', city: 'Baghdad' },
    { country: 'Germany', label: 'Germany · ألمانيا', embassy: 'Embassy of Germany in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Greece', label: 'Greece · اليونان', embassy: 'Embassy of Greece in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Hungary', label: 'Hungary · المجر', embassy: 'Embassy of Hungary in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Iceland', label: 'Iceland · آيسلندا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Italy', label: 'Italy · إيطاليا', embassy: 'Embassy of Italy in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Latvia', label: 'Latvia · لاتفيا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Liechtenstein', label: 'Liechtenstein · ليختنشتاين', embassy: 'Representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Lithuania', label: 'Lithuania · ليتوانيا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Luxembourg', label: 'Luxembourg · لوكسمبورغ', embassy: 'Representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Malta', label: 'Malta · مالطا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Netherlands', label: 'Netherlands · هولندا', embassy: 'Embassy of the Netherlands in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Norway', label: 'Norway · النرويج', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Poland', label: 'Poland · بولندا', embassy: 'Embassy of Poland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Portugal', label: 'Portugal · البرتغال', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Romania', label: 'Romania · رومانيا', embassy: 'Embassy of Romania in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Slovakia', label: 'Slovakia · سلوفاكيا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Slovenia', label: 'Slovenia · سلوفينيا', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'Embassy Direct', center: 'Verify submission office', city: 'Baghdad' },
    { country: 'Spain', label: 'Spain · إسبانيا', embassy: 'Embassy of Spain in Iraq', portal: 'Official visa portal', submissionMethod: 'BLS International', center: 'Verify BLS center', city: 'Baghdad' },
    { country: 'Sweden', label: 'Sweden · السويد', embassy: 'Embassy / representing mission in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'Switzerland', label: 'Switzerland · سويسرا', embassy: 'Embassy of Switzerland in Iraq', portal: 'Official visa portal', submissionMethod: 'VFS Global', center: 'Verify visa center', city: 'Baghdad' },
    { country: 'United Kingdom', label: 'United Kingdom · بريطانيا', embassy: 'UK Visa Application Centre in Iraq', portal: 'UK Visas and Immigration', submissionMethod: 'VFS Global', center: 'Verify UK visa center', city: 'Baghdad' },
    { country: 'United States', label: 'United States · أمريكا', embassy: 'Embassy of the United States in Iraq', portal: 'U.S. Department of State', submissionMethod: 'Embassy Direct', center: 'US Embassy Baghdad', city: 'Baghdad' },
]

const VISA_TYPE_OPTIONS = [
    { value: 'Business Visa', label: 'Business / conference' },
    { value: 'Tourist Visa', label: 'Tourist' },
    { value: 'Visit Visa', label: 'Family / private visit' },
    { value: 'Work Visa', label: 'Work / employment' },
    { value: 'Student Visa', label: 'Study / training' },
    { value: 'Transit Visa', label: 'Transit' },
    { value: 'National Visa', label: 'National / long stay' },
]

const VISA_SUBMISSION_METHODS = ['TLScontact', 'VFS Global', 'BLS International', 'iDATA', 'Embassy Direct', 'Consulate Direct', 'Online Portal', 'Other']

type RegistrationDocument = {
    name: string
    path: string
    type: string
    uploadedAt?: string
}

type PreviousSchengenVisa = {
    country: string
    visa_number: string
    issue_date: string
    expiry_date: string
}

const EMPTY_SCHENGEN_VISA: PreviousSchengenVisa = {
    country: '',
    visa_number: '',
    issue_date: '',
    expiry_date: '',
}

function normalizePreviousSchengenVisas(value: unknown): PreviousSchengenVisa[] {
    if (!value) return []
    let parsed = value
    if (typeof value === 'string') {
        try { parsed = JSON.parse(value) } catch { return [] }
    }
    if (!Array.isArray(parsed)) return []
    return parsed.map((visa) => ({
        country: String(visa?.country ?? ''),
        visa_number: String(visa?.visa_number ?? ''),
        issue_date: String(visa?.issue_date ?? ''),
        expiry_date: String(visa?.expiry_date ?? ''),
    }))
}

function normalizeResidencePermit(value: unknown) {
    let parsed = value
    if (typeof value === 'string') {
        try { parsed = JSON.parse(value) } catch { parsed = null }
    }
    const permit = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
    return {
        hasPermit: Boolean(permit.has_permit),
        country: String(permit.country ?? ''),
        number: String(permit.number ?? ''),
        expiryDate: String(permit.expiry_date ?? ''),
    }
}

type VisaAppointmentReminder = {
    id: string
    remindAt: string
    note: string
    sound: boolean
    notifiedAt?: string
}

type VisaDocumentDefinition = {
    type: string
    aliases: string[]
    label: string
    required?: boolean
}

const VISA_DOCUMENTS: VisaDocumentDefinition[] = [
    { type: 'passport_copy', aliases: ['passport_copy', 'passport'], label: 'Passport, Visa & Residence', required: true },
    { type: 'visa_application_form', aliases: ['visa_application_form'], label: 'Visa application form', required: true },
    { type: 'invitation', aliases: ['invitation', 'invitation_letter'], label: 'Invitation letter', required: true },
    { type: 'appointment_confirmation', aliases: ['appointment_confirmation', 'tls_appointment'], label: 'Appointment confirmation', required: true },
    { type: 'insurance', aliases: ['insurance', 'travel_insurance'], label: 'Travel insurance', required: true },
    { type: 'company_letter', aliases: ['company_letter', 'employment_letter'], label: 'Company letter' },
    { type: 'travel_booking', aliases: ['travel_booking', 'flight_booking'], label: 'Travel booking' },
    { type: 'hotel_booking', aliases: ['hotel_booking', 'accommodation'], label: 'Hotel booking' },
]

function normalizeRegistrationDocuments(value: unknown): RegistrationDocument[] {
    if (!Array.isArray(value)) return []
    return value.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return []
        const doc = entry as Record<string, unknown>
        const path = String(doc.path ?? doc.file_url ?? doc.url ?? '')
        if (!path) return []
        return [{
            name: String(doc.name ?? doc.label ?? 'Document'),
            path,
            type: String(doc.type ?? 'other'),
            uploadedAt: typeof doc.uploadedAt === 'string' ? doc.uploadedAt : undefined,
        }]
    })
}

function SearchableChoice({
    value,
    placeholder,
    items,
    onSelect,
    disabled = false,
}: {
    value: string
    placeholder: string
    items: Array<{ value: string; label: string }>
    onSelect: (value: string) => void
    disabled?: boolean
}) {
    const [open, setOpen] = useState(false)

    const selectedLabel = items.find(item => item.value === value)?.label || ''

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="h-10 w-full justify-between border-slate-200 bg-white px-3 text-left font-normal text-slate-700 hover:bg-slate-50"
                >
                    <span className={cn('truncate', !selectedLabel && 'text-slate-400')}>
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronLeft className="size-4 rotate-[-90deg] text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <ScrollArea className="h-64 rounded-md border border-slate-100">
                    <div className="p-1">
                        {items.map(item => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                    onSelect(item.value)
                                    setOpen(false)
                                }}
                                className={cn(
                                    'flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100',
                                    item.value === value && 'bg-slate-100 font-medium text-[#8B0000]',
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

// --- Types ---
interface Event {
    id: string
    title: string
    title_ar: string | null
    date: string
    end_date: string | null
    country: string | null
    country_ar: string | null
    location: string
    location_ar: string | null
    sector: string | null
    status?: string | null
    organizer?: string | null
    registration_config: any
}

interface Employee {
    id: string
    full_name: string | null
    email: string
    role: string | null
}

interface WizardClientProps {
    events: Event[]
    employees: Employee[]
    initialRegistrationId?: string
    initialStep?: number
    currentUser: any
    onClose?: () => void
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
const PHONE_COUNTRY_OPTIONS = getCountries()
    .map((country) => ({
        country,
        code: getCountryCallingCode(country),
        label: countryNames.of(country) || country,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

const placeOfBirthCountries = PHONE_COUNTRY_OPTIONS
    .filter(option => option.country !== 'AC' && option.country !== 'TA')
    .map(option => ({ code: option.country, label: option.label }))

function formatEventDate(date?: string | null) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-GB')
}

function buildTravelPurpose(event: Event | undefined, participationType: string) {
    if (!event) return 'Business / Exhibition Attendance'
    const title = event.title_ar || event.title || 'the selected event'
    const place = event.location_ar || event.location || event.country_ar || event.country
    const date = formatEventDate(event.date)
    const pieces = [`Attend ${title}`]
    if (place) pieces.push(`in ${place}`)
    if (date) pieces.push(`on ${date}`)
    pieces.push(`as ${participationType}`)
    return pieces.join(' ')
}

function normalizeLocalPhoneInput(value: string, country: CountryCode) {
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('+')) return trimmed

    const digits = trimmed.replace(/\D/g, '')
    if (!digits) return ''

    const callingCode = getCountryCallingCode(country)
    const nationalDigits = digits.startsWith(callingCode)
        ? digits.slice(callingCode.length)
        : digits

    return `+${callingCode}${nationalDigits.replace(/^0+/, '')}`
}

function getPhoneValidation(value: string, country: CountryCode) {
    const normalized = normalizeLocalPhoneInput(value, country)
    if (!normalized) return { normalized: '', error: '' }

    const phone = parsePhoneNumberFromString(normalized, country)
    if (!phone?.isValid()) {
        if (country === 'IQ') {
            return {
                normalized,
                error: 'Invalid Iraqi number. Enter it like 07712345678 or 7712345678.',
           
            }
        }
        return {
            normalized,
            error: `Enter a valid phone number for ${countryNames.of(country) || country}.`,
        }
    }

    return { normalized: phone.number, error: '' }
}

function getEmailValidation(value: string) {
    const email = value.trim().toLowerCase()
    if (!email) return { normalized: '', error: '' }

    if (/\s/.test(email)) {
        return { normalized: email, error: 'Email addresses cannot contain spaces.' }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return { normalized: email, error: 'Enter a valid email address, for example ahmed.ali@example.com.' }
    }

    return { normalized: email, error: '' }
}

function EmailField({
    value,
    error,
    onValueChange,
    placeholder = 'ahmed.ali@example.com',
}: {
    value: string
    error: string
    onValueChange: (value: string) => void
    placeholder?: string
}) {
    const normalized = getEmailValidation(value).normalized

    return (
        <div className="space-y-1">
            <Input
                value={value}
                onChange={event => onValueChange(event.target.value)}
                placeholder={placeholder}
                inputMode="email"
                dir="ltr"
                autoCapitalize="none"
                autoCorrect="off"
                className={cn(
                    'border-slate-200',
                    error && 'border-red-300 focus-visible:ring-red-200',
                )}
            />
            {error ? (
                <p className="text-[11px] leading-5 text-red-600">{error}</p>
            ) : normalized ? (
                <p className="text-[11px] leading-5 text-slate-500" dir="ltr">{normalized}</p>
            ) : null}
        </div>
    )
}

function PhoneNumberField({
    value,
    country,
    error,
    onCountryChange,
    onValueChange,
    disabled = false,
}: {
    value: string
    country: CountryCode
    error: string
    onCountryChange: (country: CountryCode) => void
    onValueChange: (value: string) => void
    disabled?: boolean
}) {
    const callingCode = getCountryCallingCode(country)

    return (
        <div className="space-y-1">
            <div className="flex min-w-0">
                <select
                    value={country}
                    onChange={(event) => onCountryChange(event.target.value as CountryCode)}
                    disabled={disabled}
                    className={cn(
                        'h-10 w-24 shrink-0 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 sm:w-28',
                        disabled && 'cursor-not-allowed text-slate-400',
                    )}
                >
                    {PHONE_COUNTRY_OPTIONS.map((option) => (
                        <option key={option.country} value={option.country}>
                            {option.label} +{option.code}
                        </option>
                    ))}
                </select>
                <Input
                    value={value}
                    onChange={event => onValueChange(event.target.value)}
                    placeholder={country === 'IQ' ? ' 7712345678' : `Local number, +${callingCode}`}
               
                    disabled={disabled}
                    inputMode="tel"
                    dir="ltr"
                    className={cn(
                        'min-w-0 flex-1 max-w-[240px] rounded-l-none border-slate-200 font-mono sm:max-w-[280px]',
                        error && 'border-red-300 focus-visible:ring-red-200',
                    )}
                />
            </div>
            {error ? (
                <p className="text-[11px] leading-5 text-red-600">{error}</p>
            ) : value.trim() ? (
                <p className="text-[11px] leading-5 text-slate-500" dir="ltr">
                    {getPhoneValidation(value, country).normalized}
                </p>
            ) : null}
        </div>
    )
}

export function WizardClient({
    events,
    employees,
    initialRegistrationId,
    initialStep = 1,
    currentUser,
    onClose
}: WizardClientProps) {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])
    const canEditFeeBreakdown = hasExactPermission(
        currentUser?.role,
        '/dashboard/participation-cases/work/payment',
        Array.isArray(currentUser?.permissions) ? currentUser.permissions : null,
    )

    // --- State ---
    const [step, setStep] = useState<number>(initialStep)
    const [registrationId, setRegistrationId] = useState<string | undefined>(initialRegistrationId)
    const [caseNumber, setCaseNumber] = useState<string>('')
    const [isPending, startTransition] = useTransition()

    // Step 1 Search inputs
    const [searchForm, setSearchForm] = useState({
        fullName: '',
        surname: '',
        salutation: '',
        gender: '',
        maritalStatus: '',
        passportNumber: '',
        nationalId: '',
        phone: '',
        email: '',
        companyName: '',
        dateOfBirth: '',
        placeOfBirthCountry: '',
        placeOfBirthCity: '',
        placeOfBirth: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        jobTitle: '',
        department: '',
        workCity: '',
        workPhone: '',
        workEmail: '',
        residenceCountry: 'Iraq',
        previousSchengenVisa: false,
        previousSchengenVisas: [] as PreviousSchengenVisa[],
        hasOtherResidencePermit: false,
        otherResidenceCountry: '',
        otherResidenceNumber: '',
        otherResidenceExpiryDate: '',
    })

    const [searchResults, setSearchResults] = useState<any[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedPotentialMatch, setSelectedPotentialMatch] = useState<any>(null)
    const [showWarningDialog, setShowWarningDialog] = useState(false)
    const [phoneCountry, setPhoneCountry] = useState<CountryCode>('IQ')
    const fullNameIsValid = !searchForm.fullName || /^[A-Za-z\s'.-]+$/.test(searchForm.fullName.trim())
    const surnameIsValid = !searchForm.surname || /^[A-Za-z\s'.-]+$/.test(searchForm.surname.trim())
    const passportNumberIsValid = !searchForm.passportNumber || /^[A-Z][0-9]{7,8}$/.test(searchForm.passportNumber)
    const nationalIdIsValid = !searchForm.nationalId || /^[0-9]{12}$/.test(searchForm.nationalId)

    // Current registration data (loaded as we progress)
    const [registration, setRegistration] = useState<any>(null)
    const [client, setClient] = useState<any>(null)

    // Step 2 Intake fields
    const [assignedTo, setAssignedTo] = useState('')
    const [appNotes, setAppNotes] = useState('')
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
    const [changedFieldsToPrompt, setChangedFieldsToPrompt] = useState<Record<string, any>>({})

    // Step 3 Event fields
    const [selectedEventId, setSelectedEventId] = useState('')
    const [participationType, setParticipationType] = useState('Business Visitor')
    const [travelPurpose, setTravelPurpose] = useState('Business / Exhibition Attendance')

    // Step 4 Visa platform & appointment fields
    const [visaDestination, setVisaDestination] = useState('France')
    const [visaEmbassy, setVisaEmbassy] = useState('Embassy of France in Iraq')
    const [visaType, setVisaType] = useState('Business Visa')
    const [visaPlatform, setVisaPlatform] = useState('France-Visas')
    const [visaSubmissionMethod, setVisaSubmissionMethod] = useState('TLScontact')
    const [visaPortalEmail, setVisaPortalEmail] = useState('')
    const [visaPortalPassword, setVisaPortalPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [visaAccountStatus, setVisaAccountStatus] = useState('Created')
    const [visaAppRefNumber, setVisaAppRefNumber] = useState('')
    const [visaPortalAppStatus, setVisaPortalAppStatus] = useState('Completed')
    const [visaAppointmentChannel, setVisaAppointmentChannel] = useState('Visa Center')
    const [visaAppointmentCenter, setVisaAppointmentCenter] = useState('TLScontact Baghdad')
    const [visaAppointmentCity, setVisaAppointmentCity] = useState('Baghdad')
    const [visaAppointmentDate, setVisaAppointmentDate] = useState('')
    const [visaAppointmentTime, setVisaAppointmentTime] = useState('10:30')
    const [visaAppointmentRefNumber, setVisaAppointmentRefNumber] = useState('')
    const [visaAppointmentStatus, setVisaAppointmentStatus] = useState('Booked')
    const [visaReminders, setVisaReminders] = useState<VisaAppointmentReminder[]>([])
    const [newReminderAt, setNewReminderAt] = useState('')
    const [newReminderNote, setNewReminderNote] = useState('')
    const [visaSaveState, setVisaSaveState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
    const visaAutosaveBaseline = useRef<string | null>(null)
    const visaAutosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Step 5 Document assembly fields
    const [packageName, setPackageName] = useState('')
    const [includeClientInfoInPackage, setIncludeClientInfoInPackage] = useState(true)
    const [packageDocumentPaths, setPackageDocumentPaths] = useState<string[]>([])
    const [uploadingDocumentType, setUploadingDocumentType] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<{ type: string; message: string } | null>(null)
    const [isPackageGenerating, setIsPackageGenerating] = useState(false)

    // Step 6 Payment fields
    const [paymentCategory, setPaymentCategory] = useState('Visa Application & Services')
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
    const [paymentNotes, setPaymentNotes] = useState('')
    const [fees, setFees] = useState({
        service: 150,
        event: 300,
        invitation: 75,
        coordination: 200,
        appointment: 80,
        insurance: 60,
        printing: 25,
        discount: -50
    })
    const [amountPaid, setAmountPaid] = useState(840)

    const [deliveryDocumentPaths, setDeliveryDocumentPaths] = useState<string[]>([])
    const [deliveryMessage, setDeliveryMessage] = useState('')
    const [deliveryStatus, setDeliveryStatus] = useState('not_sent')

    // Load active registration if initial ID is provided
    useEffect(() => {
        if (registrationId) {
            loadRegistration(registrationId)
        }
    }, [registrationId])

    // Auto-generate package name in Step 5
    useEffect(() => {
        if (client) {
            const formattedName = (client.full_name_as_passport || 'Client')
                .replace(/\s+/g, '_')
            setPackageName(`${formattedName}_Visa_Package.pdf`)
        }
    }, [client])

    async function loadRegistration(id: string) {
        try {
            const { data: reg, error } = await supabase
                .from('registrations')
                .select(`
                    id, event_id, notes, documents, additional_data,
                    case_number, assigned_employee_id, updated_at,
                    registration_events (performed_by_name, created_at),
                    clients (
                        id, full_name_as_passport, last_name, title_salutation,
                        sex, marital_status, passport_number, national_id,
                        phone, email, employer_name, date_of_birth,
                        place_of_birth, passport_issue_date, passport_expiry_date,
                        job_title, department, work_city, work_phone, work_email,
                        residence_country, previous_schengen_visa,
                        schengen_visas_last_5y, other_residence_permit
                    )
                `)
                .eq('id', id)
                .single()

            if (error || !reg) {
                toast.error('خطأ في تحميل بيانات الطلب')
                return
            }

            setRegistration(reg)
            setCaseNumber(reg.case_number || '')
            setAssignedTo(reg.assigned_employee_id || '')
            setAppNotes(reg.notes || '')
            if (reg.clients) {
                setClient(reg.clients)
                const cl = reg.clients as any
                const parsedPhone = cl.phone ? parsePhoneNumberFromString(cl.phone) : null
                const residencePermit = normalizeResidencePermit(cl.other_residence_permit)
                if (parsedPhone?.country) setPhoneCountry(parsedPhone.country)
                // Pre-fill editable info
                setSearchForm({
                    fullName: cl.full_name_as_passport || '',
                    surname: cl.last_name || '',
                    salutation: cl.title_salutation || '',
                    gender: cl.sex || '',
                    maritalStatus: cl.marital_status || '',
                    passportNumber: cl.passport_number || '',
                    nationalId: cl.national_id || '',
                    phone: parsedPhone?.nationalNumber || cl.phone || '',
                    email: cl.email || '',
                    companyName: cl.employer_name || '',
                    dateOfBirth: cl.date_of_birth || '',
                    placeOfBirthCountry: (cl.place_of_birth || '').split(', ')[1]
                        ? placeOfBirthCountries.find(country => country.label === (cl.place_of_birth || '').split(', ')[0])?.code || ''
                        : '',
                    placeOfBirthCity: (cl.place_of_birth || '').split(', ')[1] || '',
                    placeOfBirth: cl.place_of_birth || '',
                    passportIssueDate: cl.passport_issue_date || '',
                    passportExpiryDate: cl.passport_expiry_date || '',
                    jobTitle: cl.job_title || '',
                    department: cl.department || '',
                    workCity: cl.work_city || '',
                    workPhone: cl.work_phone || '',
                    workEmail: cl.work_email || '',
                    residenceCountry: cl.residence_country || 'Iraq',
                    previousSchengenVisa: Boolean(cl.previous_schengen_visa),
                    previousSchengenVisas: normalizePreviousSchengenVisas(cl.schengen_visas_last_5y),
                    hasOtherResidencePermit: residencePermit.hasPermit,
                    otherResidenceCountry: residencePermit.country,
                    otherResidenceNumber: residencePermit.number,
                    otherResidenceExpiryDate: residencePermit.expiryDate,
                })
            }

            // Load saved step inputs if they exist in DB
            if (reg.event_id) setSelectedEventId(reg.event_id)
            const ad = (reg.additional_data as any) || {}
            const storedDocuments = normalizeRegistrationDocuments(reg.documents)
            const storedDeliveryPaths = Array.isArray(ad.delivery_document_paths)
                ? ad.delivery_document_paths.filter((path: unknown): path is string => typeof path === 'string')
                : storedDocuments.map((document) => document.path)
            setDeliveryDocumentPaths(storedDeliveryPaths)
            setDeliveryMessage(ad.delivery_message || '')
            setDeliveryStatus(ad.delivery_status || 'not_sent')
            if (ad.participation_type) setParticipationType(ad.participation_type)
            if (ad.travel_purpose) setTravelPurpose(ad.travel_purpose)

            // Step 4 fields
            if (ad.visa_destination_country) setVisaDestination(ad.visa_destination_country)
            if (ad.visa_embassy) setVisaEmbassy(ad.visa_embassy)
            if (ad.visa_type) setVisaType(ad.visa_type)
            if (ad.visa_platform) setVisaPlatform(ad.visa_platform)
            if (ad.visa_submission_method) setVisaSubmissionMethod(ad.visa_submission_method)
            if (ad.visa_portal_email) setVisaPortalEmail(ad.visa_portal_email)
            if (ad.visa_portal_password) setVisaPortalPassword(ad.visa_portal_password)
            if (ad.visa_portal_status) setVisaAccountStatus(ad.visa_portal_status)
            if (ad.visa_app_ref_number) setVisaAppRefNumber(ad.visa_app_ref_number)
            if (ad.visa_portal_app_status) setVisaPortalAppStatus(ad.visa_portal_app_status)
            if (ad.visa_appointment_channel) setVisaAppointmentChannel(ad.visa_appointment_channel)
            if (ad.visa_appointment_center) setVisaAppointmentCenter(ad.visa_appointment_center)
            if (ad.visa_appointment_city) setVisaAppointmentCity(ad.visa_appointment_city)
            if (ad.visa_appointment_date) setVisaAppointmentDate(ad.visa_appointment_date)
            if (ad.visa_appointment_time) setVisaAppointmentTime(ad.visa_appointment_time)
            if (ad.visa_appointment_ref_number) setVisaAppointmentRefNumber(ad.visa_appointment_ref_number)
            if (ad.visa_appointment_status) setVisaAppointmentStatus(ad.visa_appointment_status)
            if (Array.isArray(ad.visa_appointment_reminders)) {
                setVisaReminders(ad.visa_appointment_reminders.filter((item: unknown): item is VisaAppointmentReminder => {
                    if (!item || typeof item !== 'object') return false
                    const reminder = item as Partial<VisaAppointmentReminder>
                    return typeof reminder.id === 'string' && typeof reminder.remindAt === 'string'
                }))
            } else if (ad.visa_reminder_date) {
                // Preserve reminders created before multiple reminders were supported.
                setVisaReminders([{
                    id: `legacy-${ad.visa_reminder_date}`,
                    remindAt: `${ad.visa_reminder_date}T09:00`,
                    note: 'Appointment reminder',
                    sound: true,
                }])
            }

            // Step 5 fields
            if (typeof ad.package_include_client_info === 'boolean') setIncludeClientInfoInPackage(ad.package_include_client_info)
            if (Array.isArray(ad.package_selected_document_paths)) {
                setPackageDocumentPaths(ad.package_selected_document_paths.filter((path: unknown): path is string => typeof path === 'string'))
            }
            if (ad.package_assembly_name) setPackageName(ad.package_assembly_name)

            // Step 6 fields
            if (ad.payment_category) setPaymentCategory(ad.payment_category)
            if (ad.payment_method) setPaymentMethod(ad.payment_method)
            if (ad.payment_date) setPaymentDate(ad.payment_date)
            if (typeof ad.payment_notes === 'string') setPaymentNotes(ad.payment_notes)
            if (ad.fee_breakdown) setFees(ad.fee_breakdown)
            if (typeof ad.amount_paid === 'number') setAmountPaid(ad.amount_paid)

        } catch (e) {
            console.error(e)
            toast.error('فشل تحميل الطلب')
        }
    }

    // --- Weighted Scoring Search Action ---
    function handleSearch() {
        if (!searchForm.fullName.trim() && !searchForm.nationalId.trim() && !searchForm.passportNumber.trim() && !searchForm.dateOfBirth) {
            toast.error('الرجاء إدخال حقل بحث واحد على الأقل (الاسم الكامل، الرقم الوطني، رقم الجواز أو تاريخ الميلاد)')
            return
        }
        if (phoneValidation.error) {
            toast.error(phoneValidation.error)
            return
        }
        if (emailValidation.error) {
            toast.error(emailValidation.error)
            return
        }

        startTransition(async () => {
            const res = await searchClientsWithMatchingScore(normalizedSearchForm)
            if (res.error) {
                toast.error(res.error)
                return
            }

            setSearchResults(res.data)
            setHasSearched(true)
            setSelectedPotentialMatch(null)

            if (res.data.length > 0) {
                // If there's a strong match, auto-select it for side-by-side review
                const topMatch = res.data[0]
                if (topMatch.matchType === 'Exact Match' || topMatch.matchType === 'Strong Match' || topMatch.matchType === 'Potential Match') {
                    setSelectedPotentialMatch(topMatch)
                }
            } else {
                toast.info('لم يتم العثور على عملاء مطابقين مسبقاً.')
            }
        })
    }

    // Helper to update the draft event details once the draft is created in Step 2
    async function updateDraftEventDetails(regId: string) {
        if (!selectedEventId) return
        const { error } = await supabase
            .from('registrations')
            .update({
                event_id: selectedEventId,
                additional_data: {
                    participation_type: participationType,
                    travel_purpose: travelPurpose
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', regId)
        if (error) {
            console.error('Failed to bind Step 1 event details:', error)
        }
    }

    // --- Continue with Existing Client (Resolves Differences and updates old passports) ---
    function handleContinueWithClient(match: any, updateProfile: boolean) {
        if (!validateStepBeforeAdvance(3)) return
        if (phoneValidation.error) {
            toast.error(phoneValidation.error)
            return
        }
        if (emailValidation.error) {
            toast.error(emailValidation.error)
            return
        }

        startTransition(async () => {
            const res = await continueWithClientAction({
                clientId: match.client.id,
                updateProfile,
                eventId: selectedEventId,
                newData: normalizedSearchForm
            })

            if (res.error || !res.data) {
                toast.error(res.error || 'حدث خطأ أثناء ربط العميل')
                return
            }

            toast.success(updateProfile ? 'تم تحديث ملف العميل وحفظ المسودة بنجاح' : 'تم ربط العميل بالمسودة بنجاح')
            setRegistrationId(res.data.registrationId)
            setCaseNumber(res.data.caseNumber)
            await updateDraftEventDetails(res.data.registrationId)
            setStep(3)
        })
    }

    // --- Create a completely new client ---
    function handleCreateNewClient() {
        if (!validateStepBeforeAdvance(3)) return
        if (phoneValidation.error) {
            toast.error(phoneValidation.error)
            return
        }
        if (emailValidation.error) {
            toast.error(emailValidation.error)
            return
        }

        // Safe duplication check
        const highMatch = searchResults.find(r => r.score >= 80)
        if (highMatch && !showWarningDialog) {
            setShowWarningDialog(true)
            return
        }

        setShowWarningDialog(false)
        startTransition(async () => {
            const res = await createNewClientAndApplication({
                eventId: selectedEventId,
                clientData: normalizedSearchForm
            })

            if (res.error || !res.data) {
                toast.error(res.error || 'حدث خطأ أثناء إنشاء الحساب')
                return
            }

            toast.success('تم إنشاء حساب عميل جديد والمسودة بنجاح')
            setRegistrationId(res.data.registrationId)
            setCaseNumber(res.data.caseNumber)
            await updateDraftEventDetails(res.data.registrationId)
            setStep(3)
        })
    }

    // --- Step 2: Save Intake Details & Snapshot ---
    async function handleSaveIntake() {
        if (!registrationId) return
        if (!validateStepBeforeAdvance(4)) return
        if (phoneValidation.error) {
            toast.error(phoneValidation.error)
            return
        }
        if (emailValidation.error) {
            toast.error(emailValidation.error)
            return
        }

        try {
            // Check if user edited changeable fields to prompt profile updates
            const changeableChanges: Record<string, any> = {}
            if (normalizedSearchForm.phone !== client?.phone) changeableChanges.phone = normalizedSearchForm.phone
            if (normalizedSearchForm.email !== client?.email) changeableChanges.email = normalizedSearchForm.email
            if (searchForm.companyName !== client?.employer_name) changeableChanges.companyName = searchForm.companyName
            if (searchForm.maritalStatus !== client?.marital_status) changeableChanges.maritalStatus = searchForm.maritalStatus
            if (searchForm.salutation !== client?.title_salutation) changeableChanges.salutation = searchForm.salutation
            if (searchForm.gender !== client?.sex) changeableChanges.gender = searchForm.gender
            if (searchForm.fullName !== client?.full_name_as_passport) changeableChanges.fullName = searchForm.fullName
            if (searchForm.surname !== client?.last_name) changeableChanges.surname = searchForm.surname
            if (searchForm.passportNumber !== client?.passport_number) changeableChanges.passportNumber = searchForm.passportNumber
            if (searchForm.nationalId !== client?.national_id) changeableChanges.nationalId = searchForm.nationalId
            if (searchForm.dateOfBirth !== client?.date_of_birth) changeableChanges.dateOfBirth = searchForm.dateOfBirth
            if (searchForm.placeOfBirth !== client?.place_of_birth) changeableChanges.placeOfBirth = searchForm.placeOfBirth
            if (searchForm.passportIssueDate !== client?.passport_issue_date) changeableChanges.passportIssueDate = searchForm.passportIssueDate
            if (searchForm.passportExpiryDate !== client?.passport_expiry_date) changeableChanges.passportExpiryDate = searchForm.passportExpiryDate
            if (searchForm.jobTitle !== client?.job_title) changeableChanges.jobTitle = searchForm.jobTitle
            if (searchForm.department !== client?.department) changeableChanges.department = searchForm.department
            if (searchForm.workCity !== client?.work_city) changeableChanges.workCity = searchForm.workCity
            if (searchForm.workPhone !== client?.work_phone) changeableChanges.workPhone = searchForm.workPhone
            if (searchForm.workEmail !== client?.work_email) changeableChanges.workEmail = searchForm.workEmail
            if (searchForm.residenceCountry !== client?.residence_country) changeableChanges.residenceCountry = searchForm.residenceCountry
            if (searchForm.previousSchengenVisa !== Boolean(client?.previous_schengen_visa)) changeableChanges.previousSchengenVisa = searchForm.previousSchengenVisa
            if (JSON.stringify(searchForm.previousSchengenVisas) !== JSON.stringify(normalizePreviousSchengenVisas(client?.schengen_visas_last_5y))) changeableChanges.previousSchengenVisas = searchForm.previousSchengenVisas
            const currentResidencePermit = normalizeResidencePermit(client?.other_residence_permit)
            const nextResidencePermit = {
                hasPermit: searchForm.hasOtherResidencePermit,
                country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : '',
                number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : '',
                expiryDate: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : '',
            }
            if (JSON.stringify(nextResidencePermit) !== JSON.stringify(currentResidencePermit)) changeableChanges.residencePermit = nextResidencePermit

            if (Object.keys(changeableChanges).length > 0 && !showUpdatePrompt) {
                setChangedFieldsToPrompt(changeableChanges)
                setShowUpdatePrompt(true)
                return
            }

            // Perform Supabase update
            const { error } = await supabase
                .from('registrations')
                .update({
                    assigned_employee_id: assignedTo || null,
                    notes: appNotes || null,
                    current_step: 4,
                    updated_at: new Date().toISOString()
                })
                .eq('id', registrationId!)

            if (error) throw error

            toast.success('تم حفظ تفاصيل الطلب بنجاح.')
            setShowUpdatePrompt(false)
            setStep(4)
            loadRegistration(registrationId)
        } catch (e: any) {
            toast.error(e.message || 'فشل الحفظ')
        }
    }

    async function handleSaveDraftOnly() {
        if (!registrationId) return
        if (phoneValidation.error) {
            toast.error(phoneValidation.error)
            return
        }
        if (emailValidation.error) {
            toast.error(emailValidation.error)
            return
        }

        try {
            const draftSnapshot = {
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
                phone: normalizedSearchForm.phone || null,
                email: searchForm.email || null,
                company_name: searchForm.companyName || null,
                job_title: searchForm.jobTitle || null,
                department: searchForm.department || null,
                work_city: searchForm.workCity || null,
                work_phone: searchForm.workPhone || null,
                work_email: searchForm.workEmail || null,
                residence_country: searchForm.residenceCountry || null,
                previous_schengen_visa: searchForm.previousSchengenVisa,
                schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
                other_residence_permit: {
                    has_permit: searchForm.hasOtherResidencePermit,
                    country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : '',
                    number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : '',
                    expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : '',
                },
                timestamp: new Date().toISOString()
            }

            const { error } = await (supabase as any)
                .from('registrations')
                .update({
                    assigned_employee_id: assignedTo || null,
                    notes: appNotes || null,
                    client_snapshot: draftSnapshot,
                    current_step: 3,
                    updated_at: new Date().toISOString()
                })
                .eq('id', registrationId)

            if (error) throw error

            toast.success('تم حفظ المسودة بنجاح.')
            await loadRegistration(registrationId)
        } catch (e: any) {
            toast.error(e.message || 'فشل حفظ المسودة')
        }
    }

    async function applyChangeableUpdates(applyToProfile: boolean) {
        if (!registrationId || !client) return

        try {
            if (applyToProfile) {
                const updates: Record<string, any> = {}
                if ('phone' in changedFieldsToPrompt) updates.phone = normalizeLocalPhoneInput(String(changedFieldsToPrompt.phone || ''), phoneCountry) || null
                if ('email' in changedFieldsToPrompt) updates.email = changedFieldsToPrompt.email || null
                if ('companyName' in changedFieldsToPrompt) updates.employer_name = changedFieldsToPrompt.companyName || null
                if ('maritalStatus' in changedFieldsToPrompt) updates.marital_status = changedFieldsToPrompt.maritalStatus || null
                if ('salutation' in changedFieldsToPrompt) updates.title_salutation = changedFieldsToPrompt.salutation || null
                if ('gender' in changedFieldsToPrompt) updates.sex = changedFieldsToPrompt.gender || null
                if ('fullName' in changedFieldsToPrompt) updates.full_name_as_passport = changedFieldsToPrompt.fullName || null
                if ('surname' in changedFieldsToPrompt) updates.last_name = changedFieldsToPrompt.surname || null
                if ('passportNumber' in changedFieldsToPrompt) updates.passport_number = changedFieldsToPrompt.passportNumber || null
                if ('nationalId' in changedFieldsToPrompt) updates.national_id = changedFieldsToPrompt.nationalId || null
                if ('dateOfBirth' in changedFieldsToPrompt) updates.date_of_birth = changedFieldsToPrompt.dateOfBirth || null
                if ('placeOfBirth' in changedFieldsToPrompt) updates.place_of_birth = changedFieldsToPrompt.placeOfBirth || null
                if ('passportIssueDate' in changedFieldsToPrompt) updates.passport_issue_date = changedFieldsToPrompt.passportIssueDate || null
                if ('passportExpiryDate' in changedFieldsToPrompt) updates.passport_expiry_date = changedFieldsToPrompt.passportExpiryDate || null
                if ('jobTitle' in changedFieldsToPrompt) updates.job_title = changedFieldsToPrompt.jobTitle || null
                if ('department' in changedFieldsToPrompt) updates.department = changedFieldsToPrompt.department || null
                if ('workCity' in changedFieldsToPrompt) updates.work_city = changedFieldsToPrompt.workCity || null
                if ('workPhone' in changedFieldsToPrompt) updates.work_phone = changedFieldsToPrompt.workPhone || null
                if ('workEmail' in changedFieldsToPrompt) updates.work_email = changedFieldsToPrompt.workEmail || null
                if ('residenceCountry' in changedFieldsToPrompt) updates.residence_country = changedFieldsToPrompt.residenceCountry || null
                if ('previousSchengenVisa' in changedFieldsToPrompt) updates.previous_schengen_visa = Boolean(changedFieldsToPrompt.previousSchengenVisa)
                if ('previousSchengenVisas' in changedFieldsToPrompt) updates.schengen_visas_last_5y = changedFieldsToPrompt.previousSchengenVisas
                if ('residencePermit' in changedFieldsToPrompt) {
                    const permit = changedFieldsToPrompt.residencePermit
                    updates.other_residence_permit = {
                        has_permit: Boolean(permit.hasPermit),
                        country: permit.hasPermit ? permit.country : '',
                        number: permit.hasPermit ? permit.number : '',
                        expiry_date: permit.hasPermit ? permit.expiryDate : '',
                    }
                }

                const { error: profileErr } = await (supabase as any)
                    .from('clients')
                    .update(updates)
                    .eq('id', client.id)

                if (profileErr) throw profileErr
                toast.success('تم تحديث الملف الشخصي الرئيسي للعميل.')
            }

            // Save Snapshot again
            {
                const snapshot = {
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
                    phone: normalizedSearchForm.phone || null,
                    email: searchForm.email || null,
                    company_name: searchForm.companyName || null,
                    job_title: searchForm.jobTitle || null,
                    department: searchForm.department || null,
                    work_city: searchForm.workCity || null,
                    work_phone: searchForm.workPhone || null,
                    work_email: searchForm.workEmail || null,
                    residence_country: searchForm.residenceCountry || null,
                    previous_schengen_visa: searchForm.previousSchengenVisa,
                    schengen_visas_last_5y: searchForm.previousSchengenVisa ? searchForm.previousSchengenVisas : [],
                    other_residence_permit: {
                        has_permit: searchForm.hasOtherResidencePermit,
                        country: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceCountry : '',
                        number: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceNumber : '',
                        expiry_date: searchForm.hasOtherResidencePermit ? searchForm.otherResidenceExpiryDate : '',
                    },
                    timestamp: new Date().toISOString()
                }

                await (supabase as any)
                    .from('registrations')
                    .update({ client_snapshot: snapshot })
                    .eq('id', registrationId!)
            }

            // Save Wizard Intake
            const { error } = await (supabase as any)
                .from('registrations')
                .update({
                    assigned_employee_id: assignedTo || null,
                    notes: appNotes || null,
                    current_step: 4,
                    updated_at: new Date().toISOString()
                })
                .eq('id', registrationId!)

            if (error) throw error

            toast.success('تم حفظ تفاصيل الطلب بنجاح.')
            setShowUpdatePrompt(false)
            setStep(4)
            loadRegistration(registrationId)
        } catch (e: any) {
            toast.error(e.message || 'خطأ أثناء تطبيق التحديثات')
        }
    }

    // --- Step 1: Save Event Selection ---
    async function handleSaveEventDetails() {
        if (!selectedEventId) {
            toast.error('الرجاء اختيار فعالية أولاً')
            return
        }

        if (registrationId) {
            try {
                const ad = (registration?.additional_data as any) || {}
                const updatedAd = {
                    ...ad,
                    participation_type: participationType,
                    travel_purpose: travelPurpose
                }

                const { error } = await supabase
                    .from('registrations')
                    .update({
                        event_id: selectedEventId,
                        additional_data: updatedAd,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', registrationId!)

                if (error) throw error
                toast.success('تم تحديث بيانات الفعالية.')
                loadRegistration(registrationId)
            } catch (e: any) {
                toast.error(e.message || 'خطأ أثناء تحديث بيانات الفعالية')
                return
            }
        }

        setStep(2)
    }

    function handleVisaDestinationChange(country: string) {
        const route = VISA_ROUTES.find((item) => item.country === country)
        setVisaDestination(country)
        if (!route) return
        setVisaEmbassy(route.embassy)
        setVisaPlatform(route.portal)
        setVisaSubmissionMethod(route.submissionMethod)
        setVisaAppointmentCenter(route.center)
        setVisaAppointmentCity(route.city)
    }

    function playReminderSound() {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioContextClass) return
        const audioContext = new AudioContextClass()
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.22)
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55)
        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.6)
        oscillator.addEventListener('ended', () => audioContext.close())
    }

    async function requestReminderPermission() {
        playReminderSound()
        toast.success('تم تفعيل تنبيه الموعد داخل لوحة التحكم.')
    }

    function addVisaReminder() {
        if (!newReminderAt) {
            toast.error('اختر تاريخ ووقت التذكير أولاً.')
            return
        }
        if (new Date(newReminderAt).getTime() <= Date.now()) {
            toast.error('يجب أن يكون وقت التذكير في المستقبل.')
            return
        }
        setVisaReminders((current) => [...current, {
            id: crypto.randomUUID(),
            remindAt: newReminderAt,
            note: newReminderNote.trim() || 'Visa appointment reminder',
            sound: true,
        }].sort((a, b) => a.remindAt.localeCompare(b.remindAt)))
        setNewReminderAt('')
        setNewReminderNote('')
    }

    useEffect(() => {
        if (!registrationId || visaReminders.length === 0) return

        const checkReminders = async () => {
            const dueReminders = visaReminders.filter((reminder) => (
                !reminder.notifiedAt && new Date(reminder.remindAt).getTime() <= Date.now()
            ))
            if (dueReminders.length === 0) return

            for (const reminder of dueReminders) {
                const title = 'Visa appointment reminder'
                const appointmentLabel = [visaAppointmentDate, visaAppointmentTime].filter(Boolean).join(' ') || 'the scheduled time'
                const body = `${reminder.note}. Appointment: ${appointmentLabel} at ${visaAppointmentCenter || visaEmbassy}.`
                toast.warning(title, { description: body, duration: 15000 })
                if (reminder.sound) playReminderSound()
                if (currentUser?.id) {
                    await supabase.from('notifications').insert({
                        user_id: currentUser.id,
                        type: 'visa_appointment_reminder',
                        title,
                        body,
                        link_url: `/dashboard/participation-cases/work/new-registration?id=${registrationId}&step=4`,
                    })
                }
            }

            const notifiedIds = new Set(dueReminders.map((reminder) => reminder.id))
            const notifiedAt = new Date().toISOString()
            const updatedReminders = visaReminders.map((reminder) => (
                notifiedIds.has(reminder.id) ? { ...reminder, notifiedAt } : reminder
            ))
            setVisaReminders(updatedReminders)
            const ad = (registration?.additional_data as Record<string, unknown>) || {}
            await supabase.from('registrations').update({
                additional_data: { ...ad, visa_appointment_reminders: updatedReminders },
                updated_at: notifiedAt,
            }).eq('id', registrationId)
        }

        void checkReminders()
        // Reminders are intentionally checked every two minutes. The immediate
        // check keeps the UI responsive when the step opens without polling
        // Supabase aggressively while the wizard is idle.
        const intervalId = window.setInterval(() => void checkReminders(), 120000)
        return () => window.clearInterval(intervalId)
    }, [registrationId, visaReminders, visaAppointmentDate, visaAppointmentTime, visaAppointmentCenter, visaEmbassy, currentUser?.id, registration?.additional_data, supabase])

    // --- Step 4: Save Visa Platforms & Appointments ---
    async function handleSaveVisaDetails(advance = true, options?: { silent?: boolean }) {
        if (!registrationId) return false
        if (advance && !validateStepBeforeAdvance(4)) return false

        const missingFields = [
            !visaDestination && 'visa destination',
            !visaEmbassy.trim() && 'embassy or consulate',
            !visaType && 'visa type',
            !visaSubmissionMethod && 'submission method',
            !visaAppointmentCity.trim() && 'appointment city',
        ].filter(Boolean) as string[]
        if (advance && missingFields.length > 0) {
            toast.error(`Complete the required visa fields: ${missingFields.join(', ')}.`)
            return false
        }
        if (visaAppointmentDate && visaAppointmentTime) {
            const appointmentAt = new Date(`${visaAppointmentDate}T${visaAppointmentTime}`)
            if (Number.isNaN(appointmentAt.getTime())) {
                toast.error('Enter a valid appointment date and time.')
                return false
            }
            if (advance && appointmentAt.getTime() < Date.now() && visaAppointmentStatus !== 'Completed') {
                toast.error('The appointment date is in the past. Mark it completed or choose a future date.')
                return false
            }
        }
        if (advance && visaPortalAppStatus === 'Completed' && !visaAppRefNumber.trim()) {
            toast.error('Add the application reference number when the portal application is completed.')
            return false
        }

        try {
            const ad = (registration?.additional_data as any) || {}
            const updatedAd = {
                ...ad,
                visa_destination_country: visaDestination,
                visa_embassy: visaEmbassy,
                visa_type: visaType,
                visa_platform: visaPlatform,
                visa_submission_method: visaSubmissionMethod,
                visa_portal_email: visaPortalEmail,
                visa_portal_password: visaPortalPassword,
                visa_portal_status: visaAccountStatus,
                visa_app_ref_number: visaAppRefNumber,
                visa_portal_app_status: visaPortalAppStatus,
                visa_appointment_channel: visaAppointmentChannel,
                visa_appointment_center: visaAppointmentCenter,
                visa_appointment_city: visaAppointmentCity,
                visa_appointment_date: visaAppointmentDate,
                visa_appointment_time: visaAppointmentTime,
                visa_appointment_ref_number: visaAppointmentRefNumber,
                visa_appointment_status: visaAppointmentStatus,
                visa_appointment_reminders: visaReminders,
                visa_reminder_date: visaReminders[0]?.remindAt.split('T')[0] || null
            }

            const updatePayload = options?.silent
                ? { additional_data: updatedAd, updated_at: new Date().toISOString() }
                : {
                    additional_data: updatedAd,
                    case_status: 'visa_in_progress',
                    current_step: advance ? 5 : 4,
                    updated_at: new Date().toISOString(),
                }
            const { error } = await supabase
                .from('registrations')
                .update(updatePayload)
                .eq('id', registrationId!)

            if (error) throw error

            // Autosave should not create an activity row every time the user
            // pauses typing. Only an intentional step advance is meaningful
            // in the compact activity history.
            if (!options?.silent) {
                await recordRegistrationActivity({
                    registrationId,
                    action: 'visa_updated',
                    description: advance ? 'تم حفظ تفاصيل التأشيرة والانتقال إلى خطوة الوثائق' : 'تم حفظ تغييرات التأشيرة تلقائياً',
                    step: 4,
                    metadata: { destination: visaDestination, appointment_status: visaAppointmentStatus },
                })
            }

            if (!options?.silent) {
                toast.success('تم حفظ تفاصيل الفيزا وموعد السفارة بنجاح.')
                if (advance) setStep(5)
                loadRegistration(registrationId)
            }
            return true
        } catch (e: any) {
            if (!options?.silent) toast.error(e.message || 'خطأ أثناء الحفظ')
            return false
        }
    }

    const visaDraftSnapshot = useMemo(() => JSON.stringify({
        visaDestination, visaEmbassy, visaType, visaPlatform, visaSubmissionMethod,
        visaPortalEmail, visaPortalPassword, visaAccountStatus, visaAppRefNumber,
        visaPortalAppStatus, visaAppointmentChannel, visaAppointmentCenter,
        visaAppointmentCity, visaAppointmentDate, visaAppointmentTime,
        visaAppointmentRefNumber, visaAppointmentStatus, visaReminders,
    }), [visaDestination, visaEmbassy, visaType, visaPlatform, visaSubmissionMethod, visaPortalEmail, visaPortalPassword, visaAccountStatus, visaAppRefNumber, visaPortalAppStatus, visaAppointmentChannel, visaAppointmentCenter, visaAppointmentCity, visaAppointmentDate, visaAppointmentTime, visaAppointmentRefNumber, visaAppointmentStatus, visaReminders])

    useEffect(() => {
        if (step !== 4 || !registrationId || !registration) return
        if (visaAutosaveBaseline.current === null) {
            visaAutosaveBaseline.current = visaDraftSnapshot
            setVisaSaveState('saved')
            return
        }
        if (visaAutosaveBaseline.current === visaDraftSnapshot) return
        setVisaSaveState('dirty')
        if (visaAutosaveTimer.current) clearTimeout(visaAutosaveTimer.current)
        visaAutosaveTimer.current = setTimeout(async () => {
            setVisaSaveState('saving')
            const saved = await handleSaveVisaDetails(false, { silent: true })
            if (saved) {
                visaAutosaveBaseline.current = visaDraftSnapshot
                setVisaSaveState('saved')
            } else {
                setVisaSaveState('error')
                toast.error('تعذر حفظ التغييرات تلقائياً. ستتم إعادة المحاولة عند التعديل التالي.')
            }
        }, 2000)
        return () => {
            if (visaAutosaveTimer.current) clearTimeout(visaAutosaveTimer.current)
        }
    }, [step, registrationId, registration, visaDraftSnapshot])

    // Handle Visa Form & Appointment Confirmation uploads
    async function handleStep4FileUpload(e: React.ChangeEvent<HTMLInputElement>, label: string, docType: string) {
        const file = e.target.files?.[0]
        if (!file) return
        if (!registrationId) {
            toast.error('احفظ ملف العميل أولاً قبل رفع المستندات.')
            e.target.value = ''
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setUploadError(null)
        setUploadingDocumentType(docType)
        toast.loading(`جاري رفع ملف ${label}...`)
        try {
            const res = await uploadRegistrationDocument(registrationId, formData, docType, label)
            toast.dismiss()
            if (res.error) {
                setUploadError({ type: docType, message: res.error })
                toast.error(res.error)
            } else {
                setRegistration((prev: any) => {
                    if (!prev) return prev

                    const currentDocs = Array.isArray(prev.documents) ? prev.documents : []
                    const nextDoc = {
                        name: file.name,
                        path: res.url,
                        uploadedAt: new Date().toISOString(),
                        type: docType,
                    }

                    return {
                        ...prev,
                        documents: [
                            ...currentDocs.filter((doc: any) => doc?.type !== docType),
                            nextDoc,
                        ],
                    }
                })
                toast.success(`تم رفع ${label} بنجاح!`)
                await loadRegistration(registrationId)
            }
        } catch (error: any) {
            toast.dismiss()
            const message = error?.message || 'تعذر رفع الملف'
            setUploadError({ type: docType, message })
            toast.error(message)
        } finally {
            setUploadingDocumentType(null)
            e.target.value = ''
        }
    }

    // --- Step 5: Document Assembly & Package Index ---
    async function handleMergeFiles() {
        if (!registrationId) {
            toast.error('احفظ ملف العميل أولاً قبل إنشاء الحزمة.')
            return
        }
        const selectedDocuments = mergeableDocuments.filter((document) => packageDocumentPaths.includes(document.path))
        if (selectedDocuments.length === 0 && !includeClientInfoInPackage) {
            toast.error('اختر ملفاً واحداً على الأقل، أو فعّل إضافة معلومات العميل.')
            return
        }

        setIsPackageGenerating(true)
        toast.loading('جاري دمج الملفات في حزمة PDF واحدة...')
        try {
            // Client information is rendered first, then the selected source files are
            // appended as real pages in the same PDF package.
            const { jsPDF } = await import('jspdf')
            const { PDFDocument } = await import('pdf-lib')
            const pdf = new jsPDF()
            const generatedAt = new Date().toLocaleString('en-GB')
            const valueOrDash = (value: unknown) => {
                const normalized = String(value ?? '').trim()
                return normalized || '—'
            }
            const applicantDetails = [
                ['Full Name', searchForm.fullName || client?.full_name_as_passport],
                ['Surname', searchForm.surname || client?.last_name],
                ['Title / Salutation', searchForm.salutation || client?.title_salutation],
                ['Gender', searchForm.gender || client?.sex],
                ['Marital Status', searchForm.maritalStatus || client?.marital_status],
                ['Passport Number', searchForm.passportNumber || client?.passport_number],
                ['National ID', searchForm.nationalId || client?.national_id],
                ['Date of Birth', searchForm.dateOfBirth || client?.date_of_birth],
                ['Place of Birth', searchForm.placeOfBirth || client?.place_of_birth],
                ['Passport Date of Issue', searchForm.passportIssueDate || client?.passport_issue_date],
                ['Passport Date of Expiry', searchForm.passportExpiryDate || client?.passport_expiry_date],
                ['Phone Number', normalizedSearchForm.phone || client?.phone],
                ['Email Address', normalizedSearchForm.email || client?.email],
                ['Company Name', searchForm.companyName || client?.employer_name],
            ] as const

            pdf.setFontSize(18)
            pdf.text('JAZ Visa Document Package', 20, 22)
            pdf.setFontSize(10)
            pdf.text(`Application: ${caseNumber || 'Draft'}`, 20, 34)
            pdf.text(`Client: ${searchForm.fullName || client?.full_name_as_passport || 'Client'}`, 20, 41)
            pdf.text(`Destination: ${visaDestination}`, 20, 48)
            pdf.text(`Generated: ${generatedAt}`, 20, 55)
            pdf.line(20, 62, 190, 62)

            pdf.setFontSize(12)
            pdf.text('Applicant details', 20, 74)
            pdf.setDrawColor(220)
            let detailsY = 82
            applicantDetails.forEach(([label, value], index) => {
                const column = index % 2
                const x = column === 0 ? 20 : 108
                if (column === 0 && index > 0) detailsY += 18
                pdf.setFontSize(8)
                pdf.setTextColor(100)
                pdf.text(label, x, detailsY)
                pdf.setFontSize(10)
                pdf.setTextColor(25)
                const wrappedValue = pdf.splitTextToSize(valueOrDash(value), 78)
                pdf.text(wrappedValue.slice(0, 2), x, detailsY + 6)
                pdf.line(x, detailsY + 12, x + 78, detailsY + 12)
            })

            const detailsBottom = detailsY + 22
            pdf.setTextColor(25)
            pdf.setFontSize(12)
            pdf.text('Visa application details', 20, detailsBottom)
            const applicationDetails = [
                `Event: ${selectedEvent?.title_ar || selectedEvent?.title || '—'}`,
                `Participation type: ${participationType || '—'}`,
                `Travel purpose: ${travelPurpose || '—'}`,
                `Visa destination: ${visaDestination || '—'}`,
                `Embassy: ${visaEmbassy || '—'}`,
                `Visa type: ${visaType || '—'}`,
                `Submission method: ${visaSubmissionMethod || '—'}`,
                `Appointment: ${[visaAppointmentDate, visaAppointmentTime].filter(Boolean).join(' ') || '—'}`,
                `Appointment reference: ${visaAppointmentRefNumber || '—'}`,
            ]
            pdf.setFontSize(9)
            let applicationY = detailsBottom + 9
            applicationDetails.forEach((line) => {
                const wrappedLine = pdf.splitTextToSize(line, 166)
                pdf.text(wrappedLine, 24, applicationY)
                applicationY += wrappedLine.length * 5 + 2
            })

            pdf.addPage()
            pdf.setFontSize(15)
            pdf.text('Documents included in this JAZ file', 20, 22)
            pdf.setFontSize(9)
            pdf.text(`Application: ${caseNumber || 'Draft'}  |  Total files: ${selectedDocuments.length}`, 20, 31)
            pdf.line(20, 37, 190, 37)
            let documentsY = 48
            selectedDocuments.forEach((document, index) => {
                const documentLine = `${index + 1}. ${document.name} (${document.type})`
                const wrappedLine = pdf.splitTextToSize(documentLine, 160)
                const requiredHeight = wrappedLine.length * 6 + 4
                if (documentsY + requiredHeight > 278) {
                    pdf.addPage()
                    pdf.setFontSize(12)
                    pdf.text('Documents included — continued', 20, 22)
                    pdf.line(20, 28, 190, 28)
                    documentsY = 40
                    pdf.setFontSize(9)
                }
                pdf.text(wrappedLine, 24, documentsY)
                documentsY += requiredHeight
            })
            pdf.setFontSize(8)
            pdf.text('The original documents remain available from the application record.', 20, 288)

            const mergedPdf = await PDFDocument.create()
            if (includeClientInfoInPackage) {
                const infoPdf = await PDFDocument.load(pdf.output('arraybuffer'))
                const infoPages = await mergedPdf.copyPages(infoPdf, infoPdf.getPageIndices())
                infoPages.forEach((page) => mergedPdf.addPage(page))
            }

            for (const document of selectedDocuments) {
                const response = await fetch(document.path)
                if (!response.ok) throw new Error(`تعذر تحميل الملف: ${document.name}`)
                const bytes = new Uint8Array(await response.arrayBuffer())
                const contentType = response.headers.get('content-type')?.toLowerCase() || ''
                const lowerName = document.name.toLowerCase()

                if (contentType.includes('pdf') || lowerName.endsWith('.pdf')) {
                    const sourcePdf = await PDFDocument.load(bytes)
                    const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
                    pages.forEach((page) => mergedPdf.addPage(page))
                } else if (contentType.includes('png') || lowerName.endsWith('.png')) {
                    const image = await mergedPdf.embedPng(bytes)
                    const page = mergedPdf.addPage([595.28, 841.89])
                    const scale = Math.min(555.28 / image.width, 801.89 / image.height)
                    page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale })
                } else if (contentType.includes('jpeg') || contentType.includes('jpg') || /\.(jpe?g)$/i.test(lowerName)) {
                    const image = await mergedPdf.embedJpg(bytes)
                    const page = mergedPdf.addPage([595.28, 841.89])
                    const scale = Math.min(555.28 / image.width, 801.89 / image.height)
                    page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale })
                } else {
                    throw new Error(`صيغة الملف غير مدعومة للدمج: ${document.name}. استخدم PDF أو PNG أو JPG.`)
                }
            }

            const mergedBytes = await mergedPdf.save()
            const requestedName = packageName.trim() || `${(client?.full_name_as_passport || 'Client').replace(/\s+/g, '_')}_Visa_Package.pdf`
            const fileName = requestedName.toLowerCase().endsWith('.pdf') ? requestedName : `${requestedName}.pdf`
            const formData = new FormData()
            formData.append('file', new File([new Blob([mergedBytes as BlobPart], { type: 'application/pdf' })], fileName, { type: 'application/pdf' }))
            const upload = await uploadRegistrationDocument(registrationId, formData, 'merged_package', fileName)
            if (upload.error) throw new Error(upload.error)

            const ad = (registration?.additional_data as any) || {}
            const updatedAd = {
                ...ad,
                package_assembly_order: 'Selected file order',
                package_assembly_format: 'PDF',
                package_assembly_name: fileName,
                package_ready_to_merge: true,
                package_include_client_info: includeClientInfoInPackage,
                package_selected_document_paths: selectedDocuments.map((document) => document.path),
                package_merged_file_url: upload.url || '',
            }

            const { error } = await supabase
                .from('registrations')
                .update({
                    additional_data: updatedAd,
                    case_status: 'final_qc',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', registrationId)

            if (error) throw error
            toast.dismiss()
            toast.success('تم إنشاء ملف PDF للحزمة وحفظه داخل الطلب.')
            await loadRegistration(registrationId)
        } catch (error: any) {
            toast.dismiss()
            toast.error(error?.message || 'تعذر إنشاء ملف الحزمة')
        } finally {
            setIsPackageGenerating(false)
        }
    }

    // --- Step 6: Fee Calculation & Receipt Issue ---
    const totalAmount = useMemo(() => {
        return Object.values(fees).reduce((acc, val) => acc + val, 0)
    }, [fees])

    const balanceDue = useMemo(() => {
        return totalAmount - amountPaid
    }, [totalAmount, amountPaid])

    async function handleGenerateReceipt() {
        if (!registrationId) return
        toast.loading('جاري توليد الوصل المالي للعميل...')
        try {
            const { jsPDF } = await import('jspdf')
            const receiptId = `RCPT-${new Date().getFullYear()}-${caseNumber.split('-').pop() || '00124'}`
            const pdf = new jsPDF()
            pdf.setFontSize(18)
            pdf.text('JAZ Payment Receipt', 20, 22)
            pdf.setFontSize(10)
            pdf.text(`Receipt: ${receiptId}`, 20, 36)
            pdf.text(`Application: ${caseNumber || 'Draft'}`, 20, 43)
            pdf.text(`Client: ${client?.full_name_as_passport || searchForm.fullName || 'Client'}`, 20, 50)
            pdf.text(`Payment method: ${paymentMethod}`, 20, 57)
            pdf.text(`Payment date: ${paymentDate}`, 20, 64)
            pdf.line(20, 72, 190, 72)
            pdf.setFontSize(11)
            pdf.text('Total amount', 24, 86)
            pdf.text(`EUR ${totalAmount.toFixed(2)}`, 150, 86)
            pdf.text('Amount paid', 24, 96)
            pdf.text(`EUR ${amountPaid.toFixed(2)}`, 150, 96)
            pdf.text('Balance due', 24, 106)
            pdf.text(`EUR ${balanceDue.toFixed(2)}`, 150, 106)
            pdf.setFontSize(8)
            pdf.text('Generated by JAZ Applications Control', 20, 286)

            const fileName = `Payment_Receipt_${caseNumber || registrationId}.pdf`
            const formData = new FormData()
            formData.append('file', new File([pdf.output('blob')], fileName, { type: 'application/pdf' }))
            const upload = await uploadRegistrationDocument(registrationId, formData, 'receipt', fileName)
            if (upload.error) throw new Error(upload.error)
            const receiptUrl = upload.url || ''

            const ad = (registration?.additional_data as any) || {}
            const updatedAd = {
                ...ad,
                payment_category: paymentCategory,
                payment_method: paymentMethod,
                payment_date: paymentDate,
                payment_notes: paymentNotes,
                ...(canEditFeeBreakdown ? { fee_breakdown: fees } : {}),
                amount_paid: amountPaid,
                balance_due: balanceDue,
                receipt_number: receiptId,
                receipt_pdf_url: receiptUrl,
                receipt_issue_date: new Date().toISOString(),
            }

            const { error } = await supabase
                .from('registrations')
                .update({
                    payment_status: balanceDue <= 0 ? 'paid' : 'partially_paid',
                    total_amount: totalAmount,
                    additional_data: updatedAd,
                    case_status: 'ready_for_next_stage',
                    current_step: 6,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', registrationId)

            if (error) throw error

            toast.dismiss()
            toast.success('تم إصدار الوصل وحفظه داخل الطلب.')
            await loadRegistration(registrationId)
        } catch (error: any) {
            toast.dismiss()
            toast.error(error?.message || 'خطأ في توليد الوصل المالي')
        }
    }

    function getStoredReceipt() {
        return normalizeRegistrationDocuments(registration?.documents).find((document) => document.type === 'receipt')
    }

    async function handlePrintReceipt() {
        const receipt = getStoredReceipt()
        if (!receipt?.path) {
            toast.error('أنشئ الوصل أولاً قبل الطباعة.')
            return
        }

        const printFrame = document.createElement('iframe')
        printFrame.style.position = 'fixed'
        printFrame.style.right = '0'
        printFrame.style.bottom = '0'
        printFrame.style.width = '0'
        printFrame.style.height = '0'
        printFrame.style.border = '0'
        printFrame.src = receipt.path
        printFrame.onload = () => {
            window.setTimeout(() => {
                try {
                    printFrame.contentWindow?.focus()
                    printFrame.contentWindow?.print()
                } catch {
                    window.open(receipt.path, '_blank', 'noopener,noreferrer')
                }
                window.setTimeout(() => printFrame.remove(), 1000)
            }, 300)
        }
        document.body.appendChild(printFrame)
        toast.success('تم فتح نافذة طباعة الوصل.')
    }

    async function handleDownloadReceipt() {
        const receipt = getStoredReceipt()
        if (!receipt?.path) {
            toast.error('أنشئ الوصل أولاً قبل التنزيل.')
            return
        }

        try {
            const response = await fetch(receipt.path)
            if (!response.ok) throw new Error('تعذر تحميل ملف الوصل.')
            const objectUrl = URL.createObjectURL(await response.blob())
            const link = document.createElement('a')
            link.href = objectUrl
            link.download = receipt.name || `Payment_Receipt_${caseNumber}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(objectUrl)
            toast.success('تم تنزيل الوصل.')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'تعذر تنزيل الوصل.')
        }
    }

    async function handleSavePaymentDraft() {
        if (!registrationId) return
        try {
            const ad = (registration?.additional_data as Record<string, unknown>) || {}
            const { error } = await supabase.from('registrations').update({
                total_amount: totalAmount,
                additional_data: {
                    ...ad,
                    payment_category: paymentCategory,
                    payment_method: paymentMethod,
                    payment_date: paymentDate,
                    payment_notes: paymentNotes,
                    ...(canEditFeeBreakdown ? { fee_breakdown: fees } : {}),
                    amount_paid: amountPaid,
                    balance_due: balanceDue,
                },
                current_step: 6,
                updated_at: new Date().toISOString(),
            }).eq('id', registrationId)
            if (error) throw error
            await recordRegistrationActivity({
                registrationId,
                action: 'payment_updated',
                description: 'تم حفظ مسودة بيانات الدفع',
                step: 6,
                metadata: { payment_status: registration?.payment_status, amount_paid: amountPaid },
            })
            toast.success('تم حفظ مسودة الدفع.')
            await loadRegistration(registrationId)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'تعذر حفظ مسودة الدفع.')
        }
    }

    async function handleArchiveReceipt() {
        if (!registrationId) return
        const receipt = getStoredReceipt()
        if (!receipt?.path) {
            toast.error('أنشئ الوصل أولاً قبل الأرشفة.')
            return
        }

        try {
            const archivedAt = new Date().toISOString()
            const ad = (registration?.additional_data as Record<string, unknown>) || {}
            const { error } = await supabase.from('registrations').update({
                additional_data: {
                    ...ad,
                    receipt_archived_at: archivedAt,
                    receipt_archived_by: currentUser?.id || null,
                },
                current_step: 6,
                updated_at: archivedAt,
            }).eq('id', registrationId)
            if (error) throw error
            toast.success('تمت أرشفة الوصل داخل الطلب.')
            await loadRegistration(registrationId)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'تعذر أرشفة الوصل.')
        }
    }

    function openWhatsApp() {
        const rawPhone = String(client?.phone || searchForm.phone || '')
        let phone = rawPhone.replace(/\D/g, '')
        if (phone.startsWith('0')) phone = `964${phone.slice(1)}`
        if (phone.length < 8) {
            toast.error('أضف رقم واتساب صالحاً لفتح المحادثة.')
            return
        }
        const selectedFiles = registrationDocuments
            .filter((document) => deliveryDocumentPaths.includes(document.path))
            .map((document) => {
                const link = /^https?:\/\//i.test(document.path) ? document.path : `${window.location.origin}${document.path}`
                return `• ${document.name}: ${link}`
            })
            .join('\n')
        const message = deliveryMessage.trim() || `مرحباً ${client?.full_name_as_passport || searchForm.fullName || ''}، تم تجهيز ملفات طلب الفيزا ${caseNumber}.\n\n${selectedFiles}`
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }

    // Check Event host details
    const selectedEvent = useMemo(() => {
        return events.find(e => e.id === selectedEventId)
    }, [events, selectedEventId])

    const phoneValidation = useMemo(
        () => getPhoneValidation(searchForm.phone, phoneCountry),
        [searchForm.phone, phoneCountry],
    )

    const emailValidation = useMemo(
        () => getEmailValidation(searchForm.email),
        [searchForm.email],
    )

    const normalizedSearchForm = useMemo(
        () => ({
            ...searchForm,
            phone: phoneValidation.normalized || searchForm.phone,
            email: emailValidation.normalized || searchForm.email,
        }),
        [searchForm, phoneValidation.normalized, emailValidation.normalized],
    )

    const registrationDocuments = useMemo(
        () => normalizeRegistrationDocuments(registration?.documents),
        [registration?.documents],
    )

    const packageDocument = useMemo(
        () => registrationDocuments.find((document) => document.type === 'merged_package'),
        [registrationDocuments],
    )

    const mergeableDocuments = useMemo(
        () => registrationDocuments.filter((document) => document.type !== 'merged_package'),
        [registrationDocuments],
    )

    useEffect(() => {
        setPackageDocumentPaths((current) => {
            const availablePaths = new Set(mergeableDocuments.map((document) => document.path))
            if (current.length === 0) return mergeableDocuments.map((document) => document.path)
            return current.filter((path) => availablePaths.has(path))
        })
    }, [mergeableDocuments])

    const requiredVisaDocuments = useMemo(
        () => VISA_DOCUMENTS.filter((document) => document.required),
        [],
    )

    function findDocument(definition: VisaDocumentDefinition) {
        return registrationDocuments.find((document) => definition.aliases.includes(document.type))
    }

    function validateStepBeforeAdvance(targetStep: number) {
        if (targetStep === 3 || targetStep === 4) {
            if (!searchForm.passportNumber || !passportNumberIsValid) {
                toast.error('Enter a valid passport number before continuing.')
                return false
            }
            const issue = searchForm.passportIssueDate ? new Date(searchForm.passportIssueDate) : null
            const expiry = searchForm.passportExpiryDate ? new Date(searchForm.passportExpiryDate) : null
            const today = new Date(); today.setHours(0, 0, 0, 0)
            if (!issue || !expiry || Number.isNaN(issue.getTime()) || Number.isNaN(expiry.getTime())) {
                toast.error('Add both passport issue and expiry dates before continuing.')
                return false
            }
            if (expiry <= issue) {
                toast.error('Passport expiry date must be after the issue date.')
                return false
            }
            if (expiry < today) {
                toast.error('This passport has expired. Update the passport details before continuing.')
                return false
            }
        }
        if (targetStep === 6 && !packageDocument) {
            toast.error('Upload the required documents and create the package PDF before continuing.')
            return false
        }
        if (targetStep === 7 && amountPaid > totalAmount) {
            toast.error('The paid amount cannot be greater than the total amount.')
            return false
        }
        return true
    }

    const inviterConfig = useMemo(() => {
        return selectedEvent?.registration_config?.inviter || {
            host_org: 'Comexposium',
            host_address: '70 Avenue du Général de Gaulle, Paris, France',
            host_contact_name: 'Jean Dupont',
            host_contact_phone: '+33 1 76 77 11 11',
            host_contact_email: 'jean.dupont@comexposium.com',
            host_contact_position: 'International Relations Manager'
        }
    }, [selectedEvent])

    // --- Render Helpers ---
    const breadcrumbLabel = useMemo(() => {
        switch (step) {
            case 1: return 'Select Event'
            case 2: return 'Select Event > Search Client'
            case 3: return 'Select Event > Search Client > New Application'
            case 4: return 'Select Event > Search Client > New Application > Visa Application & Appointment'
            case 5: return 'Select Event > Search Client > New Application > Visa Application & Appointment > Document Assembly & Archiving'
            case 6: return 'Select Event > Search Client > New Application > Visa Application & Appointment > Document Assembly & Archiving > Payment & Receipt'
            case 7: return 'Select Event > Search Client > New Application > Visa Application & Appointment > Document Assembly & Archiving > Payment & Receipt > Client File Delivery & Status'
            default: return 'Select Event'
        }
    }, [step])

    const assignedEmployee = employees.find((employee) => employee.id === assignedTo)
    const latestActivity = Array.isArray(registration?.registration_events)
        ? [...registration.registration_events].sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))[0]
        : null
    const summaryAd = (registration?.additional_data as Record<string, any>) || {}
    const summaryAppointment = summaryAd.visa_appointment_date
        ? `${summaryAd.visa_appointment_date}${summaryAd.visa_appointment_time ? ` ${summaryAd.visa_appointment_time}` : ''}`
        : ''
    const summaryStatus = registration?.case_status === 'completed'
        ? 'Completed'
        : registration?.case_status === 'ready_for_next_stage'
            ? 'Ready'
            : registration ? 'In progress' : 'Draft'
    const missingSummaryDocuments = requiredVisaDocuments.filter((definition) => !findDocument(definition)).length
    const stepStatus = {
        1: selectedEvent ? 'complete' : 'warning',
        2: client ? 'complete' : 'warning',
        3: registration && client ? 'complete' : 'warning',
        4: visaDestination && visaEmbassy.trim() && visaType && visaSubmissionMethod && visaAppointmentCity.trim() ? 'complete' : 'warning',
        5: missingSummaryDocuments === 0 && !!packageDocument ? 'complete' : 'warning',
        6: amountPaid >= totalAmount ? 'complete' : 'warning',
        7: deliveryStatus === 'sent' ? 'complete' : 'warning',
    } as const

    return (
        <div className="jaz-apps-dashboard mx-auto max-w-7xl space-y-4 pb-10" dir="ltr">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 gap-4" aria-label={breadcrumbLabel}>
                <div className="min-w-0">
                    <div className="mb-1 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        Step {step} of 7
                    </div>
                    <h1 className="text-xl sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                        {step === 1 && 'Select Event'}
                        {step === 2 && 'Client Search & Create Profile'}
                        {step === 3 && 'New Application'}
                        {step === 4 && 'Visa Application & Appointment'}
                        {step === 5 && 'Document Assembly & Archiving'}
                        {step === 6 && 'Payment & Receipt'}
                        {step === 7 && 'Client File Delivery & Status'}
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                        {REGISTRATION_STEPS[step - 1]?.description}. Complete the required information before continuing.
                    </p>
                </div>
                {onClose ? (
                    <button onClick={onClose} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors duration-150">
                        <span className="hidden sm:inline">Close</span>
                        <X className="size-4 sm:hidden" />
                    </button>
                ) : (
                    step === 1 && (
                        <button onClick={() => router.push('/dashboard/home')} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors duration-150">
                            Dashboard
                        </button>
                    )
                )}
            </div>

            {registrationId && registration && (
                <ApplicationSummary
                  clientName={client?.full_name_as_passport || searchForm.fullName}
                  caseNumber={caseNumber}
                  registrationId={registrationId}
                    assignee={assignedEmployee?.full_name || assignedEmployee?.email || ''}
                    status={summaryStatus}
                    lastEditor={latestActivity?.performed_by_name || '—'}
                    nextAppointment={summaryAppointment}
                    missingDocuments={missingSummaryDocuments}
                />
            )}

            <RegistrationProgress activeStep={step} canOpenAll={Boolean(registrationId)} stepStatus={stepStatus} onStepChange={setStep} />

            {/* Step 2: Client Search & Match Screen */}
            {step === 2 && (
                <div className="w-full animate-in fade-in duration-300">
                    <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                            <Search className="size-4 text-[#8B0000]" />
                            <h2 className="text-base font-bold text-slate-800">Search for existing client</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Title / Salutation</label>
                                <Select value={searchForm.salutation} onValueChange={value => setSearchForm(prev => ({ ...prev, salutation: value }))}>
                                    <SelectTrigger><SelectValue placeholder="Select salutation" /></SelectTrigger>
                                    <SelectContent>
                                        {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Other'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Full Name</label>
                                <Input
                                    value={searchForm.fullName}
                                    onChange={e => {
                                        const normalizedValue = e.target.value.toUpperCase().replace(/[^A-Z\s'.-]/g, '').replace(/\s{2,}/g, ' ')
                                        setSearchForm(prev => ({ ...prev, fullName: normalizedValue }))
                                    }}
                                    placeholder="Enter full name"
                                    aria-describedby="full-name-help"
                                    aria-invalid={!fullNameIsValid}
                                    maxLength={100}
                                    title="Use letters only. Spaces, apostrophes, dots, and hyphens are allowed."
                                    className={cn(
                                        'border-slate-200',
                                        !fullNameIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                    )}
                                />
                                <span
                                    id="full-name-help"
                                    className={cn(
                                        'text-[10px] block mt-0.5',
                                        fullNameIsValid ? 'text-slate-400' : 'text-red-500'
                                    )}
                                >
                                    {fullNameIsValid ? 'Uppercase English letters only. Spaces, apostrophes, dots, and hyphens are allowed' : 'Full name accepts uppercase English letters only with spaces, apostrophes, dots, or hyphens'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Surname</label>
                                <Input
                                    value={searchForm.surname}
                                    onChange={e => {
                                        const normalizedValue = e.target.value.toUpperCase().replace(/[^A-Z\s'.-]/g, '').replace(/\s{2,}/g, ' ')
                                        setSearchForm(prev => ({ ...prev, surname: normalizedValue }))
                                    }}
                                    placeholder="Enter surname"
                                    aria-describedby="surname-help"
                                    aria-invalid={!surnameIsValid}
                                    maxLength={60}
                                    title="Use letters only. Spaces, apostrophes, dots, and hyphens are allowed."
                                    className={cn(
                                        'border-slate-200',
                                        !surnameIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                    )}
                                />
                                <span
                                    id="surname-help"
                                    className={cn(
                                        'text-[10px] block mt-0.5',
                                        surnameIsValid ? 'text-slate-400' : 'text-red-500'
                                    )}
                                >
                                    {surnameIsValid ? 'Uppercase English letters only. Spaces, apostrophes, dots, and hyphens are allowed' : 'Surname accepts uppercase English letters only with spaces, apostrophes, dots, or hyphens'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Gender</label>
                                <Select value={searchForm.gender} onValueChange={value => setSearchForm(prev => ({ ...prev, gender: value }))}>
                                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Passport Number</label>
                                <Input
                                    value={searchForm.passportNumber}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                                        const normalizedValue = rawValue
                                            ? `${rawValue[0].replace(/[^A-Z]/g, '')}${rawValue.slice(1).replace(/[^0-9]/g, '')}`.slice(0, 9)
                                            : ''
                                        setSearchForm(prev => ({ ...prev, passportNumber: normalizedValue }))
                                    }}
                                    placeholder="e.g. A12345678"
                                    aria-describedby="passport-number-help"
                                    aria-invalid={!passportNumberIsValid}
                                    maxLength={9}
                                    pattern="[A-Za-z][0-9]{7,8}"
                                    title="Use 1 English letter followed by 7 or 8 digits"
                                    className={cn(
                                        'border-slate-200 font-mono',
                                        !passportNumberIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                    )}
                                />
                                <span
                                    id="passport-number-help"
                                    className={cn(
                                        'text-[10px] block mt-0.5',
                                        passportNumberIsValid ? 'text-slate-400' : 'text-red-500'
                                    )}
                                >
                                    {passportNumberIsValid ? 'Format: 1 letter + 7-8 digits' : 'Passport must start with 1 English letter, then 7-8 digits'}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">National ID</label>
                                <Input
                                    value={searchForm.nationalId}
                                    onChange={(e) => {
                                        const normalizedValue = e.target.value.replace(/\D/g, '').slice(0, 12)
                                        setSearchForm(prev => ({ ...prev, nationalId: normalizedValue }))
                                    }}
                                    placeholder="Enter 12-digit national ID"
                                    aria-describedby="national-id-help"
                                    aria-invalid={!nationalIdIsValid}
                                    inputMode="numeric"
                                    maxLength={12}
                                    pattern="[0-9]{12}"
                                    title="Enter exactly 12 digits"
                                    className={cn(
                                        'border-slate-200 font-mono',
                                        !nationalIdIsValid && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                    )}
                                />
                                <span
                                    id="national-id-help"
                                    className={cn(
                                        'text-[10px] block mt-0.5',
                                        nationalIdIsValid ? 'text-slate-400' : 'text-red-500'
                                    )}
                                >
                                    {nationalIdIsValid ? 'Must contain exactly 12 digits' : 'National ID must contain exactly 12 digits'}
                                </span>
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                                <PhoneNumberField
                                    value={searchForm.phone}
                                    country={phoneCountry}
                                    error={phoneValidation.error}
                                    onCountryChange={setPhoneCountry}
                                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, phone: value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Email Address</label>
                                <EmailField
                                    value={searchForm.email}
                                    error={emailValidation.error}
                                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, email: value }))}
                                    placeholder="ahmed.ali@example.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Company Name</label>
                                <Input
                                    value={searchForm.companyName}
                                    onChange={e => setSearchForm(prev => ({ ...prev, companyName: e.target.value }))}
                                    placeholder="Enter company name"
                                    className="border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Date of Birth</label>
                                <Input
                                    type="date"
                                    value={searchForm.dateOfBirth}
                                    onChange={e => setSearchForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                    className="border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Place of Birth Country</label>
                                <SearchableChoice
                                    value={searchForm.placeOfBirthCountry}
                                    placeholder="Select country"
                                    items={placeOfBirthCountries.map(country => ({ value: country.code, label: country.label }))}
                                    onSelect={value => setSearchForm(prev => ({
                                        ...prev,
                                        placeOfBirthCountry: value,
                                        placeOfBirthCity: '',
                                        placeOfBirth: value && prev.placeOfBirthCity
                                            ? `${placeOfBirthCountries.find(country => country.code === value)?.label || value}, ${prev.placeOfBirthCity}`
                                            : placeOfBirthCountries.find(country => country.code === value)?.label || value,
                                    }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Place of Birth City</label>
                                <SearchableChoice
                                    value={searchForm.placeOfBirthCity}
                                    placeholder="Select city"
                                    disabled={!searchForm.placeOfBirthCountry}
                                    items={(placeOfBirthCitiesByCountry[searchForm.placeOfBirthCountry] || []).map(city => ({ value: city, label: city }))}
                                    onSelect={value => setSearchForm(prev => ({
                                        ...prev,
                                        placeOfBirthCity: value,
                                        placeOfBirth: prev.placeOfBirthCountry
                                            ? `${placeOfBirthCountries.find(country => country.code === prev.placeOfBirthCountry)?.label || prev.placeOfBirthCountry}, ${value}`
                                            : value,
                                    }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Passport Issue Date</label>
                                <Input
                                    type="date"
                                    value={searchForm.passportIssueDate}
                                    onChange={e => setSearchForm(prev => ({ ...prev, passportIssueDate: e.target.value }))}
                                    className="border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Passport Expiry Date</label>
                                <Input
                                    type="date"
                                    value={searchForm.passportExpiryDate}
                                    onChange={e => setSearchForm(prev => ({ ...prev, passportExpiryDate: e.target.value }))}
                                    className="border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchForm({
                                            fullName: '',
                                            surname: '',
                                            salutation: '',
                                            gender: '',
                                            maritalStatus: '',
                                            passportNumber: '',
                                            nationalId: '',
                                            phone: '',
                                            email: '',
                                            companyName: '',
                                            dateOfBirth: '',
                                            placeOfBirthCountry: '',
                                            placeOfBirthCity: '',
                                            placeOfBirth: '',
                                            passportIssueDate: '',
                                            passportExpiryDate: '',
                                            jobTitle: '',
                                            department: '',
                                            workCity: '',
                                            workPhone: '',
                                            workEmail: '',
                                            residenceCountry: 'Iraq',
                                            previousSchengenVisa: false,
                                            previousSchengenVisas: [],
                                            hasOtherResidencePermit: false,
                                            otherResidenceCountry: '',
                                            otherResidenceNumber: '',
                                            otherResidenceExpiryDate: '',
                                        })
                                        setSearchResults([])
                                        setHasSearched(false)
                                        setSelectedPotentialMatch(null)
                                    }}
                                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleSearch}
                                    disabled={isPending}
                                    className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Search
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Search Results section with matching items */}
                    {hasSearched && (
                        <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-bold text-slate-800">
                                    Search Results
                                    <span className="text-xs text-slate-400 font-semibold ml-2">
                                        ({searchResults.length} match(es) found)
                                    </span>
                                </h3>
                                <Button variant="ghost" size="sm" onClick={handleSearch} className="text-xs text-slate-500 gap-1">
                                    <RefreshCw className="w-3 h-3" /> Refresh
                                </Button>
                            </div>

                            {searchResults.length === 0 ? (
                                <Card className="border-slate-200 border-dashed p-10 text-center">
                                    <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                                    <h4 className="font-bold text-slate-700">No matching client found?</h4>
                                    <p className="text-xs text-slate-500 mt-1 mb-4">You can create a new client profile and proceed with registration.</p>
                                    <Button onClick={handleCreateNewClient} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5 shadow-sm">
                                        <Plus className="w-4 h-4" /> Create New Client
                                    </Button>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    <Card className="border-[#8B0000]/15 bg-gradient-to-r from-[#8B0000]/[0.03] via-white to-white shadow-sm">
                                        <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold text-slate-800">Want to create another application anyway?</div>
                                                <p className="text-xs text-slate-500">
                                                    If these matches are not the right person, you can ignore them and create a brand new client profile directly.
                                                </p>
                                            </div>
                                            <Button onClick={handleCreateNewClient} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5 shadow-sm">
                                                <Plus className="w-4 h-4" /> Create New Client
                                            </Button>
                                        </div>
                                    </Card>

                                    {searchResults.map((match, index) => {
                                        const c = match.client
                                        const isSelected = selectedPotentialMatch?.client.id === c.id

                                        // Comparisons badges logic
                                        const pMatch = searchForm.passportNumber && c.passport_number && searchForm.passportNumber.trim() !== c.passport_number.trim()
                                        const nIdMatch = searchForm.nationalId && c.national_id && searchForm.nationalId.trim() === c.national_id.trim()
                                        const dobMatch = searchForm.dateOfBirth && c.date_of_birth && searchForm.dateOfBirth === c.date_of_birth
                                        const companyMatch = searchForm.companyName && c.employer_name && searchForm.companyName.trim().toLowerCase() === c.employer_name.trim().toLowerCase()

                                        return (
                                            <Card
                                                key={c.id}
                                                className={`border transition-all duration-300 cursor-pointer ${
                                                    isSelected ? 'border-[#8B0000] ring-2 ring-[#8B0000]/10 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'
                                                }`}
                                                onClick={() => setSelectedPotentialMatch(match)}
                                            >
                                                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                                                            {(c.full_name_as_passport || 'C').slice(0,2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-800">{c.full_name_as_passport}</h4>
                                                                <Badge className={
                                                                    match.matchType === 'Exact Match' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                    match.matchType === 'Strong Match' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    'bg-amber-100 text-amber-800 border-amber-200'
                                                                }>
                                                                    {match.matchType} — {match.score}%
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1 space-x-2">
                                                                <span>{c.title_salutation || 'Mr.'}</span>
                                                                <span>•</span>
                                                                <span>{c.employer_name || 'Al Noor Trading Co.'}</span>
                                                                <span>•</span>
                                                                <span>{c.email || 'ahmed.ali@example.com'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-xs md:text-center">
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Passport</span>
                                                            <span className="font-semibold font-mono text-slate-700">{c.passport_number || '—'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className={pMatch ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-emerald-200 text-emerald-700 bg-emerald-50'}>
                                                                    {pMatch ? 'Different' : 'Match'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">National ID</span>
                                                            <span className="font-semibold font-mono text-slate-700">{c.national_id || '—'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className={nIdMatch ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-400 bg-slate-50'}>
                                                                    {nIdMatch ? 'Match' : '—'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Date of Birth</span>
                                                            <span className="font-semibold text-slate-700">{c.date_of_birth || '—'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className={dobMatch ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-400 bg-slate-50'}>
                                                                    {dobMatch ? 'Match' : '—'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Company</span>
                                                            <span className="font-semibold text-slate-700 truncate block max-w-[110px]">{c.employer_name || '—'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className={companyMatch ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-400 bg-slate-50'}>
                                                                    {companyMatch ? 'Match' : '—'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Phone</span>
                                                            <span className="font-semibold text-slate-700 truncate block max-w-[100px]">{c.phone || '—'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Match</Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Gender</span>
                                                            <span className="font-semibold text-slate-700">{c.sex || 'Male'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Match</Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-medium">Marital Status</span>
                                                            <span className="font-semibold text-slate-700">{c.marital_status || 'Married'}</span>
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Match</Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toast.info('جاري فتح ملف العميل للمعاينة...') }} className="border-slate-200 text-slate-600 gap-1 text-xs">
                                                            <Eye className="w-3.5 h-3.5" /> View Profile
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Potential Match Details & Differences Table */}
                            {selectedPotentialMatch && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-6 border-t border-slate-100">
                                    <div className="lg:col-span-6 space-y-4">
                                        <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-5 space-y-4">
                                            <div className="flex items-center gap-2 text-amber-800">
                                                <AlertTriangle className="w-5 h-5" />
                                                <h4 className="font-bold text-sm">Information Differences Found</h4>
                                            </div>
                                            <p className="text-xs text-amber-700">
                                                System detected changes in passport and date information. You can update the client profile or keep existing data.
                                            </p>

                                            <div className="border border-amber-200/60 rounded-lg overflow-hidden bg-white">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-amber-50/70 border-b border-amber-200/60 font-bold text-amber-800">
                                                            <th className="p-2 border-r border-amber-200/60">Field</th>
                                                            <th className="p-2 border-r border-amber-200/60">Existing Data</th>
                                                            <th className="p-2">New Data</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-amber-200/40 text-slate-700">
                                                        {[
                                                            { f: 'Title / Salutation', ex: selectedPotentialMatch.client.title_salutation || 'Mr.', ne: searchForm.salutation || 'Mr.' },
                                                            { f: 'Passport Number', ex: selectedPotentialMatch.client.passport_number || 'A12345678', ne: searchForm.passportNumber || 'B98765432', highlight: true },
                                                            { f: 'Date of Issue', ex: selectedPotentialMatch.client.passport_issue_date || '15/01/2020', ne: searchForm.passportIssueDate || '10/03/2026', highlight: true },
                                                            { f: 'Date of Expiry', ex: selectedPotentialMatch.client.passport_expiry_date || '15/01/2030', ne: searchForm.passportExpiryDate || '10/03/2036', highlight: true },
                                                            { f: 'Marital Status', ex: selectedPotentialMatch.client.marital_status || 'Married', ne: searchForm.maritalStatus || '—' }
                                                        ].map((row, idx) => (
                                                            <tr key={idx}>
                                                                <td className="p-2 border-r border-amber-200/60 font-semibold">{row.f}</td>
                                                                <td className="p-2 border-r border-amber-200/60">{row.ex}</td>
                                                                <td className={`p-2 font-medium ${row.highlight ? 'text-[#8B0000] underline' : ''}`}>{row.ne}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-6 space-y-4">
                                        <Card className="border-slate-200/80 shadow-sm p-5 space-y-4 bg-slate-50/30">
                                            <h4 className="font-bold text-sm text-slate-800">What would you like to do?</h4>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => handleContinueWithClient(selectedPotentialMatch, true)}
                                                    className="w-full text-left p-4 bg-[#8B0000] hover:bg-[#6B0000] text-white rounded-xl shadow-sm transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div>
                                                        <div className="font-bold text-sm">Continue with This Client</div>
                                                        <div className="text-xs text-red-100 mt-1">Update profile information and create new application draft</div>
                                                    </div>
                                                    <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                                </button>

                                                <button
                                                    onClick={handleCreateNewClient}
                                                    className="w-full text-left p-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-800">Create New Client</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">Ignore potential matching and create a brand new client profile</div>
                                                    </div>
                                                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedPotentialMatch(null)
                                                        setSearchResults([])
                                                        setHasSearched(false)
                                                    }}
                                                    className="w-full text-left p-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-800">Cancel</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">Go back and modify the search terms</div>
                                                    </div>
                                                    <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                                </button>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* Info footer */}
                            <div className="text-center text-xs text-slate-400 pt-4 flex items-center justify-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Matching is based on Name, Date of Birth, Place of Birth, National ID, and Company Name.</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: New Application / Intake Review */}
            {step === 3 && registration && (
                <div className="w-full space-y-2.5 animate-in fade-in duration-300">
                    {/* Success notify bar */}
                    <div role="status" className="flex items-center justify-between rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-emerald-800">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Client selected successfully. Existing information has been loaded.</span>
                        </div>
                    </div>

                    <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <User className="size-4 text-[#8B0000]" />
                                <h2 className="text-base font-bold text-slate-800">Client information</h2>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Editable client profile
                            </span>
                        </div>

                        {/* Read-Only and Changeable client fields */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Read-only / Locked fields */}
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Full Name</label>
                                <Input value={searchForm.fullName} onChange={e => setSearchForm(prev => ({ ...prev, fullName: e.target.value.toUpperCase() }))} className="border-slate-200" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Surname</label>
                                <Input value={searchForm.surname} onChange={e => setSearchForm(prev => ({ ...prev, surname: e.target.value.toUpperCase() }))} className="border-slate-200" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Title / Salutation</label>
                                <select
                                    value={searchForm.salutation}
                                    onChange={e => setSearchForm(prev => ({ ...prev, salutation: e.target.value }))}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                                >
                                    <option value="Mr.">Mr.</option>
                                    <option value="Mrs.">Mrs.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Dr.">Dr.</option>
                                    <option value="Prof.">Prof.</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Gender</label>
                                <select
                                    value={searchForm.gender}
                                    onChange={e => setSearchForm(prev => ({ ...prev, gender: e.target.value }))}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Marital Status</label>
                                <select
                                    value={searchForm.maritalStatus}
                                    onChange={e => setSearchForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                                >
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Passport Number</label>
                                <Input value={searchForm.passportNumber} onChange={e => setSearchForm(prev => ({ ...prev, passportNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9) }))} className="border-slate-200 font-mono" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">National ID</label>
                                <Input value={searchForm.nationalId} onChange={e => setSearchForm(prev => ({ ...prev, nationalId: e.target.value.replace(/\D/g, '').slice(0, 12) }))} inputMode="numeric" className="border-slate-200 font-mono" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Date of Birth</label>
                                <Input type="date" value={searchForm.dateOfBirth} onChange={e => setSearchForm(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="border-slate-200" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Place of Birth</label>
                                <Input value={searchForm.placeOfBirth} onChange={e => setSearchForm(prev => ({ ...prev, placeOfBirth: e.target.value }))} className="border-slate-200" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Passport Date of Issue</label>
                                <Input type="date" value={searchForm.passportIssueDate} onChange={e => setSearchForm(prev => ({ ...prev, passportIssueDate: e.target.value }))} className="border-slate-200" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-slate-600">Passport Date of Expiry</label>
                                <Input type="date" value={searchForm.passportExpiryDate} onChange={e => setSearchForm(prev => ({ ...prev, passportExpiryDate: e.target.value }))} className="border-slate-200" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                                <PhoneNumberField
                                    value={searchForm.phone}
                                    country={phoneCountry}
                                    error={phoneValidation.error}
                                    onCountryChange={setPhoneCountry}
                                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, phone: value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Email Address</label>
                                <EmailField
                                    value={searchForm.email}
                                    error={emailValidation.error}
                                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, email: value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Company Name</label>
                                <Input
                                    value={searchForm.companyName}
                                    onChange={e => setSearchForm(prev => ({ ...prev, companyName: e.target.value }))}
                                    className="border-slate-200"
                                />
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <h3 className="text-sm font-bold text-slate-800">Company Information</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Job Title</label>
                                    <Input value={searchForm.jobTitle} onChange={e => setSearchForm(prev => ({ ...prev, jobTitle: e.target.value }))} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Department</label>
                                    <Input value={searchForm.department} onChange={e => setSearchForm(prev => ({ ...prev, department: e.target.value }))} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Work City</label>
                                    <Input value={searchForm.workCity} onChange={e => setSearchForm(prev => ({ ...prev, workCity: e.target.value }))} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Work Phone</label>
                                    <Input value={searchForm.workPhone} onChange={e => setSearchForm(prev => ({ ...prev, workPhone: e.target.value }))} dir="ltr" inputMode="tel" className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Work Email</label>
                                    <Input value={searchForm.workEmail} onChange={e => setSearchForm(prev => ({ ...prev, workEmail: e.target.value }))} dir="ltr" inputMode="email" className="border-slate-200" />
                                </div>
                            </div>
                        </div>

                        {/* Residency & Schengen Information */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <h3 className="text-sm font-bold text-slate-800">Residency & Schengen Information</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Residency Country</label>
                                    <Input value={searchForm.residenceCountry} onChange={e => setSearchForm(prev => ({ ...prev, residenceCountry: e.target.value }))} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Previous Schengen Visa?</label>
                                    <select
                                        value={searchForm.previousSchengenVisa ? 'yes' : 'no'}
                                        onChange={e => setSearchForm(prev => {
                                            const enabled = e.target.value === 'yes'
                                            return {
                                                ...prev,
                                                previousSchengenVisa: enabled,
                                                previousSchengenVisas: enabled
                                                    ? (prev.previousSchengenVisas.length === 0 ? [{ ...EMPTY_SCHENGEN_VISA }] : prev.previousSchengenVisas)
                                                    : [],
                                            }
                                        })}
                                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                    >
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-600">Other Residence Permit?</label>
                                    <select
                                        value={searchForm.hasOtherResidencePermit ? 'yes' : 'no'}
                                        onChange={e => setSearchForm(prev => ({ ...prev, hasOtherResidencePermit: e.target.value === 'yes' }))}
                                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                    >
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </select>
                                </div>
                            </div>

                            {searchForm.hasOtherResidencePermit && (
                                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Residence Permit Country</label>
                                        <Input value={searchForm.otherResidenceCountry} onChange={e => setSearchForm(prev => ({ ...prev, otherResidenceCountry: e.target.value }))} placeholder="e.g. United Arab Emirates" className="border-slate-200 bg-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Permit Number</label>
                                        <Input value={searchForm.otherResidenceNumber} onChange={e => setSearchForm(prev => ({ ...prev, otherResidenceNumber: e.target.value }))} placeholder="Permit number" dir="ltr" className="border-slate-200 bg-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Permit Expiry Date</label>
                                        <Input type="date" value={searchForm.otherResidenceExpiryDate} onChange={e => setSearchForm(prev => ({ ...prev, otherResidenceExpiryDate: e.target.value }))} className="border-slate-200 bg-white" />
                                    </div>
                                </div>
                            )}

                            {searchForm.previousSchengenVisa && (
                                <div className="space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-700">Previous Schengen Visas (Last 5 Years)</h4>
                                            <p className="mt-0.5 text-[11px] text-slate-500">Enter the details for each previous visa.</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSearchForm(prev => ({ ...prev, previousSchengenVisas: [...prev.previousSchengenVisas, { ...EMPTY_SCHENGEN_VISA }] }))}
                                            className="border-slate-200 bg-white"
                                        >
                                            <Plus className="size-3.5" /> Add Visa
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {searchForm.previousSchengenVisas.map((visa, index) => (
                                            <div key={index} className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-600">Country</label>
                                                    <Input value={visa.country} onChange={e => setSearchForm(prev => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => itemIndex === index ? { ...item, country: e.target.value } : item) }))} placeholder="e.g. France" className="border-slate-200" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-600">Visa Number</label>
                                                    <Input value={visa.visa_number} onChange={e => setSearchForm(prev => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => itemIndex === index ? { ...item, visa_number: e.target.value } : item) }))} dir="ltr" className="border-slate-200" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-600">Issue Date</label>
                                                    <Input type="date" value={visa.issue_date} onChange={e => setSearchForm(prev => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => itemIndex === index ? { ...item, issue_date: e.target.value } : item) }))} className="border-slate-200" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-600">Expiry Date</label>
                                                    <Input type="date" value={visa.expiry_date} onChange={e => setSearchForm(prev => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.map((item, itemIndex) => itemIndex === index ? { ...item, expiry_date: e.target.value } : item) }))} className="border-slate-200" />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={`Remove Schengen visa ${index + 1}`}
                                                    onClick={() => setSearchForm(prev => ({ ...prev, previousSchengenVisas: prev.previousSchengenVisas.filter((_, itemIndex) => itemIndex !== index) }))}
                                                    className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Application metadata section */}
                        <div className="border-t border-slate-100 pt-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-800">Application Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Application ID</label>
                                    <Input value={caseNumber} disabled className="bg-slate-50 border-slate-200 text-slate-500 font-mono" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Application Date</label>
                                    <Input value={new Date(registration.created_at).toLocaleDateString('en-US')} disabled className="bg-slate-50 border-slate-200 text-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Created By</label>
                                    <Input value={registration.employee?.full_name || 'Noor Al-Shakri'} disabled className="bg-slate-50 border-slate-200 text-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Assigned To</label>
                                    <select
                                        value={assignedTo}
                                        onChange={e => setAssignedTo(e.target.value)}
                                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                                    >
                                        <option value="">Select Staff</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>{emp.full_name || emp.email}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Notes (Internal Notes)</label>
                                <textarea
                                    value={appNotes}
                                    onChange={e => setAppNotes(e.target.value)}
                                    placeholder="Client requires urgent registration..."
                                    className="min-h-16 w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20"
                                />
                            </div>
                        </div>

                        {/* Wizard Step buttons */}
                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                            <Button variant="outline" onClick={() => setStep(2)} className="border-slate-200 text-slate-600">
                                Back to Search
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleSaveDraftOnly} className="border-slate-200 text-slate-600">
                                    Save Draft
                                </Button>
                                <Button onClick={handleSaveIntake} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
                                    Continue to Visa Application
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Changeable fields prompt modal */}
                    {showUpdatePrompt && (
                        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ overscrollBehavior: 'contain' }}>
                            <Card className="max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center gap-2 text-[#8B0000]">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    <h4 className="font-bold text-slate-800">Apply Changes Prompt</h4>
                                </div>
                                <p className="text-sm text-slate-600">
                                    You changed client information. Choose whether to update the reusable client profile or save the changes only in this application.
                                </p>
                                <div className="space-y-2 pt-2">
                                    <Button
                                        onClick={() => applyChangeableUpdates(true)}
                                        className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-white justify-start"
                                    >
                                        Client Profile and This Application
                                    </Button>
                                    <Button
                                        onClick={() => applyChangeableUpdates(false)}
                                        className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 justify-start"
                                    >
                                        This Application Only
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowUpdatePrompt(false)}
                                        className="w-full text-slate-500 hover:bg-slate-100"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* Step 1: Event Registration */}
            {step === 1 && (
                <div className="w-full space-y-2.5 animate-in fade-in duration-300">
                    {client && registration && (
                        <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Client profile created successfully. Continue by registering the client for an event.</span>
                        </div>
                    )}

                    <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
                        {client && registration && <ClientSummary client={client} caseNumber={caseNumber} />}

                        {/* Event Details form */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800">Event Registration Details</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Select Event *</label>
                                    <select
                                        value={selectedEventId}
                                        onChange={e => {
                                            const nextEventId = e.target.value
                                            const nextEvent = events.find(event => event.id === nextEventId)
                                            setSelectedEventId(nextEventId)
                                            setTravelPurpose(buildTravelPurpose(nextEvent, participationType))
                                        }}
                                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                                    >
                                        <option value="">Select Event</option>
                                        {events.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {[e.title || e.title_ar, e.location || e.country || e.location_ar || e.country_ar, formatEventDate(e.date)].filter(Boolean).join(' • ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Participation Type *</label>
                                    <select
                                        value={participationType}
                                        onChange={e => {
                                            const nextType = e.target.value
                                            const currentEvent = events.find(event => event.id === selectedEventId)
                                            setParticipationType(nextType)
                                            setTravelPurpose(buildTravelPurpose(currentEvent, nextType))
                                        }}
                                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
                                    >
                                        <option value="Business Visitor">Business Visitor</option>
                                        <option value="Exhibitor">Exhibitor</option>
                                        <option value="Speaker">Speaker</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Travel Purpose *</label>
                                    <div className="min-h-10 px-3 py-2 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-700">
                                        {travelPurpose}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Information auto-filled (Read-only) */}
                        {selectedEvent && (
                            <div className="space-y-3 border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-800">Event Information (Auto-Filled)</h3>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Read-only</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200/60 bg-slate-50/60 px-3 py-2.5 text-xs sm:grid-cols-3 lg:grid-cols-5">
                                    <div>
                                        <span className="text-slate-400 block">Event Name</span>
                                        <span className="font-semibold text-slate-700">{selectedEvent.title || selectedEvent.title_ar}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Event Type</span>
                                        <span className="font-semibold text-slate-700">International Trade Exhibition</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Sector</span>
                                        <span className="font-semibold text-slate-700">{selectedEvent.sector || 'Food & Beverage'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Country</span>
                                        <span className="font-semibold text-slate-700">{selectedEvent.country || selectedEvent.country_ar}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">City</span>
                                        <span className="font-semibold text-slate-700">{selectedEvent.location || selectedEvent.location_ar}</span>
                                    </div>
                                </div>

                                {/* Inviting Organization Host information */}
                                <div className="space-y-2.5 rounded-lg border border-[#8B0000]/30 bg-[#8B0000]/[0.025] p-3">
                                    <h4 className="font-bold text-sm text-[#8B0000]">Inviting Organization / Host Information (Auto-Filled - Event Master Data)</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
                                        <div>
                                            <span className="text-slate-400 block">Organization Name</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_org}</span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-slate-400 block">Address</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_address}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Inviting Person - First Name</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_contact_name.split(' ')[0]}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Inviting Person - Last Name</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_contact_name.split(' ').slice(1).join(' ') || 'Dupont'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Position</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_contact_position || 'Manager'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Email</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_contact_email}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Phone Number</span>
                                            <span className="font-semibold text-slate-700">{inviterConfig.host_contact_phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                            {onClose ? (
                                <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600">
                                    Cancel / Exit
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={() => router.push('/dashboard/home')} className="border-slate-200 text-slate-600">
                                    Back to Dashboard
                                </Button>
                            )}
                            <div className="flex gap-2">
                                {registrationId && (
                                    <Button variant="outline" onClick={() => toast.success('Event draft saved.')} className="border-slate-200 text-slate-600">
                                        Save Draft
                                    </Button>
                                )}
                                <Button onClick={handleSaveEventDetails} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[125px] shadow-sm">
                                    Continue to Client Search
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 4: Visa Application & Appointment */}
            {step === 4 && registration && (
                <div className="w-full space-y-2.5 animate-in fade-in duration-300">
                    <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs text-emerald-800">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                        <span><strong className="font-semibold">Registration complete.</strong> Continue with the visa setup and appointment.</span>
                    </div>

                    <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
                        {/* Client Summary card */}
                        <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
                            <h3 className="sr-only">Client and event summary</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
                                <div>
                                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Client</span>
                                    <span className="block truncate font-semibold text-slate-700">{client?.full_name_as_passport}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Passport</span>
                                    <span className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Date of birth</span>
                                    <span className="font-bold text-slate-700">{client?.date_of_birth}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Destination</span>
                                    <span className="font-bold text-slate-700">{visaDestination || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Event</span>
                                    <span className="block truncate font-semibold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Application ID</span>
                                    <span className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Visa Platform Setup form */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800">Visa Platform Setup</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Visa Destination Country *</label>
                                    <select value={visaDestination} onChange={e => handleVisaDestinationChange(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/15">
                                        {VISA_ROUTES.map((route) => <option key={route.country} value={route.country}>{route.country}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Embassy / Consulate *</label>
                                    <Input value={visaEmbassy} onChange={e => setVisaEmbassy(e.target.value)} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Visa Type *</label>
                                    <select value={visaType} onChange={e => setVisaType(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                                        {VISA_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Visa Application Platform *</label>
                                    <Input value={visaPlatform} onChange={e => setVisaPlatform(e.target.value)} className="border-slate-200" placeholder="Official portal or platform" aria-describedby="visa-platform-help" />
                                    <p id="visa-platform-help" className="text-[11px] text-slate-500">Use the official destination portal, not an agent website.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Visa Center Submission Method *</label>
                                    <select value={visaSubmissionMethod} onChange={e => setVisaSubmissionMethod(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                                        {VISA_SUBMISSION_METHODS.map(method => <option key={method} value={method}>{method === 'Other' ? 'Other / verify manually' : method}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Portal Account Email *</label>
                                    <Input value={visaPortalEmail} onChange={e => setVisaPortalEmail(e.target.value)} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Portal Account Password *</label>
                                    <div className="relative">
                                        <Input type={showPassword ? 'text' : 'password'} value={visaPortalPassword} onChange={e => setVisaPortalPassword(e.target.value)} className="border-slate-200 pr-10" />
                                        <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Account Status *</label>
                                    <select value={visaAccountStatus} onChange={e => setVisaAccountStatus(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                                        <option value="Created">Created</option>
                                        <option value="In Progress">In Progress</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Portal File uploads */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">Application Completion & File Upload</h3>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">Auto-linked to visa case</Badge>
                            </div>
                            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[220px_260px_minmax(280px,1fr)]">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Portal Application Status *</label>
                                    <select value={visaPortalAppStatus} onChange={e => setVisaPortalAppStatus(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                                        <option value="Completed">Completed</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Application Reference Number</label>
                                    <Input value={visaAppRefNumber} onChange={e => setVisaAppRefNumber(e.target.value)} className="border-slate-200 font-mono" placeholder="FRA1BG2026..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Downloaded Visa Form / PDF Upload *</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            id="visa-form-file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={(e) => handleStep4FileUpload(e, 'Visa Application Form', 'visa_application_form')}
                                        />
                                        <Button variant="outline" onClick={() => document.getElementById('visa-form-file')?.click()} className="border-slate-200 text-slate-600 w-full text-xs">
                                            {registration.documents?.find((d: any) => d.type === 'visa_application_form') ? '✓ File Uploaded (Change)' : 'Choose PDF File'}
                                        </Button>
                                    </div>
                                    {registration.documents?.find((d: any) => d.type === 'visa_application_form') && (
                                        <div className="text-[11px] text-emerald-700 font-medium">
                                            Uploaded: {registration.documents.find((d: any) => d.type === 'visa_application_form')?.name || 'Visa Application Form.pdf'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Embassy appointment booking details */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <h3 className="text-sm font-bold text-slate-800">Visa Center / Embassy Appointment</h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment Booking Channel *</label>
                                    <select value={visaAppointmentChannel} onChange={e => setVisaAppointmentChannel(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                                        <option>Visa Center</option><option>Embassy</option><option>Consulate</option><option>Online portal</option><option>Phone</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment Center *</label>
                                    <Input value={visaAppointmentCenter} onChange={e => setVisaAppointmentCenter(e.target.value)} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment City *</label>
                                    <Input value={visaAppointmentCity} onChange={e => setVisaAppointmentCity(e.target.value)} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment Date *</label>
                                    <Input type="date" value={visaAppointmentDate} onChange={e => setVisaAppointmentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment Time *</label>
                                    <Input type="time" value={visaAppointmentTime} onChange={e => setVisaAppointmentTime(e.target.value)} className="border-slate-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment Reference Number *</label>
                                    <Input value={visaAppointmentRefNumber} onChange={e => setVisaAppointmentRefNumber(e.target.value)} className="border-slate-200 font-mono" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600">Appointment Status *</label>
                                    <select value={visaAppointmentStatus} onChange={e => setVisaAppointmentStatus(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none">
                                        <option value="Booked">Booked</option><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option><option value="Rescheduled">Rescheduled</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 lg:col-span-2">
                                    <label className="text-xs font-bold text-slate-600">Appointment Confirmation Upload *</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            id="appt-confirm-file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={(e) => handleStep4FileUpload(e, 'Appointment Confirmation', 'appointment_confirmation')}
                                        />
                                        <Button variant="outline" onClick={() => document.getElementById('appt-confirm-file')?.click()} className="border-slate-200 text-slate-600 w-full text-xs">
                                            {registration.documents?.find((d: any) => d.type === 'appointment_confirmation') ? '✓ File Uploaded (Change)' : 'Choose PDF File'}
                                        </Button>
                                    </div>
                                    {registration.documents?.find((d: any) => d.type === 'appointment_confirmation') && (
                                        <div className="text-[11px] text-emerald-700 font-medium">
                                            Uploaded: {registration.documents.find((d: any) => d.type === 'appointment_confirmation')?.name || 'Appointment Confirmation.pdf'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2.5 border-t border-slate-100 pt-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                            <Bell className="h-4 w-4 text-[#8B0000]" /> Appointment reminders
                                        </h4>
                                        <p className="mt-0.5 text-[11px] text-slate-500">Alerts appear in dashboard notifications while it is open.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={requestReminderPermission} className="gap-2 border-slate-200 text-xs text-slate-700">
                                        <Volume2 className="h-4 w-4" /> Enable reminder sound
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 md:grid-cols-[210px_minmax(240px,1fr)_auto] md:items-end">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Reminder date & time</label>
                                        <Input type="datetime-local" value={newReminderAt} onChange={e => setNewReminderAt(e.target.value)} className="border-slate-200 bg-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">Reminder note</label>
                                        <Input value={newReminderNote} onChange={e => setNewReminderNote(e.target.value)} className="border-slate-200 bg-white" placeholder="Example: Prepare the passport and appointment letter" />
                                    </div>
                                    <Button type="button" onClick={addVisaReminder} className="gap-2 whitespace-nowrap bg-[#8B0000] text-white hover:bg-[#6B0000]">
                                        <Plus className="h-4 w-4" /> Add reminder
                                    </Button>
                                </div>

                                {visaReminders.length > 0 ? (
                                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                                        {visaReminders.map((reminder) => (
                                            <div key={reminder.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-slate-800">{new Date(reminder.remindAt).toLocaleString('en-GB')}</span>
                                                        {reminder.notifiedAt && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">Sent</Badge>}
                                                    </div>
                                                    <p className="mt-1 truncate text-xs text-slate-600">{reminder.note}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        aria-label={reminder.sound ? 'Disable reminder sound' : 'Enable reminder sound'}
                                                        onClick={() => setVisaReminders(current => current.map(item => item.id === reminder.id ? { ...item, sound: !item.sound } : item))}
                                                        className={cn('rounded-md p-2 transition-colors', reminder.sound ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}
                                                    >
                                                        <Volume2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Delete reminder"
                                                        onClick={() => setVisaReminders(current => current.filter(item => item.id !== reminder.id))}
                                                        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-center text-[11px] text-slate-500">No reminders added.</p>
                                )}
                                <p className="text-[11px] text-amber-700">Browser notifications and sound run while the dashboard is open. Save the visa details after adding or changing reminders.</p>
                            </div>
                        </div>

                        {/* Info banner */}
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#8B0000]" />
                            <span>Supports TLScontact, VFS Global, BLS International, Embassy Direct, and Consulate Direct workflows.</span>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                            <Button variant="outline" onClick={() => setStep(3)} className="border-slate-200 text-slate-600">
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <span role="status" className={cn('self-center text-[11px]', visaSaveState === 'error' ? 'text-red-600' : visaSaveState === 'dirty' ? 'text-amber-700' : visaSaveState === 'saving' ? 'text-slate-500' : 'text-emerald-700')}>
                                    {visaSaveState === 'error' ? 'تعذر الحفظ، حاول مرة أخرى' : visaSaveState === 'dirty' ? 'تغييرات غير محفوظة' : visaSaveState === 'saving' ? 'جارٍ الحفظ…' : 'محفوظ تلقائياً'}
                                </span>
                                <Button onClick={() => handleSaveVisaDetails(true)} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm">
                                    Continue to Next Step
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 5: Document Assembly & Archiving */}
            {step === 5 && registration && (
                <div className="w-full space-y-2.5 animate-in fade-in duration-300">
                    <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Visa application and appointment details saved successfully. Review the real case documents before archiving.</span>
                    </div>

                    <Card className="space-y-3 border-slate-200/80 bg-slate-50/40 p-3 shadow-sm sm:p-4">
                        {/* Client Summary card */}
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:grid-cols-5">
                                <div>
                                    <span className="text-slate-500 block">Client</span>
                                    <span className="font-bold text-slate-800">{client?.full_name_as_passport}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Passport</span>
                                    <span className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Event</span>
                                    <span className="font-bold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Destination</span>
                                    <span className="font-bold text-slate-700">{visaDestination || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Case ID</span>
                                    <span className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid items-start gap-3 xl:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)]">
                        {/* Collected Documents checklist */}
                        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">1</span>
                                    <h3 className="text-sm font-bold text-slate-800">Collected Documents</h3>
                                </div>
                                <Badge variant="outline" className={cn(
                                    'text-[10px]',
                                    requiredVisaDocuments.every((definition) => !!findDocument(definition))
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200',
                                )}>
                                    {requiredVisaDocuments.filter((definition) => !!findDocument(definition)).length}/{requiredVisaDocuments.length} required ready
                                </Badge>
                            </div>
                            <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                                {VISA_DOCUMENTS.map((definition) => {
                                    const storedDocument = findDocument(definition)
                                    const inputId = `document-upload-${definition.type}`
                                    const isUploading = uploadingDocumentType === definition.type
                                    const currentUploadError = uploadError?.type === definition.type ? uploadError.message : ''
                                    return (
                                        <div key={definition.type} className={cn(
                                            'flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-xs',
                                            !storedDocument && definition.required ? 'bg-amber-50/50' : 'bg-white',
                                        )}>
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                {storedDocument ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-slate-800 block">{definition.label}</span>
                                                    {storedDocument ? (
                                                        <span className="text-slate-500 font-mono block truncate" title={storedDocument.name}>{storedDocument.name}</span>
                                                    ) : (
                                                        <span className="text-amber-700 block">Not uploaded</span>
                                                    )}
                                                    {currentUploadError && <span className="text-red-600 mt-1 block leading-4">{currentUploadError}</span>}
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                {storedDocument && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => window.open(storedDocument.path, '_blank', 'noopener,noreferrer')} className="h-7 px-2 text-[10px] text-slate-500">
                                                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                    </Button>
                                                )}
                                                <input id={inputId} type="file" accept=".pdf,image/*" className="hidden" onChange={(event) => handleStep4FileUpload(event, definition.label, definition.type)} />
                                                <Button type="button" variant="ghost" size="sm" disabled={isUploading} onClick={() => document.getElementById(inputId)?.click()} className="h-7 px-2 text-[10px] text-[#8B0000]">
                                                    {isUploading ? 'Uploading…' : storedDocument ? 'Replace' : 'Upload'}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Package Assembly inputs & actions */}
                        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">2</span>
                                    <h3 className="text-sm font-bold text-slate-800">Package Assembly</h3>
                                </div>
                                <span className="text-[11px] text-slate-500">{packageDocumentPaths.length} of {mergeableDocuments.length} files selected</span>
                            </div>
                            <div className="space-y-2 rounded-md bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Choose files to merge</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setPackageDocumentPaths(mergeableDocuments.map(document => document.path))} className="h-8 text-[11px] text-[#8B0000]">Select all</Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setPackageDocumentPaths([])} className="h-8 text-[11px] text-slate-500">Clear</Button>
                                    </div>
                                </div>
                                <label className="flex cursor-pointer items-center gap-2 border-y border-slate-200 py-2 text-xs">
                                    <input type="checkbox" checked={includeClientInfoInPackage} onChange={event => setIncludeClientInfoInPackage(event.target.checked)} className="h-4 w-4 accent-[#8B0000]" />
                                    <span className="min-w-0">
                                        <span className="block font-bold text-slate-800">Include client information</span>
                                        <span className="block text-[11px] text-slate-500">Applicant, visa, appointment details and index.</span>
                                    </span>
                                </label>
                                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                                    {mergeableDocuments.map((document, index) => (
                                        <label key={document.path} className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-1 py-2 hover:bg-white">
                                            <input
                                                type="checkbox"
                                                checked={packageDocumentPaths.includes(document.path)}
                                                onChange={(event) => setPackageDocumentPaths(current => event.target.checked ? [...current, document.path] : current.filter(path => path !== document.path))}
                                                className="h-4 w-4 accent-[#8B0000]"
                                            />
                                            <span className="w-4 shrink-0 text-center text-[10px] font-bold text-slate-400">{index + 1}</span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-xs font-semibold text-slate-700" title={document.name}>{document.name}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 border-t border-slate-200 pt-3">
                                <label className="block text-[11px] font-semibold text-slate-500">Final PDF name</label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input value={packageName} onChange={e => setPackageName(e.target.value)} className="h-9 min-w-0 flex-1 border-slate-200 bg-white text-xs font-mono" />
                                    <Button onClick={handleMergeFiles} disabled={isPackageGenerating || (packageDocumentPaths.length === 0 && !includeClientInfoInPackage)} className="h-9 shrink-0 gap-1.5 bg-[#8B0000] text-xs text-white hover:bg-[#6B0000]">
                                        <FileText className="h-4 w-4" /> {isPackageGenerating ? 'Merging…' : packageDocument ? 'Rebuild PDF' : 'Create PDF'}
                                    </Button>
                                </div>
                                {packageDocument && (
                                    <button type="button" onClick={() => window.open(packageDocument.path, '_blank', 'noopener,noreferrer')} className="flex max-w-full items-center gap-2 rounded-md py-1 text-left text-xs text-emerald-700 hover:text-emerald-800">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        <span className="truncate font-semibold" title={packageDocument.name}>{packageDocument.name}</span>
                                        <span className="shrink-0 text-[10px] text-slate-500">View PDF</span>
                                    </button>
                                )}
                            </div>
                        </section>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                            <Button variant="outline" onClick={() => setStep(4)} className="border-slate-200 text-slate-600">
                                Back
                            </Button>
                            <Button onClick={() => {
                                if (!validateStepBeforeAdvance(6)) return
                                setStep(6)
                            }} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm flex items-center justify-center gap-1.5">
                                Continue to Next Step
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 6: Payment & Receipt */}
            {step === 6 && registration && (
                <div className="w-full space-y-2.5 animate-in fade-in duration-300">
                    <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>The visa package has been prepared successfully. You can now proceed with payment and receipt issuance.</span>
                    </div>

                    <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
                        {/* Client Summary card */}
                        <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2.5">
                            <h3 className="sr-only">Client and case summary</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
                                <div>
                                    <span className="text-slate-400 block">Full Name</span>
                                    <span className="font-bold text-slate-700">{client?.full_name_as_passport}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Passport Number</span>
                                    <span className="font-bold font-mono text-slate-700">{client?.passport_number}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Event Name</span>
                                    <span className="font-bold text-slate-700">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Destination Country</span>
                                    <span className="font-bold text-slate-700">{visaDestination || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Application ID</span>
                                    <span className="font-bold font-mono text-[#8B0000]">{caseNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid for invoice form elements */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
                            {/* Payment details form */}
                            <div className="lg:col-span-4 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800">1. Payment Details</h3>
                                <div className="space-y-3 text-xs">
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Payment Category</label>
                                        <select value={paymentCategory} onChange={e => setPaymentCategory(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                                            <option value="Visa Application & Services">Visa Application & Services</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Payment Method</label>
                                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Asiacell Transfer">Asiacell Transfer</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Payment Date</label>
                                        <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="h-9 border-slate-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Receipt Number</label>
                                        <Input value={`RCPT-2026-${caseNumber.split('-').pop()}`} disabled className="h-9 bg-slate-50 border-slate-200 text-slate-500 font-mono" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Currency</label>
                                        <select className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white focus:outline-none">
                                            <option>EUR - Euro (€)</option>
                                            <option>IQD - Iraqi Dinar (د.ع)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Handled By</label>
                                        <Input value={currentUser?.full_name || 'Noor Al-Shakri'} disabled className="h-9 bg-slate-50 border-slate-200 text-slate-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-slate-500 font-medium">Notes</label>
                                        <textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Payment received..." className="w-full h-16 p-2 border border-slate-200 rounded-md bg-white focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Fee breakdown: restricted to administrators and payment-authorized team members. */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-bold text-slate-800">2. Fee Breakdown</h3>
                                    <Badge variant="outline" className={cn('text-[10px]', canEditFeeBreakdown ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600')}>
                                        {canEditFeeBreakdown ? 'Editing enabled' : 'Restricted'}
                                    </Badge>
                                </div>
                                {canEditFeeBreakdown ? <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/20 text-xs">
                                    <div className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {[
                                            { key: 'service', label: 'Service Fee', val: fees.service },
                                            { key: 'event', label: 'Event Registration Fee', val: fees.event },
                                            { key: 'invitation', label: 'Invitation Letter Fee', val: fees.invitation },
                                            { key: 'coordination', label: 'Visa Coordination Fee', val: fees.coordination },
                                            { key: 'appointment', label: 'Appointment Fee', val: fees.appointment },
                                            { key: 'insurance', label: 'Insurance Fee', val: fees.insurance },
                                            { key: 'printing', label: 'Printing / Document Fee', val: fees.printing },
                                            { key: 'discount', label: 'Discount', val: fees.discount, isDiscount: true }
                                        ].map((fee) => (
                                            <div key={fee.key} className="flex items-center justify-between p-2">
                                                <span>{fee.label}</span>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        value={fee.val}
                                                        readOnly={!canEditFeeBreakdown}
                                                        aria-readonly={!canEditFeeBreakdown}
                                                        title={canEditFeeBreakdown ? 'Edit fee' : 'Payment permission required'}
                                                        onChange={e => {
                                                            if (!canEditFeeBreakdown) return
                                                            const numericVal = parseFloat(e.target.value) || 0
                                                            setFees(prev => ({ ...prev, [fee.key]: numericVal }))
                                                        }}
                                                        className={`w-16 h-7 text-right p-1 border-slate-200 text-xs font-semibold ${!canEditFeeBreakdown ? 'cursor-default bg-slate-100 focus-visible:ring-0' : 'bg-white'} ${
                                                            fee.isDiscount ? 'text-rose-600' : 'text-slate-800'
                                                        }`}
                                                    />
                                                    <span className="text-slate-400">€</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-100/80 p-3 border-t border-slate-200 font-bold text-slate-800 flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Total Amount</span>
                                            <span>€ {totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-emerald-700">
                                            <span>Amount Paid</span>
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    value={amountPaid}
                                                    onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                                                    className="w-20 h-7 text-right p-1 border-slate-300 text-xs font-bold text-emerald-700"
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                        <div className={`flex justify-between items-center text-xs border-t border-slate-200/80 pt-1.5 ${balanceDue > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                                            <span>Balance Due</span>
                                            <span>€ {balanceDue}</span>
                                        </div>
                                    </div>
                                </div> : <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-4 text-xs">
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                                        <span>Total Amount</span>
                                        <span>€ {totalAmount}</span>
                                    </div>
                                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                                        <Lock className="h-3.5 w-3.5" /> Detailed fee values are restricted to payment-authorized users.
                                    </p>
                                </div>}
                            </div>

                            {/* Generated Invoice Preview Card */}
                            <div className="lg:col-span-4 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800">3. Receipt Information</h3>
                                <Card className="space-y-3 border-slate-200/80 p-3 text-xs shadow-sm">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                        <div>
                                            <span className="text-slate-400 block font-medium">Receipt ID</span>
                                            <span className="font-bold font-mono text-slate-800 text-sm">RCPT-2026-{caseNumber.split('-').pop()}</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Paid</Badge>
                                    </div>

                                    <div className="space-y-2 text-slate-600 font-medium">
                                        <div className="flex justify-between">
                                            <span>Client Name</span>
                                            <span className="text-slate-800">{client?.full_name_as_passport}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Application ID</span>
                                            <span className="text-slate-800 font-mono">{caseNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Event Name</span>
                                            <span className="text-slate-800">{selectedEvent?.title || selectedEvent?.title_ar || 'Event not set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment Method</span>
                                            <span className="text-slate-800">{paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-dashed border-slate-100">
                                            <span>Total Paid</span>
                                            <span>€ {amountPaid}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Issue Date</span>
                                            <span>{new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>

                                    {registration.documents?.find((d: any) => d.type === 'receipt') && (
                                        <div className="border border-slate-200 bg-white rounded-lg p-2.5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileCode className="w-8 h-8 text-rose-600" />
                                                <div>
                                                    <span className="font-bold block text-slate-800">Payment_Receipt_{caseNumber}.pdf</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">PDF file • 92 KB • Completed</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Button variant="ghost" size="sm" onClick={handleDownloadReceipt} aria-label="Download receipt" className="h-8 w-8 text-slate-400 hover:text-slate-600 flex items-center justify-center p-0">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>

                        {/* Physical Print & Receipt actions */}
                        <div className="space-y-2.5 border-t border-slate-100 pt-4">
                            <h3 className="text-sm font-bold text-slate-800">4. Receipt Actions</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button variant="outline" size="sm" onClick={handleGenerateReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                                    <Printer className="w-4 h-4" /> Generate Receipt
                                </Button>
                                <Button variant="outline" size="sm" onClick={handlePrintReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                                    <Printer className="w-4 h-4" /> Print Receipt
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                                    <Download className="w-4 h-4" /> Download Receipt
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleArchiveReceipt} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                                    <FolderKanban className="w-4 h-4" /> Archive Receipt
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleSavePaymentDraft} className="border-slate-200 text-slate-600 gap-1.5 text-xs">
                                    <FileText className="w-4 h-4" /> Save Draft
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                            <Button variant="outline" onClick={() => setStep(5)} className="border-slate-200 text-slate-600">
                                Back
                            </Button>
                            <Button onClick={() => {
                                if (!validateStepBeforeAdvance(7)) return
                                setStep(7)
                            }} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[120px] shadow-sm flex items-center justify-center gap-1.5">
                                Continue to Next Step
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 7: Client File Delivery & Status */}
            {step === 7 && (
                <div className="w-full animate-in fade-in duration-300">
                    <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
                        <div className={cn(
                            'flex items-center justify-between gap-3 rounded-md border px-3 py-2',
                            deliveryStatus === 'sent'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-amber-50 border-amber-200 text-amber-900',
                        )}>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                {deliveryStatus === 'sent' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                                <span>{deliveryStatus === 'sent' ? 'Client file delivery has been recorded.' : 'The case is complete. Confirm delivery to the client.'}</span>
                            </div>
                            <Badge variant="outline" className={deliveryStatus === 'sent' ? 'border-emerald-200 text-emerald-700' : 'border-amber-200 text-amber-700'}>
                                {deliveryStatus === 'sent' ? 'Sent' : 'Ready to send'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
                            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Files to share with the client</h3>
                                        <p className="text-[11px] text-slate-500 mt-1">Select all or only the files the client needs.</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setDeliveryDocumentPaths(registrationDocuments.map((document) => document.path))} className="h-8 text-[11px] text-[#8B0000]">
                                        Select all
                                    </Button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {registrationDocuments.length > 0 ? registrationDocuments.map((document) => {
                                        const selected = deliveryDocumentPaths.includes(document.path)
                                        return (
                                            <div key={`${document.type}-${document.path}`} className={cn('flex items-center gap-3 px-4 py-3 transition-colors', selected ? 'bg-slate-50/80' : 'bg-white')}>
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => setDeliveryDocumentPaths((current) => selected ? current.filter((path) => path !== document.path) : [...current, document.path])}
                                                    className="size-4 accent-[#8B0000]"
                                                    aria-label={`Share ${document.name}`}
                                                />
                                                <FileText className="size-4 shrink-0 text-slate-400" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-slate-800 truncate">{document.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono truncate">{document.type}</p>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => window.open(document.path, '_blank', 'noopener,noreferrer')} className="h-8 w-8 p-0 text-slate-400 hover:text-[#8B0000]" aria-label={`View ${document.name}`}>
                                                    <ExternalLink className="size-3.5" />
                                                </Button>
                                            </div>
                                        )
                                    }) : (
                                        <div className="px-4 py-10 text-center text-xs text-slate-500">
                                            No files have been saved for this case. Return to Docs to upload them.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">WhatsApp delivery message</h3>
                                    <p className="text-[11px] text-slate-500 mt-1">Write the message, then open WhatsApp to send it.</p>
                                </div>
                                <textarea
                                    value={deliveryMessage}
                                    onChange={(event) => setDeliveryMessage(event.target.value)}
                                    rows={6}
                                    placeholder="Write a short message to the client..."
                                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-6 text-slate-700 outline-none focus:border-[#8B0000]/40 focus:ring-2 focus:ring-[#8B0000]/10"
                                />
                                <div className="grid grid-cols-1 gap-2">
                                    <Button type="button" onClick={openWhatsApp} disabled={registrationDocuments.length === 0} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-2">
                                        <MessageCircle className="size-4" /> Open WhatsApp
                                    </Button>
                                </div>
                            </section>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
                            <Button variant="outline" onClick={() => setStep(6)} className="border-slate-200 text-slate-600">Back to payment</Button>
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => router.push('/dashboard/participation-cases/work/clients')} className="bg-[#8B0000] hover:bg-[#6B0000] text-white gap-1.5">
                                    <FolderKanban className="w-4 h-4" /> Back to Applications
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
