'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/lib/database.types'

type Post = Tables<'posts'>

export async function getPosts() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getPost(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createPost(formData: Partial<Post>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  if (!formData.title) {
    return { data: null, error: 'Title is required' }
  }

  const slug = formData.slug || generateSlug(formData.title)

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: formData.title,
      slug,
      author_id: user.id,
      status: formData.status || 'draft',
      type: 'blog',
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      title_ar: formData.title_ar,
      content: formData.content,
      content_ar: formData.content_ar,
      excerpt: formData.excerpt,
      excerpt_ar: formData.excerpt_ar,
      category: formData.category,
      featured_image_url: formData.featured_image_url,
      image_url: formData.image_url,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      keywords: formData.keywords,
      reading_time: formData.reading_time,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/blog')
  revalidatePath('/blog')
  
  return { data, error: null }
}

export async function updatePost(id: string, formData: Partial<Post>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const updateData: Partial<Post> = {
    ...formData,
    updated_at: new Date().toISOString(),
  }

  if (formData.status === 'published' && !formData.published_at) {
    updateData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating post:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${id}`)
  
  return { data, error: null }
}

export async function deletePost(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting post:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/blog')
  revalidatePath('/blog')
  
  return { error: null }
}

export async function incrementViews(id: string) {
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('views_count')
    .eq('id', id)
    .single()

  if (!post) return

  await supabase
    .from('posts')
    .update({ views_count: (post.views_count || 0) + 1 })
    .eq('id', id)
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `post-${Date.now()}`
}
