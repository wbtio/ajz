'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight, ArrowLeft, Mail, Check, Newspaper } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Database } from '@/lib/database.types'

type Post = Database['public']['Tables']['posts']['Row']

interface BlogStats {
  articles: number
  categories: number
  readingTime: number
  years: number
}

interface BlogPageViewProps {
  posts: Post[]
  stats: BlogStats
}

const POSTS_PER_PAGE = 6

export function BlogPageView({ posts, stats }: BlogPageViewProps) {
  const { locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [emailInput, setEmailInput] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)

  const labels = isRTL
    ? {
        heroTitle: 'الأخبار والرؤى',
        heroDesc: 'يعرض هذا القسم الأخبار والتحديثات المرتبطة بالمعارض والمؤتمرات والفعاليات المهنية التي تنظمها أو تنسق المشاركة فيها الجاز. كما يقدّم محتوى معرفياً مرتبطاً بالقطاعات المهنية، والفعاليات الدولية، وفرص المشاركة والتطوير.',
        sectionContentTitle: 'محتوى القسم',
        sectionContent: [
          ['الأخبار', 'تتضمن الأخبار آخر التحديثات المرتبطة بالمعارض والمؤتمرات والفعاليات التي تعمل عليها الجاز.'],
          ['الرؤى', 'تتناول الرؤى موضوعات مهنية ومعرفية مرتبطة بالقطاعات المختلفة، وأهمية المشاركة في الفعاليات الدولية المتخصصة.'],
          ['التحديثات', 'تشمل التحديثات الإعلانات والمستجدات المتعلقة بالفعاليات، البرامج، والمشاركات المهنية.'],
        ],
        categoryAll: 'كل الأخبار',
        categoryNews: 'أخبار',
        categoryEvents: 'فعاليات',
        categoryPartnerships: 'شراكات',
        categoryInsights: 'رؤى وتحليلات',
        categoryUpdates: 'تحديثات',
        featuredBadge: 'خبر مميز',
        readMore: 'اقرأ المزيد',
        recentTitle: 'آخر الإعلانات',
        recentViewAll: 'عرض الكل',
        newsletterTitle: 'اشترك في النشرة الإخبارية',
        newsletterDesc: 'تابع آخر الأخبار والتحديثات المرتبطة بالمعارض والمؤتمرات والفعاليات المهنية.',
        newsletterField: 'البريد الإلكتروني',
        newsletterPlaceholder: 'البريد الإلكتروني',
        newsletterBtn: 'اشترك الآن',
        newsletterSuccess: 'تم الاشتراك بنجاح! شكراً لك.',
        newsletterFooter: 'نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.',
        emptyTitle: 'لا توجد مقالات بعد',
        emptyDesc: 'سيتم نشر المقالات والأخبار قريباً. تابعونا!',
        statsArticles: 'مقال',
        statsCategories: 'تصنيف',
        statsMinutes: 'دقيقة قراءة',
        statsYears: 'سنة خبرة',
      }
    : {
        heroTitle: 'News & Insights',
        heroDesc: 'This section presents news and updates related to exhibitions, conferences, and professional events organized or coordinated by Our Company. It also provides knowledge-based content related to professional sectors, international events, and opportunities for participation and development.',
        sectionContentTitle: 'Section Content',
        sectionContent: [
          ['News', 'News includes the latest updates related to exhibitions, conferences, and events managed by Our Company.'],
          ['Insights', 'Insights cover professional and knowledge-based topics related to different sectors and the importance of participation in specialized international events.'],
          ['Updates', 'Updates include announcements and developments related to events, programs, and professional participation.'],
        ],
        categoryAll: 'All News',
        categoryNews: 'News',
        categoryEvents: 'Events',
        categoryPartnerships: 'Partnerships',
        categoryInsights: 'Insights',
        categoryUpdates: 'Updates',
        featuredBadge: 'Featured',
        readMore: 'Read More',
        recentTitle: 'Recent Announcements',
        recentViewAll: 'View all',
        newsletterTitle: 'Subscribe to Our Newsletter',
        newsletterDesc: 'Stay updated with the latest news and updates related to exhibitions, conferences, and professional events.',
        newsletterField: 'Email Address',
        newsletterPlaceholder: 'Email Address',
        newsletterBtn: 'Subscribe Now',
        newsletterSuccess: 'Subscribed successfully! Thank you.',
        newsletterFooter: 'We respect your privacy. Unsubscribe anytime.',
        emptyTitle: 'No articles yet',
        emptyDesc: 'Articles and news will be published soon. Stay tuned!',
        statsArticles: 'Articles',
        statsCategories: 'Categories',
        statsMinutes: 'Min. of reading',
        statsYears: 'Years active',
      }

  const CATEGORY_MAP: Record<string, string> = {
    news: labels.categoryNews,
    events: labels.categoryEvents,
    event: labels.categoryEvents,
    partnerships: labels.categoryPartnerships,
    partnership: labels.categoryPartnerships,
    insights: labels.categoryInsights,
    insight: labels.categoryInsights,
    updates: labels.categoryUpdates,
    update: labels.categoryUpdates,
    announcement: isRTL ? 'إعلانات' : 'Announcements',
    tutorial: isRTL ? 'دروس تعليمية' : 'Tutorials',
    article: isRTL ? 'مقالات' : 'Articles',
  }

  const getCategoryLabel = (cat: string | null) =>
    cat ? (CATEGORY_MAP[cat.toLowerCase()] ?? cat) : ''

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts
    return posts.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase())
  }, [posts, activeCategory])

  const featuredPost = filteredPosts[0] ?? null

  const gridPosts = filteredPosts.slice(1)

  const totalPages = Math.max(1, Math.ceil(gridPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedGridPosts = useMemo(() => {
    const start = (safePage - 1) * POSTS_PER_PAGE
    return gridPosts.slice(start, start + POSTS_PER_PAGE)
  }, [gridPosts, safePage])

  const recentAnnouncements = posts.slice(0, 4)

  const availableCategories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category?.toLowerCase()).filter(Boolean) as string[])
    return Array.from(cats)
  }, [posts])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return
    setIsSubscribing(true)
    setTimeout(() => {
      setIsSubscribing(false)
      setSubscribeSuccess(true)
      setEmailInput('')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800" dir={dir} lang={locale}>
      {/* Hero Section */}
      <section className="relative bg-[#001a33] text-white py-20 px-4 md:px-8 overflow-hidden">
        <div
          className={`absolute opacity-20 pointer-events-none select-none w-[60%] h-[130%] bg-no-repeat bg-contain ${
            isRTL ? 'left-[-10%] top-[-15%] bg-left-top' : 'right-[-10%] top-[-15%] bg-right-top'
          }`}
          style={{ backgroundImage: 'url(/invitation-hero-bg.png)' }}
        />

        <div className="max-w-7xl mx-auto relative z-10 text-start pt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            {labels.heroTitle}
          </h1>
          <p className="max-w-2xl text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed mb-8">
            {labels.heroDesc}
          </p>

        </div>
      </section>

      <section className="bg-white py-10 sm:py-12" aria-labelledby="blog-section-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 id="blog-section-content" className="text-2xl sm:text-3xl font-extrabold text-[#001a33]">{labels.sectionContentTitle}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {labels.sectionContent.map(([title, description]) => (
              <article key={title} className="border-t border-slate-200 pt-4 text-start">
                <h3 className="text-lg font-extrabold text-[#001a33]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:px-8">
        {posts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <Newspaper className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-3">{labels.emptyTitle}</h2>
            <p className="text-slate-500 max-w-md">{labels.emptyDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-9 space-y-8">

              {/* Featured Article */}
              {featuredPost && (
                <article className="relative bg-[#001a33] text-white rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg border border-white/5">
                  <div className="md:w-1/2 relative h-56 sm:h-64 md:h-auto overflow-hidden bg-slate-800 shrink-0">
                    {featuredPost.featured_image_url || featuredPost.image_url ? (
                      <Image
                        src={featuredPost.featured_image_url || featuredPost.image_url || ''}
                        alt={isRTL ? featuredPost.title_ar || featuredPost.title : featuredPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-700/50">
                        <Newspaper className="w-16 h-16 text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#001a33] to-transparent hidden md:block" />
                  </div>
                  <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center text-start">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-sky-500/20 text-sky-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">
                        {labels.featuredBadge}
                      </span>
                      {featuredPost.category && (
                        <span className="text-slate-400 text-xs font-medium capitalize">
                          {getCategoryLabel(featuredPost.category)}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(featuredPost.published_at || featuredPost.created_at || '').toLocaleDateString(locale, {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 leading-snug line-clamp-3">
                      {isRTL ? featuredPost.title_ar || featuredPost.title : featuredPost.title}
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed line-clamp-3">
                      {isRTL ? featuredPost.excerpt_ar || featuredPost.excerpt : featuredPost.excerpt}
                    </p>
                    <Link
                      href={`/blog/${featuredPost.id}`}
                      className="text-sky-400 text-xs sm:text-sm font-bold flex items-center gap-2 hover:text-sky-300 transition-colors"
                    >
                      <span>{labels.readMore}</span>
                      <Arrow className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              )}

              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <nav className="border-b border-slate-200">
                  <ul className="flex flex-wrap gap-x-6 sm:gap-x-8 text-xs sm:text-sm font-bold text-slate-500">
                    <li
                      onClick={() => { setActiveCategory(null); setCurrentPage(1) }}
                      className={`pb-3 cursor-pointer transition-colors border-b-2 ${
                        !activeCategory ? 'border-[#001a33] text-[#001a33]' : 'border-transparent hover:text-[#001a33]'
                      }`}
                    >
                      {labels.categoryAll}
                    </li>
                    {availableCategories.map((cat) => (
                      <li
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setCurrentPage(1) }}
                        className={`pb-3 cursor-pointer transition-colors border-b-2 capitalize ${
                          activeCategory === cat ? 'border-[#001a33] text-[#001a33]' : 'border-transparent hover:text-[#001a33]'
                        }`}
                      >
                        {getCategoryLabel(cat)}
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Posts Grid */}
              {paginatedGridPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {paginatedGridPosts.map((post) => {
                    const title = isRTL ? post.title_ar || post.title : post.title
                    const excerpt = isRTL ? post.excerpt_ar || post.excerpt : post.excerpt
                    const dateStr = new Date(post.published_at || post.created_at || '').toLocaleDateString(locale, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                    const imgSrc = post.featured_image_url || post.image_url

                    return (
                      <article
                        key={post.id}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                      >
                        <div className="relative h-36 w-full bg-slate-100 overflow-hidden shrink-0">
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Newspaper className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow text-start">
                          <div className="flex items-center gap-2 mb-2">
                            {post.category && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                                {getCategoryLabel(post.category)}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">{dateStr}</span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-[#001a33] mb-2 line-clamp-2 leading-snug group-hover:text-[#a68233] transition-colors">
                            {title}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-grow">
                            {excerpt}
                          </p>
                          <Link
                            href={`/blog/${post.id}`}
                            className="text-[#a68233] text-[11px] font-bold flex items-center gap-1.5 hover:underline"
                          >
                            <span>{labels.readMore}</span>
                            <Arrow className="w-3 h-3" />
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                activeCategory && (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-sm">{isRTL ? 'لا توجد مقالات في هذا التصنيف' : 'No articles in this category'}</p>
                  </div>
                )
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:border-[#001a33] hover:text-[#001a33] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                          page === currentPage
                            ? 'bg-[#001a33] text-white shadow-sm'
                            : 'border border-slate-200 text-slate-600 hover:border-[#001a33] hover:text-[#001a33]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:border-[#001a33] hover:text-[#001a33] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              {/* Recent Announcements */}
              <section className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-start">
                <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#001a33]">{labels.recentTitle}</h4>
                  <Link href="/blog" className="text-[10px] text-sky-600 font-bold hover:underline">
                    {labels.recentViewAll}
                  </Link>
                </div>
                {recentAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    {isRTL ? 'لا توجد إعلانات' : 'No announcements yet'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentAnnouncements.map((post) => {
                      const title = isRTL ? post.title_ar || post.title : post.title
                      const dateStr = new Date(post.published_at || post.created_at || '').toLocaleDateString(locale, {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })
                      return (
                        <Link key={post.id} href={`/blog/${post.id}`} className="flex gap-3 group cursor-pointer">
                          <div className="flex-shrink-0 w-8 h-8 bg-[#001a33] rounded-sm flex items-center justify-center text-white text-[10px] font-bold uppercase">
                            {post.category?.slice(0, 2).toUpperCase() || 'NW'}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-[9px] text-slate-400 font-semibold mb-0.5">{dateStr}</p>
                            <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#a68233] transition-colors line-clamp-2">
                              {title}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Newsletter */}
              <section className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-start">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-sky-50 rounded-full flex items-center justify-center text-sky-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#001a33]">{labels.newsletterTitle}</h4>
                </div>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{labels.newsletterDesc}</p>

                {subscribeSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-center">
                    <Check className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-[10px] font-bold text-emerald-800">{labels.newsletterSuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="flex border border-gray-300 rounded overflow-hidden">
                      <label htmlFor="newsletter-email" className="sr-only">{labels.newsletterField}</label>
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        placeholder={labels.newsletterPlaceholder}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-grow text-[11px] border-none px-3 py-2 text-slate-800 focus:ring-0 focus:outline-none min-w-0 bg-white"
                      />
                      <button
                        type="submit"
                        disabled={isSubscribing}
                        className="bg-[#a68233] hover:bg-[#8c6e2a] text-white text-[11px] font-bold px-4 py-2 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {isSubscribing ? '...' : labels.newsletterBtn}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 italic">{labels.newsletterFooter}</p>
                  </form>
                )}
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
