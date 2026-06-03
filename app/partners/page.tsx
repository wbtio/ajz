'use client'

import { useRef } from 'react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Briefcase,
    Building2,
    Globe,
    Network,
    Rocket,
    Shield,
    Target,
    Users
} from 'lucide-react'
import { submitStaticPartnerForm } from '@/app/dashboard/partners/actions'
import { DynamicForm } from '@/components/shared/dynamic-form'
import type { FormField } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { Grid } from '@/components/eldoraui/grid'
import Aurora from '@/components/home/aurora'
import BlurText from '@/components/ui/blur-text'
import { StatsBar } from '@/components/shared/stats-bar'

const startupFormFields: FormField[] = [
    { id: 'الاسم الكامل / Full Name', label_ar: 'الاسم الكامل / Full Name', label_en: 'Full Name', type: 'text', required: true },
    { id: 'الخلفية المهنية أو الأكاديمية / Professional Background', label_ar: 'الخلفية المهنية أو الأكاديمية / Professional Background', label_en: 'Professional Background', type: 'text', required: true },
    { id: 'اسم المشروع المقترح (إن وجد) / Project Name', label_ar: 'اسم المشروع المقترح (إن وجد) / Project Name', label_en: 'Project Name', type: 'text', required: false },
    { id: 'القطاع المستهدف / Target Sector', label_ar: 'القطاع المستهدف (طبي، تقني، تجاري، صناعي، إلخ) / Target Sector', label_en: 'Target Sector', type: 'text', required: true },
    { id: 'ملخص الفكرة (Elevator Pitch)', label_ar: 'ملخص الفكرة (Elevator Pitch)', label_en: 'Elevator Pitch', type: 'textarea', required: true },
    { id: 'المرحلة الحالية للمشروع / Current Stage', label_ar: 'المرحلة الحالية للمشروع / Current Stage', label_en: 'Current Stage', type: 'select', options: ['فكرة قيد الدراسة (Idea Phase)', 'نموذج أولي (MVP/Prototype)', 'مشروع قائم يبحث عن تطوير (Existing Project)'], required: true },
    { id: 'ما هو الدعم المطلوب من JAZ بشكل أساسي؟ / Support Needed', label_ar: 'ما هو الدعم المطلوب من JAZ بشكل أساسي؟ / Support Needed', label_en: 'Support Needed', type: 'textarea', required: true },
    { id: 'رقم التواصل / Contact Number', label_ar: 'رقم التواصل / Contact Number', label_en: 'Contact Number', type: 'text', required: true },
]

const committeesFormFields: FormField[] = [
    { id: 'الاسم الكامل / Full Name', label_ar: 'الاسم الكامل / Full Name', label_en: 'Full Name', type: 'text', required: true },
    { id: 'التخصص الحالي (دراسة أو عمل) / Major/Profession', label_ar: 'التخصص الحالي (دراسة أو عمل) / Major/Profession', label_en: 'Major/Profession', type: 'text', required: true },
    { id: 'اللجنة المطلوبة / Preferred Committee', label_ar: 'اللجنة المطلوبة / Preferred Committee', label_en: 'Preferred Committee', type: 'select', options: ['اللجنة العلمية', 'لجنة الميديا', 'لجنة التواصل', 'اللجنة اللوجستية', 'لجنة تكنولوجيا المعلومات'], required: true },
    { id: 'لماذا ترغب في الانضمام لفريق JAZ؟ / Motivation', label_ar: 'لماذا ترغب في الانضمام لفريق JAZ؟ / Motivation', label_en: 'Motivation', type: 'textarea', required: true },
    { id: 'هل لديك خبرة سابقة في تنظيم الفعاليات؟ / Previous Experience', label_ar: 'هل لديك خبرة سابقة في تنظيم الفعاليات؟ / Previous Experience', label_en: 'Previous Experience', type: 'select', options: ['نعم', 'لا'], required: true },
    { id: 'رقم الواتساب / WhatsApp Number', label_ar: 'رقم الواتساب / WhatsApp Number', label_en: 'WhatsApp', type: 'text', required: true },
]

const corporateFormFields: FormField[] = [
    { id: 'اسم الشركة / Organization Name', label_ar: 'اسم الشركة / Organization Name', label_en: 'Organization Name', type: 'text', required: true },
    { id: 'اسم الممثل الرسمي والمنصب / Contact Person & Title', label_ar: 'اسم الممثل الرسمي والمنصب / Contact Person and Title', label_en: 'Contact Person and Title', type: 'text', required: true },
    { id: 'القطاع (طبي، صناعي، تجاري، إلخ) / Industry', label_ar: 'القطاع (طبي، صناعي، تجاري، إلخ) / Industry', label_en: 'Industry', type: 'text', required: true },
    { id: 'الخدمة المطلوبة / Required Service', label_ar: 'الخدمة المطلوبة / Required Service', label_en: 'Required Service', type: 'select', options: ['توسع السوق والتحول الدولي', 'الربط التجاري والوفود التجارية', 'الاستشارات والدعم الرسمي والقانوني'], required: true },
    { id: 'ملخص الطلب أو الهدف الاستراتيجي / Request Summary', label_ar: 'ملخص الطلب أو الهدف الاستراتيجي / Request Summary', label_en: 'Request Summary', type: 'textarea', required: true },
    { id: 'البريد الإلكتروني الرسمي / Official Email', label_ar: 'البريد الإلكتروني الرسمي / Official Email', label_en: 'Official Email', type: 'text', required: true },
    { id: 'رقم التواصل / Contact Number', label_ar: 'رقم التواصل / Contact Number', label_en: 'Contact Number', type: 'text', required: true },
]

interface SectionFeature {
  title: string
  titleEn: string
  icon?: React.ElementType
  points?: { ar: string; en: string }[]
}

interface SectionData {
  category: string
  categoryEn: string
  title: string
  titleEn: string
  subtitle: string
  subtitleEn: string
  description: string
  descriptionEn: string
  icon: React.ElementType
  features: SectionFeature[]
  actionLabel: string
  actionLabelEn: string
  formTitle: string
  formFields: FormField[]
  submitTitle: string
  successMessage: string
}

// Unified Data Structure
const sectionsData: SectionData[] = [
  {
    category: 'للأفراد',
    categoryEn: 'For Individuals',
    title: 'مبادرة جاز لتطوير الشباب',
    titleEn: 'JAZ Youth Initiative',
    subtitle: 'إشراف: قسم التدريب والتطوير',
    subtitleEn: 'Supervised by: Training and Development Division',
    description: 'فرصة مثالية للشباب لتطوير مشاريعهم أو الانضمام إلى بيئة عمل محترفة تتبنى أفكارهم الريادية وتحولها إلى واقع ملموس بدعم استراتيجي ومؤسسي متكامل.',
    descriptionEn: 'An ideal opportunity for youth to develop their projects or join a professional environment that adopts their entrepreneurial ideas and turns them into reality with integrated strategic and institutional support.',
    icon: Rocket,
    features: [
      { title: 'غطاء مؤسسي', titleEn: 'Institutional Cover', icon: Shield },
      { title: 'تطوير عملي', titleEn: 'Practical Development', icon: Target },
      { title: 'تشبيك استراتيجي', titleEn: 'Strategic Networking', icon: Network },
    ],
    actionLabel: 'أرسل تفاصيل مشروعك',
    actionLabelEn: 'Submit Your Project',
    formTitle: 'نموذج تقديم طلب مشروع (Startup Application)',
    formFields: startupFormFields,
    submitTitle: 'إرسال الفكرة (Submit Idea)',
    successMessage: 'تم استلام بيانات مشروعك بنجاح! فريقنا سيقوم بمراجعة الفكرة والتواصل معك قريباً.',
  },
  {
    category: 'للمؤسسات',
    categoryEn: 'For Organizations',
    title: 'الفريق التنظيمي للمعارض والمؤتمرات',
    titleEn: 'Event Committees',
    subtitle: 'اللجان التنظيمية',
    subtitleEn: 'Operational Committees',
    description: 'فرصة عملية للانضمام إلى فرق التنفيذ الميداني والتنظيمي للمعارض والمؤتمرات ضمن بيئة سريعة الإيقاع ومسؤولة عن الجودة والتنسيق للحصول على خبرة احترافية.',
    descriptionEn: 'A practical opportunity to join high-tempo event execution teams responsible for coordination, quality, and on-ground operations to gain professional experience.',
    icon: BookOpen,
    features: [
      { title: 'اللجنة العلمية', titleEn: 'Scientific Committee', icon: Users },
      { title: 'لجنة الميديا', titleEn: 'Media Committee', icon: Users },
      { title: 'لجنة التواصل', titleEn: 'Communication Committee', icon: Users },
      { title: 'اللجنة اللوجستية', titleEn: 'Logistics Committee', icon: Users },
      { title: 'تكنولوجيا المعلومات', titleEn: 'Information Technology', icon: Users },
    ],
    actionLabel: 'إرسال طلب الانضمام',
    actionLabelEn: 'Apply Now',
    formTitle: 'نموذج طلب الانضمام (Application Form)',
    formFields: committeesFormFields,
    submitTitle: 'إرسال الطلب (Submit Application)',
    successMessage: 'تم استلام طلب انضمامك بنجاح! سيتم مراجعة طلبك من قبل قسم الموارد البشرية وتحديد موعد للمقابلة قريباً.',
  },
  {
    category: 'للشركات',
    categoryEn: 'For Companies',
    title: 'الشركات والنمو',
    titleEn: 'Corporate and Growth',
    subtitle: 'مسار نمو مؤسسي ودولي',
    subtitleEn: 'Institutional and International Growth',
    description: 'هل تبحث عن مسار نمو مؤسسي ودولي؟ اطلب إيجازاً مهنياً وسنراجع احتياج شركتكم لنحدد نقطة الدخول الأنسب وخطة التحرك التالية عبر خدماتنا الاستراتيجية.',
    descriptionEn: 'Looking for an institutional and international growth path? Request a professional brief and we will assess your company needs to define the right entry point and next move through our strategic services.',
    icon: Building2,
    features: [
      {
        title: 'توسع السوق والتحول الدولي', titleEn: 'Market Entry and Expansion', icon: Globe,
        points: [
          { ar: 'مساعدة الشركات الوطنية في دخول الأسواق الدولية.', en: 'Supporting national companies in entering international markets.' },
          { ar: 'تقديم تقارير فرص التعاون التجاري.', en: 'Providing market opportunity reports.' },
          { ar: 'تسهيل الشراكات الصناعية.', en: 'Facilitating industrial partnerships.' },
        ]
      },
      {
        title: 'الربط التجاري والوفود', titleEn: 'Strategic Matchmaking', icon: Network,
        points: [
          { ar: 'تنظيم بعثات أعمال رفيعة المستوى.', en: 'Organizing high-level business delegations.' },
          { ar: 'تنسيق اجتماعات مباشرة B2B و B2G.', en: 'Coordinating direct B2B and B2G meetings.' },
          { ar: 'البحث عن الشريك التجاري الأنسب.', en: 'Finding the most suitable commercial partner.' },
        ]
      },
      {
        title: 'الاستشارات والدعم الرسمي', titleEn: 'Advisory and Support', icon: Briefcase,
        points: [
          { ar: 'استشارات مالية وقانونية لسلامة العمليات.', en: 'Financial and legal advisory for safe operations.' },
          { ar: 'فحص وتدقيق الشركات قبل التوسع.', en: 'Screening companies before expansion.' },
          { ar: 'توفير كتب الدعم والتسهيلات الرسمية.', en: 'Providing official support and facilities.' },
        ]
      }
    ],
    actionLabel: 'اطلب إيجازاً مهنياً',
    actionLabelEn: 'Request Brief',
    formTitle: 'نموذج طلب خدمة للشركات (Corporate Inquiry Form)',
    formFields: corporateFormFields,
    submitTitle: 'تقديم الطلب (Request Brief)',
    successMessage: 'تم استلام طلب مؤسستكم بنجاح! سيتم مراجعة الطلب من قبل قسم الشركات للتواصل معكم وتنسيق اجتماع قريباً.',
  }
]

export default function PartnersPage() {
    const { locale, dir } = useI18n()
    const isArabic = locale === 'ar'
    const ArrowIcon = isArabic ? ArrowLeft : ArrowRight
    const hasOddCards = sectionsData.length % 2 !== 0
    const shouldReduceMotion = useReducedMotion() ?? false

    const statsItems = isArabic
        ? [
            {
                value: 15,
                label: "دولة شريكة للتوسع",
                icon: "solar:globus-bold-duotone",
                suffix: "+",
            },
            {
                value: 200,
                label: "شريك استراتيجي فعال",
                icon: "solar:handshake-bold-duotone",
                suffix: "+",
            },
            {
                value: 1000,
                label: "شاب مستفيد من مبادراتنا",
                icon: "solar:users-group-rounded-bold-duotone",
                suffix: "+",
            },
            {
                value: 50,
                label: "شركة ومؤسسة مدعومة للنمو",
                icon: "solar:ranking-bold-duotone",
                suffix: "+",
            },
        ]
        : [
            {
                value: 15,
                label: "Partner Countries for Expansion",
                icon: "solar:globus-bold-duotone",
                suffix: "+",
            },
            {
                value: 200,
                label: "Active Strategic Partners",
                icon: "solar:handshake-bold-duotone",
                suffix: "+",
            },
            {
                value: 1000,
                label: "Youth Beneficiaries of Initiatives",
                icon: "solar:users-group-rounded-bold-duotone",
                suffix: "+",
            },
            {
                value: 50,
                label: "Supported Companies for Growth",
                icon: "solar:ranking-bold-duotone",
                suffix: "+",
            },
        ];

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

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

    const gridVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    }

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 60, scale: 0.95, filter: 'blur(6px)' },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: { duration: 0.8, ease },
        },
    }

    return (
        <div className="relative overflow-hidden bg-white min-h-screen pb-24" dir={dir} lang={locale}>
            {/* Hero Section - Matching Premium Design */}
            <motion.section
                ref={sectionRef}
                dir={dir}
                lang={locale}
                className="relative z-20 flex flex-col justify-between bg-[#0b1426] text-white pt-24 pb-8 sm:pt-26 lg:pt-28 sm:pb-10 lg:pb-12 overflow-hidden"
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

                    {/* Partners Banner Background Image Overlay */}
                    <div
                        className="absolute inset-0 z-0 opacity-[0.12] md:opacity-[0.18] pointer-events-none select-none transition-all duration-700"
                        style={{
                            backgroundImage: "url('/partners-banner.png')",
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
                                    {isArabic ? 'العلاقات الاستراتيجية' : 'Strategic Relations'}
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
                                        text={isArabic ? 'شركاؤنا الاستراتيجيون ومسارات التعاون المشترك' : 'Our strategic partners and pathways for joint collaboration'}
                                        delay={80}
                                        animateBy="words"
                                        direction="top"
                                        className={`text-start text-navy-200/90 ${
                                            isArabic
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

            {/* Stats Bar */}
            <StatsBar items={statsItems} overlap={false} />

            {/* Glowing Orbs */}
            <div className="pointer-events-none absolute left-[-8rem] top-32 h-[28rem] w-[28rem] rounded-full bg-slate-500/5 blur-[100px]" />
            <div className="pointer-events-none absolute right-[-10rem] top-56 h-[22rem] w-[22rem] rounded-full bg-slate-400/5 blur-[80px]" />

            <Container className="relative z-10 max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 mt-8 lg:mt-12">
                <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-10 text-start"
                >
                    {sectionsData.map((section, index) => {
                        const Icon = section.icon
                        const isLastOddCard = hasOddCards && index === sectionsData.length - 1
                        return (
                            <motion.article
                                key={section.title}
                                variants={cardVariants}
                                whileHover={{ y: -6, scale: 1.01 }}
                                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                                className={`group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.03)] hover:shadow-[0_40px_100px_rgba(15,23,42,0.08)] ${isLastOddCard ? 'sm:col-span-2' : ''}`}
                            >
                                {/* Card Internal Grid Background */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <Grid columns={8} rows={6} height="h-full" width="w-full" className="opacity-[0.035]" showPlusIcons={true} />
                                </div>

                                {/* Internal Glows */}
                                <div className="absolute right-[-15%] top-[-15%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-slate-500/5 to-slate-300/5 blur-[80px] transition-transform duration-700 group-hover:scale-125" />
                                
                                <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col h-full">
                                    <div className="mb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                        <div>
                                            <div className="mb-2 inline-flex items-center rounded-full border border-slate-600/12 bg-[#8b0000]/5 px-3 py-0.5 text-xs font-bold tracking-wide text-[#8b0000]">
                                                {isArabic ? section.category : section.categoryEn}
                                            </div>
                                            <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl lg:text-2xl group-hover:text-[#8b0000] transition-colors duration-300">
                                                {isArabic ? section.title : section.titleEn}
                                            </h2>
                                            <p className="mt-1.5 text-xs font-semibold tracking-wide text-slate-400">
                                                {isArabic ? section.subtitle : section.subtitleEn}
                                            </p>
                                        </div>
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border-2 border-slate-700/10 bg-[#8b0000]/10 text-[#8b0000] shadow-sm transition-transform duration-500 group-hover:rotate-6 ${isArabic ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <p className="mb-4 text-sm leading-relaxed text-slate-600 lg:max-w-4xl">
                                        {isArabic ? section.description : section.descriptionEn}
                                    </p>

                                    <div className="partners-features-distilled-grid mb-4">
                                        {section.features.map((feature, i) => {
                                            const FeatureIcon = feature.icon
                                            return (
                                                <div key={i} className="partners-features-distilled-item">
                                                    {FeatureIcon && (
                                                        <FeatureIcon className="partners-features-distilled-icon shrink-0 text-[#8b0000]" />
                                                    )}
                                                    <h3 className="partners-features-distilled-title font-semibold text-slate-800">
                                                        {isArabic ? feature.title : feature.titleEn}
                                                    </h3>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-auto flex justify-end border-t border-slate-200/50 pt-3">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="h-11 w-full rounded-2xl border-0 bg-[#8b0000] hover:bg-[#6b0000] px-6 text-sm font-bold text-white shadow-[0_12px_24px_rgba(139,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(139,0,0,0.25)] sm:w-auto active:scale-98">
                                                    {isArabic ? section.actionLabel : section.actionLabelEn}
                                                    <ArrowIcon className={`h-5 w-5 ${isArabic ? 'mr-3' : 'ml-3'}`} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent
                                                dir={dir}
                                                lang={locale}
                                                className="max-h-[92vh] w-[calc(100vw-1.25rem)] max-w-xl gap-0 overflow-hidden border-slate-200/90 bg-white p-0 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] sm:w-full sm:rounded-2xl"
                                            >
                                                <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
                                                    <DialogHeader className="space-y-2 text-start">
                                                        <DialogTitle className="text-start text-xl font-bold leading-snug tracking-tight text-slate-900">
                                                            {section.formTitle}
                                                        </DialogTitle>
                                                        <DialogDescription className="text-start text-sm leading-relaxed text-slate-600 font-medium">
                                                            {isArabic
                                                                ? 'املأ الحقول التالية بدقة. الحقول التي تحمل علامة (*) إلزامية.'
                                                                : 'Please complete the fields below. Items marked with (*) are required.'}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                </div>
                                                <div className="max-h-[min(72vh,calc(92vh-9rem))] overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7">
                                                    <DynamicForm
                                                        fields={section.formFields}
                                                        onSubmit={async (data) => {
                                                            await submitStaticPartnerForm(data, section.title)
                                                        }}
                                                        submitLabel={section.submitTitle}
                                                        successMessage={section.successMessage}
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                             </motion.article>
                        )
                    })}
                </motion.div>
            </Container>
        </div>
    )
}
