import type { Tables } from '@/lib/database.types'
import type { FormField } from '@/lib/types'

type SectorRow = Tables<'sectors'>

export interface SectorContentEntry {
  key: 'medical' | 'industrie' | 'technology' | 'academia'
  order: number
  name: string
  nameAr: string
  shortDescription: string
  shortDescriptionAr: string
  heroDescription: string
  heroDescriptionAr: string
  overviewTitle: string
  overviewTitleAr: string
  scope: string
  scopeAr: string
  professionalLink: string
  professionalLinkAr: string
  benefit: string
  benefitAr: string
  registrationIntro: string
  registrationIntroAr: string
  accent: string
}

const sectorEntries: SectorContentEntry[] = [
  {
    key: 'medical',
    order: 1,
    name: 'JAZ Medical',
    nameAr: 'جاز الطبية',
    shortDescription: 'Healthcare, life sciences, and medical innovation connected through global medical congresses and exhibitions.',
    shortDescriptionAr: 'الرعاية الصحية، العلوم الحياتية، والابتكار الطبي ضمن منصة ربط للمؤتمرات والمعارض الطبية الدولية.',
    heroDescription: 'A specialized gateway connecting Iraqi healthcare professionals and institutions with international medical congresses and exhibitions.',
    heroDescriptionAr: 'بوابة متخصصة لربط الكوادر الصحية والمؤسسات الطبية العراقية بالمؤتمرات والمعارض العالمية.',
    overviewTitle: 'Healthcare, life sciences, and medical innovation.',
    overviewTitleAr: 'الرعاية الصحية والعلوم الحياتية والابتكار الطبي.',
    scope: 'Healthcare, life sciences, and medical innovation.',
    scopeAr: 'الرعاية الصحية، العلوم الحياتية، والابتكار الطبي.',
    professionalLink: 'Specialized in managing international medical gatherings and facilitating access for healthcare professionals and institutions to global medical congresses.',
    professionalLinkAr: 'تخصص في إدارة المحافل الطبية الدولية وتسهيل وصول الكوادر الصحية والمؤسسات إلى المؤتمرات والمعارض العالمية (Medical Congresses).',
    benefit: 'Enables knowledge exchange with international research centers, access to the latest treatment technologies, and direct connections with experts and manufacturers.',
    benefitAr: 'تحقيق التبادل المعرفي مع المراكز البحثية الدولية، واكتساب أحدث التقنيات العلاجية، وتطوير القطاع الصحي عبر قنوات التواصل المباشر مع الخبراء والمصنعين.',
    registrationIntro: 'If you represent a healthcare institution, medical team, or research body and want to connect with us about this sector, please complete the form below.',
    registrationIntroAr: 'إذا كنتم تمثلون مؤسسة صحية أو فريقاً طبياً أو جهة بحثية وترغبون بالتواصل معنا بخصوص هذا القطاع، يمكنكم تعبئة النموذج التالي.',
    accent: '#b42318',
  },
  {
    key: 'industrie',
    order: 2,
    name: 'JAZ Industrie',
    nameAr: 'جاز الصناعية',
    shortDescription: 'Manufacturing, international trade, and supply chains linked to major industrial exhibitions and business delegations.',
    shortDescriptionAr: 'التصنيع، التجارة الدولية، وسلاسل التوريد عبر ربط الشركات المحلية بالمنصات الصناعية الدولية.',
    heroDescription: 'A strategic bridge integrating the local industrial sector into major trade fairs and industrial delegations.',
    heroDescriptionAr: 'حلقة وصل استراتيجية لدمج القطاع الصناعي المحلي في المعارض التجارية والوفود الصناعية الكبرى.',
    overviewTitle: 'Manufacturing, international trade, and supply chains.',
    overviewTitleAr: 'التصنيع والتجارة الدولية وسلاسل التوريد.',
    scope: 'Manufacturing, international trade, and supply chains.',
    scopeAr: 'التصنيع، التجارة الدولية، وسلاسل التوريد.',
    professionalLink: 'Acts as a direct connector for integrating local industry into international trade exhibitions and large-scale industrial delegations.',
    professionalLinkAr: 'حلقة وصل لدمج القطاع الصناعي المحلي في المعارض التجارية والوفود الصناعية الكبرى.',
    benefit: 'Supports industrial partnerships, facilitates access to manufacturing technology, and opens new markets through direct B2B engagement on global industrial platforms.',
    benefitAr: 'توطين الشراكات الصناعية، وتسهيل استيراد التكنولوجيا التصنيعية، وفتح أسواق جديدة للشركات من خلال اللقاءات المباشرة (B2B) داخل المنصات الصناعية العالمية.',
    registrationIntro: 'If your inquiry concerns an industrial delegation, commercial partnership, or participation in a specialized exhibition, please submit it through the form below.',
    registrationIntroAr: 'إذا كان استفساركم يتعلق بوفد صناعي أو شراكة تجارية أو مشاركة في معرض متخصص، يمكنكم إرسال الطلب من خلال النموذج التالي.',
    accent: '#9a3412',
  },
  {
    key: 'technology',
    order: 3,
    name: 'JAZ Technology',
    nameAr: 'جاز التكنولوجية',
    shortDescription: 'Digital transformation, information technology, and communications for startups and tech companies seeking global exposure.',
    shortDescriptionAr: 'التحول الرقمي، تكنولوجيا المعلومات، والاتصالات لربط رواد الأعمال والشركات التقنية بالقمم العالمية.',
    heroDescription: 'A specialized unit connecting entrepreneurs and technology companies with major tech summits and digital innovation exhibitions.',
    heroDescriptionAr: 'وحدة متخصصة في ربط رواد الأعمال والشركات التقنية بالقمم التكنولوجية ومعارض الابتكار الرقمي.',
    overviewTitle: 'Digital transformation, information technology, and communications.',
    overviewTitleAr: 'التحول الرقمي وتكنولوجيا المعلومات والاتصالات.',
    scope: 'Digital transformation, information technology, and communications.',
    scopeAr: 'التحول الرقمي، تكنولوجيا المعلومات، والاتصالات.',
    professionalLink: 'Dedicated to linking entrepreneurs and tech companies with technology summits and digital innovation exhibitions.',
    professionalLinkAr: 'وحدة متخصصة في ربط رواد الأعمال والشركات التقنية بالقمم التكنولوجية ومعارض الابتكار الرقمي.',
    benefit: 'Facilitates access to modern technological infrastructure and supports digital entrepreneurship through exposure to global innovators.',
    benefitAr: 'تيسير الوصول إلى البنى التحتية التكنولوجية الحديثة، ودعم ريادة الأعمال الرقمية عبر الاحتكاك بالشركات العالمية المبتكرة في بيئات المعارض التكنولوجية.',
    registrationIntro: 'If you are seeking technical collaboration, representation at a technology summit, or a digital transformation partnership, use the form below.',
    registrationIntroAr: 'إذا كنتم تبحثون عن فرص تعاون تقني أو تمثيل في قمة تكنولوجية أو شراكة تحول رقمي، استخدموا النموذج التالي.',
    accent: '#0f766e',
  },
  {
    key: 'academia',
    order: 4,
    name: 'JAZ Academia',
    nameAr: 'جاز الأكاديمية',
    shortDescription: 'Higher education, scientific research, and professional development through academic and institutional exchange.',
    shortDescriptionAr: 'التعليم العالي، البحث العلمي، والتطوير المهني عبر ربط الجامعات والمؤسسات التعليمية بالمنصات الدولية.',
    heroDescription: 'Strengthens the relationship between academia and industry through scientific forums and research conferences.',
    heroDescriptionAr: 'تعزيز العلاقة بين الأوساط الأكاديمية وقطاع الأعمال من خلال المنتديات العلمية والمؤتمرات البحثية.',
    overviewTitle: 'Higher education, scientific research, and professional development.',
    overviewTitleAr: 'التعليم العالي والبحث العلمي والتطوير المهني.',
    scope: 'Higher education, scientific research, and professional development.',
    scopeAr: 'التعليم العالي، البحث العلمي، والتطوير المهني.',
    professionalLink: 'Enhances collaboration between academic communities and the business sector through scientific forums and research conferences.',
    professionalLinkAr: 'تعزيز العلاقة بين الأوساط الأكاديمية وقطاع الأعمال من خلال المنتديات العلمية والمؤتمرات البحثية.',
    benefit: 'Connects local universities and educational centers with international peers and aligns research outcomes with global labor market needs.',
    benefitAr: 'ربط الجامعات والمراكز التعليمية المحلية بنظيراتها الدولية، ومواءمة مخرجات البحث العلمي مع متطلبات سوق العمل الدولي عبر منصات التبادل الأكاديمي.',
    registrationIntro: 'For inquiries about a scientific conference, academic forum, or institutional collaboration between universities and research centers, please complete the form below.',
    registrationIntroAr: 'للتواصل حول مؤتمر علمي أو منتدى أكاديمي أو تعاون مؤسسي بين الجامعات والمراكز البحثية، يمكنكم تعبئة النموذج التالي.',
    accent: '#4338ca',
  },
]

const slugAliases: Record<string, SectorContentEntry['key']> = {
  medical: 'medical',
  'medical-healthcare': 'medical',
  healthcare: 'medical',
  health: 'medical',
  industrie: 'industrie',
  industrial: 'industrie',
  commercial: 'industrie',
  'commercial-industrial': 'industrie',
  'industrial-commercial': 'industrie',
  technology: 'technology',
  tech: 'technology',
  education: 'academia',
  academia: 'academia',
  academic: 'academia',
}

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

export function getSectorContent(input: Pick<SectorRow, 'slug' | 'name' | 'name_ar'> | string) {
  const raw =
    typeof input === 'string'
      ? input
      : [input.slug, input.name, input.name_ar].filter(Boolean).map(normalize).join(' ')

  const matchedKey = Object.entries(slugAliases).find(([alias]) => raw.includes(alias))?.[1]
  return sectorEntries.find((entry) => entry.key === matchedKey) || null
}

export function getSectorRegistrationFallback(currentSectorName: string, locale: 'ar' | 'en' = 'ar'): FormField[] {
  const sectorOptions =
    locale === 'ar'
      ? [
          'جاز الطبية',
          'جاز الصناعية',
          'جاز التكنولوجية',
          'جاز الأكاديمية',
        ]
      : [
          'JAZ Medical',
          'JAZ Industrie',
          'JAZ Technology',
          'JAZ Academia',
        ]

  return [
    {
      id: 'title',
      label_en: 'Title',
      label_ar: 'عنوان',
      type: 'text',
      required: false,
    },
    {
      id: 'full_name',
      label_en: 'Full Name',
      label_ar: 'الاسم الكامل / Full Name',
      type: 'text',
      required: true,
    },
    {
      id: 'organization',
      label_en: 'Organization',
      label_ar: 'المؤسسة / الجهة / Organization',
      type: 'text',
      required: true,
    },
    {
      id: 'target_sector',
      label_en: 'Target Sector',
      label_ar: 'القطاع المستهدف / Target Sector',
      type: 'select',
      required: true,
      defaultValue: currentSectorName,
      options: sectorOptions,
    },
    {
      id: 'inquiry_type',
      label_en: 'Inquiry Type',
      label_ar: 'طبيعة الاستفسار / Inquiry Type',
      type: 'textarea',
      required: true,
    },
    {
      id: 'contact_number',
      label_en: 'Contact Number',
      label_ar: 'رقم التواصل / Contact Number',
      type: 'text',
      required: true,
    },
  ]
}

export function mergeSectorWithContent<T extends SectorRow>(sector: T) {
  const content = getSectorContent(sector)

  if (!content) return sector

  return {
    ...sector,
    name: content.name,
    name_ar: content.nameAr,
    description: content.shortDescription,
    description_ar: content.shortDescriptionAr,
    color: sector.color || content.accent,
    sort_order: sector.sort_order ?? content.order,
  }
}

export const sectorContentList = sectorEntries
