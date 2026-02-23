'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitSectorRegistration(sectorId: string, data: any) {
  try {
    const supabase = await createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // We assume there is a table 'sector_registrations'
    // If not, we might need to store it in a generic 'submissions' table or similar.
    // Since I cannot create the table via MCP, I will assume it exists or the user will create it.
    // Structure: id, sector_id, user_id, data (jsonb), status, created_at

    const { error } = await supabase
      .from('sector_registrations' as any)
      .insert({
        sector_id: sectorId,
        user_id: user?.id || null,
        data: data,
        status: 'pending'
      })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('فشل إرسال النموذج')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error submitting form:', error)
    throw new Error(error.message || 'حدث خطأ غير متوقع')
  }
}
