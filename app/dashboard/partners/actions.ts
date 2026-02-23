'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
        revalidatePath('/partners')
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
        revalidatePath('/partners')
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
        revalidatePath('/partners')
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
        revalidatePath('/partners')
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
        revalidatePath('/partners')
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
        revalidatePath('/partners')
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
        revalidatePath('/dashboard/partners')
        return { success: true }
    } catch (err: any) {
        console.error('submitPartnerForm failed:', err)
        throw new Error(err.message)
    }
}
