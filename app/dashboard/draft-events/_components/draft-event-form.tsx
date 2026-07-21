'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, ChevronLeft, Plus, Trash2, Upload, Image as ImageIcon, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { sanitizeEnglishText } from '@/lib/english-only'
import { Tables } from '@/lib/database.types'

function toDateInputValue(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 10)
}

function englishValue(value: unknown) {
  return sanitizeEnglishText(String(value || '')).trim()
}

interface DraftEventFormProps {
  eventId?: string
  initialData?: Partial<Tables<'drift_events'>>
  initialStep?: number
}

type HostInfo = Partial<{
  has_accommodation: boolean
  org_name: string
  org_address: string
  org_postal: string
  org_city: string
  org_country: string
  org_phone: string
  org_email: string
  contact_last_name: string
  contact_first_name: string
  contact_same_address: boolean
  contact_address: string
  contact_postal: string
  contact_city: string
  contact_country: string
  contact_phone: string
  contact_email: string
}>

type ExpectedReply = {
  question: string
  answer: string
  image_url: string
}

type PromotionChannel = {
  platform: string
  enabled: boolean
  image_url: string
  video_url: string
  notes: string
}

type PromotionPlan = {
  objective: string
  budget: string
  start_date: string
  end_date: string
  channels: PromotionChannel[]
}

const defaultPromotion: PromotionPlan = {
  objective: '', budget: '', start_date: '', end_date: '',
  channels: [
    { platform: 'Website', enabled: true, image_url: '', video_url: '', notes: '' },
    { platform: 'WhatsApp', enabled: true, image_url: '', video_url: '', notes: '' },
    { platform: 'Instagram', enabled: true, image_url: '', video_url: '', notes: '' },
    { platform: 'Facebook', enabled: true, image_url: '', video_url: '', notes: '' },
    { platform: 'TikTok', enabled: true, image_url: '', video_url: '', notes: '' },
    { platform: 'X / Twitter', enabled: false, image_url: '', video_url: '', notes: '' },
    { platform: 'Snapchat', enabled: false, image_url: '', video_url: '', notes: '' },
    { platform: 'LinkedIn', enabled: false, image_url: '', video_url: '', notes: '' },
    { platform: 'YouTube', enabled: false, image_url: '', video_url: '', notes: '' },
  ],
}

export function DraftEventForm({ eventId, initialData, initialStep }: DraftEventFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const formRef = useRef<HTMLFormElement>(null)
  const initialConferenceConfig = initialData?.conference_config &&
    typeof initialData.conference_config === 'object' &&
    !Array.isArray(initialData.conference_config)
      ? initialData.conference_config as Record<string, unknown>
      : {}
  const initialHostInfo = initialConferenceConfig.host_info &&
    typeof initialConferenceConfig.host_info === 'object' &&
    !Array.isArray(initialConferenceConfig.host_info)
      ? initialConferenceConfig.host_info as HostInfo
      : {}
  const initialExpectedReplies = Array.isArray(initialConferenceConfig.expected_replies)
    ? (initialConferenceConfig.expected_replies as ExpectedReply[]).map((item) => ({
        ...item,
        question: englishValue(item.question),
        answer: englishValue(item.answer),
      }))
    : []
  const initialPromotion = initialConferenceConfig.promotion && typeof initialConferenceConfig.promotion === 'object' && !Array.isArray(initialConferenceConfig.promotion)
    ? {
        ...defaultPromotion,
        ...(initialConferenceConfig.promotion as Partial<PromotionPlan>),
        objective: englishValue((initialConferenceConfig.promotion as Partial<PromotionPlan>).objective),
        channels: Array.isArray((initialConferenceConfig.promotion as Partial<PromotionPlan>).channels)
          ? (initialConferenceConfig.promotion as PromotionPlan).channels.map((channel) => ({ ...channel, notes: englishValue(channel.notes) }))
          : defaultPromotion.channels,
      }
    : defaultPromotion
  const [currentStep, setCurrentStep] = useState(initialStep || 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expectedReplies, setExpectedReplies] = useState<ExpectedReply[]>(initialExpectedReplies)
  const [promotion, setPromotion] = useState<PromotionPlan>(initialPromotion)
  
  const [formData, setFormData] = useState({
    title: englishValue(initialData?.title),
    description: englishValue((initialData as any)?.description),
    date: toDateInputValue(initialData?.date),
    end_date: toDateInputValue(initialData?.end_date),
    country: englishValue(initialData?.country),
    location: englishValue(initialData?.location),
    event_type: initialData?.event_type || 'offline',
    capacity: (initialData as any)?.capacity?.toString() || '',
    price: (initialData as any)?.price?.toString() || '',
    host_has_accommodation: initialHostInfo.has_accommodation || false,
    host_org_name: englishValue(initialHostInfo.org_name),
    host_org_address: englishValue(initialHostInfo.org_address),
    host_org_postal: englishValue(initialHostInfo.org_postal),
    host_org_city: englishValue(initialHostInfo.org_city),
    host_org_country: englishValue(initialHostInfo.org_country),
    host_org_phone: englishValue(initialHostInfo.org_phone),
    host_org_email: englishValue(initialHostInfo.org_email),
    host_contact_last_name: englishValue(initialHostInfo.contact_last_name),
    host_contact_first_name: englishValue(initialHostInfo.contact_first_name),
    host_contact_same_address: initialHostInfo.contact_same_address || false,
    host_contact_address: englishValue(initialHostInfo.contact_address),
    host_contact_postal: englishValue(initialHostInfo.contact_postal),
    host_contact_city: englishValue(initialHostInfo.contact_city),
    host_contact_country: englishValue(initialHostInfo.contact_country),
    host_contact_phone: englishValue(initialHostInfo.contact_phone),
    host_contact_email: englishValue(initialHostInfo.contact_email)
  })

  const activeSteps = useMemo(() => {
    const list = [
      { key: 'basic', name: 'Basic Details' },
      { key: 'time_location', name: 'Time & Location' },
      { key: 'logistics', name: 'Logistics' }
    ]
    if (formData.event_type !== 'online') {
      list.push({ key: 'accommodation', name: 'Accommodation / Host' })
    }
    list.push({ key: 'promotion', name: 'Promotion' })
    return list.map((step, index) => ({
      id: index + 1,
      key: step.key,
      name: step.name
    }))
  }, [formData.event_type])

  const activeStepKey = activeSteps[currentStep - 1]?.key

  useEffect(() => {
    if (currentStep > activeSteps.length) {
      setCurrentStep(activeSteps.length)
    }
  }, [activeSteps, currentStep])

  useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep)
    }
  }, [initialStep])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    const { name, value, type } = target
    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      const nextValue = target instanceof HTMLTextAreaElement || ['text', 'search', 'email', 'url'].includes(type)
        ? sanitizeEnglishText(value)
        : value
      setFormData(prev => ({ ...prev, [name]: nextValue }))
    }
  }

  const nextStep = async () => {
    if (!formRef.current?.reportValidity()) return
    if (currentStep < activeSteps.length) {
      await persistDraft(false, currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const addExpectedReply = () => setExpectedReplies((items) => [...items, { question: '', answer: '', image_url: '' }])

  const updateExpectedReply = (index: number, field: keyof ExpectedReply, value: string) => {
    const nextValue = field === 'image_url' ? value : sanitizeEnglishText(value)
    setExpectedReplies((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: nextValue } : item))
  }

  const removeExpectedReply = (index: number) => setExpectedReplies((items) => items.filter((_, itemIndex) => itemIndex !== index))

  const uploadReplyImage = async (index: number, file: File) => {
    const extension = file.name.split('.').pop() || 'jpg'
    const path = `expected-replies/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('events-bucket').upload(path, file, { upsert: false })
    if (error) {
      toast.error('Could not upload the image. Check the events-bucket permissions.')
      return
    }
    const { data } = supabase.storage.from('events-bucket').getPublicUrl(path)
    updateExpectedReply(index, 'image_url', data.publicUrl)
    toast.success('Reply image uploaded.')
  }

  const uploadPromotionAsset = async (index: number, field: 'image_url' | 'video_url', file: File) => {
    const extension = file.name.split('.').pop() || 'bin'
    const path = `promotion/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('events-bucket').upload(path, file, { upsert: false })
    if (error) { toast.error('Could not upload the promotion asset.'); return }
    const { data } = supabase.storage.from('events-bucket').getPublicUrl(path)
    setPromotion((current) => ({ ...current, channels: current.channels.map((channel, channelIndex) => channelIndex === index ? { ...channel, [field]: data.publicUrl } : channel) }))
  }

  const buildPayload = async (finish: boolean) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (finish && !formData.date) {
        throw new Error('Start date is required.')
      }
      return {
        updated_by: user?.id ?? null,
        title: formData.title,
        date: formData.date || null,
        end_date: formData.end_date || null,
        country: formData.country,
        location: formData.location,
        event_type: formData.event_type,
        is_active: true,
        status: 'active',
        registration_config: initialData?.registration_config ?? null,
          conference_config: {
          ...initialConferenceConfig,
          expected_replies: expectedReplies.filter((item) => item.question.trim() || item.answer.trim()),
          promotion,
          host_info: {
            has_accommodation: formData.host_has_accommodation,
            org_name: formData.host_org_name,
            org_address: formData.host_org_address,
            org_postal: formData.host_org_postal,
            org_city: formData.host_org_city,
            org_country: formData.host_org_country,
            org_phone: formData.host_org_phone,
            org_email: formData.host_org_email,
            contact_last_name: formData.host_contact_last_name,
            contact_first_name: formData.host_contact_first_name,
            contact_same_address: formData.host_contact_same_address,
            contact_address: formData.host_contact_address,
            contact_postal: formData.host_contact_postal,
            contact_city: formData.host_contact_city,
            contact_country: formData.host_contact_country,
            contact_phone: formData.host_contact_phone,
            contact_email: formData.host_contact_email
          }
        }
      } as any
  }

  const persistDraft = async (finish: boolean, targetStepOnSave?: number) => {
    setIsSubmitting(true)
    try {
      const payload = await buildPayload(finish)

      if (eventId) {
        // Update existing draft
        const { error } = await supabase
          .from('drift_events')
          .update(payload)
          .eq('id', eventId)

        if (error) throw error

        toast.success(finish ? 'Draft event saved successfully.' : 'Progress saved successfully.')
        if (finish) {
          router.push('/dashboard/draft-events')
        } else {
          if (targetStepOnSave) {
            setCurrentStep(targetStepOnSave)
          }
          router.refresh()
        }
      } else {
        // Insert new draft
        const { data: createdEvent, error } = await supabase
          .from('drift_events')
          .insert([{
            ...payload,
            status: 'active',
            is_active: true,
          }])
          .select('id')
          .single()

        if (error) throw error

        toast.success(finish ? 'Draft event created successfully.' : 'Draft created. Your progress is saved.')
        if (finish) {
          router.push('/dashboard/draft-events')
        } else {
          const nextStepNum = targetStepOnSave || currentStep
          router.replace(`/dashboard/draft-events/${createdEvent.id}/edit?step=${nextStepNum}`)
        }
      }
    } catch (error) {
      console.error('Error saving draft event:', error)
      toast.error('Failed to save draft event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await persistDraft(true)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-left" dir="ltr" lang="en">
      {/* Stepper Navigation */}
      <nav aria-label="Progress">
        <ol role="list" className={`grid gap-2 sm:gap-4 ${activeSteps.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
          {activeSteps.map((step) => (
            <li key={step.name} className="flex min-w-0 items-center">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.id}
              </span>
              <span className="ml-2 hidden min-w-0 truncate text-xs font-medium text-muted-foreground lg:block">
                {step.name}
              </span>
              {step.id !== activeSteps.length && (
                <div className="ml-2 hidden h-px flex-1 bg-border sm:block" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault()
            if (currentStep < activeSteps.length) {
              nextStep()
            }
          }
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{activeSteps.find(s => s.id === currentStep)?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeStepKey === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select dir="ltr" value={formData.event_type} onValueChange={(value) => setFormData((current) => ({ ...current, event_type: value }))}>
                      <SelectTrigger id="event_type" aria-label="Event type"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup>
                        <SelectItem value="offline">In Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectGroup></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter event description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {activeStepKey === 'time_location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Start Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      onInput={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      onInput={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="e.g. Saudi Arabia"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">City / Venue {formData.event_type !== 'online' && '*'}</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder={formData.event_type === 'online' ? 'Online platform/link (Optional)' : 'e.g. Riyadh, Exhibition Center'}
                      value={formData.location}
                      onChange={handleInputChange}
                      required={formData.event_type !== 'online'}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStepKey === 'logistics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.capacity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price in $ (Optional)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 150.00"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStepKey === 'accommodation' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 bg-blue-50/50 p-4 rounded-md border border-blue-100">
                  <Checkbox
                    id="host_has_accommodation"
                    checked={formData.host_has_accommodation as boolean}
                    onCheckedChange={(checked) => setFormData((current) => ({ ...current, host_has_accommodation: checked === true }))}
                  />
                  <Label htmlFor="host_has_accommodation" className="font-medium text-sm text-blue-900 cursor-pointer">
                    A company, organization, or establishment will be accommodating me.
                  </Label>
                </div>

                {formData.host_has_accommodation && (
                  <>
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="font-bold text-[#1a2b4c] mb-4 text-sm flex items-center gap-2">
                        <span className="bg-[#1a2b4c] text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                        HOST ORGANIZATION / COMPANY DETAILS
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="host_org_name">1. Name of the Host Organization / Company *</Label>
                          <Input id="host_org_name" name="host_org_name" value={formData.host_org_name} onChange={handleInputChange} placeholder="Enter the organization name…" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_org_address">2. Address *</Label>
                          <Input id="host_org_address" name="host_org_address" value={formData.host_org_address} onChange={handleInputChange} placeholder="Enter the full address" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_org_postal">3. Postal Code *</Label>
                          <Input id="host_org_postal" name="host_org_postal" value={formData.host_org_postal} onChange={handleInputChange} placeholder="Enter postal code" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_org_city">4. City *</Label>
                          <Input id="host_org_city" name="host_org_city" value={formData.host_org_city} onChange={handleInputChange} placeholder="Enter city" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_org_country">5. Country *</Label>
                          <Input id="host_org_country" name="host_org_country" value={formData.host_org_country} onChange={handleInputChange} placeholder="Enter country" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_org_phone">6. Telephone Number *</Label>
                          <Input id="host_org_phone" name="host_org_phone" value={formData.host_org_phone} onChange={handleInputChange} placeholder="e.g. +33 6 12 34 56 78" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_org_email">7. Email Address *</Label>
                          <Input id="host_org_email" name="host_org_email" type="email" value={formData.host_org_email} onChange={handleInputChange} placeholder="Enter email address" required />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="font-bold text-[#1a2b4c] mb-4 text-sm flex items-center gap-2">
                        <span className="bg-[#1a2b4c] text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                        CONTACT PERSON DETAILS
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_last_name">1. Last Name of the Contact Person *</Label>
                          <Input id="host_contact_last_name" name="host_contact_last_name" value={formData.host_contact_last_name} onChange={handleInputChange} placeholder="Enter last name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_first_name">2. First Name of the Contact Person *</Label>
                          <Input id="host_contact_first_name" name="host_contact_first_name" value={formData.host_contact_first_name} onChange={handleInputChange} placeholder="Enter first name" required />
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <Label htmlFor="host_contact_address" className="mr-2">3. Address *</Label>
                            <Checkbox
                              id="host_contact_same_address"
                              checked={formData.host_contact_same_address as boolean}
                              onCheckedChange={(value) => {
                                const checked = value === true
                                setFormData(prev => ({
                                  ...prev,
                                  host_contact_same_address: checked,
                                  ...(checked ? {
                                    host_contact_address: prev.host_org_address,
                                    host_contact_postal: prev.host_org_postal,
                                    host_contact_city: prev.host_org_city,
                                    host_contact_country: prev.host_org_country,
                                  } : {})
                                }))
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-xs text-muted-foreground">Same as Host Organization Address</span>
                          </div>
                          <Input id="host_contact_address" name="host_contact_address" value={formData.host_contact_address} onChange={handleInputChange} placeholder="Enter the full address" required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_postal">4. Postal Code *</Label>
                          <Input id="host_contact_postal" name="host_contact_postal" value={formData.host_contact_postal} onChange={handleInputChange} placeholder="Enter postal code" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_city">5. City *</Label>
                          <Input id="host_contact_city" name="host_contact_city" value={formData.host_contact_city} onChange={handleInputChange} placeholder="Enter city" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_country">6. Country *</Label>
                          <Input id="host_contact_country" name="host_contact_country" value={formData.host_contact_country} onChange={handleInputChange} placeholder="Enter country" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_phone">7. Telephone Number *</Label>
                          <Input id="host_contact_phone" name="host_contact_phone" value={formData.host_contact_phone} onChange={handleInputChange} placeholder="e.g. +33 6 12 34 56 78" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_contact_email">8. Email Address *</Label>
                          <Input id="host_contact_email" name="host_contact_email" type="email" value={formData.host_contact_email} onChange={handleInputChange} placeholder="Enter email address" required />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeStepKey === 'promotion' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="promotion_budget">Total promotion budget (USD)</Label><Input id="promotion_budget" type="number" min="0" step="0.01" value={promotion.budget} onChange={(e) => setPromotion((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. 500" /></div>
                  <div className="space-y-2"><Label htmlFor="promotion_start_date">Promotion from</Label><Input id="promotion_start_date" type="date" value={promotion.start_date} onChange={(e) => setPromotion((p) => ({ ...p, start_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label htmlFor="promotion_end_date">Promotion to</Label><Input id="promotion_end_date" type="date" value={promotion.end_date} onChange={(e) => setPromotion((p) => ({ ...p, end_date: e.target.value }))} /></div>
                </div>
                <div className="space-y-3">
                  <div><h3 className="text-sm font-semibold text-slate-900">Platform assets</h3><p className="mt-1 text-xs text-slate-500">Website, WhatsApp, Instagram, Facebook, TikTok, X, Snapchat, LinkedIn, and YouTube. Add the recommended dimensions in each platform notes field.</p></div>
                  {promotion.channels.map((channel, index) => (
                    <div key={channel.platform} className="space-y-3 rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm font-semibold"><Checkbox checked={channel.enabled} onCheckedChange={(checked) => setPromotion((p) => ({ ...p, channels: p.channels.map((c, i) => i === index ? { ...c, enabled: checked === true } : c) }))} />{channel.platform}</label><span className="text-xs text-slate-400">{channel.image_url || channel.video_url ? 'Asset attached' : 'No asset yet'}</span></div>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:border-primary"><ImageIcon className="h-4 w-4" /> Upload image<input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadPromotionAsset(index, 'image_url', e.target.files[0])} /></label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:border-primary"><Upload className="h-4 w-4" /> Upload video<input type="file" accept="video/*" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadPromotionAsset(index, 'video_url', e.target.files[0])} /></label>
                      </div>
                      <Input value={channel.notes} onChange={(e) => setPromotion((p) => ({ ...p, channels: p.channels.map((c, i) => i === index ? { ...c, notes: e.target.value } : c) }))} placeholder="Notes, dimensions, caption, audience, or CTA" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Expected questions and replies</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Prepare answers employees can quickly use when replying to visitors on WhatsApp.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addExpectedReply}>
                      <Plus className="mr-1.5 h-4 w-4" /> Add reply
                    </Button>
                  </div>
                  {expectedReplies.length === 0 ? (
                    <button type="button" onClick={addExpectedReply} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-primary hover:text-primary">
                      <Plus className="h-4 w-4" /> Add the first expected reply
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {expectedReplies.map((reply, index) => (
                        <div key={index} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Reply {index + 1}</span>
                            <Button type="button" variant="ghost" size="sm" aria-label={`Remove reply ${index + 1}`} onClick={() => removeExpectedReply(index)}>
                              <Trash2 className="h-4 w-4 text-slate-500" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`reply-question-${index}`}>Expected question</Label>
                            <Input id={`reply-question-${index}`} value={reply.question} onChange={(e) => updateExpectedReply(index, 'question', e.target.value)} placeholder="e.g. When does the exhibition start?" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`reply-answer-${index}`}>Suggested reply</Label>
                            <Textarea id={`reply-answer-${index}`} value={reply.answer} onChange={(e) => updateExpectedReply(index, 'answer', e.target.value)} placeholder="Write the answer the employee can send on WhatsApp" rows={3} />
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary">
                              <Upload className="h-4 w-4" /> {reply.image_url ? 'Change image' : 'Attach image'}
                              <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadReplyImage(index, e.target.files[0])} />
                            </label>
                            {reply.image_url && <span className="flex items-center gap-1 text-xs text-emerald-700"><ImageIcon className="h-3.5 w-3.5" /> Image attached</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < activeSteps.length ? (
            <Button type="button" onClick={nextStep} disabled={isSubmitting}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Draft'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          )}
          </div>
        </div>
      </form>
    </div>
  )
}
