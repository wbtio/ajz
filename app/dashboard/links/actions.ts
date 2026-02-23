'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Link Categories Actions
export async function getLinkCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('link_categories')
    .select('*')
    .order('sort_order')
  
  if (error) throw error
  return data
}

export async function createLinkCategory(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('link_categories').insert({
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    description_ar: formData.get('description_ar') as string || null,
    description_en: formData.get('description_en') as string || null,
    icon: formData.get('icon') as string || null,
    color: formData.get('color') as string || '#3B82F6',
    slug: formData.get('slug') as string,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

export async function updateLinkCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('link_categories')
    .update({
      title_ar: formData.get('title_ar') as string,
      title_en: formData.get('title_en') as string,
      description_ar: formData.get('description_ar') as string || null,
      description_en: formData.get('description_en') as string || null,
      icon: formData.get('icon') as string || null,
      color: formData.get('color') as string || '#3B82F6',
      slug: formData.get('slug') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

export async function deleteLinkCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('link_categories').delete().eq('id', id)
  
  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

// Countries Actions
export async function getCountries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('sort_order')
  
  if (error) throw error
  return data
}

export async function createCountry(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('countries').insert({
    name_ar: formData.get('name_ar') as string,
    name_en: formData.get('name_en') as string,
    code: formData.get('code') as string,
    flag_emoji: formData.get('flag_emoji') as string || null,
    region: formData.get('region') as string || null,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

export async function updateCountry(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('countries')
    .update({
      name_ar: formData.get('name_ar') as string,
      name_en: formData.get('name_en') as string,
      code: formData.get('code') as string,
      flag_emoji: formData.get('flag_emoji') as string || null,
      region: formData.get('region') as string || null,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

export async function deleteCountry(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('countries').delete().eq('id', id)
  
  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

// Links Actions
export async function getLinks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('links')
    .select(`
      *,
      category:link_categories(title_ar),
      country:countries(name_ar, flag_emoji)
    `)
    .order('sort_order')
  
  if (error) throw error
  return data
}

export async function createLink(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('links').insert({
    category_id: formData.get('category_id') as string || null,
    country_id: formData.get('country_id') as string || null,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    description_ar: formData.get('description_ar') as string || null,
    description_en: formData.get('description_en') as string || null,
    url: formData.get('url') as string,
    link_type: formData.get('link_type') as string || 'external',
    organization_type: formData.get('organization_type') as string || null,
    industry: formData.get('industry') as string || null,
    home_country: formData.get('home_country') as string || null,
    icon: formData.get('icon') as string || null,
    color: formData.get('color') as string || null,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
    is_active: formData.get('is_active') === 'true',
    is_verified: formData.get('is_verified') === 'true',
  })

  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

export async function updateLink(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('links')
    .update({
      category_id: formData.get('category_id') as string || null,
      country_id: formData.get('country_id') as string || null,
      title_ar: formData.get('title_ar') as string,
      title_en: formData.get('title_en') as string,
      description_ar: formData.get('description_ar') as string || null,
      description_en: formData.get('description_en') as string || null,
      url: formData.get('url') as string,
      link_type: formData.get('link_type') as string || 'external',
      organization_type: formData.get('organization_type') as string || null,
      industry: formData.get('industry') as string || null,
      home_country: formData.get('home_country') as string || null,
      icon: formData.get('icon') as string || null,
      color: formData.get('color') as string || null,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
      is_verified: formData.get('is_verified') === 'true',
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}

export async function deleteLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('links').delete().eq('id', id)
  
  if (error) throw error
  revalidatePath('/dashboard/links')
  revalidatePath('/links')
}
