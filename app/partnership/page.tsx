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
    Globe,
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
import { Icon } from '@iconify/react'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'

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
        color: 'text-jaz-gold',
        bgColor: 'bg-jaz-gold/10',
    },
    {
        icon: Megaphone,
        titleAr: 'شريك الترويج والتوعية',
        titleEn: 'Promotion & Outreach Partner',
        descAr: 'الترويج المشترك للفعاليات والمبادرات من خلال التسويق المشترك والتغطية الإعلامية وإشراك أصحاب المصلحة.',
        descEn: 'Co-promote events and initiatives through joint marketing, media coverage, and stakeholder engagement.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600/10',
    },
    {
        icon: UsersRound,
        titleAr: 'شريك دعم الوفود',
        titleEn: 'Delegation Support Partner',
        descAr: 'التعاون لتنظيم وتسهيل وفود المشترين والبائعين والزيارات وبرامج التواصل التجاري.',
        descEn: 'Collaborate to organize and facilitate buyer/seller delegations, visits, and B2B matchmaking programs.',
        color: 'text-[#8b0000]',
        bgColor: 'bg-[#8b0000]/10',
    },
    {
        icon: HandshakeIcon,
        titleAr: 'التعاون المؤسسي',
        titleEn: 'Institutional Cooperation',
        descAr: 'الشراكة مع المؤسسات في البحث وتبادل المعرفة والحوار السياسي وبناء القدرات.',
        descEn: 'Partner with institutions on research, knowledge exchange, policy dialogue, and capacity building.',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-600/10',
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

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
}

const staggerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
}

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
        colorClass: 'text-jaz-gold',
        bgClass: 'bg-jaz-gold/10',
        hoverBorder: 'hover:border-jaz-gold/40',
        badge: 'border-jaz-gold/20 bg-jaz-gold/5 text-jaz-gold',
        btnClass: 'bg-jaz-gold hover:bg-jaz-gold/80 text-jaz-navy shadow-[0_12px_24px_rgba(176,141,75,0.15)] hover:shadow-[0_16px_32px_rgba(176,141,75,0.25)]',
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
        colorClass: 'text-[#8b0000]',
        bgClass: 'bg-[#8b0000]/10',
        hoverBorder: 'hover:border-[#8b0000]/40',
        badge: 'border-[#8b0000]/20 bg-[#8b0000]/5 text-[#8b0000]',
        btnClass: 'bg-[#8b0000] hover:bg-[#8b0000]/80 text-white shadow-[0_12px_24px_rgba(139,0,0,0.15)] hover:shadow-[0_16px_32px_rgba(139,0,0,0.25)]',
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
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-600/10',
        hoverBorder: 'hover:border-blue-600/40',
        badge: 'border-blue-600/20 bg-blue-600/5 text-blue-600',
        btnClass: 'bg-blue-600 hover:bg-blue-600/80 text-white shadow-[0_12px_24px_rgba(37,99,235,0.15)] hover:shadow-[0_16px_32px_rgba(37,99,235,0.25)]',
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

    return (
        <div className="relative overflow-hidden bg-white min-h-screen" dir={dir} lang={locale}>
            {/* ============ HERO SECTION ============ */}
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
                            className="flex flex-wrap justify-start gap-3"
                        >
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-jaz-gold hover:bg-jaz-gold/80 text-jaz-navy font-bold border-0 shadow-lg">
                                        <Handshake className="h-5 w-5 ml-2" />
                                        {isArabic ? 'كن شريكاً في العراق' : 'Become a Partner in Iraq'}
                                        <ChevronRight className="h-4 w-4 mr-2" />
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
                                                {isArabic ? 'أرسل تفاصيل مشروعك' : 'Submit Your Project'}
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
                                            fields={startupFormFields}
                                            onSubmit={async (data) => {
                                                await submitStaticPartnerForm(data, 'startup')
                                            }}
                                            submitLabel={isArabic ? 'إرسال الفكرة' : 'Submit Idea'}
                                            successMessage={isArabic
                                                ? 'تم استلام بيانات مشروعك بنجاح! فريقنا سيقوم بمراجعة الفكرة والتواصل معك قريباً.'
                                                : 'Your project has been received successfully! Our team will review it and contact you soon.'}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium">
                                        <Globe className="h-5 w-5 ml-2" />
                                        {isArabic ? 'استكشف المشاركة الدولية' : 'Explore International Participation'}
                                        <ChevronRight className="h-4 w-4 mr-2" />
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
                                                {isArabic ? 'طلب انضمام للجان التنظيمية' : 'Committee Application'}
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
                                            fields={committeesFormFields}
                                            onSubmit={async (data) => {
                                                await submitStaticPartnerForm(data, 'committee')
                                            }}
                                            submitLabel={isArabic ? 'إرسال الطلب' : 'Submit Application'}
                                            successMessage={isArabic
                                                ? 'تم استلام طلب انضمامك بنجاح! سيتم مراجعة طلبك من قبل قسم الموارد البشرية وتحديد موعد للمقابلة قريباً.'
                                                : 'Your application has been received! HR will review it and schedule an interview soon.'}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium">
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                        {isArabic ? 'طلب معلومات الشراكة' : 'Request Partnership Information'}
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
                                                await submitStaticPartnerForm(data, 'corporate')
                                            }}
                                            submitLabel={isArabic ? 'تقديم الطلب' : 'Request Brief'}
                                            successMessage={isArabic
                                                ? 'تم استلام طلب مؤسستكم بنجاح! سيتم مراجعة الطلب من قبل قسم الشركات للتواصل معكم وتنسيق اجتماع قريباً.'
                                                : 'Your request has been received! Our corporate team will review and contact you to arrange a meeting.'}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    </motion.div>
                </Container>

                <StatsBar items={statsItems} overlap={false} />
            </motion.section>

            {/* ============ PARTNERSHIP MODELS ============ */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="py-20 bg-white"
            >
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-7">
                            <h2 className="text-2xl sm:text-3xl font-bold text-jaz-navy mb-8">
                                {isArabic ? 'نماذج شراكتنا' : 'Our Partnership Models'}
                            </h2>
                            <motion.div
                                variants={staggerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                            >
                                {modelsData.map((model, index) => {
                                    const ModelIcon = model.icon
                                    return (
                                        <motion.div
                                            key={index}
                                            variants={cardVariants}
                                            className="p-6 border border-gray-100 rounded-lg bg-gray-50 text-center hover:shadow-lg transition-shadow"
                                        >
                                            <div className={`flex justify-center mb-4 ${model.bgColor} w-14 h-14 mx-auto rounded-full items-center justify-center`}>
                                                <ModelIcon className={`h-7 w-7 ${model.color}`} />
                                            </div>
                                            <h3 className="font-bold text-jaz-navy mb-3">
                                                {isArabic ? model.titleAr : model.titleEn}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {isArabic ? model.descAr : model.descEn}
                                            </p>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5 space-y-12">
                            <motion.div variants={sectionVariants}>
                                <h2 className="text-2xl sm:text-3xl font-bold text-jaz-navy mb-8">
                                    {isArabic ? 'لماذا الشراكة مع JAZ' : 'Why Partner With JAZ'}
                                </h2>
                                <ul className="space-y-4">
                                    {whyItems.map((item, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="bg-jaz-gold/10 text-jaz-gold p-1 rounded-full ml-3 shrink-0">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="text-gray-700 font-medium">
                                                {isArabic ? item.ar : item.en}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div variants={sectionVariants}>
                                <h2 className="text-2xl sm:text-3xl font-bold text-jaz-navy mb-8">
                                    {isArabic ? 'عملية الشراكة' : 'Our Partnership Process'}
                                </h2>
                                <div className="relative space-y-6 pt-4 text-start">
                                    {processSteps.map((step, i) => {
                                        const StepIcon = step.icon
                                        return (
                                            <div key={i} className="flex gap-4 relative items-start group">
                                                {/* Connecting line */}
                                                {i < processSteps.length - 1 && (
                                                    <div className="absolute start-4 top-8 bottom-0 w-[2px] bg-gray-200 -z-0" />
                                                )}
                                                <div className="w-8 h-8 rounded-full bg-jaz-gold text-jaz-navy flex items-center justify-center font-bold text-sm shrink-0 z-10 group-hover:scale-105 transition-transform duration-300">
                                                    {i + 1}
                                                </div>
                                                <div className="pt-0.5">
                                                    <h4 className="font-extrabold text-sm text-jaz-navy flex items-center gap-1.5 leading-none mb-1">
                                                        <StepIcon className="h-4 w-4 text-jaz-gold shrink-0" />
                                                        {isArabic ? step.titleAr : step.titleEn}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 leading-normal">
                                                        {isArabic ? step.descAr : step.descEn}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </motion.section>

            {/* ============ OPPORTUNITIES SECTION (Keep the original 3 cards) ============ */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="py-20 bg-white"
            >
                <Container>
                    <motion.div
                        variants={staggerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 text-start"
                    >
                        {formSectionData.map((section, index) => {
                            const Icon = section.icon
                            return (
                                <motion.article
                                    key={section.titleAr}
                                    variants={cardVariants}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                                    className={`group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.03)] hover:shadow-[0_40px_100px_rgba(15,23,42,0.08)] transition-all duration-300 ${section.hoverBorder}`}
                                >
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                                        style={{
                                            backgroundImage: `
                                                radial-gradient(circle, rgba(139,0,0,0.4) 1px, transparent 1px),
                                                linear-gradient(to right, rgba(15,23,42,0.03) 1px, transparent 1px),
                                                linear-gradient(to bottom, rgba(15,23,42,0.03) 1px, transparent 1px)
                                            `,
                                            backgroundSize: '24px 24px',
                                        }}
                                    />
                                    <div className="absolute right-[-15%] top-[-15%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-slate-500/5 to-slate-300/5 blur-[80px] transition-all duration-700 group-hover:scale-125 group-hover:from-slate-500/10" />

                                    <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col h-full">
                                        <div className="mb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                            <div>
                                                <div className={`mb-2 inline-flex items-center rounded-full border ${section.badge} px-3 py-0.5 text-xs font-bold tracking-wide`}>
                                                    {isArabic ? section.categoryAr : section.categoryEn}
                                                </div>
                                                <h2 className={`text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl lg:text-2xl group-hover:${section.colorClass} transition-colors duration-300`}>
                                                    {isArabic ? section.titleAr : section.titleEn}
                                                </h2>
                                            </div>
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border-2 border-slate-700/10 ${section.bgClass} ${section.colorClass} shadow-sm transition-transform duration-500 group-hover:rotate-6 ${isArabic ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                        </div>

                                        <p className="mb-4 text-sm leading-relaxed text-slate-600 lg:max-w-4xl">
                                            {isArabic ? section.descriptionAr : section.descriptionEn}
                                        </p>

                                        <div className="mt-auto flex justify-end border-t border-slate-200/50 pt-3">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className={`h-11 w-full rounded-2xl border-0 px-6 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 sm:w-auto active:scale-98 ${section.btnClass}`}>
                                                        {isArabic ? section.actionLabelAr : section.actionLabelEn}
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
                    </motion.div>
                </Container>
            </motion.section>

            {/* ============ FINAL CTA ============ */}
            <section className="py-12 bg-jaz-navy text-white border-t border-jaz-gold/20 relative overflow-hidden">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center">
                            <div className="ml-6 bg-white/5 p-4 rounded-lg border border-white/10">
                                <Handshake className="h-8 w-8 text-jaz-gold" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {isArabic ? 'أسّس حضورك في العراق' : 'Establish Your Footprint in Iraq'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {isArabic
                                        ? 'انضم إلى شبكتنا المؤسسية لتطوير برامج التبادل التجاري، والاستثمار، والتوسع المشترك.'
                                        : 'Connect with our institutional network to develop long-term trade, investment, and market expansion programs.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-jaz-gold hover:bg-jaz-gold/80 text-jaz-navy font-bold shadow-lg hover:scale-105 transition-all">
                                        {isArabic ? 'أبدِ اهتمامك' : 'Express Interest'}
                                        <ChevronRight className="h-4 w-4 mr-2" />
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
                                <Download className="h-5 w-5 ml-3" />
                                {isArabic ? 'تحميل دليل الشراكة' : 'Download Partnership Guide'}
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}
