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
                throw new Error(errData.error || 'Upload failed')
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
            setMessage({ type: 'error', text: 'Failed to upload file: ' + err.message })
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
                    <Image src={url} alt="Design preview" fill className="object-cover" />
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

            setMessage({ type: 'success', text: 'Design details updated and saved successfully!' })
            onUpdate(data)
        } catch (err: any) {
            console.error('Error saving step 2 design:', err)
            setMessage({ type: 'error', text: err.message || 'An error occurred while saving the promotion plan' })
        } finally {
            setIsSaving(false)
        }
    }

    // Inner progress calculations
    const innerSteps = [
        { key: 'website', label: 'Website', completed: webCompleted },
        { key: 'facebook', label: 'Facebook', completed: fbCompleted },
        { key: 'instagram', label: 'Instagram', completed: igCompleted },
        { key: 'tiktok', label: 'TikTok', completed: ttCompleted },
        { key: 'x', label: 'X / Twitter', completed: xCompleted },
        { key: 'snapchat', label: 'Snapchat', completed: snapCompleted },
        { key: 'linkedin', label: 'LinkedIn', completed: liCompleted },
        { key: 'youtube', label: 'YouTube', completed: ytCompleted },
        { key: 'whatsapp', label: 'WhatsApp', completed: waCompleted }
    ]
    const completedInnerCount = innerSteps.filter(s => s.completed).length
    const innerProgressPercentage = Math.round((completedInnerCount / 9) * 100)

    // Platform Design Specs Tooltips
    const platformSpecs: Record<string, string> = {
        website: 'Website image sizes:\n• Preferred size: 1200px × 630px (Landscape)\n• Format: PNG, JPG, or animated GIF\n• Tip: Leave safe margins from the edges to ensure compatibility across different screens.',
        facebook: 'Facebook sizes:\n• Square post: 1200px × 1200px\n• Landscape post: 1200px × 630px\n• Format: high-quality PNG image or MP4 video\n• Tip: You can add multiple ad design sets to suit different campaigns.',
        instagram: 'Instagram sizes:\n• Portrait post: 1080px × 1350px (4:5 ratio - fills the space fully)\n• Square post: 1080px × 1080px\n• Story: 1080px × 1920px\n• Format: high-resolution PNG image.',
        tiktok: 'TikTok sizes:\n• Full vertical video: 1080px × 1920px (9:16 ratio)\n• Format: MP4 or MOV with a high frame rate\n• Tip: Focus on trending music in the edit.',
        x: 'X (Twitter) sizes:\n• Landscape post: 1600px × 900px (16:9 ratio)\n• Square post: 1080px × 1080px\n• Format: PNG, JPG, or animated GIF\n• Tip: The tweet should be concise, very clear, and use trending hashtags.',
        snapchat: 'Snapchat sizes:\n• Full vertical design: 1080px × 1920px (9:16 ratio)\n• Format: high-resolution PNG image or short MP4 video (under 15 seconds)\n• Tip: Leave 150px empty at the top and bottom so the account logo or swipe-up button is not covered.',
        linkedin: 'LinkedIn sizes:\n• Landscape post: 1200px × 627px\n• Square post: 1080px × 1080px\n• Format: PNG or PDF for easy carousel scrolling\n• Tip: The design style and content must be highly professional.',
        youtube: 'YouTube sizes:\n• Thumbnail: 1280px × 720px (16:9 ratio)\n• Full video: 1920px × 1080px or Shorts: 1080px × 1920px\n• Tip: The title and thumbnail must be highly compelling to increase click-through rate (CTR).',
        whatsapp: 'WhatsApp specs:\n• Brochure file: a professional PDF outlining the event\'s full details and schedule (10MB max).\n• Reply texts: clearly formatted templates that are easy to copy and send to subscribers to explain bookings and steps.'
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
        <div className="space-y-6 text-start" dir="ltr">
            <Card className="border-slate-100 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-850 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-indigo-650" />
                                Step 2: Design & Advertising Content Team
                            </CardTitle>
                            <CardDescription className="mt-1 text-slate-500 text-xs">
                                Prepare and finalize publishing files and designs for 9 different social media platforms in one integrated workflow.
                            </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start md:self-auto ${
                            completedInnerCount === 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {completedInnerCount === 10 ? 'Fully Completed ✓' : `${completedInnerCount} of 10 completed`}
                        </span>
                    </div>

                    {/* Design Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Platforms &amp; Designs Progress</span>
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
                            <Label htmlFor="designerName" className="text-xs text-slate-750 font-bold">Designer / Art Director</Label>
                            <Input
                                id="designerName"
                                value={designer}
                                onChange={(e) => setDesigner(e.target.value)}
                                disabled={isReadOnly}
                                placeholder="Designer or advertising agency name"
                                className="bg-white text-xs h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="designStatus" className="text-xs text-slate-755 font-bold">Overall Stage Status</Label>
                            <Select
                                value={status}
                                onValueChange={(val) => setStatus(val)}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger className="bg-white text-xs h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in_progress">In Progress / Designing</SelectItem>
                                    <SelectItem value="completed">Fully Completed &amp; Approved</SelectItem>
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
                                        <h3 className="font-bold text-slate-800 text-sm">Website Designs (image or GIF upload only)</h3>
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
                                                    <Image src={webImageUrl} alt="Event cover image" fill className="object-cover" />
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
                                                        <p className="text-xs font-bold text-slate-655">Click to upload the cover image for the website</p>
                                                        <p className="text-[9px] text-slate-400">PNG, JPG, GIF up to 5MB</p>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="webNotes" className="text-xs text-slate-600">Notes or technical details for the website</Label>
                                            <Textarea
                                                id="webNotes"
                                                value={webNotes}
                                                onChange={(e) => setWebNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="Any changes to the design or branding of the website..."
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
                                                {webCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">Facebook Platform (multiple ad sets)</h3>
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
                                                <span className="text-xs font-bold text-slate-800">Ad Set #{index + 1}</span>
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
                                                    <Label className="text-[11px] text-slate-650 font-semibold">Ad set design link or upload</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={set.image_url}
                                                            onChange={(e) => handleFbSetChange(index, 'image_url', e.target.value)}
                                                            placeholder="Drive link for the design, or the uploaded image link"
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
                                                    <Label className="text-[11px] text-slate-655 font-semibold">Ad set content</Label>
                                                    <Textarea
                                                        value={set.content}
                                                        onChange={(e) => handleFbSetChange(index, 'content', e.target.value)}
                                                        placeholder="Write the ad copy for this set here..."
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
                                            Add another ad set (Facebook Set)
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                        <Button
                                            type="button"
                                            onClick={() => handleSaveDesignData('facebook')}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
                                        >
                                            {fbCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">Instagram Platform (content and portrait image)</h3>
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
                                            <Label htmlFor="igUrl" className="text-xs text-slate-600 font-semibold">Instagram design link or upload</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="igUrl"
                                                    value={igUrl}
                                                    onChange={(e) => setIgUrl(e.target.value)}
                                                    placeholder="Drive link for the design, or the uploaded image link"
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
                                            <Label htmlFor="igContent" className="text-xs text-slate-600 font-semibold">Post text / Instagram content</Label>
                                            <Textarea
                                                id="igContent"
                                                value={igContent}
                                                onChange={(e) => setIgContent(e.target.value)}
                                                placeholder="Write the ad copy and hashtags for Instagram..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="igNotes" className="text-xs text-slate-600">Instagram notes</Label>
                                            <Textarea
                                                id="igNotes"
                                                value={igNotes}
                                                onChange={(e) => setIgNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="Preferred hashtags, sponsor accounts, image requirements..."
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
                                                {igCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">TikTok Platform (vertical video and content)</h3>
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
                                            <Label htmlFor="ttUrl" className="text-xs text-slate-600 font-semibold">TikTok video link or upload</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="ttUrl"
                                                    value={ttUrl}
                                                    onChange={(e) => setTtUrl(e.target.value)}
                                                    placeholder="Drive link for the video, or the final TikTok link"
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
                                            <Label htmlFor="ttContent" className="text-xs text-slate-600 font-semibold">Video description and hashtags (Caption)</Label>
                                            <Textarea
                                                id="ttContent"
                                                value={ttContent}
                                                onChange={(e) => setTtContent(e.target.value)}
                                                placeholder="Write the headline text and hashtags tailored for TikTok..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="ttNotes" className="text-xs text-slate-600">Editing and audio notes</Label>
                                            <Textarea
                                                id="ttNotes"
                                                value={ttNotes}
                                                onChange={(e) => setTtNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="Editing notes and trending audio clips..."
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
                                                {ttCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">X / Twitter Platform (content and tweet)</h3>
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
                                            <Label htmlFor="xUrl" className="text-xs text-slate-600 font-semibold">X design link or upload</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="xUrl"
                                                    value={xUrl}
                                                    onChange={(e) => setXUrl(e.target.value)}
                                                    placeholder="Drive link for the design, or the uploaded image link"
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
                                            <Label htmlFor="xContent" className="text-xs text-slate-600 font-semibold">Tweet Content</Label>
                                            <Textarea
                                                id="xContent"
                                                value={xContent}
                                                onChange={(e) => setXContent(e.target.value)}
                                                placeholder="Write the tweet here (note: do not exceed 280 characters for standard accounts)..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="xNotes" className="text-xs text-slate-600">X / Twitter notes</Label>
                                            <Textarea
                                                id="xNotes"
                                                value={xNotes}
                                                onChange={(e) => setXNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="Publishing notes, tags, and partner accounts..."
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
                                                {xCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">Snapchat Platform (full vertical design)</h3>
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
                                            <Label htmlFor="snapUrl" className="text-xs text-slate-600 font-semibold">Snapchat design link or upload</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="snapUrl"
                                                    value={snapUrl}
                                                    onChange={(e) => setSnapUrl(e.target.value)}
                                                    placeholder="Drive link for the design, or the uploaded image link"
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
                                            <Label htmlFor="snapContent" className="text-xs text-slate-600 font-semibold">Filter text or Swipe-Up copy</Label>
                                            <Textarea
                                                id="snapContent"
                                                value={snapContent}
                                                onChange={(e) => setSnapContent(e.target.value)}
                                                placeholder="Write the swipe-up copy, or the ad filter title..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="snapNotes" className="text-xs text-slate-600">Snapchat notes</Label>
                                            <Textarea
                                                id="snapNotes"
                                                value={snapNotes}
                                                onChange={(e) => setSnapNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="Snap hashtag, targeted geofilter..."
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
                                                {snapCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">LinkedIn Platform (professional posts and documents)</h3>
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
                                            <Label htmlFor="liUrl" className="text-xs text-slate-600 font-semibold">LinkedIn design link or upload</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="liUrl"
                                                    value={liUrl}
                                                    onChange={(e) => setLiUrl(e.target.value)}
                                                    placeholder="Drive link for the design, or the uploaded image link"
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
                                            <Label htmlFor="liContent" className="text-xs text-slate-600 font-semibold">Professional post copy</Label>
                                            <Textarea
                                                id="liContent"
                                                value={liContent}
                                                onChange={(e) => setLiContent(e.target.value)}
                                                placeholder="Write the article or detailed professional copy here..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="liNotes" className="text-xs text-slate-600">LinkedIn notes</Label>
                                            <Textarea
                                                id="liNotes"
                                                value={liNotes}
                                                onChange={(e) => setLiNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={4}
                                                placeholder="Target personas, tags, event sponsor companies..."
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
                                                {liCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">YouTube Platform (thumbnail and video)</h3>
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
                                                <Label htmlFor="ytTitle" className="text-xs text-slate-600 font-semibold">Ad video title</Label>
                                                <Input
                                                    id="ytTitle"
                                                    value={ytTitle}
                                                    onChange={(e) => setYtTitle(e.target.value)}
                                                    placeholder="Compelling title for YouTube"
                                                    className="text-xs h-9"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="ytUrl" className="text-xs text-slate-600 font-semibold">Video link or thumbnail</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="ytUrl"
                                                        value={ytUrl}
                                                        onChange={(e) => setYtUrl(e.target.value)}
                                                        placeholder="Drive link for the design, or the thumbnail image link"
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
                                            <Label htmlFor="ytContent" className="text-xs text-slate-600 font-semibold">Detailed video description</Label>
                                            <Textarea
                                                id="ytContent"
                                                value={ytContent}
                                                onChange={(e) => setYtContent(e.target.value)}
                                                placeholder="Write the detailed video description, including registration links and event booking info..."
                                                className="text-xs"
                                                rows={4}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="ytNotes" className="text-xs text-slate-600">Keywords and notes</Label>
                                            <Textarea
                                                id="ytNotes"
                                                value={ytNotes}
                                                onChange={(e) => setYtNotes(e.target.value)}
                                                disabled={isReadOnly}
                                                rows={2}
                                                placeholder="Tags..."
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
                                                {ytCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
                                        <h3 className="font-bold text-slate-800 text-sm">WhatsApp Platform (PDF brochure and quick reply templates)</h3>
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
                                            <Label className="text-xs text-slate-600 font-semibold block mb-1">Event brochure or presentation file (PDF)</Label>
                                            
                                            {waPdfUrl ? (
                                                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs">
                                                    <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                                                        <FileText className="w-5 h-5" />
                                                        <span>Brochure file uploaded successfully ✓</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a href={waPdfUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                                                            Download &amp; view PDF
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
                                                                <span>Click here to upload the event brochure (PDF)</span>
                                                                <span className="text-[9px] text-slate-400 font-normal">PDF up to 10MB</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reply Templates */}
                                        <div className="space-y-1">
                                            <Label htmlFor="waReplies" className="text-xs text-slate-600 font-semibold">Quick reply templates for customer service</Label>
                                            <Textarea
                                                id="waReplies"
                                                value={waReplies}
                                                onChange={(e) => setWaReplies(e.target.value)}
                                                placeholder="Write reply templates for common questions here for staff to copy (pricing, dates, hotel, etc.)..."
                                                className="text-xs"
                                                rows={5}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 justify-end flex flex-col">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                                            <b>Note:</b> The brochure file and reply templates make it easier for the response team (Step 3) by giving them all the event details needed to reply instantly to WhatsApp messages.
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleSaveDesignData('whatsapp')}
                                                disabled={isSaving}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                            >
                                                {waCompleted ? 'Update & Confirm (Done ✓)' : 'Approve & Save as Complete ✓'}
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
