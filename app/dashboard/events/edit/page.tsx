'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { ArrowRight, Save, Loader2, Upload, X, Globe, MapPin as MapPinIcon, ImageIcon, Presentation, Home, Palette, Award, Store, Handshake, ClipboardList, ChevronDown, ChevronUp, CalendarDays, Plus, Trash2, ImagePlus, Clock, Wrench, User } from 'lucide-react'
import type { Event, Sector } from '@/lib/database.types'
import type { FormField } from '@/lib/types'
import { AiHtmlGenerator } from './components/ai-html-generator'
import { sanitizeEnglishText } from '@/lib/english-only'

const RegistrationFormBuilder = dynamic(
    () => import('@/components/shared/registration-form-builder').then(mod => ({ default: mod.RegistrationFormBuilder })),
    { ssr: false }
)

function EditEventContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const htmlFileInputRef = useRef<HTMLInputElement>(null)

    const [event, setEvent] = useState<Event | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
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
    const [savedFormData, setSavedFormData] = useState<typeof formData | null>(null)
    const [savedConferenceConfig, setSavedConferenceConfig] = useState<typeof conferenceConfig | null>(null)
    const hasUnsavedChanges = savedFormData !== null && (
        JSON.stringify(formData) !== JSON.stringify(savedFormData) ||
        JSON.stringify(conferenceConfig) !== JSON.stringify(savedConferenceConfig)
    )

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

    useEffect(() => {
        if (!id) {
            setError('Event ID is missing.')
            setIsLoading(false)
            return
        }

        const fetchEvent = async () => {
            const supabase = createClient()
            const { data, error } = await supabase.from('events').select('*').eq('id', id).single()

            if (error || !data) {
                setError('Event not found.')
                setIsLoading(false)
                return
            }

            setEvent(data)

            const loadedFormData = {
                title: sanitizeEnglishText(data.title || '').trim(),
                title_ar: data.title_ar || '',
                description: sanitizeEnglishText(data.description || '').trim(),
                description_ar: data.description_ar || '',
                date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
                end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
                location: sanitizeEnglishText(data.location || '').trim(),
                location_ar: data.location_ar || '',
                capacity: data.capacity?.toString() || '',
                price: data.price?.toString() || '',
                show_price: data.show_price ?? true,
                sector: data.sector || '',
                sector_id: data.sector_id || '',
                event_type: data.event_type || 'local',
                status: data.status || 'draft',
                featured: data.featured || false,
                image_url: data.image_url || '',
                mentorship: sanitizeEnglishText(data.mentorship || '').trim(),
                mentorship_ar: data.mentorship_ar || '',
                country: sanitizeEnglishText(data.country || '').trim(),
                country_ar: data.country_ar || '',
                sub_sector: sanitizeEnglishText(data.sub_sector || '').trim(),
                sub_sector_ar: data.sub_sector_ar || '',
                html_content_url: data.html_content_url || '',
                html_content: (data as any).html_content || '',
            }
            setFormData(loadedFormData)
            setSavedFormData(loadedFormData)

            const cc = (data as any).conference_config
            const ccBase = {
                home: { enabled: true, content_ar: '', content_en: '' },
                theme: { enabled: true, content_ar: '', content_en: '', topics: [] as TopicItem[] },
                sponsors: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
                exhibitors: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
                partners: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
                registration: { enabled: true, content_ar: '', content_en: '', form_fields: [] as FormField[], topics: [] as TopicItem[] },
                program: { enabled: true, sessions: [] as typeof conferenceConfig.program.sessions },
            }
            const loadedCC = cc && typeof cc === 'object' ? {
                home: { ...ccBase.home, ...cc.home },
                theme: { ...ccBase.theme, ...cc.theme },
                sponsors: { ...ccBase.sponsors, ...cc.sponsors },
                exhibitors: { ...ccBase.exhibitors, ...cc.exhibitors },
                partners: { ...ccBase.partners, ...cc.partners },
                registration: { ...ccBase.registration, ...cc.registration },
                program: { ...ccBase.program, ...cc.program, sessions: cc.program?.sessions || [] },
            } : ccBase
            const sanitizeTopic = (topic: TopicItem): TopicItem => ({
                ...topic,
                title_en: sanitizeEnglishText(topic.title_en || '').trim(),
                description_en: sanitizeEnglishText(topic.description_en || '').trim(),
            })
            const sanitizeSection = (section: any) => ({
                ...section,
                content_en: sanitizeEnglishText(section.content_en || '').trim(),
                topics: Array.isArray(section.topics) ? section.topics.map(sanitizeTopic) : [],
                form_fields: Array.isArray(section.form_fields)
                    ? section.form_fields.map((field: FormField) => ({
                        ...field,
                        label_en: sanitizeEnglishText(field.label_en || '').trim(),
                        options: field.options?.map((option) => sanitizeEnglishText(option).trim()).filter(Boolean),
                    }))
                    : section.form_fields,
            })
            const englishLoadedCC = {
                home: sanitizeSection(loadedCC.home),
                theme: sanitizeSection(loadedCC.theme),
                sponsors: sanitizeSection(loadedCC.sponsors),
                exhibitors: sanitizeSection(loadedCC.exhibitors),
                partners: sanitizeSection(loadedCC.partners),
                registration: sanitizeSection(loadedCC.registration),
                program: {
                    ...loadedCC.program,
                    sessions: loadedCC.program.sessions.map((session: typeof conferenceConfig.program.sessions[number]) => ({
                        ...session,
                        title_en: sanitizeEnglishText(session.title_en || '').trim(),
                        speaker_en: sanitizeEnglishText(session.speaker_en || '').trim(),
                        location_en: sanitizeEnglishText(session.location_en || '').trim(),
                        description_en: sanitizeEnglishText(session.description_en || '').trim(),
                    })),
                },
            }
            setConferenceConfig(englishLoadedCC)
            setSavedConferenceConfig(englishLoadedCC)

            setIsLoading(false)
        }

        fetchEvent()
    }, [id])

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `events/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('events-bucket').upload(fileName, file)
        if (uploadError) {
            setError('Image upload failed: ' + uploadError.message)
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
            setError('Upload an HTML file only.')
            return
        }
        setIsUploadingHtml(true)
        
        try {
            const htmlContent = await file.text()
            setFormData(prev => ({ ...prev, html_content_url: file.name, html_content: htmlContent }))
        } catch (err) {
            setError('Could not read the HTML file.')
        }
        
        setIsUploadingHtml(false)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const nextValue = type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target instanceof HTMLTextAreaElement || ['text', 'search', 'email', 'url'].includes(type)
                ? sanitizeEnglishText(value)
                : value
        setFormData(prev => ({ ...prev, [name]: nextValue }))
    }

    const handleSectorChange = useCallback((value: string) => {
        const sector = sectors.find(s => s.id === value)
        setFormData(prev => ({ ...prev, sector_id: value, sector: sector?.slug || '' }))
    }, [sectors])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!event) return
        setError('')
        setIsSaving(true)

        const supabase = createClient()

        const { data: updated, error } = await supabase
            .from('events')
            .update({
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
                ...(quickAdd ? {} : { conference_config: conferenceConfig as any }),
            })
            .eq('id', event.id)
            .select()

        if (error) {
            setError('Could not save changes: ' + error.message)
            setIsSaving(false)
            return
        }

        if (!updated || updated.length === 0) {
            setError('Could not save changes. The event was not found or you do not have edit access.')
            setIsSaving(false)
            return
        }

        setSavedFormData({ ...formData })
        setSavedConferenceConfig(JSON.parse(JSON.stringify(conferenceConfig)))
        router.push('/dashboard/events')
        router.refresh()
    }

    const handleDiscard = () => {
        if (savedFormData) setFormData({ ...savedFormData })
        if (savedConferenceConfig) setConferenceConfig(JSON.parse(JSON.stringify(savedConferenceConfig)))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!event && !isLoading) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error || 'Event not found.'}</p>
                <Link href="/dashboard/events">
                    <Button variant="outline">Back to Events</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="pb-20 text-left" dir="ltr" lang="en">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events" className="text-gray-500 hover:text-gray-700">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit: {event?.title || 'Untitled Event'}
                    </h1>
                </div>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <label htmlFor="quickAdd" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Quick Edit
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
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="w-full justify-start bg-white border rounded-xl p-1 h-auto flex-wrap">
                        <TabsTrigger value="basic" className="rounded-lg px-4 py-2 text-sm">Basic Information</TabsTrigger>
                        <TabsTrigger value="details" className="rounded-lg px-4 py-2 text-sm">Details and Classification</TabsTrigger>
                        {!quickAdd && (
                            <TabsTrigger value="conference" className="rounded-lg px-4 py-2 text-sm flex items-center gap-1.5">
                                <Presentation className="w-4 h-4" />
                                Conference Sections
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Tab 1: Basic Info */}
                    <TabsContent value="basic">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><h2 className="text-lg font-bold text-gray-900">Basic Information</h2></CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label="Event Title" name="title" value={formData.title} onChange={handleChange} required />
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Enter the event description in English" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        Event Image
                                    </h2>
                                </CardHeader>
                                <CardContent>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    {formData.image_url ? (
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                            <div className="relative h-64">
                                                <Image src={formData.image_url} alt="Event cover" fill className="object-cover" />
                                            </div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm">
                                                    <Upload className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm">
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                                            {isUploading ? (
                                                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-gray-100 rounded-xl"><Upload className="w-6 h-6 text-gray-500" /></div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-700">Upload an image</p>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP, up to 5 MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <Separator className="my-4" />
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))} />
                                            <Label htmlFor="featured" className="cursor-pointer">Featured Event</Label>
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
                                                Event HTML Content
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">Edit the HTML directly or upload an HTML file.</p>
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
                                                Upload HTML File
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
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <AiHtmlGenerator
                                            eventTitle={formData.title_ar || formData.title}
                                            onGenerated={(html) => setFormData(prev => ({
                                                ...prev,
                                                html_content: html,
                                                html_content_url: prev.html_content_url || 'ai-generated.html',
                                            }))}
                                        />
                                        {formData.html_content_url && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <Upload className="w-3 h-3" />
                                                Loaded: {formData.html_content_url.split('/').pop()}
                                            </p>
                                        )}
                                        <textarea
                                            value={formData.html_content}
                                            onChange={e => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                                            className="w-full h-80 px-3 py-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-colors"
                                            placeholder="Write or paste HTML content here..."
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
                                <CardHeader><h2 className="text-lg font-bold text-gray-900">Date and Location</h2></CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label="Start Date" type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
                                    <Input label="End Date" type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} />
                                    <Input label="Location" name="location" value={formData.location} onChange={handleChange} required />
                                    <Input label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. France" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><h2 className="text-lg font-bold text-gray-900">Classification and Price</h2></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Event Type</Label>
                                        <Select value={formData.event_type} onValueChange={(v) => setFormData(prev => ({ ...prev, event_type: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="local"><span className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" />Local</span></SelectItem>
                                                <SelectItem value="international"><span className="flex items-center gap-2"><Globe className="w-4 h-4" />International</span></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sector</Label>
                                        <Select value={formData.sector_id} onValueChange={handleSectorChange}>
                                            <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                                            <SelectContent>
                                                {sectors.map(sector => (
                                                    <SelectItem key={sector.id} value={sector.id}>{sector.name_en || sector.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sub-Sector */}
                                    <Input label="Sub-sector" name="sub_sector" value={formData.sub_sector} onChange={handleChange} placeholder="e.g. Medical / Dentistry" />

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Price</Label>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="show_price" className="text-xs text-gray-500 cursor-pointer">Show Price</Label>
                                                <Switch id="show_price" checked={formData.show_price} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_price: checked }))} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Capacity" type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                                            <Input label="Price (IQD)" type="number" name="price" value={formData.price} onChange={handleChange} />
                                        </div>
                                        {!formData.show_price && (
                                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">Price is hidden from visitors.</p>
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
                                    Conference Sections
                                </h2>
                                <p className="text-sm text-gray-500">Choose the sections shown in the event navigation, then add English content and registration fields.</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {([
                                    { key: 'home', labelEn: 'Home', icon: Home, color: 'bg-blue-50 text-blue-600', hasForm: false },
                                    { key: 'theme', labelEn: 'Theme', icon: Palette, color: 'bg-purple-50 text-purple-600', hasForm: false },
                                    { key: 'sponsors', labelEn: 'Sponsors', icon: Award, color: 'bg-yellow-50 text-yellow-600', hasForm: true },
                                    { key: 'exhibitors', labelEn: 'Exhibitors', icon: Store, color: 'bg-green-50 text-green-600', hasForm: true },
                                    { key: 'partners', labelEn: 'Partners', icon: Handshake, color: 'bg-indigo-50 text-indigo-600', hasForm: true },
                                    { key: 'registration', labelEn: 'Registration', icon: ClipboardList, color: 'bg-red-50 text-red-600', hasForm: true },
                                ] as const).map(section => {
                                    const SectionIcon = section.icon
                                    const sectionData = conferenceConfig[section.key as keyof typeof conferenceConfig] as { enabled: boolean; content_ar: string; content_en: string; form_fields?: FormField[] }
                                    const isExpanded = expandedSection === section.key
                                    return (
                                        <div key={section.key} className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedSection(isExpanded ? null : section.key)}>
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                                                    <SectionIcon className="w-4.5 h-4.5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 text-sm">{section.labelEn}</h3>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {section.hasForm && (sectionData as any).form_fields?.length > 0 && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                            {(sectionData as any).form_fields.length} fields
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

                                            {isExpanded && (
                                                <div className="p-5 border-t border-gray-100 space-y-4">
                                                    <div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-gray-500">Content</Label>
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

                                                    {section.hasForm && (
                                                        <div className="border-t pt-4 mt-4">
                                                            <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                                <ClipboardList className="w-4 h-4" />
                                                                {section.labelEn} Registration Form
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
                                                                Topics / Cards - {section.labelEn}
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {((sectionData as any).topics || []).map((topic: TopicItem, tIdx: number) => (
                                                                    <div key={topic.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-3">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-xs font-bold text-gray-500">Topic {tIdx + 1}</span>
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
                                                                                    Upload Image
                                                                                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                                                                                        const f = e.target.files?.[0]
                                                                                        if (f) handleTopicImageUpload(f, section.key, topic.id)
                                                                                    }} />
                                                                                </label>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <Input label="Title" value={topic.title_en} onChange={e => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, title_en: e.target.value } : t) } }
                                                                            })} dir="ltr" placeholder="Topic title" />
                                                                        </div>
                                                                        <div>
                                                                            <Textarea value={topic.description_en} onChange={e => setConferenceConfig(prev => {
                                                                                const sec = prev[section.key as keyof typeof prev] as any
                                                                                return { ...prev, [section.key]: { ...sec, topics: sec.topics.map((t: TopicItem) => t.id === topic.id ? { ...t, description_en: e.target.value } : t) } }
                                                                            })} rows={2} dir="ltr" placeholder="Description" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <button type="button" onClick={() => setConferenceConfig(prev => {
                                                                    const sec = prev[section.key as keyof typeof prev] as any
                                                                    const newTopic = { id: `topic_${Date.now()}`, image_url: '', title_ar: '', title_en: '', description_ar: '', description_en: '' }
                                                                    return { ...prev, [section.key]: { ...sec, topics: [...(sec.topics || []), newTopic] } }
                                                                })} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors">
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                    Add Topic
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
                                            <h3 className="font-bold text-gray-900 text-sm">Program</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {conferenceConfig.program.sessions.length > 0 && (
                                                <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                                    {conferenceConfig.program.sessions.length} sessions
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
                                                                {sess.category === 'workshop' ? 'Workshop' : 'Session'}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-700">Session {index + 1}</span>
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
                                                            <Label className="text-xs text-gray-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</Label>
                                                            <Input type="date" value={sess.date} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, date: e.target.value } : s) }
                                                            }))} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Start Time</Label>
                                                            <Input type="time" value={sess.start_time} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, start_time: e.target.value } : s) }
                                                            }))} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> End Time</Label>
                                                            <Input type="time" value={sess.end_time} onChange={e => setConferenceConfig(prev => ({
                                                                ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, end_time: e.target.value } : s) }
                                                            }))} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">Session Type</Label>
                                                            <select
                                                                value={sess.category}
                                                                onChange={e => setConferenceConfig(prev => ({
                                                                    ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, category: e.target.value as 'session' | 'workshop' } : s) }
                                                                }))}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-10"
                                                            >
                                                                <option value="session">Session</option>
                                                                <option value="workshop">Workshop</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Title row */}
                                                    <div>
                                                        <Input label="Session Title" value={sess.title_en} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, title_en: e.target.value } : s) }
                                                        }))} dir="ltr" placeholder="e.g. Future of AI" />
                                                    </div>

                                                    {/* Speaker row */}
                                                    <div>
                                                        <Input label="Speaker" value={sess.speaker_en} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, speaker_en: e.target.value } : s) }
                                                        }))} dir="ltr" placeholder="e.g. Dr. Ahmed Mohammed" />
                                                    </div>

                                                    {/* Location row */}
                                                    <div>
                                                        <Input label="Location" value={sess.location_en} onChange={e => setConferenceConfig(prev => ({
                                                            ...prev, program: { ...prev.program, sessions: prev.program.sessions.map(s => s.id === sess.id ? { ...s, location_en: e.target.value } : s) }
                                                        }))} dir="ltr" placeholder="e.g. Main Hall" />
                                                    </div>

                                                    {/* Description row */}
                                                    <div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">Description (Optional)</Label>
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
                                                Add Session
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    )}
                </Tabs>

                {hasUnsavedChanges && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-white border-t border-amber-200 shadow-lg px-6 py-3">
                        <div className="flex items-center gap-2 text-amber-700">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-sm font-medium">You have unsaved changes.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleDiscard}
                                className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Discard Changes
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}

export default function EditEventPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <EditEventContent />
        </Suspense>
    )
}
