'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Search,
    Loader2,
    UserCheck,
    ArrowLeft,
    CheckCircle2,
    Mail,
    AlertTriangle,
    Check,
} from 'lucide-react'
import {
    searchClients,
    createManualRegistration,
} from '../actions'
import { cn } from '@/lib/utils'
import {
    Section,
    FormGrid,
    FormField,
    InlineAlert,
    inputClass,
    selectClass,
} from '@/app/dashboard/participation-cases/[id]/tabs/shared'

interface NewCaseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    events: any[]
}

type Step = 1 | 2

const SOURCE_OPTIONS = [
    { value: 'facebook_ad', label: 'إعلان فيسبوك' },
    { value: 'instagram', label: 'انستغرام' },
    { value: 'whatsapp', label: 'واتساب' },
    { value: 'website', label: 'الموقع الإلكتروني' },
    { value: 'referral', label: 'إحالة' },
    { value: 'direct_visit', label: 'زيارة مباشرة' },
    { value: 'other', label: 'أخرى' },
]

const SERVICE_PACKAGES = [
    { value: 'registration_only', label: 'تسجيل فقط' },
    { value: 'registration_invitation', label: 'تسجيل + دعوة' },
    { value: 'registration_invitation_visa', label: 'تسجيل + دعوة + فيزا' },
    { value: 'full', label: 'خدمة كاملة' },
]

const ATTENDANCE_TYPES = [
    { value: 'Business Visitor', label: 'زائر أعمال' },
    { value: 'Exhibitor', label: 'عارض' },
    { value: 'Speaker', label: 'متحدث' },
]

function formatEventDate(date?: string | null) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-GB')
}

function getEventLabel(event: any) {
    const name = event?.title_ar || event?.title || 'Event'
    const place = event?.location_ar || event?.location || event?.country_ar || event?.country
    const date = formatEventDate(event?.date)
    return [name, place, date].filter(Boolean).join(' • ')
}

function buildTravelPurpose(event: any, attendanceType: string) {
    if (!event) return ''
    const roleLabel = ATTENDANCE_TYPES.find((type) => type.value === attendanceType)?.label || attendanceType
    const name = event.title_ar || event.title || 'الفعالية'
    const place = event.location_ar || event.location || event.country_ar || event.country
    const date = formatEventDate(event.date)
    return `حضور ${name}${place ? ` في ${place}` : ''}${date ? ` بتاريخ ${date}` : ''} بصفة ${roleLabel}`
}

export function NewCaseDialog({ open, onOpenChange, events }: NewCaseDialogProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)

    const [searchName, setSearchName] = useState('')
    const [searchDob, setSearchDob] = useState('')
    const [searchPob, setSearchPob] = useState('')
    const [searching, setSearching] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedClient, setSelectedClient] = useState<any>(null)

    const [newForm, setNewForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        eventId: '',
        source: '',
        campaignName: '',
        servicePackage: 'registration_only',
        attendanceType: 'Business Visitor',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const availableEvents = events.filter((event) => String(event?.status || 'published').toLowerCase() === 'published')
    const selectedEvent = availableEvents.find((event) => event.id === newForm.eventId)
    const travelPurpose = buildTravelPurpose(selectedEvent, newForm.attendanceType)

    function reset() {
        setStep(1)
        setSearchName('')
        setSearchDob('')
        setSearchPob('')
        setResults([])
        setHasSearched(false)
        setSelectedClient(null)
        setNewForm({ fullName: '', phone: '', email: '', eventId: '', source: '', campaignName: '', servicePackage: 'registration_only', attendanceType: 'Business Visitor', notes: '' })
    }

    function handleClose(open: boolean) {
        if (!open) reset()
        onOpenChange(open)
    }

    async function handleSearch() {
        if (!searchName.trim()) {
            toast.error('الاسم مطلوب للبحث')
            return
        }
        setSearching(true)
        setHasSearched(true)
        try {
            const { data, error } = await searchClients({
                fullName: searchName,
                dateOfBirth: searchDob || undefined,
                placeOfBirth: searchPob || undefined,
            })
            if (error) toast.error(error)
            else setResults(data)
        } catch { toast.error('فشل البحث') } finally { setSearching(false) }
    }

    function selectClient(client: any) {
        setSelectedClient(client)
        setNewForm((prev) => ({
            ...prev,
            fullName: client.full_name_as_passport,
            phone: client.phone || '',
            email: client.email || '',
        }))
        setStep(2)
    }

    function goToNewForm() {
        setSelectedClient(null)
        setNewForm((prev) => ({ ...prev, fullName: searchName }))
        setStep(2)
    }

    async function handleCreate() {
        if (!newForm.fullName.trim()) { toast.error('الاسم مطلوب'); return }
        if (!newForm.eventId) { toast.error('يجب اختيار فعالية'); return }
        if (!selectedEvent) {
            toast.error('هذه الفعالية غير منشورة أو غير متاحة لإنشاء طلب جديد')
            return
        }
        if (newForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newForm.email)) {
            toast.error('صيغة البريد الإلكتروني غير صحيحة')
            return
        }
        setSubmitting(true)
        try {
            const { data, error } = await createManualRegistration({
                eventId: newForm.eventId,
                fullName: newForm.fullName,
                phone: newForm.phone,
                email: newForm.email,
                source: newForm.source,
                campaignName: newForm.campaignName,
                servicePackage: newForm.servicePackage,
                attendanceType: newForm.attendanceType,
                travelPurpose,
                notes: newForm.notes,
                clientId: selectedClient?.id,
            })
            if (error || !data) {
                toast.error(error || 'فشل إنشاء الطلب')
            } else {
                toast.success(`تم إنشاء الطلب ${data.case_number}`)
                handleClose(false)
                router.push(`/dashboard/participation-cases/${data.id}`)
            }
        } catch { toast.error('فشل إنشاء الطلب') } finally { setSubmitting(false) }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0" dir="rtl">
                <DialogHeader className="px-5 py-4 border-b border-[var(--jaz-line)]">
                    <div className="flex items-center gap-2 mb-1">
                        <span aria-hidden className="size-1.5 rounded-full bg-[var(--jaz-sovereign)]" />
                        <span className="jaz-meta tracking-[0.16em]">Inbox / New case</span>
                    </div>
                    <DialogTitle className="text-[15px] font-semibold text-[var(--jaz-ink)]">طلب جديد</DialogTitle>
                    <DialogDescription className="text-[12px] text-[var(--jaz-muted)]">
                        ابحث أولاً لتجنب التكرار، ثم أنشئ التسجيل في خطوة واحدة.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-5 py-4 space-y-5">
                    <StepIndicator step={step} />

                    {/* ====== Step 1: search ===================================== */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <InlineAlert variant="info">
                                <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                                <span><strong>قاعدة:</strong> ابحث أولاً عن العميل لتجنّب التكرار. إذا وُجد، افتح ملفه مباشرة.</span>
                            </InlineAlert>

                            <Section title="Search existing client" desc="By full name + optional DOB and place of birth.">
                                <FormGrid columns={2}>
                                    <FormField label="Full name" required span={2}>
                                        <input
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                            placeholder="e.g. أحمد كريم…"
                                            dir="rtl"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className={inputClass}
                                        />
                                    </FormField>
                                    <FormField label="Date of birth">
                                        <input
                                            type="date"
                                            value={searchDob}
                                            onChange={(e) => setSearchDob(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className={inputClass}
                                        />
                                    </FormField>
                                    <FormField label="Place of birth">
                                        <input
                                            value={searchPob}
                                            onChange={(e) => setSearchPob(e.target.value)}
                                            placeholder="e.g. Baghdad"
                                            dir="ltr"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className={inputClass}
                                        />
                                    </FormField>
                                </FormGrid>
                                <div className="flex justify-end pt-4 mt-5 border-t border-[var(--jaz-line)]">
                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={searching || !searchName.trim()}
                                        className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-md bg-[var(--jaz-sovereign)] hover:bg-[var(--jaz-sovereign-2)] text-white text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jaz-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                                        Search & match
                                    </button>
                                </div>
                            </Section>

                            {hasSearched && !searching && (
                                <Section
                                    title="Matches"
                                    desc={`${results.length} candidate${results.length === 1 ? '' : 's'}`}
                                >
                                    {results.length > 0 ? (
                                        <ul className="-mx-5 divide-y divide-[var(--jaz-line)]">
                                            {results.map((r) => (
                                                <li key={r.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => selectClient(r)}
                                                        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-right hover:bg-[var(--jaz-surface-2)]/40 transition-colors duration-150 group"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] text-[var(--jaz-ink-soft)]">
                                                                <UserCheck className="size-4" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-[var(--jaz-ink)] text-[13.5px] truncate">
                                                                    {r.full_name_as_passport}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-[11.5px] text-[var(--jaz-muted)] mt-0.5 min-w-0">
                                                                    {r.email && (
                                                                        <span className="flex items-center gap-1 truncate">
                                                                            <Mail className="size-3 shrink-0" />
                                                                            <span className="truncate" dir="ltr">{r.email}</span>
                                                                        </span>
                                                                    )}
                                                                    {r.phone && <span dir="ltr">{r.phone}</span>}
                                                                    {r.passport_number && (
                                                                        <span className="jaz-mono px-1.5 py-0.5 rounded border border-[var(--jaz-line)] bg-[var(--jaz-surface-2)] text-[10px] text-[var(--jaz-ink-soft)] whitespace-nowrap">
                                                                            {r.passport_number}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--jaz-muted)] group-hover:text-[var(--jaz-sovereign)] transition-colors shrink-0">
                                                            Select client
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8 text-[13px] text-[var(--jaz-muted)] border border-dashed border-[var(--jaz-line)] rounded-md">
                                            No matching client — create a new profile below.
                                        </div>
                                    )}
                                </Section>
                            )}

                            <button
                                type="button"
                                onClick={goToNewForm}
                                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[13px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] hover:border-[var(--jaz-sovereign)]/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jaz-surface)]"
                            >
                                <ArrowLeft className="size-3.5" />
                                Create a new client profile
                            </button>
                        </div>
                    )}

                    {/* ====== Step 2: Create registration ========================== */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {selectedClient && (
                                <InlineAlert variant="success">
                                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                                    <span>
                                        تم ربط الطلب بالعميل المسجّل: <strong>{selectedClient.full_name_as_passport}</strong>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClient(null)}
                                        className="ms-auto text-[11px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-muted)] transition-colors shrink-0"
                                    >
                                        Unlink
                                    </button>
                                </InlineAlert>
                            )}

                            <Section title="Client & application">
                                <FormGrid>
                                    <FormField label="Full name" required span={2}>
                                        <input
                                            value={newForm.fullName}
                                            onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                                            className={inputClass}
                                        />
                                    </FormField>
                                    <FormField label="Phone">
                                        <input
                                            value={newForm.phone}
                                            onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                                            dir="ltr"
                                            className={inputClass}
                                        />
                                    </FormField>
                                    <FormField label="Email">
                                        <input
                                            type="email"
                                            value={newForm.email}
                                            onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                                            dir="ltr"
                                            className={inputClass}
                                        />
                                    </FormField>
                                    <FormField label="Event" required span={2}>
                                        <select
                                            value={newForm.eventId}
                                            onChange={(e) => setNewForm({ ...newForm, eventId: e.target.value })}
                                            className={selectClass}
                                        >
                                            <option value="">— Select event —</option>
                                            {availableEvents.map((ev) => (
                                                <option key={ev.id} value={ev.id}>
                                                    {getEventLabel(ev)}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label="Attendance type">
                                        <select
                                            value={newForm.attendanceType}
                                            onChange={(e) => setNewForm({ ...newForm, attendanceType: e.target.value })}
                                            className={selectClass}
                                        >
                                            {ATTENDANCE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Service package" span={2}>
                                        <select
                                            value={newForm.servicePackage}
                                            onChange={(e) => setNewForm({ ...newForm, servicePackage: e.target.value })}
                                            className={selectClass}
                                        >
                                            {SERVICE_PACKAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </FormField>
                                    {travelPurpose && (
                                        <FormField label="Travel purpose" span={2}>
                                            <div className="min-h-10 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface-2)] px-3 py-2 text-[13px] leading-6 text-[var(--jaz-ink-soft)]">
                                                {travelPurpose}
                                            </div>
                                        </FormField>
                                    )}
                                    <FormField label="Client source">
                                        <select
                                            value={newForm.source}
                                            onChange={(e) => setNewForm({ ...newForm, source: e.target.value })}
                                            className={selectClass}
                                        >
                                            <option value="">— Select —</option>
                                            {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Campaign name">
                                        <input
                                            value={newForm.campaignName}
                                            onChange={(e) => setNewForm({ ...newForm, campaignName: e.target.value })}
                                            className={inputClass}
                                        />
                                    </FormField>
                                </FormGrid>
                            </Section>

                            <div className="flex items-center justify-between gap-2 pt-4 border-t border-[var(--jaz-line)]">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-[var(--jaz-muted)] hover:text-[var(--jaz-ink-soft)] hover:bg-[var(--jaz-surface-2)]/60 transition-colors duration-150"
                                >
                                    <ArrowLeft className="size-3.5" />
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={submitting || !newForm.fullName.trim() || !newForm.eventId}
                                    className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-md bg-[var(--jaz-sovereign)] hover:bg-[var(--jaz-sovereign-2)] text-white text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jaz-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                                    Create case
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function StepIndicator({ step }: { step: Step }) {
    const steps = [{ n: 1, label: 'البحث' }, { n: 2, label: 'بيانات الطلب' }]
    return (
        <div className="flex items-center gap-3" aria-label="Dialog step">
            {steps.map((s, i) => {
                const isComplete = step > s.n
                const isActive = step === s.n
                return (
                    <div key={s.n} className="flex items-center gap-2.5 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className={cn(
                                    'flex size-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-200',
                                    isComplete && 'bg-[var(--jaz-emerald)] text-white',
                                    isActive && 'bg-[var(--jaz-sovereign)] text-white',
                                    !isComplete && !isActive && 'bg-[var(--jaz-surface-2)] text-[var(--jaz-whisper)] border border-[var(--jaz-line)]',
                                )}
                            >
                                {isComplete ? <Check className="size-3" strokeWidth={3} /> : s.n}
                            </div>
                            <span
                                className={cn(
                                    'text-[11px] font-semibold whitespace-nowrap',
                                    isActive && 'text-[var(--jaz-sovereign)]',
                                    isComplete && 'text-[var(--jaz-emerald)]',
                                    !isActive && !isComplete && 'text-[var(--jaz-muted)]',
                                )}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                aria-hidden
                                className={cn(
                                    'h-px flex-1 transition-colors duration-200',
                                    step > s.n ? 'bg-[var(--jaz-emerald)]' : 'bg-[var(--jaz-line)]',
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
