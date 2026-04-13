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

  return <BlogPageView posts={posts ?? []} />
}
