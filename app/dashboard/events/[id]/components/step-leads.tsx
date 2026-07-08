'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
    Users,
    UserPlus,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Sparkles,
    FileText,
    Plane,
    Calendar,
    Search,
    Download,
    Upload,
    X,
    Smartphone,
    Globe,
    MessageCircle,
    ChevronDown
} from 'lucide-react'

interface StepLeadsProps {
    event: any
    initialRegistrations: any[]
    isReadOnly: boolean
}

// تسجيلات الموقع/التطبيق تُخزَّن بحقول مختلفة عن التسجيل اليدوي من واتساب
// (additional_data + selected_services بدل form_data + embassy_application)،
// لذا نحتاج توحيد القراءة هنا حتى تظهر تسجيلات العملاء الحقيقية بشكل صحيح.
function getContactData(reg: any): Record<string, any> | null {
    const additionalData = reg.additional_data
    if (additionalData && Object.keys(additionalData).length > 0) return additionalData
    return reg.form_data || null
}

function extractPhone(data: Record<string, any> | null, explicit?: string | null): string | null {
    if (explicit) return explicit
    if (!data) return null
    for (const val of Object.values(data)) {
        const str = String(val).replace(/\s/g, '')
        if (/^[\+]?[0-9]{8,15}$/.test(str) || /^0[0-9]{9,11}$/.test(str)) return String(val)
    }
    return null
}

function extractEmail(data: Record<string, any> | null, explicit?: string | null): string | null {
    if (explicit) return explicit
    if (!data) return null
    for (const val of Object.values(data)) {
        const str = String(val).trim()
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return str
    }
    return null
}

function getSourceInfo(reg: any): { key: 'website' | 'app' | 'manual'; label: string; Icon: typeof Globe } {
    if (!reg.user_id) return { key: 'manual', label: 'يدوي (واتساب)', Icon: MessageCircle }
    const additionalData = reg.additional_data
    const hasWebsiteFields = additionalData &&
        Object.keys(additionalData).length > 0 &&
        !Object.keys(additionalData).every((k) => /^field_\d+$/.test(k))
    return hasWebsiteFields
        ? { key: 'website', label: 'الموقع الإلكتروني', Icon: Globe }
        : { key: 'app', label: 'تطبيق الجوال', Icon: Smartphone }
}

function getNeededServices(reg: any) {
    const embassy = reg.embassy_application || {}
    const services: any[] = Array.isArray(reg.selected_services) ? reg.selected_services : []
    return {
        needInvitation: embassy.need_invitation ?? true,
        needAppAssistance: embassy.need_app_assistance || services.some((s) => s.key === 'applicationHelp'),
        needTlsAppointment: embassy.need_tls_appointment || services.some((s) => s.key === 'appointmentBooking'),
        needInsurance: embassy.need_insurance || services.some((s) => s.key === 'insurance'),
        status: embassy.status || (
            reg.status === 'confirmed' || reg.status === 'approved' ? 'approved' :
            reg.status === 'rejected' || reg.status === 'cancelled' ? 'rejected' : 'pending'
        )
    }
}

export function StepLeads({ event, initialRegistrations, isReadOnly }: StepLeadsProps) {
    const [registrations, setRegistrations] = useState<any[]>(initialRegistrations || [])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form builder / Leads Parser State
    const [chatText, setChatText] = useState('')
    const [leadForm, setLeadForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        needInvitation: false,
        needAppAssistance: false,
        needTlsAppointment: false,
        needInsurance: false,
        embassyStatus: 'pending',
        notes: '',
        passportUrl: '',
        nationalIdUrl: '',
        otherDocUrl: ''
    })

    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [isUploadingPassport, setIsUploadingPassport] = useState(false)
    const [isUploadingNationalId, setIsUploadingNationalId] = useState(false)
    const [isUploadingOtherDoc, setIsUploadingOtherDoc] = useState(false)

    const [isParserOpen, setIsParserOpen] = useState(false)

    const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'national_id' | 'other') => {
        const file = e.target.files?.[0]
        if (!file) return

        if (type === 'passport') setIsUploadingPassport(true)
        if (type === 'national_id') setIsUploadingNationalId(true)
        if (type === 'other') setIsUploadingOtherDoc(true)

        setFormMessage(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)
            formData.append('bucket', 'events-bucket')

            const response = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || 'فشل الرفع')
            }

            const data = await response.json()
            
            setLeadForm(prev => ({
                ...prev,
                [type === 'passport' ? 'passportUrl' : type === 'national_id' ? 'nationalIdUrl' : 'otherDocUrl']: data.url
            }))
        } catch (err: any) {
            console.error('Error uploading document:', err)
            setFormMessage({ type: 'error', text: 'فشل رفع المستند: ' + err.message })
        } finally {
            if (type === 'passport') setIsUploadingPassport(false)
            if (type === 'national_id') setIsUploadingNationalId(false)
            if (type === 'other') setIsUploadingOtherDoc(false)
        }
    }

    // AI/Regex parser simulator
    const handleParseLeads = () => {
        if (!chatText) return

        // 1. Extract email
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
        const emails = chatText.match(emailRegex)
        const email = emails ? emails[0] : ''

        // 2. Extract Iraqi or generic mobile phone number
        const phoneRegex = /(?:\+?964|0)?7[0-9]{9}/g
        const phones = chatText.match(phoneRegex)
        const phone = phones ? phones[0] : ''

        // 3. Simple Name extraction (heuristic)
        let fullName = ''
        const textClean = chatText.replace(/[\n\r]/g, ' ')
        // Look for common Arabic words indicating name intro like "اسمي" or "أنا" or "معكم"
        const nameIntroRegex = /(?:اسمي|انا|أنا|المسجل|معكم|الاسم)\s+([\u0600-\u06FF\s]{5,25})/
        const introMatch = textClean.match(nameIntroRegex)
        if (introMatch) {
            fullName = introMatch[1].trim()
        } else {
            // fallback: first 3 Arabic words that aren't stop words
            const words = textClean.split(' ').filter(w => w.length > 2)
            const arabicWords = words.filter(w => /^[\u0600-\u06FF]+$/.test(w))
            if (arabicWords.length >= 2) {
                fullName = arabicWords.slice(0, 3).join(' ')
            }
        }

        // 4. Detect Embassy/TLS services keywords
        const needInvitation = /دعوة|فيزا|تأشيرة|خطاب/i.test(chatText)
        const needAppAssistance = /تعبئة|ابليكيشن|طلب/i.test(chatText)
        const needTlsAppointment = /tls|موعد|سفارة/i.test(chatText)
        const needInsurance = /تأمين|ضمان/i.test(chatText)

        setLeadForm(prev => ({
            ...prev,
            fullName: fullName || prev.fullName,
            email: email || prev.email,
            phone: phone || prev.phone,
            needInvitation,
            needAppAssistance,
            needTlsAppointment,
            needInsurance,
            notes: `تم الاستخراج تلقائياً من رسالة الوارد: "${chatText.substring(0, 80)}..."`
        }))
    }

    // Save lead/registration
    const handleRegisterLead = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        setIsSaving(true)
        setFormMessage(null)

        try {
            const supabase = createClient()
            const ticketNumber = 'JAZ-' + Math.floor(100000 + Math.random() * 900000)

            const insertData = {
                event_id: event.id,
                full_name: leadForm.fullName,
                email: leadForm.email || `${Date.now()}@anonymous.jaz`,
                status: 'registered',
                payment_status: 'paid',
                total_amount: event.price || 0,
                form_data: {
                    phone: leadForm.phone,
                    notes: leadForm.notes
                },
                embassy_application: {
                    need_invitation: leadForm.needInvitation,
                    need_app_assistance: leadForm.needAppAssistance,
                    need_tls_appointment: leadForm.needTlsAppointment,
                    need_insurance: leadForm.needInsurance,
                    status: leadForm.embassyStatus
                },
                selected_services: {
                    invitation: leadForm.needInvitation,
                    app_assistance: leadForm.needAppAssistance,
                    tls_appointment: leadForm.needTlsAppointment,
                    insurance: leadForm.needInsurance
                },
                ticket_number: ticketNumber,
                documents: {
                    passport_url: leadForm.passportUrl,
                    national_id_url: leadForm.nationalIdUrl,
                    other_doc_url: leadForm.otherDocUrl
                }
            }

            const { data, error } = await supabase
                .from('registrations')
                .insert(insertData)
                .select()
                .single()

            if (error) throw error

            setRegistrations(prev => [data, ...prev])
            setFormMessage({ type: 'success', text: 'تم تسجيل العميل وإضافته لقائمة الحضور وتأشيرات السفارة!' })

            // Reset form
            setLeadForm({
                fullName: '',
                email: '',
                phone: '',
                needInvitation: false,
                needAppAssistance: false,
                needTlsAppointment: false,
                needInsurance: false,
                embassyStatus: 'pending',
                notes: '',
                passportUrl: '',
                nationalIdUrl: '',
                otherDocUrl: ''
            })
            setChatText('')
        } catch (err: any) {
            console.error('Error saving registration:', err)
            setFormMessage({ type: 'error', text: err.message || 'فشل تسجيل العميل' })
        } finally {
            setIsSaving(false)
        }
    }

    // Toggle check-in status
    const toggleCheckIn = async (registrationId: string, currentStatus: string) => {
        if (isReadOnly) return
        const newStatus = currentStatus === 'checked_in' ? 'registered' : 'checked_in'

        try {
            const supabase = createClient()
            const checkInTime = newStatus === 'checked_in' ? new Date().toISOString() : null
            const target = registrations.find(r => r.id === registrationId)
            // نضمّ check_in_time لبيانات additional_data الحالية بدل استبدالها،
            // لأن تسجيلات الموقع/التطبيق تخزّن هناك بيانات النموذج الفعلية للعميل
            const mergedAdditionalData = { ...(target?.additional_data || {}), check_in_time: checkInTime }

            const { error } = await supabase
                .from('registrations')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    additional_data: mergedAdditionalData
                })
                .eq('id', registrationId)

            if (error) throw error

            setRegistrations(prev =>
                prev.map(r =>
                    r.id === registrationId
                        ? { ...r, status: newStatus, additional_data: mergedAdditionalData }
                        : r
                )
            )
        } catch (err) {
            console.error('Error updating check-in status:', err)
        }
    }

    // Filter registrations
    const filteredRegistrations = registrations.filter(r => {
        const query = searchQuery.toLowerCase()
        const contactData = getContactData(r)
        const fullName = (r.full_name || '').toLowerCase()
        const email = (r.email || extractEmail(contactData) || '').toLowerCase()
        const phone = (r.form_data?.phone || extractPhone(contactData) || '').toLowerCase()
        const ticket = (r.ticket_number || '').toLowerCase()

        return fullName.includes(query) || email.includes(query) || phone.includes(query) || ticket.includes(query)
    })

    // Export registrations as CSV
    const exportCSV = () => {
        const headers = ['المصدر', 'تذكرة', 'الاسم الكامل', 'البريد الإلكتروني', 'الهاتف', 'خطاب دعوة', 'طلب السفارة', 'موعد السفارة TLS', 'تأمين صحي', 'حالة الحضور', 'تاريخ التسجيل']
        const rows = registrations.map(r => {
            const contactData = getContactData(r)
            const services = getNeededServices(r)
            return [
                getSourceInfo(r).label,
                r.ticket_number || '',
                r.full_name || '',
                r.email || extractEmail(contactData) || '',
                r.form_data?.phone || extractPhone(contactData) || '',
                services.needInvitation ? 'نعم' : 'لا',
                services.needAppAssistance ? 'نعم' : 'لا',
                services.needTlsAppointment ? 'نعم' : 'لا',
                services.needInsurance ? 'نعم' : 'لا',
                r.status === 'checked_in' ? 'حاضر' : 'مسجل فقط',
                r.created_at ? new Date(r.created_at).toLocaleDateString('ar-IQ') : ''
            ]
        })

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `registrations-${event.id}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Panel: Chat Lead Parser / Registry form */}
                <div className="lg:col-span-1 space-y-6">
                    <Collapsible open={isParserOpen} onOpenChange={setIsParserOpen}>
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 transition-colors text-right"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <CardTitle className="text-sm font-bold text-slate-800">محلل الرسائل</CardTitle>
                                            <CardDescription className="text-xs text-slate-500">لصق رسالة واتساب أو فيسبوك لتسجيل العميل</CardDescription>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isParserOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="pt-4 space-y-4 border-t border-slate-100">
                                    <div className="space-y-2">
                                        <Label htmlFor="chatText" className="text-xs text-slate-700 font-semibold">نص الرسالة الواردة</Label>
                                        <Textarea
                                            id="chatText"
                                            value={chatText}
                                            onChange={(e) => setChatText(e.target.value)}
                                            placeholder="مثال: مرحبًا اسمي علي جاسم وايميلي ali.jassim@mail.com وتلفوني 07701234567 وأريد تحجزولي موعد سفارة TLS وتأمين صحي"
                                            rows={4}
                                            className="bg-white text-xs border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleParseLeads}
                                            disabled={!chatText}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-sm"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            تحليل واستخراج البيانات
                                        </Button>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    <Card className="border-slate-100 shadow-md">
                        <CardHeader className="border-b border-slate-50 pb-3">
                            <CardTitle className="text-sm font-bold text-slate-800">بيانات العميل والتأشيرة</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleRegisterLead} className="space-y-4">
                                {formMessage && (
                                    <div className={`p-3 rounded-lg text-xs ${
                                        formMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                                    }`}>
                                        {formMessage.text}
                                    </div>
                                )}

                                {/* Document Upload Section */}
                                <div className="space-y-3 pb-3 border-b border-slate-100">
                                    <Label className="text-xs text-slate-800 font-bold block">رفع وثائق ومستندات العميل</Label>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {/* Passport File */}
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-slate-500">جواز السفر</Label>
                                            {leadForm.passportUrl ? (
                                                <div className="flex items-center justify-between p-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 text-[10px]">
                                                    <span className="truncate max-w-[80px] text-indigo-700 font-semibold">تم الرفع ✓</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setLeadForm(prev => ({ ...prev, passportUrl: '' }))}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => handleUploadDocument(e, 'passport')}
                                                        disabled={isUploadingPassport || isReadOnly}
                                                        className="text-[10px] h-8 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer w-full"
                                                    />
                                                    {isUploadingPassport && <Loader2 className="w-3 h-3 animate-spin absolute left-1 top-2 text-indigo-600" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* National ID File */}
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-slate-500">البطاقة الموحدة / الهوية</Label>
                                            {leadForm.nationalIdUrl ? (
                                                <div className="flex items-center justify-between p-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 text-[10px]">
                                                    <span className="truncate max-w-[80px] text-indigo-700 font-semibold">تم الرفع ✓</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setLeadForm(prev => ({ ...prev, nationalIdUrl: '' }))}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => handleUploadDocument(e, 'national_id')}
                                                        disabled={isUploadingNationalId || isReadOnly}
                                                        className="text-[10px] h-8 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer w-full"
                                                    />
                                                    {isUploadingNationalId && <Loader2 className="w-3 h-3 animate-spin absolute left-1 top-2 text-indigo-600" />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Other Docs */}
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-slate-500">وثائق أخرى</Label>
                                            {leadForm.otherDocUrl ? (
                                                <div className="flex items-center justify-between p-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 text-[10px]">
                                                    <span className="truncate max-w-[80px] text-indigo-700 font-semibold">تم الرفع ✓</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setLeadForm(prev => ({ ...prev, otherDocUrl: '' }))}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => handleUploadDocument(e, 'other')}
                                                        disabled={isUploadingOtherDoc || isReadOnly}
                                                        className="text-[10px] h-8 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer w-full"
                                                    />
                                                    {isUploadingOtherDoc && <Loader2 className="w-3 h-3 animate-spin absolute left-1 top-2 text-indigo-600" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="fullName" className="text-xs text-slate-600 font-medium">الاسم الكامل للعميل</Label>
                                    <Input
                                        id="fullName"
                                        value={leadForm.fullName}
                                        onChange={(e) => setLeadForm(prev => ({ ...prev, fullName: e.target.value }))}
                                        placeholder="الاسم الثلاثي واللقب"
                                        className="text-xs h-9"
                                        required
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="phone" className="text-xs text-slate-600 font-medium">رقم الهاتف</Label>
                                        <Input
                                            id="phone"
                                            value={leadForm.phone}
                                            onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="0770XXXXXXX"
                                            className="text-xs h-9 text-left"
                                            dir="ltr"
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-xs text-slate-600 font-medium">البريد الإلكتروني</Label>
                                        <Input
                                            id="email"
                                            value={leadForm.email}
                                            onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="name@email.com"
                                            className="text-xs h-9 text-left"
                                            dir="ltr"
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                </div>

                                {/* Visa Services checkboxes */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <Label className="text-xs text-slate-800 font-semibold block mb-1">خدمات تأشيرة السفر والسفارة المطلوب تقديمها</Label>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-600" />
                                            <span className="text-xs text-slate-800 font-medium">خطاب دعوة رسمي للفعالية</span>
                                        </div>
                                        <Switch
                                            checked={leadForm.needInvitation}
                                            onCheckedChange={(checked) => setLeadForm(prev => ({ ...prev, needInvitation: checked }))}
                                            disabled={isReadOnly}
                                            size="sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Plane className="w-4 h-4 text-slate-600" />
                                            <span className="text-xs text-slate-800 font-medium">مساعدة تعبئة طلب السفارة (Application)</span>
                                        </div>
                                        <Switch
                                            checked={leadForm.needAppAssistance}
                                            onCheckedChange={(checked) => setLeadForm(prev => ({ ...prev, needAppAssistance: checked }))}
                                            disabled={isReadOnly}
                                            size="sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                            <span className="text-xs text-slate-800 font-medium">حجز موعد السفارة / TLS</span>
                                        </div>
                                        <Switch
                                            checked={leadForm.needTlsAppointment}
                                            onCheckedChange={(checked) => setLeadForm(prev => ({ ...prev, needTlsAppointment: checked }))}
                                            disabled={isReadOnly}
                                            size="sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-slate-600" />
                                            <span className="text-xs text-slate-800 font-medium">تأمين صحي للسفر</span>
                                        </div>
                                        <Switch
                                            checked={leadForm.needInsurance}
                                            onCheckedChange={(checked) => setLeadForm(prev => ({ ...prev, needInsurance: checked }))}
                                            disabled={isReadOnly}
                                            size="sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="embassyStatus" className="text-xs text-slate-600 font-medium">حالة طلب تأشيرة السفارة</Label>
                                    <select
                                        id="embassyStatus"
                                        value={leadForm.embassyStatus}
                                        onChange={(e) => setLeadForm(prev => ({ ...prev, embassyStatus: e.target.value }))}
                                        disabled={isReadOnly}
                                        className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="ok">حالة الطلب اوكي (OK)</option>
                                        <option value="pending">قيد الانتظار (لم يبدأ التجهيز)</option>
                                        <option value="preparing_files">جاري تجهيز الملف والترجمة</option>
                                        <option value="appointment_booked">تم حجز موعد TLS / السفارة</option>
                                        <option value="submitted">تم تقديم الملف للقنصلية</option>
                                        <option value="approved">تم منح التأشيرة بنجاح (Approved)</option>
                                        <option value="rejected">تم الرفض من السفارة (Rejected)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="notes" className="text-xs text-slate-600 font-medium">ملاحظات أو متطلبات خاصة بالعميل</Label>
                                    <Textarea
                                        id="notes"
                                        value={leadForm.notes}
                                        onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="أي متطلبات طبية، إعاقة، فندق، تاريخ حجز الطيران المفترض..."
                                        className="text-xs resize-none"
                                        rows={2}
                                        disabled={isReadOnly}
                                    />
                                </div>

                                {!isReadOnly && (
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                جاري التسجيل...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-3.5 h-3.5" />
                                                تسجيل العميل وحفظ الطلب
                                            </>
                                        )}
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Attendance List & Check-in system */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-100 shadow-md">
                        <CardHeader className="border-b border-slate-50 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    قائمة الحضور وتسجيلات الفعالية
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    إجمالي العملاء المسجلين: {registrations.length} | الحاضرون (Check-in): {registrations.filter(r => r.status === 'checked_in').length}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportCSV}
                                    className="border-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 h-9"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    تصدير تقرير CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {/* Search bar */}
                            <div className="relative mb-4">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="بحث باسم العميل، البريد الإلكتروني، رقم الهاتف أو التذكرة..."
                                    className="pr-10 text-xs border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>

                            {filteredRegistrations.length > 0 ? (
                                <div className="overflow-x-auto border rounded-xl">
                                    <Table>
                                        <TableHeader className="bg-slate-100">
                                            <TableRow>
                                                <TableHead className="text-right text-xs">التذكرة والاسم</TableHead>
                                                <TableHead className="text-right text-xs">المصدر</TableHead>
                                                <TableHead className="text-right text-xs">الهاتف والبريد</TableHead>
                                                <TableHead className="text-right text-xs">متطلبات السفارة</TableHead>
                                                <TableHead className="text-right text-xs">حالة التأشيرة</TableHead>
                                                <TableHead className="text-right text-xs">التحضير (Check-in)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRegistrations.map((reg) => {
                                                const contactData = getContactData(reg)
                                                const services = getNeededServices(reg)
                                                const source = getSourceInfo(reg)
                                                const checkInTime = reg.additional_data?.check_in_time
                                                const displayName = reg.full_name || 'بدون اسم'
                                                const displayPhone = reg.form_data?.phone || extractPhone(contactData)
                                                const displayEmail = reg.email || extractEmail(contactData)
                                                const isDocsArray = Array.isArray(reg.documents)

                                                return (
                                                    <TableRow key={reg.id} className="hover:bg-slate-50/50">
                                                        <TableCell>
                                                            <div className="font-bold text-slate-800 text-xs">{reg.ticket_number || `#${String(reg.id).slice(0, 8).toUpperCase()}`}</div>
                                                            <div className="font-semibold text-slate-900 text-sm mt-0.5">{displayName}</div>

                                                            {/* Document Links */}
                                                            {isDocsArray ? (
                                                                reg.documents.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                        {reg.documents.map((doc: any, i: number) => (
                                                                            <a
                                                                                key={i}
                                                                                href={`/api/documents/view?path=${encodeURIComponent(doc.path)}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-0.5 text-[9px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1 rounded hover:underline"
                                                                            >
                                                                                📄 {doc.name || `وثيقة ${i + 1}`}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )
                                                            ) : reg.documents && (
                                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                    {reg.documents.passport_url && (
                                                                        <a href={reg.documents.passport_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[9px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1 rounded hover:underline">
                                                                            📄 جواز
                                                                        </a>
                                                                    )}
                                                                    {reg.documents.national_id_url && (
                                                                        <a href={reg.documents.national_id_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[9px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1 rounded hover:underline">
                                                                            🪪 هوية
                                                                        </a>
                                                                    )}
                                                                    {reg.documents.other_doc_url && (
                                                                        <a href={reg.documents.other_doc_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[9px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1 rounded hover:underline">
                                                                            📁 أخرى
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 whitespace-nowrap">
                                                                <source.Icon className="w-3 h-3 text-slate-400" />
                                                                {source.label}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            <div className="text-slate-700" dir="ltr">{displayPhone || '—'}</div>
                                                            <div className="text-slate-400 mt-0.5">{displayEmail || '—'}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {services.needInvitation && (
                                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-indigo-600 border-indigo-100">خطاب دعوة</Badge>
                                                                )}
                                                                {services.needAppAssistance && (
                                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-indigo-600 border-indigo-100">Application</Badge>
                                                                )}
                                                                {services.needTlsAppointment && (
                                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-pink-600 border-pink-100">موعد TLS</Badge>
                                                                )}
                                                                {services.needInsurance && (
                                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-emerald-600 border-emerald-100">تأمين صحي</Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {services.status === 'ok' ? (
                                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] hover:bg-emerald-100 font-bold">حالة الطلب اوكي (OK)</Badge>
                                                            ) : services.status === 'approved' ? (
                                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] hover:bg-emerald-100">مقبول</Badge>
                                                            ) : services.status === 'rejected' ? (
                                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] hover:bg-rose-100">مرفوض</Badge>
                                                            ) : services.status === 'appointment_booked' ? (
                                                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] hover:bg-blue-100">موعد محجوز</Badge>
                                                            ) : services.status === 'preparing_files' ? (
                                                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] hover:bg-amber-100">تجهيز الملفات</Badge>
                                                            ) : (
                                                                <Badge className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] hover:bg-slate-100">بانتظار المراجعة</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1 items-start">
                                                                <Button
                                                                    size="sm"
                                                                    variant={reg.status === 'checked_in' ? 'primary' : 'outline'}
                                                                    disabled={isReadOnly}
                                                                    onClick={() => toggleCheckIn(reg.id, reg.status)}
                                                                    className={`text-xs h-7 px-3 rounded-lg ${
                                                                        reg.status === 'checked_in'
                                                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {reg.status === 'checked_in' ? 'تم تسجيل الحضور' : 'تسجيل حضور'}
                                                                </Button>
                                                                {checkInTime && (
                                                                    <span className="text-[9px] text-slate-400 font-mono">
                                                                        {new Date(checkInTime).toLocaleTimeString('ar-IQ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500 text-sm">
                                    لا يوجد مسجلين يطابقون بحثك.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
