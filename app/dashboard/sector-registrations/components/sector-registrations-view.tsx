'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Hash,
  Inbox,
  Mail,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Printer,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'
import { getSectorContent, getSectorRegistrationFallback } from '@/app/sectors/sector-content'
import { deleteSectorRegistration, updateSectorRegistrationStatus } from '@/app/dashboard/sector-registrations/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { parseFormFields } from '@/lib/form-fields'
import type { Tables } from '@/lib/database.types'
import { cn, formatDate, formatDateTime } from '@/lib/utils'

type RegistrationRecord = Tables<'sector_registrations'> & {
  users: Pick<Tables<'users'>, 'full_name' | 'email'> | null
  sectors: Pick<Tables<'sectors'>, 'id' | 'name' | 'name_ar' | 'slug' | 'color' | 'registration_config'> | null
}

type FeedbackState = {
  kind: 'success' | 'error'
  message: string
} | null

type SectorRegistrationStatus = 'pending' | 'approved' | 'rejected'
type SortMode = 'newest' | 'oldest' | 'name' | 'sector' | 'status'

interface SectorRegistrationsViewProps {
  registrations: RegistrationRecord[]
}

const ITEMS_PER_PAGE = 10

const STATUS_META: Record<SectorRegistrationStatus, {
  label: string
  icon: typeof Clock3
  pill: string
  surface: string
}> = {
  pending: {
    label: 'قيد المراجعة',
    icon: Clock3,
    pill: 'border-amber-200 bg-amber-50 text-amber-700',
    surface: 'from-amber-50 to-orange-50',
  },
  approved: {
    label: 'مقبول',
    icon: CheckCircle2,
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    surface: 'from-emerald-50 to-green-50',
  },
  rejected: {
    label: 'مرفوض',
    icon: XCircle,
    pill: 'border-rose-200 bg-rose-50 text-rose-700',
    surface: 'from-rose-50 to-red-50',
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeStatus(status: string | null | undefined): SectorRegistrationStatus {
  if (status === 'approved' || status === 'confirmed') return 'approved'
  if (status === 'rejected') return 'rejected'
  return 'pending'
}

function dedupe(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]))
}

function formatRelativeDate(date: string | null) {
  if (!date) return '-'

  const now = Date.now()
  const target = new Date(date).getTime()
  const diff = now - target
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days < 7) return `منذ ${days} يوم`
  return formatDate(date)
}

function formatCompactDateTime(date: string | null, locale: string = 'ar-IQ') {
  if (!date) return '-'

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatPhoneForWhatsApp(phone: string) {
  let cleaned = phone.replace(/[\s\-()]/g, '')
  if (cleaned.startsWith('0')) cleaned = `964${cleaned.slice(1)}`
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1)
  return cleaned
}

function getDataObject(registration: RegistrationRecord) {
  return isRecord(registration.data) ? registration.data : {}
}

function getSectorFields(registration: RegistrationRecord) {
  const configuredFields = parseFormFields(registration.sectors?.registration_config ?? null)
  return configuredFields.length > 0 ? configuredFields : getSectorRegistrationFallback()
}

function getFieldLabel(registration: RegistrationRecord, key: string) {
  const field = getSectorFields(registration).find((item) => item.id === key)
  return field?.label_ar || field?.label_en || key
}

function getFieldLabelEnglish(registration: RegistrationRecord, key: string) {
  const field = getSectorFields(registration).find((item) => item.id === key)
  return field?.label_en || field?.label_ar || key
}

function getFieldDescription(registration: RegistrationRecord, key: string) {
  const field = getSectorFields(registration).find((item) => item.id === key)
  return field?.description_ar || field?.description_en || ''
}

function getFieldDescriptionEnglish(registration: RegistrationRecord, key: string) {
  const field = getSectorFields(registration).find((item) => item.id === key)
  return field?.description_en || field?.description_ar || ''
}

type EnglishDataEntry = { key: string; label: string; value: string }

const DOSSIER_SECTION_BLUEPRINT: ReadonlyArray<{
  title: string
  subtitle: string
  keys: ReadonlySet<string>
}> = [
  {
    title: 'Personal Information',
    subtitle: 'Identity and personal contact details for the attendee.',
    keys: new Set([
      'given_name',
      'full_name',
      'surname',
      'sex',
      'civil_status',
      'date_of_birth',
      'nationality',
      'personal_telephone',
      'personal_email_address',
      'personal_home_address',
    ]),
  },
  {
    title: 'Passport Documents',
    subtitle: 'Document type, number, and issuing details.',
    keys: new Set([
      'type_of_travel_document',
      'number_of_travel_document',
      'date_of_issue',
      'date_of_expiry',
      'issuing_authority',
      'issued_by_country',
    ]),
  },
  {
    title: 'Residence Information',
    subtitle: 'Residency status, permit number, country, and permit dates.',
    keys: new Set([
      'residence_in_other_country',
      'residence_permit_number',
      'residence_permit_country',
      'residence_permit_issue_date',
      'residence_permit_valid_until',
      'additional_residence_in_other_country',
      'secondary_residence_permit_number',
      'secondary_residence_permit_country',
      'secondary_residence_permit_issue_date',
      'secondary_residence_permit_valid_until',
    ]),
  },
  {
    title: 'Additional Information',
    subtitle: 'Previous visa details when applicable.',
    keys: new Set([
      'fingerprints_collected_previously',
      'previous_visa_issue_date',
      'previous_visa_valid_until',
      'previous_visa_number_if_known',
      'previous_visa_source_country',
      'additional_previous_visa',
      'secondary_previous_visa_issue_date',
      'secondary_previous_visa_valid_until',
      'secondary_previous_visa_number_if_known',
      'secondary_previous_visa_source_country',
    ]),
  },
  {
    title: 'Company Information',
    subtitle: 'Company identity and primary contact details.',
    keys: new Set([
      'company_name',
      'company_specialization',
      'zip_code',
      'city',
      'country',
      'telephone',
      'email',
      'company_website',
      'position_in_company',
      'company_registration_number',
    ]),
  },
]

const TOTAL_DOSSIER_SECTIONS = DOSSIER_SECTION_BLUEPRINT.length

function sortEntriesByFieldOrder(registration: RegistrationRecord, entries: EnglishDataEntry[]) {
  const fields = getSectorFields(registration)
  const order = new Map(fields.map((f, i) => [f.id, i]))
  return [...entries].sort((a, b) => (order.get(a.key) ?? 1_000_000) - (order.get(b.key) ?? 1_000_000))
}

type DossierSectionBlock = {
  sectionNum: number
  title: string
  subtitle: string
  entries: EnglishDataEntry[]
  extraEntries: EnglishDataEntry[]
}

function buildDossierSectionPayload(registration: RegistrationRecord, englishEntries: EnglishDataEntry[]) {
  const sorted = sortEntriesByFieldOrder(registration, englishEntries)
  const used = new Set<string>()

  const blocks: DossierSectionBlock[] = DOSSIER_SECTION_BLUEPRINT.map((def, i) => {
    const entries = sorted.filter((e) => def.keys.has(e.key))
    entries.forEach((e) => used.add(e.key))
    return {
      sectionNum: i + 1,
      title: def.title,
      subtitle: def.subtitle,
      entries,
      extraEntries: [],
    }
  })

  const remainder = sorted.filter((e) => !used.has(e.key))
  if (remainder.length > 0) {
    const company = blocks[blocks.length - 1]!
    company.extraEntries = remainder
  }

  return blocks.filter((b) => b.entries.length > 0 || b.extraEntries.length > 0)
}

function isFieldRequiredForPdf(registration: RegistrationRecord, key: string) {
  if (key === 'empty') return false
  const field = getSectorFields(registration).find((item) => item.id === key)
  return field?.required ?? false
}

function getDataEntries(registration: RegistrationRecord) {
  const data = getDataObject(registration)

  return Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => ({
      key,
      label: getFieldLabel(registration, key),
      description: getFieldDescription(registration, key),
      value: String(value),
    }))
}

function getDataEntriesEnglish(registration: RegistrationRecord) {
  const data = getDataObject(registration)

  return Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => ({
      key,
      label: getFieldLabelEnglish(registration, key),
      value: String(value),
    }))
}

function getApplicantName(registration: RegistrationRecord) {
  const data = getDataObject(registration)
  const combinedName = [data.given_name, data.surname].filter(Boolean).join(' ').trim()

  return (
    registration.full_name ||
    registration.users?.full_name ||
    combinedName ||
    (typeof data.full_name === 'string' ? data.full_name : '') ||
    (typeof data.company_name === 'string' ? data.company_name : '') ||
    'طلب بدون اسم'
  )
}

function getApplicantEmail(registration: RegistrationRecord) {
  const data = getDataObject(registration)
  return (
    registration.email ||
    registration.users?.email ||
    (typeof data.email === 'string' ? data.email : null) ||
    (typeof data.personal_email_address === 'string' ? data.personal_email_address : null)
  )
}

function getApplicantPhones(registration: RegistrationRecord) {
  const data = getDataObject(registration)
  return dedupe([
    registration.phone,
    typeof data.telephone === 'string' ? data.telephone : null,
    typeof data.personal_telephone === 'string' ? data.personal_telephone : null,
    typeof data.contact_number === 'string' ? data.contact_number : null,
    typeof data.phone === 'string' ? data.phone : null,
  ])
}

function getSectorName(registration: RegistrationRecord) {
  return registration.sectors?.name_ar || registration.sectors?.name || 'قطاع غير محدد'
}

function getSectorNameEnglish(registration: RegistrationRecord) {
  return registration.sectors?.name || registration.sectors?.name_ar || 'Unknown sector'
}

function getStatusLabelEnglish(status: SectorRegistrationStatus) {
  const labels: Record<SectorRegistrationStatus, string> = {
    pending: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  }

  return labels[status]
}

function buildOutlookComposeUrl(registration: RegistrationRecord) {
  const email = getApplicantEmail(registration)
  if (!email) return null

  const applicantName = getApplicantName(registration)
  const sectorName = getSectorNameEnglish(registration)
  const status = getStatusLabelEnglish(normalizeStatus(registration.status))
  const submittedAt = registration.created_at ? formatDateTime(registration.created_at, 'en-US') : 'Not available'
  const subject = `JAZ | Sector Partnership Application - ${sectorName}`
  const body = [
    `Hello ${applicantName},`,
    '',
    'Thank you for your sector partnership application.',
    '',
    `Application ID: ${registration.id}`,
    `Sector: ${sectorName}`,
    `Current status: ${status}`,
    `Submitted at: ${submittedAt}`,
    '',
    'We are contacting you from the JAZ Admin team regarding your application.',
    '',
    'Best regards,',
    'JAZ Team',
  ].join('\n')

  return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function getRegistrationReference(registration: RegistrationRecord) {
  return `APP-${registration.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`
}

function toEnglishPdfFileName(registration: RegistrationRecord) {
  const baseName = getApplicantName(registration)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')

  const suffix = baseName || registration.id.slice(0, 8)
  return `sector-application-${suffix}.pdf`
}

function getApplicantInitials(registration: RegistrationRecord) {
  const name = getApplicantName(registration)
  return name.trim().charAt(0).toUpperCase() || 'J'
}

function StatusBadge({ status, large = false }: { status: SectorRegistrationStatus; large?: boolean }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        meta.pill,
        large ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]'
      )}
    >
      <Icon className={large ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      {meta.label}
    </span>
  )
}

function ContactPill({
  label,
  value,
  action,
  icon: Icon,
}: {
  label: string
  value: string
  action?: React.ReactNode
  icon: typeof Mail
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-stone-400">{label}</p>
          <p className="truncate text-sm font-medium text-stone-900" dir="ltr">{value}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function MiniStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  label: string
  value: number
  hint: string
  icon: typeof Inbox
  tone: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 text-right transition-all duration-300',
        active
          ? 'border-stone-200 bg-white shadow-sm'
          : 'border-stone-200 bg-white hover:-translate-y-0.5 hover:shadow-sm'
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', tone)} />
      <div className="absolute -left-10 top-0 h-24 w-24 rounded-full bg-stone-100/60 blur-3xl transition-opacity group-hover:opacity-80" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{label}</p>
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm ring-1 ring-black/5', tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <strong className="text-3xl font-bold tracking-tight text-stone-950">{value}</strong>
        <span className="text-xs font-medium text-stone-400">{active ? 'مفعّل' : 'للتصفية'}</span>
      </div>
    </button>
  )
}

function EmptyState({
  title,
  description,
  onReset,
}: {
  title: string
  description: string
  onReset?: () => void
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
          <Inbox className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-stone-950">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">{description}</p>
        {onReset && (
          <Button variant="outline" className="mt-5 border-stone-200 text-stone-700 hover:bg-stone-50" onClick={onReset}>
            إعادة ضبط الفلاتر
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function SectorRegistrationsView({ registrations }: SectorRegistrationsViewProps) {
  const [items, setItems] = useState(registrations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SectorRegistrationStatus>('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    if (!feedback) return
    const timeout = window.setTimeout(() => setFeedback(null), 2800)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  const sectorOptions = useMemo(() => {
    return Array.from(
      new Map(
        items
          .filter((item) => item.sectors?.id)
          .map((item) => [
            item.sectors?.id,
            {
              id: item.sectors?.id || '',
              label: getSectorName(item),
            },
          ])
      ).values()
    )
  }, [items])

  const stats = useMemo(() => {
    const pending = items.filter((item) => normalizeStatus(item.status) === 'pending').length
    const approved = items.filter((item) => normalizeStatus(item.status) === 'approved').length
    const rejected = items.filter((item) => normalizeStatus(item.status) === 'rejected').length
    return {
      all: items.length,
      pending,
      approved,
      rejected,
      sectors: sectorOptions.length,
    }
  }, [items, sectorOptions.length])

  const filteredItems = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    const result = items.filter((item) => {
      if (statusFilter !== 'all' && normalizeStatus(item.status) !== statusFilter) return false
      if (sectorFilter !== 'all' && item.sector_id !== sectorFilter) return false

      if (!query) return true

      const haystack = [
        getApplicantName(item),
        getApplicantEmail(item) || '',
        getSectorName(item),
        ...getApplicantPhones(item),
        ...getDataEntries(item).flatMap((entry) => [entry.label, entry.value]),
      ].join(' ').toLowerCase()

      return haystack.includes(query)
    })

    result.sort((left, right) => {
      switch (sortMode) {
        case 'oldest':
          return new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime()
        case 'name':
          return getApplicantName(left).localeCompare(getApplicantName(right), 'ar')
        case 'sector':
          return getSectorName(left).localeCompare(getSectorName(right), 'ar')
        case 'status': {
          const statusOrder: Record<SectorRegistrationStatus, number> = { pending: 0, approved: 1, rejected: 2 }
          return statusOrder[normalizeStatus(left.status)] - statusOrder[normalizeStatus(right.status)]
        }
        case 'newest':
        default:
          return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
      }
    })

    return result
  }, [deferredSearch, items, sectorFilter, sortMode, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId]
  )

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, sectorFilter, sortMode, statusFilter])

  async function copyText(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1800)
    } catch (error) {
      console.error('Copy failed:', error)
      setFeedback({ kind: 'error', message: 'تعذر نسخ البيانات إلى الحافظة.' })
    }
  }

  async function handleStatusChange(id: string, nextStatus: SectorRegistrationStatus) {
    setPendingId(id)
    const result = await updateSectorRegistrationStatus(id, nextStatus)
    setPendingId(null)

    if (!result.success) {
      setFeedback({ kind: 'error', message: result.error || 'تعذر تحديث حالة الطلب.' })
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    )

    setFeedback({ kind: 'success', message: 'تم تحديث حالة الطلب بنجاح.' })
  }

  async function handleDelete(registration: RegistrationRecord) {
    const confirmed = window.confirm(`هل تريد حذف طلب "${getApplicantName(registration)}" نهائياً؟`)
    if (!confirmed) return

    setDeletingId(registration.id)
    const result = await deleteSectorRegistration(registration.id)
    setDeletingId(null)

    if (!result.success) {
      setFeedback({ kind: 'error', message: result.error || 'تعذر حذف الطلب.' })
      return
    }

    setItems((current) => current.filter((item) => item.id !== registration.id))
    if (selectedId === registration.id) {
      setSelectedId(null)
    }
    setFeedback({ kind: 'success', message: 'تم حذف الطلب بنجاح.' })
  }

  function exportFilteredItems() {
    if (filteredItems.length === 0) {
      setFeedback({ kind: 'error', message: 'لا توجد بيانات مطابقة للتصدير حالياً.' })
      return
    }

    const rows = filteredItems.map((item) => {
      const row: Record<string, string> = {
        'الاسم': getApplicantName(item),
        'القطاع': getSectorName(item),
        'الحالة': STATUS_META[normalizeStatus(item.status)].label,
        'البريد الإلكتروني': getApplicantEmail(item) || '-',
        'الهاتف': getApplicantPhones(item).join(' | ') || '-',
        'تاريخ الإنشاء': item.created_at ? formatDateTime(item.created_at) : '-',
      }

      getDataEntries(item).forEach((entry) => {
        row[entry.label] = entry.value
      })

      return row
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 26 }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'sector-registrations')
    XLSX.writeFile(workbook, 'sector-registrations.xlsx')
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setSectorFilter('all')
    setSortMode('newest')
  }

  function copyRegistrationSummary(registration: RegistrationRecord) {
    const lines = [
      `الاسم: ${getApplicantName(registration)}`,
      `القطاع: ${getSectorName(registration)}`,
      `الحالة: ${STATUS_META[normalizeStatus(registration.status)].label}`,
      `البريد الإلكتروني: ${getApplicantEmail(registration) || '-'}`,
      `الهاتف: ${getApplicantPhones(registration).join(' | ') || '-'}`,
      `تاريخ الإرسال: ${registration.created_at ? formatDateTime(registration.created_at) : '-'}`,
      '--- البيانات ---',
      ...getDataEntries(registration).map((entry) => `${entry.label}: ${entry.value}`),
    ]

    copyText(lines.join('\n'), `summary-${registration.id}`)
  }

  function exportRegistrationPdf(registration: RegistrationRecord) {
    void (async () => {
      try {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4',
        })

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const marginX = 40
        const shellMargin = 14
        const contentWidth = pageWidth - marginX * 2
        const bottomReserve = 44

        const applicantName = getApplicantName(registration)
        const sectorName = getSectorNameEnglish(registration)
        const email = getApplicantEmail(registration) || 'Not provided'
        const phone = getApplicantPhones(registration).join(' | ') || 'Not provided'
        const status = getStatusLabelEnglish(normalizeStatus(registration.status))
        const submittedAt = registration.created_at ? formatCompactDateTime(registration.created_at, 'en-US') : 'Not available'
        const updatedAt = registration.updated_at ? formatCompactDateTime(registration.updated_at, 'en-US') : 'Not updated'
        const englishEntries = getDataEntriesEnglish(registration)
        const sectorIntro =
          registration.sectors != null
            ? getSectorContent(registration.sectors)?.registrationIntro
            : null
        const introParagraph =
          sectorIntro ||
          'If your inquiry concerns an industrial delegation, commercial partnership, or participation in a specialized exhibition, please submit it through the form below. This document is an official export of the responses received.'

        const burgundy: readonly [number, number, number] = [139, 0, 0]
        const navy: readonly [number, number, number] = [30, 64, 175]
        const ink: readonly [number, number, number] = [24, 24, 27]
        const muted: readonly [number, number, number] = [120, 113, 108]
        const stone: readonly [number, number, number] = [87, 83, 78]

        const drawPageShell = () => {
          doc.setFillColor(252, 251, 249)
          doc.rect(0, 0, pageWidth, pageHeight, 'F')
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(shellMargin, shellMargin, pageWidth - shellMargin * 2, pageHeight - shellMargin * 2, 18, 18, 'F')
          doc.setDrawColor(230, 228, 224)
          doc.setLineWidth(0.75)
          doc.roundedRect(shellMargin, shellMargin, pageWidth - shellMargin * 2, pageHeight - shellMargin * 2, 18, 18, 'S')
        }

        const estimateDossierFieldHeight = (entry: EnglishDataEntry, description: string) => {
          const desc = description.trim()
          const descLines = desc ? doc.splitTextToSize(desc, contentWidth - 36) : []
          const valueLines = doc.splitTextToSize(entry.value, contentWidth - 36)
          return 14 + (descLines.length > 0 ? 6 + descLines.length * 10 : 0) + 8 + valueLines.length * 14 + 16
        }

        const estimateSectionHeaderHeight = () => 58

        const drawDossierFieldBlock = (y: number, entry: EnglishDataEntry, description: string) => {
          let cy = y
          doc.setTextColor(muted[0], muted[1], muted[2])
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8.5)
          const requiredMark = isFieldRequiredForPdf(registration, entry.key) ? ' *' : ''
          const labelText = `${entry.label}${requiredMark}`
          doc.text(labelText.toUpperCase(), marginX + 12, cy)
          cy += 14

          const desc = description.trim()
          if (desc) {
            doc.setFont('helvetica', 'italic')
            doc.setFontSize(8)
            doc.setTextColor(145, 140, 135)
            const descLines = doc.splitTextToSize(desc, contentWidth - 36)
            doc.text(descLines, marginX + 12, cy)
            cy += descLines.length * 10 + 6
          }

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(11)
          doc.setTextColor(ink[0], ink[1], ink[2])
          const valueLines = doc.splitTextToSize(entry.value, contentWidth - 36)
          doc.text(valueLines, marginX + 12, cy)
          cy += valueLines.length * 14 + 10

          doc.setDrawColor(236, 234, 231)
          doc.setLineWidth(0.5)
          doc.line(marginX + 8, cy, pageWidth - marginX - 8, cy)
          cy += 8
          return cy
        }

        const drawDossierSectionHeader = (
          y: number,
          sectionNum: number,
          title: string,
          subtitle: string
        ) => {
          const bandH = 56
          doc.setFillColor(250, 248, 246)
          doc.rect(marginX, y, contentWidth, bandH, 'F')
          doc.setDrawColor(burgundy[0], burgundy[1], burgundy[2])
          doc.setLineWidth(3)
          doc.line(marginX, y, marginX, y + bandH)

          const secTag = `SECTION ${String(sectionNum).padStart(2, '0')}`
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7.5)
          doc.setTextColor(burgundy[0], burgundy[1], burgundy[2])
          doc.text(secTag, marginX + 14, y + 16)

          doc.setFontSize(13)
          doc.setTextColor(ink[0], ink[1], ink[2])
          doc.text(title, marginX + 14, y + 34)

          const progress = `Section ${sectionNum} of ${TOTAL_DOSSIER_SECTIONS}`
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.5)
          doc.setTextColor(muted[0], muted[1], muted[2])
          doc.text(progress, pageWidth - marginX - 14, y + 18, { align: 'right' })

          doc.setFontSize(8)
          doc.setTextColor(stone[0], stone[1], stone[2])
          const subLines = doc.splitTextToSize(subtitle, contentWidth - 160)
          doc.text(subLines, marginX + 14, y + 48)

          return y + bandH + 12
        }

        const drawContinuationBanner = (y: number) => {
          doc.setFillColor(248, 250, 252)
          doc.setDrawColor(navy[0], navy[1], navy[2])
          doc.roundedRect(marginX, y, contentWidth, 36, 6, 6, 'FD')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.setTextColor(navy[0], navy[1], navy[2])
          doc.text('OFFICIAL DOSSIER — CONTINUATION', marginX + 14, y + 23)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(muted[0], muted[1], muted[2])
          doc.text(getRegistrationReference(registration), pageWidth - marginX - 14, y + 23, { align: 'right' })
          return y + 36 + 14
        }

        const ensureSpace = (cursorY: number, blockHeight: number) => {
          if (cursorY + blockHeight <= pageHeight - bottomReserve) return cursorY

          doc.addPage()
          drawPageShell()
          return drawContinuationBanner(shellMargin + 24)
        }

        const drawCoverBlock = (startY: number) => {
          let y = startY
          doc.setTextColor(burgundy[0], burgundy[1], burgundy[2])
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.text('OFFICIAL DOSSIER', marginX, y)
          y += 16

          doc.setTextColor(ink[0], ink[1], ink[2])
          doc.setFontSize(22)
          doc.text('Registration Form', marginX, y)
          y += 28

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(stone[0], stone[1], stone[2])
          const introLines = doc.splitTextToSize(introParagraph, contentWidth - 8)
          doc.text(introLines, marginX, y)
          y += introLines.length * 13 + 18

          doc.setDrawColor(220, 218, 214)
          doc.setLineWidth(1)
          doc.line(marginX, y, pageWidth - marginX, y)
          y += 16

          const metaRows = [
            ['Reference', getRegistrationReference(registration)],
            ['Applicant', applicantName],
            ['Sector', sectorName],
            ['Status', `${status} (updated ${updatedAt})`],
            ['Contact', `${email}  ·  ${phone}`],
            ['Submitted', submittedAt],
          ] as const

          let innerH = 18
          for (const [, v] of metaRows) {
            const valueLines = doc.splitTextToSize(v, contentWidth - 100)
            innerH += Math.max(12, valueLines.length * 11)
          }
          const boxH = Math.max(78, innerH)

          doc.setFillColor(252, 250, 248)
          doc.setDrawColor(232, 229, 224)
          doc.roundedRect(marginX, y, contentWidth, boxH, 10, 10, 'FD')
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          let my = y + 14
          for (const [k, v] of metaRows) {
            doc.setTextColor(muted[0], muted[1], muted[2])
            doc.text(`${k}:`, marginX + 12, my)
            const valueLines = doc.splitTextToSize(v, contentWidth - 100)
            doc.setTextColor(ink[0], ink[1], ink[2])
            doc.setFont('helvetica', 'bold')
            doc.text(valueLines, marginX + 92, my)
            doc.setFont('helvetica', 'normal')
            my += Math.max(12, valueLines.length * 11)
          }
          return y + boxH + 20
        }

        drawPageShell()
        let cursorY = shellMargin + 28
        cursorY = drawCoverBlock(cursorY)

        const dossierBlocks = buildDossierSectionPayload(registration, englishEntries)
        const printableBlocks: DossierSectionBlock[] =
          dossierBlocks.length > 0
            ? dossierBlocks
            : [
                {
                  sectionNum: 1,
                  title: DOSSIER_SECTION_BLUEPRINT[0]!.title,
                  subtitle: DOSSIER_SECTION_BLUEPRINT[0]!.subtitle,
                  entries: [
                    {
                      key: 'empty',
                      label: 'Submitted fields',
                      value: 'No field responses were captured for this application.',
                    },
                  ],
                  extraEntries: [],
                },
              ]

        const estimateSubExtrasHeight = (extra: EnglishDataEntry[]) => {
          if (extra.length === 0) return 0
          let h = 28
          for (const entry of extra) {
            const desc = getFieldDescriptionEnglish(registration, entry.key)
            h += estimateDossierFieldHeight(entry, desc)
          }
          return h
        }

        for (const block of printableBlocks) {
          const headerH = estimateSectionHeaderHeight()
          let est = headerH
          for (const entry of block.entries) {
            const desc = entry.key === 'empty' ? '' : getFieldDescriptionEnglish(registration, entry.key)
            est += estimateDossierFieldHeight(entry, desc)
          }
          est += estimateSubExtrasHeight(block.extraEntries)
          cursorY = ensureSpace(cursorY, est + 8)
          cursorY = drawDossierSectionHeader(cursorY, block.sectionNum, block.title, block.subtitle)

          for (const entry of block.entries) {
            const desc = entry.key === 'empty' ? '' : getFieldDescriptionEnglish(registration, entry.key)
            const rowH = estimateDossierFieldHeight(entry, desc)
            cursorY = ensureSpace(cursorY, rowH + 8)
            cursorY = drawDossierFieldBlock(cursorY, entry, desc)
          }

          if (block.extraEntries.length > 0) {
            const subH = 28 + block.extraEntries.reduce((acc, entry) => {
              const desc = getFieldDescriptionEnglish(registration, entry.key)
              return acc + estimateDossierFieldHeight(entry, desc)
            }, 0)
            cursorY = ensureSpace(cursorY, subH + 8)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(navy[0], navy[1], navy[2])
            doc.text('Additional submitted fields (custom or legacy keys)', marginX + 12, cursorY)
            cursorY += 14
            doc.setDrawColor(226, 232, 240)
            doc.setLineWidth(0.75)
            doc.line(marginX + 8, cursorY, pageWidth - marginX - 8, cursorY)
            cursorY += 12
            for (const entry of block.extraEntries) {
              const desc = getFieldDescriptionEnglish(registration, entry.key)
              const rowH = estimateDossierFieldHeight(entry, desc)
              cursorY = ensureSpace(cursorY, rowH + 8)
              cursorY = drawDossierFieldBlock(cursorY, entry, desc)
            }
          }

          cursorY += 6
        }

        const totalPages = doc.getNumberOfPages()
        for (let page = 1; page <= totalPages; page += 1) {
          doc.setPage(page)
          doc.setTextColor(muted[0], muted[1], muted[2])
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text('JAZ — Official dossier export (English)', marginX, pageHeight - 20)
          doc.text(`${page} / ${totalPages}`, pageWidth - marginX, pageHeight - 20, { align: 'right' })
        }

        doc.save(toEnglishPdfFileName(registration))
        setFeedback({ kind: 'success', message: 'تم تنزيل ملف PDF بنجاح.' })
      } catch (error) {
        console.error('Failed to export sector registration PDF:', error)
        setFeedback({ kind: 'error', message: 'فشل إنشاء ملف PDF. حاول مرة أخرى.' })
      }
    })()
  }

  const activeFilters = [search.trim() !== '', statusFilter !== 'all', sectorFilter !== 'all'].filter(Boolean).length

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-stone-600">
                  SECTOR REGISTRATION DESK
                </Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-950 md:text-[2.35rem]">طلبات الشراكة في القطاعات</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
                    واجهة بسيطة لعرض الطلبات ومراجعتها وتحديث حالتها من مكان واحد.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-stone-200 bg-white px-5 text-stone-700 hover:bg-stone-50"
                onClick={exportFilteredItems}
              >
                <Download className="ml-2 h-4 w-4" />
                تصدير النتائج
              </Button>
              <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                <Filter className="h-4 w-4 text-stone-500" />
                {activeFilters > 0 ? `يوجد ${activeFilters} فلتر مفعّل الآن` : 'كل الطلبات معروضة حالياً'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStatCard
              label="إجمالي الطلبات"
              value={stats.all}
              hint="كل ما تم استلامه من النماذج"
              icon={Inbox}
              tone="from-stone-700 to-stone-900"
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <MiniStatCard
              label="قيد المراجعة"
              value={stats.pending}
              hint="الطلبات التي تنتظر قراراً"
              icon={Clock3}
              tone="from-amber-500 to-orange-600"
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            />
            <MiniStatCard
              label="طلبات مقبولة"
              value={stats.approved}
              hint="تمت الموافقة عليها"
              icon={CheckCircle2}
              tone="from-emerald-500 to-green-600"
              active={statusFilter === 'approved'}
              onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
            />
            <MiniStatCard
              label="طلبات مرفوضة"
              value={stats.rejected}
              hint="تم إغلاقها أو رفضها"
              icon={ShieldAlert}
              tone="from-rose-500 to-red-600"
              active={statusFilter === 'rejected'}
              onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
            />
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className={cn(
            'rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm',
            feedback.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          )}
        >
          {feedback.message}
        </div>
      )}

      <Card className="overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm">
        <CardHeader className="border-b border-stone-200 bg-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-stone-950">مركز المراجعة والفرز</CardTitle>
              <CardDescription className="mt-1 text-sm text-stone-500">
                ابحث باسم المتقدم أو البريد أو القطاع.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-500">
              <ClipboardList className="h-4 w-4 text-stone-500" />
              {filteredItems.length} نتيجة من أصل {stats.all}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.75fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم، الشركة، البريد، الهاتف أو أي حقل داخل الطلب..."
                className="h-12 rounded-2xl border-stone-200 bg-stone-50 pr-11 text-sm shadow-none transition-colors focus:border-stone-300 focus:bg-white"
              />
            </div>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="h-12 rounded-2xl border-stone-200 bg-stone-50">
                <SelectValue placeholder="كل القطاعات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل القطاعات</SelectItem>
                {sectorOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: 'all' | SectorRegistrationStatus) => setStatusFilter(value)}>
              <SelectTrigger className="h-12 rounded-2xl border-stone-200 bg-stone-50">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="pending">قيد المراجعة ({stats.pending})</SelectItem>
                <SelectItem value="approved">مقبول ({stats.approved})</SelectItem>
                <SelectItem value="rejected">مرفوض ({stats.rejected})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
              <SelectTrigger className="h-12 rounded-2xl border-stone-200 bg-stone-50">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                <SelectItem value="name">حسب الاسم</SelectItem>
                <SelectItem value="sector">حسب القطاع</SelectItem>
                <SelectItem value="status">حسب الحالة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-stone-200 bg-white px-3 py-1 text-stone-700">
                <ClipboardList className="ml-1 h-3.5 w-3.5" />
                {filteredItems.length} طلب ظاهر
              </Badge>
              <Badge variant="outline" className="rounded-full border-stone-200 bg-white px-3 py-1 text-stone-700">
                <Building2 className="ml-1 h-3.5 w-3.5" />
                {stats.sectors} قطاع
              </Badge>
              {activeFilters > 0 && (
                <Badge variant="outline" className="rounded-full border-[#8b0000]/15 bg-[#8b0000]/5 px-3 py-1 text-[#8b0000]">
                  {activeFilters} فلتر نشط
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100" onClick={clearFilters}>
                <X className="ml-2 h-4 w-4" />
                مسح الفلاتر
              </Button>
              <Button variant="outline" className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100" onClick={exportFilteredItems}>
                <FileSpreadsheet className="ml-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        <EmptyState
          title={stats.all === 0 ? 'لا توجد طلبات شراكة حتى الآن' : 'لا توجد نتائج مطابقة للفلاتر الحالية'}
          description={
            stats.all === 0
              ? 'بمجرد أن يبدأ الزوار أو الشركات بإرسال طلبات الشراكة من صفحات القطاعات، ستظهر هنا مع كل تفاصيلها وإجراءات إدارتها.'
              : 'جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض الطلبات المتاحة من جديد.'
          }
          onReset={stats.all === 0 ? undefined : clearFilters}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <Card className="overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-200 bg-stone-50 hover:bg-stone-50">
                      <TableHead className="w-[24%] py-4 pr-6">مقدم الطلب</TableHead>
                      <TableHead className="w-[15%]">القطاع</TableHead>
                      <TableHead className="w-[26%]">ملخص البيانات</TableHead>
                      <TableHead className="w-[13%]">الحالة</TableHead>
                      <TableHead className="w-[12%]">التاريخ</TableHead>
                      <TableHead className="w-[10%] text-left pl-6">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((registration) => {
                      const status = normalizeStatus(registration.status)
                      const previewEntries = getDataEntries(registration).slice(0, 3)
                      const email = getApplicantEmail(registration)
                      const phones = getApplicantPhones(registration)

                      return (
                        <TableRow
                          key={registration.id}
                          className="border-stone-100 hover:bg-stone-50"
                        >
                          <TableCell className="pr-6">
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white shadow-sm">
                                {getApplicantInitials(registration)}
                              </div>
                              <div className="min-w-0 space-y-1.5">
                                <button type="button" className="text-right text-base font-semibold text-stone-950 transition-colors hover:text-stone-700" onClick={() => setSelectedId(registration.id)}>
                                  {getApplicantName(registration)}
                                </button>
                                <div className="space-y-1">
                                  {email && (
                                    <div className="flex items-center gap-1.5 text-sm text-stone-500" dir="ltr">
                                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                                      <span className="truncate">{email}</span>
                                    </div>
                                  )}
                                  {phones[0] && (
                                    <div className="flex items-center gap-1.5 text-sm text-stone-500" dir="ltr">
                                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                                      <span>{phones[0]}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-2">
                              <Badge variant="outline" className="rounded-full border-stone-200 bg-stone-50 px-3 py-1 text-stone-700">
                                <Building2 className="ml-1 h-3.5 w-3.5 text-stone-500" />
                                {getSectorName(registration)}
                              </Badge>
                              {registration.sectors?.slug && (
                                <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{registration.sectors.slug}</p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-2">
                              {previewEntries.length > 0 ? previewEntries.map((entry) => (
                                <div key={entry.key} className="rounded-xl border border-stone-200 bg-white px-3 py-2">
                                  <p className="text-[11px] font-semibold tracking-[0.08em] text-stone-400">{entry.label}</p>
                                  <p className="mt-1 line-clamp-1 text-sm font-medium text-stone-800">{entry.value}</p>
                                </div>
                              )) : (
                                <p className="text-sm text-stone-400">لا توجد بيانات إضافية.</p>
                              )}
                              {getDataEntries(registration).length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedId(registration.id)}
                                  className="text-sm font-semibold text-[#8b0000] hover:text-[#6f0000]"
                                >
                                  عرض {getDataEntries(registration).length - 3} حقول إضافية
                                </button>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-3">
                              <StatusBadge status={status} />
                              <Select
                                value={status}
                                onValueChange={(value: SectorRegistrationStatus) => handleStatusChange(registration.id, value)}
                                disabled={pendingId === registration.id}
                              >
                                <SelectTrigger className="h-10 rounded-xl border-stone-200 bg-white text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                                  <SelectItem value="approved">قبول</SelectItem>
                                  <SelectItem value="rejected">رفض</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-800">
                                <CalendarDays className="h-3.5 w-3.5 text-stone-400" />
                                {registration.created_at ? formatDate(registration.created_at) : '-'}
                              </div>
                              <p className="text-xs text-stone-400">{formatRelativeDate(registration.created_at)}</p>
                            </div>
                          </TableCell>

                          <TableCell className="pl-6 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                                    onClick={() => setSelectedId(registration.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>فتح التفاصيل</TooltipContent>
                              </Tooltip>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl text-stone-600 hover:bg-stone-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel>إجراءات الطلب</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => setSelectedId(registration.id)}>
                                    <Eye className="ml-2 h-4 w-4" />
                                    عرض كل التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => copyRegistrationSummary(registration)}>
                                    {copiedKey === `summary-${registration.id}` ? <Check className="ml-2 h-4 w-4 text-emerald-600" /> : <Copy className="ml-2 h-4 w-4" />}
                                    نسخ بيانات الطلب
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => exportRegistrationPdf(registration)}>
                                    <Printer className="ml-2 h-4 w-4 text-blue-700" />
                                    Export PDF (EN)
                                  </DropdownMenuItem>
                                  {email && buildOutlookComposeUrl(registration) && (
                                    <DropdownMenuItem asChild>
                                      <a href={buildOutlookComposeUrl(registration) || '#'} target="_blank" rel="noreferrer">
                                        <Mail className="ml-2 h-4 w-4" />
                                        إرسال عبر Outlook
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  {phones[0] && (
                                    <DropdownMenuItem asChild>
                                      <a href={`https://wa.me/${formatPhoneForWhatsApp(phones[0])}`} target="_blank" rel="noreferrer">
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                        فتح واتساب
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {status !== 'approved' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'approved')}>
                                      <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-600" />
                                      اعتماد الطلب
                                    </DropdownMenuItem>
                                  )}
                                  {status !== 'pending' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'pending')}>
                                      <Clock3 className="ml-2 h-4 w-4 text-amber-600" />
                                      إعادة للمراجعة
                                    </DropdownMenuItem>
                                  )}
                                  {status !== 'rejected' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'rejected')}>
                                      <ShieldAlert className="ml-2 h-4 w-4 text-rose-600" />
                                      رفض الطلب
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-rose-700 focus:text-rose-700"
                                    onClick={() => handleDelete(registration)}
                                    disabled={deletingId === registration.id}
                                  >
                                    <Trash2 className="ml-2 h-4 w-4" />
                                    حذف الطلب
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {paginatedItems.map((registration) => {
              const status = normalizeStatus(registration.status)
              const email = getApplicantEmail(registration)
              const phones = getApplicantPhones(registration)
              const previewEntries = getDataEntries(registration).slice(0, 4)

              return (
                <Card
                  key={registration.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border-stone-200 bg-white shadow-sm',
                    `bg-gradient-to-br ${STATUS_META[status].surface}`
                  )}
                >
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white shadow-sm">
                          {getApplicantInitials(registration)}
                        </div>
                        <div className="space-y-1">
                          <button
                            type="button"
                            className="text-right text-base font-bold text-stone-950"
                            onClick={() => setSelectedId(registration.id)}
                          >
                            {getApplicantName(registration)}
                          </button>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge status={status} />
                            <Badge variant="outline" className="border-stone-200 bg-white/70 text-stone-700">
                              {getSectorName(registration)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl text-stone-600 hover:bg-white/80">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>إجراءات الطلب</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedId(registration.id)}>
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyRegistrationSummary(registration)}>
                            {copiedKey === `summary-${registration.id}` ? <Check className="ml-2 h-4 w-4 text-emerald-600" /> : <Copy className="ml-2 h-4 w-4" />}
                            نسخ البيانات
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportRegistrationPdf(registration)}>
                            <Printer className="ml-2 h-4 w-4 text-blue-700" />
                            Export PDF (EN)
                          </DropdownMenuItem>
                          {email && buildOutlookComposeUrl(registration) && (
                            <DropdownMenuItem asChild>
                              <a href={buildOutlookComposeUrl(registration) || '#'} target="_blank" rel="noreferrer">
                                <Mail className="ml-2 h-4 w-4" />
                                إرسال عبر Outlook
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'approved')}>
                            <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-600" />
                            قبول
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'pending')}>
                            <Clock3 className="ml-2 h-4 w-4 text-amber-600" />
                            مراجعة
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'rejected')}>
                            <ShieldAlert className="ml-2 h-4 w-4 text-rose-600" />
                            رفض
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-700 focus:text-rose-700" onClick={() => handleDelete(registration)}>
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 gap-2 rounded-[1.35rem] border border-white/80 bg-white/80 p-3">
                      {email && (
                        <div className="flex items-center gap-2 text-sm text-stone-600" dir="ltr">
                          <Mail className="h-3.5 w-3.5 text-stone-400" />
                          <span className="truncate">{email}</span>
                        </div>
                      )}
                      {phones[0] && (
                        <div className="flex items-center gap-2 text-sm text-stone-600" dir="ltr">
                          <Phone className="h-3.5 w-3.5 text-stone-400" />
                          <span>{phones[0]}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <CalendarDays className="h-3.5 w-3.5 text-stone-400" />
                        <span>{registration.created_at ? formatDateTime(registration.created_at) : '-'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {previewEntries.length > 0 ? previewEntries.map((entry) => (
                        <div key={entry.key} className="rounded-2xl border border-white/80 bg-white/78 px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{entry.label}</p>
                          <p className="mt-1 text-sm font-medium text-stone-800">{entry.value}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-stone-400">لا توجد حقول إضافية في هذا الطلب.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-11 rounded-2xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                        onClick={() => setSelectedId(registration.id)}
                      >
                        <Eye className="ml-2 h-4 w-4" />
                        التفاصيل
                      </Button>
                      <Select
                        value={status}
                        onValueChange={(value: SectorRegistrationStatus) => handleStatusChange(registration.id, value)}
                        disabled={pendingId === registration.id}
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-stone-200 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد المراجعة</SelectItem>
                          <SelectItem value="approved">قبول</SelectItem>
                          <SelectItem value="rejected">رفض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-white/92 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-500">
              صفحة {currentPage} من {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="ml-2 h-4 w-4" />
                السابق
              </Button>
              <div className="min-w-20 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-center text-sm font-semibold text-stone-700">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage >= totalPages}
              >
                التالي
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
      <DialogContent className="max-h-[92vh] max-w-[min(96vw,1120px)] overflow-hidden rounded-2xl border border-stone-200 bg-white p-0">
          {selected && (
            <>
              <div className="border-b border-stone-200 bg-white px-6 py-6 md:px-8">
                <DialogHeader className="space-y-4 text-right">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-[#8b0000]/15 bg-white/80 px-3 py-1 text-[#8b0000]">
                          {getSectorName(selected)}
                        </Badge>
                        <StatusBadge status={normalizeStatus(selected.status)} large />
                      </div>
                      <DialogTitle className="text-2xl font-black tracking-tight text-stone-950 md:text-3xl">
                        {getApplicantName(selected)}
                      </DialogTitle>
                      <DialogDescription className="max-w-2xl text-sm leading-7 text-stone-600">
                        طلب شراكة أُرسل في {selected.created_at ? formatDateTime(selected.created_at) : '-'} ويمكن من هنا مراجعة جميع الحقول، نسخها، والتواصل مع مقدم الطلب مباشرة.
                      </DialogDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                        onClick={() => copyRegistrationSummary(selected)}
                      >
                        {copiedKey === `summary-${selected.id}` ? <Check className="ml-2 h-4 w-4 text-emerald-600" /> : <Copy className="ml-2 h-4 w-4" />}
                        نسخ الملخص
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        onClick={() => exportRegistrationPdf(selected)}
                      >
                        <Printer className="ml-2 h-4 w-4" />
                        Export PDF (EN)
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                        onClick={() => handleStatusChange(selected.id, 'pending')}
                        disabled={pendingId === selected.id}
                      >
                        <Clock3 className="ml-2 h-4 w-4 text-amber-600" />
                        مراجعة
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => handleStatusChange(selected.id, 'approved')}
                        disabled={pendingId === selected.id}
                      >
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                        قبول
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        onClick={() => handleStatusChange(selected.id, 'rejected')}
                        disabled={pendingId === selected.id}
                      >
                        <ShieldAlert className="ml-2 h-4 w-4" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <ScrollArea className="max-h-[calc(92vh-11rem)]">
                <div className="space-y-6 px-6 py-6 md:px-8">
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                    <Card className="rounded-2xl border-stone-200 bg-white shadow-sm xl:col-span-2">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.3rem] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] text-lg font-black text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.8)]">
                            {getApplicantInitials(selected)}
                          </div>
                          <div className="min-w-0 space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Applicant Profile</p>
                            <h3 className="text-xl font-bold text-stone-950">{getApplicantName(selected)}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
                                <Building2 className="ml-1 h-3.5 w-3.5 text-[#8b0000]" />
                                {getSectorName(selected)}
                              </Badge>
                              {selected.user_id ? (
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                  <UserRound className="ml-1 h-3.5 w-3.5" />
                                  مستخدم مسجل
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
                                  <UserRound className="ml-1 h-3.5 w-3.5" />
                                  ضيف
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Created</p>
                        <p className="mt-3 text-lg font-bold text-stone-950">{selected.created_at ? formatDate(selected.created_at) : '-'}</p>
                        <p className="mt-1 text-sm text-stone-500">{formatRelativeDate(selected.created_at)}</p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Reference</p>
                            <p className="mt-3 text-lg font-black tracking-[0.08em] text-stone-950">{getRegistrationReference(selected)}</p>
                            <p className="mt-2 text-xs text-stone-500">
                              {selected.updated_at ? `آخر تحديث: ${formatCompactDateTime(selected.updated_at)}` : 'لم يتم تحديث الطلب بعد'}
                            </p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
                            <Hash className="h-5 w-5" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(selected.id, `full-id-${selected.id}`)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                        >
                          {copiedKey === `full-id-${selected.id}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          نسخ المعرف الكامل
                        </button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                    <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-black text-stone-950">قنوات التواصل</CardTitle>
                        <CardDescription>إرسال عبر Outlook، فتح واتساب، الاتصال المباشر، أو نسخ البيانات.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {getApplicantEmail(selected) ? (
                          <ContactPill
                            label="EMAIL"
                            value={getApplicantEmail(selected) || ''}
                            icon={Mail}
                            action={
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={buildOutlookComposeUrl(selected) || '#'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent>إرسال عبر Outlook</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200"
                                      onClick={() => copyText(getApplicantEmail(selected) || '', `email-${selected.id}`)}
                                    >
                                      {copiedKey === `email-${selected.id}` ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>نسخ البريد</TooltipContent>
                                </Tooltip>
                              </div>
                            }
                          />
                        ) : (
                          <div className="rounded-2xl border border-dashed border-stone-200 px-4 py-5 text-sm text-stone-400">
                            لا يوجد بريد إلكتروني واضح في هذا الطلب.
                          </div>
                        )}

                        {getApplicantPhones(selected).length > 0 ? (
                          getApplicantPhones(selected).map((phone, index) => (
                            <ContactPill
                              key={`${selected.id}-phone-${index}`}
                              label={index === 0 ? 'PRIMARY PHONE' : `PHONE ${index + 1}`}
                              value={phone}
                              icon={Phone}
                              action={
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={`tel:${phone}`}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200"
                                      >
                                        <PhoneCall className="h-4 w-4" />
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>اتصال</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>واتساب</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200"
                                        onClick={() => copyText(phone, `phone-${selected.id}-${index}`)}
                                      >
                                        {copiedKey === `phone-${selected.id}-${index}` ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>نسخ الرقم</TooltipContent>
                                  </Tooltip>
                                </div>
                              }
                            />
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-stone-200 px-4 py-5 text-sm text-stone-400">
                            لا يوجد رقم هاتف واضح في هذا الطلب.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-black text-stone-950">كل الحقول المرسلة</CardTitle>
                        <CardDescription>عرض كامل لجميع القيم القادمة من نموذج القطاع مع عناوينها المترجمة.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {getDataEntries(selected).length > 0 ? (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {getDataEntries(selected).map((entry) => (
                              <div key={entry.key} className="rounded-[1.35rem] border border-stone-200 bg-stone-50/70 p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-stone-900">{entry.label}</p>
                                    {entry.description && (
                                      <p className="mt-1 text-xs leading-6 text-stone-500">{entry.description}</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyText(entry.value, `field-${selected.id}-${entry.key}`)}
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
                                  >
                                    {copiedKey === `field-${selected.id}-${entry.key}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                </div>
                                <Separator className="my-3 bg-stone-200" />
                                <p className="break-words text-sm font-medium leading-7 text-stone-800">{entry.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[1.5rem] border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-400">
                            لم يتم العثور على حقول إضافية صالحة داخل هذا الطلب.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-lg font-black text-stone-950">إجراءات سريعة</CardTitle>
                        <CardDescription>إدارة الحالة أو حذف الطلب مباشرة من نافذة التفاصيل.</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          onClick={() => handleStatusChange(selected.id, 'approved')}
                          disabled={pendingId === selected.id}
                        >
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                          قبول الطلب
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          onClick={() => handleStatusChange(selected.id, 'pending')}
                          disabled={pendingId === selected.id}
                        >
                          <Clock3 className="ml-2 h-4 w-4" />
                          إبقاؤه قيد المراجعة
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          onClick={() => handleStatusChange(selected.id, 'rejected')}
                          disabled={pendingId === selected.id}
                        >
                          <ShieldAlert className="ml-2 h-4 w-4" />
                          رفض الطلب
                        </Button>
                        <Button
                          variant="danger"
                          className="rounded-xl"
                          onClick={() => handleDelete(selected)}
                          isLoading={deletingId === selected.id}
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف الطلب
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
