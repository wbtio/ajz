'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Send, Clock, AlertCircle } from 'lucide-react'
import { submitContactForm } from './actions'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    related_id: '',
    related_title: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [relatedItems, setRelatedItems] = useState<{ id: string | number, title: string }[]>([])
  const [isFetchingItems, setIsFetchingItems] = useState(false)

  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (['event', 'sector', 'blog'].includes(formData.category)) {
        setIsFetchingItems(true)
        const supabase = createClient()
        if (formData.category === 'sector') {
          const { data, error } = await supabase
            .from('sectors')
            .select('id, name, name_ar')
            .order('created_at', { ascending: false })

          if (!error && data) {
            const formattedData = data.map((item) => ({
              id: item.id,
              title: isRTL ? (item.name_ar || item.name) : item.name,
            }))
            setRelatedItems(formattedData)
          }
        } else if (formData.category === 'event') {
          const { data, error } = await supabase
            .from('events')
            .select('id, title, title_ar')
            .order('created_at', { ascending: false })

          if (!error && data) {
            const formattedData = data.map((item) => ({
              id: item.id,
              title: isRTL ? (item.title_ar || item.title) : item.title,
            }))
            setRelatedItems(formattedData)
          }
        } else {
          const { data, error } = await supabase
            .from('posts')
            .select('id, title, title_ar')
            .eq('type', 'blog')
            .order('created_at', { ascending: false })

          if (!error && data) {
            const formattedData = data.map((item) => ({
              id: item.id,
              title: isRTL ? (item.title_ar || item.title) : item.title,
            }))
            setRelatedItems(formattedData)
          }
        }
        setIsFetchingItems(false)
      } else {
        setRelatedItems([])
        setFormData(prev => ({ ...prev, related_id: '', related_title: '' }))
      }
    }

    fetchRelatedItems()
  }, [formData.category, isRTL])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'related_id') {
      const selectedItem = relatedItems.find(item => String(item.id) === value)
      setFormData(prev => ({ 
        ...prev, 
        related_id: value,
        related_title: selectedItem ? selectedItem.title : ''
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const submissionData = new FormData()
    submissionData.append('name', formData.name)
    submissionData.append('email', formData.email)
    submissionData.append('phone', formData.phone)
    submissionData.append('subject', formData.subject)
    submissionData.append('category', formData.category)
    submissionData.append('related_id', formData.related_id)
    submissionData.append('related_title', formData.related_title)
    submissionData.append('message', formData.message)

    const result = await submitContactForm(submissionData)

    if (result.success) {
      setSuccess(true)
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        subject: '', 
        category: 'general', 
        related_id: '',
        related_title: '',
        message: '' 
      })
    } else {
      setError(result.error || (isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'))
    }
    
    setIsLoading(false)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: t.contact.address,
      details: isRTL ? ['بغداد، المنصور', 'شارع 14 رمضان'] : ['Baghdad, Al-Mansour', '14 Ramadan St'],
    },
    {
      icon: Phone,
      title: t.contact.phone,
      details: ['+964 771 234 5678', '+964 782 345 6789'],
    },
    {
      icon: Mail,
      title: t.contact.email,
      details: ['info@jaz.iq', 'support@jaz.iq'],
    },
    {
      icon: Clock,
      title: t.contact.workingHours,
      details: [t.contact.workingDays, t.contact.workingTime],
    },
  ]

  return (
    <div className="pt-36 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t.contact.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-gray-500 text-sm">{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {success ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t.contact.success}
                    </h3>
                    <p className="text-gray-500">
                      {t.contact.successMessage}
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setSuccess(false)}
                    >
                      {t.contact.sendAnother}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={t.contact.fullName}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label={t.contact.email}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={t.auth.phone}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {t.contact.category}
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="general">{t.contact.categories.general}</option>
                          <option value="event">{t.contact.categories.event}</option>
                          <option value="sector">{t.contact.categories.sector}</option>
                          <option value="blog">{t.contact.categories.blog}</option>
                          <option value="service">{t.contact.categories.service}</option>
                        </select>
                      </div>
                    </div>

                    {['event', 'sector', 'blog'].includes(formData.category) && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {formData.category === 'event' && t.contact.selectEvent}
                          {formData.category === 'sector' && t.contact.selectSector}
                          {formData.category === 'blog' && t.contact.selectBlog}
                        </label>
                        <select
                          name="related_id"
                          value={formData.related_id}
                          onChange={handleChange}
                          required
                          disabled={isFetchingItems}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                          {relatedItems.map(item => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <Input
                      label={t.contact.subject}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.contact.message}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t.contact.messagePlaceholder}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}

                    <Button type="submit" size="lg" isLoading={isLoading} className="w-full sm:w-auto h-12 px-8 rounded-xl">
                      <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t.contact.send}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
