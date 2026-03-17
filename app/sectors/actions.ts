'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/database.types'

export async function submitSectorRegistration(sectorId: string, data: Record<string, string>) {
  try {
    const supabase = await createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // We assume there is a table 'sector_registrations'
    // If not, we might need to store it in a generic 'submissions' table or similar.
    // Since I cannot create the table via MCP, I will assume it exists or the user will create it.
    // Structure: id, sector_id, user_id, data (jsonb), status, created_at

    const { error } = await supabase
      .from('sector_registrations')
      .insert({
        sector_id: sectorId,
        user_id: user?.id || null,
        data: data as Json,
        status: 'pending'
      })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to submit form')
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error submitting form:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
}
