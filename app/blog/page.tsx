import { createClient } from '@/lib/supabase/server'
import { BlogPageView } from './blog-page-view'

export const metadata = {
  title: 'Blog | JAZ - Latest News and Articles',
  description: 'Discover the latest news, articles, and updates from the world of events and exhibitions in Iraq',
  openGraph: {
    title: 'Blog | JAZ',
    description: 'Latest news and articles from JAZ',
  },
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
