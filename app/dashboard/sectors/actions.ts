'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Sector } from '@/lib/database.types'

export async function uploadImage(formData: FormData) {
  try {
    const supabase = await createClient()
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `sectors/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('events-bucket')
      .upload(filePath, file)

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('events-bucket')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error: any) {
    console.error('Error in uploadImage:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

export async function getSectors() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) {
      console.error('Supabase error in getSectors:', error)
      throw new Error(error.message)
    }

    // Ensure we return a plain array of objects
    return JSON.parse(JSON.stringify(data)) as any[]
  } catch (error: any) {
    console.error('Error in getSectors action:', error)
    throw new Error(error.message || 'Failed to fetch sectors')
  }
}

export async function createSector(data: any) {
  try {
    const supabase = await createClient()
    
    // Create a plain object for insertion
    const insertData = {
      ...data,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('sectors')
      .insert([insertData])

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/sectors')
    return { success: true }
  } catch (error: any) {
    console.error('Error in createSector action:', error)
    throw new Error(error.message || 'Failed to create sector')
  }
}

export async function updateSector(id: string, data: any) {
  try {
    const supabase = await createClient()
    
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('sectors')
      .update(updateData)
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/sectors')
    return { success: true }
  } catch (error: any) {
    console.error('Error in updateSector action:', error)
    throw new Error(error.message || 'Failed to update sector')
  }
}

export async function deleteSector(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id)

    if (error) throw new Error('فشل حذف القطاع')

    revalidatePath('/dashboard/sectors')
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteSector action:', error)
    throw new Error(error.message || 'Failed to delete sector')
  }
}

export async function getSectorRegistrations() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sector_registrations' as any)
      .select(`
        *,
        users:user_id (full_name, email),
        sectors:sector_id (name, name_ar, registration_config)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error in getSectorRegistrations:', error)
      throw new Error(error.message)
    }

    return JSON.parse(JSON.stringify(data)) as any[]
  } catch (error: any) {
    console.error('Error in getSectorRegistrations action:', error)
    throw new Error(error.message || 'Failed to fetch registrations')
  }
}
