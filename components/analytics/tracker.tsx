"use client"

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/actions/analytics.actions'

function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function getSessionId() {
    if (typeof window === 'undefined') return ''
    
    let sessionId = sessionStorage.getItem('jaz_analytics_session')
    if (!sessionId) {
        sessionId = generateSessionId()
        sessionStorage.setItem('jaz_analytics_session', sessionId)
    }
    return sessionId
}

export function Tracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!pathname) return

        const sessionId = getSessionId()
        const url = window.location.href

        trackEvent({
            eventType: 'page_view',
            path: pathname,
            url: url,
            sessionId: sessionId,
            metadata: {
                searchParams: searchParams.toString()
            }
        })
    }, [pathname, searchParams])

    return null
}

export function useTracking() {
    const track = useCallback((eventType: string, metadata?: any) => {
        const sessionId = getSessionId()
        const path = window.location.pathname
        const url = window.location.href

        trackEvent({
            eventType,
            path,
            url,
            sessionId,
            metadata
        })
    }, [])

    return {
        track,
        trackRegistrationClick: (metadata?: any) => track('registration_click', metadata),
        trackSearch: (query: string) => track('search_submit', { query }),
        trackFormSubmit: (formId: string) => track('form_submit', { formId }),
        trackEventView: (eventId: string) => track('event_view', { eventId }),
        trackOutboundLink: (url: string) => track('outbound_link_click', { url })
    }
}
