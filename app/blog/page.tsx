import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Calendar, Clock, ArrowUpLeft, Tag, FileText } from 'lucide-react' // تم إضافة Clock و Tag
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'المدونة | JAZ - آخر الأخبار والمقالات',
  description: 'اطلع على آخر الأخبار والمقالات والتحديثات من عالم الفعاليات والمعارض في العراق',
  openGraph: {
    title: 'المدونة | JAZ',
    description: 'آخر الأخبار والمقالات من JAZ',
  },
}

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('type', 'blog')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-36 pb-20">
      <Container>
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            تحديثات مستمرة
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            المدونة والأخبار
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            اكتشف أحدث المقالات والرؤى حول عالم الفعاليات، المعارض، وتطورات الأعمال في العراق.
          </p>
        </div>

        {/* Posts Grid */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group h-full">
                <article className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300">
                  
                  {/* Image Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                    {post.featured_image_url || post.image_url ? (
                      <Image
                        src={post.featured_image_url || post.image_url || ''}
                        alt={post.title_ar || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <FileText className="w-12 h-12 text-blue-200" />
                      </div>
                    )}
                    
                    {/* Category Badge - Floating over image */}
                    {post.category && (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5 z-10">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-700">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-col flex-grow p-6">
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {post.title_ar || post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {post.excerpt_ar || post.excerpt || post.content?.substring(0, 150)}
                    </p>

                    {/* Footer Meta Data & Action */}
                    <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(post.published_at || post.created_at || '')}</span>
                          </div>
                          {post.reading_time && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{post.reading_time} دقيقة</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Read More Button Effect */}
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                        <ArrowUpLeft className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              لا توجد مقالات حالياً
            </h3>
            <p className="text-slate-500">
              نعمل على إعداد محتوى مميز، تابعنا قريباً.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}