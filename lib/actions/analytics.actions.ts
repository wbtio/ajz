"use server"

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type AnalyticsRange = 'today' | '7d' | '30d'

export async function trackEvent({
    eventType,
    path,
    url,
    sessionId,
    metadata = {}
}: {
    eventType: string,
    path: string,
    url?: string,
    sessionId: string,
    metadata?: any
}) {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || ''
        const country = headersList.get('x-vercel-ip-country') || 'Unknown'
        
        let deviceType = 'desktop'
        if (/mobile/i.test(userAgent)) deviceType = 'mobile'
        else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet'

        // Merge device and country into metadata
        const enrichedMetadata = {
            ...metadata,
            device_type: deviceType,
            country: country
        }

        const supabase = await createClient()
        
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('analytics_events').insert({
            event_type: eventType,
            path: path,
            url: url,
            session_id: sessionId,
            user_id: user?.id || null,
            metadata: enrichedMetadata
        })
    } catch (error) {
        console.error('Analytics tracking error:', error)
    }
}

export async function getAnalyticsSummary(range: AnalyticsRange = '7d') {
    const supabase = await createClient()

    // Determine the date filter based on range
    const now = new Date()
    const startDate = new Date()
    
    if (range === 'today') {
        startDate.setHours(0, 0, 0, 0)
    } else if (range === '7d') {
        startDate.setDate(now.getDate() - 7)
    } else if (range === '30d') {
        startDate.setDate(now.getDate() - 30)
    }

    const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())

    if (error) {
        console.error('Error fetching analytics:', error)
        return null
    }

    // Process KPI Cards
    const visitors = new Set(events.map(e => e.session_id)).size
    const pageViews = events.filter(e => e.event_type === 'page_view').length
    const registrationClicks = events.filter(e => e.event_type === 'registration_click').length
    const searches = events.filter(e => e.event_type === 'search_submit').length
    const formSubmits = events.filter(e => e.event_type === 'form_submit').length

    // Process Trend Data for Chart
    const trendMap = new Map<string, { date: string, views: number, visitors: Set<string> }>()
    
    events.forEach(e => {
        // Group by day for 7d and 30d, group by hour for today
        const dateObj = new Date(e.created_at!)
        let dateKey = ''
        if (range === 'today') {
            dateKey = `${dateObj.getHours()}:00`
        } else {
            // format: YYYY-MM-DD
            dateKey = dateObj.toISOString().split('T')[0]
        }

        if (!trendMap.has(dateKey)) {
            trendMap.set(dateKey, { date: dateKey, views: 0, visitors: new Set() })
        }
        
        const entry = trendMap.get(dateKey)!
        if (e.event_type === 'page_view') {
            entry.views += 1
        }
        entry.visitors.add(e.session_id)
    })

    const chartData = Array.from(trendMap.values()).map(v => ({
        date: v.date,
        views: v.views,
        visitors: v.visitors.size
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Process Top Pages
    const pagesMap = new Map<string, number>()
    const eventIdsToFetch = new Set<string>()

    events.filter(e => e.event_type === 'page_view').forEach(e => {
        pagesMap.set(e.path, (pagesMap.get(e.path) || 0) + 1)
        // Check if path is an event
        if (e.path.startsWith('/events/')) {
            const id = e.path.split('/events/')[1]?.split('/')[0]
            if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
                eventIdsToFetch.add(id)
            }
        }
    })

    // Process Top Event Interactions
    const eventsMap = new Map<string, number>()
    events.filter(e => e.event_type !== 'page_view').forEach(e => {
        eventsMap.set(e.event_type, (eventsMap.get(e.event_type) || 0) + 1)
        // Also if metadata has eventId, we can track per-event engagement
        const metadata = e.metadata as any
        if (metadata?.eventId) {
            eventIdsToFetch.add(metadata.eventId)
        }
    })

    // Fetch real event data
    let realEvents: any[] = []
    if (eventIdsToFetch.size > 0) {
        const { data: fetchedEvents } = await supabase
            .from('events')
            .select('id, title')
            .in('id', Array.from(eventIdsToFetch))
        if (fetchedEvents) realEvents = fetchedEvents
    }
    const getEventTitle = (id: string) => realEvents.find(e => e.id === id)?.title || 'Unknown Event'

    const topPages = Array.from(pagesMap.entries())
        .map(([path, views]) => {
            let label = path
            if (path.startsWith('/events/')) {
                const id = path.split('/events/')[1]?.split('/')[0]
                if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
                    label = `Event: ${getEventTitle(id)}`
                }
            } else if (path === '/') {
                label = 'Homepage'
            }
            return { path, label, views }
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

    const actionFrequencies = Array.from(eventsMap.entries())
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    // Detailed Event Performance
    // Let's calculate views and clicks per specific event
    const eventPerformanceMap = new Map<string, { views: number, clicks: number }>()
    events.forEach(e => {
        let eventId = null
        if (e.event_type === 'page_view' && e.path.startsWith('/events/')) {
            const id = e.path.split('/events/')[1]?.split('/')[0]
            if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) eventId = id
        } else if (e.event_type === 'registration_click' || e.event_type === 'event_view') {
            const metadata = e.metadata as any
            if (metadata?.eventId) eventId = metadata.eventId
        }

        if (eventId) {
            if (!eventPerformanceMap.has(eventId)) {
                eventPerformanceMap.set(eventId, { views: 0, clicks: 0 })
            }
            const data = eventPerformanceMap.get(eventId)!
            if (e.event_type === 'page_view' || e.event_type === 'event_view') {
                data.views += 1
            } else if (e.event_type === 'registration_click') {
                data.clicks += 1
            }
        }
    })

    const detailedEventPerformance = Array.from(eventPerformanceMap.entries())
        .map(([id, data]) => ({
            id,
            title: getEventTitle(id),
            views: data.views,
            clicks: data.clicks,
            conversionRate: data.views > 0 ? ((data.clicks / data.views) * 100).toFixed(1) + '%' : '0%'
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

    // Process Recent Conversions
    const conversions = events
        .filter(e => ['form_submit', 'registration_click'].includes(e.event_type))
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 8)
        .map(e => {
            let label = e.path
            const metadata = e.metadata as any
            if (metadata?.eventId) {
                label = getEventTitle(metadata.eventId)
            } else if (e.path.startsWith('/events/')) {
                const id = e.path.split('/events/')[1]?.split('/')[0]
                if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) label = getEventTitle(id)
            }
            return { ...e, label }
        })

    return {
        kpis: { visitors, pageViews, registrationClicks, searches, conversions: formSubmits + registrationClicks },
        chartData,
        topPages,
        actionFrequencies,
        detailedEventPerformance,
        conversions
    }
}
