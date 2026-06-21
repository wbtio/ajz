'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowUpLeft, ArrowUpRight, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { Database } from '@/lib/database.types'
import { formatCategoryName } from './blog-filter-bar'

type Post = Database['public']['Tables']['posts']['Row']

interface BlogFeaturedProps {
  post: Post
}

export function BlogFeatured({ post }: BlogFeaturedProps) {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const dateLocale = isRTL ? 'ar-IQ' : 'en-US'
  const ReadArrow = isRTL ? ArrowUpRight : ArrowUpLeft

  const title = isRTL ? post.title_ar || post.title : post.title || post.title_ar || ''
  const excerpt =
    isRTL
      ? post.excerpt_ar || post.excerpt || post.content_ar?.substring(0, 240)
      : post.excerpt || post.excerpt_ar || post.content?.substring(0, 240)

  return (
    <Link
      href={`/blog/${post.id}`}
      className="group block"
      aria-label={title}
    >
      <article className="relative grid grid-cols-1 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.4fr_1fr]">
        {/* Image */}
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-[12rem] lg:max-h-[14rem]">
          <Image
            src={post.image_url || '/image/default_blog_cover.png'}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
          />

          {/* Image overlay tag */}
          {post.category && (
            <div className="absolute top-5 start-5 z-10 flex items-center gap-2 rounded-sm bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#001a33] shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8B0000]" aria-hidden="true" />
              {formatCategoryName(post.category, isRTL)}
            </div>
          )}

          {/* Meridian corner accent */}
          <div
            className="pointer-events-none absolute bottom-5 end-5 z-10 h-12 w-12 border-b-2 border-e-2 border-white/80"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center p-4 sm:p-5 lg:p-6">
          {/* Featured label */}
          <div className="mb-2 flex items-center gap-3">
            <span className="block h-px w-8 bg-[#8B0000]" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B0000]">
              {t.blogPage.featured}
            </span>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-lg font-black leading-[1.1] tracking-[-0.02em] text-[#001a33] sm:text-xl lg:text-2xl">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            {excerpt}
          </p>

          {/* Meta + CTA */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {formatDateTime(post.published_at || post.created_at || '', dateLocale)}
              </span>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#001a33] transition-colors group-hover:text-[#8B0000]">
              {t.blogPage.readArticle}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#001a33] text-white transition-all duration-300 group-hover:bg-[#8B0000]">
                <ReadArrow className="h-4 w-4" />
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
