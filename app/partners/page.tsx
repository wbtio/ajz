'use client'

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
import { motion, type Variants } from 'framer-motion'
import { Grid } from '@/components/eldoraui/grid'

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

    const featureVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.96 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease, delay: i * 0.07 },
        }),
    }

    return (
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#eef2f7_100%)] pt-28 pb-24 lg:pt-36" dir={dir} lang={locale}>
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                <Grid columns={18} rows={18} height="h-full" width="w-full" className="h-[200%] w-full opacity-[0.04]" showPlusIcons={false} />
            </div>

            {/* Glowing Orbs */}
            <div className="pointer-events-none absolute left-[-8rem] top-32 h-[28rem] w-[28rem] rounded-full bg-slate-500/12 blur-[100px]" />
            <div className="pointer-events-none absolute right-[-10rem] top-56 h-[22rem] w-[22rem] rounded-full bg-slate-400/10 blur-[80px]" />

            <Container className="relative z-10">
                <div className="mx-auto mb-16 text-center max-w-3xl">
                   <motion.h1
                     initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
                     animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                     transition={{ duration: 0.85, ease }}
                     className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                   >
                     {isArabic ? 'العلاقات الاستراتيجية' : 'Strategic Relations'}
                   </motion.h1>
                </div>

                <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-10"
                >
                    {sectionsData.map((section, index) => {
                        const Icon = section.icon
                        const isLastOddCard = hasOddCards && index === sectionsData.length - 1
                        const hasDenseFeatures = section.features.length >= 5
                        const featuresGridClass = hasDenseFeatures
                            ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                            : section.features.length > 3
                                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        return (
                            <motion.article
                                key={section.title}
                                variants={cardVariants}
                                whileHover={{ y: -6, scale: 1.01 }}
                                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                                className={`group relative h-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)] hover:shadow-[0_40px_100px_rgba(15,23,42,0.13)] ${isLastOddCard ? 'sm:col-span-2' : ''}`}
                            >
                                {/* Card Internal Grid Background */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <Grid columns={8} rows={6} height="h-full" width="w-full" className="opacity-[0.035]" showPlusIcons={true} />
                                </div>

                                {/* Internal Glows */}
                                <div className="absolute right-[-15%] top-[-15%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-slate-500/10 to-slate-300/5 blur-[80px] transition-transform duration-700 group-hover:scale-125" />
                                
                                <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col h-full">
                                    <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div>
                                            <div className="mb-3 inline-flex items-center rounded-full border border-slate-600/12 bg-slate-600/[0.03] px-4 py-1 text-sm font-bold tracking-wide text-slate-700">
                                                {isArabic ? section.category : section.categoryEn}
                                            </div>
                                            <h2 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-4xl">
                                                {isArabic ? section.title : section.titleEn}
                                            </h2>
                                            <p className="mt-3 text-sm font-semibold tracking-wide text-slate-400">
                                                {isArabic ? section.subtitle : section.subtitleEn}
                                            </p>
                                        </div>
                                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border-2 border-slate-700/10 bg-slate-600/8 text-slate-700 shadow-md transition-transform duration-500 group-hover:rotate-6 ${isArabic ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                                            <Icon className="h-7 w-7 text-slate-700" />
                                        </div>
                                    </div>

                                    <p className="mb-6 text-base leading-relaxed text-slate-600 lg:max-w-4xl">
                                        {isArabic ? section.description : section.descriptionEn}
                                    </p>

                                    <div className={`mb-6 grid gap-3 sm:gap-4 ${featuresGridClass}`}>
                                        {section.features.map((feature, i) => {
                                            const FeatureIcon = feature.icon
                                            return (
                                                <motion.div key={i} custom={i} variants={featureVariants} className={`group/feature flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-slate-50 transition-all duration-300 hover:border-slate-700/15 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5 ${hasDenseFeatures ? 'p-4 sm:p-5' : 'p-6'}`}>
                                                    {FeatureIcon && (
                                                        <div className={`inline-flex items-center justify-center bg-slate-600/[0.06] text-slate-700 transition-transform duration-300 group-hover/feature:scale-110 ${hasDenseFeatures ? 'mb-4 h-10 w-10 rounded-lg' : 'mb-5 h-12 w-12 rounded-xl'}`}>
                                                            <FeatureIcon className={hasDenseFeatures ? 'h-5 w-5' : 'h-6 w-6'} />
                                                        </div>
                                                    )}
                                                    <h3 className={`mb-1 font-bold leading-snug text-slate-900 ${hasDenseFeatures ? 'text-base' : 'text-lg'}`}>
                                                        {isArabic ? feature.title : feature.titleEn}
                                                    </h3>
                                                </motion.div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-auto flex justify-end border-t border-slate-200 pt-5">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="h-11 w-full rounded-2xl border-0 bg-slate-800 px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-slate-700 hover:shadow-[0_16px_32px_rgba(15,23,42,0.32)] sm:w-auto">
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
                                                        <DialogTitle className="text-start text-xl font-semibold leading-snug tracking-tight text-slate-900">
                                                            {section.formTitle}
                                                        </DialogTitle>
                                                        <DialogDescription className="text-start text-sm leading-relaxed text-slate-600">
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
