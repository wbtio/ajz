'use client'

import { createClient } from '@/lib/supabase/client'
import { ExternalLink, Globe, Building2, FileText, Shield, Users, MapPin, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { Icon } from '@iconify/react'

interface LinkCategory {
  id: string
  title_ar: string
  title_en: string
  description_ar: string | null
  description_en: string | null
  icon: string | null
  color: string | null
  slug: string
}

interface LinkItem {
  id: string
  title_ar: string
  title_en: string
  description_ar: string | null
  description_en: string | null
  url: string
  category_id: string | null
  country?: {
    name_ar: string
    name_en: string
    flag_emoji: string | null
  } | null
}

const iconMap: Record<string, any> = {
  Globe,
  Building2,
  FileText,
  Shield,
  Users,
}

// قائمة الدول الأصلية
const COUNTRIES_LIST = [
  { code: 'gb', name: 'بريطانيا', nameEn: 'UK' },
  { code: 'fr', name: 'فرنسا', nameEn: 'France' },
  { code: 'de', name: 'ألمانيا', nameEn: 'Germany' },
  { code: 'it', name: 'إيطاليا', nameEn: 'Italy' },
  { code: 'es', name: 'إسبانيا', nameEn: 'Spain' },
  { code: 'nl', name: 'هولندا', nameEn: 'Netherlands' },
  { code: 'be', name: 'بلجيكا', nameEn: 'Belgium' },
  { code: 'at', name: 'النمسا', nameEn: 'Austria' },
  { code: 'ch', name: 'سويسرا', nameEn: 'Switzerland' },
  { code: 'se', name: 'السويد', nameEn: 'Sweden' },
  { code: 'no', name: 'النرويج', nameEn: 'Norway' },
  { code: 'dk', name: 'الدنمارك', nameEn: 'Denmark' },
  { code: 'fi', name: 'فنلندا', nameEn: 'Finland' },
  { code: 'pl', name: 'بولندا', nameEn: 'Poland' },
  { code: 'cz', name: 'التشيك', nameEn: 'Czech Republic' },
  { code: 'gr', name: 'اليونان', nameEn: 'Greece' },
  { code: 'pt', name: 'البرتغال', nameEn: 'Portugal' },
  { code: 'ie', name: 'أيرلندا', nameEn: 'Ireland' },
  { code: 'hu', name: 'المجر', nameEn: 'Hungary' },
  { code: 'ro', name: 'رومانيا', nameEn: 'Romania' },
  { code: 'ua', name: 'أوكرانيا', nameEn: 'Ukraine' },
  { code: 'bg', name: 'بلغاريا', nameEn: 'Bulgaria' },
  { code: 'hr', name: 'كرواتيا', nameEn: 'Croatia' },
  { code: 'si', name: 'سلوفينيا', nameEn: 'Slovenia' },
  { code: 'sk', name: 'سلوفاكيا', nameEn: 'Slovakia' },
  { code: 'ee', name: 'إستونيا', nameEn: 'Estonia' },
  { code: 'lv', name: 'لاتفيا', nameEn: 'Latvia' },
  { code: 'lt', name: 'ليتوانيا', nameEn: 'Lithuania' },
  { code: 'br', name: 'البرازيل', nameEn: 'Brazil' },
  { code: 'ar', name: 'الأرجنتين', nameEn: 'Argentina' },
  { code: 'cl', name: 'تشيلي', nameEn: 'Chile' },
  { code: 'co', name: 'كولومبيا', nameEn: 'Colombia' },
  { code: 'pe', name: 'بيرو', nameEn: 'Peru' },
  { code: 've', name: 'فنزويلا', nameEn: 'Venezuela' },
  { code: 'ec', name: 'الإكوادور', nameEn: 'Ecuador' },
  { code: 'bo', name: 'بوليفيا', nameEn: 'Bolivia' },
  { code: 'py', name: 'باراغواي', nameEn: 'Paraguay' },
  { code: 'uy', name: 'أوروغواي', nameEn: 'Uruguay' },
  { code: 'mx', name: 'المكسيك', nameEn: 'Mexico' },
  { code: 'ca', name: 'كندا', nameEn: 'Canada' },
  { code: 'us', name: 'أمريكا', nameEn: 'USA' },
  { code: 'au', name: 'أستراليا', nameEn: 'Australia' },
  { code: 'nz', name: 'نيوزيلندا', nameEn: 'New Zealand' },
  { code: 'za', name: 'جنوب أفريقيا', nameEn: 'South Africa' },
  { code: 'jp', name: 'اليابان', nameEn: 'Japan' },
  { code: 'kr', name: 'كوريا الجنوبية', nameEn: 'South Korea' },
  { code: 'cn', name: 'الصين', nameEn: 'China' },
  { code: 'in', name: 'الهند', nameEn: 'India' },
  { code: 'th', name: 'تايلاند', nameEn: 'Thailand' },
  { code: 'my', name: 'ماليزيا', nameEn: 'Malaysia' },
  { code: 'sg', name: 'سنغافورة', nameEn: 'Singapore' },
  { code: 'id', name: 'إندونيسيا', nameEn: 'Indonesia' },
  { code: 'ph', name: 'الفلبين', nameEn: 'Philippines' },
  { code: 'vn', name: 'فيتنام', nameEn: 'Vietnam' },
];

// نضاعف القائمة لتغطية المساحة وضمان عدم وجود فراغ عند نهاية الدورة
const SCROLL_ITEMS = [...COUNTRIES_LIST, ...COUNTRIES_LIST];

export default function LinksPage() {
  const { t, locale, dir } = useTranslation()
  const [categories, setCategories] = useState<LinkCategory[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: categoriesData } = await supabase
        .from('link_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      const { data: linksData } = await supabase
        .from('links')
        .select(`
          id,
          title_ar,
          title_en,
          description_ar,
          description_en,
          url,
          category_id,
          is_active,
          sort_order,
          country:countries(name_ar, name_en, flag_emoji)
        `)
        .eq('is_active', true)
        .order('sort_order')

      setCategories(categoriesData || [])
      setLinks((linksData as any) || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const groupedLinks = categories.reduce((acc, category) => {
    acc[category.id] = links.filter((link) => link.category_id === category.id)
    return acc
  }, {} as Record<string, LinkItem[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.nav.links}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'بوابات حكومية، مراكز تأشيرات، وخدمات رسمية' 
              : 'Government portals, visa centers, and official services'}
          </p>
        </div>

        {/* Horizontal scrolling country icons bar */}
        <div className="mb-8 w-full overflow-hidden py-6">
          <div className="animate-scroll">
            {SCROLL_ITEMS.map((country, i) => (
              <div
                key={`${i}-${country.code}`}
                className="flex-shrink-0 mx-3 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Icon icon={`circle-flags:${country.code}`} className="w-full h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const categoryLinks = groupedLinks[category.id] || []
            if (categoryLinks.length === 0) return null

            const Icon = iconMap[category.icon || 'Globe'] || Globe

            return (
              <details key={category.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors group-open:bg-blue-600"
                      style={{ backgroundColor: `${category.color || '#3B82F6'}15` }}
                    >
                      <Icon className="w-5 h-5 group-open:text-white" style={{ color: category.color || '#3B82F6' }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {locale === 'ar' ? category.title_ar : category.title_en}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {categoryLinks.length} {locale === 'ar' ? 'رابط متاح' : 'links available'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>

                <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover/link:text-blue-600 transition-colors text-sm mb-1">
                              {locale === 'ar' ? link.title_ar : link.title_en}
                            </h3>
                            {link.country && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>{locale === 'ar' ? link.country.name_ar : link.country.name_en}</span>
                              </div>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover/link:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                        {(locale === 'ar' ? link.description_ar : link.description_en) && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                            {locale === 'ar' ? link.description_ar : link.description_en}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </details>
            )
          })}
        </div>

        {links.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {locale === 'ar' ? 'لا توجد روابط متاحة' : 'No links available'}
            </h3>
          </div>
        )}
      </div>
    </div>
  )
}
