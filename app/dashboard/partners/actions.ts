'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { notifyAdmins } from '@/lib/notifications'

// Categories
export async function getPartnerCategories() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('partner_categories')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) {
            console.error('Error fetching partner categories:', error)
            throw new Error(error.message)
        }
        return data
    } catch (err) {
        console.error('Server action getPartnerCategories failed:', err)
        throw err
    }
}

export async function createPartnerCategory(data: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_categories').insert(data)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        revalidatePath('/partnership')
        return { success: true }
    } catch (err: any) {
        console.error('createPartnerCategory failed:', err)
        throw new Error(err.message)
    }
}

export async function updatePartnerCategory(id: string, data: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_categories').update(data).eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        revalidatePath('/partnership')
        return { success: true }
    } catch (err: any) {
        console.error('updatePartnerCategory failed:', err)
        throw new Error(err.message)
    }
}

export async function deletePartnerCategory(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_categories').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        revalidatePath('/partnership')
        return { success: true }
    } catch (err: any) {
        console.error('deletePartnerCategory failed:', err)
        throw new Error(err.message)
    }
}

// Opportunities
export async function getPartnerOpportunities() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('partner_opportunities')
            .select('*, category:partner_categories(title_ar, title_en)')
            .order('sort_order', { ascending: true })

        if (error) throw error
        return data
    } catch (err: any) {
        console.error('getPartnerOpportunities failed:', err)
        throw new Error(err.message)
    }
}

export async function createPartnerOpportunity(data: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_opportunities').insert(data)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        revalidatePath('/partnership')
        return { success: true }
    } catch (err: any) {
        console.error('createPartnerOpportunity failed:', err)
        throw new Error(err.message)
    }
}

export async function updatePartnerOpportunity(id: string, data: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_opportunities').update(data).eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        revalidatePath('/partnership')
        return { success: true }
    } catch (err: any) {
        console.error('updatePartnerOpportunity failed:', err)
        throw new Error(err.message)
    }
}

export async function deletePartnerOpportunity(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_opportunities').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        revalidatePath('/partnership')
        return { success: true }
    } catch (err: any) {
        console.error('deletePartnerOpportunity failed:', err)
        throw new Error(err.message)
    }
}

// Submissions
export async function getPartnerSubmissions() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('partner_submissions')
            .select(`
                *,
                opportunity:partner_opportunities(
                    id,
                    title_ar,
                    title_en,
                    category:partner_categories(title_ar)
                ),
                user:users(full_name, email, phone)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    } catch (err: any) {
        console.error('getPartnerSubmissions failed:', err)
        throw new Error(err.message)
    }
}

export async function updatePartnerSubmissionStatus(id: string, status: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_submissions').update({ status }).eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/partners')
        return { success: true }
    } catch (err: any) {
        console.error('updatePartnerSubmissionStatus failed:', err)
        throw new Error(err.message)
    }
}

export async function submitPartnerForm(data: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('partner_submissions').insert(data)
        if (error) throw error

        const fields = (data?.data ?? {}) as Record<string, string>
        const nameKey = Object.keys(fields).find((k) => /اسم|name/i.test(k))
        const submitterName = (nameKey && fields[nameKey]) || 'جهة جديدة'
        // notifyAdmins يحتاج قراءة كل المستخدمين بدور admin — الزائر ممنوع من هذا بالـ RLS
        await notifyAdmins(createAdminClient(), {
            type: 'partner_submission',
            title: 'طلب شراكة جديد',
            body: submitterName,
            linkUrl: '/dashboard/partners',
        })

        revalidatePath('/dashboard/partners')
        return { success: true }
    } catch (err: any) {
        console.error('submitPartnerForm failed:', err)
        throw new Error(err.message)
    }
}

export async function submitStaticPartnerForm(data: any, type: string) {
    try {
        const supabase = await createClient()
        const fullName = data['الاسم الكامل / Full Name'] || data['اسم الممثل الرسمي والمنصب / Contact Person & Title'] || 'Anonymous'
        // Save to contact_messages to avoid requiring UUID foreign keys
        const { error } = await supabase.from('contact_messages').insert({
            full_name: fullName,
            email: data['البريد الإلكتروني الرسمي / Official Email'] || 'no-email@example.com',
            phone: data['رقم التواصل / Contact Number'] || data['رقم الواتساب / WhatsApp Number'] || '',
            subject: `طلب انضمام/شراكة: ${type}`,
            category: 'Partnership',
            message: JSON.stringify(data, null, 2),
            status: 'new'
        })
        if (error) throw error

        await notifyAdmins(createAdminClient(), {
            type: 'partner_submission',
            title: `طلب انضمام/شراكة: ${type}`,
            body: fullName,
            linkUrl: '/dashboard/messages',
        })

        return { success: true }
    } catch (err: any) {
        console.error('submitStaticPartnerForm failed:', err)
        throw new Error(err.message)
    }
}
