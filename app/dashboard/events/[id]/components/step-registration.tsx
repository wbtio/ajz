'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Calendar, MapPin, Globe, CheckCircle2, ImageIcon, Upload, X } from 'lucide-react'

interface StepRegistrationProps {
    event: any
    onUpdate: (updatedEvent: any) => void
    isReadOnly: boolean
}

export function StepRegistration({ event, onUpdate, isReadOnly }: StepRegistrationProps) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [formData, setFormData] = useState({
        title_ar: event.title_ar || '',
        title: event.title || '',
        description_ar: event.description_ar || '',
        description: event.description || '',
        date: event.date ? event.date.split('T')[0] : '',
        end_date: event.end_date ? event.end_date.split('T')[0] : '',
        location_ar: event.location_ar || '',
        location: event.location || '',
        country_ar: event.country_ar || '',
        country: event.country || '',
        capacity: event.capacity ? String(event.capacity) : '',
        price: event.price ? String(event.price) : '',
        show_price: event.show_price ?? true,
        event_type: event.event_type || 'local',
        status: 'draft'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        setIsSaving(true)
        setMessage(null)

        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('events')
                .update({
                    title_ar: formData.title_ar,
                    title: formData.title,
                    description_ar: formData.description_ar,
                    description: formData.description,
                    date: formData.date || null,
                    end_date: formData.end_date || null,
                    location_ar: formData.location_ar,
                    location: formData.location,
                    country_ar: formData.country_ar,
                    country: formData.country,
                    capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
                    price: formData.price ? parseFloat(formData.price) : null,
                    show_price: formData.show_price,
                    event_type: formData.event_type,
                    status: 'draft'
                })
                .eq('id', event.id)
                .select()
                .single()

            if (error) throw error

            setMessage({ type: 'success', text: 'تم حفظ وتحديث بيانات الفعالية بنجاح!' })
            onUpdate(data)
        } catch (err: any) {
            console.error('Error saving event:', err)
            setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء حفظ البيانات' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            {message && (
                <div className={`p-4 rounded-xl text-sm ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Basic Info Card */}
                        <Card className="border-slate-100 shadow-sm bg-white/90 backdrop-blur">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                                    1. البيانات الأساسية للفعالية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="اسم الفعالية (بالعربية)"
                                        name="title_ar"
                                        value={formData.title_ar}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        placeholder="مثال: مؤتمر بغداد للذكاء الاصطناعي"
                                        required
                                        className="text-sm"
                                    />
                                    <div dir="ltr">
                                        <Input
                                            label="Event Title (English)"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="e.g. Baghdad AI Conference"
                                            required
                                            className="text-sm text-right"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-slate-700 font-medium">الوصف والتفاصيل (بالعربية)</Label>
                                        <Textarea
                                            name="description_ar"
                                            value={formData.description_ar}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="أكتب وصفاً تفصيلياً بالعربية..."
                                            rows={4}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5" dir="ltr">
                                        <Label className="text-sm text-slate-750 block text-right font-medium">Description (English)</Label>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="Write a detailed description in English..."
                                            rows={4}
                                            className="text-sm text-right"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Venue, Date & Classification */}
                        <Card className="border-slate-100 shadow-sm bg-white/90 backdrop-blur">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                    2. الزمان والمكان والتصنيف
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm text-slate-700 font-medium">تاريخ بدء الفعالية</Label>
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            required
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm text-slate-700 font-medium">تاريخ انتهاء الفعالية (اختياري)</Label>
                                        <Input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="الموقع والقاعة (بالعربية)"
                                        name="location_ar"
                                        value={formData.location_ar}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        placeholder="مثال: معرض بغداد، المنصور"
                                        required
                                        className="text-sm"
                                    />
                                    <div dir="ltr">
                                        <Input
                                            label="Venue/Hall (English)"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="e.g. Baghdad Fairground"
                                            required
                                            className="text-sm text-right"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="الدولة (بالعربية)"
                                        name="country_ar"
                                        value={formData.country_ar}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        placeholder="العراق"
                                        className="text-sm"
                                    />
                                    <div dir="ltr">
                                        <Input
                                            label="Country (English)"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="Iraq"
                                            className="text-sm text-right"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Operational Settings */}
                        <Card className="border-slate-100 shadow-sm bg-white/90 backdrop-blur">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                    3. خيارات التشغيل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-600 font-medium">تصنيف الفعالية</Label>
                                    {mounted ? (
                                        <Select
                                            value={formData.event_type}
                                            onValueChange={(val) => handleSelectChange('event_type', val)}
                                            disabled={isReadOnly}
                                        >
                                            <SelectTrigger className="text-xs h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="local">محلية</SelectItem>
                                                <SelectItem value="international">دولية (تتطلب تأشيرات TLS)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="h-9 w-full bg-slate-50 border border-slate-200 rounded-md animate-pulse" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600 font-medium">السعة الاستيعابية</Label>
                                        <Input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="500"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600 font-medium">سعر التذكرة ($)</Label>
                                        <Input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="مجانية"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <Label className="text-xs text-slate-700 font-semibold">إظهار السعر للمستخدمين</Label>
                                    <Switch
                                        checked={formData.show_price}
                                        onCheckedChange={(checked) => handleSwitchChange('show_price', checked)}
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div className="space-y-1.5 pt-3 border-t border-slate-100 flex flex-col gap-1">
                                    <Label className="text-xs text-slate-600 font-medium">حالة النشر والتشغيل</Label>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        مسودة تفاصيل (يتم رفع الفعالية كمسودة فقط)
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Changes Button */}
                        {!isReadOnly && (
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري حفظ التحديثات...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        حفظ التحديثات
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
