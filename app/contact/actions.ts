'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { notifyAdmins } from '@/lib/notifications'

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

    // notifyAdmins يحتاج قراءة كل المستخدمين بدور admin — الزائر غير المسجّل كمدير ممنوع من هذا بالـ RLS
    await notifyAdmins(createAdminClient(), {
      type: 'contact_message',
      title: 'رسالة تواصل جديدة',
      body: `${rawData.full_name} — ${rawData.subject}`,
      linkUrl: '/dashboard/messages',
    })

    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return { success: false, error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' }
  }
}
