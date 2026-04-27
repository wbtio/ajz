// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'
import { ExternalLink, Globe, Building2, FileText, Shield, Users, MapPin, ChevronDown, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/context'
import { Icon } from '@iconify/react'
import { Container } from '@/components/ui/container'

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

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Building2,
  FileText,
  Shield,
  Users,
}

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
]

const SCROLL_ITEMS = [...COUNTRIES_LIST, ...COUNTRIES_LIST]

export default function LinksPage() {
  const { t, locale, dir } = useTranslation()
  const isRTL = dir === 'rtl'
  const shouldReduceMotion = useReducedMotion()
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
      setLinks((linksData as LinkItem[]) || [])
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28" dir={dir}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0.96)_54%,transparent_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-slate-500/10 blur-[120px]" />

      <Container className="relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.06)] sm:p-7 lg:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(255,255,255,0.98),rgba(148,163,184,0.08))]" />
          <div className="pointer-events-none absolute -top-28 right-0 h-56 w-56 rounded-full bg-slate-400/10 blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.05 }}
              className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
            >
              <span className="mb-4 inline-flex min-h-11 items-center rounded-full border border-slate-600/12 bg-slate-600/[0.03] px-4 py-1.5 text-sm font-medium text-slate-700">
                {locale === 'ar' ? 'بوابات وخدمات رسمية' : 'Official portals and services'}
              </span>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {t.nav.links}
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {locale === 'ar'
                  ? 'تجميع منظم للروابط الحكومية، مراكز التأشيرات، والخدمات الرسمية ضمن واجهة أوضح وأقرب لهوية الموقع.'
                  : 'A curated collection of government portals, visa centers, and official services in a cleaner layout that matches the rest of the site.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: shouldReduceMotion ? 0 : 0.12 }}
              className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white px-3 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-slate-500/[0.04]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/25 to-transparent opacity-80" />
              <div className="relative z-10">
                <div
                  dir="ltr"
                  className="group/flags relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
                >
                  <div
                    key={locale}
                    className={[
                      'flex w-max items-center gap-3',
                      shouldReduceMotion ? '' : isRTL ? 'animate-marquee-rtl group-hover/flags:[animation-play-state:paused]' : 'animate-marquee-ltr group-hover/flags:[animation-play-state:paused]',
                    ].join(' ')}
                  >
                    {SCROLL_ITEMS.map((country, i) => (
                      <div
                        key={`${country.code}-${i}`}
                        title={locale === 'ar' ? country.name : country.nameEn}
                        aria-label={locale === 'ar' ? country.name : country.nameEn}
                        className="group/item flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-400/30 hover:shadow-[0_16px_34px_rgba(51,65,85,0.08)] sm:h-[4.5rem] sm:w-[4.5rem]"
                      >
                        <Icon icon={`circle-flags:${country.code}`} className="h-10 w-10 sm:h-12 sm:w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {categories.map((category, index) => {
                const categoryLinks = groupedLinks[category.id] || []
                if (categoryLinks.length === 0) return null

                const CategoryIcon = iconMap[category.icon || 'Globe'] || Globe
                const accent = category.color || '#475569'

                return (
                  <motion.details
                    key={category.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 0.04 * index }}
                    className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.05)] transition-all"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 group-open:bg-slate-700"
                          style={{ backgroundColor: `${accent}15` }}
                        >
                          <CategoryIcon className="h-5 w-5 transition-colors duration-300 group-open:text-white" style={{ color: accent }} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-950">
                            {locale === 'ar' ? category.title_ar : category.title_en}
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">
                            {locale === 'ar'
                              ? category.description_ar || `${categoryLinks.length} رابط متاح ضمن هذا القسم`
                              : category.description_en || `${categoryLinks.length} links available in this section`}
                          </p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="rounded-full border border-slate-600/12 bg-slate-600/[0.03] px-3 py-1 text-xs font-semibold text-slate-700">
                          {categoryLinks.length} {locale === 'ar' ? 'رابط' : 'links'}
                        </span>
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                      </div>
                    </summary>

                    <div className="border-t border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.7))] p-4 sm:p-5">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {categoryLinks.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link relative overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-400/25 hover:shadow-[0_20px_45px_rgba(51,65,85,0.09)]"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />
                            <div className={`relative z-10 flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                              <div className="flex-1">
                                <h3 className="mb-1 text-sm font-semibold text-slate-900 transition-colors group-hover/link:text-slate-700 sm:text-base">
                                  {locale === 'ar' ? link.title_ar : link.title_en}
                                </h3>
                                {link.country && (
                                  <div className={`flex items-center gap-1.5 text-xs text-slate-500 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{locale === 'ar' ? link.country.name_ar : link.country.name_en}</span>
                                  </div>
                                )}
                              </div>
                              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover/link:text-slate-700" />
                            </div>

                            {(locale === 'ar' ? link.description_ar : link.description_en) && (
                              <p className={`mt-3 text-sm leading-6 text-slate-600 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                                {locale === 'ar' ? link.description_ar : link.description_en}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.details>
                )
              })}
            </div>

            {links.length === 0 && (
              <div className="mt-6 rounded-[1.5rem] border border-white/70 bg-white/75 py-16 text-center shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  {locale === 'ar' ? 'لا توجد روابط متاحة' : 'No links available'}
                </h3>
                <p className="text-slate-500">
                  {locale === 'ar' ? 'سيتم عرض الروابط هنا عند إضافتها.' : 'Links will appear here once they are added.'}
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </Container>
    </div>
  )
}
