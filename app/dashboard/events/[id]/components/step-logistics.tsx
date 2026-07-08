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
import { createClient } from '@/lib/supabase/client'
import {
    Plane,
    Building,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Calendar,
    FileText,
    Save,
    Users,
    Search,
    X
} from 'lucide-react'


interface StepLogisticsProps {
    event: any
    initialRegistrations: any[]
    isReadOnly: boolean
}

interface LogisticsFormState {
    needInvitation: boolean
    needAppAssistance: boolean
    needTlsAppointment: boolean
    needInsurance: boolean
    embassyStatus: string
    notes: string
    hotelName: string
    roomNumber: string
    checkIn: string
    checkOut: string
    hotelStatus: string
    airline: string
    flightNumber: string
    departureDate: string
    flightStatus: string
    passportUrl: string
    nationalIdUrl: string
    otherDocUrl: string
}


export function StepLogistics({ event, initialRegistrations, isReadOnly }: StepLogisticsProps) {
    const [registrations, setRegistrations] = useState<any[]>(initialRegistrations || [])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedReg, setSelectedReg] = useState<any | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Uploading states
    const [isUploadingPassport, setIsUploadingPassport] = useState(false)
    const [isUploadingNationalId, setIsUploadingNationalId] = useState(false)
    const [isUploadingOtherDoc, setIsUploadingOtherDoc] = useState(false)

    // Editing form states
    const [logisticsForm, setLogisticsForm] = useState<LogisticsFormState>({
        needInvitation: false,
        needAppAssistance: false,
        needTlsAppointment: false,
        needInsurance: false,
        embassyStatus: 'pending',
        notes: '',
        hotelName: '',
        roomNumber: '',
        checkIn: '',
        checkOut: '',
        hotelStatus: 'pending',
        airline: '',
        flightNumber: '',
        departureDate: '',
        flightStatus: 'pending',
        passportUrl: '',
        nationalIdUrl: '',
        otherDocUrl: ''
    })

    const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'national_id' | 'other') => {
        const file = e.target.files?.[0]
        if (!file) return

        if (type === 'passport') setIsUploadingPassport(true)
        if (type === 'national_id') setIsUploadingNationalId(true)
        if (type === 'other') setIsUploadingOtherDoc(true)

        setMessage(null)

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
            
            setLogisticsForm(prev => ({
                ...prev,
                [type === 'passport' ? 'passportUrl' : type === 'national_id' ? 'nationalIdUrl' : 'otherDocUrl']: data.url
            }))
        } catch (err: any) {
            console.error('Error uploading document:', err)
            setMessage({ type: 'error', text: 'فشل رفع المستند: ' + err.message })
        } finally {
            if (type === 'passport') setIsUploadingPassport(false)
            if (type === 'national_id') setIsUploadingNationalId(false)
            if (type === 'other') setIsUploadingOtherDoc(false)
        }
    }

    const handleSelectRegistration = (reg: any) => {
        setSelectedReg(reg)
        setMessage(null)
        const embassy = reg.embassy_application || {}
        const additional = reg.additional_data || {}
        const hotel = additional.hotel_booking || {}
        const flight = additional.flight_booking || {}
        const docs = reg.documents || {}

        setLogisticsForm({
            needInvitation: embassy.need_invitation || reg.selected_services?.invitation || false,
            needAppAssistance: embassy.need_app_assistance || reg.selected_services?.app_assistance || false,
            needTlsAppointment: embassy.need_tls_appointment || reg.selected_services?.tls_appointment || false,
            needInsurance: embassy.need_insurance || reg.selected_services?.insurance || false,
            embassyStatus: embassy.status || 'pending',
            notes: reg.notes || '',
            hotelName: hotel.hotel_name || '',
            roomNumber: hotel.room_number || '',
            checkIn: hotel.check_in || '',
            checkOut: hotel.check_out || '',
            hotelStatus: hotel.status || 'pending',
            airline: flight.airline || '',
            flightNumber: flight.flight_number || '',
            departureDate: flight.departure_date ? flight.departure_date.substring(0, 16) : '',
            flightStatus: flight.status || 'pending',
            passportUrl: docs.passport_url || '',
            nationalIdUrl: docs.national_id_url || '',
            otherDocUrl: docs.other_doc_url || ''
        })
    }

    const handleSaveLogistics = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedReg || isReadOnly) return

        setIsSaving(true)
        setMessage(null)

        try {
            const supabase = createClient()
            
            const updatedEmbassy = {
                need_invitation: logisticsForm.needInvitation,
                need_app_assistance: logisticsForm.needAppAssistance,
                need_tls_appointment: logisticsForm.needTlsAppointment,
                need_insurance: logisticsForm.needInsurance,
                status: logisticsForm.embassyStatus
            }

            const updatedSelectedServices = {
                ...selectedReg.selected_services,
                invitation: logisticsForm.needInvitation,
                app_assistance: logisticsForm.needAppAssistance,
                tls_appointment: logisticsForm.needTlsAppointment,
                insurance: logisticsForm.needInsurance
            }

            const updatedAdditionalData = {
                ...selectedReg.additional_data,
                hotel_booking: {
                    hotel_name: logisticsForm.hotelName,
                    room_number: logisticsForm.roomNumber,
                    check_in: logisticsForm.checkIn,
                    check_out: logisticsForm.checkOut,
                    status: logisticsForm.hotelStatus
                },
                flight_booking: {
                    airline: logisticsForm.airline,
                    flight_number: logisticsForm.flightNumber,
                    departure_date: logisticsForm.departureDate,
                    status: logisticsForm.flightStatus
                }
            }

            const updatedDocs = {
                ...selectedReg.documents,
                passport_url: logisticsForm.passportUrl,
                national_id_url: logisticsForm.nationalIdUrl,
                other_doc_url: logisticsForm.otherDocUrl
            }

            const { error } = await supabase
                .from('registrations')
                .update({
                    notes: logisticsForm.notes,
                    embassy_application: updatedEmbassy,
                    selected_services: updatedSelectedServices,
                    additional_data: updatedAdditionalData,
                    documents: updatedDocs,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedReg.id)

            if (error) throw error

            setRegistrations(prev =>
                prev.map(r =>
                    r.id === selectedReg.id
                        ? {
                              ...r,
                              notes: logisticsForm.notes,
                              embassy_application: updatedEmbassy,
                              selected_services: updatedSelectedServices,
                              additional_data: updatedAdditionalData,
                              documents: updatedDocs
                          }
                        : r
                )
            )

            setMessage({ type: 'success', text: 'تم حفظ وتحديث البيانات اللوجستية والحجوزات بنجاح!' })
            
            // Update selected registration local state
            setSelectedReg({
                ...selectedReg,
                notes: logisticsForm.notes,
                embassy_application: updatedEmbassy,
                selected_services: updatedSelectedServices,
                additional_data: updatedAdditionalData,
                documents: updatedDocs
            })

        } catch (err: any) {
            console.error('Error saving logistics:', err)
            setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء حفظ البيانات اللوجستية' })
        } finally {
            setIsSaving(false)
        }
    }

    // Heuristic Stats
    const totalRegs = registrations.length
    const needVisaCount = registrations.filter(r => 
        r.embassy_application?.need_invitation || 
        r.embassy_application?.need_tls_appointment || 
        r.selected_services?.invitation ||
        r.selected_services?.tls_appointment
    ).length

    const hotelBookedCount = registrations.filter(r => 
        r.additional_data?.hotel_booking?.status === 'confirmed'
    ).length

    const flightBookedCount = registrations.filter(r => 
        r.additional_data?.flight_booking?.status === 'confirmed'
    ).length

    // Filter registrations
    const filteredRegistrations = registrations.filter(r => {
        const query = searchQuery.toLowerCase()
        const fullName = (r.full_name || '').toLowerCase()
        const email = (r.email || '').toLowerCase()
        const phone = (r.form_data?.phone || '').toLowerCase()
        const ticket = (r.ticket_number || '').toLowerCase()

        return fullName.includes(query) || email.includes(query) || phone.includes(query) || ticket.includes(query)
    })

    const getEmbassyBadge = (status: string) => {
        switch (status) {
            case 'ok':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold">حالة الطلب اوكي (OK)</Badge>
            case 'approved':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">تم منح الفيزا</Badge>
            case 'rejected':
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">مرفوض</Badge>
            case 'appointment_booked':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">موعد TLS مؤكد</Badge>
            case 'submitted':
                return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">تم تقديم الملف</Badge>
            case 'preparing_files':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">جاري تجهيز الملف</Badge>
            default:
                return <Badge variant="outline" className="text-slate-500 bg-slate-50">قيد الانتظار</Badge>
        }
    }

    const getHotelBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">مؤكد</Badge>
            case 'cancelled':
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">ملغي</Badge>
            default:
                return <Badge variant="outline" className="text-slate-500 bg-slate-50">لم يحجز</Badge>
        }
    }

    const getFlightBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">مؤكد</Badge>
            case 'booked_temp':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">حجز مؤقت</Badge>
            case 'cancelled':
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200">ملغي</Badge>
            default:
                return <Badge variant="outline" className="text-slate-500 bg-slate-50">لم يحجز</Badge>
        }
    }

    return (
        <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-650 shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 block uppercase">الحضور الكلي</span>
                            <span className="text-xl font-black text-slate-900">{totalRegs}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-indigo-400 block uppercase">طلبات الفيزا والسفارة</span>
                            <span className="text-xl font-black text-indigo-900">{needVisaCount}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-emerald-400 block uppercase">الفنادق المؤكدة</span>
                            <span className="text-xl font-black text-emerald-900">{hotelBookedCount}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-650 shrink-0">
                            <Plane className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-sky-400 block uppercase">رحلات الطيران المؤكدة</span>
                            <span className="text-xl font-black text-sky-900">{flightBookedCount}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Registrations List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-slate-100 bg-white shadow-sm">
                        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold">الحجوزات والطلبات اللوجستية للعملاء</CardTitle>
                                <CardDescription className="text-[11px] mt-0.5">اختر مستخدمًا لتعديل تفاصيل سفره وتأشيرته وإقامته الفندقية.</CardDescription>
                            </div>
                        </CardHeader>
                        
                        <div className="p-4 border-b border-slate-50 bg-slate-50/20">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="البحث بالاسم، البريد، الهاتف أو رقم التذكرة..."
                                    className="text-xs h-9 pr-9 pl-3 rounded-lg border-slate-250 bg-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="text-right">
                                <TableHeader className="bg-slate-50/60">
                                    <TableRow className="border-slate-100">
                                        <TableHead className="text-right text-xs">الاسم والبيانات</TableHead>
                                        <TableHead className="text-right text-xs">تأشيرة السفارة</TableHead>
                                        <TableHead className="text-right text-xs">حجز الفندق</TableHead>
                                        <TableHead className="text-right text-xs">حجز الطيران</TableHead>
                                        <TableHead className="text-center text-xs w-24">إجراء</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRegistrations.length > 0 ? (
                                        filteredRegistrations.map((reg) => {
                                            const embassy = reg.embassy_application || {}
                                            const additional = reg.additional_data || {}
                                            const hotel = additional.hotel_booking || {}
                                            const flight = additional.flight_booking || {}

                                            return (
                                                <TableRow 
                                                    key={reg.id} 
                                                    className={`border-slate-50 transition-colors hover:bg-slate-50/50 cursor-pointer ${selectedReg?.id === reg.id ? 'bg-indigo-50/20 hover:bg-indigo-50/30' : ''}`}
                                                    onClick={() => handleSelectRegistration(reg)}
                                                >
                                                    <TableCell className="p-3">
                                                        <p className="text-xs font-bold text-slate-900">{reg.full_name || reg.email}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{reg.ticket_number}</p>
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        {getEmbassyBadge(embassy.status)}
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        {getHotelBadge(hotel.status)}
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        {getFlightBadge(flight.status)}
                                                    </TableCell>
                                                    <TableCell className="p-3 text-center">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-7 text-[10px] font-bold rounded-lg border-slate-200 hover:bg-white text-indigo-650 hover:text-indigo-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSelectRegistration(reg)
                                                            }}
                                                        >
                                                            إدارة الحجز
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-xs text-slate-400 font-semibold">
                                                لا توجد نتائج حجز مطابقة لبحثك.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {/* Edit Form Section */}
                <div className="space-y-6">
                    {selectedReg ? (
                        <Card className="border-indigo-100 bg-white shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 left-0 h-1.5 bg-indigo-600"></div>
                            
                            <CardHeader className="p-4 border-b border-slate-100">
                                <CardTitle className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                    <Building className="w-4 h-4 text-indigo-600" />
                                    تعديل الحجوزات واللوجستيات
                                </CardTitle>
                                <CardDescription className="text-[10px] mt-0.5">
                                    المسجل: <b>{selectedReg.full_name}</b>
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="p-4">
                                {/* Document Viewer Links */}
                                {selectedReg.documents && (selectedReg.documents.passport_url || selectedReg.documents.national_id_url || selectedReg.documents.other_doc_url) && (
                                    <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 space-y-1.5 mb-4">
                                        <span className="text-[10px] font-bold text-indigo-950 block">المستندات المرفوعة من العميل (واتساب):</span>
                                        <div className="flex flex-wrap gap-2 pt-0.5">
                                            {selectedReg.documents.passport_url && (
                                                <a 
                                                    href={selectedReg.documents.passport_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-indigo-700 hover:bg-slate-50 font-bold shadow-sm"
                                                >
                                                    📄 جواز السفر
                                                </a>
                                            )}
                                            {selectedReg.documents.national_id_url && (
                                                <a 
                                                    href={selectedReg.documents.national_id_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-indigo-700 hover:bg-slate-50 font-bold shadow-sm"
                                                >
                                                    🪪 الهوية الوطنية
                                                </a>
                                            )}
                                            {selectedReg.documents.other_doc_url && (
                                                <a 
                                                    href={selectedReg.documents.other_doc_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-indigo-700 hover:bg-slate-50 font-bold shadow-sm"
                                                >
                                                    📁 وثيقة إضافية
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSaveLogistics} className="space-y-5">
                                    
                                    {/* Section 1: Visa Assistance */}
                                    <div className="space-y-3.5 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">1. تأشيرة السفر والسفارة</h4>
                                        
                                        <Label className="text-xs text-slate-800 font-semibold block mb-1">خدمات تأشيرة السفر والسفارة المطلوب تقديمها</Label>

                                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-600" />
                                                <span className="text-xs text-slate-805 font-semibold">خطاب دعوة رسمي للفعالية</span>
                                            </div>
                                            <Switch
                                                checked={logisticsForm.needInvitation}
                                                onCheckedChange={(checked) => setLogisticsForm(prev => ({ ...prev, needInvitation: checked }))}
                                                disabled={isReadOnly}
                                                size="sm"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Plane className="w-4 h-4 text-slate-600" />
                                                <span className="text-xs text-slate-805 font-semibold">مساعدة تعبئة طلب السفارة (Application)</span>
                                            </div>
                                            <Switch
                                                checked={logisticsForm.needAppAssistance}
                                                onCheckedChange={(checked) => setLogisticsForm(prev => ({ ...prev, needAppAssistance: checked }))}
                                                disabled={isReadOnly}
                                                size="sm"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-600" />
                                                <span className="text-xs text-slate-805 font-semibold">حجز موعد السفارة / TLS</span>
                                            </div>
                                            <Switch
                                                checked={logisticsForm.needTlsAppointment}
                                                onCheckedChange={(checked) => setLogisticsForm(prev => ({ ...prev, needTlsAppointment: checked }))}
                                                disabled={isReadOnly}
                                                size="sm"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-slate-600" />
                                                <span className="text-xs text-slate-805 font-semibold">تأمين صحي للسفر</span>
                                            </div>
                                            <Switch
                                                checked={logisticsForm.needInsurance}
                                                onCheckedChange={(checked) => setLogisticsForm(prev => ({ ...prev, needInsurance: checked }))}
                                                disabled={isReadOnly}
                                                size="sm"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="embassyStatus" className="text-xs text-slate-650 font-semibold">حالة طلب تأشيرة السفارة</Label>
                                            <select
                                                id="embassyStatus"
                                                value={logisticsForm.embassyStatus}
                                                onChange={(e) => setLogisticsForm(prev => ({ ...prev, embassyStatus: e.target.value }))}
                                                disabled={isReadOnly}
                                                className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

                                        {/* Document Upload Section */}
                                        <div className="space-y-3 pt-3 border-t border-slate-150">
                                            <Label className="text-xs text-slate-800 font-semibold block">رفع وثائق ومستندات العميل</Label>
                                            
                                            <div className="grid grid-cols-1 gap-2">
                                                {/* Passport File */}
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-500 font-medium">جواز السفر</Label>
                                                    {logisticsForm.passportUrl ? (
                                                        <div className="flex items-center justify-between p-1.5 rounded-lg border border-indigo-150 bg-indigo-50/50 text-[11px]">
                                                            <a href={logisticsForm.passportUrl} target="_blank" rel="noopener noreferrer" className="truncate max-w-[180px] text-indigo-750 font-bold hover:underline">
                                                                📄 عرض جواز السفر الحالي ✓
                                                            </a>
                                                            {!isReadOnly && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setLogisticsForm(prev => ({ ...prev, passportUrl: '' }))}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <Input
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => handleUploadDocument(e, 'passport')}
                                                                disabled={isUploadingPassport || isReadOnly}
                                                                className="text-[10px] h-8 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-slate-150 hover:file:bg-slate-200 cursor-pointer w-full"
                                                            />
                                                            {isUploadingPassport && <Loader2 className="w-3 h-3 animate-spin absolute left-1 top-2.5 text-indigo-605" />}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* National ID File */}
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-500 font-medium">البطاقة الموحدة / الهوية</Label>
                                                    {logisticsForm.nationalIdUrl ? (
                                                        <div className="flex items-center justify-between p-1.5 rounded-lg border border-indigo-150 bg-indigo-50/50 text-[11px]">
                                                            <a href={logisticsForm.nationalIdUrl} target="_blank" rel="noopener noreferrer" className="truncate max-w-[180px] text-indigo-750 font-bold hover:underline">
                                                                🪪 عرض الهوية الحالية ✓
                                                            </a>
                                                            {!isReadOnly && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setLogisticsForm(prev => ({ ...prev, nationalIdUrl: '' }))}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <Input
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => handleUploadDocument(e, 'national_id')}
                                                                disabled={isUploadingNationalId || isReadOnly}
                                                                className="text-[10px] h-8 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-slate-150 hover:file:bg-slate-200 cursor-pointer w-full"
                                                            />
                                                            {isUploadingNationalId && <Loader2 className="w-3 h-3 animate-spin absolute left-1 top-2.5 text-indigo-605" />}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Other Docs */}
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-500 font-medium">وثائق أخرى</Label>
                                                    {logisticsForm.otherDocUrl ? (
                                                        <div className="flex items-center justify-between p-1.5 rounded-lg border border-indigo-150 bg-indigo-50/50 text-[11px]">
                                                            <a href={logisticsForm.otherDocUrl} target="_blank" rel="noopener noreferrer" className="truncate max-w-[180px] text-indigo-750 font-bold hover:underline">
                                                                📁 عرض الوثيقة الحالية ✓
                                                            </a>
                                                            {!isReadOnly && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setLogisticsForm(prev => ({ ...prev, otherDocUrl: '' }))}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <Input
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => handleUploadDocument(e, 'other')}
                                                                disabled={isUploadingOtherDoc || isReadOnly}
                                                                className="text-[10px] h-8 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-slate-150 hover:file:bg-slate-200 cursor-pointer w-full"
                                                            />
                                                            {isUploadingOtherDoc && <Loader2 className="w-3 h-3 animate-spin absolute left-1 top-2.5 text-indigo-605" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Hotel Booking */}
                                    <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">2. حجز السكن والفندق</h4>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="hotelName" className="text-[10px] text-slate-650 font-medium">اسم الفندق</Label>
                                                <Input
                                                    id="hotelName"
                                                    value={logisticsForm.hotelName}
                                                    onChange={(e) => setLogisticsForm(prev => ({ ...prev, hotelName: e.target.value }))}
                                                    disabled={isReadOnly}
                                                    className="text-xs h-8 rounded-lg"
                                                    placeholder="مثال: فندق بابل"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="roomNumber" className="text-[10px] text-slate-650 font-medium">رقم الغرفة</Label>
                                                <Input
                                                    id="roomNumber"
                                                    value={logisticsForm.roomNumber}
                                                    onChange={(e) => setLogisticsForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                                                    disabled={isReadOnly}
                                                    className="text-xs h-8 rounded-lg"
                                                    placeholder="مثال: 402"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="checkIn" className="text-[10px] text-slate-650 font-medium">تاريخ الدخول</Label>
                                                <Input
                                                    id="checkIn"
                                                    type="date"
                                                    value={logisticsForm.checkIn}
                                                    onChange={(e) => setLogisticsForm(prev => ({ ...prev, checkIn: e.target.value }))}
                                                    disabled={isReadOnly}
                                                    className="text-xs h-8 rounded-lg"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="checkOut" className="text-[10px] text-slate-650 font-medium">تاريخ الخروج</Label>
                                                <Input
                                                    id="checkOut"
                                                    type="date"
                                                    value={logisticsForm.checkOut}
                                                    onChange={(e) => setLogisticsForm(prev => ({ ...prev, checkOut: e.target.value }))}
                                                    disabled={isReadOnly}
                                                    className="text-xs h-8 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="hotelStatus" className="text-[10px] text-slate-650 font-semibold">حالة حجز الفندق</Label>
                                            <select
                                                id="hotelStatus"
                                                value={logisticsForm.hotelStatus}
                                                onChange={(e) => setLogisticsForm(prev => ({ ...prev, hotelStatus: e.target.value }))}
                                                disabled={isReadOnly}
                                                className="w-full text-xs h-8 rounded-lg border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="pending">لم يتم الحجز بعد</option>
                                                <option value="confirmed">حجز مؤكد وثابت (Confirmed)</option>
                                                <option value="cancelled">تم إلغاء الحجز (Cancelled)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Section 3: Flight Booking */}
                                    <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">3. حجز رحلة الطيران</h4>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="airline" className="text-[10px] text-slate-650 font-medium">شركة الطيران</Label>
                                                <Input
                                                    id="airline"
                                                    value={logisticsForm.airline}
                                                    onChange={(e) => setLogisticsForm(prev => ({ ...prev, airline: e.target.value }))}
                                                    disabled={isReadOnly}
                                                    className="text-xs h-8 rounded-lg"
                                                    placeholder="مثال: الخطوط العراقية"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="flightNumber" className="text-[10px] text-slate-650 font-medium">رقم الرحلة</Label>
                                                <Input
                                                    id="flightNumber"
                                                    value={logisticsForm.flightNumber}
                                                    onChange={(e) => setLogisticsForm(prev => ({ ...prev, flightNumber: e.target.value }))}
                                                    disabled={isReadOnly}
                                                    className="text-xs h-8 rounded-lg"
                                                    placeholder="مثال: IA-102"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="departureDate" className="text-[10px] text-slate-650 font-medium">تاريخ ووقت الإقلاع</Label>
                                            <Input
                                                id="departureDate"
                                                type="datetime-local"
                                                value={logisticsForm.departureDate}
                                                onChange={(e) => setLogisticsForm(prev => ({ ...prev, departureDate: e.target.value }))}
                                                disabled={isReadOnly}
                                                className="text-xs h-8 rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="flightStatus" className="text-[10px] text-slate-650 font-semibold">حالة تذكرة الطيران</Label>
                                            <select
                                                id="flightStatus"
                                                value={logisticsForm.flightStatus}
                                                onChange={(e) => setLogisticsForm(prev => ({ ...prev, flightStatus: e.target.value }))}
                                                disabled={isReadOnly}
                                                className="w-full text-xs h-8 rounded-lg border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="pending">لم تحجز التذكرة</option>
                                                <option value="booked_temp">حجز مبدئي/مؤقت</option>
                                                <option value="confirmed">حجز مؤكد وإصدار التذكرة</option>
                                                <option value="cancelled">تم إلغاء الرحلة/الحجز</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-1">
                                        <Label htmlFor="logNotes" className="text-[10px] text-slate-650 font-semibold">ملاحظات لوجستية إضافية</Label>
                                        <Textarea
                                            id="logNotes"
                                            value={logisticsForm.notes}
                                            onChange={(e) => setLogisticsForm(prev => ({ ...prev, notes: e.target.value }))}
                                            disabled={isReadOnly}
                                            className="text-xs resize-none"
                                            rows={2}
                                            placeholder="اكتب أي متطلبات خاصة للنقل، الاستقبال بالمطار..."
                                        />
                                    </div>

                                    {/* Message Display */}
                                    {message && (
                                        <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-650 shrink-0" />}
                                            <span>{message.text}</span>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {!isReadOnly && (
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    جاري حفظ الحجوزات...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-3.5 h-3.5" />
                                                    حفظ وتحديث الحجوزات
                                                </>
                                            )}
                                        </Button>
                                    )}

                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-slate-200 bg-slate-50/30 shadow-none py-20 text-center rounded-2xl flex flex-col items-center justify-center p-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                <Plane className="w-6 h-6 text-slate-400" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">لم يتم اختيار أي مستخدم</h4>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">اختر أحد الضيوف أو المشاركين من الجدول لإدارة حجوزات الفندق وتذاكر السفر وتأشيرات TLS.</p>
                        </Card>
                    )}
                </div>

            </div>

        </div>
    )
}
