'use client'

import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    ArrowRight,
    ArrowLeft,
    Building2,
    GraduationCap,
    UserRound,
    Sparkles,
    Check,
    Search,
    Send,
    PhoneCall,
    FileSignature,
    Rocket,
    ChevronRight,
} from 'lucide-react'
import { submitPartnerForm } from '@/app/dashboard/partners/actions'
import { DynamicForm } from '@/components/shared/dynamic-form'
import { createClient } from '@/lib/supabase/client'
import { parseFormFields } from '@/lib/form-fields'
import type { FormField } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { StatsBar, type StatsBarItem } from '@/components/shared/stats-bar'
import { SectionHeader } from '@/components/home'

// ===== Cooperation request form (14 fields per PDF spec) =====
const cooperationFormFields: FormField[] = [
    {
        id: 'Cooperation Path | مسار التعاون',
        label_ar: 'مسار التعاون',
        label_en: 'Cooperation Path',
        type: 'select',
        options: [
            'Iraqi Companies and Institutions | الشركات والمؤسسات',
            'Universities and Academic Institutions | الجامعات والمؤسسات الأكاديمية',
            'Professionals and Individuals | المهنيون والأفراد',
            'Youth Opportunities | فرص الشباب',
        ],
        required: true,
    },
    {
        id: 'Applicant Type | صفة مقدم الطلب',
        label_ar: 'صفة مقدم الطلب',
        label_en: 'Applicant Type',
        type: 'select',
        options: ['Organization | مؤسسة', 'Individual | فرد'],
        required: true,
    },
    {
        id: 'Full Name | الاسم الكامل',
        label_ar: 'الاسم الكامل',
        label_en: 'Full Name',
        type: 'text',
        required: true,
    },
    {
        id: 'Organization Name | اسم الجهة',
        label_ar: 'اسم الجهة',
        label_en: 'Organization Name',
        type: 'text',
        required: false,
    },
    {
        id: 'Job Title | المسمى الوظيفي',
        label_ar: 'المسمى الوظيفي',
        label_en: 'Job Title',
        type: 'text',
        required: false,
    },
    {
        id: 'Country | الدولة',
        label_ar: 'الدولة',
        label_en: 'Country',
        type: 'text',
        required: true,
    },
    {
        id: 'City | المدينة',
        label_ar: 'المدينة',
        label_en: 'City',
        type: 'text',
        required: true,
    },
    {
        id: 'Sector or Specialization | القطاع أو التخصص',
        label_ar: 'القطاع أو التخصص',
        label_en: 'Sector or Specialization',
        type: 'text',
        required: true,
    },
    {
        id: 'Email Address | البريد الإلكتروني',
        label_ar: 'البريد الإلكتروني',
        label_en: 'Email Address',
        type: 'text',
        required: true,
    },
    {
        id: 'Phone or WhatsApp | رقم الهاتف أو واتساب',
        label_ar: 'رقم الهاتف أو واتساب',
        label_en: 'Phone or WhatsApp',
        type: 'text',
        required: true,
    },
    {
        id: 'Website | الموقع الإلكتروني',
        label_ar: 'الموقع الإلكتروني',
        label_en: 'Website',
        type: 'text',
        required: false,
    },
    {
        id: 'Proposed Cooperation | التعاون المقترح',
        label_ar: 'التعاون المقترح',
        label_en: 'Proposed Cooperation',
        type: 'textarea',
        required: true,
    },
    {
        id: 'Cooperation Objectives | أهداف التعاون',
        label_ar: 'أهداف التعاون',
        label_en: 'Cooperation Objectives',
        type: 'textarea',
        required: true,
    },
]

// ===== Cooperation Paths (Section 2 of PDF) =====
const cooperationPaths = [
    {
        slug: 'companies',
        icon: Building2,
        titleEn: 'Companies and Institutions',
        titleAr: 'الشركات والمؤسسات',
        pdfLabelEn: '2.2. Companies and Institutions',
        pdfLabelAr: 'الشركات والمؤسسات العراقية',
        bodyEn:
            "We works with companies and institutions from different commercial, industrial, medical, engineering, and professional sectors.\n\nCooperation opportunities are selected according to the organization's field of work, professional objectives, and the nature of the relevant exhibition or conference.",
        bodyAr:
            'تتعاون جاز مع مختلف القطاعات التجارية والصناعية والطبية والهندسية والمهنية.\n\nيتم اختيار فرص التعاون وفقاً لمجال عمل الجهة، وأهدافها المهنية، وطبيعة المعرض أو المؤتمر ذي العلاقة.',
        areasEn: [
            'Participation in international exhibitions and conferences',
            'Exhibitor opportunities',
            'Business and professional delegations',
            'Sponsorship opportunities',
        ],
        areasAr: [
            'المشاركة في المعارض والمؤتمرات الدولية',
            'فرص المشاركة كعارض',
            'الوفود التجارية والمهنية',
            'فرص الرعاية',
        ],
        noteEn:
            'Each cooperation is organized through a clear framework that defines the objectives, responsibilities, and expected outcomes.',
        noteAr:
            'كل تعاون منظم من خلال إطار واضح يحدد الأهداف والمسؤوليات والنتائج المتوقعة.',
        ctaEn: 'Submit Your Interest',
        ctaAr: 'أرسل اهتمامك بالتعاون',
        accent: '#1e3a5f',
    },
    {
        slug: 'universities',
        icon: GraduationCap,
        titleEn: 'Universities and Academic Institutions',
        titleAr: 'الجامعات والمؤسسات الأكاديمية',
        pdfLabelEn: '2.3. Universities and Academic Institutions',
        pdfLabelAr: 'الجامعات والمؤسسات الأكاديمية',
        bodyEn:
            "We cooperates with universities and academic institutions to support their participation in specialized exhibitions, conferences, and professional development programs.\n\nCooperation is organized according to the institution's academic fields, professional objectives, and areas of interest.",
        bodyAr:
            'تتعاون جاز مع الجامعات والمؤسسات الأكاديمية لدعم مشاركتها في المعارض المتخصصة والمؤتمرات وبرامج التطوير المهني.\n\nيتم تنظيم التعاون وفقاً للتخصصات الأكاديمية للجهة، وأهدافها المهنية، ومجالات اهتمامها.',
        areasEn: [
            'Academic and institutional delegations',
            'Participation in international conferences',
            'Training and development programs',
            'Knowledge and professional exchange',
        ],
        areasAr: [
            'الوفود الأكاديمية والمؤسسية',
            'المشاركة في المؤتمرات الدولية',
            'برامج التدريب والتطوير',
            'تبادل المعرفة والخبرات المهنية',
        ],
        noteEn:
            'Each cooperation is developed in coordination with the university or academic institution through clearly defined objectives and responsibilities.',
        noteAr:
            'يتم تطوير كل تعاون بالتنسيق مع الجامعة أو المؤسسة الأكاديمية، وفق أهداف ومسؤوليات محددة بوضوح.',
        ctaEn: 'Explore Academic Cooperation',
        ctaAr: 'استكشف التعاون الأكاديمي',
        accent: '#0f766e',
    },
    {
        slug: 'professionals',
        icon: UserRound,
        titleEn: 'Professionals and Individuals',
        titleAr: 'المهنيون والأفراد',
        pdfLabelEn: '2.4. Professionals and Individuals',
        pdfLabelAr: 'المهنيون والأفراد',
        bodyEn:
            "We provide cooperation opportunities for professionals and individuals seeking to participate in exhibitions, conferences, professional programs.\n\nOpportunities are selected according to the applicant's specialization and experience.",
        bodyAr:
            'توفّر جاز فرصاً للتعاون مع المهنيين والأفراد الراغبين في المشاركة في المعارض والمؤتمرات والبرامج المهنية وأنشطة الفعاليات.\n\nيتم اختيار الفرص وفقاً لتخصص المتقدم، وخبرته، واهتماماته المهنية، ومتطلبات كل نشاط.',
        areasEn: [
            'Participation in specialized exhibitions and conferences',
            'Training and development programs',
            'Professional networking and knowledge exchange',
        ],
        areasAr: [
            'المشاركة في المعارض والمؤتمرات المتخصصة',
            'برامج التدريب والتطوير',
            'التواصل المهني وتبادل المعرفة',
        ],
        noteEn:
            "Participation is reviewed to ensure that the applicant's qualifications and professional background are relevant to the selected opportunity.",
        noteAr:
            'تتم مراجعة المشاركة للتأكد من توافق مؤهلات المتقدم وخلفيته المهنية مع الفرصة المختارة.',
        ctaEn: 'Explore Professional Opportunities',
        ctaAr: 'استكشف الفرص المهنية',
        accent: '#b08d4b',
    },
    {
        slug: 'youth',
        icon: Sparkles,
        titleEn: 'Youth Opportunities',
        titleAr: 'فرص الشباب',
        pdfLabelEn: '2.5. Youth Opportunities',
        pdfLabelAr: 'فرص الشباب',
        bodyEn:
            "JAZ provides structured opportunities for youth to develop practical skills, present entrepreneurial ideas, and participate in a professional working environment.\n\nYouth opportunities are supervised by the Training and Development Department and organized according to the requirements of each program or activity.",
        bodyAr:
            'توفّر جاز فرصاً منظمة للشباب لتطوير مهاراتهم العملية، وتقديم أفكارهم الريادية، والمشاركة ضمن بيئة عمل مهنية.\n\nيُشرف قسم التدريب والتطوير على فرص الشباب، ويتم تنظيمها وفقاً لمتطلبات كل برنامج أو نشاط.',
        areasEn: [
            'JAZ Youth Initiative',
            'Practical training and skills development',
            'Support for entrepreneurial ideas and projects',
            'Participation in event committees',
            'Professional networking',
            'Teamwork and field experience',
        ],
        areasAr: [
            'مبادرة جاز للشباب',
            'التدريب العملي وتطوير المهارات',
            'دعم الأفكار والمشاريع الريادية',
            'المشاركة في لجان الفعاليات',
            'بناء العلاقات المهنية',
            'العمل الجماعي والخبرة الميدانية',
        ],
        noteEn:
            "Applications are reviewed according to the applicant's interests, capabilities, and the requirements of the selected opportunity.",
        noteAr:
            'تتم مراجعة الطلبات وفقاً لاهتمامات المتقدم، وقدراته، ومتطلبات الفرصة المختارة.',
        ctaEn: 'Explore Youth Opportunities',
        ctaAr: 'استكشف فرص الشباب',
        accent: '#8b0000',
    },
]

// ===== Cooperation Process (Section 4 of PDF) =====
const processSteps = [
    {
        icon: Search,
        titleEn: 'Select a Cooperation Path',
        titleAr: 'اختيار مسار التعاون',
        descEn:
            'Choose the cooperation path that best matches your organization, profession, or interests.',
        descAr: 'اختيار المسار الذي يتناسب مع طبيعة الجهة أو تخصص المتقدم أو اهتماماته.',
    },
    {
        icon: FileSignature,
        titleEn: 'Submit Your Request',
        titleAr: 'تقديم الطلب',
        descEn:
            'Provide the required information and describe the proposed area of cooperation.',
        descAr:
            'تقديم المعلومات المطلوبة عن المتقدم أو الجهة، مع توضيح مجال التعاون المقترح.',
    },
    {
        icon: PhoneCall,
        titleEn: 'Review and Communication',
        titleAr: 'المراجعة والتواصل',
        descEn:
            'The JAZ team reviews the request and communicates with the applicant when additional information or discussion is required.',
        descAr:
            'يقوم فريق جاز بمراجعة الطلب والتواصل مع المتقدم عند الحاجة إلى معلومات إضافية أو مناقشة التفاصيل.',
    },
    {
        icon: Check,
        titleEn: 'Define the Cooperation Framework',
        titleAr: 'تحديد إطار التعاون',
        descEn:
            'The objectives, responsibilities, scope of work, fees where applicable, and working arrangements are clearly defined.',
        descAr:
            'يتم تحديد الأهداف، والمسؤوليات، ونطاق العمل، والرسوم عند انطباقها، وآلية التنفيذ بشكل واضح.',
    },
    {
        icon: Rocket,
        titleEn: 'Begin Cooperation',
        titleAr: 'بدء التعاون',
        descEn:
            'Cooperation begins after the framework has been reviewed and agreed upon by the relevant parties.',
        descAr: 'يبدأ التعاون بعد مراجعة الإطار والاتفاق عليه من الأطراف المعنية.',
    },
]

export default function CooperationPage() {
    const { locale, dir } = useI18n()
    const isArabic = locale === 'ar'
    const ArrowIcon = isArabic ? ArrowLeft : ArrowRight
    const shouldReduceMotion = useReducedMotion() ?? false

    const [categoryFields, setCategoryFields] = useState<Record<string, FormField[]>>({})
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()
        supabase
            .from('partner_categories')
            .select('id, slug, registration_config')
            .eq('slug', 'cooperation')
            .single()
            .then(({ data }) => {
                if (!data) return
                setCategoryId(data.id)
                const parsed = parseFormFields(data.registration_config)
                if (parsed.length > 0) setCategoryFields({ cooperation: parsed })
            })
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    }, [])

    const heroRef = useRef<HTMLDivElement | null>(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    })

    const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 60])
    const contentOpacity = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.6])

    const heroVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
    }
    const heroItemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
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

    const start = isArabic ? 90 : 10
    const end = isArabic ? 10 : 90

    return (
        <div className="relative bg-white min-h-screen" dir={dir} lang={locale}>
            {/* ============ HERO ============ */}
            <motion.section ref={heroRef} className="relative bg-jaz-navy text-white overflow-hidden">
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
                            {isArabic ? 'فرص التعاون مع جاز' : 'Cooperation Opportunities with JAZ'}
                        </motion.h1>
                        <motion.p
                            variants={heroItemVariants}
                            className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 max-w-xl"
                        >
                            {isArabic
                                ? 'يمثل التعاون جزءاً أساسياً من عمل جاز. نعمل مع الشركات العراقية، والجامعات، والمهنيين، والأفراد، والشباب لتطوير فرص للمشاركة المهنية والعمل المشترك. يقوم كل تعاون على هدف واضح، وأدوار محددة، وقيمة متبادلة.'
                                : "Cooperation is an essential part of JAZ's work. We work with Iraqi companies, universities, professionals, individuals, and youth to develop opportunities for professional participation and joint work. Each cooperation is based on a clear objective, defined roles, and mutual value."}
                        </motion.p>
                        <motion.div variants={heroItemVariants} className="flex flex-wrap items-center justify-start gap-3">
                            <a
                                href="#paths"
                                className="inline-flex items-center gap-2.5 rounded-jaz bg-[#b08d4b] px-6 py-3 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#9a7a3f] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08d4b]"
                            >
                                {isArabic ? 'استكشف مسارات التعاون' : 'Explore Cooperation Paths'}
                                <ChevronRight className={`h-5 w-5 shrink-0 ${isArabic ? 'rotate-180' : ''}`} />
                            </a>
                        </motion.div>
                    </motion.div>
                </Container>

                <StatsBar items={statsItems} overlap={false} />
            </motion.section>

            <main>
                {/* ============ 2. COOPERATION PATHS ============ */}
                <section id="paths" className="bg-white py-16 lg:py-24 scroll-mt-24">
                    <Container>
                        <SectionHeader
                            title={isArabic ? 'مسارات التعاون' : 'Cooperation Paths'}
                            subtitle={
                                isArabic
                                    ? 'أربعة مسارات للتعاون: الشركات والمؤسسات، الجامعات والمؤسسات الأكاديمية، المهنيون والأفراد، وفرص الشباب.'
                                    : 'Four cooperation paths: Iraqi Companies and Institutions, Universities and Academic Institutions, Professionals and Individuals, and Youth Opportunities.'
                            }
                        />

                        <div className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {cooperationPaths.map((path, index) => {
                                const Icon = path.icon
                                const areas = isArabic ? path.areasAr : path.areasEn
                                return (
                                    <motion.article
                                        key={path.slug}
                                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-60px' }}
                                        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                        whileHover={shouldReduceMotion ? {} : { y: -4 }}
                                        className="group relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 lg:p-8 transition-colors duration-300 hover:border-slate-300"
                                    >
                                        <div className="flex items-start gap-4 mb-5">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: `${path.accent}0d`, color: path.accent }}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                    {isArabic ? path.pdfLabelAr : path.pdfLabelEn}
                                                </span>
                                                <h3 className="text-lg lg:text-xl font-extrabold leading-snug text-slate-900 text-balance">
                                                    {isArabic ? path.titleAr : path.titleEn}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-5">
                                            {isArabic ? path.bodyAr : path.bodyEn}
                                        </p>

                                        <div className="mb-5">
                                            <h4 className="text-sm font-bold text-slate-800 mb-3">
                                                {isArabic ? 'مجاالت التعاون' : 'Areas of Cooperation'}
                                            </h4>
                                            <ul className="space-y-2.5">
                                                {areas.map((area, i) => (
                                                    <li key={i} className="flex items-start gap-2.5">
                                                        <span
                                                            className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: path.accent }}
                                                        />
                                                        <span className="text-sm text-slate-700 leading-relaxed">{area}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed italic mb-6 border-s border-slate-200 ps-4">
                                            {isArabic ? path.noteAr : path.noteEn}
                                        </p>

                                        <div className="mt-auto">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        className="h-11 w-full rounded-md border-0 px-6 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
                                                        style={{ backgroundColor: path.accent, color: '#fff' }}
                                                    >
                                                        {isArabic ? path.ctaAr : path.ctaEn}
                                                        <ArrowIcon className={`h-4 w-4 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent
                                                    dir={dir}
                                                    lang={locale}
                                                    className="max-h-[92vh] w-[calc(100vw-1.25rem)] max-w-xl gap-0 overflow-hidden border-slate-200/90 bg-white p-0 sm:w-full sm:rounded-2xl"
                                                >
                                                    <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
                                                        <DialogHeader className="space-y-2 text-start">
                                                            <DialogTitle className="text-start text-xl font-bold leading-snug tracking-tight text-slate-900">
                                                                {isArabic ? 'نموذج طلب تعاون' : 'Cooperation Request Form'}
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
                                                            fields={categoryFields.cooperation || cooperationFormFields}
                                                            onSubmit={async (data) => {
                                                                await submitPartnerForm({
                                                                    category_id: categoryId ?? null,
                                                                    user_id: userId,
                                                                    data,
                                                                })
                                                            }}
                                                            submitLabel={isArabic ? 'قدّم طلب تعاون' : 'Submit a Cooperation Request'}
                                                            successMessage={
                                                                isArabic
                                                                    ? 'تم استلام طلب تعاونك بنجاح! فريق جاز سيقوم بمراجعة الطلب والتواصل معك قريباً.'
                                                                    : 'Your cooperation request has been received! Our team will review it and contact you soon.'
                                                            }
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </motion.article>
                                )
                            })}
                        </div>
                    </Container>
                </section>

                {/* ============ 4. COOPERATION PROCESS ============ */}
                <section className="bg-[#f5f7fa] py-16 lg:py-24">
                    <Container>
                        <SectionHeader
                            title={isArabic ? 'آلية التعاون' : 'Cooperation Process'}
                            subtitle={
                                isArabic
                                    ? 'تتبع جاز آلية واضحة لمراجعة طلبات التعاون وتحديد الإطار المناسب لكل متقدم أو جهة.'
                                    : "JAZ follows a clear process to review cooperation requests and identify the appropriate framework for each applicant or organization."
                            }
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

                {/* ============ FINAL STATEMENT ============ */}
                <section className="bg-white py-16 lg:py-20">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <SectionHeader
                                title={isArabic ? 'البيان الختامي للتعاون' : 'Final Cooperation Statement'}
                            />
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:p-8 text-sm lg:text-base leading-relaxed text-slate-700">
                                <p className="mb-4">
                                    {isArabic
                                        ? 'لا يُعد تقديم طلب التعاون قبولاً تلقائياً أو اتفاقاً رسمياً مع جاز. تتم مراجعة كل طلب وفقاً لمدى ملاءمته، وإمكانية تنفيذه، ومتطلبات مسار التعاون المختار.'
                                        : 'Submitting a cooperation request does not constitute automatic acceptance or create a formal agreement with JAZ. Each request is reviewed according to its relevance, feasibility, and the requirements of the selected cooperation path.'}
                                </p>
                                <p>
                                    {isArabic
                                        ? 'يبدأ التعاون فقط بعد مراجعة التفاصيل والمسؤوليات وآلية العمل والاتفاق عليها رسمياً من الأطراف المعنية.'
                                        : 'Cooperation begins only after the relevant details, responsibilities, and working arrangements have been reviewed and formally agreed upon by the parties concerned.'}
                                </p>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#0b1426] hover:bg-[#0b1426]/90 text-white font-bold h-12 px-8 rounded-md transition-all duration-200 hover:-translate-y-0.5">
                                            <Send className={`h-5 w-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                                            {isArabic ? 'قدّم طلب تعاون' : 'Submit a Cooperation Request'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                        dir={dir}
                                        lang={locale}
                                        className="max-h-[92vh] w-[calc(100vw-1.25rem)] max-w-xl gap-0 overflow-hidden border-slate-200/90 bg-white p-0 sm:w-full sm:rounded-2xl"
                                    >
                                        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
                                            <DialogHeader className="space-y-2 text-start">
                                                <DialogTitle className="text-start text-xl font-bold leading-snug tracking-tight text-slate-900">
                                                    {isArabic ? 'نموذج طلب تعاون' : 'Cooperation Request Form'}
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
                                                fields={categoryFields.cooperation || cooperationFormFields}
                                                onSubmit={async (data) => {
                                                    await submitPartnerForm({
                                                        category_id: categoryId ?? null,
                                                        user_id: userId,
                                                        data,
                                                    })
                                                }}
                                                submitLabel={isArabic ? 'قدّم طلب تعاون' : 'Submit a Cooperation Request'}
                                                successMessage={
                                                    isArabic
                                                        ? 'تم استلام طلب تعاونك بنجاح! فريق جاز سيقوم بمراجعة الطلب والتواصل معك قريباً.'
                                                        : 'Your cooperation request has been received! Our team will review it and contact you soon.'
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </Container>
                </section>
            </main>
        </div>
    )
}
