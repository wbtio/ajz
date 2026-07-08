'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    FolderKanban,
    Plus,
    Search,
    ChevronLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Phone,
    Calendar,
} from 'lucide-react'
import { NewCaseDialog } from './new-case-dialog'

const STATUS_LABELS: Record<string, string> = {
    new_request: 'طلب جديد',
    data_incomplete: 'بيانات ناقصة',
    data_complete: 'بيانات مكتملة',
    payment_pending: 'بانتظار الدفع',
    payment_confirmed: 'تم تأكيد الدفع',
    registration_in_progress: 'التسجيل جارٍ',
    under_review: 'تحت المراجعة',
    invitation_requested: 'تم طلب الدعوة',
    invitation_received: 'تم استلام الدعوة',
    visa_in_progress: 'الفيزا قيد المعالجة',
    appointment_booked: 'تم حجز الموعد',
    final_qc: 'مراقبة الجودة',
    correction_required: 'يلزم تصحيح',
    completed: 'مكتمل',
    on_hold: 'متوقف مؤقتاً',
    cancelled: 'ملغي',
    closed: 'مغلق',
}

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
    closed: 'bg-slate-100 text-slate-500',
    on_hold: 'bg-amber-50 text-amber-700',
    correction_required: 'bg-rose-50 text-rose-700',
    payment_confirmed: 'bg-emerald-50 text-emerald-700',
}

const PAYMENT_LABELS: Record<string, string> = {
    paid: 'مدفوع',
    pending: 'بانتظار الدفع',
    partially_paid: 'مدفوع جزئياً',
    not_invoiced: 'بدون فاتورة',
}

const PAYMENT_COLORS: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    partially_paid: 'bg-amber-50 text-amber-700',
    not_invoiced: 'bg-slate-100 text-slate-600',
}

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'كل الحالات' },
    { value: 'new_request', label: 'طلب جديد' },
    { value: 'data_incomplete', label: 'بيانات ناقصة' },
    { value: 'data_complete', label: 'بيانات مكتملة' },
    { value: 'payment_pending', label: 'بانتظار الدفع' },
    { value: 'payment_confirmed', label: 'تم تأكيد الدفع' },
    { value: 'registration_in_progress', label: 'التسجيل جارٍ' },
    { value: 'under_review', label: 'تحت المراجعة' },
    { value: 'invitation_requested', label: 'تم طلب الدعوة' },
    { value: 'invitation_received', label: 'تم استلام الدعوة' },
    { value: 'visa_in_progress', label: 'الفيزا قيد المعالجة' },
    { value: 'appointment_booked', label: 'تم حجز الموعد' },
    { value: 'final_qc', label: 'مراقبة الجودة' },
    { value: 'correction_required', label: 'يلزم تصحيح' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'on_hold', label: 'متوقف مؤقتاً' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'closed', label: 'مغلق' },
]

function statusBadge(status: string) {
    return (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${STATUS_COLORS[status] || 'bg-blue-50 text-blue-700'}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}

function paymentBadge(ps: string) {
    return (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${PAYMENT_COLORS[ps] || 'bg-slate-100 text-slate-600'}`}>
            {PAYMENT_LABELS[ps] || ps}
        </span>
    )
}

function formatDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('ar-IQ') } catch { return '—' }
}

function getPhone(formData: any): string | null {
    if (!formData || typeof formData !== 'object') return null
    return formData.phone || null
}

interface CasesViewProps {
    initialCases: any[]
    events: any[]
}

export function CasesView({ initialCases, events }: CasesViewProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)

    const filteredCases = useMemo(() => {
        return initialCases.filter((c) => {
            if (statusFilter !== 'all' && c.case_status !== statusFilter) return false
            if (search.trim()) {
                const q = search.trim().toLowerCase()
                const haystack = [
                    c.case_number,
                    c.full_name,
                    c.email,
                    c.events?.title,
                    c.events?.title_ar,
                ].filter(Boolean).join(' ').toLowerCase()
                if (!haystack.includes(q)) return false
            }
            return true
        })
    }, [initialCases, search, statusFilter])

    const kpis = useMemo(() => {
        const total = initialCases.length
        const inProgress = initialCases.filter((c) => !['completed', 'closed', 'cancelled'].includes(c.case_status || '')).length
        const completed = initialCases.filter((c) => ['completed', 'closed'].includes(c.case_status || '')).length
        const needsAttention = initialCases.filter((c) => ['correction_required', 'data_incomplete', 'on_hold'].includes(c.case_status || '')).length
        return { total, inProgress, completed, needsAttention }
    }, [initialCases])

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#8b0000,#c2410c)] flex items-center justify-center shadow-sm">
                        <FolderKanban className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">ملفات المشاركة</h1>
                        <p className="text-xs text-slate-500 mt-0.5">إدارة طلبات المشاركة في الفعاليات</p>
                    </div>
                </div>
                <Button onClick={() => setIsNewDialogOpen(true)} className="bg-[linear-gradient(135deg,#8b0000,#c2410c)] hover:opacity-90 text-white gap-1.5 rounded-xl h-10">
                    <Plus className="w-4 h-4" />
                    طلب مشاركة جديد
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard icon={FolderKanban} label="إجمالي الملفات" value={kpis.total} color="bg-blue-50 text-blue-600" />
                <KpiCard icon={Clock} label="قيد المعالجة" value={kpis.inProgress} color="bg-amber-50 text-amber-600" />
                <KpiCard icon={CheckCircle2} label="مكتمل" value={kpis.completed} color="bg-emerald-50 text-emerald-600" />
                <KpiCard icon={AlertCircle} label="تحتاج متابعة" value={kpis.needsAttention} color="bg-rose-50 text-rose-600" />
            </div>

            <Card className="border-slate-200 shadow-sm rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم الملف، الاسم، الهاتف، الإيميل..."
                        className="pr-9 border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20 rounded-lg bg-white" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none min-w-[160px]">
                    {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr className="text-right">
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">رقم الملف</th>
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">العميل</th>
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">الفعالية</th>
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">الحالة</th>
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">الدفع</th>
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">الموظف</th>
                                <th className="py-3 px-4 font-semibold text-slate-600 text-xs">التاريخ</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCases.map((c) => {
                                const phone = getPhone(c.form_data)
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/participation-cases/${c.id}`)}>
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-xs font-semibold text-[#8b0000]">{c.case_number}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-900">{c.full_name || '—'}</div>
                                            {phone && <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {phone}</div>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-slate-800">{c.events?.title_ar || c.events?.title || '—'}</div>
                                            {c.events?.date && <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" /> {formatDate(c.events.date)}</div>}
                                        </td>
                                        <td className="py-3 px-4">{statusBadge(c.case_status)}</td>
                                        <td className="py-3 px-4">{paymentBadge(c.payment_status)}</td>
                                        <td className="py-3 px-4 text-slate-600 text-xs">{c.employee?.full_name || '—'}</td>
                                        <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(c.created_at)}</td>
                                        <td className="py-3 px-4"><ChevronLeft className="w-4 h-4 text-slate-400" /></td>
                                    </tr>
                                )
                            })}
                            {filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <FolderKanban className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="text-slate-500 text-sm">
                                            {initialCases.length === 0 ? 'لا توجد ملفات مشاركة بعد. ابدأ بإنشاء أول ملف.' : 'لا توجد ملفات تطابق بحثك.'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <NewCaseDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} events={events} />
        </div>
    )
}

function KpiCard({ icon: Icon, label, value, color }: { icon: typeof FolderKanban; label: string; value: number; color: string }) {
    return (
        <Card className="border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-900 leading-none">{value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{label}</div>
            </div>
        </Card>
    )
}
