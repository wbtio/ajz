'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/database.types'
import { sendEmail, generateSectorRegistrationEmail } from '@/lib/email'

export async function submitSectorRegistration(sectorId: string, data: Record<string, string>) {
  try {
    const supabase = await createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    const fullName = [data.given_name, data.surname].filter(Boolean).join(' ').trim() || data.full_name || data.company_name || null
    const email = data.email || data.personal_email_address || null
    const phone = data.telephone || data.personal_telephone || data.contact_number || data.phone || null

    // Get sector information
    const { data: sector } = await supabase
      .from('sectors')
      .select('name_en, name_ar')
      .eq('id', sectorId)
      .single()

    const sectorName = sector?.name_ar || sector?.name_en || 'القطاع'

    // Insert registration into database
    const { error } = await supabase
      .from('sector_registrations')
      .insert({
        // @ts-ignore - keeping sector_id just in case it exists in DB but not in types
        sector_id: sectorId,
        sector_name: sectorName,
        user_id: user?.id || null,
        full_name: fullName || 'غير معروف',
        email: email || '',
        phone: phone,
        additional_info: data as Json,
        status: 'pending'
      })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to submit form')
    }

    // Send email notifications
    if (email) {
      // Send confirmation email to user
      const userEmailHtml = generateSectorRegistrationEmail({
        sectorName,
        fullName: fullName || 'المستخدم',
        email,
        phone: phone || undefined,
        formData: data,
        isAdminEmail: false
      })

      await sendEmail({
        to: [email],
        subject: `تأكيد استلام طلب التسجيل - ${sectorName}`,
        html: userEmailHtml
      })

      // Send notification email to admin
      const adminEmailHtml = generateSectorRegistrationEmail({
        sectorName,
        fullName: fullName || 'غير محدد',
        email,
        phone: phone || undefined,
        formData: data,
        isAdminEmail: true
      })

      await sendEmail({
        to: ['jaz.registr@gmail.com'],
        subject: `طلب تسجيل جديد - ${sectorName} - ${fullName || email}`,
        html: adminEmailHtml
      })
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error submitting form:', error)
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
  }
}
