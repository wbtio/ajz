'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FileSpreadsheet,
    Printer,
    Search,
    Phone,
    Copy,
    Check,
    MessageCircle,
    Users,
    CheckCircle2,
    Clock,
    XCircle,
    MoreHorizontal,
    PhoneCall,
    ClipboardCopy,
    Eye,
    Award,
    Store,
    Handshake,
    ClipboardList,
    Mail,
    Inbox,
    CalendarDays,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Hash,
    Globe,
    ExternalLink,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

// ─── Types ───────────────────────────────────────────────
interface SubmissionsViewProps {
    submissions: any[]
}

type SortField = 'name' | 'date' | 'status' | 'section' | 'event'
type SortDir = 'asc' | 'desc'

// ─── Section Config ──────────────────────────────────────
const SECTIONS = [
    { slug: 'sponsors', label: 'الرعاة', labelEn: 'Sponsors', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', accent: 'bg-yellow-500', ring: 'ring-yellow-500/20' },
    { slug: 'exhibitors', label: 'العارضون', labelEn: 'Exhibitors', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
    { slug: 'partners', label: 'الشركاء', labelEn: 'Partners', icon: Handshake, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'bg-indigo-500', ring: 'ring-indigo-500/20' },
    { slug: 'registration', label: 'التسجيل', labelEn: 'Registration', icon: ClipboardList, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', accent: 'bg-rose-500', ring: 'ring-rose-500/20' },
    { slug: 'program', label: 'البرنامج', labelEn: 'Program', icon: CalendarDays, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', accent: 'bg-teal-500', ring: 'ring-teal-500/20' },
] as const

type SectionSlug = typeof SECTIONS[number]['slug']

const getSectionMeta = (slug: string) => SECTIONS.find(s => s.slug === slug) || SECTIONS[3]

const ITEMS_PER_PAGE = 25

// ─── Helpers ─────────────────────────────────────────────
function extractPhoneNumbers(data: Record<string, any> | null): string[] {
    if (!data) return []
    const phones: string[] = []
    Object.values(data).forEach(val => {
        const str = String(val).replace(/\s/g, '')
        if (/^[\+]?[0-9]{8,15}$/.test(str) || /^0[0-9]{9,11}$/.test(str)) {
            phones.push(String(val))
        }
    })
    return phones
}

function extractEmails(data: Record<string, any> | null): string[] {
    if (!data) return []
    const emails: string[] = []
    Object.values(data).forEach(val => {
        const str = String(val).trim()
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
            emails.push(str)
        }
    })
    return emails
}

function formatPhoneForWhatsApp(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '')
    if (cleaned.startsWith('0')) cleaned = '964' + cleaned.substring(1)
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1)
    return cleaned
}

function formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '')
    if (cleaned.length >= 11 && cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    if (cleaned.startsWith('+') || cleaned.startsWith('964')) {
        const digits = cleaned.replace('+', '')
        if (digits.startsWith('964') && digits.length >= 13) {
            return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
        }
    }
    return phone
}

function useCopyText() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const copyText = useCallback(async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [])
    return { copiedKey, copyText }
}

function getRelativeTime(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    return formatDate(dateStr)
}

// ─── Small Components ────────────────────────────────────
function CopyBtn({ text, id, size = 'sm' }: { text: string; id: string; size?: 'sm' | 'xs' }) {
    const { copiedKey, copyText } = useCopyText()
    const isCopied = copiedKey === id
    const sizeClass = size === 'xs' ? 'h-5 w-5' : 'h-6 w-6'
    const iconSize = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    className={`${sizeClass} p-0 shrink-0 inline-flex items-center justify-center rounded hover:bg-muted transition-colors`}
                    onClick={(e) => { e.stopPropagation(); copyText(text, id) }}
                >
                    {isCopied ? <Check className={`${iconSize} text-green-600`} /> : <Copy className={`${iconSize} text-muted-foreground/60 hover:text-muted-foreground`} />}
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">{isCopied ? 'تم النسخ!' : 'نسخ'}</TooltipContent>
        </Tooltip>
    )
}

function PhoneChip({ phone, id }: { phone: string; id: string }) {
    return (
        <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 group/phone hover:border-slate-300 transition-colors">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-mono text-slate-600 tracking-wide" dir="ltr">{formatPhoneDisplay(phone)}</span>
            <div className="flex items-center gap-0.5 mr-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                            href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-green-100 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MessageCircle className="w-3 h-3 text-green-600" />
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">واتساب</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                            href={`tel:${phone}`}
                            className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-blue-100 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <PhoneCall className="w-3 h-3 text-blue-600" />
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">اتصال</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                            href={`sms:${phone}`}
                            className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-purple-100 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Mail className="w-3 h-3 text-purple-500" />
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">رسالة SMS</TooltipContent>
                </Tooltip>
                <CopyBtn text={phone} id={id} size="xs" />
            </div>
        </div>
    )
}

function EmailChip({ email, id }: { email: string; id: string }) {
    return (
        <div className="inline-flex items-center gap-1 bg-blue-50/60 border border-blue-200/60 rounded-lg px-2 py-1">
            <Mail className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-700" dir="ltr">{email}</span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <a
                        href={`mailto:${email}`}
                        className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-blue-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                    </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">إرسال بريد</TooltipContent>
            </Tooltip>
            <CopyBtn text={email} id={id} size="xs" />
        </div>
    )
}

function StatusBadge({ status, size = 'default' }: { status: string; size?: 'default' | 'lg' }) {
    const config: Record<string, { label: string; className: string; dot: string; icon: typeof CheckCircle2 }> = {
        approved: { label: 'مقبول', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
        rejected: { label: 'مرفوض', className: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: XCircle },
        pending: { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: Clock },
    }
    const c = config[status] || config.pending
    const Icon = c.icon
    if (size === 'lg') {
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${c.className}`}>
                <Icon className="w-4 h-4" />
                {c.label}
            </span>
        )
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${c.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    )
}

function SectionBadge({ slug }: { slug: string }) {
    const meta = getSectionMeta(slug)
    const SIcon = meta.icon
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md ${meta.bg} ${meta.color} border ${meta.border}`}>
            <SIcon className="w-3 h-3" />
            {meta.label}
        </span>
    )
}

function SortButton({ field, currentField, currentDir, onSort, children }: {
    field: SortField; currentField: SortField; currentDir: SortDir;
    onSort: (f: SortField) => void; children: React.ReactNode
}) {
    const isActive = field === currentField
    return (
        <button
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors group/sort"
            onClick={() => onSort(field)}
        >
            {children}
            {isActive ? (
                currentDir === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
            ) : (
                <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/sort:opacity-40 transition-opacity" />
            )}
        </button>
    )
}

// ─── Main Component ──────────────────────────────────────
export function SubmissionsView({ submissions: initialSubmissions }: SubmissionsViewProps) {
    const [submissions, setSubmissions] = useState(initialSubmissions)
    const [activeSection, setActiveSection] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [eventFilter, setEventFilter] = useState<string>('all')
    const [selected, setSelected] = useState<any | null>(null)
    const [sortField, setSortField] = useState<SortField>('date')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [expandedRow, setExpandedRow] = useState<string | null>(null)
    const { copiedKey, copyText } = useCopyText()

    // ─── Derived Data ────────────────────────────────────
    const uniqueEvents = useMemo(() => Array.from(
        new Map(
            submissions.filter(s => s.events).map(s => [
                s.event_id,
                { id: s.event_id, title: (s.events as any)?.title_ar || (s.events as any)?.title }
            ])
        ).values()
    ), [submissions])

    const sectionCounts = useMemo(() => {
        const counts: Record<string, number> = { all: submissions.length }
        SECTIONS.forEach(s => { counts[s.slug] = submissions.filter(sub => sub.section_slug === s.slug).length })
        return counts
    }, [submissions])

    const statusCounts = useMemo(() => ({
        all: submissions.length,
        approved: submissions.filter(s => s.status === 'approved').length,
        pending: submissions.filter(s => s.status === 'pending').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    }), [submissions])

    const filteredSubmissions = useMemo(() => {
        let result = submissions.filter(sub => {
            if (activeSection !== 'all' && sub.section_slug !== activeSection) return false
            if (statusFilter !== 'all' && sub.status !== statusFilter) return false
            if (eventFilter !== 'all' && sub.event_id !== eventFilter) return false
            if (!searchTerm) return true
            const q = searchTerm.toLowerCase()
            const dataMatch = sub.data ? Object.values(sub.data).some((v: any) => String(v).toLowerCase().includes(q)) : false
            const sectionMatch = (getSectionMeta(sub.section_slug).label).toLowerCase().includes(q)
            return dataMatch || sectionMatch
        })

        // Sort
        result.sort((a, b) => {
            let cmp = 0
            switch (sortField) {
                case 'name':
                    cmp = (getFirstValue(a)).localeCompare(getFirstValue(b), 'ar')
                    break
                case 'date':
                    cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                    break
                case 'status':
                    const statusOrder: Record<string, number> = { pending: 0, approved: 1, rejected: 2 }
                    cmp = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
                    break
                case 'section':
                    cmp = (a.section_slug || '').localeCompare(b.section_slug || '')
                    break
                case 'event':
                    cmp = getEventTitle(a).localeCompare(getEventTitle(b), 'ar')
                    break
            }
            return sortDir === 'asc' ? cmp : -cmp
        })

        return result
    }, [submissions, activeSection, statusFilter, eventFilter, searchTerm, sortField, sortDir])

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE)
    const paginatedSubmissions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredSubmissions.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredSubmissions, currentPage])

    // Reset page when filters change
    const resetPage = useCallback(() => setCurrentPage(1), [])

    // ─── Helpers ─────────────────────────────────────────
    const getFieldLabel = useCallback((sub: any, key: string) => {
        const cc = (sub.events as any)?.conference_config
        if (!cc) return key
        const fields = cc[sub.section_slug]?.form_fields as any[]
        if (!Array.isArray(fields)) return key
        const field = fields.find((f: any) => f.id === key)
        return field?.label_ar || field?.label_en || key
    }, [])

    const getEventTitle = useCallback((sub: any) => (sub.events as any)?.title_ar || (sub.events as any)?.title || '', [])

    const getFirstValue = useCallback((sub: any) => {
        if (!sub.data) return 'بدون بيانات'
        const values = Object.values(sub.data)
        return values.length > 0 ? String(values[0]) : 'بدون بيانات'
    }, [])

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = { approved: 'مقبول', rejected: 'مرفوض', pending: 'قيد الانتظار' }
        return map[status] || status
    }

    const updateStatus = async (id: string, status: string) => {
        const supabase = createClient()
        const { error } = await supabase.from('conference_submissions').update({ status }).eq('id', id)
        if (!error) {
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
            if (selected?.id === id) setSelected((prev: any) => ({ ...prev, status }))
        }
    }

    const copyAllData = (sub: any) => {
        const lines: string[] = [
            `القسم: ${getSectionMeta(sub.section_slug).label}`,
            `الفعالية: ${getEventTitle(sub)}`,
            `الحالة: ${getStatusLabel(sub.status)}`,
            `التاريخ: ${sub.created_at ? formatDate(sub.created_at) : '-'}`,
        ]
        if (sub.data && Object.keys(sub.data).length > 0) {
            lines.push('--- البيانات ---')
            Object.entries(sub.data).forEach(([k, v]) => lines.push(`${getFieldLabel(sub, k)}: ${String(v)}`))
        }
        copyText(lines.join('\n'), `all-${sub.id}`)
    }

    const exportToExcel = () => {
        const data = filteredSubmissions.map(sub => {
            const row: any = {
                'القسم': getSectionMeta(sub.section_slug).label,
                'الفعالية': getEventTitle(sub),
                'التاريخ': sub.created_at ? formatDate(sub.created_at) : '-',
                'الحالة': getStatusLabel(sub.status),
            }
            if (sub.data && typeof sub.data === 'object') {
                Object.entries(sub.data).forEach(([k, v]) => { row[getFieldLabel(sub, k)] = String(v) || '-' })
            }
            return row
        })
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 22 }))
        XLSX.utils.book_append_sheet(wb, ws, 'التسجيلات')
        XLSX.writeFile(wb, 'conference-submissions.xlsx')
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const activeFiltersCount = [
        activeSection !== 'all',
        statusFilter !== 'all',
        eventFilter !== 'all',
        searchTerm !== '',
    ].filter(Boolean).length

    const clearAllFilters = () => {
        setActiveSection('all')
        setStatusFilter('all')
        setEventFilter('all')
        setSearchTerm('')
        resetPage()
    }

    // ─── Render ──────────────────────────────────────────
    return (
        <div className="space-y-5">
            {/* ── KPI Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { key: 'all', label: 'إجمالي الطلبات', icon: Users, gradient: 'from-slate-500 to-slate-700', lightBg: 'bg-slate-50', lightText: 'text-slate-700' },
                    { key: 'pending', label: 'قيد الانتظار', icon: Clock, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-amber-50', lightText: 'text-amber-700' },
                    { key: 'approved', label: 'مقبول', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', lightBg: 'bg-emerald-50', lightText: 'text-emerald-700' },
                    { key: 'rejected', label: 'مرفوض', icon: XCircle, gradient: 'from-red-500 to-rose-600', lightBg: 'bg-red-50', lightText: 'text-red-700' },
                ].map(s => {
                    const isActive = statusFilter === s.key
                    const count = statusCounts[s.key as keyof typeof statusCounts]
                    const percentage = statusCounts.all > 0 && s.key !== 'all'
                        ? Math.round((count / statusCounts.all) * 100)
                        : null
                    return (
                        <button
                            key={s.key}
                            onClick={() => { setStatusFilter(prev => prev === s.key ? 'all' : s.key); resetPage() }}
                            className={`relative overflow-hidden rounded-xl border-2 p-4 text-right transition-all duration-200 hover:shadow-md ${
                                isActive ? `border-slate-900 shadow-sm` : 'border-transparent bg-white shadow-sm hover:border-slate-200'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>
                                    <s.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-3xl font-black text-slate-900 tabular-nums">{count}</p>
                                    {percentage !== null && (
                                        <p className="text-[11px] text-muted-foreground font-medium">{percentage}%</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mt-2">{s.label}</p>
                            {/* Progress bar for non-all */}
                            {s.key !== 'all' && statusCounts.all > 0 && (
                                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${s.gradient} rounded-full transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Section Pills ── */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => { setActiveSection('all'); resetPage() }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeSection === 'all'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <Inbox className="w-3.5 h-3.5" />
                    الكل
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeSection === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{sectionCounts.all}</span>
                </button>
                {SECTIONS.filter(s => sectionCounts[s.slug] > 0).map(s => {
                    const SIcon = s.icon
                    const isActive = activeSection === s.slug
                    return (
                        <button
                            key={s.slug}
                            onClick={() => { setActiveSection(isActive ? 'all' : s.slug); resetPage() }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                    ? `${s.bg} ${s.color} border-2 ${s.border} shadow-sm`
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <SIcon className="w-3.5 h-3.5" />
                            {s.label}
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${
                                isActive ? `${s.bg} ${s.color}` : 'bg-slate-100 text-slate-500'
                            }`}>{sectionCounts[s.slug]}</span>
                        </button>
                    )
                })}
            </div>

            {/* ── Filters + Actions Bar ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm no-print">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="بحث بالاسم، الهاتف، البريد..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); resetPage() }}
                            className="pr-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); resetPage() }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                            >
                                <X className="w-3 h-3 text-slate-500" />
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); resetPage() }} dir="rtl">
                            <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="كل الفعاليات" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل الفعاليات</SelectItem>
                                {uniqueEvents.map(ev => (
                                    <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); resetPage() }} dir="rtl">
                            <SelectTrigger className="w-[150px] h-9 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="كل الحالات" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل الحالات</SelectItem>
                                <SelectItem value="pending">قيد الانتظار ({statusCounts.pending})</SelectItem>
                                <SelectItem value="approved">مقبول ({statusCounts.approved})</SelectItem>
                                <SelectItem value="rejected">مرفوض ({statusCounts.rejected})</SelectItem>
                            </SelectContent>
                        </Select>

                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                مسح الفلاتر ({activeFiltersCount})
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-center sm:mr-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={exportToExcel} className="h-9 gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200">
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span className="hidden sm:inline">Excel</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>تصدير البيانات كملف Excel</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9 gap-1.5 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200">
                                    <Printer className="w-4 h-4" />
                                    <span className="hidden sm:inline">طباعة</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>طباعة أو تصدير PDF</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* ── Results Count ── */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    عرض <span className="font-bold text-foreground">{paginatedSubmissions.length}</span> من <span className="font-semibold">{filteredSubmissions.length}</span> طلب
                    {filteredSubmissions.length !== submissions.length && (
                        <span className="text-xs text-muted-foreground/60 mr-1">(من أصل {submissions.length})</span>
                    )}
                </p>
            </div>

            {/* ── Data Table ── */}
            {filteredSubmissions.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Inbox className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-semibold text-slate-500 text-lg">لا توجد نتائج مطابقة</p>
                        <p className="text-sm text-muted-foreground/60 mt-1 mb-4">حاول تغيير معايير البحث أو الفلتر</p>
                        {activeFiltersCount > 0 && (
                            <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1.5">
                                <X className="w-3.5 h-3.5" />
                                مسح جميع الفلاتر
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 border-b-2 border-slate-200">
                                    <TableHead className="w-[50px] text-center font-bold text-slate-500">
                                        <Hash className="w-3.5 h-3.5 mx-auto" />
                                    </TableHead>
                                    <TableHead className="min-w-[280px]">
                                        <SortButton field="name" currentField={sortField} currentDir={sortDir} onSort={handleSort}>
                                            <span className="font-bold text-slate-600">المعلومات</span>
                                        </SortButton>
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">
                                        <SortButton field="section" currentField={sortField} currentDir={sortDir} onSort={handleSort}>
                                            <span className="font-bold text-slate-600">القسم</span>
                                        </SortButton>
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        <SortButton field="event" currentField={sortField} currentDir={sortDir} onSort={handleSort}>
                                            <span className="font-bold text-slate-600">الفعالية</span>
                                        </SortButton>
                                    </TableHead>
                                    <TableHead className="min-w-[100px]">
                                        <SortButton field="date" currentField={sortField} currentDir={sortDir} onSort={handleSort}>
                                            <span className="font-bold text-slate-600">التاريخ</span>
                                        </SortButton>
                                    </TableHead>
                                    <TableHead className="min-w-[90px]">
                                        <SortButton field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort}>
                                            <span className="font-bold text-slate-600">الحالة</span>
                                        </SortButton>
                                    </TableHead>
                                    <TableHead className="text-center w-[130px] font-bold text-slate-600">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSubmissions.map((sub, idx) => {
                                    const formData = sub.data || {}
                                    const phones = extractPhoneNumbers(formData)
                                    const emails = extractEmails(formData)
                                    const firstVal = getFirstValue(sub)
                                    const dataEntries = Object.entries(formData)
                                    const secondVal = dataEntries.length > 1 ? String(dataEntries[1][1]) : null
                                    const isExpanded = expandedRow === sub.id
                                    const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1

                                    return (
                                        <TableRow
                                            key={sub.id}
                                            className={`group transition-colors cursor-pointer ${
                                                isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                                            } ${sub.status === 'pending' ? 'border-r-2 border-r-amber-400' : ''}`}
                                            onClick={() => setExpandedRow(isExpanded ? null : sub.id)}
                                        >
                                            <TableCell className="text-center">
                                                <span className="text-[11px] text-muted-foreground font-mono bg-slate-100 px-1.5 py-0.5 rounded">{globalIdx}</span>
                                            </TableCell>

                                            {/* Info Cell */}
                                            <TableCell>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-sm text-slate-900">{firstVal}</span>
                                                        <CopyBtn text={firstVal} id={`name-${sub.id}`} size="xs" />
                                                    </div>
                                                    {secondVal && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-[280px]">{secondVal}</p>
                                                    )}
                                                    {/* Phone chips */}
                                                    {phones.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {phones.map((phone, pi) => (
                                                                <PhoneChip key={pi} phone={phone} id={`ph-${sub.id}-${pi}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* Email chips */}
                                                    {emails.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {emails.map((email, ei) => (
                                                                <EmailChip key={ei} email={email} id={`em-${sub.id}-${ei}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* Expanded: show all fields */}
                                                    {isExpanded && dataEntries.length > 2 && (
                                                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                                            {dataEntries.slice(2).map(([key, value]) => {
                                                                const strVal = String(value)
                                                                const isPhone = phones.includes(strVal)
                                                                const isEmail = emails.includes(strVal)
                                                                if (isPhone || isEmail) return null
                                                                return (
                                                                    <div key={key} className="flex items-start gap-2 text-xs">
                                                                        <span className="text-muted-foreground/70 shrink-0">{getFieldLabel(sub, key)}:</span>
                                                                        <span className="text-slate-700 font-medium break-words">{strVal}</span>
                                                                        <CopyBtn text={strVal} id={`exp-${sub.id}-${key}`} size="xs" />
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Section */}
                                            <TableCell>
                                                <SectionBadge slug={sub.section_slug} />
                                            </TableCell>

                                            {/* Event */}
                                            <TableCell>
                                                <span className="text-xs text-slate-600 font-medium line-clamp-2">{getEventTitle(sub)}</span>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell>
                                                <div>
                                                    <span className="text-xs text-slate-600 font-medium block">
                                                        {sub.created_at ? getRelativeTime(sub.created_at) : '-'}
                                                    </span>
                                                    {sub.created_at && (
                                                        <span className="text-[10px] text-muted-foreground/60">
                                                            {formatDate(sub.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <StatusBadge status={sub.status} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(sub)}>
                                                                <Eye className="w-4 h-4 text-slate-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">عرض التفاصيل</TooltipContent>
                                                    </Tooltip>
                                                    {sub.status !== 'approved' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(sub.id, 'approved')}>
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">قبول</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {sub.status !== 'rejected' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => updateStatus(sub.id, 'rejected')}>
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">رفض</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`h-7 w-7 p-0 ${copiedKey === `all-${sub.id}` ? 'text-green-600' : 'text-muted-foreground'}`}
                                                                onClick={() => copyAllData(sub)}
                                                            >
                                                                {copiedKey === `all-${sub.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-xs">{copiedKey === `all-${sub.id}` ? 'تم النسخ!' : 'نسخ الكل'}</TooltipContent>
                                                    </Tooltip>
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
                                صفحة <span className="font-bold text-foreground">{currentPage}</span> من <span className="font-bold">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page: number
                                    if (totalPages <= 5) {
                                        page = i + 1
                                    } else if (currentPage <= 3) {
                                        page = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i
                                    } else {
                                        page = currentPage - 2 + i
                                    }
                                    return (
                                        <Button
                                            key={page}
                                            variant={page === currentPage ? 'primary' : 'outline'}
                                            size="sm"
                                            className="h-8 w-8 p-0 text-xs"
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    )
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* ── Detail Dialog ── */}
            <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {selected && (() => {
                        const meta = getSectionMeta(selected.section_slug)
                        const SIcon = meta.icon
                        const phones = extractPhoneNumbers(selected.data)
                        const emails = extractEmails(selected.data)
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} ${meta.color} ring-4 ${meta.ring}`}>
                                            <SIcon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block text-lg font-bold truncate">{getFirstValue(selected)}</span>
                                            <span className="text-xs font-normal text-muted-foreground">{meta.label} • {getEventTitle(selected)}</span>
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 mt-3">
                                    {/* Status + Date */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <StatusBadge status={selected.status} size="lg" />
                                        <span className="text-xs text-muted-foreground">
                                            {selected.created_at ? formatDate(selected.created_at) : '—'}
                                        </span>
                                        {selected.created_at && (
                                            <span className="text-xs text-muted-foreground/50">
                                                ({getRelativeTime(selected.created_at)})
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick Contact Actions */}
                                    {(phones.length > 0 || emails.length > 0) && (
                                        <div className="space-y-2">
                                            {phones.map((phone, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                                        <Phone className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-mono font-bold text-slate-800" dir="ltr">{formatPhoneDisplay(phone)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`} target="_blank" rel="noopener noreferrer"
                                                                    className="h-8 w-8 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-sm">
                                                                    <MessageCircle className="w-4 h-4" />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">واتساب</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`tel:${phone}`}
                                                                    className="h-8 w-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm">
                                                                    <PhoneCall className="w-4 h-4" />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">اتصال</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`sms:${phone}`}
                                                                    className="h-8 w-8 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-colors shadow-sm">
                                                                    <Mail className="w-4 h-4" />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">SMS</TooltipContent>
                                                        </Tooltip>
                                                        <CopyBtn text={phone} id={`dlg-ph-${selected.id}-${i}`} />
                                                    </div>
                                                </div>
                                            ))}
                                            {emails.map((email, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-blue-50/50 rounded-xl p-3 border border-blue-200/50">
                                                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                                        <Mail className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <p className="text-sm font-medium text-blue-800 flex-1" dir="ltr">{email}</p>
                                                    <a href={`mailto:${email}`}
                                                        className="h-8 w-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <CopyBtn text={email} id={`dlg-em-${selected.id}-${i}`} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Separator />

                                    {/* All Data Fields */}
                                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                                        {selected.data && Object.entries(selected.data).map(([key, value]) => {
                                            const strVal = String(value)
                                            const isPhone = phones.includes(strVal)
                                            const isEmail = emails.includes(strVal)
                                            return (
                                                <div key={key} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] text-muted-foreground/70 mb-0.5 font-medium uppercase tracking-wide">{getFieldLabel(selected, key)}</p>
                                                        <p className={`text-sm font-medium text-foreground break-words ${isPhone ? 'font-mono' : ''}`}>
                                                            {isPhone ? formatPhoneDisplay(strVal) : strVal}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 shrink-0 pt-3">
                                                        <CopyBtn text={strVal} id={`dlg-${selected.id}-${key}`} />
                                                        {isPhone && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted transition-colors">
                                                                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuLabel>إجراءات الهاتف</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={`https://wa.me/${formatPhoneForWhatsApp(strVal)}`} target="_blank" rel="noopener noreferrer">
                                                                            <MessageCircle className="w-4 h-4 text-green-600" />
                                                                            <span>إرسال واتساب</span>
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={`tel:${strVal}`}>
                                                                            <PhoneCall className="w-4 h-4 text-blue-600" />
                                                                            <span>اتصال مباشر</span>
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={`sms:${strVal}`}>
                                                                            <Mail className="w-4 h-4 text-purple-600" />
                                                                            <span>إرسال SMS</span>
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                        {isEmail && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <a href={`mailto:${strVal}`} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-blue-100 transition-colors">
                                                                        <ExternalLink className="w-3 h-3 text-blue-500" />
                                                                    </a>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="text-xs">إرسال بريد</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Status Actions */}
                                    <div className="flex justify-between items-center gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`gap-1.5 ${copiedKey === `all-${selected.id}` ? 'text-green-600 border-green-200' : ''}`}
                                            onClick={() => copyAllData(selected)}
                                        >
                                            {copiedKey === `all-${selected.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copiedKey === `all-${selected.id}` ? 'تم النسخ!' : 'نسخ جميع البيانات'}
                                        </Button>
                                        <div className="flex gap-2">
                                            {selected.status !== 'rejected' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateStatus(selected.id, 'rejected')}
                                                    className="text-red-600 hover:bg-red-50 border-red-200 gap-1.5"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    رفض
                                                </Button>
                                            )}
                                            {selected.status !== 'approved' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(selected.id, 'approved')}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    قبول
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}
