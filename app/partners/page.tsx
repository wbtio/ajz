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
    Quote,
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
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
    },
    {
        icon: UsersRound,
        titleAr: 'شريك دعم الوفود',
        titleEn: 'Delegation Support Partner',
        descAr: 'التعاون لتنظيم وتسهيل وفود المشترين والبائعين والزيارات وبرامج التواصل التجاري.',
        descEn: 'Collaborate to organize and facilitate buyer/seller delegations, visits, and B2B matchmaking programs.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    {
        icon: HandshakeIcon,
        titleAr: 'التعاون المؤسسي',
        titleEn: 'Institutional Cooperation',
        descAr: 'الشراكة مع المؤسسات في البحث وتبادل المعرفة والحوار السياسي وبناء القدرات.',
        descEn: 'Partner with institutions on research, knowledge exchange, policy dialogue, and capacity building.',
        color: 'text-teal-500',
        bgColor: 'bg-teal-50',
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
        descriptionAr: 'فرصة مثالية للشباب لتطوير مشاريعهم أو الانضمام إلى بيئة عمل محترفة تتبنى أفكارهم الريادية وتحولها إلى واقع ملموس بدعم استراتيجي ومؤسسي متكامل.',
        descriptionEn: 'An ideal opportunity for youth to develop their projects or join a professional environment that adopts their entrepreneurial ideas and turns them into reality with integrated strategic and institutional support.',
        icon: Rocket,
        actionLabelAr: 'أرسل تفاصيل مشروعك',
        actionLabelEn: 'Submit Your Project',
        formTitle: 'نموذج تقديم طلب مشروع (Startup Application)',
        formFields: startupFormFields,
        submitTitle: 'إرسال الفكرة (Submit Idea)',
        successMessage: 'تم استلام بيانات مشروعك بنجاح! فريقنا سيقوم بمراجعة الفكرة والتواصل معك قريباً.',
    },
    {
        categoryAr: 'للمؤسسات',
        categoryEn: 'For Organizations',
        titleAr: 'الفريق التنظيمي للمعارض والمؤتمرات',
        titleEn: 'Event Committees',
        descriptionAr: 'فرصة عملية للانضمام إلى فرق التنفيذ الميداني والتنظيمي للمعارض والمؤتمرات ضمن بيئة سريعة الإيقاع ومسؤولة عن الجودة والتنسيق للحصول على خبرة احترافية.',
        descriptionEn: 'A practical opportunity to join high-tempo event execution teams responsible for coordination, quality, and on-ground operations to gain professional experience.',
        icon: BookOpen,
        actionLabelAr: 'إرسال طلب الانضمام',
        actionLabelEn: 'Apply Now',
        formTitle: 'نموذج طلب الانضمام (Application Form)',
        formFields: committeesFormFields,
        submitTitle: 'إرسال الطلب (Submit Application)',
        successMessage: 'تم استلام طلب انضمامك بنجاح! سيتم مراجعة طلبك من قبل قسم الموارد البشرية وتحديد موعد للمقابلة قريباً.',
    },
    {
        categoryAr: 'للشركات',
        categoryEn: 'For Companies',
        titleAr: 'الشركات والنمو',
        titleEn: 'Corporate and Growth',
        descriptionAr: 'هل تبحث عن مسار نمو مؤسسي ودولي؟ اطلب إيجازاً مهنياً وسنراجع احتياج شركتكم لنحدد نقطة الدخول الأنسب وخطة التحرك التالية عبر خدماتنا الاستراتيجية.',
        descriptionEn: 'Looking for an institutional and international growth path? Request a professional brief and we will assess your company needs to define the right entry point and next move through our strategic services.',
        icon: Building2,
        actionLabelAr: 'اطلب إيجازاً مهنياً',
        actionLabelEn: 'Request Brief',
        formTitle: 'نموذج طلب خدمة للشركات (Corporate Inquiry Form)',
        formFields: corporateFormFields,
        submitTitle: 'تقديم الطلب (Request Brief)',
        successMessage: 'تم استلام طلب مؤسستكم بنجاح! سيتم مراجعة الطلب من قبل قسم الشركات للتواصل معكم وتنسيق اجتماع قريباً.',
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
                            backgroundPosition: 'center center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-jaz-navy via-jaz-navy/80 to-transparent" />
                </div>

                <Container className="relative z-10 pt-24 pb-20">
                    <motion.div
                        style={{ y: contentY, opacity: contentOpacity }}
                        variants={heroVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-3xl"
                    >
                        <motion.h1
                            variants={heroItemVariants}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
                        >
                            {isArabic ? 'فرص الشراكة' : 'Partnership Opportunities'}
                        </motion.h1>
                        <motion.p
                            variants={heroItemVariants}
                            className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10"
                        >
                            {isArabic
                                ? 'تتعاون JAZ مع المنظمين الدوليين والمؤسسات وغرف التجارة وشركاء التجارة لربط العراق بالعالم. معاً، نصنع منصات للمشاركة وتبادل المعرفة وتعزيز الاستثمار والأثر المستدام.'
                                : 'JAZ collaborates with international organizers, institutions, chambers of commerce, and trade partners to connect Iraq with the world. Together, we create platforms for participation, knowledge exchange, investment promotion, and sustainable impact.'}
                        </motion.p>
                        <motion.div
                            variants={heroItemVariants}
                            className="flex flex-wrap gap-4"
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

                <div className="bg-jaz-blue-accent/90 backdrop-blur-md border-t border-white/10 py-8">
                    <StatsBar items={statsItems} overlap={false} />
                </div>
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
                                            <span className="bg-teal-100 text-teal-600 p-1 rounded-full ml-3 shrink-0">
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
                                <div className="relative flex justify-between items-start pt-4">
                                    {processSteps.map((step, i) => {
                                        const StepIcon = step.icon
                                        return (
                                            <div key={i} className="flex flex-col items-center text-center w-1/5 relative z-10">
                                                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm mb-4">
                                                    {i + 1}
                                                </div>
                                                <StepIcon className="h-5 w-5 text-jaz-navy mb-2" />
                                                <h4 className="font-bold text-xs uppercase tracking-tighter">
                                                    {isArabic ? step.titleAr : step.titleEn}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 leading-tight mt-1">
                                                    {isArabic ? step.descAr : step.descEn}
                                                </p>
                                            </div>
                                        )
                                    })}
                                    <div className="absolute top-[1.25rem] left-0 w-full h-[2px] bg-gray-200 -z-0" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </motion.section>

            {/* ============ CASE STUDY / HIGHLIGHT ============ */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="py-20 bg-gray-50"
            >
                <Container>
                    <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="flex-grow p-8 lg:p-12">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/3">
                                    <div className="rounded-lg overflow-hidden shadow-lg mb-6 bg-jaz-navy flex items-center justify-center aspect-[4/3]">
                                        <div className="text-center p-6">
                                            <Building2 className="h-16 w-16 text-jaz-gold mx-auto mb-4" />
                                            <p className="text-white/60 text-sm font-medium uppercase tracking-wider">
                                                {isArabic ? 'معرض هانوفر ميسي' : 'Hannover Messe'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold text-jaz-gold uppercase tracking-widest mb-1">
                                            {isArabic ? 'قصة شراكة' : 'Partnership Highlight'}
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-jaz-navy mb-4">
                                            {isArabic ? 'هانوفر ميسي – ألمانيا' : 'Hannover Messe – Germany'}
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed mb-6">
                                            {isArabic
                                                ? 'JAZ هي الممثل الرسمي في العراق لمعرض هانوفر ميسي، المعرض الصناعي الرائد عالمياً، لربط الصناعة العراقية بالابتكار والتكنولوجيا العالمية.'
                                                : 'JAZ is the Official Representative in Iraq for Hannover Messe, the world\'s leading industrial trade fair, connecting Iraqi industry with global innovation and technology.'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-3">
                                                <Icon icon="solar:clock-circle-bold-duotone" className="text-jaz-navy text-xl shrink-0" />
                                                <div>
                                                    <div className="font-bold">{isArabic ? '٨' : '8'}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                        {isArabic ? 'سنوات من الشراكة' : 'Years of Partnership'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Icon icon="solar:users-group-rounded-bold-duotone" className="text-jaz-navy text-xl shrink-0" />
                                                <div>
                                                    <div className="font-bold">1,850+</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                        {isArabic ? 'زائر عراقي' : 'Iraqi Visitors'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Icon icon="solar:buildings-bold-duotone" className="text-jaz-navy text-xl shrink-0" />
                                                <div>
                                                    <div className="font-bold">220+</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                        {isArabic ? 'شركة عراقية' : 'Iraqi Companies'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Icon icon="solar:dollar-bold-duotone" className="text-jaz-navy text-xl shrink-0" />
                                                <div>
                                                    <div className="font-bold">$180M+</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                        {isArabic ? 'صفقات تم تسهيلها' : 'Deals Facilitated'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-2/3 lg:pr-12 lg:border-r border-gray-100 flex flex-col justify-center">
                                    <div className="mb-12">
                                        <Quote className="h-10 w-10 text-gray-200 mb-4" />
                                        <blockquote className="text-xl sm:text-2xl italic font-medium text-jaz-navy leading-snug mb-6">
                                            {isArabic
                                                ? '"شراكتنا مع JAZ كانت محورية في فتح باب القطاع الصناعي العراقي. احترافيتهم ومعرفتهم بالسوق وشبكتهم القوية تجعلهم شريكاً مثالياً للنمو المستدام."'
                                                : '"Our partnership with JAZ has been instrumental in opening the door to Iraq\'s industrial sector. Their professionalism, market knowledge, and strong network make them an ideal partner for sustainable growth."'}
                                        </blockquote>
                                        <div className="flex items-center">
                                            <div className="h-10 w-1 bg-jaz-gold ml-4" />
                                            <div>
                                                <div className="font-bold text-jaz-navy">
                                                    {isArabic ? 'د. يوخن كوكلر' : 'Dr. Jochen Köckler'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {isArabic ? 'الرئيس التنفيذي، دويتشه ميسه إيه جي' : 'CEO, Deutsche Messe AG'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                        <h4 className="font-bold text-jaz-navy mb-2">
                                            {isArabic ? 'عن هانوفر ميسي' : 'About Hannover Messe'}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-6">
                                            {isArabic
                                                ? 'هانوفر ميسي هو المعرض الصناعي الرائد عالمياً، يعرض الابتكارات في الأتمتة والطاقة والرقمنة والتحول الصناعي.'
                                                : 'Hannover Messe is the world\'s leading industrial trade fair, showcasing innovations in automation, energy, digitalization, and industrial transformation.'}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="bg-red-600 text-white px-4 py-2 flex items-center font-bold rounded">
                                                <span className="text-xs uppercase ml-2">Hannover</span>
                                                <span className="text-sm">MESSE</span>
                                            </div>
                                            <div className="bg-jaz-navy text-white px-4 py-2 flex items-center font-bold rounded">
                                                <span className="text-xs uppercase ml-2">Deutsche</span>
                                                <span className="text-sm">Messe</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-10 text-start"
                    >
                        {formSectionData.map((section, index) => {
                            const Icon = section.icon
                            const isLastOddCard = formSectionData.length % 2 !== 0 && index === formSectionData.length - 1
                            return (
                                <motion.article
                                    key={section.titleAr}
                                    variants={cardVariants}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                                    className={`group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.03)] hover:shadow-[0_40px_100px_rgba(15,23,42,0.08)] ${isLastOddCard ? 'sm:col-span-2' : ''}`}
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
                                    <div className="absolute right-[-15%] top-[-15%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-slate-500/5 to-slate-300/5 blur-[80px] transition-transform duration-700 group-hover:scale-125" />

                                    <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col h-full">
                                        <div className="mb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                            <div>
                                                <div className="mb-2 inline-flex items-center rounded-full border border-slate-600/12 bg-jaz-gold/10 px-3 py-0.5 text-xs font-bold tracking-wide text-jaz-gold">
                                                    {isArabic ? section.categoryAr : section.categoryEn}
                                                </div>
                                                <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl lg:text-2xl group-hover:text-jaz-gold transition-colors duration-300">
                                                    {isArabic ? section.titleAr : section.titleEn}
                                                </h2>
                                            </div>
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border-2 border-slate-700/10 bg-jaz-gold/10 text-jaz-gold shadow-sm transition-transform duration-500 group-hover:rotate-6 ${isArabic ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                        </div>

                                        <p className="mb-4 text-sm leading-relaxed text-slate-600 lg:max-w-4xl">
                                            {isArabic ? section.descriptionAr : section.descriptionEn}
                                        </p>

                                        <div className="mt-auto flex justify-end border-t border-slate-200/50 pt-3">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="h-11 w-full rounded-2xl border-0 bg-jaz-gold hover:bg-jaz-gold/80 px-6 text-sm font-bold text-jaz-navy shadow-[0_12px_24px_rgba(176,141,75,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(176,141,75,0.25)] sm:w-auto active:scale-98">
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
            <section className="py-12 bg-jaz-navy text-white">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center">
                            <div className="ml-6 bg-white/10 p-4 rounded-lg">
                                <Handshake className="h-8 w-8 text-jaz-gold" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {isArabic ? 'كن شريكاً في العراق' : 'Become a Partner in Iraq'}
                                </h2>
                                <p className="text-gray-400">
                                    {isArabic
                                        ? 'انضم إلى شبكتنا العالمية من الشركاء الموثوقين وابنِ تعاوناً هادفاً.'
                                        : 'Join our global network of trusted partners and build meaningful collaborations.'}
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
