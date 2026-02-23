import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight, Share2, Facebook, Twitter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BlogPostPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title_ar, title, excerpt_ar, excerpt, seo_title, seo_description, featured_image_url, keywords')
    .eq('id', id)
    .single()

  if (!post) {
    return { title: 'المقال غير موجود | JAZ' }
  }

  return {
    title: post.seo_title || `${post.title_ar || post.title} | JAZ`,
    description: post.seo_description || post.excerpt_ar || post.excerpt,
    keywords: post.keywords?.join(', '),
    openGraph: {
      title: post.seo_title || post.title_ar || post.title,
      description: post.seo_description || post.excerpt_ar || post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : [],
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

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('posts')
    .update({ views_count: (post.views_count || 0) + 1 })
    .eq('id', id)

  // Get related posts
  const { data: relatedPosts } = await supabase
    .from('posts')
    .select('id, title, title_ar, created_at')
    .eq('type', 'blog')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="pt-36 pb-12">
      <Container className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600">المدونة</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{post.title_ar || post.title}</span>
        </div>

        {/* Article */}
        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {post.title_ar || post.title}
            </h1>

            <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{post.created_at ? formatDate(post.created_at) : ''}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.image_url && (
            <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.image_url}
                alt={post.title_ar || post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content_ar || post.content || '' }}
            />
          </div>

          {/* Share */}
          <div className="flex items-center gap-4 py-6 border-t border-gray-200">
            <span className="text-gray-500 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              مشاركة:
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.id}`}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {relatedPost.title_ar || relatedPost.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {relatedPost.created_at ? formatDate(relatedPost.created_at) : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للمدونة
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
