'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { sanitizeEnglishText } from '@/lib/english-only'

export default function AddEventPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        end_date: '',
        location: '',
        capacity: '',
        price: '',
        show_price: true,
        event_type: 'local',
        status: 'draft',
        image_url: '',
        country: '',
    })

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError('')
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `events/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('events-bucket')
            .upload(fileName, file)

        if (uploadError) {
            setError('Image upload failed: ' + uploadError.message)
            setIsUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage.from('events-bucket').getPublicUrl(fileName)
        setFormData(prev => ({ ...prev, image_url: publicUrl }))
        setIsUploading(false)
    }, [])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const nextValue = ['text', 'textarea', 'search', 'email', 'url'].includes(type)
            ? sanitizeEnglishText(value)
            : value
        setFormData(prev => ({ ...prev, [name]: nextValue }))
    }, [])

    const handleSelectChange = useCallback((name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }))
    }, [])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const supabase = createClient()

            const { data, error: insertError } = await supabase
                .from('events')
                .insert({
                    title: formData.title,
                    title_ar: null,
                    description: formData.description || null,
                    description_ar: null,
                    date: formData.date,
                    end_date: formData.end_date || null,
                    location: formData.location,
                    location_ar: null,
                    capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
                    price: formData.price ? parseFloat(formData.price) : null,
                    show_price: formData.show_price,
                    event_type: formData.event_type,
                    status: formData.status,
                    image_url: formData.image_url || null,
                    country: formData.country || null,
                    country_ar: null,
                    conference_config: {
                        workflow: {
                            step1: { status: 'completed' },
                            step2: { status: 'not_started', designer: '', notes: '' },
                            step3: { status: 'not_started', strategy: '', social_tools: '' },
                            step4: { status: 'not_started' }
                        }
                    }
                })
                .select()
                .single()

            if (insertError) throw insertError

            router.push(`/dashboard/events/${data.id}`)
            router.refresh()
        } catch (err: any) {
            console.error('Error inserting event:', err)
            setError(err.message || 'An unexpected error occurred while creating the event.')
            setIsLoading(false)
        }
    }, [formData, router])

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 text-left" dir="ltr" lang="en">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events">
                        <Button variant="outline" size="sm" className="w-9 h-9 p-0 rounded-xl border-slate-200">
                            <ArrowLeft className="w-5 h-5 text-slate-700" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Add New Event</h1>
                        <p className="text-xs text-slate-500 mt-1">Enter the event details to start its management workflow.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Basic Form Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800">1. Basic Event Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                        <Input
                                            label="Event Title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Baghdad AI Conference"
                                            required
                                            className="text-sm"
                                        />
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-slate-700">Description</Label>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Write a detailed description in English..."
                                            rows={4}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800">2. Date, Venue, and Classification</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm text-slate-700">Start Date</Label>
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm text-slate-700">End Date (Optional)</Label>
                                        <Input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Venue / Hall"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Baghdad Fairground"
                                            required
                                            className="text-sm"
                                        />
                                        <Input
                                            label="Country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            placeholder="Iraq"
                                            className="text-sm"
                                        />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Uploads & Metadata Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Image Upload Card */}
                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                                    Cover Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                {formData.image_url ? (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                        <div className="relative h-44 w-full">
                                            <Image src={formData.image_url} alt="Event cover" fill className="object-cover" />
                                        </div>
                                        <div className="absolute top-2 left-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-1.5 bg-white/95 rounded-lg hover:bg-white transition-colors shadow"
                                            >
                                                <Upload className="w-3.5 h-3.5 text-slate-700" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                className="p-1.5 bg-white/95 rounded-lg hover:bg-white transition-colors shadow"
                                            >
                                                <X className="w-3.5 h-3.5 text-red-650" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full h-44 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
                                    >
                                        {isUploading ? (
                                            <Loader2 className="animate-spin w-6 h-6 text-indigo-650" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-slate-400" />
                                                <div className="text-center">
                                                    <p className="text-xs font-semibold text-slate-700">Upload cover image</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">PNG or JPG, up to 5 MB</p>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Setting values */}
                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800">3. Event Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-600">Event Type</Label>
                                    <Select
                                        value={formData.event_type}
                                        onValueChange={(val) => handleSelectChange('event_type', val)}
                                    >
                                        <SelectTrigger className="text-xs h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="local">Local</SelectItem>
                                            <SelectItem value="international">International (TLS visa support)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">Capacity</Label>
                                        <Input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            placeholder="500"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">Ticket Price ($)</Label>
                                        <Input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs text-slate-700 font-semibold">Show Price</Label>
                                    </div>
                                    <Switch
                                        checked={formData.show_price}
                                        onCheckedChange={(checked) => handleSwitchChange('show_price', checked)}
                                    />
                                </div>

                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                    <Label className="text-xs text-slate-600">Initial Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => handleSelectChange('status', val)}
                                    >
                                        <SelectTrigger className="text-xs h-9 bg-slate-50 border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft (Unpublished)</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating event...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Create Event
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
