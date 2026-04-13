'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Calendar, Clock, ArrowUpLeft, ArrowUpRight, Tag, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { Post } from '@/lib/database.types'

interface BlogPageViewProps {
  posts: Post[]
}

export function BlogPageView({ posts }: BlogPageViewProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const dateLocale = isRTL ? 'ar-IQ' : 'en-US'
  const ReadArrow = isRTL ? ArrowUpRight : ArrowUpLeft

  return (
    <div className="min-h-screen bg-white pt-36 pb-20" dir={dir} lang={locale}>
      <Container>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const title = isRTL ? post.title_ar || post.title : post.title || post.title_ar || ''
              const excerpt =
                isRTL
                  ? post.excerpt_ar || post.excerpt || post.content_ar?.substring(0, 150)
                  : post.excerpt || post.excerpt_ar || post.content?.substring(0, 150)

              return (
                <Link key={post.id} href={`/blog/${post.id}`} className="group h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
                    <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                      {post.featured_image_url || post.image_url ? (
                        <Image
                          src={post.featured_image_url || post.image_url || ''}
                          alt={title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100">
                          <FileText className="h-12 w-12 text-slate-300" />
                        </div>
                      )}

                      {post.category && (
                        <div className="absolute end-4 top-4 z-10 flex items-center gap-1.5 rounded-lg border border-white/70 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                          <Tag className="h-3.5 w-3.5 text-slate-700" />
                          <span className="text-xs font-bold text-slate-700">{post.category}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-grow flex-col p-6 text-start">
                      <h2 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-slate-700">
                        {title}
                      </h2>

                      <p className="mb-6 line-clamp-3 flex-grow text-sm leading-relaxed text-slate-500">{excerpt}</p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {formatDateTime(post.published_at || post.created_at || '', dateLocale)}
                              </span>
                            </div>
                            {post.reading_time != null && post.reading_time > 0 && (
                              <>
                                <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {post.reading_time} {t.blogPage.readingMinutes}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors duration-300 group-hover:bg-slate-800">
                          <ReadArrow className="h-4 w-4 text-slate-700 transition-colors duration-300 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 px-6 py-24 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />

            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">{t.blogPage.emptyTitle}</h3>
              <p className="text-slate-500">{t.blogPage.emptyDescription}</p>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
