'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SectorRegistrationStatus = 'pending' | 'approved' | 'rejected'

export async function updateSectorRegistrationStatus(id: string, status: SectorRegistrationStatus) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('sector_registrations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(error.message || 'تعذر تحديث حالة الطلب')
    }

    revalidatePath('/dashboard/sector-registrations')
    return { success: true }
  } catch (error) {
    console.error('Error updating sector registration status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'تعذر تحديث حالة الطلب',
    }
  }
}

export async function deleteSectorRegistration(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('sector_registrations')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message || 'تعذر حذف الطلب')
    }

    revalidatePath('/dashboard/sector-registrations')
    return { success: true }
  } catch (error) {
    console.error('Error deleting sector registration:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'تعذر حذف الطلب',
    }
  }
}
