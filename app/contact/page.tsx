'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Send, Clock, AlertCircle } from 'lucide-react'
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
      details: isRTL
        ? ['البصرة', 'بغداد', 'أربيل']
        : ['Basra', 'Baghdad', 'Erbil'],
    },
    {
      icon: Phone,
      title: t.contact.phone,
      details: ['+964 771 900 0600'],
    },
    {
      icon: Mail,
      title: t.contact.email,
      details: ['contact@jaz.iq'],
    },
    {
      icon: Clock,
      title: t.contact.workingHours,
      details: [t.contact.workingDays, t.contact.workingTime],
    },
  ]

  return (
    <div className="bg-white min-h-screen pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section - Matching Premium Design */}
      <motion.section
        ref={sectionRef}
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={locale}
        className="relative z-20 flex flex-col justify-between bg-[#0b1426] text-white pt-24 pb-8 sm:pt-26 lg:pt-28 sm:pb-10 lg:pb-12 overflow-hidden mb-12"
      >
        {/* Aurora dynamic animated background with readability overlays */}
        <div className="absolute inset-0 overflow-hidden">
          <Aurora
            className="absolute inset-0"
            colorStops={["#052511", "#8B0000", "#0b1426"]}
            amplitude={1.2}
            blend={0.6}
            speed={0.4}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,38,0.75)_0%,rgba(11,20,38,0.55)_35%,rgba(11,20,38,0.35)_65%,#0b1426_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.05),transparent_36%),radial-gradient(circle_at_72%_34%,rgba(139,0,0,0.08),transparent_30%),radial-gradient(circle_at_18%_26%,rgba(22,163,74,0.06),transparent_26%)]" />

          {/* Contact Banner Background Image Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.12] md:opacity-[0.18] pointer-events-none select-none transition-all duration-700"
            style={{
              backgroundImage: "url('/contact-banner.png')",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />

          <motion.div
            style={{ scale: heroGlowScale }}
            className="absolute inset-x-[5%] top-0 h-[18rem] rounded-full bg-[radial-gradient(circle,rgba(139,0,0,0.06),transparent_65%)] blur-3xl"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(22,163,74,0.04),transparent_45%)]" />
          <motion.div
            animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15], scaleX: [0.92, 1.08, 0.92] }}
            transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-[12%] bottom-[30%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
          <div className="home-grid-transition absolute inset-x-0 bottom-0 h-[19rem] opacity-40" />
          <div className="absolute bottom-[-5.5rem] left-1/2 h-[12rem] w-[min(120%,88rem)] -translate-x-1/2 rounded-[100%] bg-white/5 blur-3xl" />
        </div>

        <Container className="relative max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full flex justify-start">
          <div className="flex flex-col items-start justify-start w-full text-start">
            {/* Text Content */}
            <motion.div
              style={{ y: contentY, opacity: contentOpacity }}
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 sm:mt-10 lg:mt-14 flex w-full max-w-2xl lg:max-w-3xl flex-col items-start text-start"
            >
              {/* Main Title */}
              <motion.div variants={heroItemVariants} className="mb-4">
                <h1 className="font-black tracking-[-0.04em] text-white text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] drop-shadow-[0_4px_24px_rgba(255,255,255,0.08)]">
                  {t.contact.title}
                </h1>
              </motion.div>

              {/* Description */}
              <motion.div variants={heroItemVariants} className="w-full">
                <motion.div
                  whileInView={shouldReduceMotion ? undefined : { opacity: [0.75, 1, 0.85, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.4 }}
                >
                  <BlurText
                    text={t.contact.subtitle}
                    delay={80}
                    animateBy="words"
                    direction="top"
                    className={`text-start text-navy-200/90 ${
                      isRTL
                        ? "max-w-2xl text-[1.04rem] leading-[2.05] sm:text-[1.15rem] md:text-[1.3rem]"
                        : "max-w-xl text-base leading-relaxed sm:text-lg md:text-xl"
                    }`}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </motion.section>

      {/* Main Form & Contact details container */}
      <Container className="max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-stretch">
          {/* Contact Info */}
          <div className="flex flex-col gap-6 lg:h-full">
            {contactInfo.map((item) => (
              <Card key={item.title} className="lg:flex-1 lg:flex lg:flex-col border-slate-100 group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 flex flex-1 items-start gap-4 text-start">
                  <div className="p-3 bg-[#8b0000]/10 rounded-lg text-[#8b0000] transition-transform duration-300 group-hover:scale-110">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 mb-1 group-hover:text-[#8b0000] transition-colors duration-300">{item.title}</h3>
                    {item.icon === MapPin ? (
                      <div className="flex flex-col gap-1.5 mt-2">
                        {/* Iraq group */}
                        <div>
                          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{isRTL ? 'العراق' : 'Iraq'}</p>
                          <div className="mt-1 flex flex-col gap-1 ps-2">
                            {item.details.map((city, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b0000]" />
                                <span className="text-sm text-gray-500 font-medium">{city}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* France group */}
                        <div className="mt-1">
                          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{isRTL ? 'فرنسا' : 'France'}</p>
                          <div className="mt-1 flex items-center gap-1.5 ps-2">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b0000]" />
                            <a href="https://jazexpo.fr/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8b0000] font-semibold hover:underline">
                              {isRTL ? 'باريس' : 'Paris'}
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex flex-col gap-1">
                        {item.details.map((detail, i) => (
                          <p key={i} className="text-gray-500 text-sm font-medium">{detail}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 lg:flex lg:flex-col lg:h-full">
            <Card className="lg:h-full lg:flex lg:flex-col border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 lg:flex-1 lg:flex lg:flex-col">
                {success ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t.contact.success}
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      {t.contact.successMessage}
                    </p>
                    <Button
                      className="mt-6 h-11 px-6 rounded-xl hover:bg-[#8b0000]/5 hover:text-[#8b0000] border-slate-200"
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
                        className="rounded-xl border-slate-200 focus-visible:ring-[#8b0000]"
                      />
                      <Input
                        label={t.contact.email}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="rounded-xl border-slate-200 focus-visible:ring-[#8b0000]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={t.auth.phone}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="rounded-xl border-slate-200 focus-visible:ring-[#8b0000]"
                      />
                      <div className="space-y-1 text-start">
                        <label className="block text-sm font-semibold text-gray-700">
                          {t.contact.category}
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] bg-white text-sm font-medium h-10 transition-all duration-200"
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
                        <label className="block text-sm font-semibold text-gray-700">
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
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] bg-white text-sm font-medium h-10 transition-all duration-200"
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
                      className="rounded-xl border-slate-200 focus-visible:ring-[#8b0000]"
                    />

                    <div className="text-start">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {t.contact.message}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] text-sm transition-all duration-200"
                        placeholder={t.contact.messagePlaceholder}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-start">
                      <Button type="submit" size="lg" isLoading={isLoading} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#8b0000] hover:bg-[#6b0000] text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md active:scale-95 font-bold">
                        <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t.contact.send}
                      </Button>
                    </div>
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
