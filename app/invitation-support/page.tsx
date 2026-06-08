'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Mail, Phone, ArrowUpRight, HelpCircle, ChevronDown, Award } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function InvitationSupportPage() {
  const { locale, dir } = useI18n()
  const isRTL = locale === 'ar'

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    company: '',
    phone: '',
    email: '',
    eventName: '',
    eventDate: '',
    eventLocation: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // FAQ Expand State
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate Server Request
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      // Reset form
      setFormData({
        fullName: '',
        designation: '',
        company: '',
        phone: '',
        email: '',
        eventName: '',
        eventDate: '',
        eventLocation: '',
        message: '',
      })
    }, 1500)
  }

  // Bilingual translation dictionary
  const pageContent = isRTL
    ? {
        heroTitle: 'خطابات الدعوات والتسجيل للفعاليات',
        heroDesc: 'نحن نقدم خدمات متكاملة لإصدار خطابات الدعوة الرسمية والمساعدة في التسجيل ودعم الوثائق للمندوبين والشركات والمؤسسات العراقية لتمكينهم من المشاركة في كبرى المعارض والمؤتمرات التجارية العالمية.',
        btnRequest: 'طلب دعم الدعوات',
        btnEvents: 'استكشف الفعاليات القادمة',
        stats: [
          { value: '+10', label: 'سنوات خبرة' },
          { value: 'البصرة • بغداد • أربيل', label: 'نربط العراق بالعالم' },
          { value: '500+', label: 'دعوة تصدر سنوياً' },
          { value: '80+', label: 'دولة متصلة' },
          { value: '1000+', label: 'مندوب وشريك راضٍ' },
        ],
        howItWorksTitle: 'كيف نعمل',
        howItWorksSteps: [
          { title: 'تقديم الطلب الإلكتروني', desc: 'املأ نموذج طلب دعم الدعوة بالمعلومات الشخصية وتفاصيل الفعالية التي ترغب بحضورها.' },
          { title: 'مراجعة وتدقيق الملف', desc: 'يقوم فريق التنسيق لدينا بمراجعة مستنداتك والتحقق من تفاصيل المشاركة وصلاحيتها.' },
          { title: 'إصدار خطاب الدعوة', desc: 'نقوم بالتنسيق مع الجهة المنظمة لإصدار خطاب الدعوة الرسمي وتوقيعه وإرساله إليك.' },
          { title: 'التسجيل والتنسيق اللوجستي', desc: 'نقدم لك الدعم الكامل لحجز المواعيد، وتأكيد التسجيل، وتنسيق الإيفاد بالكامل.' },
        ],
        docsTitle: 'المستندات المطلوبة',
        docsSubtitle: 'يرجى تجهيز نسخ واضحة من الوثائق التالية:',
        docsList: [
          'نسخة ملونة من جواز السفر (صالح لمدة 6 أشهر على الأقل)',
          'الملف التعريفي للشركة أو المؤسسة الوطنية',
          'خطاب ترشيح رسمي من جهة العمل',
          'إثبات المسمى والصفة الوظيفية للمرشح',
          'نسخة من البطاقة الوطنية الموحدة أو الهوية الشخصية',
          'صورة شخصية حديثة بخلفية بيضاء',
          'تفاصيل الفعالية (اسم المعرض، التاريخ، مكان الانعقاد)',
          'أي وثائق إضافية يطلبها المنظمون أو السفارة المعنية',
        ],
        docsNote: 'تُعامل جميع الوثائق والمستندات بسرية وأمان تامين، وتُستخدم حصرياً لأغراض إصدار الدعوات.',
        benefitsTitle: 'مزايا الدعم الذي نقدمه',
        benefitsList: [
          { title: 'خطابات دعوة رسمية ومعتمدة', desc: 'تسهل قبول طلبك لدى منظمي الفعاليات والبعثات الدبلوماسية المختلفة.' },
          { title: 'زيادة فرص القبول', desc: 'تُعد خطاباتنا بمعايير احترافية تعزز قبول طلبات الحصول على التأشيرات.' },
          { title: 'توفير الوقت والتكلفة', desc: 'نتحمل عنك الأعباء الإدارية والتواصل المباشر مع المنظمين لتركز على أهدافك.' },
          { title: 'وصول مباشر للفعاليات', desc: 'نضمن لك حجز المقاعد، والوصول إلى المعارض، واللقاءات الثنائية (B2B).' },
          { title: 'متابعة وتنسيق متواصلين', desc: 'يظل فريقنا معك قبل الفعالية وأثناء انعقادها لتقديم المساعدة اللازمة.' },
        ],
        faqTitle: 'الأسئلة الشائعة',
        faqItems: [
          { q: 'كم من الوقت يستغرق استلام خطاب الدعوة؟', a: 'يستغرق إصدار وتصديق خطاب الدعوة عادةً بين 3 إلى 7 أيام عمل، حسب نوع الفعالية والجهة المستضيفة.' },
          { q: 'من هم المؤهلون لطلب دعم الدعوات؟', a: 'الخدمة متاحة لرجال الأعمال، وممثلي الهيئات الحكومية والوزارات، والأكاديميين، والمهنيين الطبيين، والوفود الصناعية والطلاب.' },
          { q: 'هل معلوماتي الشخصية والمهنية بأمان؟', a: 'نعم، نلتزم بحماية الخصوصية بصرامة. لا يتم مشاركة البيانات إلا مع منظمي الفعالية الرسميين والجهات المعنية فقط.' },
          { q: 'هل تقدم جاز دعماً لدفع رسوم التسجيل؟', a: 'تساعد جاز في إجراء التسجيل والحصول على خصومات الوفود الممنوحة من الشركاء، ولكن الرسوم تُدفع من قبل المشارك مباشرة.' },
          { q: 'هل تضمن جاز حصولي على فيزا السفر؟', a: 'نحن نقدم المستندات الثبوتية والخطابات الداعمة التي تزيد فرصة القبول بدرجة كبيرة، لكن القرار النهائي يعود للقسم القنصلي بالسفارة المعنية.' },
          { q: 'ماذا يحدث إذا تطلبت الفعالية وثائق إضافية؟', a: 'سيتواصل معك فريق التنسيق لدينا لتوجيهك حول أي مستندات إضافية مطلوبة وتسهيل استيفائها بالكامل.' },
        ],
        formTitle: 'نموذج طلب دعم الدعوات والتسجيل',
        formDesc: 'يرجى ملء البيانات بدقة لتمكين فريقنا من بدء المعاملة:',
        formName: 'الاسم الكامل المكتوب في جواز السفر *',
        formDesignation: 'المسمى الوظيفي / الصفة *',
        formCompany: 'اسم المؤسسة / الشركة *',
        formPhone: 'رقم هاتف التواصل (موبايل) *',
        formEmail: 'البريد الإلكتروني (المؤسسي إن وجد) *',
        formEventName: 'اسم الفعالية أو المعرض المستهدف *',
        formEventDate: 'تاريخ انعقاد الفعالية *',
        formEventLocation: 'الموقع (المدينة والدولة المستضيفة) *',
        formMessage: 'تفاصيل إضافية أو ملاحظات خاصة',
        formConfirm: 'أؤكد أن المعلومات المدونة صحيحة ومطابقة لجواز السفر.',
        formSubmit: 'إرسال طلب الدعم',
        formSubmitting: 'جاري إرسال طلبك...',
        formSuccessTitle: 'تم إرسال طلبك بنجاح!',
        formSuccessDesc: 'شكراً لاهتمامك. سيقوم فريق التنسيق والوفود في جاز بمراجعة طلبك والتواصل معك خلال 48 ساعة.',
        footerTitle: 'هل تحتاج إلى مساعدة إضافية؟',
        footerDesc: 'فريق التنسيق والوفود لدينا جاهز للإجابة على استفساراتك وتسهيل مشاركتك.',
        footerCall: 'اتصل بنا',
        footerEmail: 'البريد الإلكتروني',
      }
    : {
        heroTitle: 'Invitation & Registration Support',
        heroDesc: 'We provide end-to-end invitation letter services, event registration assistance, and documentation support for Iraqi delegates, organizations, and institutions to participate in leading international exhibitions, conferences, and trade events worldwide.',
        btnRequest: 'Request Invitation Support',
        btnEvents: 'Explore Upcoming Events',
        stats: [
          { value: '+10', label: 'Years Experience' },
          { value: 'Basra • Baghdad • Erbil', label: 'Connecting the World' },
          { value: '500+', label: 'Invitations Issued Annually' },
          { value: '80+', label: 'Countries Connected' },
          { value: '1000+', label: 'Satisfied Delegates & Partners' },
        ],
        howItWorksTitle: 'How It Works',
        howItWorksSteps: [
          { title: 'Submit Your Request', desc: 'Fill out the invitation support form with your personal details and event information.' },
          { title: 'Document Review', desc: 'Our coordination team reviews your documents and validates the event participation details.' },
          { title: 'Invitation Issuance', desc: 'An official, certified invitation letter is prepared, signed, and delivered to you.' },
          { title: 'Registration & Logistics', desc: 'We assist you with event registration, embassy coordination, and travel delegation support.' },
        ],
        docsTitle: 'Required Documents',
        docsSubtitle: 'Please prepare clear copies of the following:',
        docsList: [
          'Color Passport Copy (valid for at least 6 months)',
          'National Organization or Company Profile',
          'Official Nominating / Support Letter',
          'Proof of Position or Job Title',
          'National ID Card (Iraq)',
          'Recent passport size photo (white background)',
          'Event details (Name of exhibition, date, location)',
          'Any additional documents requested by organizers or embassies',
        ],
        docsNote: 'All documents are kept strictly confidential and used solely for invitation and registration processing.',
        benefitsTitle: 'Benefits of Our Support',
        benefitsList: [
          { title: 'Official & Verified Letters', desc: 'Receive certified letters recognized by embassies and event hosts.' },
          { title: 'Higher Visa Approval Rate', desc: 'Our letters meet international compliance checks to support visa files.' },
          { title: 'Save Time & Operations', desc: 'We coordinate all administrative tasks so you can focus on your goals.' },
          { title: 'Direct Access Passes', desc: 'Gain secure access to international exhibition grounds and B2B zones.' },
          { title: 'Continuous Cooperation', desc: 'Our team coordinates with you before, during, and after the event.' },
        ],
        faqTitle: 'Frequently Asked Questions',
        faqItems: [
          { q: 'How long does it take to get the invitation letter?', a: 'Preparation and certification typically take between 3 to 7 business days, depending on the event and host organization.' },
          { q: 'Who can request invitation support?', a: 'Business owners, government ministry delegates, academics, healthcare specialists, industrial associations, and students.' },
          { q: 'Is my information kept secure?', a: 'Absolutely. We strictly safeguard database information and only share details with officially verified event partners.' },
          { q: 'Does JAZ cover delegation registration fees?', a: 'JAZ manages the registration process and applies delegation discounts, but registration fees must be funded by the applicant.' },
          { q: 'Does JAZ guarantee visa approval?', a: 'We provide support documents and compliance checks to maximize visa success, but the final decision is held by the embassy.' },
          { q: 'What if the event host requires additional paperwork?', a: 'Our coordination office will contact you directly to guide you through any specific additional event checklists.' },
        ],
        formTitle: 'Request Support Form',
        formDesc: 'Please fill out your details below to start your request:',
        formName: 'Full Name (as shown in Passport) *',
        formDesignation: 'Job Designation / Position *',
        formCompany: 'Organization / Company Name *',
        formPhone: 'Contact Phone Number (Mobile) *',
        formEmail: 'Email Address (Company domain preferred) *',
        formEventName: 'Target Event / Exhibition Name *',
        formEventDate: 'Event Date *',
        formEventLocation: 'Event Location (City, Country) *',
        formMessage: 'Additional details or notes',
        formConfirm: 'I confirm that all information provided is accurate and matches my passport.',
        formSubmit: 'Submit Request',
        formSubmitting: 'Submitting request details...',
        formSuccessTitle: 'Request Submitted Successfully!',
        formSuccessDesc: 'Thank you. Our JAZ coordination team will review your credentials and contact you within 48 hours.',
        footerTitle: 'Need Assistance?',
        footerDesc: 'Our coordination and delegations office is ready to answer questions and facilitate your participation.',
        footerCall: 'Call Us',
        footerEmail: 'Email Us',
      }

  return (
    <div className="min-h-screen bg-white" dir={dir} lang={locale}>
      {/* Hero Section */}
      <section
        className="relative bg-[#001a33] text-white pt-32 pb-0 overflow-hidden"
        data-purpose="hero-section"
      >
        {/* World Network Background image */}
        <div className="absolute inset-0 z-0 opacity-40 select-none pointer-events-none">
          <Image
            src="/invitation-hero-bg.png"
            alt="World Connectivity Map"
            fill
            sizes="100vw"
            className="object-cover object-right-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a33] via-[#001a33]/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="w-full lg:w-1/2 mb-20">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight leading-tight">
              {pageContent.heroTitle}
            </h1>
            <p className="text-sm leading-relaxed text-gray-300 mb-8 max-w-lg">
              {pageContent.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#request-form"
                className="bg-[#c2b080] text-[#001a33] font-bold px-6 py-3 rounded-[4px] text-xs sm:text-sm hover:bg-[#b09e6d] transition-all"
              >
                {pageContent.btnRequest}
              </a>
              <Link
                href="/events"
                className="bg-[#002a52] border border-white/20 text-white font-bold px-6 py-3 rounded-[4px] text-xs sm:text-sm hover:bg-white hover:text-[#001a33] transition-all"
              >
                {pageContent.btnEvents}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-[#001a33]/90 border-t border-white/10 backdrop-blur-sm relative z-10" data-purpose="stats-bar">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {pageContent.stats.map((stat, i) => (
                <div
                  key={i}
                  className={`flex flex-col justify-center ${
                    i !== pageContent.stats.length - 1 ? 'md:border-e md:border-white/10' : ''
                  }`}
                >
                  <span className="text-lg sm:text-xl font-bold text-white leading-tight">{stat.value}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-16" data-purpose="main-content-layout">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Flow & Details */}
          <div className="lg:col-span-8 space-y-16">
            {/* Grid for Works, Required and Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* How it Works */}
              <div className="border border-gray-200 p-6 rounded-[4px] flex flex-col justify-start bg-white" data-purpose="how-it-works">
                <h2 className="text-xl font-bold mb-6 text-[#001a33] border-b border-gray-100 pb-3">
                  {pageContent.howItWorksTitle}
                </h2>
                <div className="space-y-6">
                  {pageContent.howItWorksSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-[#e1f0f7] text-[#002a52] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">{step.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits of Support */}
              <div className="border border-gray-200 p-6 rounded-[4px] flex flex-col justify-start bg-white" data-purpose="benefits">
                <h2 className="text-xl font-bold mb-6 text-[#001a33] border-b border-gray-100 pb-3">
                  {pageContent.benefitsTitle}
                </h2>
                <div className="space-y-6">
                  {pageContent.benefitsList.map((benefit, i) => (
                    <div key={i} className="flex gap-3">
                      <Check className="h-5 w-5 text-[#c2b080] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">{benefit.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="border border-gray-200 p-6 sm:p-8 rounded-[4px] bg-gray-50/50" data-purpose="required-documents">
              <h2 className="text-xl font-bold mb-4 text-[#001a33]">
                {pageContent.docsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-6">
                {pageContent.docsSubtitle}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pageContent.docsList.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 bg-white p-3 rounded-[4px] border border-gray-150">
                    <span className="h-2 w-2 rounded-full bg-[#c2b080] shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#e1f0f7] p-4 rounded-[4px] mt-6 flex items-start gap-3">
                <Award className="h-5 w-5 text-[#002a52] shrink-0 mt-0.5" />
                <p className="text-xs text-[#002a52] leading-relaxed font-semibold">
                  {pageContent.docsNote}
                </p>
              </div>
            </div>

            {/* FAQ Accordion Section */}
            <div data-purpose="faq-section" className="pt-4">
              <h2 className="text-2xl font-bold mb-6 text-[#001a33]">
                {pageContent.faqTitle}
              </h2>
              <div className="space-y-3">
                {pageContent.faqItems.map((faq, i) => {
                  const isOpen = activeFaq === i
                  return (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-[4px] overflow-hidden transition-all bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-start font-semibold text-sm sm:text-base text-gray-800 hover:bg-gray-50/50 focus:outline-none"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#c2b080] shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-[#002a52]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Request Form container */}
          <aside className="lg:col-span-4" id="request-form">
            <div className="border border-gray-200 p-6 sm:p-8 rounded-[4px] shadow-sm sticky top-24 bg-white">
              <h2 className="text-xl font-bold mb-2 text-[#001a33] leading-tight">
                {pageContent.formTitle}
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {pageContent.formDesc}
              </p>

              {submitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[4px] text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-emerald-800 text-base mb-2">
                    {pageContent.formSuccessTitle}
                  </h3>
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    {pageContent.formSuccessDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formName}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formDesignation}
                    </label>
                    <input
                      type="text"
                      name="designation"
                      required
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formCompany}
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formPhone}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formEmail}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Event Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formEventName}
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      required
                      value={formData.eventName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formEventDate}
                    </label>
                    <input
                      type="text"
                      name="eventDate"
                      required
                      placeholder="e.g. June 2-5, 2027"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formEventLocation}
                    </label>
                    <input
                      type="text"
                      name="eventLocation"
                      required
                      placeholder="e.g. Paris, France"
                      value={formData.eventLocation}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formMessage}
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-[4px] p-2 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none resize-none"
                    />
                  </div>

                  {/* Confirm check */}
                  <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      className="rounded border-gray-300 text-[#001a33] focus:ring-0 h-4 w-4 shrink-0 mt-0.5"
                    />
                    <span className="text-[10px] text-gray-500 italic">
                      {pageContent.formConfirm}
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#c2b080] text-[#001a33] font-bold py-3 rounded-[4px] shadow-sm hover:bg-[#b09e6d] transition-all uppercase text-xs sm:text-sm mt-4 disabled:opacity-50 shrink-0"
                  >
                    {isSubmitting ? pageContent.formSubmitting : pageContent.formSubmit}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Bottom Assistance banner */}
      <section className="bg-[#001a33] text-white py-12 px-6" data-purpose="contact-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h4 className="text-xl sm:text-2xl font-bold">{pageContent.footerTitle}</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">{pageContent.footerDesc}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 md:gap-12 w-full md:w-auto mt-4 md:mt-0">
            <div>
              <span className="block text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                {pageContent.footerCall}
              </span>
              <a href="tel:+9647719000600" className="text-lg sm:text-xl font-bold tracking-wide hover:text-[#c2b080] transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+9647719000600</span>
              </a>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                {pageContent.footerEmail}
              </span>
              <a href="mailto:info@jaz-iq" className="text-lg sm:text-xl font-bold tracking-wide hover:text-[#c2b080] transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@jaz-iq</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
