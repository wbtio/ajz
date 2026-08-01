'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { notifyAdmins } from '@/lib/notifications'
import { sendEmail, generateContactMessageEmail } from '@/lib/email'
import { getNotificationRecipients } from '@/lib/site-settings'

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

    // …and an email to whoever is listed under Settings → Notifications.
    // A failure here must not lose the message, which is already saved.
    try {
      const recipients = await getNotificationRecipients('on_new_contact_message')
      if (recipients.length) {
        await sendEmail({
          to: recipients,
          subject: `رسالة تواصل جديدة — ${rawData.full_name}`,
          html: generateContactMessageEmail({
            fullName: rawData.full_name,
            email: rawData.email,
            phone: rawData.phone,
            subject: rawData.subject,
            category: rawData.category,
            message: rawData.message,
          }),
        })
      }
    } catch (emailError) {
      console.error('Contact notification email failed:', emailError)
    }

    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return { success: false, error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' }
  }
}
