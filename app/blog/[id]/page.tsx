import Link from 'next/link'
import Image from 'next/image'
import { headers, cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BlogPostPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('title_ar, title, excerpt_ar, excerpt, seo_title, seo_description, keywords')
    .eq('id', id)
    .single()

  if (error || !post) {
    return { title: 'Article Not Found | JAZ' }
  }

  const postTitle = post.title || post.title_ar || 'Article'

  return {
    title: post.seo_title || `${postTitle} | JAZ`,
    description: post.seo_description || post.excerpt || post.excerpt_ar,
    keywords: post.keywords?.join(', '),
    openGraph: {
      title: post.seo_title || postTitle,
      description: post.seo_description || post.excerpt_ar || post.excerpt,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https'
  const shareUrl = host ? `${protocol}://${host}/blog/${id}` : `/blog/${id}`

  // Detect locale from cookie
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const isRTL = locale === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  const postTitle = isRTL
    ? (post.title_ar || post.title || 'مقال')
    : (post.title || post.title_ar || 'Untitled article')

  const postContent = isRTL
    ? (post.content_ar || post.content || '')
    : (post.content || post.content_ar || '')

  const imgSrc = post.featured_image_url || post.image_url

  // Increment view count
  await supabase
    .from('posts')
    .update({ views_count: (post.views_count || 0) + 1 })
    .eq('id', id)

  // Get related posts (same category preferred)
  const { data: relatedPosts } = await supabase
    .from('posts')
    .select('id, title, title_ar, created_at, category')
    .eq('type', 'blog')
    .eq('status', 'published')
    .neq('id', id)
    .order('published_at', { ascending: false })
    .limit(3)

  const labels = isRTL
    ? { back: 'العودة للمدونة', related: 'مقالات ذات صلة', share: 'مشاركة' }
    : { back: 'Back to Blog', related: 'Related Articles', share: 'Share' }

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-16" dir={dir} lang={locale}>
      <Container className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#001a33]">{isRTL ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#001a33]">{isRTL ? 'المدونة' : 'Blog'}</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{postTitle}</span>
        </div>

        {/* Article */}
        <article>
          <header className="mb-8">
            {post.category && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded mb-4 capitalize">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {postTitle}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.published_at || post.created_at || '').toLocaleDateString(locale, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
              {post.reading_time && (
                <span className="text-gray-400">
                  · {post.reading_time} {isRTL ? 'دقيقة قراءة' : 'min read'}
                </span>
              )}
            </div>
          </header>

          {imgSrc && (
            <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden mb-8 shadow-md">
              <Image src={imgSrc} alt={postTitle} fill className="object-cover" />
            </div>
          )}

          {/* Excerpt as lead */}
          {(isRTL ? post.excerpt_ar : post.excerpt) && (
            <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium border-s-4 border-[#001a33] ps-4">
              {isRTL ? post.excerpt_ar : post.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none mb-8">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: postContent }}
            />
          </div>

          {/* Share */}
          <div className="flex items-center gap-4 py-6 border-t border-gray-200">
            <span className="text-gray-500 flex items-center gap-2 text-sm font-medium">
              <Share2 className="w-4 h-4" />
              {labels.share}:
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-sky-500 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{labels.related}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.id}`}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug">
                    {isRTL ? rp.title_ar || rp.title : rp.title || rp.title_ar}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {rp.created_at ? formatDate(rp.created_at) : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-10">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {labels.back}
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
