'use client'

import { useRef } from 'react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    ArrowRight,
    ArrowLeft,
    Rocket,
    BookOpen,
    Building2,
    Handshake,
    Landmark,
    Megaphone,
    UsersRound,
    HandshakeIcon,
    Check,
    Search,
    UserCheck,
    FileSignature,
    BarChart3,
    ChevronRight,
    Download,
} from 'lucide-react'
import { submitStaticPartnerForm } from '@/app/dashboard/partners/actions'
import { DynamicForm } from '@/components/shared/dynamic-form'
import type { FormField } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { SectionHeader } from '@/components/home'

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

const modelsData = [
    {
        icon: Landmark,
        titleAr: 'التمثيل الرسمي في العراق',
        titleEn: 'Official Representation in Iraq',
        descAr: 'تمثيل حصري للدول والمنظمات الدولية في المعارض والمؤتمرات لتطوير الوصول إلى السوق والمشاركة.',
        descEn: 'Exclusive country representation for international exhibitions and conferences to develop market access and participation.',
        accent: '#b08d4b',
    },
    {
        icon: Megaphone,
        titleAr: 'شريك الترويج والتوعية',
        titleEn: 'Promotion & Outreach Partner',
        descAr: 'الترويج المشترك للفعاليات والمبادرات من خلال التسويق المشترك والتغطية الإعلامية وإشراك أصحاب المصلحة.',
        descEn: 'Co-promote events and initiatives through joint marketing, media coverage, and stakeholder engagement.',
        accent: '#1e3a5f',
    },
    {
        icon: UsersRound,
        titleAr: 'شريك دعم الوفود',
        titleEn: 'Delegation Support Partner',
        descAr: 'التعاون لتنظيم وتسهيل وفود المشترين والبائعين والزيارات وبرامج التواصل التجاري.',
        descEn: 'Collaborate to organize and facilitate buyer/seller delegations, visits, and B2B matchmaking programs.',
        accent: '#8b0000',
    },
    {
        icon: HandshakeIcon,
        titleAr: 'التعاون المؤسسي',
        titleEn: 'Institutional Cooperation',
        descAr: 'الشراكة مع المؤسسات في البحث وتبادل المعرفة والحوار السياسي وبناء القدرات.',
        descEn: 'Partner with institutions on research, knowledge exchange, policy dialogue, and capacity building.',
        accent: '#0f766e',
    },
]

const whyItems = [
    { ar: 'وصول مباشر إلى القطاعين العام والخاص في العراق', en: 'Direct access to Iraq\'s public & private sectors' },
    { ar: 'تنسيق حكومي ومؤسسي قوي', en: 'Strong government & institutional coordination' },
    { ar: 'فعاليات عالية الجودة وتعرض دولي', en: 'High-quality events & international exposure' },
    { ar: 'موثوقية وشفافية وتوجه نحو النتائج', en: 'Trustworthy, transparent & results-oriented' },
    { ar: 'نماذج شراكة مخصصة تناسب أهدافك', en: 'Tailored partnership models to fit your goals' },
    { ar: 'أثر مستدام لمؤسستك', en: 'Sustainable impact for your organization' },
]

const processSteps = [
    { icon: Search, titleAr: 'استكشاف', titleEn: 'Explore', descAr: 'مشاركة الأهداف واستكشاف الفرص.', descEn: 'Share goals & explore opportunities.' },
    { icon: UserCheck, titleAr: 'مواءمة', titleEn: 'Align', descAr: 'التوافق على النطاق والقيمة المتبادلة.', descEn: 'Align on scope & mutual value.' },
    { icon: FileSignature, titleAr: 'تصميم', titleEn: 'Design', descAr: 'تصميم الخطة المشتركة وتحديد الأدوار.', descEn: 'Co-create plan & define roles.' },
    { icon: Rocket, titleAr: 'تنفيذ', titleEn: 'Implement', descAr: 'التنفيذ بالتنسيق المشترك.', descEn: 'Execute with coordination.' },
    { icon: BarChart3, titleAr: 'تقييم', titleEn: 'Evaluate', descAr: 'قياس الأثر والتخطيط للمستقبل.', descEn: 'Measure impact & future plans.' },
]

const formSectionData = [
    {
        categoryAr: 'للأفراد',
        categoryEn: 'For Individuals',
        titleAr: 'مبادرة جاز لتطوير الشباب',
        titleEn: 'JAZ Youth Initiative',
        descriptionAr: 'فرصة لتسريع أفكارك الريادية أو الانضمام لفرق عمل متخصصة لتنفيذ المشاريع بدعم لوجستي ومؤسسي متكامل.',
        descriptionEn: 'Accelerate your entrepreneurial ideas or join professional execution teams within JAZ initiatives with integrated support.',
        icon: Rocket,
        actionLabelAr: 'أرسل تفاصيل مشروعك',
        actionLabelEn: 'Submit Your Project',
        formTitle: 'نموذج تقديم طلب مشروع (Startup Application)',
        formFields: startupFormFields,
        submitTitle: 'إرسال الفكرة (Submit Idea)',
        successMessage: 'تم استلام بيانات مشروعك بنجاح! فريقنا سيقوم بمراجعة الفكرة والتواصل معك قريباً.',
        badge: 'border-[#b08d4b]/30 bg-[#b08d4b]/[0.06] text-[#b08d4b]',
        iconColor: 'text-[#b08d4b]',
        iconBg: 'bg-[#b08d4b]/[0.08]',
        btnClass: 'bg-[#b08d4b] hover:bg-[#b08d4b]/85 text-white',
    },
    {
        categoryAr: 'للمؤسسات',
        categoryEn: 'For Organizations',
        titleAr: 'اللجان التنظيمية للمعارض والمؤتمرات',
        titleEn: 'Event Committees',
        descriptionAr: 'انضم لفرق التنفيذ والتشغيل الميداني للمعارض والمؤتمرات الدولية الكبرى، واكتسب خبرة عملية موثقة.',
        descriptionEn: 'Join our on-the-ground operational teams to coordinate large-scale trade exhibitions and gain certified project experience.',
        icon: BookOpen,
        actionLabelAr: 'إرسال طلب الانضمام',
        actionLabelEn: 'Apply Now',
        formTitle: 'نموذج طلب الانضمام (Application Form)',
        formFields: committeesFormFields,
        submitTitle: 'إرسال الطلب (Submit Application)',
        successMessage: 'تم استلام طلب انضمامك بنجاح! سيتم مراجعة الطلب من قبل قسم الموارد البشرية وتحديد موعد للمقابلة قريباً.',
        badge: 'border-[#8b0000]/30 bg-[#8b0000]/[0.06] text-[#8b0000]',
        iconColor: 'text-[#8b0000]',
        iconBg: 'bg-[#8b0000]/[0.08]',
        btnClass: 'bg-[#8b0000] hover:bg-[#8b0000]/85 text-white',
    },
    {
        categoryAr: 'للشركات',
        categoryEn: 'For Companies',
        titleAr: 'الشركات والنمو المؤسسي',
        titleEn: 'Corporate expansion',
        descriptionAr: 'اطلب مراجعة لإمكانيات شركتك وسنساعدك على هيكلة دخول السوق العراقي وبناء تحالفات تجارية دولية مستدامة.',
        descriptionEn: 'Request institutional expansion support. We assess your corporate objectives to structure market access and partnership pipelines.',
        icon: Building2,
        actionLabelAr: 'اطلب إيجازاً مهنياً',
        actionLabelEn: 'Request Brief',
        formTitle: 'نموذج طلب خدمة للشركات (Corporate Inquiry Form)',
        formFields: corporateFormFields,
        submitTitle: 'تقديم الطلب (Request Brief)',
        successMessage: 'تم استلام طلب مؤسستكم بنجاح! سيتم مراجعة الطلب من قبل قسم الشركات للتواصل معكم وتنسيق اجتماع قريباً.',
        badge: 'border-[#1e3a5f]/30 bg-[#1e3a5f]/[0.06] text-[#1e3a5f]',
        iconColor: 'text-[#1e3a5f]',
        iconBg: 'bg-[#1e3a5f]/[0.08]',
        btnClass: 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/85 text-white',
    },
]

export default function PartnershipOpportunitiesPage() {
    const { locale, dir } = useI18n()
    const isArabic = locale === 'ar'
    const ArrowIcon = isArabic ? ArrowLeft : ArrowRight
    const shouldReduceMotion = useReducedMotion() ?? false

    const heroRef = useRef<HTMLDivElement | null>(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    })

    const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 60])
    const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])

    const heroVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
        },
    }

    const heroItemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    }

    const statsItems: StatsBarItem[] = isArabic
        ? [
            { value: 15, label: 'دولة شريكة', icon: 'solar:globus-bold-duotone', suffix: '+' },
            { value: 120, label: 'شريك نشط', icon: 'solar:users-group-rounded-bold-duotone', suffix: '+' },
            { value: 250, label: 'مبادرة مشتركة', icon: 'solar:calendar-bold-duotone', suffix: '+' },
            { value: 1000, label: 'شاب مستفيد', icon: 'solar:user-heart-bold-duotone', suffix: '+' },
        ]
        : [
            { value: 15, label: 'Partner Countries', icon: 'solar:globus-bold-duotone', suffix: '+' },
            { value: 120, label: 'Active Partners', icon: 'solar:users-group-rounded-bold-duotone', suffix: '+' },
            { value: 250, label: 'Joint Initiatives', icon: 'solar:calendar-bold-duotone', suffix: '+' },
            { value: 1000, label: 'Youth Beneficiaries', icon: 'solar:user-heart-bold-duotone', suffix: '+' },
        ]

    // Process timeline geometry (5 steps, centers at 10/30/50/70/90%)
    const start = isArabic ? 90 : 10
    const end = isArabic ? 10 : 90

    return (
        <div className="relative bg-white min-h-screen" dir={dir} lang={locale}>
            {/* ============ HERO SECTION (unchanged) ============ */}
            <motion.section
                ref={heroRef}
                className="relative bg-jaz-navy text-white overflow-hidden"
            >
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,141,75,0.12),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(30,58,95,0.3),transparent_50%)]" />
                    <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage: "url('/partners-banner.png')",
                            backgroundPosition: isArabic ? 'left center' : 'right center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-jaz-navy via-jaz-navy/85 to-jaz-navy/40 rtl:bg-gradient-to-l" />
                </div>

                <Container className="relative z-10 pt-24 pb-10 sm:pt-28 sm:pb-12">
                    <motion.div
                        style={{ y: contentY, opacity: contentOpacity }}
                        variants={heroVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl text-start"
                    >
                        <motion.h1
                            variants={heroItemVariants}
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
                        >
                            {isArabic ? 'فرص الشراكة' : 'Partnership Opportunities'}
                        </motion.h1>
                        <motion.p
                            variants={heroItemVariants}
                            className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 max-w-xl"
                        >
                            {isArabic
                                ? 'تتعاون JAZ مع المنظمين الدوليين والمؤسسات وغرف التجارة وشركاء التجارة لربط العراق بالعالم. معاً، نصنع منصات للمشاركة وتبادل المعرفة وتعزيز الاستثمار والأثر المستدام.'
                                : 'JAZ collaborates with international organizers, institutions, chambers of commerce, and trade partners to connect Iraq with the world. Together, we create platforms for participation, knowledge exchange, investment promotion, and sustainable impact.'}
                        </motion.p>
                        <motion.div
                            variants={heroItemVariants}
                            className="flex flex-wrap items-center justify-start gap-3"
                        >
                            <a
                                href="#apply"
                                className="inline-flex items-center gap-2.5 rounded-jaz bg-[#b08d4b] px-6 py-3 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#9a7a3f] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d4b]"
                            >
                                <Handshake className="h-5 w-5 shrink-0" />
                                {isArabic ? 'كن شريكاً في العراق' : 'Become a Partner in Iraq'}
                                <ChevronRight className={`h-5 w-5 shrink-0 ${isArabic ? 'rotate-180' : ''}`} />
                            </a>
                        </motion.div>
                    </motion.div>
                </Container>

                <StatsBar items={statsItems} overlap={false} />
            </motion.section>

            <main>
                {/* ============ PARTNERSHIP MODELS — white band ============ */}
                <section className="bg-white py-16 lg:py-24">
                    <Container>
                        <SectionHeader
                            title={isArabic ? 'نماذج شراكتنا' : 'Our Partnership Models'}
                            subtitle={isArabic
                                ? 'أربعة مسارات للتعاون مع المنظمين الدوليين والمؤسسات وغرف التجارة.'
                                : 'Four tracks for collaborating with international organizers, institutions, and chambers of commerce.'}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-10 lg:mt-12">
                            {modelsData.map((model, index) => {
                                const ModelIcon = model.icon
                                return (
                                    <motion.div
                                        key={index}
                                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-60px' }}
                                        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                        whileHover={shouldReduceMotion ? {} : { y: -4 }}
                                        className="relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 lg:p-7 min-h-[240px] transition-colors duration-300 hover:border-slate-300"
                                        style={{ borderColor: undefined }}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                            style={{ backgroundColor: `${model.accent}0d`, color: model.accent }}
                                        >
                                            <ModelIcon className="h-6 w-6" />
                                        </div>

                                        <h3 className="font-extrabold text-slate-900 text-base lg:text-lg leading-snug mb-3">
                                            {isArabic ? model.titleAr : model.titleEn}
                                        </h3>

                                        <p className="text-sm text-slate-600 leading-relaxed mt-auto">
                                            {isArabic ? model.descAr : model.descEn}
                                        </p>

                                        <div
                                            className="mt-5 flex items-center gap-2 text-xs font-bold"
                                            style={{ color: model.accent }}
                                        >
                                            <span className="h-px w-5 bg-current opacity-50" />
                                            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </Container>
                </section>

                {/* ============ WHY PARTNER — navy band (rhythmic contrast) ============ */}
                <section className="relative bg-[#0b1426] text-white py-16 lg:py-24">
                    <Container className="relative">
                        <SectionHeader
                            dark
                            title={isArabic ? 'لماذا الشراكة مع JAZ' : 'Why Partner With JAZ'}
                            subtitle={isArabic
                                ? 'ست مزايا تجعل التعاون مع منصة جاز قراراً مؤسسياً مدروساً.'
                                : 'Six advantages that make partnering with JAZ a deliberate institutional choice.'}
                        />

                        <ul className="grid grid-cols-1 md:grid-cols-2 mt-10 lg:mt-14">
                            {whyItems.map((item, index) => {
                                const isOdd = index % 2 === 0
                                const isLastMobile = index === whyItems.length - 1
                                const isLastRowDesktop = index >= whyItems.length - 2
                                return (
                                    <motion.li
                                        key={index}
                                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
                                        className={[
                                            'group flex items-center gap-4 px-2 py-5 lg:px-4 lg:py-6',
                                            'border-b border-white/10',
                                            isOdd ? 'md:border-e md:border-white/10' : '',
                                            isLastMobile ? 'border-b-0' : '',
                                            isLastRowDesktop ? 'md:border-b-0' : '',
                                        ].join(' ')}
                                    >
                                        <span className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/10 text-slate-300 transition-colors duration-300 group-hover:bg-[#8B0000] group-hover:border-[#8B0000] group-hover:text-white">
                                            <Check className="h-5 w-5" />
                                        </span>
                                        <span className="flex-1 text-sm sm:text-base font-bold text-slate-100 leading-snug">
                                            {isArabic ? item.ar : item.en}
                                        </span>
                                    </motion.li>
                                )
                            })}
                        </ul>
                    </Container>
                </section>

                {/* ============ PARTNERSHIP PROCESS — platinum band ============ */}
                <section className="bg-[#f5f7fa] py-16 lg:py-24">
                    <Container>
                        <SectionHeader
                            title={isArabic ? 'عملية الشراكة' : 'Our Partnership Process'}
                            subtitle={isArabic
                                ? 'خمس مراحل واضحة من الاستكشاف حتى قياس الأثر.'
                                : 'Five clear stages from exploration to impact measurement.'}
                        />

                        <div className="relative mt-12 lg:mt-16">
                            {/* DESKTOP TIMELINE */}
                            <div className="hidden md:block relative pb-2">
                                <div className="absolute left-0 right-0 top-7 h-[4px] -z-0">
                                    <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                        <line x1={`${start}%`} y1="50%" x2={`${end}%`} y2="50%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
                                        <motion.line
                                            x1={`${start}%`}
                                            y1="50%"
                                            x2={`${end}%`}
                                            y2="50%"
                                            stroke="#64748b"
                                            strokeWidth="2"
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>

                                <div className="grid grid-cols-5 gap-4 relative z-10">
                                    {processSteps.map((step, index) => {
                                        const StepIcon = step.icon
                                        return (
                                            <div key={index} className="flex flex-col items-center text-center group">
                                                <motion.div
                                                    initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8, opacity: 0 }}
                                                    whileInView={{ scale: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.35, delay: index * 0.1 }}
                                                    className="w-14 h-14 rounded-full border-2 bg-[#f5f7fa] flex items-center justify-center mb-6 transition-colors duration-300 relative border-slate-300 text-slate-400 group-hover:border-[#8B0000] group-hover:text-[#8B0000]"
                                                >
                                                    <StepIcon className="h-6 w-6" />
                                                </motion.div>

                                                <h4 className="font-extrabold text-sm lg:text-base mb-2.5 text-slate-800 group-hover:text-[#8B0000] transition-colors duration-300">
                                                    {isArabic ? step.titleAr : step.titleEn}
                                                </h4>

                                                <p className="text-sm text-slate-600 leading-relaxed max-w-[22ch]">
                                                    {isArabic ? step.descAr : step.descEn}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* MOBILE TIMELINE */}
                            <div className="md:hidden relative ps-8 pe-2">
                                <div className="absolute top-5 bottom-4 start-5 w-[4px] -z-0 -translate-x-1/2 rtl:translate-x-1/2">
                                    <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
                                        <motion.line
                                            x1="50%"
                                            y1="0%"
                                            x2="50%"
                                            y2="100%"
                                            stroke="#64748b"
                                            strokeWidth="2"
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>

                                <div className="flex flex-col gap-8 relative z-10">
                                    {processSteps.map((step, index) => {
                                        const StepIcon = step.icon
                                        return (
                                            <div key={index} className="flex gap-4 items-start group">
                                                <motion.div
                                                    initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8, opacity: 0 }}
                                                    whileInView={{ scale: 1, opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.35, delay: index * 0.1 }}
                                                    className="w-10 h-10 rounded-full border-2 bg-[#f5f7fa] flex items-center justify-center shrink-0 transition-colors duration-300 relative border-slate-300 text-slate-400 group-hover:border-[#8B0000] group-hover:text-[#8B0000]"
                                                >
                                                    <StepIcon className="h-5 w-5" />
                                                </motion.div>
                                                <div className="pt-1 text-start">
                                                    <h4 className="font-extrabold text-sm mb-1.5 text-slate-800 group-hover:text-[#8B0000] transition-colors duration-300">
                                                        {isArabic ? step.titleAr : step.titleEn}
                                                    </h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed max-w-[44ch]">
                                                        {isArabic ? step.descAr : step.descEn}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ============ OPPORTUNITIES — white band ============ */}
                <section id="apply" className="scroll-mt-24 bg-white py-16 lg:py-24">
                    <Container>
                        <SectionHeader
                            title={isArabic ? 'فرص التقدم' : 'Ways to Apply'}
                            subtitle={isArabic
                                ? 'ثلاث قنوات للأفراد والمؤسسات والشركات للانضمام إلى شبكة جاز.'
                                : 'Three channels for individuals, organizations, and companies to join the JAZ network.'}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-10 lg:mt-12 text-start">
                            {formSectionData.map((section, index) => {
                                const Icon = section.icon
                                return (
                                    <motion.article
                                        key={section.titleAr}
                                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-60px' }}
                                        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                        whileHover={shouldReduceMotion ? {} : { y: -5 }}
                                        className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/70 transition-colors duration-300 hover:border-slate-300"
                                    >
                                        <div className="relative flex flex-col p-6 lg:p-7 flex-1">
                                            <div className="mb-5 flex items-start justify-between gap-3">
                                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${section.iconBg} ${section.iconColor}`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <span className={`inline-flex items-center rounded-full border ${section.badge} px-3 py-1 text-[11px] font-bold tracking-wide`}>
                                                    {isArabic ? section.categoryAr : section.categoryEn}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-extrabold leading-snug text-slate-900 mb-3 text-balance">
                                                {isArabic ? section.titleAr : section.titleEn}
                                            </h3>

                                            <p className="text-sm leading-relaxed text-slate-600">
                                                {isArabic ? section.descriptionAr : section.descriptionEn}
                                            </p>

                                            <div className="mt-6 pt-5 border-t border-slate-200/60">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className={`h-11 w-full rounded-md border-0 px-6 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-98 ${section.btnClass}`}>
                                                            {isArabic ? section.actionLabelAr : section.actionLabelEn}
                                                            <ArrowIcon className={`h-4 w-4 ${isArabic ? 'mr-2' : 'ml-2'}`} />
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
                                                                    await submitStaticPartnerForm(data, section.titleAr)
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
                        </div>
                    </Container>
                </section>

                {/* ============ FINAL CTA — navy band ============ */}
                <section className="bg-[#0b1426] text-white py-5 lg:py-8">
                    <Container>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                            <div className="flex items-start gap-5">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                                    <Handshake className="h-8 w-8 text-[#b08d4b]" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-balance">
                                        {isArabic ? 'أسّس حضورك في العراق' : 'Establish Your Footprint in Iraq'}
                                    </h2>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                                        {isArabic
                                            ? 'انضم إلى شبكتنا المؤسسية لتطوير برامج التبادل التجاري، والاستثمار، والتوسع المشترك.'
                                            : 'Connect with our institutional network to develop long-term trade, investment, and market expansion programs.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 shrink-0">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#8b0000] hover:bg-[#6b0000] text-white font-bold transition-colors duration-200">
                                            {isArabic ? 'أبدِ اهتمامك' : 'Express Interest'}
                                            <ChevronRight className={`h-4 w-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
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
                                                    {isArabic ? 'طلب خدمة للشركات' : 'Corporate Inquiry'}
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
                                                fields={corporateFormFields}
                                                onSubmit={async (data) => {
                                                    await submitStaticPartnerForm(data, 'corporate-cta')
                                                }}
                                                submitLabel={isArabic ? 'تقديم الطلب' : 'Request Brief'}
                                                successMessage={isArabic
                                                    ? 'تم استلام طلب مؤسستكم بنجاح! سيتم مراجعة الطلب من قبل قسم الشركات للتواصل معكم وتنسيق اجتماع قريباً.'
                                                    : 'Your request has been received! Our corporate team will review and contact you to arrange a meeting.'}
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button className="border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium">
                                    <Download className={`h-5 w-5 ${isArabic ? 'ml-3' : 'mr-3'}`} />
                                    {isArabic ? 'تحميل دليل الشراكة' : 'Download Partnership Guide'}
                                </Button>
                            </div>
                        </div>
                    </Container>
                </section>
            </main>
        </div>
    )
}
