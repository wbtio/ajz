'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
    FileSpreadsheet,
    Printer,
    Search,
    Mail,
    Phone,
    Copy,
    Check,
    MessageCircle,
    ChevronsUpDown,
    LayoutGrid,
    LayoutList,
    User,
    Calendar,
    Hash,
    ExternalLink,
    MoreHorizontal,
    PhoneCall,
    ClipboardCopy,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import * as XLSX from 'xlsx'

interface RegistrationsTableProps {
    registrations: any[]
    event: any
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

function formatPhoneForWhatsApp(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '')
    if (cleaned.startsWith('0')) cleaned = '964' + cleaned.substring(1)
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1)
    return cleaned
}

function CopyBtn({ text, copyKey }: { text: string; copyKey: string }) {
    const { copiedKey, copyText } = useCopyText()
    const isCopied = copiedKey === copyKey
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => copyText(text, copyKey)}
                >
                    {isCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{isCopied ? 'تم النسخ!' : 'نسخ'}</TooltipContent>
        </Tooltip>
    )
}

function PhoneActions({ phone, regId, idx }: { phone: string; regId: string; idx: number }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>إجراءات الهاتف</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <a href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span>إرسال واتساب</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={`tel:${phone}`}>
                        <PhoneCall className="w-4 h-4 text-blue-600" />
                        <span>اتصال مباشر</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={`sms:${phone}`}>
                        <Mail className="w-4 h-4 text-purple-600" />
                        <span>إرسال SMS</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(phone)}>
                    <ClipboardCopy className="w-4 h-4" />
                    <span>نسخ الرقم</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function RegistrationsTable({ registrations, event }: RegistrationsTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [viewMode, setViewMode] = useState<string>('cards')
    const { copiedKey, copyText } = useCopyText()

    const filteredRegistrations = registrations.filter(reg => {
        if (statusFilter !== 'all' && reg.status !== statusFilter) return false
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        const userName = reg.users?.full_name?.toLowerCase() || ''
        const userEmail = reg.users?.email?.toLowerCase() || ''
        const ticketNumber = reg.ticket_number?.toLowerCase() || ''
        const userPhone = reg.users?.phone?.toLowerCase() || ''
        const additionalDataMatch = reg.additional_data
            ? Object.values(reg.additional_data).some((val: any) =>
                String(val).toLowerCase().includes(searchLower)
            )
            : false
        return userName.includes(searchLower) ||
            userEmail.includes(searchLower) ||
            ticketNumber.includes(searchLower) ||
            userPhone.includes(searchLower) ||
            additionalDataMatch
    })

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'مؤكد'
            case 'cancelled': return 'ملغي'
            case 'pending': return 'قيد الانتظار'
            case 'attended': return 'حضر'
            default: return status
        }
    }

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'confirmed': return 'default'
            case 'cancelled': return 'destructive'
            case 'attended': return 'secondary'
            default: return 'outline'
        }
    }

    const getFieldLabel = (key: string) => {
        const config = event.registration_config as any[]
        const fieldConfig = Array.isArray(config) ? config.find(f => f.id === key) : null
        return fieldConfig?.label_ar || fieldConfig?.label_en || key
    }

    const getAllPhones = (reg: any): string[] => {
        const phones: string[] = []
        if (reg.users?.phone) phones.push(reg.users.phone)
        phones.push(...extractPhoneNumbers(reg.additional_data))
        return [...new Set(phones)]
    }

    const copyAllData = (reg: any) => {
        const lines: string[] = []
        lines.push(`الاسم: ${reg.users?.full_name || 'زائر'}`)
        lines.push(`البريد: ${reg.users?.email || '-'}`)
        if (reg.users?.phone) lines.push(`الهاتف: ${reg.users.phone}`)
        lines.push(`الحالة: ${getStatusLabel(reg.status)}`)
        lines.push(`تاريخ التسجيل: ${formatDate(reg.created_at)}`)
        if (reg.ticket_number) lines.push(`رقم التذكرة: ${reg.ticket_number}`)
        if (reg.additional_data && Object.keys(reg.additional_data).length > 0) {
            lines.push('--- بيانات إضافية ---')
            Object.entries(reg.additional_data).forEach(([key, value]) => {
                lines.push(`${getFieldLabel(key)}: ${String(value)}`)
            })
        }
        if (reg.notes) lines.push(`ملاحظات: ${reg.notes}`)
        copyText(lines.join('\n'), `all-${reg.id}`)
    }

    const exportToExcel = () => {
        const data = filteredRegistrations.map(reg => {
            const formData = reg.additional_data || {}
            const row: any = {
                'المستخدم': reg.users?.full_name || 'زائر',
                'البريد الإلكتروني': reg.users?.email || '-',
                'رقم الهاتف': reg.users?.phone || '-',
                'رقم التذكرة': reg.ticket_number || '-',
                'تاريخ التسجيل': formatDate(reg.created_at),
                'الحالة': getStatusLabel(reg.status),
                'ملاحظات': reg.notes || '-'
            }
            if (event.registration_config) {
                event.registration_config.forEach((field: any) => {
                    const label = field.label_ar || field.label_en || field.id
                    row[label] = formData[field.id] || '-'
                })
            }
            return row
        })
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
        ws['!cols'] = wscols
        XLSX.utils.book_append_sheet(wb, ws, "Registrations")
        XLSX.writeFile(wb, `${event.title_ar || event.title}-registrations.xlsx`)
    }

    const statusCounts = {
        all: registrations.length,
        confirmed: registrations.filter(r => r.status === 'confirmed').length,
        pending: registrations.filter(r => r.status === 'pending').length,
        cancelled: registrations.filter(r => r.status === 'cancelled').length,
        attended: registrations.filter(r => r.status === 'attended').length,
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 no-print">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث بالاسم، البريد، الهاتف، أو أي بيانات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v)} variant="outline" size="sm">
                            <ToggleGroupItem value="cards" aria-label="عرض بطاقات">
                                <LayoutGrid className="w-4 h-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="table" aria-label="عرض جدول">
                                <LayoutList className="w-4 h-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200">
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span className="hidden sm:inline">تصدير Excel</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>تصدير البيانات كملف Excel</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200">
                                    <Printer className="w-4 h-4" />
                                    <span className="hidden sm:inline">طباعة</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>طباعة أو تصدير PDF</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <Tabs value={statusFilter} onValueChange={setStatusFilter} dir="rtl">
                    <TabsList variant="line" className="w-full justify-start">
                        {[
                            { key: 'all', label: 'الكل' },
                            { key: 'confirmed', label: 'مؤكد' },
                            { key: 'pending', label: 'قيد الانتظار' },
                            { key: 'attended', label: 'حضر' },
                            { key: 'cancelled', label: 'ملغي' },
                        ].map(s => (
                            <TabsTrigger key={s.key} value={s.key} className="gap-1.5">
                                {s.label}
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[1.25rem]">
                                    {statusCounts[s.key as keyof typeof statusCounts] || 0}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground no-print">
                عرض {filteredRegistrations.length} من {registrations.length} تسجيل
            </p>

            {/* Print Header */}
            <div className="hidden print:block mb-6 p-4 text-center border-b">
                <h1 className="text-2xl font-bold mb-2">{event.title_ar || event.title}</h1>
                <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                    <span>التاريخ: {formatDate(event.date)}</span>
                    <span>عدد المسجلين: {filteredRegistrations.length}</span>
                </div>
            </div>

            {filteredRegistrations.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <User className="w-10 h-10 mb-3 text-muted-foreground/40" />
                        <p className="font-medium text-muted-foreground">لا توجد نتائج مطابقة</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">حاول تغيير معايير البحث أو الفلتر</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'cards' ? (
                /* ===== CARDS VIEW ===== */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print-content">
                    {filteredRegistrations.map((reg) => {
                        const allPhones = getAllPhones(reg)
                        const additionalData = reg.additional_data || {}
                        const hasAdditionalData = Object.keys(additionalData).length > 0

                        return (
                            <Card key={reg.id} className="overflow-hidden break-inside-avoid hover:shadow-md transition-shadow">
                                {/* Card Header */}
                                <div className="flex items-start justify-between p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                            {reg.users?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-semibold text-foreground">
                                                    {reg.users?.full_name || 'زائر'}
                                                </h3>
                                                <CopyBtn text={reg.users?.full_name || ''} copyKey={`name-${reg.id}`} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant={getStatusVariant(reg.status)} className="text-[10px] h-5">
                                                    {getStatusLabel(reg.status)}
                                                </Badge>
                                                {reg.ticket_number && (
                                                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
                                                        <Hash className="w-3 h-3" />
                                                        {reg.ticket_number}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={copiedKey === `all-${reg.id}` ? 'primary' : 'outline'}
                                                size="sm"
                                                className={`h-7 text-xs gap-1 ${copiedKey === `all-${reg.id}` ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                onClick={() => copyAllData(reg)}
                                            >
                                                {copiedKey === `all-${reg.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                نسخ الكل
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>نسخ جميع بيانات التسجيل</TooltipContent>
                                    </Tooltip>
                                </div>

                                <Separator />

                                {/* Contact Info */}
                                <CardContent className="p-4 space-y-2.5">
                                    {reg.users?.email && (
                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{reg.users.email}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                                <CopyBtn text={reg.users.email} copyKey={`email-${reg.id}`} />
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                                                            <a href={`mailto:${reg.users.email}`}>
                                                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                                            </a>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>إرسال بريد</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )}

                                    {allPhones.map((phone, idx) => (
                                        <div key={idx} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                                <span dir="ltr">{phone}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                                <CopyBtn text={phone} copyKey={`phone-${reg.id}-${idx}`} />
                                                <PhoneActions phone={phone} regId={reg.id} idx={idx} />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        <span>{formatDate(reg.created_at)}</span>
                                        <span dir="ltr">{new Date(reg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </CardContent>

                                {/* Additional Data */}
                                {hasAdditionalData && (
                                    <Collapsible>
                                        <Separator />
                                        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                                            <span>بيانات إضافية ({Object.keys(additionalData).length})</span>
                                            <ChevronsUpDown className="w-3.5 h-3.5" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-4 pb-3 space-y-2.5">
                                                {Object.entries(additionalData).map(([key, value]) => (
                                                    <div key={key} className="flex items-start justify-between gap-2 group">
                                                        <div className="min-w-0">
                                                            <span className="text-[11px] text-muted-foreground/60 block">{getFieldLabel(key)}</span>
                                                            <span className="text-sm text-foreground break-words">{String(value)}</span>
                                                        </div>
                                                        <CopyBtn text={String(value)} copyKey={`field-${reg.id}-${key}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}

                                {/* Notes */}
                                {reg.notes && (
                                    <>
                                        <Separator />
                                        <div className="px-4 py-2.5">
                                            <span className="text-[11px] text-muted-foreground/60 block mb-0.5">ملاحظات</span>
                                            <p className="text-sm text-muted-foreground">{reg.notes}</p>
                                        </div>
                                    </>
                                )}
                            </Card>
                        )
                    })}
                </div>
            ) : (
                /* ===== TABLE VIEW ===== */
                <Card className="overflow-hidden print-content">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>المستخدم</TableHead>
                                <TableHead>معلومات الاتصال</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>بيانات إضافية</TableHead>
                                <TableHead className="print:hidden">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.map((reg) => {
                                const allPhones = getAllPhones(reg)
                                const additionalData = reg.additional_data || {}
                                const hasAdditionalData = Object.keys(additionalData).length > 0

                                return (
                                    <TableRow key={reg.id} className="break-inside-avoid">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs print:bg-gray-200 print:text-gray-700">
                                                    {reg.users?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-medium text-sm">{reg.users?.full_name || 'زائر'}</p>
                                                        <CopyBtn text={reg.users?.full_name || ''} copyKey={`tname-${reg.id}`} />
                                                    </div>
                                                    {reg.ticket_number && (
                                                        <p className="text-[10px] text-muted-foreground font-mono">{reg.ticket_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {reg.users?.email && (
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Mail className="w-3 h-3 print:hidden" />
                                                        <span className="truncate max-w-[180px]">{reg.users.email}</span>
                                                        <CopyBtn text={reg.users.email} copyKey={`temail-${reg.id}`} />
                                                    </div>
                                                )}
                                                {allPhones.map((phone, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Phone className="w-3 h-3 print:hidden" />
                                                        <span dir="ltr">{phone}</span>
                                                        <CopyBtn text={phone} copyKey={`tphone-${reg.id}-${idx}`} />
                                                        <PhoneActions phone={phone} regId={reg.id} idx={idx} />
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div>{formatDate(reg.created_at)}</div>
                                            <div className="text-[10px] text-muted-foreground/60" dir="ltr">
                                                {new Date(reg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(reg.status)}>
                                                {getStatusLabel(reg.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {hasAdditionalData ? (
                                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                    {Object.entries(additionalData).map(([key, value]) => (
                                                        <Badge key={key} variant="outline" className="gap-1 font-normal">
                                                            <span className="font-medium text-muted-foreground">{getFieldLabel(key)}:</span>
                                                            <span>{String(value)}</span>
                                                            <CopyBtn text={String(value)} copyKey={`tfield-${reg.id}-${key}`} />
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/40 text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="print:hidden">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant={copiedKey === `all-${reg.id}` ? 'primary' : 'outline'}
                                                        size="sm"
                                                        className={`h-7 text-xs gap-1.5 ${copiedKey === `all-${reg.id}` ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                        onClick={() => copyAllData(reg)}
                                                    >
                                                        {copiedKey === `all-${reg.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                        نسخ الكل
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>نسخ جميع بيانات التسجيل</TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    )
}
