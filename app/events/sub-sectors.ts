// Sub-sector classification for the Events page filter.
// Each leaf from the "Trade Shows Thematic Classification" list is mapped under
// one of the site's four strategic sectors. Items that do not serve any of the
// four sectors (Arts/Entertainment, Sport/Animals, Leisure/Travel) were dropped.

export type SectorKey = 'medical' | 'technology' | 'industrie' | 'academia'

export interface SubSector {
  slug: string
  en: string
  ar: string
}

// Resolve a (possibly DB-specific) sector slug into one of the four canonical
// keys. Mirrors the matching logic used elsewhere on the Events page.
export function getSectorKey(slug?: string | null): SectorKey | null {
  if (!slug) return null
  const s = slug.toLowerCase()
  if (s.includes('medical') || s.includes('health')) return 'medical'
  if (s.includes('tech') || s.includes('digital')) return 'technology'
  if (
    s.includes('industrie') ||
    s.includes('industrial') ||
    s.includes('energy') ||
    s.includes('commerc') ||
    s.includes('trade')
  ) {
    return 'industrie'
  }
  if (s.includes('academia') || s.includes('education') || s.includes('academic')) {
    return 'academia'
  }
  return null
}

export const SUB_SECTORS: Record<SectorKey, SubSector[]> = {
  medical: [
    { slug: 'healthcare-pharma', en: 'Healthcare & Pharmaceuticals', ar: 'الرعاية الصحية والأدوية' },
    { slug: 'veterinary', en: 'Veterinary Medicine', ar: 'الطب البيطري' },
    { slug: 'optics-eyewear', en: 'Optics & Eyewear', ar: 'البصريات والنظارات' },
  ],
  technology: [
    { slug: 'ict', en: 'ICT — Information & Communications', ar: 'تكنولوجيا المعلومات والاتصالات' },
    { slug: 'industrial-data-computing', en: 'Industrial Data Computing', ar: 'الحوسبة الصناعية والبيانات' },
    { slug: 'electronics', en: 'Electronics & Electrotechnics', ar: 'الإلكترونيات والتقنيات الكهربائية' },
  ],
  academia: [
    { slug: 'education-training', en: 'Education, Training & Employment', ar: 'التعليم والتدريب والتوظيف' },
    { slug: 'engineering-sciences-rd', en: 'Sciences for Engineers & R&D', ar: 'العلوم الهندسية والبحث والتطوير' },
  ],
  industrie: [
    { slug: 'industrial-fairs', en: 'Industrial Fairs', ar: 'المعارض الصناعية' },
    { slug: 'consumer-goods', en: 'Consumer Goods', ar: 'السلع الاستهلاكية' },
    { slug: 'automotive', en: 'Automobile & Automotive Industry', ar: 'السيارات وصناعتها' },
    { slug: 'aerospace-defense', en: 'Aerospace & Defense', ar: 'الطيران والدفاع' },
    { slug: 'shipping-railways', en: 'Shipping & Railways Engineering', ar: 'هندسة الشحن والسكك الحديدية' },
    { slug: 'construction', en: 'Building, Construction & Architecture', ar: 'البناء والتشييد والعمارة' },
    { slug: 'furniture-lighting', en: 'Decoration, Furniture & Lighting', ar: 'الديكور والأثاث والإضاءة' },
    { slug: 'process-equipment', en: 'Techniques & Process Equipment', ar: 'التقنيات ومعدات المعالجة' },
    { slug: 'logistics-packaging', en: 'Logistics, Transport & Packaging', ar: 'اللوجستيات والنقل والتغليف' },
    { slug: 'quality-security', en: 'Quality & Security', ar: 'الجودة والأمن' },
    { slug: 'chemistry-energy-materials', en: 'Chemistry, Energy & Materials', ar: 'الكيمياء والطاقة والمواد' },
    { slug: 'environmental', en: 'Environmental', ar: 'البيئة والاستدامة' },
    { slug: 'jewellery-watches', en: 'Jewellery, Watch-Making & Gifts', ar: 'المجوهرات والساعات والهدايا' },
    { slug: 'printing-graphic', en: 'Printing, Editing & Graphic Design', ar: 'الطباعة والنشر والتصميم الجرافيكي' },
    { slug: 'banking-insurance', en: 'Banks, Insurance & Investors', ar: 'المصارف والتأمين والاستثمار' },
    { slug: 'office-equipment', en: 'Office Equipment & Services', ar: 'معدات وخدمات المكاتب' },
    { slug: 'commerce-industry-equipment', en: 'Equipment & Services for Commerce & Industry', ar: 'معدات وخدمات التجارة والصناعة' },
    { slug: 'real-estate', en: 'Real Estate', ar: 'العقارات' },
    { slug: 'agriculture-food', en: 'Agriculture & Food Processing', ar: 'الزراعة وتصنيع الأغذية' },
    { slug: 'fashion-textile', en: 'Fashion, Apparel & Textiles', ar: 'الأزياء والملابس والمنسوجات' },
  ],
}

// Convenience flat lookup: sub-sector slug -> localized label.
export function getSubSectorLabel(slug: string | null | undefined, isRTL: boolean): string | null {
  if (!slug) return null
  for (const list of Object.values(SUB_SECTORS)) {
    const found = list.find((s) => s.slug === slug)
    if (found) return isRTL ? found.ar : found.en
  }
  return null
}
