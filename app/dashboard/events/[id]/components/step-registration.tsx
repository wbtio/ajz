'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Calendar, Globe, CheckCircle2 } from 'lucide-react'
import { sanitizeEnglishText } from '@/lib/english-only'
import type { Event } from '@/lib/database.types'

interface StepRegistrationProps {
    event: Event
    onUpdate: (updatedEvent: Event) => void
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
        title: sanitizeEnglishText(event.title || '').trim(),
        description_ar: event.description_ar || '',
        description: sanitizeEnglishText(event.description || '').trim(),
        date: event.date ? event.date.split('T')[0] : '',
        end_date: event.end_date ? event.end_date.split('T')[0] : '',
        location_ar: event.location_ar || '',
        location: sanitizeEnglishText(event.location || '').trim(),
        country_ar: event.country_ar || '',
        country: sanitizeEnglishText(event.country || '').trim(),
        capacity: event.capacity ? String(event.capacity) : '',
        price: event.price ? String(event.price) : '',
        show_price: event.show_price ?? true,
        event_type: event.event_type || 'local',
        status: 'draft'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const nextValue = e.target instanceof HTMLTextAreaElement || ['text', 'search', 'email', 'url'].includes(type)
            ? sanitizeEnglishText(value)
            : value
        setFormData(prev => ({ ...prev, [name]: nextValue }))
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
                    date: formData.date,
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

            setMessage({ type: 'success', text: 'Event details saved.' })
            onUpdate(data)
        } catch (err: unknown) {
            console.error('Error saving event:', err)
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Could not save the event details.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 text-left" dir="ltr" lang="en">
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
                                    1. Basic Event Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                        <Input
                                            label="Event Title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="e.g. Baghdad AI Conference"
                                            required
                                            className="text-sm"
                                        />
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-slate-700 font-medium">Description</Label>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="Write a detailed description in English..."
                                            rows={4}
                                            className="text-sm"
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
                                    2. Date, Venue, and Classification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm text-slate-700 font-medium">Start Date</Label>
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
                                        <Label className="text-sm text-slate-700 font-medium">End Date (Optional)</Label>
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
                                            label="Venue / Hall"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="e.g. Baghdad Fairground"
                                            required
                                            className="text-sm"
                                        />
                                        <Input
                                            label="Country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="Iraq"
                                            className="text-sm"
                                        />
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
                                    3. Event Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-600 font-medium">Event Type</Label>
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
                                                <SelectItem value="local">Local</SelectItem>
                                                <SelectItem value="international">International (TLS visa support)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="h-9 w-full bg-slate-50 border border-slate-200 rounded-md animate-pulse" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600 font-medium">Capacity</Label>
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
                                        <Label className="text-xs text-slate-600 font-medium">Ticket Price ($)</Label>
                                        <Input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                            placeholder="0"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <Label className="text-xs text-slate-700 font-semibold">Show Price to Visitors</Label>
                                    <Switch
                                        checked={formData.show_price}
                                        onCheckedChange={(checked) => handleSwitchChange('show_price', checked)}
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div className="space-y-1.5 pt-3 border-t border-slate-100 flex flex-col gap-1">
                                    <Label className="text-xs text-slate-600 font-medium">Publishing Status</Label>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        Draft details (the event remains unpublished)
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
                                        Saving changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
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
