'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitContactForm(formData: FormData) {
  try {
    const supabase = await createClient()

    const rawData = {
      full_name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      category: formData.get('category') as string,
      related_id: formData.get('related_id') as string,
      related_title: formData.get('related_title') as string,
      message: formData.get('message') as string,
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert([rawData])

    if (error) throw error

    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return { success: false, error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' }
  }
}
