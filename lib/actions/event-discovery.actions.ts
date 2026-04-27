'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SearchSessionStatus = 'processing' | 'completed' | 'failed'
export type EventCacheStatus = 'ready_for_review' | 'weak_result' | 'duplicate'
export type ReviewStatus = 'pending' | 'approved_for_outreach' | 'rejected' | 'mark_for_manual_review' | 'ready_to_publish'

export interface SearchParams {
    sector?: string
    country?: string
    dateRangeStart?: string
    dateRangeEnd?: string
    eventType?: string
    keywords: string
}

export interface EventFilters {
    status?: EventCacheStatus
    reviewStatus?: ReviewStatus
    sector?: string
    duplicate?: boolean
    minRelevanceScore?: number
    hasOrganizer?: boolean
    hasContact?: boolean
    search?: string
}

export async function triggerSearch(params: SearchParams) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Create a new search session in DB
    const { data: session, error } = await supabase
        .from('search_sessions')
        .insert({
            sector: params.sector || null,
            country: params.country || null,
            date_range_start: params.dateRangeStart || null,
            date_range_end: params.dateRangeEnd || null,
            event_type: params.eventType || null,
            keywords: params.keywords,
            status: 'processing',
            created_by: user.id
        })
        .select()
        .single()

    if (error || !session) {
        console.error('Failed to create search session:', error)
        throw new Error('Failed to create search session')
    }

    // 2. Trigger n8n webhook
    // Using environment variable for n8n Webhook URL, or a fallback for local dev
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://ollama75.app.n8n.cloud/webhook-test/jaz-event-search'
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: session.id, // We send the DB session ID to n8n
                sector: params.sector,
                country: params.country,
                dateRange: {
                    start: params.dateRangeStart,
                    end: params.dateRangeEnd
                },
                eventType: params.eventType,
                keywords: params.keywords
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Webhook failed with status ${response.status}: ${errorText}`)
        }
    } catch (err) {
        console.error('Failed to trigger n8n workflow:', err)
        // Optionally mark session as failed if webhook cannot be reached
        await supabase.from('search_sessions').update({ status: 'failed' }).eq('id', session.id)
        throw new Error('Failed to trigger discovery workflow')
    }

    revalidatePath('/dashboard/event-discovery/sessions')
    return { success: true, sessionId: session.id }
}

export async function getSearchSessions(page = 1, limit = 10) {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await supabase
        .from('search_sessions')
        .select('*, users:created_by (full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) throw error
    return { data, count }
}

export async function getEventsByFilters(filters: EventFilters, page = 1, limit = 20) {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('event_cache')
        .select('id, title, ai_relevance_score, status, review_status, ai_sector, organizer_name, official_url, duplicate_of', { count: 'exact' })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.reviewStatus) query = query.eq('review_status', filters.reviewStatus)
    if (filters.sector) query = query.eq('ai_sector', filters.sector)
    
    if (filters.duplicate !== undefined) {
        if (filters.duplicate) {
            query = query.not('duplicate_of', 'is', null)
        } else {
            query = query.is('duplicate_of', null)
        }
    }
    
    if (filters.minRelevanceScore) query = query.gte('ai_relevance_score', filters.minRelevanceScore)
    if (filters.hasOrganizer) query = query.eq('has_clear_organizer', true)
    if (filters.hasContact) query = query.eq('has_contact_info', true)
    
    if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,organizer_name.ilike.%${filters.search}%`)
    }

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) throw error
    return { data, count }
}

export async function getEventDetails(id: string) {
    const supabase = await createClient()

    const { data: event, error: eventError } = await supabase
        .from('event_cache')
        .select(`
            *,
            search_sessions (*),
            review_actions (
                id,
                action,
                notes,
                created_at,
                users:performed_by (full_name)
            )
        `)
        .eq('id', id)
        .single()

    if (eventError || !event) throw new Error('Event not found')

    // Order review actions
    if (event.review_actions && Array.isArray(event.review_actions)) {
        event.review_actions.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }

    return event
}

export async function submitReview(eventId: string, action: ReviewStatus, notes?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Insert into review_actions
    const { error: insertError } = await supabase
        .from('review_actions')
        .insert({
            event_cache_id: eventId,
            action,
            performed_by: user.id,
            notes: notes || null
        })

    if (insertError) throw insertError

    // 2. Update event_cache
    const { error: updateError } = await supabase
        .from('event_cache')
        .update({
            review_status: action,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            review_notes: notes || null
        })
        .eq('id', eventId)

    if (updateError) throw updateError

    revalidatePath(`/dashboard/event-discovery/results/${eventId}`)
    revalidatePath('/dashboard/event-discovery/results')
    
    return { success: true }
}
