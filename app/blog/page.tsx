import { createClient } from '@/lib/supabase/server'
import { BlogPageView } from './blog-page-view'

export const metadata = {
  title: 'المدونة والأخبار — JAZ Iraq | Joint Annual Zone',
  description:
    'اطّلع على أحدث المقالات والأخبار من عالم المعارض والمؤتمرات التجارية في العراق والمنطقة. رؤى وتحليلات من فريق JAZ.',
  keywords: ['أخبار JAZ', 'مدونة معارض العراق', 'JAZ blog', 'أخبار مؤتمرات العراق'],
  openGraph: {
    title: 'المدونة والأخبار | JAZ Iraq',
    description: 'أحدث المقالات والأخبار من عالم المعارض والمؤتمرات في العراق.',
    url: 'https://jaz.iq/blog',
  },
  alternates: { canonical: 'https://jaz.iq/blog' },
}

const ESTABLISHED_YEAR = 2022

export default async function BlogPage() {
  const supabase = await createClient()

  const [
    { data: posts, error },
    { count: totalArticles },
    { data: categoriesRows },
    { data: readingRows },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .eq('type', 'blog')
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'blog')
      .eq('status', 'published'),
    supabase
      .from('posts')
      .select('category')
      .eq('type', 'blog')
      .eq('status', 'published')
      .not('category', 'is', null),
    supabase
      .from('posts')
      .select('reading_time')
      .eq('type', 'blog')
      .eq('status', 'published')
      .not('reading_time', 'is', null),
  ])

  if (error) {
    console.error('Error fetching posts:', error)
  }

  const uniqueCategories = new Set(
    (categoriesRows || [])
      .map((row) => row.category?.trim().toLowerCase())
      .filter((value): value is string => Boolean(value)),
  ).size

  const totalReadingMinutes = (readingRows || []).reduce(
    (sum, row) => sum + (row.reading_time ?? 0),
    0,
  )

  const stats = {
    articles: totalArticles ?? (posts?.length ?? 0),
    categories: uniqueCategories,
    readingTime: totalReadingMinutes,
    years: Math.max(1, new Date().getFullYear() - ESTABLISHED_YEAR),
  }

  return <BlogPageView posts={posts ?? []} stats={stats} />
}
