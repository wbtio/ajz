'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    FileSpreadsheet, Search, Phone, Copy, Check, MessageCircle,
    Users, CheckCircle2, Clock, XCircle, ClipboardList, Eye,
    Inbox, Smartphone, Globe,
    Mail, ArrowLeft, ArrowRight, ExternalLink, FileText,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────
interface UnifiedRegistration {
    id: string
    source: 'app' | 'website'
    name: string
    email: string | null
    phone: string | null
    status: string | null
    payment_status?: string | null
    total_amount?: number | null
    raw_data: Record<string, unknown> | null
    notes?: string | null
    created_at: string | null
    documents?: any[] | null
    user_id?: string | null
    event_title?: string | null
}

interface Props {
    registrations: Record<string, unknown>[]
}

// ─── Source Config — تمييز بالأيقونة فقط، لا ألوان متفرقة ──
const SOURCES = [
    { key: 'all',     label: 'الكل',               icon: Inbox },
    { key: 'app',     label: 'تطبيق الجوال',       icon: Smartphone },
    { key: 'website', label: 'الموقع الإلكتروني',  icon: Globe },
] as const

const ITEMS_PER_PAGE = 25

// ─── Helpers ─────────────────────────────────────────────
function extractPhone(data: Record<string, unknown> | null, explicit?: string | null): string | null {
    if (explicit) return explicit
    if (!data) return null
    for (const val of Object.values(data)) {
        const str = String(val).replace(/\s/g, '')
        if (/^[\+]?[0-9]{8,15}$/.test(str) || /^0[0-9]{9,11}$/.test(str)) return String(val)
    }
    return null
}

function extractEmail(data: Record<string, unknown> | null, explicit?: string | null): string | null {
    if (explicit) return explicit
    if (!data) return null
    for (const val of Object.values(data)) {
        const str = String(val).trim()
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return str
    }
    return null
}

function extractName(data: Record<string, unknown> | null, explicit?: string | null): string {
    if (explicit && explicit.trim()) return explicit.trim()
    if (!data) return 'بدون اسم'
    // أول قيمة نصية طويلة هي غالبًا الاسم
    for (const val of Object.values(data)) {
        const str = String(val).trim()
        if (str.length > 2 && !/^\d+$/.test(str) && !str.includes('@')) return str
    }
    return 'بدون اسم'
}

function formatPhoneForWA(phone: string): string {
    let c = phone.replace(/[\s\-\(\)]/g, '')
    if (c.startsWith('0')) c = '964' + c.substring(1)
    if (c.startsWith('+')) c = c.substring(1)
    return c
}

function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '-'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'الآن'
    if (mins < 60) return `منذ ${mins} د`
    if (hrs < 24) return `منذ ${hrs} س`
    if (days < 7) return `منذ ${days} يوم`
    return formatDate(dateStr)
}


function getSourceMeta(key: string) {
    return SOURCES.find(s => s.key === key) || SOURCES[0]
}

function getRegistrationStatus(d: UnifiedRegistration): 'approved' | 'rejected' | 'pending' {
    const s = d.status
    if (s === 'approved' || s === 'completed') return 'approved'
    if (s === 'confirmed') {
        // ما نعتبرها "مقبول" فعليًا إلا لو الدفع مكتمل — لكن فقط للتسجيلات اللي فيها مبلغ للدفع أصلاً
        const hasFee = (d.total_amount ?? 0) > 0
        if (hasFee && d.payment_status !== 'paid') return 'pending'
        return 'approved'
    }
    if (s === 'rejected' || s === 'cancelled') return 'rejected'
    return 'pending'
}

function money(n: number | null | undefined): string {
    if (!n || n <= 0) return 'مجاني'
    return `${n.toLocaleString('ar')} د.ع`
}

function formatFieldKey(key: string): string {
    // التحقق من وجود لاحقة بين قوسين مثل (passport)
    const match = key.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
        const baseKey = match[1];
        const suffix = match[2];
        return `${formatFieldKey(baseKey)} (${suffix})`;
    }

    const map: Record<string, string> = {
        company_name: "الشركة",
        company: "الشركة",
        companyName: "الشركة",
        job_title: "المسمى الوظيفي",
        jobTitle: "المسمى الوظيفي",
        position: "المسمى الوظيفي",
        passport_number: "رقم الجواز",
        passportNumber: "رقم الجواز",
        passport: "رقم الجواز",
        nationality: "الجنسية",
        date_of_birth: "تاريخ الميلاد",
        dateOfBirth: "تاريخ الميلاد",
        dob: "تاريخ الميلاد",
        date_of_expiry: "تاريخ انتهاء الجواز",
        dateOfExpiry: "تاريخ انتهاء الجواز",
        sex: "الجنس",
        gender: "الجنس",
        notes: "الملاحظات",
        note: "الملاحظات",
        full_name: "الاسم الكامل",
        fullName: "الاسم الكامل",
        name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        sector: "القطاع",
        given_names: "الاسم الأول",
        surname: "اللقب / العائلة",
        issuing_country: "بلد الإصدار",
    }
    
    if (map[key]) return map[key]
    
    return key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase())
}

// ─── Normalize: تحويل جدول registrations لصيغة موحدة ─────
function normalizeAll(
    registrations: Record<string, unknown>[],
): UnifiedRegistration[] {
    const regs = registrations.map((r): UnifiedRegistration => {
        // تمييز المصدر: الموقع يستخدم additional_data بحقول واضحة الاسم،
        // أما التطبيق فيستخدم form_data بحقول ديناميكية مثل field_xxx
        const additionalData = r.additional_data as Record<string, unknown> | null
        const formData = r.form_data as Record<string, unknown> | null

        const hasWebsiteFields = additionalData &&
            Object.keys(additionalData).length > 0 &&
            !Object.keys(additionalData).every(k => /^field_\d+$/.test(k))

        const platform: 'app' | 'website' = hasWebsiteFields ? 'website' : 'app'

        // اخذ بيانات الاتصال: الموقع يضعها في additional_data، التطبيق في form_data
        const contactData = platform === 'website' ? additionalData : formData

        return {
            id: String(r.id),
            source: platform,
            name: (r.full_name as string) || extractName(contactData, null),
            email: (r.email as string) || extractEmail(contactData, null),
            phone: extractPhone(contactData, null),
            status: (r.status as string) || 'pending',
            payment_status: r.payment_status as string | null,
            total_amount: r.total_amount as number | null,
            raw_data: contactData,
            notes: r.notes as string | null,
            created_at: (r.created_at as string) || null,
            documents: r.documents as any[] | null,
            user_id: (r.user_id as string) || null,
            event_title: (r.events as { title_ar?: string | null; title?: string | null } | null)?.title_ar
                || (r.events as { title?: string | null } | null)?.title
                || null,
        }
    })

    return regs.sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0
        return tb - ta
    })
}


// ─── Main Component ──────────────────────────────────────
export function UnifiedRegistrationsView({
    registrations,
}: Props) {
    const allData = useMemo(
        () => normalizeAll(registrations),
        [registrations],
    )

    const [activeSource, setActiveSource] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selected, setSelected] = useState<UnifiedRegistration | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [data, setData] = useState(allData)

    // ─── Stats ───────────────────────────────────────────
    const sourceCounts = useMemo(() => {
        const counts: Record<string, number> = { all: data.length }
        for (const s of SOURCES.slice(1)) {
            counts[s.key] = data.filter(d => d.source === s.key).length
        }
        return counts
    }, [data])

    const statusCounts = useMemo(() => {
        const counts = { all: data.length, pending: 0, approved: 0, rejected: 0 }
        for (const d of data) {
            const statusType = getRegistrationStatus(d)
            counts[statusType]++
        }
        return counts
    }, [data])

    // ─── Filtering ───────────────────────────────────────
    const filtered = useMemo(() => {
        const result = data.filter(d => {
            if (activeSource !== 'all' && d.source !== activeSource) return false
            if (statusFilter !== 'all') {
                if (getRegistrationStatus(d) !== statusFilter) return false
            }
            if (!search) return true
            const q = search.toLowerCase()
            return (
                d.name.toLowerCase().includes(q) ||
                (d.email || '').toLowerCase().includes(q) ||
                (d.phone || '').includes(q)
            )
        })
        return result
    }, [data, activeSource, statusFilter, search])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filtered.slice(start, start + ITEMS_PER_PAGE)
    }, [filtered, currentPage])

    const resetPage = useCallback(() => setCurrentPage(1), [])

    // ─── Actions ─────────────────────────────────────────
    const copyText = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        } catch {}
    }, [])

    const updateStatus = async (id: string, _source: string, status: string) => {
        const supabase = createClient()
        const { error } = await supabase.from('registrations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) {
            alert('تعذّر تحديث حالة التسجيل. حاول مرة أخرى.')
            return
        }
        setData(prev => prev.map(d => d.id === id ? { ...d, status } : d))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)

        // إشعار المستخدم بتغيّر حالة طلبه (فقط لتسجيلات الموقع/التطبيق المرتبطة بحساب)
        const reg = data.find(d => d.id === id)
        if (reg?.user_id) {
            const ev = reg.event_title || 'الفعالية'
            const notif =
                status === 'confirmed'
                    ? { type: 'registration_approved', title: 'تم قبول طلبك ✅', body: `تم قبول تسجيلك في «${ev}». سيتواصل معك فريقنا بخطوات الدفع والتفاصيل.` }
                    : status === 'rejected'
                        ? { type: 'registration_rejected', title: 'تحديث على طلبك', body: `نعتذر، لم يُقبل تسجيلك في «${ev}» حالياً. يمكنك التواصل معنا للمزيد.` }
                        : { type: 'registration_update', title: 'تحديث على طلبك', body: `تم تحديث حالة تسجيلك في «${ev}».` }
            await supabase.from('notifications').insert({ user_id: reg.user_id, ...notif })
        }
    }

    const updatePayment = async (id: string, payment_status: string) => {
        const supabase = createClient()
        const { error } = await supabase.from('registrations').update({ payment_status, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) {
            alert('تعذّر تحديث حالة الدفع. حاول مرة أخرى.')
            return
        }
        setData(prev => prev.map(d => d.id === id ? { ...d, payment_status } : d))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, payment_status } : prev)
    }

    const exportExcel = () => {
        const statusLabel = { approved: 'مقبول', rejected: 'مرفوض', pending: 'قيد الانتظار' } as const
        const rows = filtered.map(d => ({
            'المصدر': getSourceMeta(d.source).label,
            'الاسم': d.name,
            'البريد': d.email || '-',
            'الهاتف': d.phone || '-',
            'الحالة': statusLabel[getRegistrationStatus(d)],
            'الدفع': d.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع',
            'المبلغ': money(d.total_amount),
            'التاريخ': d.created_at ? formatDate(d.created_at) : '-',
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        const wb = XLSX.utils.book_new()
        ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }))
        XLSX.utils.book_append_sheet(wb, ws, 'التسجيلات')
        XLSX.writeFile(wb, 'all-registrations.xlsx')
    }

    // ─── Render ──────────────────────────────────────────
    return (
        <div className="space-y-3">
            {/* ── KPI Stats — مسطّحة، لون واحد لكل حالة ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                    { key: 'all', label: 'الإجمالي', icon: Users, tone: 'text-slate-500', count: statusCounts.all },
                    { key: 'pending', label: 'قيد الانتظار', icon: Clock, tone: 'text-amber-600', count: statusCounts.pending },
                    { key: 'approved', label: 'مقبول', icon: CheckCircle2, tone: 'text-emerald-600', count: statusCounts.approved },
                    { key: 'rejected', label: 'مرفوض', icon: XCircle, tone: 'text-red-500', count: statusCounts.rejected },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => { setStatusFilter(prev => prev === s.key ? 'all' : s.key); resetPage() }}
                        className={cn(
                            'flex items-center gap-2.5 rounded-lg border p-3 text-right transition-colors bg-white',
                            statusFilter === s.key ? 'border-slate-300 bg-slate-50' : 'border-slate-100 hover:border-slate-200',
                        )}
                    >
                        <s.icon className={cn('w-4 h-4 shrink-0', s.tone)} />
                        <div className="min-w-0">
                            <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{s.count}</p>
                            <p className="text-[11px] text-muted-foreground mt-1 truncate">{s.label}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* ── Source Tabs + Filter Bar — صف واحد مضغوط ── */}
            <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg border border-slate-100 p-2">
                <div className="flex flex-wrap gap-1">
                    {SOURCES.map(s => {
                        const SIcon = s.icon
                        const isActive = activeSource === s.key
                        return (
                            <button
                                key={s.key}
                                onClick={() => { setActiveSource(s.key); resetPage() }}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                                    isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50',
                                )}
                            >
                                <SIcon className="w-3.5 h-3.5" />
                                {s.label}
                                <span className={cn('text-[10px] font-bold', isActive ? 'text-slate-300' : 'text-slate-400')}>{sourceCounts[s.key]}</span>
                            </button>
                        )
                    })}
                </div>
                <div className="h-5 w-px bg-slate-100 mx-1 hidden sm:block" />
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <Input
                        placeholder="بحث بالاسم، الهاتف، البريد..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage() }}
                        className="pr-8 h-8 text-sm bg-slate-50 border-slate-100 focus:bg-white"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); resetPage() }} dir="rtl">
                    <SelectTrigger className="w-[140px] h-8 text-sm bg-slate-50 border-slate-100">
                        <SelectValue placeholder="كل الحالات" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="pending">قيد الانتظار ({statusCounts.pending})</SelectItem>
                        <SelectItem value="approved">مقبول ({statusCounts.approved})</SelectItem>
                        <SelectItem value="rejected">مرفوض ({statusCounts.rejected})</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportExcel} className="h-8 gap-1.5 text-xs text-slate-600">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Excel</span>
                </Button>
            </div>

            {/* ── Results Count ── */}
            <p className="text-sm text-muted-foreground">
                عرض <span className="font-bold text-foreground">{paginated.length}</span> من <span className="font-semibold">{filtered.length}</span> تسجيل
            </p>

            {/* ── Table ── */}
            {paginated.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <Inbox className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="font-semibold text-slate-500">لا توجد نتائج</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-hidden border-slate-100">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                                    <TableHead className="h-9 px-3 py-2 font-semibold text-slate-500 text-xs">الاسم</TableHead>
                                    <TableHead className="h-9 px-3 py-2 font-semibold text-slate-500 text-xs">الدفع</TableHead>
                                    <TableHead className="h-9 px-3 py-2 font-semibold text-slate-500 text-xs">التاريخ</TableHead>
                                    <TableHead className="h-9 px-3 py-2 font-semibold text-slate-500 text-xs">الحالة</TableHead>
                                    <TableHead className="h-9 px-3 py-2 text-center font-semibold text-slate-500 text-xs">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((reg) => {
                                    const srcMeta = getSourceMeta(reg.source)
                                    const SrcIcon = srcMeta.icon

                                    return (
                                        <TableRow
                                            key={`${reg.source}-${reg.id}`}
                                            className="group cursor-pointer hover:bg-slate-50/60 transition-colors"
                                        >
                                            {/* Name + source + contact */}
                                            <TableCell className="px-3 py-2">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <SrcIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-semibold text-sm text-slate-900">{reg.name}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); copyText(reg.name, `n-${reg.id}`) }} className="shrink-0">
                                                            {copiedKey === `n-${reg.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground/60" />}
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 pr-[18px]">
                                                        {reg.email && <span dir="ltr">{reg.email}</span>}
                                                        {reg.phone && (
                                                            <span className="inline-flex items-center gap-1 font-mono" dir="ltr">
                                                                {reg.phone}
                                                                <a href={`https://wa.me/${formatPhoneForWA(reg.phone)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                                    <MessageCircle className="w-3 h-3 text-green-600" />
                                                                </a>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Payment */}
                                            <TableCell className="px-3 py-2">
                                                {reg.total_amount != null && reg.total_amount > 0 ? (
                                                    <div className="space-y-0.5">
                                                        <span className={cn(
                                                            'text-[10px] font-medium',
                                                            reg.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600',
                                                        )}>
                                                            {reg.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                                        </span>
                                                        <p className="text-xs text-slate-500">{money(reg.total_amount)}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-300">مجاني</span>
                                                )}
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className="px-3 py-2">
                                                <span className="text-xs text-slate-500">{getRelativeTime(reg.created_at)}</span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="px-3 py-2">
                                                <StatusPill reg={reg} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(reg)}>
                                                                <Eye className="w-4 h-4 text-slate-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">عرض</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link href={`/dashboard/registrations/${reg.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                                    <ClipboardList className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">متابعة العملية</TooltipContent>
                                                    </Tooltip>
                                                    {reg.status !== 'approved' && reg.status !== 'confirmed' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50" onClick={() => updateStatus(reg.id, reg.source, 'confirmed')}>
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">قبول</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {reg.status !== 'rejected' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => updateStatus(reg.id, reg.source, 'rejected')}>
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">رفض</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                            <p className="text-xs text-muted-foreground">
                                صفحة <span className="font-bold">{currentPage}</span> من <span className="font-bold">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page: number
                                    if (totalPages <= 5) page = i + 1
                                    else if (currentPage <= 3) page = i + 1
                                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                                    else page = currentPage - 2 + i
                                    return (
                                        <Button key={page} variant={page === currentPage ? 'primary' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setCurrentPage(page)}>
                                            {page}
                                        </Button>
                                    )
                                })}
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* ── Detail Dialog ── */}
            {selected && (
                <DetailDialog reg={selected} onClose={() => setSelected(null)} onTogglePayment={updatePayment} />
            )}
        </div>
    )
}

// ─── Status Pill ─────────────────────────────────────────
function StatusPill({ reg }: { reg: UnifiedRegistration }) {
    const statusType = getRegistrationStatus(reg)
    if (statusType === 'approved') {
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />مقبول</span>
    }
    if (statusType === 'rejected') {
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-red-50 text-red-700 border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />مرفوض</span>
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />قيد الانتظار</span>
}

// ─── Detail Dialog ───────────────────────────────────────
function DetailDialog({
    reg, onClose, onTogglePayment,
}: {
    reg: UnifiedRegistration
    onClose: () => void
    onTogglePayment: (id: string, payment_status: string) => void
}) {
    const entries = reg.raw_data ? Object.entries(reg.raw_data).filter(([, v]) => v != null && String(v).trim()) : []

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{reg.name}</h2>
                        <p className="text-sm text-muted-foreground">{getSourceMeta(reg.source).label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusPill reg={reg} />
                        <Link href={`/dashboard/registrations/${reg.id}`}>
                            <Button size="sm" className="gap-1.5">
                                <ClipboardList className="w-3.5 h-3.5" />
                                متابعة كاملة
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-3">
                    {reg.email && (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-700" dir="ltr">{reg.email}</span>
                        </div>
                    )}
                    {reg.phone && (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-mono text-slate-700" dir="ltr">{reg.phone}</span>
                            <a href={`https://wa.me/${formatPhoneForWA(reg.phone)}`} target="_blank" rel="noopener noreferrer" className="mr-auto">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                            </a>
                        </div>
                    )}

                    {reg.total_amount != null && reg.total_amount > 0 && (
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                            <div>
                                <p className="text-xs font-bold text-slate-500">المبلغ المستحق</p>
                                <p className="text-sm font-semibold text-slate-800">{money(reg.total_amount)}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                    reg.payment_status === 'paid'
                                        ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                                        : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
                                )}
                                onClick={() => onTogglePayment(reg.id, reg.payment_status === 'paid' ? 'pending' : 'paid')}
                            >
                                {reg.payment_status === 'paid' ? 'تحديد كغير مدفوع' : 'تحديد كمدفوع'}
                            </Button>
                        </div>
                    )}

                    {entries.length > 0 && (
                        <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-xs font-bold text-slate-500 mb-2">البيانات الكاملة</p>
                            <div className="space-y-1.5">
                                {entries.map(([key, value]) => (
                                    <div key={key} className="flex items-start justify-between gap-3 text-sm border-b border-slate-100 py-1.5 last:border-0">
                                        <span className="text-xs font-bold text-slate-500">{formatFieldKey(key)}</span>
                                        <span className="font-medium text-slate-700 text-left" dir="auto">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {reg.documents && reg.documents.length > 0 && (
                        <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-xs font-bold text-slate-500 mb-2">الوثائق المرفوعة من المستخدم</p>
                            <div className="space-y-2">
                                {reg.documents.map((doc: any, i: number) => {
                                    const viewUrl = `/api/documents/view?path=${encodeURIComponent(doc.path)}`
                                    return (
                                        <a
                                            key={i}
                                            href={viewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 hover:bg-slate-100 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700 truncate">{doc.name || `وثيقة ${i + 1}`}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 mr-auto" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {reg.notes && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                            <p className="text-xs font-bold text-amber-700 mb-1">ملاحظات</p>
                            <p className="text-xs text-amber-800 whitespace-pre-wrap">{reg.notes}</p>
                        </div>
                    )}
                </div>

                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onClose}>إغلاق</Button>
            </div>
        </div>
    )
}
