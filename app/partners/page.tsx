'use client'

import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
    Users,
    CheckCircle2
} from 'lucide-react'
import { submitStaticPartnerForm } from '@/app/dashboard/partners/actions'
import { DynamicForm } from '@/components/shared/dynamic-form'
import type { FormField } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
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
    { id: 'اسم الممثل الرسمي والمنصب / Contact Person & Title', label_ar: 'اسم الممثل الرسمي والمنصب / Contact Person & Title', label_en: 'Contact Person & Title', type: 'text', required: true },
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
    subtitleEn: 'Supervised by: Training & Development Division',
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
    category: 'للأفراد',
    categoryEn: 'For Individuals',
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
    subtitleEn: 'Institutional & International Growth',
    description: 'هل تبحث عن مسار نمو مؤسسي ودولي؟ اطلب إيجازاً مهنياً وسنراجع احتياج شركتكم لنحدد نقطة الدخول الأنسب وخطة التحرك التالية عبر خدماتنا الاستراتيجية.',
    descriptionEn: 'Looking for an institutional and international growth path? Request a professional brief and we will assess your company needs to define the right entry point and next move through our strategic services.',
    icon: Building2,
    features: [
      {
        title: 'توسع السوق والتحول الدولي', titleEn: 'Market Entry & Expansion', icon: Globe,
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
        title: 'الاستشارات والدعم الرسمي', titleEn: 'Advisory & Support', icon: Briefcase,
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

    return (
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#faf5f0_0%,#ffffff_40%,#f6eee7_100%)] pt-28 pb-24 lg:pt-36" dir={dir} lang={locale}>
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                <Grid columns={18} rows={18} height="h-full" width="w-full" className="h-[200%] w-full opacity-[0.04]" showPlusIcons={false} />
            </div>

            {/* Glowing Orbs */}
            <div className="pointer-events-none absolute left-[-8rem] top-32 h-[28rem] w-[28rem] rounded-full bg-[#8b0000]/8 blur-[100px]" />
            <div className="pointer-events-none absolute right-[-10rem] top-56 h-[22rem] w-[22rem] rounded-full bg-[#8b0000]/5 blur-[80px]" />

            <Container className="relative z-10">
                <div className="mx-auto mb-16 text-center max-w-3xl">
                   <motion.h1 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6 }}
                     className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                   >
                     {isArabic ? 'شركاء جاز' : 'JAZ Partners'}
                   </motion.h1>
                   <motion.p 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: 0.1 }}
                     className="mt-6 text-lg leading-relaxed text-slate-600"
                   >
                     {isArabic 
                       ? 'نحن نؤمن بأن الشراكات الاستراتيجية هي المفتاح للنمو. اكتشف برامج ومبادرات جاز المصممة خصيصاً لدعم الأفراد والشركات في تحقيق أهدافهم.' 
                       : 'We believe strategic partnerships are the key to growth. Discover JAZ programs designed to support individuals and companies in achieving their goals.'}
                   </motion.p>
                </div>

                <div className="flex flex-col gap-16 lg:gap-24">
                    {sectionsData.map((section, index) => {
                        const Icon = section.icon
                        return (
                            <motion.article
                                key={section.title}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-10% 0px' }}
                                transition={{ duration: 0.8 }}
                                className="group relative overflow-hidden rounded-[2.5rem] border border-[#8b0000]/10 bg-white shadow-[0_24px_80px_rgba(139,0,0,0.07)] transition-all duration-700 hover:shadow-[0_40px_100px_rgba(139,0,0,0.12)]"
                            >
                                {/* Card Internal Grid Background */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <Grid columns={8} rows={6} height="h-full" width="w-full" className="opacity-[0.035]" showPlusIcons={true} />
                                </div>

                                {/* Internal Glows */}
                                <div className="absolute right-[-15%] top-[-15%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-[#8b0000]/5 to-[#c93d3d]/5 blur-[80px] transition-transform duration-700 group-hover:scale-125" />
                                
                                <div className="relative z-10 p-8 sm:p-10 lg:p-14 flex flex-col h-full">
                                    <div className="mb-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                        <div>
                                            <div className="mb-5 inline-flex items-center rounded-full border border-[#b3261e]/20 bg-[#fff3f2] px-4 py-1.5 text-sm font-bold tracking-wide text-[#b3261e]">
                                                {isArabic ? section.category : section.categoryEn}
                                            </div>
                                            <h2 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-4xl">
                                                {isArabic ? section.title : section.titleEn}
                                            </h2>
                                            <p className="mt-3 text-sm font-semibold tracking-wide text-slate-400">
                                                {isArabic ? section.subtitle : section.subtitleEn}
                                            </p>
                                        </div>
                                        <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 border-[#8b0000]/10 bg-[#8b0000]/5 text-[#8b0000] shadow-md transition-transform duration-500 group-hover:rotate-6 ${isArabic ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                                            <Icon className="h-10 w-10 text-[#8b0000]" />
                                        </div>
                                    </div>

                                    <p className="mb-12 text-lg leading-relaxed text-slate-600 lg:max-w-4xl">
                                        {isArabic ? section.description : section.descriptionEn}
                                    </p>

                                    <div className={`mb-12 grid gap-6 ${section.features.length > 3 && section.features.length < 5 ? 'sm:grid-cols-2 lg:grid-cols-3' : (section.features.length >= 5 ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'sm:grid-cols-3')}`}>
                                        {section.features.map((feature, i) => {
                                            const FeatureIcon = feature.icon
                                            return (
                                                <div key={i} className="group/feature flex flex-col rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:bg-white hover:border-[#8b0000]/25 hover:shadow-lg hover:shadow-[#8b0000]/5">
                                                    {FeatureIcon && (
                                                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff3f2] text-[#b3261e] transition-transform duration-300 group-hover/feature:scale-110">
                                                            <FeatureIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                    <h3 className="font-bold text-slate-900 text-lg mb-3">
                                                        {isArabic ? feature.title : feature.titleEn}
                                                    </h3>
                                                    {feature.points && (
                                                        <ul className="mt-2 space-y-3">
                                                            {feature.points.map((point, idx) => (
                                                                <li key={idx} className="flex items-start text-sm leading-relaxed text-slate-600">
                                                                    <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 text-[#b3261e]/70 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                                                                    <span>{isArabic ? point.ar : point.en}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-gray-200 flex justify-end">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="h-14 w-full sm:w-auto rounded-2xl border-0 bg-[#8b0000] px-8 text-base font-semibold text-white shadow-[0_12px_24px_rgba(139,0,0,0.22)] transition-all duration-300 hover:bg-[#6e0000] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(139,0,0,0.32)]">
                                                    {isArabic ? section.actionLabel : section.actionLabelEn}
                                                    <ArrowIcon className={`h-5 w-5 ${isArabic ? 'mr-3' : 'ml-3'}`} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-h-[85vh] w-[95%] max-w-xl overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>{section.formTitle}</DialogTitle>
                                                </DialogHeader>
                                                <DynamicForm
                                                    fields={section.formFields}
                                                    onSubmit={async (data) => {
                                                        await submitStaticPartnerForm(data, section.title)
                                                    }}
                                                    submitLabel={section.submitTitle}
                                                    successMessage={section.successMessage}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </motion.article>
                        )
                    })}
                </div>
            </Container>
        </div>
    )
}
