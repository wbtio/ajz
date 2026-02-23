'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import {
    Calendar, MapPin, Users, Ticket,
    Globe, MapPin as MapPinIcon, ChevronLeft, ChevronRight,
    ClipboardList, Home, Palette, Award, Store, Handshake, CalendarDays, Clock, User, Wrench, FileText, type LucideIcon
} from 'lucide-react'
import { ConferenceForm } from '@/components/conference/conference-form'
import { useI18n } from '@/lib/i18n'
import type { FormField } from '@/lib/types'

/* ============================================================
   EVENT HERO - Client component for locale-aware hero section
   ============================================================ */

interface EventHeroProps {
    event: {
        id?: string
        title?: string | null
        title_ar?: string | null
        description?: string | null
        description_ar?: string | null
        image_url?: string | null
        date?: string | null
        end_date?: string | null
        location?: string | null
        location_ar?: string | null
        country?: string | null
        country_ar?: string | null
        capacity?: number | null
        price?: number | null
        show_price?: boolean | null
        event_type?: string | null
        featured?: boolean | null
        sub_sector?: string | null
        sub_sector_ar?: string | null
        html_content_url?: string | null
    }
    sectorName_ar?: string | null
    sectorName_en?: string | null
}

export function EventHero({ event, sectorName_ar, sectorName_en }: EventHeroProps) {
    const { t, locale } = useI18n()
    const isAr = locale === 'ar'
    const showPrice = event.show_price !== false

    const title = isAr ? (event.title_ar || event.title) : (event.title || event.title_ar)
    const description = isAr ? (event.description_ar || event.description) : (event.description || event.description_ar)
    const locationParts = isAr 
        ? [event.location_ar || event.location, event.country_ar || event.country].filter(Boolean)
        : [event.location || event.location_ar, event.country || event.country_ar].filter(Boolean)
    const location = locationParts.join(isAr ? '، ' : ', ')
    const sectorName = isAr ? (sectorName_ar || sectorName_en) : (sectorName_en || sectorName_ar)
    const Chevron = isAr ? ChevronLeft : ChevronRight
    const dateLocale = isAr ? 'ar-IQ' : 'en-US'

    return (
        <div className="relative h-[400px] md:h-[480px] overflow-hidden">
            {event.image_url ? (
                <Image
                    src={event.image_url}
                    alt={title || ''}
                    fill
                    className="object-cover"
                    priority
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

            <div className="relative z-10 h-full flex flex-col justify-end pb-10">
                <Container>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">{t.events.breadcrumbHome}</Link>
                        <Chevron className="w-3.5 h-3.5" />
                        <Link href="/events" className="hover:text-white transition-colors">{t.events.breadcrumbEvents}</Link>
                        <Chevron className="w-3.5 h-3.5" />
                        <span className="text-white/80">{title}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {event.event_type === 'international' ? (
                            <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white border-0 gap-1.5 px-3 py-1">
                                <Globe className="w-3.5 h-3.5" />
                                {t.events.international}
                            </Badge>
                        ) : (
                            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-0 gap-1.5 px-3 py-1">
                                <MapPinIcon className="w-3.5 h-3.5" />
                                {t.events.local}
                            </Badge>
                        )}
                        {event.featured && (
                            <Badge className="bg-yellow-500/90 hover:bg-yellow-500 text-white border-0 px-3 py-1">
                                {t.events.featuredBadge}
                            </Badge>
                        )}
                        {sectorName && (
                            <Badge variant="outline" className="border-white/30 text-white/90 px-3 py-1">
                                {sectorName}
                            </Badge>
                        )}
                        {(event.sub_sector || event.sub_sector_ar) && (
                            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/10 px-3 py-1">
                                {isAr ? (event.sub_sector_ar || event.sub_sector) : (event.sub_sector || event.sub_sector_ar)}
                            </Badge>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className="text-white/70 text-base md:text-lg max-w-3xl leading-relaxed mb-5 line-clamp-2">
                            {description}
                        </p>
                    )}

                    {/* Event Info Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                        {event.date && (
                            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                <Calendar className="w-4 h-4 text-white/70" />
                                <span>{new Date(event.date).toLocaleDateString(dateLocale)}</span>
                                {event.end_date && <span className="text-white/50">- {new Date(event.end_date).toLocaleDateString(dateLocale)}</span>}
                            </div>
                        )}
                        {location && (
                            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                <MapPin className="w-4 h-4 text-white/70" />
                                <span>{location}</span>
                            </div>
                        )}
                        {event.capacity && event.capacity > 0 && (
                            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                <Users className="w-4 h-4 text-white/70" />
                                <span>{event.capacity} {t.events.person}</span>
                            </div>
                        )}
                        {showPrice && (
                            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                <Ticket className="w-4 h-4 text-white/70" />
                                <span>{event.price && event.price > 0 ? `${event.price.toLocaleString()} ${t.events.currency}` : t.events.free}</span>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </div>
    )
}

/* ============================================================
   EVENT TABS - Client component for conference section tabs
   ============================================================ */

interface TopicItem {
    id: string
    image_url?: string
    title_ar: string
    title_en: string
    description_ar: string
    description_en: string
}

interface SectionConfig {
    enabled?: boolean
    content_ar?: string
    content_en?: string
    form_fields?: FormField[]
    topics?: TopicItem[]
}

interface SessionItem {
    id: string
    date: string
    start_time: string
    end_time: string
    title_ar: string
    title_en: string
    speaker_ar: string
    speaker_en: string
    location_ar: string
    location_en: string
    category: 'session' | 'workshop'
    description_ar: string
    description_en: string
}

interface ProgramConfig {
    enabled?: boolean
    sessions?: SessionItem[]
}

interface ConferenceConfig {
    home?: SectionConfig
    theme?: SectionConfig
    sponsors?: SectionConfig
    exhibitors?: SectionConfig
    partners?: SectionConfig
    registration?: SectionConfig
    program?: ProgramConfig
}

interface EventTabsProps {
    eventId: string
    conferenceConfig: ConferenceConfig | null
    templateConferenceConfig?: ConferenceConfig | null
    description_ar?: string | null
    description_en?: string | null
}

type TabKey = 'home' | 'theme' | 'sponsors' | 'exhibitors' | 'partners' | 'registration' | 'program'

const sectionsMeta: { key: TabKey; icon: LucideIcon; accent: string; accentText: string; iconBg: string }[] = [
    { key: 'home', icon: Home, accent: 'bg-blue-600', accentText: 'text-blue-600', iconBg: 'bg-blue-100 text-blue-600' },
    { key: 'theme', icon: Palette, accent: 'bg-purple-600', accentText: 'text-purple-600', iconBg: 'bg-purple-100 text-purple-600' },
    { key: 'sponsors', icon: Award, accent: 'bg-yellow-500', accentText: 'text-yellow-600', iconBg: 'bg-yellow-100 text-yellow-600' },
    { key: 'exhibitors', icon: Store, accent: 'bg-green-600', accentText: 'text-green-600', iconBg: 'bg-green-100 text-green-600' },
    { key: 'partners', icon: Handshake, accent: 'bg-indigo-600', accentText: 'text-indigo-600', iconBg: 'bg-indigo-100 text-indigo-600' },
    { key: 'registration', icon: ClipboardList, accent: 'bg-red-600', accentText: 'text-red-600', iconBg: 'bg-red-100 text-red-600' },
    { key: 'program', icon: CalendarDays, accent: 'bg-teal-600', accentText: 'text-teal-600', iconBg: 'bg-teal-100 text-teal-600' },
]

function ProgramTimeline({ sessions, days, dayMap, isAr, t }: {
    sessions: SessionItem[]
    days: string[]
    dayMap: Map<string, SessionItem[]>
    isAr: boolean
    t: any
}) {
    const [activeDay, setActiveDay] = useState(days[0] || '')
    const currentSessions = dayMap.get(activeDay) || []

    const formatDayLabel = (dateStr: string, idx: number) => {
        if (dateStr === 'no-date') return isAr ? 'بدون تاريخ' : 'No Date'
        try {
            const d = new Date(dateStr)
            const dayName = d.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { weekday: 'long' })
            const dayNum = d.getDate()
            const month = d.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { month: 'short' })
            return `${dayName} ${dayNum} ${month}`
        } catch {
            return isAr ? `اليوم ${idx + 1}` : `Day ${idx + 1}`
        }
    }

    const formatTime = (time: string) => {
        if (!time) return ''
        try {
            const [h, m] = time.split(':').map(Number)
            const ampm = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM')
            const hour12 = h % 12 || 12
            return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
        } catch {
            return time
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-100 text-teal-600">
                    <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">{t.eventTabs.program}</h2>
                    <div className="w-10 h-1 rounded-full mt-1.5 bg-teal-600" />
                </div>
            </div>

            {/* Day Tabs */}
            {days.length > 1 && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {days.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                                activeDay === day
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                {formatDayLabel(day, idx)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-0">
                {currentSessions.map((sess, index) => {
                    const title = isAr ? (sess.title_ar || sess.title_en) : (sess.title_en || sess.title_ar)
                    const speaker = isAr ? (sess.speaker_ar || sess.speaker_en) : (sess.speaker_en || sess.speaker_ar)
                    const location = isAr ? (sess.location_ar || sess.location_en) : (sess.location_en || sess.location_ar)
                    const desc = isAr ? (sess.description_ar || sess.description_en) : (sess.description_en || sess.description_ar)
                    const isWorkshop = sess.category === 'workshop'

                    return (
                        <div key={sess.id} className="relative flex gap-4 md:gap-6">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center shrink-0 w-16 md:w-20">
                                {/* Time badge */}
                                <div className={`w-full text-center py-1.5 px-1 rounded-lg text-[11px] font-bold ${
                                    isWorkshop ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                                }`}>
                                    {formatTime(sess.start_time) || '--:--'}
                                </div>
                                {/* Vertical line */}
                                {index < currentSessions.length - 1 && (
                                    <div className={`w-0.5 flex-1 my-1 ${isWorkshop ? 'bg-amber-200' : 'bg-teal-200'}`} />
                                )}
                            </div>

                            {/* Session Card */}
                            <div className={`flex-1 mb-4 rounded-xl border-2 p-4 md:p-5 transition-shadow hover:shadow-md ${
                                isWorkshop
                                    ? 'border-amber-200 bg-amber-50/50'
                                    : 'border-gray-200 bg-white'
                            }`}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug">{title}</h3>
                                    </div>
                                    <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                        isWorkshop
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {isWorkshop ? <Wrench className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                                        {isWorkshop ? (isAr ? 'ورشة عمل' : 'Workshop') : (isAr ? 'محاضرة' : 'Session')}
                                    </span>
                                </div>

                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 mb-2">
                                    {sess.start_time && sess.end_time && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatTime(sess.start_time)} - {formatTime(sess.end_time)}
                                        </span>
                                    )}
                                    {speaker && (
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            {speaker}
                                        </span>
                                    )}
                                    {location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {location}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {desc && (
                                    <p className="text-sm text-gray-600 leading-relaxed mt-2">{desc}</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {sessions.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t.eventTabs.noContent}</p>
                </div>
            )}
        </div>
    )
}

export function EventTabs({ eventId, conferenceConfig, templateConferenceConfig, description_ar, description_en }: EventTabsProps) {
    const { t, locale } = useI18n()
    const isAr = locale === 'ar'
    const cc = conferenceConfig || {}
    const templateCc = templateConferenceConfig || {}
    const enabledSections = sectionsMeta.filter(s => {
        if (s.key === 'program') {
            const prog = (cc as any).program as ProgramConfig | undefined
            return prog?.enabled !== false && prog?.sessions && prog.sessions.length > 0
        }
        return (cc as any)[s.key]?.enabled !== false
    })

    const [activeTab, setActiveTab] = useState(enabledSections[0]?.key || 'home')

    const getLabel = (key: TabKey) => t.eventTabs[key]

    const getContent = (config: SectionConfig | undefined) => {
        if (!config) return null
        return isAr
            ? (config.content_ar || config.content_en)
            : (config.content_en || config.content_ar)
    }

    const getDescription = () => {
        return isAr
            ? (description_ar || description_en)
            : (description_en || description_ar)
    }

    if (enabledSections.length === 0) {
        return (
            <Container>
                <div className="py-12">
                    <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                        {getDescription() || t.events.noDescription}
                    </p>
                </div>
            </Container>
        )
    }

    const activeMeta = sectionsMeta.find(s => s.key === activeTab)
    const activeConfig = (cc as any)[activeTab] as SectionConfig | undefined
    const templateActiveConfig = (templateCc as any)[activeTab] as SectionConfig | undefined
    const contentText = getContent(activeConfig)
    const hasContent = !!contentText
    const resolvedFormFields =
        (activeConfig?.form_fields && activeConfig.form_fields.length > 0
            ? activeConfig.form_fields
            : templateActiveConfig?.form_fields) || []
    const hasForm = resolvedFormFields.length > 0
    const hasTopics = activeConfig?.topics && activeConfig.topics.length > 0

    return (
        <div>
            {/* ===== Full-Width Tabs Bar ===== */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <Container>
                    <div className="flex items-center justify-center overflow-x-auto scrollbar-hide -mb-px">
                        {enabledSections.map(section => {
                            const SIcon = section.icon
                            const isActive = activeTab === section.key
                            return (
                                <button
                                    key={section.key}
                                    onClick={() => setActiveTab(section.key)}
                                    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2
                                        ${isActive
                                            ? `${section.accentText} border-current`
                                            : 'text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <SIcon className="w-4 h-4" />
                                    {getLabel(section.key)}
                                </button>
                            )
                        })}
                    </div>
                </Container>
            </div>

            {/* ===== Tab Content ===== */}
            <div className="bg-white min-h-[400px]">
                <Container>
                    <div className="py-10">
                        {/* Home tab */}
                        {activeTab === 'home' && (
                            <div>
                                {/* Event Description */}
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                                        {t.events.aboutEvent}
                                    </h2>
                                    <div className="prose prose-lg max-w-none">
                                        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                            {hasContent
                                                ? contentText
                                                : (getDescription() || t.events.noDescription)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other tabs (not home, not program) */}
                        {activeTab !== 'home' && activeTab !== 'program' && activeMeta && (
                            <div className={hasTopics ? 'max-w-5xl mx-auto' : 'max-w-3xl mx-auto'}>
                                {/* Section Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeMeta.iconBg}`}>
                                        <activeMeta.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{getLabel(activeMeta.key)}</h2>
                                        <div className={`w-10 h-1 rounded-full mt-1.5 ${activeMeta.accent}`} />
                                    </div>
                                </div>

                                {/* Content */}
                                {hasContent && (
                                    <div className="prose prose-lg max-w-none mb-8">
                                        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                            {contentText}
                                        </p>
                                    </div>
                                )}

                                {/* Topic Cards Grid */}
                                {hasTopics && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {activeConfig!.topics!.map(topic => {
                                            const topicTitle = isAr ? (topic.title_ar || topic.title_en) : (topic.title_en || topic.title_ar)
                                            const topicDesc = isAr ? (topic.description_ar || topic.description_en) : (topic.description_en || topic.description_ar)
                                            return (
                                                <div key={topic.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300">
                                                    {topic.image_url && (
                                                        <div className="relative h-48 overflow-hidden">
                                                            <Image
                                                                src={topic.image_url}
                                                                alt={topicTitle || ''}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="p-5">
                                                        {topicTitle && (
                                                            <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{topicTitle}</h3>
                                                        )}
                                                        {topicDesc && (
                                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{topicDesc}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Dynamic Form */}
                                {hasForm && (
                                    <Card className="border-gray-200 shadow-md overflow-hidden max-w-3xl">
                                        <div className={`h-1 ${activeMeta.accent}`} />
                                        <CardContent className="p-5 md:p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                <ClipboardList className="w-5 h-5" />
                                                {t.eventTabs.submissionForm} - {getLabel(activeMeta.key)}
                                            </h3>
                                            <ConferenceForm
                                                eventId={eventId}
                                                sectionSlug={activeTab}
                                                fields={resolvedFormFields}
                                                submitLabel={`${t.eventTabs.submitRequest} ${getLabel(activeMeta.key)}`}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Empty state */}
                                {!hasContent && !hasForm && !hasTopics && (
                                    <div className="text-center py-16 text-gray-400">
                                        <activeMeta.icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>{t.eventTabs.noContent}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Program tab - Session Timeline */}
                        {activeTab === 'program' && (() => {
                            const programConfig = (cc as any).program as ProgramConfig | undefined
                            const sessions = programConfig?.sessions || []

                            // Group sessions by date
                            const dayMap = new Map<string, SessionItem[]>()
                            sessions.forEach(s => {
                                const key = s.date || 'no-date'
                                if (!dayMap.has(key)) dayMap.set(key, [])
                                dayMap.get(key)!.push(s)
                            })
                            // Sort each day's sessions by start_time
                            dayMap.forEach(arr => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)))
                            const days = Array.from(dayMap.keys()).sort()

                            return <ProgramTimeline sessions={sessions} days={days} dayMap={dayMap} isAr={isAr} t={t} />
                        })()}
                    </div>
                </Container>
            </div>
        </div>
    )
}
