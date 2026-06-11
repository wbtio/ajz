'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight, ArrowLeft, Mail, Check } from 'lucide-react'
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

// 9 Mock Articles with English and Arabic translations mapping to the HTML content
const MOCK_ARTICLES: Post[] = [
  {
    id: 'news-1',
    title: "JAZ Highlights Iraq's Innovation Potential at GITEX Global 2025",
    title_ar: 'جاز تسلط الضوء على آفاق الابتكار في العراق في معرض جيتكس جلوبال 2025',
    excerpt: "JAZ participated in GITEX Global 2025 in Dubai, showcasing Iraq's emerging digital ecosystem and investment opportunities to a global audience of innovators, investors, and government leaders.",
    excerpt_ar: 'شاركت جاز في معرض جيتكس جلوبال 2025 في دبي، حيث استعرضت النظام البيئي الرقمي الناشئ وفرص الاستثمار في العراق أمام جمهور عالمي من المبتكرين والمستثمرين والقادة الحكوميين.',
    content: '',
    content_ar: '',
    category: 'insights',
    slug: 'gitex-global-2025',
    image_url: '/news/news_gitex.png',
    featured_image_url: '/news/news_gitex.png',
    published_at: '2025-05-23T09:00:00.000Z',
    reading_time: 5,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-2',
    title: 'New Partnership with UNIDO to Support MSME Development in Iraq',
    title_ar: 'شراكة جديدة مع اليونيدو لدعم تطوير المشروعات الصغيرة والمتوسطة في العراق',
    excerpt: 'JAZ and UNIDO sign a partnership to empower local businesses through capacity building, innovation, and market access.',
    excerpt_ar: 'وقعت جاز واليونيدو اتفاقية شراكة لتمكين الأعمال المحلية من خلال بناء القدرات والابتكار وتسهيل الوصول إلى الأسواق.',
    content: '',
    content_ar: '',
    category: 'partnerships',
    slug: 'unido-partnership-msme',
    image_url: '/JAZ Industrie.svg',
    featured_image_url: '/JAZ Industrie.svg',
    published_at: '2025-05-20T09:00:00.000Z',
    reading_time: 4,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-3',
    title: 'JAZ Joins the World Bank Private Sector Engagement Program',
    title_ar: 'جاز تنضم إلى برنامج البنك الدولي لمشاركة القطاع الخاص',
    excerpt: 'A new milestone to strengthen collaboration with global institutions and attract sustainable investment to Iraq.',
    excerpt_ar: 'علامة فارقة جديدة لتعزيز التعاون مع المؤسسات العالمية وجذب الاستثمارات المستدامة إلى العراق.',
    content: '',
    content_ar: '',
    category: 'partnerships',
    slug: 'world-bank-engagement',
    image_url: '/JAZ Industrie.svg',
    featured_image_url: '/JAZ Industrie.svg',
    published_at: '2025-05-15T09:00:00.000Z',
    reading_time: 3,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-4',
    title: 'Strategic MoU Signed with KOICA to Advance Skill Development',
    title_ar: 'توقيع مذكرة تفاهم استراتيجية مع كويكا للارتقاء بتطوير المهارات',
    excerpt: 'The agreement aims to enhance vocational training programs and support youth employment across Iraq.',
    excerpt_ar: 'تهدف الاتفاقية إلى تعزيز برامج التدريب المهني ودعم توظيف الشباب في مختلف أنحاء العراق.',
    content: '',
    content_ar: '',
    category: 'partnerships',
    slug: 'koica-mou-skills',
    image_url: '/JAZ Academia.svg',
    featured_image_url: '/JAZ Academia.svg',
    published_at: '2025-05-10T09:00:00.000Z',
    reading_time: 4,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-5',
    title: 'JAZ Hosts Investment Roundtable with Gulf Business Leaders',
    title_ar: 'جاز تستضيف طاولة مستديرة للاستثمار مع قادة الأعمال في الخليج',
    excerpt: 'Discussions focused on sectors with high growth potential and pathways to foster bilateral investment.',
    excerpt_ar: 'ركزت المناقشات على القطاعات ذات إمكانات النمو العالية وسبل تعزيز الاستثمار الثنائي بين العراق ودول الخليج.',
    content: '',
    content_ar: '',
    category: 'updates',
    slug: 'gulf-investment-roundtable',
    image_url: '/JAZ Industrie.svg',
    featured_image_url: '/JAZ Industrie.svg',
    published_at: '2025-05-07T09:00:00.000Z',
    reading_time: 3,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-6',
    title: "JAZ Showcases Iraq's Industrial Strength at Hannover Messe 2025",
    title_ar: 'جاز تستعرض القدرة الصناعية للعراق في معرض هانوفر ميسي 2025',
    excerpt: "Iraq's manufacturing and industrial capabilities were highlighted to global industry leaders and investors.",
    excerpt_ar: 'تم تسليط الضوء على قدرات التصنيع والقدرات الصناعية للعراق أمام قادة الصناعة والمستثمرين العالميين.',
    content: '',
    content_ar: '',
    category: 'events',
    slug: 'hannover-messe-2025',
    image_url: '/JAZ Industrie.svg',
    featured_image_url: '/JAZ Industrie.svg',
    published_at: '2025-05-02T09:00:00.000Z',
    reading_time: 4,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-7',
    title: 'Digital Transformation Workshop Held in Basra',
    title_ar: 'عقد ورشة عمل حول التحول الرقمي في البصرة',
    excerpt: 'Bringing together public and private sector leaders to explore innovative solutions for digital growth.',
    excerpt_ar: 'جمع قادة القطاعين العام والخاص لاستكشاف حلول مبتكرة للنمو الرقمي والتكنولوجي في محافظة البصرة.',
    content: '',
    content_ar: '',
    category: 'updates',
    slug: 'digital-transformation-basra',
    image_url: '/JAZ Technology.svg',
    featured_image_url: '/JAZ Technology.svg',
    published_at: '2025-04-28T09:00:00.000Z',
    reading_time: 3,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-8',
    title: 'JAZ Partners with Archeova to Promote Cultural Heritage',
    title_ar: 'شراكة بين جاز وأركيوفا لتعزيز التراث الثقافي العراقي ورعايته',
    excerpt: "A joint initiative to preserve and promote Iraq's cultural heritage through digital technology and exhibitions.",
    excerpt_ar: 'مبادرة مشتركة للحفاظ على التراث الثقافي للعراق والترويج له باستخدام التكنولوجيا الرقمية والمعارض الفنية.',
    content: '',
    content_ar: '',
    category: 'insights',
    slug: 'archeova-cultural-heritage',
    image_url: '/JAZ Academia.svg',
    featured_image_url: '/JAZ Academia.svg',
    published_at: '2025-04-22T09:00:00.000Z',
    reading_time: 5,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
  {
    id: 'news-9',
    title: 'JAZ Participates in Global Infrastructure Dialogue 2025',
    title_ar: 'جاز تشارك في حوار البنية التحتية العالمي 2025 بمشاركة دولية',
    excerpt: 'Engaging with international stakeholders to advance infrastructure development and sustainable growth.',
    excerpt_ar: 'التواصل والمشاركة مع الأطراف الدولية المعنية لتعزيز تطوير البنية التحتية والنمو المستدام.',
    content: '',
    content_ar: '',
    category: 'events',
    slug: 'global-infrastructure-dialogue',
    image_url: '/JAZ Industrie.svg',
    featured_image_url: '/JAZ Industrie.svg',
    published_at: '2025-04-15T09:00:00.000Z',
    reading_time: 4,
    status: 'published',
    type: 'blog',
    created_at: null,
    updated_at: null,
    author_id: null,
    keywords: [],
    seo_description: null,
    seo_title: null,
    views_count: 0,
  },
]

const POSTS_PER_PAGE = 4

export function BlogPageView({ posts }: BlogPageViewProps) {
  const { locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  // Filters state
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Newsletter state
  const [emailInput, setEmailInput] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)

  // Combine fetched posts with local mocks to guarantee full populating
  const allPosts = useMemo(() => {
    const dbIds = new Set(posts.map((p) => p.id))
    const filteredMocks = MOCK_ARTICLES.filter((m) => !dbIds.has(m.id))
    return [...filteredMocks, ...posts]
  }, [posts])

  // Filter posts based on category
  const filteredPosts = useMemo(() => {
    if (!activeCategory) return allPosts
    return allPosts.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase())
  }, [allPosts, activeCategory])

  // Split featured and grid
  const featuredPost = useMemo(() => {
    return filteredPosts.find((p) => p.id === 'news-1') || filteredPosts[0]
  }, [filteredPosts])

  const gridPosts = useMemo(() => {
    // Exclude featured article from the grid
    return filteredPosts.filter((p) => p.id !== featuredPost?.id)
  }, [filteredPosts, featuredPost])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(gridPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedGridPosts = useMemo(() => {
    const start = (safePage - 1) * POSTS_PER_PAGE
    return gridPosts.slice(start, start + POSTS_PER_PAGE)
  }, [gridPosts, safePage])

  // Extract recent announcements (3 items)
  const recentAnnouncements = useMemo(() => {
    return allPosts.slice(0, 3)
  }, [allPosts])

  // Simulated subscription submission
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

  // Localized texts
  const labels = isRTL
    ? {
        heroTitle: 'الأخبار والآراء',
        heroDesc: 'ابق على اطلاع بآخر التحديثات، وإعلانات الشراكة، والتقارير الحية، والرؤى المهنية من جاز وشبكة شركائنا الدوليين.',
        btnExplore: 'استكشاف الشراكات والعلاقات',
        btnEvents: 'عرض الفعاليات القادمة',
        categoryAll: 'كل الأخبار',
        categoryUpdates: 'التحديثات',
        categoryEvents: 'الفعاليات',
        categoryPartnerships: 'الشراكات',
        categoryInsights: 'الرؤى والتحليلات',
        featuredBadge: 'خبر مميز',
        readMore: 'اقرأ المزيد',
        recentTitle: 'آخر الإعلانات',
        recentViewAll: 'عرض الكل',
        upcomingTitle: 'الفعاليات القادمة',
        upcomingViewAll: 'عرض الكل',
        newsletterTitle: 'ابقَ على اطلاع',
        newsletterDesc: 'اشترك في نشرتنا الإخبارية لتلقي آخر الأخبار والتحديثات ومعلومات الفعاليات.',
        newsletterPlaceholder: 'أدخل بريدك الإلكتروني',
        newsletterBtn: 'اشتراك',
        newsletterSubmitting: 'جاري الاشتراك...',
        newsletterSuccess: 'تم الاشتراك بنجاح! شكراً لك.',
        newsletterFooter: 'نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.',
        upcomingEventsList: [
          { title: 'معرض الصحة العربي 2025', dateMonth: 'يونيو', dateDays: '16-19', year: '2025', loc: 'مركز دبي التجاري العالمي، دبي، الإمارات', tag: 'الرعاية الصحية', tagBg: 'bg-blue-50 text-blue-500' },
          { title: 'معرض جيتكس جلوبال 2025', dateMonth: 'يونيو', dateDays: '23-26', year: '2025', loc: 'مركز دبي التجاري العالمي، دبي، الإمارات', tag: 'التكنولوجيا', tagBg: 'bg-purple-50 text-purple-500' },
          { title: 'معرض بيج 5 جلوبال 2025', dateMonth: 'أكتوبر', dateDays: '10-12', year: '2025', loc: 'مركز دبي التجاري العالمي، دبي، الإمارات', tag: 'التصنيع والبناء', tagBg: 'bg-orange-50 text-orange-500' },
        ],
      }
    : {
        heroTitle: 'News & Insights',
        heroDesc: 'Stay informed with the latest updates, partnership announcements, event highlights, and expert insights from JAZ and our global network. Advancing collaboration, knowledge exchange, and impactful connections.',
        btnExplore: 'Explore Partnerships',
        btnEvents: 'View Upcoming Events',
        categoryAll: 'All News',
        categoryUpdates: 'Updates',
        categoryEvents: 'Events',
        categoryPartnerships: 'Partnerships',
        categoryInsights: 'Insights',
        featuredBadge: 'Featured',
        readMore: 'Read More',
        recentTitle: 'Recent Announcements',
        recentViewAll: 'View all',
        upcomingTitle: 'Upcoming Events',
        upcomingViewAll: 'View all',
        newsletterTitle: 'Stay Informed',
        newsletterDesc: 'Subscribe to our newsletter to receive the latest news, updates, and event information.',
        newsletterPlaceholder: 'Enter your email',
        newsletterBtn: 'Subscribe',
        newsletterSubmitting: 'Submitting...',
        newsletterSuccess: 'Subscribed successfully! Thank you.',
        newsletterFooter: 'We respect your privacy. Unsubscribe anytime.',
        upcomingEventsList: [
          { title: 'Arab Health 2025', dateMonth: 'Jun', dateDays: '16-19', year: '2025', loc: 'Dubai World Trade Centre, Dubai, UAE', tag: 'Healthcare', tagBg: 'bg-blue-50 text-blue-500' },
          { title: 'GITEX Global 2025', dateMonth: 'Jun', dateDays: '23-26', year: '2025', loc: 'Dubai World Trade Centre, Dubai, UAE', tag: 'Technology', tagBg: 'bg-purple-50 text-purple-500' },
          { title: 'BIG 5 Global 2025', dateMonth: 'Oct', dateDays: '10-12', year: '2025', loc: 'Dubai World Trade Centre, Dubai, UAE', tag: 'Construction', tagBg: 'bg-orange-50 text-orange-500' },
        ],
      }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800" dir={dir} lang={locale}>
      {/* Hero Section */}
      <section
        className="relative bg-[#001a33] text-white py-20 px-4 md:px-8 overflow-hidden"
        data-purpose="hero-container"
      >
        {/* Globe Map Overlay Background */}
        <div
          className={`absolute opacity-20 pointer-events-none select-none transition-all duration-700 w-[60%] h-[130%] bg-no-repeat bg-contain ${
            isRTL ? 'left-[-10%] top-[-15%] bg-left-top' : 'right-[-10%] top-[-15%] bg-right-top'
          }`}
          style={{ backgroundImage: 'url(/invitation-hero-bg.png)' }}
        />

        <div className="max-w-7xl mx-auto relative z-10 text-start">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            {labels.heroTitle}
          </h1>
          <p className="max-w-2xl text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed mb-8">
            {labels.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/partnership"
              className="bg-[#a68233] hover:bg-[#8c6e2a] text-white px-5 sm:px-6 py-2.5 rounded-[4px] flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all shadow-md shrink-0"
            >
              <span>{labels.btnExplore}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/events"
              className="border border-white/30 hover:bg-white/10 text-white px-5 sm:px-6 py-2.5 rounded-[4px] flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>{labels.btnEvents}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Articles List (Featured + Categories + Grid + Pagination) */}
          <div className="lg:col-span-9 space-y-10">
            {/* Featured Article Card */}
            {featuredPost && (
              <article
                className="relative bg-[#001a33] text-white rounded-lg overflow-hidden flex flex-col md:flex-row shadow-lg border border-white/5"
                data-purpose="featured-article"
              >
                <div className="md:w-1/2 relative h-56 sm:h-64 md:h-auto overflow-hidden bg-slate-800">
                  {featuredPost.image_url && (
                    <Image
                      src={featuredPost.image_url}
                      alt={isRTL ? featuredPost.title_ar || featuredPost.title : featuredPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 hover:scale-102"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#001a33] to-transparent hidden md:block" />
                </div>
                <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center text-start">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-sky-500/20 text-sky-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">
                      {labels.featuredBadge}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featuredPost.published_at || '').toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 leading-snug line-clamp-2">
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

              {/* Categories Selector Bar */}
              <nav className="border-b border-slate-200" data-purpose="news-categories">
                <ul className="flex flex-wrap gap-x-6 sm:gap-x-8 text-xs sm:text-sm font-bold text-slate-500">
                  {[
                    { value: null, label: labels.categoryAll },
                    { value: 'updates', label: labels.categoryUpdates },
                    { value: 'events', label: labels.categoryEvents },
                    { value: 'partnerships', label: labels.categoryPartnerships },
                    { value: 'insights', label: labels.categoryInsights },
                  ].map((cat) => {
                    const isActive = activeCategory === cat.value
                    return (
                      <li
                        key={cat.label}
                        onClick={() => {
                          setActiveCategory(cat.value)
                          setCurrentPage(1)
                        }}
                        className={`pb-3 cursor-pointer transition-colors border-b-2 ${
                          isActive
                            ? 'border-[#001a33] text-[#001a33]'
                            : 'border-transparent hover:text-[#001a33]'
                        }`}
                      >
                        {cat.label}
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* News Grid (showing 4 columns on desktop matching HTML) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-purpose="news-grid">
                {paginatedGridPosts.map((post) => {
                  const title = isRTL ? post.title_ar || post.title : post.title
                  const excerpt = isRTL ? post.excerpt_ar || post.excerpt : post.excerpt
                  const dateStr = new Date(post.published_at || '').toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })

                  return (
                    <article
                      key={post.id}
                      className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow group"
                    >
                      <div className="relative h-32 w-full bg-slate-100 overflow-hidden shrink-0">
                        {post.image_url && (
                          <Image
                            src={post.image_url}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-104"
                          />
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-grow text-start">
                        <span className="text-[10px] text-slate-400 font-semibold mb-1">{dateStr}</span>
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

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6" data-purpose="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:border-[#001a33] hover:text-[#001a33] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    const isActive = page === currentPage
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                          isActive
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
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:border-[#001a33] hover:text-[#001a33] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Recent Announcements */}
            <section className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm text-start" data-purpose="sidebar-announcements">
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-[#001a33]">{labels.recentTitle}</h4>
                <Link href="/blog" className="text-[10px] text-sky-600 font-bold hover:underline">
                  {labels.recentViewAll}
                </Link>
              </div>
              <div className="space-y-4">
                {recentAnnouncements.map((post) => {
                  const title = isRTL ? post.title_ar || post.title : post.title
                  const dateStr = new Date(post.published_at || '').toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="flex gap-3 group cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#001a33] rounded-sm flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                        {post.category?.slice(0, 2) || 'NW'}
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
            </section>

            {/* Upcoming Events Calendar Block */}
            <section className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm text-start" data-purpose="sidebar-events">
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-[#001a33]">{labels.upcomingTitle}</h4>
                <Link href="/events" className="text-[10px] text-sky-600 font-bold hover:underline">
                  {labels.upcomingViewAll}
                </Link>
              </div>
              <div className="space-y-4">
                {labels.upcomingEventsList.map((evt, i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex-shrink-0 w-11 bg-[#001a33] text-white rounded-sm text-center py-1 flex flex-col justify-center shrink-0">
                      <span className="text-[8px] uppercase font-semibold text-white/70 leading-none">{evt.dateMonth}</span>
                      <span className="text-xs font-bold leading-tight mt-0.5">{evt.dateDays}</span>
                      <span className="text-[7px] font-medium leading-none text-white/50">{evt.year}</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold text-slate-800 mb-0.5 leading-tight line-clamp-1">{evt.title}</h5>
                      <p className="text-[9px] text-slate-400 mb-1 leading-tight line-clamp-1">{evt.loc}</p>
                      <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${evt.tagBg}`}>
                        {evt.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter Stay Informed Form */}
            <section className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm text-start" data-purpose="sidebar-newsletter">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-sky-50 rounded-full flex items-center justify-center text-sky-600">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#001a33]">{labels.newsletterTitle}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                {labels.newsletterDesc}
              </p>
              
              {subscribeSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-[4px] text-center">
                  <Check className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold text-emerald-800">
                    {labels.newsletterSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="flex border border-gray-300 rounded-[4px] overflow-hidden">
                    <input
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
                  <p className="text-[9px] text-slate-400 italic">
                    {labels.newsletterFooter}
                  </p>
                </form>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

