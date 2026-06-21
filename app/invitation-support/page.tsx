'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Mail, Phone, ArrowUpRight, HelpCircle, ChevronDown, Award, Calendar } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'

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
          { value: 10, label: 'سنوات خبرة في التنسيق', icon: 'solar:medal-ribbons-star-bold-duotone', suffix: '+' },
          { value: 500, label: 'وفود دولية سنوياً', icon: 'solar:users-group-two-rounded-bold-duotone', suffix: '+' },
          { value: 80, label: 'دولة شريكة متصلة', icon: 'solar:earth-bold-duotone', suffix: '+' },
        ],
        howItWorksTitle: 'كيف نعمل',
        howItWorksSteps: [
          { title: 'تقديم الطلب والمستندات', desc: 'املأ نموذج الطلب الآمن وأرفق تفاصيل جواز سفرك والفعالية المستهدفة.' },
          { title: 'التدقيق والتحقق من الملف', desc: 'يقوم فريقنا بمراجعة مستنداتك والتحقق من مطابقتها لشروط السفارات والمنظمين.' },
          { title: 'إصدار خطاب معتمد', desc: 'نقوم بالتنسيق المباشر مع الجهات الدولية المستضيفة لإصدار خطاب دعوتك الرسمي الموقّع.' },
          { title: 'تسهيل الإجراءات والتنسيق', desc: 'نساعدك في تأكيد تسجيلك، وإرشادك في ملف التأشيرة، وتنسيق السفر واللوجستيات.' },
        ],
        docsTitle: 'المستندات المطلوبة',
        docsSubtitle: 'يرجى تجهيز نسخ واضحة من الوثائق التالية لضمان سرعة المعالجة:',
        docsList: [
          'نسخة ملونة واضحة من جواز السفر (صالح لمدة 6 أشهر على الأقل)',
          'خطاب ترشيح أو دعم رسمي (من جهة العمل أو المؤسسة الراعية)',
          'الملف التعريفي للشركة أو شهادة تسجيل المؤسسة القانونية',
          'إثبات المهنة والمسمى الوظيفي (هوية النقابة أو بطاقة العمل)',
          'نسخة من البطاقة الوطنية الموحدة أو الهوية الشخصية للمطابقة',
          'صورة شخصية حديثة للمرشح بخلفية بيضاء',
          'تفاصيل الفعالية المستهدفة (اسم المعرض، التاريخ، مكان الانعقاد)',
          'أي مستندات إضافية قد تطلبها السفارة المعنية بالفيزا أو المنظمون',
        ],
        docsNote: 'ضمان الخصوصية: يتم تشفير مستنداتك ومعالجتها بأمان تام، ولن تتم مشاركتها إلا مع شركاء الفعالية المعتمدين والموثقين.',
        benefitsTitle: 'مزايا دعم الوفود من JAZ',
        benefitsList: [
          { title: 'خطابات معتمدة وموثقة قنصلياً', desc: 'الحصول على وثائق رسمية معترف بها مباشرة لدى السفارات والبعثات الدولية.' },
          { title: 'رفع نسبة قبول التأشيرات', desc: 'تُعد خطابات الدعم والتنسيق وفق معايير الامتثال الدولية المعتمدة لدى القنصليات.' },
          { title: 'إدارة المعاملات بالكامل', desc: 'نتولى جميع المراسلات الإدارية والتسجيل مع المنظمين لتوفير وقت ومجهود فريقك.' },
          { title: 'بطاقات دخول حصرية وB2B', desc: 'تأمين شارات دخول مؤكدة للمناطق الحصرية ولقاءات الأعمال الثنائية وصالات العرض.' },
          { title: 'متابعة وتنسيق طوال فترة السفر', desc: 'دعم تنظيمي وإرشادات عملياتية متواصلة من فريقنا طوال فترة تواجدك في الخارج.' },
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
        formTitle: 'طلب دعم الوفود والتسجيل',
        formDesc: 'يرجى تعبئة الحقول أدناه ببيانات جواز سفرك والفعالية لبدء المعاملة:',
        formName: 'الاسم الكامل (مطابق لجواز السفر) *',
        formDesignation: 'المسمى الوظيفي / الصفة المهنية *',
        formCompany: 'اسم المؤسسة / الشركة *',
        formPhone: 'رقم هاتف التواصل (واتساب مفضل) *',
        formEmail: 'البريد الإلكتروني (يفضل بريد الشركة الرسمي) *',
        formEventName: 'اسم المعرض أو الفعالية المستهدفة *',
        formEventDate: 'تاريخ انعقاد الفعالية *',
        formEventLocation: 'الموقع (المدينة والدولة المستضيفة) *',
        formMessage: 'متطلبات خاصة إضافية (مثال: الموعد الأقصى للفيزا، حجم الوفد)',
        formConfirm: 'أؤكد أن جميع المعلومات المدونة صحيحة ومطابقة تماماً لجواز سفري.',
        formSubmit: 'إرسال طلب الدعم الرسمي',
        formSubmitting: 'جاري معالجة وإرسال طلبك...',
        formSuccessTitle: 'تم تقديم طلبك بنجاح!',
        formSuccessDesc: 'شكراً لك. سيقوم مكتب التنسيق في جاز بمراجعة بياناتك والتواصل معك لتأكيد الخطوات القادمة خلال 48 ساعة.',
        footerTitle: 'لديك استفسار حول خطابات الدعوة أو التأشيرات؟',
        footerDesc: 'فريق التنسيق والوفود لدينا متواجد لمساعدتك في تأمين خطاب الدعوة، وتدقيق ملف التأشيرة، وتسهيل إجراءات التسجيل.',
        footerCall: 'خط التنسيق المباشر / الواتساب',
        footerEmail: 'البريد الإلكتروني الرسمي',
      }
    : {
        heroTitle: 'Invitation & Registration Support',
        heroDesc: 'We provide end-to-end invitation letter services, event registration assistance, and documentation support for Iraqi delegates, organizations, and institutions to participate in leading international exhibitions, conferences, and trade events worldwide.',
        btnRequest: 'Request Invitation Support',
        btnEvents: 'Explore Upcoming Events',
        stats: [
          { value: 10, label: 'Years of Coordination Experience', icon: 'solar:medal-ribbons-star-bold-duotone', suffix: '+' },
          { value: 500, label: 'Annual Delegations Managed', icon: 'solar:users-group-two-rounded-bold-duotone', suffix: '+' },
          { value: 80, label: 'Connected Global Destinations', icon: 'solar:earth-bold-duotone', suffix: '+' },
        ],
        howItWorksTitle: 'How It Works',
        howItWorksSteps: [
          { title: 'Submit Request & Credentials', desc: 'Provide your passport details, organization profile, and event registration requirements via our secure form.' },
          { title: 'Credential Verification', desc: 'Our international coordination desk reviews your credentials for compliance with consular and host organizer criteria.' },
          { title: 'Official Issuance', desc: 'We coordinate directly with international hosts to secure your certified, sign-off visa-support invitation.' },
          { title: 'Delegation Onboarding', desc: 'We facilitate event registrations, coordinate appointment slots, and support delegation logistics.' },
        ],
        docsTitle: 'Required Documents',
        docsSubtitle: 'Please prepare clear copies of the following:',
        docsList: [
          'High-resolution color passport copy (valid for at least 6 months)',
          'Registered company profile or official organization credentials',
          'Official nomination or endorsement letter from your sponsoring institution',
          'Professional credentials or employment verification (e.g., union/syndicate card)',
          'Unified National Card or Civil Status ID (Iraq)',
          'Recent biometric passport photograph (white background)',
          'Event brochure or formal registration reference details',
          'Any specific supporting documents required by the target embassy',
        ],
        docsNote: 'Data Protection: Your personal credentials are fully encrypted and transmitted solely to verified international organizers and consular channels.',
        benefitsTitle: 'Benefits of Our Support',
        benefitsList: [
          { title: 'Consular-Grade Verification', desc: 'Receive certified letters recognized and verified directly by international embassies and trade hosts.' },
          { title: 'Consular Compliance Check', desc: 'Our coordination letters are structured to satisfy visa security and event validation checks.' },
          { title: 'End-to-End Administrative Handling', desc: 'We manage all direct communication and registration with global hosts, saving operational hours.' },
          { title: 'Priority Event Access & B2B Matchmaking', desc: 'Secure authorized badges for restricted areas, business matchmaking lounges, and exhibition halls.' },
          { title: 'On-Site and Pre-Departure Coordination', desc: 'Receive continuous guidance from our desk regarding travel preparation, check-ins, and on-site representation.' },
        ],
        faqTitle: 'Frequently Asked Questions',
        faqItems: [
          { q: 'What is the standard processing time for visa support letters?', a: 'Preparation, approval, and certification typically take 3 to 7 business days, depending on the host country and event organizer.' },
          { q: 'Who is eligible to apply for institutional delegation support?', a: 'Our services are designed for business owners, corporate executives, government ministry delegates, academics, healthcare specialists, and accredited student delegations.' },
          { q: 'How does JAZ protect my professional and personal documents?', a: 'We implement strict institutional data protection protocols. Your credentials are encrypted and only shared with verified, official host organizations and consulates.' },
          { q: 'Are delegation registration or ticketing fees funded by JAZ?', a: 'No. While JAZ coordinates your registration and applies exclusive delegation group discounts, all ticket and attendance fees must be settled by the applicant.' },
          { q: 'Does support from JAZ guarantee visa approval?', a: 'No. We provide compliant documentation and credentials that significantly strengthen your application, but final visa decisions rest solely with the respective embassy.' },
          { q: 'What occurs if the event hosts or consulates request additional documentation?', a: 'Our delegation desk will contact you immediately to assist in compiling, verifying, and submitting any supplementary paperwork required.' },
        ],
        formTitle: 'Delegation Support & Registration Request',
        formDesc: 'Please provide your passport and professional credentials below to initiate your delegation file:',
        formName: 'Full Name (exactly as written in passport) *',
        formDesignation: 'Professional Title / Job Designation *',
        formCompany: 'Sponsoring Company or Institution Name *',
        formPhone: 'Contact Mobile Number (WhatsApp preferred) *',
        formEmail: 'Official Email Address (Corporate domain preferred) *',
        formEventName: 'Target International Event or Trade Show Name *',
        formEventDate: 'Event Dates (e.g., Oct 12-15, 2026) *',
        formEventLocation: 'Event Location (City & Host Country) *',
        formMessage: 'Special Requirements (e.g., visa deadlines, delegation size, or B2B matchmaking interest)',
        formConfirm: 'I certify that all details provided are complete, accurate, and match my passport.',
        formSubmit: 'Submit Official Request',
        formSubmitting: 'Processing request submission...',
        formSuccessTitle: 'Request Submitted Successfully',
        formSuccessDesc: 'Thank you. The JAZ delegation desk will review your details and contact you via phone or email within 48 hours to outline the next steps.',
        footerTitle: 'Need Delegation or Visa Support?',
        footerDesc: 'Our delegation desk is available to assist you with secure visa invitation letters, event ticketing, and corporate registration.',
        footerCall: 'Direct Coordination Line & WhatsApp',
        footerEmail: 'Official Coordination Email',
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
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{pageContent.btnRequest}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </a>
              <Link
                href="/events"
                className="action-card flex items-center justify-between py-2.5 px-4 bg-jaz-navy/40 backdrop-blur-md rounded-jaz border border-white/20 cursor-pointer hover:bg-jaz-navy/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-start">
                  <div className="bg-white/10 p-2 rounded-jaz shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{pageContent.btnEvents}</h3>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-white shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar items={pageContent.stats} overlap={false} />
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-20" data-purpose="main-content-layout">
        
        {/* Step-by-Step Flow: How it Works */}
        <section className="bg-gray-50/50 border border-gray-150 p-8 rounded-[4px]">
          <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-200/60 pb-3 flex items-center gap-2 text-start">
            <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
            {pageContent.howItWorksTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {pageContent.howItWorksSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-start text-start relative group">
                {/* Connecting Line between steps on desktop */}
                {i < pageContent.howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-4 start-10 end-0 h-[2px] bg-gray-200 z-0" />
                )}
                <div className="h-9 w-9 rounded-full bg-[#001a33]/5 text-[#001a33] flex items-center justify-center text-sm font-bold shrink-0 mb-4 z-10 group-hover:bg-[#b08d4b] group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <h3 className="font-extrabold text-sm text-[#001a33] mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2-Column Content: Required Documents & Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Required Documents (Left, Col-span 7) */}
          <div className="lg:col-span-7 border border-gray-200 p-6 sm:p-8 rounded-[4px] bg-white text-start" data-purpose="required-documents">
            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
              {pageContent.docsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {pageContent.docsSubtitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pageContent.docsList.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700 bg-gray-50/50 p-3 rounded-[4px] border border-gray-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b08d4b] shrink-0 mt-2" />
                  <span className="font-medium">{doc}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#e1f0f7] p-4 rounded-[4px] mt-6 flex items-start gap-3 border border-blue-100">
              <Award className="h-5 w-5 text-[#002a52] shrink-0 mt-0.5" />
              <p className="text-xs text-[#002a52] leading-relaxed font-semibold">
                {pageContent.docsNote}
              </p>
            </div>
          </div>

          {/* Benefits of Support (Right, Col-span 5) */}
          <div className="lg:col-span-5 border border-gray-200 p-6 sm:p-8 rounded-[4px] bg-white text-start" data-purpose="benefits">
            <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-200/60 pb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
              {pageContent.benefitsTitle}
            </h2>
            <div className="space-y-6">
              {pageContent.benefitsList.map((benefit, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="bg-[#b08d4b]/10 p-1 rounded-sm shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-[#b08d4b]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{benefit.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FAQ Section */}
        <section data-purpose="faq-section" className="border border-gray-200 p-6 sm:p-8 rounded-[4px] bg-white text-start">
          <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-200/60 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
            {pageContent.faqTitle}
          </h2>
          <div className="space-y-3">
            {pageContent.faqItems.map((faq, i) => {
              const isOpen = activeFaq === i
              return (
                <div
                  key={i}
                  className="border border-gray-150 rounded-[4px] overflow-hidden transition-all bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-start font-bold text-sm sm:text-base text-gray-800 hover:bg-gray-50/50 focus:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#b08d4b] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#002a52]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-gray-50/40 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Full-width Request Form */}
        <section className="border border-gray-200 p-6 sm:p-8 rounded-[4px] bg-white text-start scroll-mt-28" id="request-form">
          <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#8b0000] rounded-sm"></span>
            {pageContent.formTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
            {pageContent.formDesc}
          </p>

          {submitSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-[4px] text-center max-w-xl mx-auto my-8">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-emerald-800 text-base mb-2">
                {pageContent.formSuccessTitle}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-600 leading-relaxed font-semibold">
                {pageContent.formSuccessDesc}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: Personal / Company Info */}
                <div className="space-y-4">
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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>
                </div>

                {/* Right Side: Event Details & Message */}
                <div className="space-y-4 flex flex-col justify-between">
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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

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
                      className="w-full border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none"
                    />
                  </div>

                  <div className="flex-grow flex flex-col">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {pageContent.formMessage}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full flex-grow border border-gray-300 rounded-[4px] p-2.5 text-xs focus:ring-[#001a33] focus:border-[#001a33] outline-none resize-none min-h-[100px]"
                    />
                  </div>
                </div>

              </div>

              {/* Confirm check */}
              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    className="rounded border-gray-300 text-[#001a33] focus:ring-0 h-4 w-4 shrink-0"
                  />
                  <span className="text-[11px] text-gray-500 italic">
                    {pageContent.formConfirm}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#b08d4b] text-[#001a33] font-bold px-8 py-3 rounded-[4px] shadow-sm hover:bg-[#b09e6d] transition-all uppercase text-xs sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? pageContent.formSubmitting : pageContent.formSubmit}
                </button>
              </div>
            </form>
          )}
        </section>
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
              <a href="tel:+9647719000600" className="text-lg sm:text-xl font-bold tracking-wide hover:text-[#b08d4b] transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+9647719000600</span>
              </a>
            </div>
            <div>
              <span className="block text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                {pageContent.footerEmail}
              </span>
              <a href="mailto:info@jaz.iq" className="text-lg sm:text-xl font-bold tracking-wide hover:text-[#b08d4b] transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@jaz.iq</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
