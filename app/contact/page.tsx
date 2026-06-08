'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Send, AlertCircle } from 'lucide-react'
import { submitContactForm } from './actions'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import Aurora from '@/components/home/aurora'
import BlurText from '@/components/ui/blur-text'

export default function ContactPage() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const sectionRef = useRef<HTMLElement | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)
  const mapSectionRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])
  const heroGlowScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.08])

  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phoneCode: '+964',
    phoneNumber: '',
    subject: '',
    category: 'general',
    related_id: '',
    related_title: '',
    message: '',
    agree: false,
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
            .select('id, name_en, name_ar')
            .order('created_at', { ascending: false })

          if (!error && data) {
            const formattedData = data.map((item) => ({
              id: item.id,
              title: isRTL ? (item.name_ar || item.name_en) : item.name_en,
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
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'related_id') {
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
    if (!formData.agree) {
      setError(isRTL ? 'يجب الموافقة على سياسة الخصوصية والشروط والأحكام' : 'You must agree to the Privacy Policy and Terms & Conditions')
      return
    }

    setIsLoading(true)
    setError(null)

    const fullPhone = formData.phoneNumber ? `${formData.phoneCode} ${formData.phoneNumber}` : ''
    const messageBody = formData.organization 
      ? `[${isRTL ? 'المؤسسة / الشركة' : 'Organization / Company'}: ${formData.organization}]\n\n${formData.message}`
      : formData.message

    const submissionData = new FormData()
    submissionData.append('name', formData.name)
    submissionData.append('email', formData.email)
    submissionData.append('phone', fullPhone)
    submissionData.append('subject', formData.subject || (isRTL ? 'تواصل عام' : 'General Inquiry'))
    submissionData.append('category', formData.category)
    submissionData.append('related_id', formData.related_id)
    submissionData.append('related_title', formData.related_title)
    submissionData.append('message', messageBody)

    const result = await submitContactForm(submissionData)

    if (result.success) {
      setSuccess(true)
      setFormData({ 
        name: '', 
        organization: '',
        email: '', 
        phoneCode: '+964',
        phoneNumber: '', 
        subject: '', 
        category: 'general', 
        related_id: '',
        related_title: '',
        message: '',
        agree: false
      })
    } else {
      setError(result.error || (isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'))
    }
    
    setIsLoading(false)
  }

  const handleRequestCooperationClick = () => {
    setFormData(prev => ({
      ...prev,
      category: 'general',
      subject: isRTL ? 'طلب تعاون' : 'Cooperation Request'
    }))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      const nameInput = document.getElementById('contact-name')
      nameInput?.focus()
    }, 500)
  }

  const handleOfficeSelect = (office: 'baghdad' | 'basra' | 'erbil') => {
    let url = ''
    if (office === 'basra') {
      url = 'https://maps.app.goo.gl/eiyS4zMAsUqrZdg7A?g_st=awb'
    } else if (office === 'baghdad') {
      url = 'https://maps.google.com/?q=Al-Mansour+District,+Al-Nidhal+Street,+Baghdad,+Iraq'
    } else {
      url = 'https://maps.google.com/?q=Erbil+International+Fair+Complex,+60m+St,+Erbil,+Iraq'
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 26, 51, 0.85), rgba(0, 26, 51, 0.85)), url('https://lh3.googleusercontent.com/aida/AP1WRLvJwDtB9mrM-k7VNy6nJgxWBk-3iI_ShQeQRIcK0BSx34WJ0wqFCj3JUeh6IgfCVM6jT3PyRX14fhF1odTPIa5fbJDRcQv9pdvFcuzsw2C_ZrPiWpftHFtjvlW96h4u2_3AZlbneqVF0T22xkb6P_LvuJDm6J_SjdLXInG6hkFbo4GZ14TgbS9rbL2BuBuP1V1e3GtPZEQH_bRYRVBXSmVF0n5QPEW2-LYQQLDFtNKq8y9WbgwsdO6-pgE1-U4GnqcNbRBt0P5bhA')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
  }

  return (
    <div className="bg-jaz-gray-bg min-h-screen pb-16 font-sans text-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section
        ref={sectionRef}
        style={heroStyle}
        className="text-white pt-16 pb-24 px-6 md:px-12 lg:px-24 relative overflow-hidden"
      >
        {/* Animated Aurora overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none z-0">
          <Aurora
            className="absolute inset-0"
            colorStops={["#001a33", "#b08d4b", "#1e3a5f"]}
            amplitude={1.2}
            blend={0.6}
            speed={0.4}
          />
        </div>

        {/* Ambient Glow */}
        <motion.div
          style={{ scale: heroGlowScale }}
          className="absolute inset-x-[5%] top-0 h-[18rem] rounded-full bg-[radial-gradient(circle,rgba(176,141,75,0.06),transparent_65%)] blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={heroItemVariants} className="text-5xl font-bold mb-6">
              {t.contact.title}
            </motion.h1>
            
            <motion.div variants={heroItemVariants} className="mb-12">
              <BlurText
                text={t.contact.heroDescription}
                delay={20}
                animateBy="words"
                direction="top"
                className="max-w-2xl text-lg text-slate-300 leading-relaxed"
              />
            </motion.div>

            {/* Action Cards Grid */}
            <motion.div variants={heroItemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Request Cooperation */}
              <div
                onClick={handleRequestCooperationClick}
                className="action-card flex items-center justify-between p-6 bg-jaz-gold bg-opacity-90 rounded-jaz border border-jaz-gold/50 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4 text-start">
                  <div className="bg-white/10 p-3 rounded-jaz shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.contact.cooperationTitle}</h3>
                    <p className="text-sm text-white/80">{t.contact.cooperationDesc}</p>
                  </div>
                </div>
                <svg className={`w-6 h-6 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>

              {/* Request Invitation Support */}
              <Link
                href="/invitation-support"
                className="action-card flex items-center justify-between p-6 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-4 text-start">
                  <div className="bg-white/10 p-3 rounded-jaz shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.contact.invitationTitle}</h3>
                    <p className="text-sm text-white/80">{t.contact.invitationDesc}</p>
                  </div>
                </div>
                <svg className={`w-6 h-6 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>

              {/* Become a Partner in Iraq */}
              <Link
                href="/partners"
                className="action-card flex items-center justify-between p-6 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-4 text-start">
                  <div className="bg-white/10 p-3 rounded-jaz shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.contact.partnerTitle}</h3>
                    <p className="text-sm text-white/80">{t.contact.partnerDesc}</p>
                  </div>
                </div>
                <svg className={`w-6 h-6 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 -mt-10 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-30">
        {/* Form Column */}
        <div ref={formRef} className="lg:col-span-7 bg-white p-6 rounded-jaz shadow-sm border border-slate-100 text-start">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-jaz-navy mb-1.5">{t.contact.sendUsMessage}</h2>
            <p className="text-slate-500 text-xs">{t.contact.formSubtitle}</p>
          </header>

          {success ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t.contact.success}
              </h3>
              <p className="text-slate-500 max-w-md text-sm">
                {t.contact.successMessage}
              </p>
              <button
                className="mt-6 h-11 px-6 rounded-jaz hover:bg-jaz-navy hover:text-white border border-slate-200 text-jaz-navy font-semibold transition-all duration-200"
                onClick={() => setSuccess(false)}
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.contact.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3"
                    placeholder={isRTL ? "أدخل الاسم الكامل" : "Enter your full name"}
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.contact.organization} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                    className="w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3"
                    placeholder={isRTL ? "أدخل اسم المؤسسة أو الشركة" : "Enter your organization or company"}
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.contact.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3"
                    placeholder="name@domain.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.contact.phone}
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="phoneCode"
                      value={formData.phoneCode}
                      onChange={handleChange}
                      className="w-32 rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3"
                    >
                      <option value="+964">+964</option>
                      <option value="+965">+965</option>
                      <option value="+968">+968</option>
                      <option value="+971">+971</option>
                      <option value="+33">+33</option>
                    </select>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="flex-1 rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3"
                      placeholder="7XX XXX XXXX"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.contact.subject} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3 ${!formData.subject ? 'text-slate-400' : 'text-slate-900'}`}
                  >
                    <option value="">{isRTL ? "اختر موضوع الرسالة" : "Select a subject"}</option>
                    <option value="Cooperation Request">{isRTL ? "طلب تعاون" : "Cooperation Request"}</option>
                    <option value="Sponsorship & Events">{isRTL ? "رعاية وفعاليات" : "Sponsorship & Events"}</option>
                    <option value="Visa & Invitations">{isRTL ? "تأشيرات ودعوات" : "Visa & Invitations"}</option>
                    <option value="General Inquiry">{isRTL ? "استفسار عام" : "General Inquiry"}</option>
                    <option value="Other">{isRTL ? "أخرى" : "Other"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.contact.category} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3 text-slate-900"
                  >
                    <option value="general">{t.contact.categories.general}</option>
                    <option value="event">{t.contact.categories.event}</option>
                    <option value="sector">{t.contact.categories.sector}</option>
                    <option value="service">{t.contact.categories.service}</option>
                  </select>
                </div>
              </div>

              {['event', 'sector'].includes(formData.category) && (
                <div className="space-y-1 text-start">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {formData.category === 'event' && t.contact.selectEvent}
                    {formData.category === 'sector' && t.contact.selectSector}
                  </label>
                  <select
                    name="related_id"
                    value={formData.related_id}
                    onChange={handleChange}
                    required
                    disabled={isFetchingItems}
                    className="w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3 bg-white"
                  >
                    <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                    {relatedItems.map(item => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.contact.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full rounded-jaz border-slate-300 focus:border-jaz-navy focus:ring-jaz-navy text-sm p-3"
                  placeholder={t.contact.messagePlaceholder}
                  rows={4}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-jaz flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <label className="flex items-center gap-3 text-sm text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    required
                    className="rounded border-slate-300 text-jaz-navy focus:ring-jaz-navy"
                  />
                  <span>
                    {isRTL ? (
                      <>
                        أوافق على <Link href="/privacy" className="underline hover:text-jaz-navy">سياسة الخصوصية</Link> و <Link href="/terms" className="underline hover:text-jaz-navy">الشروط والأحكام</Link>.
                      </>
                    ) : (
                      <>
                        I agree to the <Link href="/privacy" className="underline hover:text-jaz-navy">Privacy Policy</Link> and <Link href="/terms" className="underline hover:text-jaz-navy">Terms & Conditions</Link>.
                      </>
                    )}
                  </span>
                </label>
                <button
                  disabled={isLoading}
                  className="bg-jaz-navy text-white px-8 py-3 rounded-jaz hover:bg-jaz-blue-accent transition-colors flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 shrink-0" />
                  )}
                  {t.contact.send}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Offices Column */}
        <div className="lg:col-span-5 text-start">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-jaz-navy mb-2">{t.contact.ourOffices}</h2>
          </header>
          <div className="space-y-4">
            {/* Basra Office */}
            <article
              onClick={() => handleOfficeSelect('basra')}
              className="bg-white rounded-jaz border border-slate-100 overflow-hidden shadow-sm transition-all duration-300 cursor-pointer hover:border-slate-200 hover:shadow-md"
              data-purpose="office-card"
            >
              <div className="w-full h-24 relative">
                <Image
                  alt="Basra Office View"
                  className="object-cover"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLs-jZ2Dd5ZFJWhxbFEwf6t-22X4dBGg33GW-22Uc28nP3LmcPGmYBFEdsTnXutWhoGMCZ2qYlolEFOPjT5FyHyMf9HqF6gSy8Sw0G2vDI06-A0N9Xhd-cuPkUa8Ryl3S6PRxD3LakXkHUu3GZpzMgzU8Y-Vfn7kFFixIs2Pleu8UjHJhQiu-GnRjPvxyMF4DGLUO1tuIT43wsnJrJV20AM42OeG9R9qs1FQQ6duD4GXBIm6_zGvCfaW5C4"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-jaz-navy shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-jaz-navy mb-0.5 text-base">{t.contact.basraOffice}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{t.contact.basraAddress}</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Baghdad Office */}
            <article
              onClick={() => handleOfficeSelect('baghdad')}
              className="bg-white rounded-jaz border border-slate-100 overflow-hidden shadow-sm transition-all duration-300 cursor-pointer hover:border-slate-200 hover:shadow-md"
              data-purpose="office-card"
            >
              <div className="w-full h-24 relative">
                <Image
                  alt="Baghdad Office View"
                  className="object-cover"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsHzFZ5l4G2iwOi4VM0XECrvBWyZhV6lEmKYkurbW-7sfAS9riMpJZrV_q4uTplwieXS0UdxGyjpuKoS4wVSmJw2UZAIQN-bFJwugyu6CixU4-hFDXTcUzOAFTv0Djq8NwLGUgNk7RHFuFZoNMQfNptw4D8OmS1WT37rNYBKcyNAqyRs8v7Kuob7GZKvHJBHjJO0FiRy2HYXTlDhb5aVtDFqeoETPsrddOCkPRAAbh2d4GCq1nk_iXJDw"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-jaz-navy shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-jaz-navy mb-0.5 text-base">{t.contact.baghdadOffice}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{t.contact.baghdadAddress}</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Erbil Office */}
            <article
              onClick={() => handleOfficeSelect('erbil')}
              className="bg-white rounded-jaz border border-slate-100 overflow-hidden shadow-sm transition-all duration-300 cursor-pointer hover:border-slate-200 hover:shadow-md"
              data-purpose="office-card"
            >
              <div className="w-full h-24 relative">
                <Image
                  alt="Erbil Office View"
                  className="object-cover"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLu4VC4PMLvWTW4_QuhoOyOmfamAaD8pY6Gdo2OtHSOuEUEGHRUxk6HRD3AF8jnJG_gvjwaI5q6vBblyYirxgomzzvsAcz9H0VwhSggb-g71ptNkHch1NrSrOLqTJnA1yc6kahgInVai80I6QyQOoxrZkz7Em2MdyS7tS8Fup3yAopZND-buS-aJA0nqB-1S6OKqZFACpj-OXhwDSQUCyCgyLrNmGDGqUnoIQOai-4FpIAIqoX1sieyOS44"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-jaz-navy shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-jaz-navy mb-0.5 text-base">{t.contact.erbilOffice}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{t.contact.erbilAddress}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Other Ways Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-16 text-start">
        <h2 className="text-2xl font-bold text-jaz-navy mb-8">{t.contact.otherWaysTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Call Us */}
          <a href="tel:+9647701112444" className="bg-white p-6 rounded-jaz border border-slate-100 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
            <div className="bg-jaz-navy p-3 rounded-full text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-jaz-navy text-sm">{t.contact.callUs}</h4>
              <p className="text-jaz-navy font-semibold text-xs mt-0.5">+964 770 111 2444</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.contact.callUsDesc}</p>
            </div>
          </a>

          {/* Email Us */}
          <a href="mailto:info@jaz-iq.com" className="bg-white p-6 rounded-jaz border border-slate-100 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
            <div className="bg-jaz-navy p-3 rounded-full text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-jaz-navy text-sm">{t.contact.emailUs}</h4>
              <p className="text-jaz-navy font-semibold text-xs mt-0.5">info@jaz-iq.com</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.contact.emailUsDesc}</p>
            </div>
          </a>

          {/* Website */}
          <a href="https://www.jaz-iq.com" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-jaz border border-slate-100 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
            <div className="bg-jaz-navy p-3 rounded-full text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-jaz-navy text-sm">{t.contact.visitWebsite}</h4>
              <p className="text-jaz-navy font-semibold text-xs mt-0.5">www.jaz-iq.com</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.contact.visitWebsiteDesc}</p>
            </div>
          </a>

          {/* LinkedIn */}
          <a href="https://www.linkedin.com/company/jaz" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-jaz border border-slate-100 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
            <div className="bg-jaz-navy p-3 rounded-full text-white shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-jaz-navy text-sm">{t.contact.connectLinkedIn}</h4>
              <p className="text-jaz-navy font-semibold text-xs mt-0.5">JAZ - Joint Annual Zone</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.contact.connectLinkedInDesc}</p>
            </div>
          </a>
        </div>
      </section>

      {/* Map Section */}
      <section ref={mapSectionRef} className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-24 text-start">
        <h2 className="text-2xl font-bold text-jaz-navy mb-6">{t.contact.ourLocation}</h2>

        <div className="w-full bg-white rounded-jaz border border-slate-100 overflow-hidden shadow-sm p-2">
          {/* Map IFrame */}
          <div className="w-full h-[450px] bg-slate-200 rounded-jaz overflow-hidden relative">
            <iframe
              src="https://maps.google.com/maps?q=30.505715,47.830616&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Basra Office Location Map"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
