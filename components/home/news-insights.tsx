'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'
import { SectionHeader } from './section-header'
import type { Tables } from '@/lib/database.types'

type Post = Tables<'posts'>

interface NewsInsightsProps {
  posts?: Post[]
}

export function NewsInsights({ posts = [] }: NewsInsightsProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const defaultPosts = [
    {
      id: '1',
      slug: 'digital-infrastructure-iraq',
      title: isRTL
        ? 'تمكين البنية التحتية الرقمية في العراق'
        : "Empowering Iraq's Digital Infrastructure",
      tag: isRTL ? 'تكنولوجيا' : 'Technology',
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '2',
      slug: 'healthcare-collaboration-basra',
      title: isRTL
        ? 'آفاق التعاون الصحي الثنائي في البصرة'
        : 'Bilateral Healthcare Collaborations in Basra',
      tag: isRTL ? 'صحة' : 'Healthcare',
      image:
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '3',
      slug: 'jaz-delegation-global-expo',
      title: isRTL
        ? 'جاز يقود وفداً تجارياً إلى المعرض العالمي'
        : 'JAZ Leads Commercial Delegation to Global Expo',
      tag: isRTL ? 'تجارة' : 'Trade',
      image:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    },
  ]

  const dbPosts = posts.slice(0, 3).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: isRTL ? p.title_ar || p.title : p.title || p.title_ar,
    tag: isRTL ? 'مقال' : 'Article',
    image:
      p.image_url ||
      p.featured_image_url ||
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  }))

  const fillers = defaultPosts.filter((d) => !dbPosts.some((p) => p.slug === d.slug))
  const displayPosts = [...dbPosts, ...fillers].slice(0, 3)

  return (
    <section className="bg-[#f5f7fa] py-8 lg:py-12" data-purpose="news-insights">
      <Container>
        <SectionHeader
          title={t.homepage.news.title}
          action={{ label: t.homepage.news.viewAll, href: '/blog' }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8">
          {displayPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={shouldReduceMotion ? {} : { y: -5 }}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/70 transition-colors duration-300 hover:border-[#8B0000]/25"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="absolute inset-0 z-10"
                aria-label={post.title || undefined}
              />
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <Image
                  src={post.image}
                  alt={post.title || ''}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="flex flex-col p-4 lg:p-5 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B0000] rtl:normal-case rtl:tracking-normal">
                  {post.tag}
                </span>
                <h3 className="mt-2 text-base lg:text-lg font-extrabold text-slate-900 leading-snug line-clamp-2 text-balance transition-colors duration-300 group-hover:text-[#8B0000]">
                  {post.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors duration-300 group-hover:text-[#8B0000]">
                  {isRTL ? 'اقرأ المقال' : 'Read article'}
                  <svg
                    className="w-3.5 h-3.5 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  )
}
