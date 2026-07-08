export type SectorKey = 'medical' | 'technology' | 'industrie' | 'academia';

export interface SubSector {
  slug: string;
  ar: string;
}

export function getSectorKey(slug?: string | null): SectorKey | null {
  if (!slug) return null;
  const s = slug.toLowerCase();
  if (s.includes('medical') || s.includes('health')) return 'medical';
  if (s.includes('tech') || s.includes('digital')) return 'technology';
  if (s.includes('industrie') || s.includes('industrial') || s.includes('energy') || s.includes('commerc') || s.includes('trade')) return 'industrie';
  if (s.includes('academia') || s.includes('education') || s.includes('academic')) return 'academia';
  return null;
}

export const SUB_SECTORS: Record<SectorKey, SubSector[]> = {
  medical: [
    { slug: 'healthcare-pharma', ar: 'الرعاية الصحية والأدوية' },
    { slug: 'veterinary', ar: 'الطب البيطري' },
    { slug: 'optics-eyewear', ar: 'البصريات والنظارات' },
  ],
  technology: [
    { slug: 'ict', ar: 'تكنولوجيا المعلومات والاتصالات' },
    { slug: 'industrial-data-computing', ar: 'الحوسبة الصناعية والبيانات' },
    { slug: 'electronics', ar: 'الإلكترونيات والتقنيات الكهربائية' },
  ],
  academia: [
    { slug: 'education-training', ar: 'التعليم والتدريب والتوظيف' },
    { slug: 'engineering-sciences-rd', ar: 'العلوم الهندسية والبحث والتطوير' },
  ],
  industrie: [
    { slug: 'industrial-fairs', ar: 'المعارض الصناعية' },
    { slug: 'consumer-goods', ar: 'السلع الاستهلاكية' },
    { slug: 'automotive', ar: 'السيارات وصناعتها' },
    { slug: 'aerospace-defense', ar: 'الطيران والدفاع' },
    { slug: 'shipping-railways', ar: 'هندسة الشحن والسكك الحديدية' },
    { slug: 'construction', ar: 'البناء والتشييد والعمارة' },
    { slug: 'furniture-lighting', ar: 'الديكور والأثاث والإضاءة' },
    { slug: 'process-equipment', ar: 'التقنيات ومعدات المعالجة' },
    { slug: 'logistics-packaging', ar: 'اللوجستيات والنقل والتغليف' },
    { slug: 'quality-security', ar: 'الجودة والأمن' },
    { slug: 'chemistry-energy-materials', ar: 'الكيمياء والطاقة والمواد' },
    { slug: 'environmental', ar: 'البيئة والاستدامة' },
    { slug: 'jewellery-watches', ar: 'المجوهرات والساعات والهدايا' },
    { slug: 'printing-graphic', ar: 'الطباعة والنشر والتصميم الجرافيكي' },
    { slug: 'banking-insurance', ar: 'المصارف والتأمين والاستثمار' },
    { slug: 'office-equipment', ar: 'معدات وخدمات المكاتب' },
    { slug: 'commerce-industry-equipment', ar: 'معدات وخدمات التجارة والصناعة' },
    { slug: 'real-estate', ar: 'العقارات' },
    { slug: 'agriculture-food', ar: 'الزراعة وتصنيع الأغذية' },
    { slug: 'fashion-textile', ar: 'الأزياء والملابس والمنسوجات' },
  ],
};
