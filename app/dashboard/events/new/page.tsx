'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Save, Upload, X, Globe, MapPin as MapPinIcon, ImageIcon, Presentation, Home, Palette, Award, Store, Handshake, ClipboardList, ChevronDown, ChevronUp, CalendarDays, Plus, Trash2, ImagePlus, Clock, Wrench, User } from 'lucide-react'
import type { FormField } from '@/lib/types'
import type { Sector } from '@/lib/database.types'

const RegistrationFormBuilder = dynamic(
    () => import('@/components/shared/registration-form-builder').then(mod => ({ default: mod.RegistrationFormBuilder })),
    { ssr: false }
)

export default function AddEventPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const htmlFileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isUploadingHtml, setIsUploadingHtml] = useState(false)
    const [error, setError] = useState('')
    const [sectors, setSectors] = useState<Sector[]>([])
    const [quickAdd, setQuickAdd] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        date: '',
        end_date: '',
        location: '',
        location_ar: '',
        capacity: '',
        price: '',
        show_price: true,
        sector: '',
        sector_id: '',
        event_type: 'local',
        status: 'draft',
        featured: false,
        image_url: '',
        mentorship: '',
        mentorship_ar: '',
        country: '',
        country_ar: '',
        sub_sector: '',
        sub_sector_ar: '',
        html_content_url: '',
        html_content: '',
    })


    type TopicItem = { id: string; image_url: string; title_ar: string; title_en: string; description_ar: string; description_en: string }

    // Conference sections config
    const [conferenceConfig, setConferenceConfig] = useState({
        home: { enabled: true, content_ar: '', content_en: '' },
        theme: { enabled: true, content_ar: '', content_en: '', topics: [] as TopicItem[] },
        sponsors: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
        exhibitors: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
        partners: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
        registration: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
        program: { enabled: true, sessions: [] as { id: string; date: string; start_time: string; end_time: string; title_ar: string; title_en: string; speaker_ar: string; speaker_en: string; location_ar: string; location_en: string; category: 'session' | 'workshop'; description_ar: string; description_en: string }[] },
    })
    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    const handleTopicImageUpload = useCallback(async (file: File, sectionKey: string, topicId: string) => {
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `events/topics/${Date.now()}_${topicId}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('events-bucket').upload(fileName, file)
        if (uploadError) return
        const { data: { publicUrl } } = supabase.storage.from('events-bucket').getPublicUrl(fileName)
        setConferenceConfig(prev => {
            const section = prev[sectionKey as keyof typeof prev] as any
            if (!section?.topics) return prev
            return {
                ...prev,
                [sectionKey]: {
                    ...section,
                    topics: section.topics.map((t: TopicItem) => t.id === topicId ? { ...t, image_url: publicUrl } : t)
                }
            }
        })
    }, [])

    useEffect(() => {
        const fetchSectors = async () => {
            const supabase = createClient()
            const { data } = await supabase.from('sectors').select('*').eq('is_active', true).order('sort_order')
            if (data) setSectors(data)
        }
        fetchSectors()
    }, [])

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `events/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('events-bucket')
            .upload(fileName, file)

        if (uploadError) {
            setError('فشل رفع الصورة: ' + uploadError.message)
            setIsUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage.from('events-bucket').getPublicUrl(fileName)
        setFormData(prev => ({ ...prev, image_url: publicUrl }))
        setIsUploading(false)
    }, [])

    const handleHtmlUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            setError('يرجى رفع ملف HTML فقط')
            return
        }
        setIsUploadingHtml(true)
        
        try {
            const htmlContent = await file.text()
            setFormData(prev => ({ ...prev, html_content_url: file.name, html_content: htmlContent }))
        } catch (err) {
            setError('فشل قراءة ملف HTML')
        }
        
        setIsUploadingHtml(false)
    }, [])

    const handleStatusChange = useCallback((value: string) => {
        setFormData(prev => ({ ...prev, status: value }))
    }, [])

    const handleEventTypeChange = useCallback((value: string) => {
        setFormData(prev => ({ ...prev, event_type: value }))
    }, [])

    const handleSectorChange = useCallback((value: string) => {
        const sector = sectors.find(s => s.id === value)
        setFormData(prev => ({
            ...prev,
            sector_id: value,
            sector: sector?.slug || '',
        }))
    }, [sectors])

    const handleFeaturedChange = useCallback((checked: boolean) => {
        setFormData(prev => ({ ...prev, featured: checked }))
    }, [])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }))
    }, [])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const supabase = createClient()

        const { error } = await supabase.from('events').insert({
            title: formData.title,
            title_ar: formData.title_ar || null,
            description: formData.description || null,
            description_ar: formData.description_ar || null,
            date: formData.date,
            end_date: formData.end_date || null,
            location: formData.location,
            location_ar: formData.location_ar || null,
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            price: formData.price ? parseFloat(formData.price) : null,
            show_price: formData.show_price,
            sector: formData.sector || null,
            sector_id: formData.sector_id || null,
            event_type: formData.event_type,
            status: formData.status,
            featured: formData.featured,
            image_url: formData.image_url || null,
            mentorship: formData.mentorship || null,
            mentorship_ar: formData.mentorship_ar || null,
            country: formData.country || null,
            country_ar: formData.country_ar || null,
            sub_sector: formData.sub_sector || null,
            sub_sector_ar: formData.sub_sector_ar || null,
            html_content_url: formData.html_content_url || null,
            html_content: formData.html_content || null,
            conference_config: quickAdd ? null : (conferenceConfig as any),
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
            return
        }

        router.push('/dashboard/events')
        router.refresh()
    }, [formData, conferenceConfig, quickAdd, router])

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events" className="text-gray-500 hover:text-gray-700">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">إضافة فعالية جديدة</h1>
                </div>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <label htmlFor="quickAdd" className="text-sm font-medium text-gray-700 cursor-pointer">
                        إضافة سريعة
                    </label>
                    <input
                        type="checkbox"
                        id="quickAdd"
                        checked={quickAdd}
                        onChange={(e) => setQuickAdd(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="w-full justify-start bg-white border rounded-xl p-1 h-auto flex-wrap">
                        <TabsTrigger value="basic" className="rounded-lg px-4 py-2 text-sm">المعلومات الأساسية</TabsTrigger>
                        <TabsTrigger value="details" className="rounded-lg px-4 py-2 text-sm">التفاصيل والتصنيف</TabsTrigger>
                        {!quickAdd && (
                            <TabsTrigger value="conference" className="rounded-lg px-4 py-2 text-sm flex items-center gap-1.5">
                                <Presentation className="w-4 h-4" />
                                أقسام المؤتمر
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Tab 1: Basic Info */}
                    <TabsContent value="basic">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-bold text-gray-900">المعلومات الأساسية</h2>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label="العنوان (إنجليزي)" name="title" value={formData.title} onChange={handleChange} required />
                                    <Input label="العنوان (عربي)" name="title_ar" value={formData.title_ar} onChange={handleChange} />

                                    <div className="space-y-2">
                                        <Label htmlFor="description">الوصف (إنجليزي)</Label>
                                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="أدخل وصف الفعالية بالإنجليزية" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description_ar">الوصف (عربي)</Label>
                                        <Textarea id="description_ar" name="description_ar" value={formData.description_ar} onChange={handleChange} rows={4} placeholder="أدخل وصف الفعالية بالعربية" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Image Upload Card */}
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        صورة الفعالية
                                    </h2>
                                </CardHeader>
                                <CardContent>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                    {formData.image_url ? (
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                            <div className="relative h-64">
                                                <Image src={formData.image_url} alt="صورة الفعالية" fill className="object-cover" />
                                            </div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                                                >
                                                    <Upload className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                                                >
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                                        >
                                            {isUploading ? (
                                                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-gray-100 rounded-xl">
                                                        <Upload className="w-6 h-6 text-gray-500" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-700">اضغط لرفع صورة</p>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP حتى 5MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <Separator className="my-4" />

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">الحالة</Label>
                                            <Select value={formData.status} onValueChange={handleStatusChange}>
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="اختر الحالة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">مسودة</SelectItem>
                                                    <SelectItem value="published">منشور</SelectItem>
                                                    <SelectItem value="cancelled">ملغي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox id="featured" checked={formData.featured} onCheckedChange={handleFeaturedChange} />
                                            <Label htmlFor="featured" className="cursor-pointer">فعالية مميزة</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* HTML Content Upload Card */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <Upload className="w-5 h-5" />
                                                محتوى HTML للفعالية
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">يمكنك تعديل محتوى HTML مباشرة أو رفع ملف HTML</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input ref={htmlFileInputRef} type="file" accept=".html,.htm" onChange={handleHtmlUpload} className="hidden" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => htmlFileInputRef.current?.click()}
                                                disabled={isUploadingHtml}
                                                className="flex items-center gap-1.5 text-xs"
                                            >
                                                {isUploadingHtml ? (
                                                    <div className="animate-spin w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
                                                ) : (
                                                    <Upload className="w-3.5 h-3.5" />
                                                )}
                                                رفع ملف HTML
                                            </Button>
                                            {formData.html_content && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, html_content_url: '', html_content: '' }))}
                                                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    مسح
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {formData.html_content_url && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <Upload className="w-3 h-3" />
                                                تم تحميل: {formData.html_content_url.split('/').pop()}
                                            </p>
                                        )}
                                        <textarea
                                            value={formData.html_content}
                                            onChange={e => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                                            className="w-full h-80 px-3 py-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-colors"
                                            placeholder="اكتب أو الصق محتوى HTML هنا..."
                                            dir="ltr"
                                            spellCheck={false}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Details & Classification */}
                    <TabsContent value="details">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-bold text-gray-900">التاريخ والموقع</h2>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label="تاريخ البدء" type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
                                    <Input label="تاريخ الانتهاء" type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} />
                                    <Input label="الموقع (إنجليزي)" name="location" value={formData.location} onChange={handleChange} required />
                                    <Input label="الموقع (عربي)" name="location_ar" value={formData.location_ar} onChange={handleChange} />
                                    <Input label="الدولة (إنجليزي)" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. France" />
                                    <Input label="الدولة (عربي)" name="country_ar" value={formData.country_ar} onChange={handleChange} placeholder="مثال: فرنسا" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-bold text-gray-900">التصنيف والسعر</h2>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Event Type */}
                                    <div className="space-y-2">
                                        <Label>نوع الفعالية</Label>
                                        <Select value={formData.event_type} onValueChange={handleEventTypeChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر نوع الفعالية" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="local">
                                                    <span className="flex items-center gap-2">
                                                        <MapPinIcon className="w-4 h-4" />
                                                        محلية
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="international">
                                                    <span className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4" />
                                                        دولية
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sector */}
                                    <div className="space-y-2">
                                        <Label>القطاع</Label>
                                        <Select value={formData.sector_id} onValueChange={handleSectorChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر القطاع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectors.map(sector => (
                                                    <SelectItem key={sector.id} value={sector.id}>
                                                        {sector.name_ar}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sub-Sector */}
                                    <Input label="القطاع الفرعي (إنجليزي)" name="sub_sector" value={formData.sub_sector} onChange={handleChange} placeholder="e.g. Medical/Dentistry" />
                                    <Input label="القطاع الفرعي (عربي)" name="sub_sector_ar" value={formData.sub_sector_ar} onChange={handleChange} placeholder="مثال: طب أسنان/معدات طبية" />

                                    <Separator />

                                    {/* Price Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>السعر</Label>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="show_price" className="text-xs text-gray-500 cursor-pointer">إظهار السعر</Label>
                                                <Switch
                                                    id="show_price"
                                                    checked={formData.show_price}
                                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_price: checked }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="السعة" type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                                            <Input label="السعر (د.ع)" type="number" name="price" value={formData.price} onChange={handleChange} />
                                        </div>
                                        {!formData.show_price && (
                                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">السعر مخفي عن الزوار</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>


                    {/* Tab 6: Conference Sections */}
                    {!quickAdd && (
                    <TabsContent value="conference">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Presentation className="w-5 h-5" />
                                    أقسام المؤتمر
                                </h2>
                                <p className="text-sm text-gray-500">حدد الأقسام التي ستظهر في شريط التنقل الخاص بالفعالية. يمكنك إضافة محتوى ونموذج تسجيل لكل قسم.</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {([
                                    { key: 'home', label: 'الصفحة الرئيسية', labelEn: 'Home', icon: Home, color: 'bg-blue-50 text-blue-600', hasForm: false },
                                    { key: 'theme', label: 'موضوع المؤتمر', labelEn: 'Theme', icon: Palette, color: 'bg-purple-50 text-purple-600', hasForm: false },
                                    { key: 'sponsors', label: 'الرعاة', labelEn: 'Sponsors', icon: Award, color: 'bg-yellow-50 text-yellow-600', hasForm: true },
                                    { key: 'exhibitors', label: 'العارضون', labelEn: 'Exhibitors', icon: Store, color: 'bg-green-50 text-green-600', hasForm: true },
                                    { key: 'partners', label: 'الشركاء', labelEn: 'Partners', icon: Handshake, color: 'bg-indigo-50 text-indigo-600', hasForm: true },
                                    { key: 'registration', label: 'التسجيل', labelEn: 'Registration', icon: ClipboardList, color: 'bg-red-50 text-red-600', hasForm: true },
                                ] as const).map(section => {
                                    const SectionIcon = section.icon
                                    const sectionData = conferenceConfig[section.key as keyof typeof conferenceConfig] as { enabled: boolean; content_ar: string; content_en: string; form_fields?: FormField[] }
                                    const isExpanded = expandedSection === section.key
                                    return (
                                        <div key={section.key} className="border border-gray-200 rounded-xl overflow-hidden">
                                            {/* Section Header */}
                                            <div className="flex items-center gap-3 p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedSection(isExpanded ? null : section.key)}>
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                                                    <SectionIcon className="w-4.5 h-4.5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 text-sm">{section.label}</h3>
                                                    <p className="text-xs text-gray-400">{section.labelEn}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {section.hasForm && (sectionData as any).form_fields?.length > 0 && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                            {(sectionData as any).form_fields.length} حقل
                                                        </span>
                                                    )}
                                                    <div onClick={e => e.stopPropagation()}>
                                                        <Switch
                                                            checked={sectionData.enabled}
                                                            onCheckedChange={(checked) => setConferenceConfig(prev => ({
                                                                ...prev,
                                                                [section.key]: { ...prev[section.key as keyof typeof prev], enabled: checked }
                                                            }))}
                                                        />
                                                    </div>
                                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </div>

                                            {/* Section Content (Expanded) */}
                                            {isExpanded && (
                                                <div className="p-5 border-t border-gray-100 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-gray-500">المحتوى / الكلام (عربي)</Label>
                                                            <Textarea
                                                                value={sectionData.content_ar}
                                                                onChange={e => setConferenceConfig(prev => ({
                                                                    ...prev,
                                                                    [section.key]: { ...prev[section.key as keyof typeof prev], content_ar: e.target.value }
                                                                }))}
                                                                rows={4}
                                                                dir="rtl"
                                                                placeholder={`أدخل المحتوى الخاص بقسم ${section.label}...`}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-gray-500">Content (English)</Label>
                                                            <Textarea
                                                                value={sectionData.content_en}
                                                                onChange={e => setConferenceConfig(prev => ({
                                                                    ...prev,
                                                                    [section.key]: { ...prev[section.key as keyof typeof prev], content_en: e.target.value }
                                                                }))}
                                                                rows={4}
                                                                dir="ltr"
                                                                placeholder={`Enter content for ${section.labelEn}...`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Form Builder for sections that have forms */}
                                                    {section.hasForm && (
                                                        <div className="border-t pt-4 mt-4">
                                                            <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                                <ClipboardList className="w-4 h-4" />
                                                                نموذج التسجيل الخاص بـ {section.label}
                                                            </h4>
                                                            <RegistrationFormBuilder
                                                                fields={(sectionData as any).form_fields || []}
                                                                onChange={(fields) => setConferenceConfig(prev => ({
                                                                    ...prev,
                                                                    [section.key]: { ...prev[section.key as keyof typeof prev], form_fields: fields }
                                                                }))}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Topics Editor */}
                                                    {section.key !== 'home' && (
                                                        <div className="border-t pt-4 mt-4">
                                                            <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                                <ImagePlus className="w-4 h-4" />
                                                                المواضيع / البطاقات - {section.label}
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {((sectionData as any).topics || []).map((topic: TopicItem, tIdx: number) => (
                                                                    <div key={topic.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-3">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs font-bold text-gray-500">موضوع {tIdx + 1}</span>
                                                                            <button type="button" onClick={() => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.filter((t: TopicItem) => t.id !== topic.id) } }
                                                                            })} className="p-1 text-red-400 hover:text-red-600 rounded transition-colors">
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                        {/* Image Upload */}
                                                                        <div className="flex items-center gap-3">
                                                                            {topic.image_url ? (
                                                                                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                                                    <Image src={topic.image_url} alt="" fill className="object-cover" />
                                                                                    <button type="button" onClick={() => setConferenceConfig(prev => {
                                                                                        const sec = prev[section.key as keyof typeof prev] as any
                                                                                        return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, image_url: '' } : t) } }
                                                                                    })} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full">
                                                                                        <X className="w-2.5 h-2.5" />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors">
                                                                                    <ImagePlus className="w-4 h-4" />
                                                                                    رفع صورة
                                                                                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                                                                                        const f = e.target.files?.[0]
                                                                                        if (f) handleTopicImageUpload(f, section.key, topic.id)
                                                                                    }} />
                                                                                </label>
                                                                            )}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <Input label="العنوان (عربي)" value={topic.title_ar} onChange={e => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, title_ar: e.target.value } : t) } }
                                                                            })} dir="rtl" placeholder="عنوان الموضوع" />
                                                                            <Input label="Title (English)" value={topic.title_en} onChange={e => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, title_en: e.target.value } : t) } }
                                                                            })} dir="ltr" placeholder="Topic title" />
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <Textarea value={topic.description_ar} onChange={e => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, description_ar: e.target.value } : t) } }
                                                                            })} rows={2} dir="rtl" placeholder="الوصف (عربي)" />
                                                                            <Textarea value={topic.description_en} onChange={e => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, description_en: e.target.value } : t) } }
                                                                            })} rows={2} dir="ltr" placeholder="Description (English)" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <button type="button" onClick={() => setConferenceConfig(prev => {
                                                                    const sec = prev[section.key as keyof typeof prev] as any
                                                                    const newTopic = { id: `topic_${Date.now()}`, image_url: '', title_ar: '', title_en: '', description_ar: '', description_en: '' }
                                                                    return { ...prev, [section.key]: { ...sec, topics: [...(sec.topics || []), newTopic] } }
                                                                })} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors">
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                    إضافة موضوع جديد
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* ===== Program Section (Session Manager) ===== */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedSection(expandedSection === 'program' ? null : 'program')}>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 text-teal-600">
                                            <CalendarDays className="w-4.5 h-4.5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-sm">البرنامج</h3>
                                            <p className="text-xs text-gray-400">Program</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {conferenceConfig.program.sessions.length > 0 && (
                                                <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                                    {conferenceConfig.program.sessions.length} جلسة
                                                </span>
                                            )}
                                            <div onClick={e => e.stopPropagation()}>
                                                <Switch
                                                    checked={conferenceConfig.program.enabled}
                                                    onCheckedChange={(checked) => setConferenceConfig(prev => ({
                                                        ...prev,
                                                        program: { ...prev.program, enabled: checked }
                                                    }))}
                                                />
                                            </div>
                                            {expandedSection === 'program' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </div>

                                    {expandedSection === 'program' && (
                                        <div className="p-5 border-t border-gray-100 space-y-4">
                                            {conferenceConfig.program.sessions.map((sess, index) => (
                                                <div key={sess.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sess.category === 'workshop' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {sess.category === 'workshop' ? '🛠️ ورشة عمل' : '📋 محاضرة'}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-700">جلسة {index + 1}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConferenceConfig(prev => ({
                                                                ...prev,
                                                                program: { ...prev.program, sessions: prev.program.sessions.filter(s => s.id !== sess.id) }
                                                            }))}
                                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Date, Time, Category row */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> التاريخ</Label>
                                                            <Input type="date" value={sess.date} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, date: e.target.value } : s) }
                                                            }))} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> وقت البدء</Label>
                                                            <Input type="time" value={sess.start_time} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, start_time: e.target.value } : s) }
                                                            }))} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> وقت الانتهاء</Label>
                                                            <Input type="time" value={sess.end_time} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, end_time: e.target.value } : s) }
                                                            }))} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">نوع الجلسة</Label>
                                                            <select
                                                                value={sess.category}
                                                                onChange={e => setConferenceConfig(prev => ({
                                                                    ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, category: e.target.value as 'session' | 'workshop' } : s) }
                                                                }))}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-10"
                                                            >
                                                                <option value="session">📋 محاضرة (Session)</option>
                                                                <option value="workshop">🛠️ ورشة عمل (Workshop)</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Title row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Input label="عنوان الجلسة (عربي)" value={sess.title_ar} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, title_ar: e.target.value } : s) }
                                                        }))} dir="rtl" placeholder="مثال: مستقبل الذكاء الاصطناعي" />
                                                        <Input label="Session Title (English)" value={sess.title_en} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, title_en: e.target.value } : s) }
                                                        }))} dir="ltr" placeholder="e.g. Future of AI" />
                                                    </div>

                                                    {/* Speaker row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Input label="المتحدث (عربي)" value={sess.speaker_ar} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, speaker_ar: e.target.value } : s) }
                                                        }))} dir="rtl" placeholder="مثال: د. أحمد محمد" />
                                                        <Input label="Speaker (English)" value={sess.speaker_en} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, speaker_en: e.target.value } : s) }
                                                        }))} dir="ltr" placeholder="e.g. Dr. Ahmed Mohammed" />
                                                    </div>

                                                    {/* Location row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Input label="المكان / القاعة (عربي)" value={sess.location_ar} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, location_ar: e.target.value } : s) }
                                                        }))} dir="rtl" placeholder="مثال: القاعة الرئيسية" />
                                                        <Input label="Location (English)" value={sess.location_en} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, location_en: e.target.value } : s) }
                                                        }))} dir="ltr" placeholder="e.g. Main Hall" />
                                                    </div>

                                                    {/* Description row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">الوصف (عربي) - اختياري</Label>
                                                            <Textarea value={sess.description_ar} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, description_ar: e.target.value } : s) }
                                                            }))} rows={2} dir="rtl" placeholder="نبذة عن الجلسة..." />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">Description (English) - Optional</Label>
                                                            <Textarea value={sess.description_en} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, description_en: e.target.value } : s) }
                                                            }))} rows={2} dir="ltr" placeholder="Brief about the session..." />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => setConferenceConfig(prev => ({
                                                    ...prev,
                                                    program: {
                                                        ...prev.program,
                                                        sessions: [...prev.program.sessions, {
                                                            id: `sess_${Date.now()}`, date: '', start_time: '', end_time: '',
                                                            title_ar: '', title_en: '', speaker_ar: '', speaker_en: '',
                                                            location_ar: '', location_en: '', category: 'session' as const,
                                                            description_ar: '', description_en: ''
                                                        }]
                                                    }
                                                }))}
                                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                إضافة جلسة جديدة
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    )}
                </Tabs>

                <div className="mt-6 flex justify-end gap-4">
                    <Link href="/dashboard/events">
                        <Button type="button" variant="outline">إلغاء</Button>
                    </Link>
                    <Button type="submit" isLoading={isLoading}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ الفعالية
                    </Button>
                </div>
            </form>
        </div>
    )
}
