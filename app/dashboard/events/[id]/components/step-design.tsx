'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { 
    Save, 
    Loader2, 
    Palette, 
    Upload, 
    X, 
    Globe, 
    Facebook, 
    Instagram, 
    Video,
    CheckCircle2, 
    HelpCircle,
    Plus,
    Trash2,
    MessageSquare,
    FileText,
    File,
    Twitter,
    Linkedin,
    Youtube,
    Ghost,
    Calendar,
    AlertCircle
} from 'lucide-react'

interface StepDesignProps {
    event: any
    onUpdate: (updatedEvent: any) => void
    isReadOnly: boolean
}

type FacebookSet = {
    id: string
    image_url: string
    content: string
}

type CampaignChannel = {
    platform: string
    label: string
    publish_date: string
    promo_budget: number
    start_date: string
    end_date: string
    days_count: number
    reminder_enabled: boolean
    status: string // 'pending' | 'active' | 'completed' | 'paused'
}

export function StepDesign({ event, onUpdate, isReadOnly }: StepDesignProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const instaInputRef = useRef<HTMLInputElement>(null)
    const tiktokInputRef = useRef<HTMLInputElement>(null)
    const xInputRef = useRef<HTMLInputElement>(null)
    const snapInputRef = useRef<HTMLInputElement>(null)
    const liInputRef = useRef<HTMLInputElement>(null)
    const ytInputRef = useRef<HTMLInputElement>(null)
    const whatsappPdfRef = useRef<HTMLInputElement>(null)

    const config = event.conference_config || {}
    const workflow = config.workflow || {}
    const step2 = workflow.step2 || {}
    const platforms = step2.platforms || {}

    // Active sub tab
    const [activeSubTab, setActiveSubTab] = useState<'website' | 'facebook' | 'instagram' | 'tiktok' | 'x' | 'snapchat' | 'linkedin' | 'youtube' | 'whatsapp'>('website')

    // Local states for all platforms
    const [webImageUrl, setWebImageUrl] = useState(platforms.website?.image_url || event.image_url || '')
    const [webNotes, setWebNotes] = useState(platforms.website?.notes || '')
    const [webCompleted, setWebCompleted] = useState(platforms.website?.completed || false)

    const [fbSets, setFbSets] = useState<FacebookSet[]>(
        platforms.facebook?.sets || [{ id: '1', image_url: '', content: '' }]
    )
    const [fbCompleted, setFbCompleted] = useState(platforms.facebook?.completed || false)

    const [igUrl, setIgUrl] = useState(platforms.instagram?.image_url_or_link || '')
    const [igContent, setIgContent] = useState(platforms.instagram?.content || '')
    const [igNotes, setIgNotes] = useState(platforms.instagram?.notes || '')
    const [igCompleted, setIgCompleted] = useState(platforms.instagram?.completed || false)

    const [ttUrl, setTtUrl] = useState(platforms.tiktok?.link || '')
    const [ttContent, setTtContent] = useState(platforms.tiktok?.content || '')
    const [ttNotes, setTtNotes] = useState(platforms.tiktok?.notes || '')
    const [ttCompleted, setTtCompleted] = useState(platforms.tiktok?.completed || false)

    const [xUrl, setXUrl] = useState(platforms.x?.link || '')
    const [xContent, setXContent] = useState(platforms.x?.content || '')
    const [xNotes, setXNotes] = useState(platforms.x?.notes || '')
    const [xCompleted, setXCompleted] = useState(platforms.x?.completed || false)

    const [snapUrl, setSnapUrl] = useState(platforms.snapchat?.link || '')
    const [snapContent, setSnapContent] = useState(platforms.snapchat?.content || '')
    const [snapNotes, setSnapNotes] = useState(platforms.snapchat?.notes || '')
    const [snapCompleted, setSnapCompleted] = useState(platforms.snapchat?.completed || false)

    const [liUrl, setLiUrl] = useState(platforms.linkedin?.link || '')
    const [liContent, setLiContent] = useState(platforms.linkedin?.content || '')
    const [liNotes, setLiNotes] = useState(platforms.linkedin?.notes || '')
    const [liCompleted, setLiCompleted] = useState(platforms.linkedin?.completed || false)

    const [ytUrl, setYtUrl] = useState(platforms.youtube?.link || '')
    const [ytTitle, setYtTitle] = useState(platforms.youtube?.title || '')
    const [ytContent, setYtContent] = useState(platforms.youtube?.content || '')
    const [ytNotes, setYtNotes] = useState(platforms.youtube?.notes || '')
    const [ytCompleted, setYtCompleted] = useState(platforms.youtube?.completed || false)

    const [waPdfUrl, setWaPdfUrl] = useState(platforms.whatsapp?.pdf_url || '')
    const [waReplies, setWaReplies] = useState(platforms.whatsapp?.replies || '')
    const [waCompleted, setWaCompleted] = useState(platforms.whatsapp?.completed || false)

    const [designer, setDesigner] = useState(step2.designer || '')
    const [status, setStatus] = useState(step2.status || 'in_progress')

    const [isSaving, setIsSaving] = useState(false)
    const [uploadingPlatform, setUploadingPlatform] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Help specs modal state
    const [helpSpec, setHelpSpec] = useState<string | null>(null)

    // File Upload Handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, platformKey: string, setIndex?: number) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingPlatform(platformKey)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', platformKey)
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
            const publicUrl = data.url

            if (platformKey === 'website') {
                setWebImageUrl(publicUrl)
            } else if (platformKey === 'instagram') {
                setIgUrl(publicUrl)
            } else if (platformKey === 'tiktok') {
                setTtUrl(publicUrl)
            } else if (platformKey === 'x') {
                setXUrl(publicUrl)
            } else if (platformKey === 'snapchat') {
                setSnapUrl(publicUrl)
            } else if (platformKey === 'linkedin') {
                setLiUrl(publicUrl)
            } else if (platformKey === 'youtube') {
                setYtUrl(publicUrl)
            } else if (platformKey === 'whatsapp') {
                setWaPdfUrl(publicUrl)
            } else if (platformKey === 'facebook' && typeof setIndex === 'number') {
                setFbSets(prev => prev.map((set, idx) => idx === setIndex ? { ...set, image_url: publicUrl } : set))
            }
        } catch (err: any) {
            console.error('Upload error:', err)
            setMessage({ type: 'error', text: 'فشل رفع الملف: ' + err.message })
        } finally {
            setUploadingPlatform(null)
        }
    }

    // Facebook sets helper
    const handleAddFbSet = () => {
        setFbSets(prev => [...prev, { id: String(Date.now()), image_url: '', content: '' }])
    }

    const handleRemoveFbSet = (index: number) => {
        setFbSets(prev => prev.filter((_, idx) => idx !== index))
    }

    const handleFbSetChange = (index: number, field: 'image_url' | 'content', value: string) => {
        setFbSets(prev => prev.map((set, idx) => idx === index ? { ...set, [field]: value } : set))
    }

    // Helper to render media preview directly
    const renderMediaPreview = (url: string) => {
        if (!url) return null
        const isVideo = url.toLowerCase().match(/\.(mp4|mov|webm)$/i)
        
        return (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 w-full max-w-[280px] h-40 mt-2">
                {isVideo ? (
                    <video src={url} controls className="w-full h-full object-contain bg-black" />
                ) : (
                    <Image src={url} alt="معاينة التصميم" fill className="object-cover" />
                )}
            </div>
        )
    }

    // Save platforms status and config
    const handleSaveDesignData = async (shouldCompleteTab?: 'website' | 'facebook' | 'instagram' | 'tiktok' | 'x' | 'snapchat' | 'linkedin' | 'youtube' | 'whatsapp' | 'work_plan') => {
        setIsSaving(true)
        setMessage(null)

        let targetWebCompleted = webCompleted
        let targetFbCompleted = fbCompleted
        let targetIgCompleted = igCompleted
        let targetTtCompleted = ttCompleted
        let targetXCompleted = xCompleted
        let targetSnapCompleted = snapCompleted
        let targetLiCompleted = liCompleted
        let targetYtCompleted = ytCompleted
        let targetWaCompleted = waCompleted

        if (shouldCompleteTab === 'website') {
            targetWebCompleted = true
            setWebCompleted(true)
        } else if (shouldCompleteTab === 'facebook') {
            targetFbCompleted = true
            setFbCompleted(true)
        } else if (shouldCompleteTab === 'instagram') {
            targetIgCompleted = true
            setIgCompleted(true)
        } else if (shouldCompleteTab === 'tiktok') {
            targetTtCompleted = true
            setTtCompleted(true)
        } else if (shouldCompleteTab === 'x') {
            targetXCompleted = true
            setXCompleted(true)
        } else if (shouldCompleteTab === 'snapchat') {
            targetSnapCompleted = true
            setSnapCompleted(true)
        } else if (shouldCompleteTab === 'linkedin') {
            targetLiCompleted = true
            setLiCompleted(true)
        } else if (shouldCompleteTab === 'youtube') {
            targetYtCompleted = true
            setYtCompleted(true)
        } else if (shouldCompleteTab === 'whatsapp') {
            targetWaCompleted = true
            setWaCompleted(true)
        }

        try {
            const updatedConfig = {
                ...config,
                workflow: {
                    ...workflow,
                    step2: {
                        status: status,
                        designer: designer,
                        platforms: {
                            website: { image_url: webImageUrl, notes: webNotes, completed: targetWebCompleted },
                            facebook: { sets: fbSets, completed: targetFbCompleted },
                            instagram: { image_url_or_link: igUrl, content: igContent, notes: igNotes, completed: targetIgCompleted },
                            tiktok: { link: ttUrl, content: ttContent, notes: ttNotes, completed: targetTtCompleted },
                            x: { link: xUrl, content: xContent, notes: xNotes, completed: targetXCompleted },
                            snapchat: { link: snapUrl, content: snapContent, notes: snapNotes, completed: targetSnapCompleted },
                            linkedin: { link: liUrl, content: liContent, notes: liNotes, completed: targetLiCompleted },
                            youtube: { link: ytUrl, title: ytTitle, content: ytContent, notes: ytNotes, completed: targetYtCompleted },
                            whatsapp: { pdf_url: waPdfUrl, replies: waReplies, completed: targetWaCompleted }
                        }
                    }
                }
            }

            const supabase = createClient()
            const { data, error } = await supabase
                .from('events')
                .update({
                    conference_config: updatedConfig as any,
                    image_url: webImageUrl || null
                })
                .eq('id', event.id)
                .select()
                .single()

            if (error) throw error

            setMessage({ type: 'success', text: 'تم تحديث وحفظ تفاصيل التصاميم بنجاح!' })
            onUpdate(data)
        } catch (err: any) {
            console.error('Error saving step 2 design:', err)
            setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء حفظ خطة الترويج' })
        } finally {
            setIsSaving(false)
        }
    }

    // Inner progress calculations
    const innerSteps = [
        { key: 'website', label: 'الموقع', completed: webCompleted },
        { key: 'facebook', label: 'فيسبوك', completed: fbCompleted },
        { key: 'instagram', label: 'انستغرام', completed: igCompleted },
        { key: 'tiktok', label: 'تيك توك', completed: ttCompleted },
        { key: 'x', label: 'إكس / تويتر', completed: xCompleted },
        { key: 'snapchat', label: 'سناب شات', completed: snapCompleted },
        { key: 'linkedin', label: 'لينكد إن', completed: liCompleted },
        { key: 'youtube', label: 'يوتيوب', completed: ytCompleted },
        { key: 'whatsapp', label: 'واتساب', completed: waCompleted }
    ]
    const completedInnerCount = innerSteps.filter(s => s.completed).length
    const innerProgressPercentage = Math.round((completedInnerCount / 9) * 100)

    // Platform Design Specs Tooltips
    const platformSpecs: Record<string, string> = {
        website: 'مقاسات الموقع الإلكتروني:\n• المقاس المفضل: 1200px × 630px (Landscape)\n• التنسيق: PNG أو JPG أو GIF متحركة\n• نصيحة: يفضل ترك مسافات أمان من الأطراف لضمان التوافق مع الشاشات المختلفة.',
        facebook: 'مقاسات الفيسبوك:\n• بوست مربع: 1200px × 1200px\n• بوست عرضي: 1200px × 630px\n• التنسيق: صورة عالية الجودة PNG أو فيديو MP4\n• نصيحة: يمكنك إضافة مجموعات تصاميم إعلانية متعددة لتناسب الحملات المتغيرة.',
        instagram: 'مقاسات الانستغرام:\n• بوست عمودي: 1080px × 1350px (نسبة 4:5 - يغطي المساحة بالكامل)\n• بوست مربع: 1080px × 1080px\n• ستوري: 1080px × 1920px\n• التنسيق: صورة عالية الدقة PNG.',
        tiktok: 'مقاسات التيك توك:\n• فيديو عمودي كامل: 1080px × 1920px (نسبة 9:16)\n• التنسيق: MP4 أو MOV بمعدل إطارات مرتفع\n• نصيحة: ركز على الصوتيات الرائجة (Trending Music) في المونتاج.',
        x: 'مقاسات منصة إكس (تويتر):\n• بوست عرضي: 1600px × 900px (نسبة 16:9)\n• بوست مربع: 1080px × 1080px\n• التنسيق: PNG أو JPG أو GIF متحركة\n• نصيحة: التغريدة يجب أن تكون موجزة وواضحة جداً وتستخدم الهاشتاغات الرائجة.',
        snapchat: 'مقاسات سناب شات:\n• تصميم عمودي كامل: 1080px × 1920px (نسبة 9:16)\n• التنسيق: صورة عالية الدقة PNG أو فيديو MP4 قصير (أقل من 15 ثانية)\n• نصيحة: يفضل ترك 150px من الأعلى والأسفل فارغة لعدم تغطية شعار الحساب أو زر السحب لأعلى.',
        linkedin: 'مقاسات لينكد إن:\n• بوست عرضي: 1200px × 627px\n• بوست مربع: 1080px × 1080px\n• التنسيق: PNG أو PDF لسهولة التمرير الدائري (Carousel)\n• نصيحة: أسلوب التصميم والمحتوى يجب أن يكون مهنياً واحترافياً للغاية.',
        youtube: 'مقاسات اليوتيوب:\n• صورة مصغرة (Thumbnail): 1280px × 720px (نسبة 16:9)\n• فيديو كامل: 1920px × 1080px أو Shorts: 1080px × 1920px\n• نصيحة: العنوان والصورة المصغرة يجب أن يكونا جذابين للغاية لزيادة نسبة النقر (CTR).',
        whatsapp: 'مواصفات واتساب:\n• ملف العرض (Brochure): ملف PDF احترافي يوضح تفاصيل وجدول الفعالية بالكامل (بحد أقصى 10 ميجابايت).\n• نصوص الردود: قوالب منسقة بنقاط واضحة يسهل نسخها وإرسالها للمشتركين لتوضيح الحجوزات والخطوات.'
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'website': return <Globe className="w-4 h-4 text-indigo-600" />
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />
            case 'tiktok': return <Video className="w-4 h-4 text-slate-900" />
            case 'x': return <Twitter className="w-4 h-4 text-slate-700" />
            case 'snapchat': return <Ghost className="w-4 h-4 text-amber-500" />
            case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-800" />
            case 'youtube': return <Youtube className="w-4 h-4 text-red-650" />
            case 'whatsapp': return <MessageSquare className="w-4 h-4 text-emerald-600" />
            default: return <Calendar className="w-4 h-4 text-slate-600" />
        }
    }

    return (
        <div className="space-y-6 text-start" dir="rtl">
            <Card className="border-slate-100 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-850 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-indigo-650" />
                                الخطوة 2: فريق التصميم والمحتوى الإعلاني
                            </CardTitle>
                            <CardDescription className="mt-1 text-slate-500 text-xs">
                                إعداد وتجهيز ملفات وتصاميم النشر لـ 9 منصات تواصل اجتماعي مختلفة بتسلسل متكامل.
                            </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start md:self-auto ${
                            completedInnerCount === 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {completedInnerCount === 10 ? 'مكتملة بالكامل ✓' : `تم إنجاز ${completedInnerCount} من 10`}
                        </span>
                    </div>

                    {/* Design Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">شريط إنجاز المنصات والتصاميم</span>
                            <span className="font-black text-indigo-600">{innerProgressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-650 rounded-full transition-all duration-500"
                                style={{ width: `${innerProgressPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    
                    {/* General Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 mb-6">
                        <div className="space-y-1">
                            <Label htmlFor="designerName" className="text-xs text-slate-750 font-bold">المصمم / المشرف الفني</Label>
                            <Input
                                id="designerName"
                                value={designer}
                                onChange={(e) => setDesigner(e.target.value)}
                                disabled={isReadOnly}
                                placeholder="اسم المصمم أو الوكالة الإعلانية"
                                className="bg-white text-xs h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="designStatus" className="text-xs text-slate-755 font-bold">حالة المرحلة الكلية</Label>
                            <Select
                                value={status}
                                onValueChange={(val) => setStatus(val)}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger className="bg-white text-xs h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in_progress">قيد العمل والتصميم</SelectItem>
                                    <SelectItem value="completed">مكتملة بالكامل ومصدقة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Sub tabs Navigation */}
                    <div className="flex flex-wrap gap-1 bg-slate-100/70 p-1 rounded-xl mb-6 text-[10px] md:text-xs">
                        {innerSteps.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setActiveSubTab(tab.key as any)
                                    setMessage(null)
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                                    activeSubTab === tab.key
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-655 hover:text-slate-900 hover:bg-white/50'
                                }`}
                            >
                                {tab.key === 'website' && <Globe className="w-3.5 h-3.5" />}
                                {tab.key === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                                {tab.key === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                                {tab.key === 'tiktok' && <Video className="w-3.5 h-3.5" />}
                                {tab.key === 'x' && <Twitter className="w-3.5 h-3.5" />}
                                {tab.key === 'snapchat' && <Ghost className="w-3.5 h-3.5" />}
                                {tab.key === 'linkedin' && <Linkedin className="w-3.5 h-3.5" />}
                                {tab.key === 'youtube' && <Youtube className="w-3.5 h-3.5" />}
                                {tab.key === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5" />}
                                <span>{tab.label}</span>
                                {tab.completed && <span className="text-emerald-600">✓</span>}
                            </button>
                        ))}
                    </div>

                    {/* Message Box */}
                    {message && (
                        <div className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Tabs Content */}
                    <div className="space-y-6">

                        {/* 1. Website Tab */}
                        {activeSubTab === 'website' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">تصاميم الموقع الإلكتروني (يرفع فقط الصورة أو GIF)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'website' ? null : 'website')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'website' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.website}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,image/gif"
                                            onChange={(e) => handleFileUpload(e, 'website')}
                                            disabled={isReadOnly || uploadingPlatform === 'website'}
                                            className="hidden"
                                        />
                                        {webImageUrl ? (
                                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <div className="relative h-48 w-full">
                                                    <Image src={webImageUrl} alt="غلاف الفعالية" fill className="object-cover" />
                                                </div>
                                                {!isReadOnly && (
                                                    <div className="absolute top-2 left-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="p-1.5 bg-white/95 rounded-lg hover:bg-white shadow"
                                                        >
                                                            <Upload className="w-3.5 h-3.5 text-slate-700" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setWebImageUrl('')}
                                                            className="p-1.5 bg-white/95 rounded-lg hover:bg-white shadow"
                                                        >
                                                            <X className="w-3.5 h-3.5 text-red-650" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isReadOnly || uploadingPlatform === 'website'}
                                                className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer"
                                            >
                                                {uploadingPlatform === 'website' ? (
                                                    <Loader2 className="animate-spin w-6 h-6 text-indigo-650" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-slate-400" />
                                                        <p className="text-xs font-bold text-slate-655">اضغط لرفع الغلاف والصورة للموقع</p>
                                                        <p className="text-[9px] text-slate-400">PNG, JPG, GIF حتى 5MB</p>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="webNotes" className="text-xs text-slate-600">ملاحظات أو تفاصيل فنية للموقع</Label>
                                            <Textarea
                                                id="webNotes"
                                                value={webNotes}
                                                onChange={(e) => setWebNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="أي تعديلات في التصميم أو الهوية الخاصة بالموقع..."
                                                className="text-xs"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('website')}
                                                disabled={isSaving || !webImageUrl}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {webCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {webCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setWebCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Facebook Tab */}
                        {activeSubTab === 'facebook' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Facebook className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة فيسبوك (مجموعات إعلانية متعددة)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'facebook' ? null : 'facebook')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'facebook' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.facebook}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {fbSets.map((set, index) => (
                                        <div key={set.id || index} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/20 relative space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-800">المجموعة الإعلانية #{index + 1}</span>
                                                {fbSets.length > 1 && !isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFbSet(index)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[11px] text-slate-650 font-semibold">رابط تصميم المجموعة أو رفعه</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={set.image_url}
                                                            onChange={(e) => handleFbSetChange(index, 'image_url', e.target.value)}
                                                            placeholder="رابط درايف للتصميم أو رابط الصورة المرفوعة"
                                                            className="text-xs h-8 text-left"
                                                            dir="ltr"
                                                            disabled={isReadOnly}
                                                        />
                                                        {!isReadOnly && (
                                                            <div className="relative">
                                                                <input
                                                                    id={`fb-upload-${index}`}
                                                                    type="file"
                                                                    accept="image/*,video/*"
                                                                    onChange={(e) => handleFileUpload(e, 'facebook', index)}
                                                                    className="hidden"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => document.getElementById(`fb-upload-${index}`)?.click()}
                                                                    disabled={uploadingPlatform === 'facebook'}
                                                                    className="h-8 px-2 border-slate-255"
                                                                >
                                                                    {uploadingPlatform === 'facebook' ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                                                    ) : (
                                                                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Directly show uploaded image/video preview */}
                                                    {renderMediaPreview(set.image_url)}
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[11px] text-slate-655 font-semibold">المحتوى الإعلاني للمجموعة</Label>
                                                    <Textarea
                                                        value={set.content}
                                                        onChange={(e) => handleFbSetChange(index, 'content', e.target.value)}
                                                        placeholder="أكتب النص الإعلاني لهذه المجموعة هنا..."
                                                        className="text-xs"
                                                        rows={4}
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddFbSet}
                                            className="w-full border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-750 font-bold text-xs py-2 flex items-center justify-center gap-1 bg-indigo-50/10"
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة مجموعة إعلانية أخرى (Facebook Set)
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                        <Button
                                            type="button"
                                            onClick={() => handleSaveDesignData('facebook')}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
                                        >
                                            {fbCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                        </Button>
                                        {fbCompleted && (
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => { setFbCompleted(false); handleSaveDesignData(); }}
                                                className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Instagram Tab */}
                        {activeSubTab === 'instagram' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Instagram className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة انستغرام (محتوى وصورة عمودية)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'instagram' ? null : 'instagram')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'instagram' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.instagram}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="igUrl" className="text-xs text-slate-600 font-semibold">رابط تصميم انستغرام أو رفعه</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="igUrl"
                                                    value={igUrl}
                                                    onChange={(e) => setIgUrl(e.target.value)}
                                                    placeholder="رابط درايف للتصميم أو رابط الصورة المرفوعة"
                                                    className="text-xs h-9 text-left"
                                                    dir="ltr"
                                                    disabled={isReadOnly}
                                                />
                                                {!isReadOnly && (
                                                    <div className="relative">
                                                        <input
                                                            ref={instaInputRef}
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            onChange={(e) => handleFileUpload(e, 'instagram')}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => instaInputRef.current?.click()}
                                                            disabled={uploadingPlatform === 'instagram'}
                                                            className="h-9 px-3 border-slate-250"
                                                            variant="outline"
                                                        >
                                                            {uploadingPlatform === 'instagram' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <Upload className="w-4 h-4 text-slate-600" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Directly show uploaded image/video preview */}
                                            {renderMediaPreview(igUrl)}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="igContent" className="text-xs text-slate-600 font-semibold">نص البوست / محتوى انستغرام</Label>
                                            <Textarea
                                                id="igContent"
                                                value={igContent}
                                                onChange={(e) => setIgContent(e.target.value)}
                                                placeholder="أكتب النص الإعلاني والهاشتاغات لمنصة انستغرام..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="igNotes" className="text-xs text-slate-600">ملاحظات انستغرام</Label>
                                            <Textarea
                                                id="igNotes"
                                                value={igNotes}
                                                onChange={(e) => setIgNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="هاشتاغات مفضلة، حسابات الرعاة، شروط الصورة..."
                                                className="text-xs resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('instagram')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {igCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {igCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setIgCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. TikTok Tab */}
                        {activeSubTab === 'tiktok' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Video className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة تيك توك (فيديو عمودي ومحتوى)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'tiktok' ? null : 'tiktok')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'tiktok' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.tiktok}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="ttUrl" className="text-xs text-slate-600 font-semibold">رابط فيديو التيك توك أو رفعه</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="ttUrl"
                                                    value={ttUrl}
                                                    onChange={(e) => setTtUrl(e.target.value)}
                                                    placeholder="رابط درايف للفيديو أو رابط التيك توك النهائي"
                                                    className="text-xs h-9 text-left"
                                                    dir="ltr"
                                                    disabled={isReadOnly}
                                                />
                                                {!isReadOnly && (
                                                    <div className="relative">
                                                        <input
                                                            ref={tiktokInputRef}
                                                            type="file"
                                                            accept="video/*"
                                                            onChange={(e) => handleFileUpload(e, 'tiktok')}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => tiktokInputRef.current?.click()}
                                                            disabled={uploadingPlatform === 'tiktok'}
                                                            className="h-9 px-3 border-slate-250"
                                                            variant="outline"
                                                        >
                                                            {uploadingPlatform === 'tiktok' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <Upload className="w-4 h-4 text-slate-600" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Directly show uploaded image/video preview */}
                                            {renderMediaPreview(ttUrl)}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="ttContent" className="text-xs text-slate-600 font-semibold">وصف الفيديو والهاشتاغات (Caption)</Label>
                                            <Textarea
                                                id="ttContent"
                                                value={ttContent}
                                                onChange={(e) => setTtContent(e.target.value)}
                                                placeholder="أكتب نصوص الهيدرز والهاشتاغات العمودية المخصصة للتيك توك..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="ttNotes" className="text-xs text-slate-600">ملاحظات المونتاج والصوت</Label>
                                            <Textarea
                                                id="ttNotes"
                                                value={ttNotes}
                                                onChange={(e) => setTtNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="ملاحظات المونتاج والمقاطع الصوتية الرائجة..."
                                                className="text-xs resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('tiktok')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {ttCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {ttCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setTtCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Twitter / X Tab */}
                        {activeSubTab === 'x' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Twitter className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة إكس / تويتر (محتوى وتغريدة)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'x' ? null : 'x')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'x' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.x}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="xUrl" className="text-xs text-slate-600 font-semibold">رابط تصميم منصة إكس أو رفعه</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="xUrl"
                                                    value={xUrl}
                                                    onChange={(e) => setXUrl(e.target.value)}
                                                    placeholder="رابط درايف للتصميم أو رابط الصورة المرفوعة"
                                                    className="text-xs h-9 text-left"
                                                    dir="ltr"
                                                    disabled={isReadOnly}
                                                />
                                                {!isReadOnly && (
                                                    <div className="relative">
                                                        <input
                                                            ref={xInputRef}
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            onChange={(e) => handleFileUpload(e, 'x')}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => xInputRef.current?.click()}
                                                            disabled={uploadingPlatform === 'x'}
                                                            className="h-9 px-3 border-slate-250"
                                                            variant="outline"
                                                        >
                                                            {uploadingPlatform === 'x' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <Upload className="w-4 h-4 text-slate-600" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Directly show uploaded image/video preview */}
                                            {renderMediaPreview(xUrl)}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="xContent" className="text-xs text-slate-600 font-semibold">نص التغريدة (Tweet Content)</Label>
                                            <Textarea
                                                id="xContent"
                                                value={xContent}
                                                onChange={(e) => setXContent(e.target.value)}
                                                placeholder="أكتب التغريدة هنا (تحذير: لا تتعدى 280 حرفاً للحسابات العادية)..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="xNotes" className="text-xs text-slate-600">ملاحظات تويتر / إكس</Label>
                                            <Textarea
                                                id="xNotes"
                                                value={xNotes}
                                                onChange={(e) => setXNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="ملاحظات النشر والتاغات والحسابات الشريكة..."
                                                className="text-xs resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('x')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {xCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {xCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setXCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 6. Snapchat Tab */}
                        {activeSubTab === 'snapchat' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Ghost className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة سناب شات (تصميم طولي كامل)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'snapchat' ? null : 'snapchat')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'snapchat' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.snapchat}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="snapUrl" className="text-xs text-slate-600 font-semibold">رابط تصميم السناب شات أو رفعه</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="snapUrl"
                                                    value={snapUrl}
                                                    onChange={(e) => setSnapUrl(e.target.value)}
                                                    placeholder="رابط درايف للتصميم أو رابط الصورة المرفوعة"
                                                    className="text-xs h-9 text-left"
                                                    dir="ltr"
                                                    disabled={isReadOnly}
                                                />
                                                {!isReadOnly && (
                                                    <div className="relative">
                                                        <input
                                                            ref={snapInputRef}
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            onChange={(e) => handleFileUpload(e, 'snapchat')}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => snapInputRef.current?.click()}
                                                            disabled={uploadingPlatform === 'snapchat'}
                                                            className="h-9 px-3 border-slate-250"
                                                            variant="outline"
                                                        >
                                                            {uploadingPlatform === 'snapchat' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <Upload className="w-4 h-4 text-slate-600" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Directly show uploaded image/video preview */}
                                            {renderMediaPreview(snapUrl)}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="snapContent" className="text-xs text-slate-600 font-semibold">نص الفلتر أو عبارة السحب لأعلى (Swipe-Up text)</Label>
                                            <Textarea
                                                id="snapContent"
                                                value={snapContent}
                                                onChange={(e) => setSnapContent(e.target.value)}
                                                placeholder="أكتب عبارة السحب لأعلى، أو عنوان الفلتر الإعلاني..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="snapNotes" className="text-xs text-slate-600">ملاحظات سناب شات</Label>
                                            <Textarea
                                                id="snapNotes"
                                                value={snapNotes}
                                                onChange={(e) => setSnapNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="هاشتاغ سناب، الجيوفلتر الجغرافي المستهدف..."
                                                className="text-xs resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('snapchat')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {snapCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {snapCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setSnapCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7. LinkedIn Tab */}
                        {activeSubTab === 'linkedin' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Linkedin className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة لينكد إن (نشر احترافي ومستندات)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'linkedin' ? null : 'linkedin')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'linkedin' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.linkedin}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="liUrl" className="text-xs text-slate-600 font-semibold">رابط تصميم لينكد إن أو رفعه</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="liUrl"
                                                    value={liUrl}
                                                    onChange={(e) => setLiUrl(e.target.value)}
                                                    placeholder="رابط درايف للتصميم أو رابط الصورة المرفوعة"
                                                    className="text-xs h-9 text-left"
                                                    dir="ltr"
                                                    disabled={isReadOnly}
                                                />
                                                {!isReadOnly && (
                                                    <div className="relative">
                                                        <input
                                                            ref={liInputRef}
                                                            type="file"
                                                            accept="image/*,video/*,application/pdf"
                                                            onChange={(e) => handleFileUpload(e, 'linkedin')}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => liInputRef.current?.click()}
                                                            disabled={uploadingPlatform === 'linkedin'}
                                                            className="h-9 px-3 border-slate-250"
                                                            variant="outline"
                                                        >
                                                            {uploadingPlatform === 'linkedin' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <Upload className="w-4 h-4 text-slate-600" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Directly show uploaded image/video preview */}
                                            {renderMediaPreview(liUrl)}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="liContent" className="text-xs text-slate-600 font-semibold">المحتوى النصي المهني للبوست</Label>
                                            <Textarea
                                                id="liContent"
                                                value={liContent}
                                                onChange={(e) => setLiContent(e.target.value)}
                                                placeholder="أكتب المقال أو النص المهني التفصيلي هنا..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="liNotes" className="text-xs text-slate-600">ملاحظات لينكد إن</Label>
                                            <Textarea
                                                id="liNotes"
                                                value={liNotes}
                                                onChange={(e) => setLiNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="شخصيات مستهدفة، تاغات، شركات راعية للفعالية..."
                                                className="text-xs resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('linkedin')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {liCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {liCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setLiCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 8. YouTube Tab */}
                        {activeSubTab === 'youtube' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Youtube className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة يوتيوب (صورة مصغرة وفيديو)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'youtube' ? null : 'youtube')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'youtube' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.youtube}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label htmlFor="ytTitle" className="text-xs text-slate-600 font-semibold">عنوان مقطع الفيديو الإعلاني</Label>
                                                <Input
                                                    id="ytTitle"
                                                    value={ytTitle}
                                                    onChange={(e) => setYtTitle(e.target.value)}
                                                    placeholder="العنوان الجذاب لليوتيوب"
                                                    className="text-xs h-9"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="ytUrl" className="text-xs text-slate-600 font-semibold">رابط الفيديو أو الصورة المصغرة</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="ytUrl"
                                                        value={ytUrl}
                                                        onChange={(e) => setYtUrl(e.target.value)}
                                                        placeholder="رابط درايف للتصميم أو رابط الصورة المصغرة"
                                                        className="text-xs h-9 text-left"
                                                        dir="ltr"
                                                        disabled={isReadOnly}
                                                    />
                                                    {!isReadOnly && (
                                                        <div className="relative">
                                                            <input
                                                                ref={ytInputRef}
                                                                type="file"
                                                                accept="image/*,video/*"
                                                                onChange={(e) => handleFileUpload(e, 'youtube')}
                                                                className="hidden"
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={() => ytInputRef.current?.click()}
                                                                disabled={uploadingPlatform === 'youtube'}
                                                                className="h-9 px-3 border-slate-250"
                                                                variant="outline"
                                                            >
                                                                {uploadingPlatform === 'youtube' ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                                ) : (
                                                                    <Upload className="w-4 h-4 text-slate-600" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Directly show uploaded image/video preview */}
                                        {renderMediaPreview(ytUrl)}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="ytContent" className="text-xs text-slate-600 font-semibold">وصف الفيديو التفصيلي (Description)</Label>
                                            <Textarea
                                                id="ytContent"
                                                value={ytContent}
                                                onChange={(e) => setYtContent(e.target.value)}
                                                placeholder="أكتب وصف الفيديو بالتفصيل مع وضع روابط التسجيل وحجوزات الفعالية..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="ytNotes" className="text-xs text-slate-600">الكلمات المفتاحية والملاحظات</Label>
                                            <Textarea
                                                id="ytNotes"
                                                value={ytNotes}
                                                onChange={(e) => setYtNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={2}
                                                placeholder="الكلمات الدلالية (Tags)..."
                                                className="text-xs resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('youtube')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {ytCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {ytCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setYtCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 9. WhatsApp Tab */}
                        {activeSubTab === 'whatsapp' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4 text-indigo-650" />
                                        <h3 className="font-bold text-slate-800 text-sm">منصة واتساب (بروشور PDF وقوالب الردود السريعة)</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHelpSpec(helpSpec === 'whatsapp' ? null : 'whatsapp')}
                                        className="text-slate-400 hover:text-indigo-650 transition-colors"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {helpSpec === 'whatsapp' && (
                                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-900 whitespace-pre-line leading-relaxed">
                                        {platformSpecs.whatsapp}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        
                                        {/* WhatsApp PDF Brochure */}
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600 font-semibold block mb-1">ملف عرض الفعالية أو البروشور (PDF)</Label>
                                            
                                            {waPdfUrl ? (
                                                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs">
                                                    <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                                                        <FileText className="w-5 h-5" />
                                                        <span>تم رفع ملف البروشور بنجاح ✓</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a href={waPdfUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                                                            تحميل وعرض الـ PDF
                                                        </a>
                                                        {!isReadOnly && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setWaPdfUrl('')}
                                                                className="text-red-500 hover:text-red-750"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        ref={whatsappPdfRef}
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={(e) => handleFileUpload(e, 'whatsapp')}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => whatsappPdfRef.current?.click()}
                                                        disabled={isReadOnly || uploadingPlatform === 'whatsapp'}
                                                        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 text-slate-655 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer"
                                                        variant="ghost"
                                                    >
                                                        {uploadingPlatform === 'whatsapp' ? (
                                                            <Loader2 className="w-5 h-5 animate-spin text-indigo-650" />
                                                        ) : (
                                                            <>
                                                                <File className="w-6 h-6 text-slate-400" />
                                                                <span>اضغط هنا لرفع بروشور الفعالية (PDF)</span>
                                                                <span className="text-[9px] text-slate-400 font-normal">PDF حتى 10 ميجابايت</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reply Templates */}
                                        <div className="space-y-1">
                                            <Label htmlFor="waReplies" className="text-xs text-slate-600 font-semibold">قوالب ونصوص الردود السريعة لخدمة العملاء</Label>
                                            <Textarea
                                                id="waReplies"
                                                value={waReplies}
                                                onChange={(e) => setWaReplies(e.target.value)}
                                                placeholder="أكتب قوالب الردود على الاستفسارات الشائعة هنا ليقوم الموظف بنسخها (الأسعار، المواعيد، الفندق، إلخ)..."
                                                className="text-xs"
                                                rows={5}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 justify-end flex flex-col">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                                            <b>ملاحظة:</b> ملف البروشور وقوالب الردود تسهل عمل ممثلي الردود (الخطوة 3) وتوفر لهم كافة تفاصيل الفعالية للرد الفوري على رسائل الواتساب.
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('whatsapp')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {waCompleted ? 'تحديث وتأكيد (تم ✓)' : 'اعتماد وحفظ كـ مكتمل ✓'}
                                            </Button>
                                            {waCompleted && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => { setWaCompleted(false); handleSaveDesignData(); }}
                                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
