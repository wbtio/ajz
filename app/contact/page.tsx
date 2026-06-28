'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Send, AlertCircle } from 'lucide-react'
import { submitContactForm } from './actions'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import Aurora from '@/components/home/aurora'
import BlurText from '@/components/ui/blur-text'
import { Container } from '@/components/ui/container'
import { SectionHeader } from '@/components/home'

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
    <div className="bg-white min-h-screen font-sans text-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section
        ref={sectionRef}
        style={heroStyle}
        className="text-white pt-24 md:pt-28 pb-20 px-6 md:px-12 lg:px-24 relative overflow-hidden"
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
            <motion.h1 variants={heroItemVariants} className="text-5xl font-bold mb-4">
              {t.contact.title}
            </motion.h1>
            
            <motion.div variants={heroItemVariants} className="mb-6">
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
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-gold bg-opacity-90 rounded-jaz border border-jaz-gold/50 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.contact.cooperationTitle}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>

              {/* Request Invitation Support */}
              <Link
                href="/invitation-support"
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.contact.invitationTitle}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>

              {/* Become a Partner in Iraq */}
              <Link
                href="/partnership"
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.contact.partnerTitle}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid Content — white band */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form */}
            <div ref={formRef} className="lg:col-span-7 text-start">
              <SectionHeader title={t.contact.sendUsMessage} subtitle={t.contact.formSubtitle} />

              <div className="mt-8">
                {success ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-[#8B0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                      className="mt-6 h-11 px-6 rounded-md hover:bg-[#8B0000] hover:text-white border border-slate-300 text-slate-700 font-semibold transition-all duration-200"
                      onClick={() => setSuccess(false)}
                    >
                      {t.contact.sendAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t.contact.fullName} <span className="text-[#8B0000]">*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200"
                          placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t.contact.organization} <span className="text-[#8B0000]">*</span>
                        </label>
                        <input
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          required
                          className="w-full rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200"
                          placeholder={isRTL ? "المؤسسة / الشركة" : "Organization / Company"}
                          type="text"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t.contact.email} <span className="text-[#8B0000]">*</span>
                        </label>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200"
                          placeholder="name@domain.com"
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t.contact.phone}
                        </label>
                        <div className="flex gap-2">
                          <select
                             name="phoneCode"
                             value={formData.phoneCode}
                             onChange={handleChange}
                             className="w-32 rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200"
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
                            className="flex-1 rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200"
                            placeholder="7XX XXX XXXX"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t.contact.subject} <span className="text-[#8B0000]">*</span>
                      </label>
                      <select
                        name="inquiryType"
                        value={
                          formData.category === 'event' ? 'event' :
                          formData.category === 'sector' ? 'sector' :
                          formData.category === 'service' ? 'service' :
                          formData.subject === 'Cooperation Request' ? 'cooperation' :
                          formData.subject === 'Visa & Invitations' ? 'visa' :
                          formData.subject === 'Other' ? 'other' :
                          formData.subject ? 'general' : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value
                          let subject = 'General Inquiry'
                          let category = 'general'

                          switch (val) {
                            case 'general':
                              subject = 'General Inquiry'
                              category = 'general'
                              break
                            case 'cooperation':
                              subject = 'Cooperation Request'
                              category = 'general'
                              break
                            case 'event':
                              subject = 'Sponsorship & Events'
                              category = 'event'
                              break
                            case 'sector':
                              subject = 'Strategic Division Inquiry'
                              category = 'sector'
                              break
                            case 'visa':
                              subject = 'Visa & Invitations'
                              category = 'general'
                              break
                            case 'service':
                              subject = 'Service Request'
                              category = 'service'
                              break
                            case 'other':
                              subject = 'Other'
                              category = 'general'
                              break
                          }

                          setFormData(prev => ({
                            ...prev,
                            subject,
                            category,
                            related_id: '',
                            related_title: ''
                          }))
                        }}
                        required
                        className="w-full rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200 text-slate-900"
                      >
                        <option value="">{isRTL ? "اختر سبب الاستفسار..." : "Select reason for inquiry..."}</option>
                        <option value="general">{isRTL ? "استفسار عام" : "General Inquiry"}</option>
                        <option value="cooperation">{isRTL ? "طلب تعاون" : "Cooperation Request"}</option>
                        <option value="event">{isRTL ? "رعاية وفعاليات (مؤتمر / معرض)" : "Sponsorship & Events (Conference / Exhibition)"}</option>
                        <option value="sector">{isRTL ? "استفسار عن قسم استراتيجي" : "Strategic Division Inquiry"}</option>
                        <option value="visa">{isRTL ? "طلب دعم التأشيرات والدعوات" : "Visa & Invitation Support"}</option>
                        <option value="service">{isRTL ? "طلب خدمة تنظيم" : "Service / Organizing Request"}</option>
                        <option value="other">{isRTL ? "أخرى" : "Other"}</option>
                      </select>
                    </div>

                    {['event', 'sector'].includes(formData.category) && (
                      <div className="space-y-1 text-start">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {formData.category === 'event' && t.contact.selectEvent}
                          {formData.category === 'sector' && t.contact.selectSector}
                        </label>
                        <select
                          name="related_id"
                          value={formData.related_id}
                          onChange={handleChange}
                          required
                          disabled={isFetchingItems}
                          className="w-full rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-white transition-all duration-200"
                        >
                          <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                          {relatedItems.map(item => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t.contact.message} <span className="text-[#8B0000]">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full rounded-none border-b border-t-0 border-x-0 border-slate-300 focus:border-[#8B0000] focus:ring-0 text-sm p-3 bg-transparent transition-all duration-200"
                        placeholder={t.contact.messagePlaceholder}
                        rows={4}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 border-l-2 border-[#8B0000] flex items-center gap-3">
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
                          className="rounded border-slate-300 text-[#8B0000] focus:ring-[#8B0000]"
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
                        className="bg-[#001a33] text-white px-8 py-3 rounded-md border border-[#001a33] hover:bg-[#8B0000] hover:border-[#8B0000] transition-colors flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed"
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
            </div>

            {/* Offices */}
            <div className="lg:col-span-5 lg:border-s lg:border-slate-200/70 lg:ps-8 text-start">
              <SectionHeader title={t.contact.ourOffices} subtitle={t.contact.officesSubtitle} />

              <div className="flex flex-col gap-4 mt-8">
                <article
                  onClick={() => handleOfficeSelect('basra')}
                  className="group bg-white p-4 rounded-2xl border border-slate-200/70 flex items-center gap-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                >
                  <div className="w-24 h-20 relative shrink-0 rounded-xl overflow-hidden border border-slate-200/50">
                    <Image
                      alt="Basra Office View"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      src="/images/basra-office.png"
                      fill
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#8B0000] transition-colors">{t.contact.basraOffice}</h3>
                  </div>
                </article>

                <article
                  onClick={() => handleOfficeSelect('baghdad')}
                  className="group bg-white p-4 rounded-2xl border border-slate-200/70 flex items-center gap-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                >
                  <div className="w-24 h-20 relative shrink-0 rounded-xl overflow-hidden border border-slate-200/50">
                    <Image
                      alt="Baghdad Office View"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      src="/images/baghdad-office.png"
                      fill
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#8B0000] transition-colors">{t.contact.baghdadOffice}</h3>
                  </div>
                </article>

                <article
                  onClick={() => handleOfficeSelect('erbil')}
                  className="group bg-white p-4 rounded-2xl border border-slate-200/70 flex items-center gap-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                >
                  <div className="w-24 h-20 relative shrink-0 rounded-xl overflow-hidden border border-slate-200/50">
                    <Image
                      alt="Erbil Office View"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      src="/images/erbil-office.png"
                      fill
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#8B0000] transition-colors">{t.contact.erbilOffice}</h3>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Other Ways Section — platinum band */}
      <section className="bg-[#f5f7fa] py-16 lg:py-24">
        <Container>
          <SectionHeader title={t.contact.otherWaysTitle} subtitle={t.contact.otherWaysSubtitle} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 mt-10 lg:mt-12">
            {/* Call Us */}
            <a href="tel:+9647719000600" className="group bg-white p-5 rounded-2xl border border-slate-200/70 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
              <div className="bg-[#8B0000]/5 group-hover:bg-[#8B0000]/10 p-2.5 rounded-xl text-[#8B0000] shrink-0 transition-colors">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{t.contact.callUs}</h4>
                <p className="text-slate-900 font-extrabold text-sm mt-0.5">+964 771 900 0600</p>
                <p className="text-[10px] text-slate-400 mt-1">{t.contact.callUsDesc}</p>
              </div>
            </a>

            {/* Email Us */}
            <a href="mailto:info@jaz.iq" className="group bg-white p-5 rounded-2xl border border-slate-200/70 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
              <div className="bg-[#8B0000]/5 group-hover:bg-[#8B0000]/10 p-2.5 rounded-xl text-[#8B0000] shrink-0 transition-colors">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{t.contact.emailUs}</h4>
                <p className="text-slate-900 font-extrabold text-sm mt-0.5">info@jaz.iq</p>
                <p className="text-[10px] text-slate-400 mt-1">{t.contact.emailUsDesc}</p>
              </div>
            </a>

            {/* LinkedIn */}
            <a href="https://www.linkedin.com/company/jaz" target="_blank" rel="noopener noreferrer" className="group bg-white p-5 rounded-2xl border border-slate-200/70 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
              <div className="bg-[#8B0000]/5 group-hover:bg-[#8B0000]/10 p-2.5 rounded-xl text-[#8B0000] shrink-0 transition-colors">
                <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{t.contact.connectLinkedIn}</h4>
                <p className="text-slate-900 font-extrabold text-sm mt-0.5">JAZ - Joint Annual Zone</p>
                <p className="text-[10px] text-slate-400 mt-1">{t.contact.connectLinkedInDesc}</p>
              </div>
            </a>
          </div>
        </Container>
      </section>

      {/* Map Section — white band */}
      <section ref={mapSectionRef} className="bg-white py-16 lg:py-24 text-start">
        <Container>
          <SectionHeader title={t.contact.ourLocation} subtitle={t.contact.ourLocationSubtitle} />

          <div className="w-full bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm p-2 mt-10 lg:mt-12">
            {/* Map IFrame */}
            <div className="w-full h-[450px] bg-slate-200 rounded-xl overflow-hidden relative">
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
        </Container>
      </section>
    </div>
  )
}
