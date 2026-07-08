'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    ArrowRight,
    CheckCircle2,
    Mail,
    AlertTriangle,
} from 'lucide-react'
import {
    searchRegistrations,
    createManualRegistration,
} from '../actions'

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

export function NewCaseDialog({ open, onOpenChange, events }: NewCaseDialogProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)

    // الخطوة 1: البحث عن عميل موجود
    const [searchQuery, setSearchQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [hasSearched, setHasSearched] = useState(false)

    // الخطوة 2: إنشاء تسجيل جديد
    const [newForm, setNewForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        eventId: '',
        source: '',
        campaignName: '',
        servicePackage: 'registration_only',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)

    function reset() {
        setStep(1)
        setSearchQuery('')
        setResults([])
        setHasSearched(false)
        setNewForm({ fullName: '', phone: '', email: '', eventId: '', source: '', campaignName: '', servicePackage: 'registration_only', notes: '' })
    }

    function handleClose(open: boolean) {
        if (!open) reset()
        onOpenChange(open)
    }

    async function handleSearch() {
        if (searchQuery.trim().length < 2) return
        setSearching(true)
        setHasSearched(true)
        try {
            const { data, error } = await searchRegistrations(searchQuery)
            if (error) toast.error(error)
            else setResults(data)
        } catch { toast.error('فشل البحث') } finally { setSearching(false) }
    }

    function goToNewForm(prefillName = '') {
        setNewForm((prev) => ({ ...prev, fullName: prefillName }))
        setStep(2)
    }

    async function handleCreate() {
        if (!newForm.fullName.trim()) { toast.error('الاسم مطلوب'); return }
        if (!newForm.eventId) { toast.error('يجب اختيار فعالية'); return }
        const selectedEvent = events.find((ev) => ev.id === newForm.eventId)
        if (['closed', 'cancelled', 'completed', 'inactive'].includes(String(selectedEvent?.status || '').toLowerCase())) {
            toast.error('هذه الفعالية مغلقة ولا يمكن إضافة ملف مشاركة لها بدون تجاوز مشرف')
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
                notes: newForm.notes,
            })
            if (error || !data) {
                toast.error(error || 'فشل إنشاء الملف')
            } else {
                toast.success(`تم إنشاء الملف ${data.case_number}`)
                handleClose(false)
                router.push(`/dashboard/participation-cases/${data.id}`)
            }
        } catch { toast.error('فشل إنشاء الملف') } finally { setSubmitting(false) }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">طلب مشاركة جديد</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">إنشاء ملف مشاركة — يُسجَّل في جدول التسجيلات</DialogDescription>
                </DialogHeader>

                <StepIndicator step={step} />

                {/* الخطوة 1: البحث */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span><strong>قاعدة:</strong> ابحث أولاً عن العميل لتجنّب التكرار. إذا وُجد، افتح ملفه مباشرة.</span>
                        </div>
                        <Label className="text-sm font-semibold text-slate-700">البحث عن عميل موجود</Label>
                        <div className="flex gap-2">
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="الاسم، الهاتف، الإيميل، أو رقم ملف..."
                                className="border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20" />
                            <Button type="button" onClick={handleSearch} disabled={searching || searchQuery.trim().length < 2}
                                className="bg-slate-800 hover:bg-slate-900 text-white gap-1.5 shrink-0">
                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                بحث
                            </Button>
                        </div>

                        {hasSearched && !searching && (
                            <div className="space-y-2">
                                {results.length > 0 ? (
                                    results.map((r) => (
                                        <button key={r.id} type="button"
                                            onClick={() => router.push(`/dashboard/participation-cases/${r.id}`)}
                                            className="w-full text-right flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                    <UserCheck className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-900 truncate">{r.full_name}</div>
                                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                                        {r.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{r.email}</span>}
                                                        {r.case_number && <span className="font-mono">{r.case_number}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">فتح الملف</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">لم يُعثر على عميل مطابق.</div>
                                )}
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => goToNewForm()}
                                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5">
                                <ArrowRight className="w-4 h-4" />
                                إنشاء تسجيل جديد
                            </Button>
                        </div>
                    </div>
                )}

                {/* الخطوة 2: إنشاء تسجيل جديد */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <Label className="text-xs font-semibold text-slate-700">الاسم الكامل *</Label>
                                <Input value={newForm.fullName} onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })} className="border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20 mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-slate-700">رقم الهاتف</Label>
                                <Input value={newForm.phone} onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })} dir="ltr" className="border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20 mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-slate-700">البريد الإلكتروني</Label>
                                <Input type="email" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} dir="ltr" className="border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20 mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-xs font-semibold text-slate-700">الفعالية *</Label>
                                <select value={newForm.eventId} onChange={(e) => setNewForm({ ...newForm, eventId: e.target.value })}
                                    className="mt-1 h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none w-full">
                                    <option value="">— اختر فعالية —</option>
                                    {events.map((ev) => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.title_ar || ev.title}{ev.date ? ` (${new Date(ev.date).toLocaleDateString('ar-IQ')})` : ''}{ev.status ? ` - ${ev.status}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-xs font-semibold text-slate-700">نوع الخدمة</Label>
                                <select value={newForm.servicePackage} onChange={(e) => setNewForm({ ...newForm, servicePackage: e.target.value })}
                                    className="mt-1 h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none w-full">
                                    {SERVICE_PACKAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-slate-700">مصدر العميل</Label>
                                <select value={newForm.source} onChange={(e) => setNewForm({ ...newForm, source: e.target.value })}
                                    className="mt-1 h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none w-full">
                                    <option value="">— اختر —</option>
                                    {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-slate-700">اسم الحملة</Label>
                                <Input value={newForm.campaignName} onChange={(e) => setNewForm({ ...newForm, campaignName: e.target.value })} className="border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20 mt-1" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-slate-600 gap-1">
                                <ArrowRight className="w-4 h-4" /> رجوع
                            </Button>
                            <Button type="button" onClick={handleCreate} disabled={submitting || !newForm.fullName.trim() || !newForm.eventId}
                                className="bg-[linear-gradient(135deg,#8b0000,#c2410c)] hover:opacity-90 text-white gap-1.5">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                إنشاء الملف
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function StepIndicator({ step }: { step: Step }) {
    const steps = [{ n: 1, label: 'البحث' }, { n: 2, label: 'إنشاء التسجيل' }]
    return (
        <div className="flex items-center gap-2">
            {steps.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-1.5 ${step >= s.n ? 'text-[#8b0000]' : 'text-slate-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            step > s.n ? 'bg-emerald-500 text-white' : step === s.n ? 'bg-[#8b0000] text-white' : 'bg-slate-100 text-slate-400'
                        }`}>{step > s.n ? '✓' : s.n}</div>
                        <span className="text-[11px] font-semibold whitespace-nowrap">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`h-px flex-1 ${step > s.n ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                </div>
            ))}
        </div>
    )
}
