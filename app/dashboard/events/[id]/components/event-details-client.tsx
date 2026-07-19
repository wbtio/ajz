'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StepRegistration } from './step-registration'
import { StepDesign } from './step-design'
import { StepPublishing } from './step-publishing'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    CheckCircle,
    Palette,
    Share2,
    Lock,
    Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { englishDisplayText } from '@/lib/english-only'
import type { Event, Registration } from '@/lib/database.types'

interface EventDetailsClientProps {
    initialEvent: Event
    registrations: Registration[]
    userRole?: string
    userPermissions?: string[]
}

export function EventDetailsClient({
    initialEvent,
    userRole = 'admin',
    userPermissions = []
}: EventDetailsClientProps) {
    const [event, setEvent] = useState(initialEvent)

    // Initialize permissions based on real user permissions
    const isAdmin = userRole === 'admin'
    const hasStep1 = isAdmin || userPermissions.includes('/dashboard/events:registration') || userPermissions.includes('/dashboard/events')
    const hasStep2 = isAdmin || userPermissions.includes('/dashboard/events:design')
    const hasStep3 = isAdmin || userPermissions.includes('/dashboard/events:publishing')

    // Find the first step the user actually has access to
    const defaultStep = hasStep1 ? 1 : hasStep2 ? 2 : hasStep3 ? 3 : 1

    const [activeStep, setActiveStep] = useState(defaultStep)

    const selectedRole = isAdmin ? 'admin' :
        hasStep2 && !hasStep1 ? 'designer' :
        hasStep3 && !hasStep1 && !hasStep2 ? 'promoter' : 'custom'

    const permissions = {
        step1: hasStep1,
        step2: hasStep2,
        step3: hasStep3
    }

    const handleUpdateEvent = (updatedEvent: Event) => {
        setEvent(updatedEvent)
    }

    // Heuristics for step completions to render nice progress indicators
    const config = (event.conference_config || {}) as {
        workflow?: { step2?: { status?: string }; step3?: { status?: string } }
    }
    const workflow = config.workflow
    const step2Completed = workflow?.step2?.status === 'completed'
    const step3Completed = workflow?.step3?.status === 'completed'
    const step1Completed = event.status === 'published' || event.status === 'completed'

    const steps = [
        { id: 1, name: 'Event Details', desc: 'Prepare the core event information', icon: Calendar, completed: step1Completed },
        { id: 2, name: 'Design Team', desc: 'Prepare and review media assets', icon: Palette, completed: step2Completed },
        { id: 3, name: 'Publishing', desc: 'Plan and track event promotion', icon: Share2, completed: step3Completed },
    ]

    const activeStepPermission = permissions[`step${activeStep}` as 'step1' | 'step2' | 'step3']

    return (
        <div className="space-y-6 max-w-7xl mx-auto text-left" dir="ltr" lang="en">
            {/* Top Bar with Navigation & Title */}
            <div className="bg-white border border-slate-200/70 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/dashboard/events" className="shrink-0">
                        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 h-9 w-9 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 truncate">{englishDisplayText(event.title)}</h1>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className={`inline-flex px-2 py-0.5 font-semibold rounded-full ${
                                event.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                                event.status === 'completed' ? 'bg-indigo-50 text-indigo-700' :
                                event.status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                                'bg-amber-50 text-amber-700'
                            }`}>
                                {event.status === 'published' ? 'Published' :
                                 event.status === 'completed' ? 'Completed' :
                                 event.status === 'cancelled' ? 'Cancelled' : 'Draft'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 whitespace-nowrap"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(event.date).toLocaleDateString('en-GB')}</span>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{englishDisplayText(event.location)}</span></span>
                        </div>
                    </div>
                </div>
                <Link href={`/events/${event.id}`} target="_blank" className="shrink-0">
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 h-9 rounded-xl hover:bg-slate-50 text-xs gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview Website</span>
                    </Button>
                </Link>
            </div>



            {/* Operational Stepper Navigation */}
            <nav
                className="bg-white border border-slate-200/70 rounded-xl px-2 py-2 sm:px-4"
                aria-label="Event workflow"
            >
                <div className="relative pt-0.5 pb-0.5">
                    <ol className="flex items-start justify-between gap-0.5 overflow-x-auto scrollbar-none">
                        {steps.map((s) => {
                            const Icon = s.icon
                            const isCurrent = activeStep === s.id
                            const hasAccess = permissions[`step${s.id}` as 'step1' | 'step2' | 'step3']

                            return (
                                <li key={s.id} className="flex-1 min-w-[72px] sm:min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(s.id)}
                                        aria-current={isCurrent ? 'step' : undefined}
                                        aria-label={`Step ${s.id}: ${s.name}${s.completed ? ', completed' : ''}${!hasAccess ? ', locked' : ''}`}
                                        className={cn(
                                            'group w-full flex flex-col items-center px-0.5 py-0.5 rounded-lg transition-colors duration-200',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-1',
                                            isCurrent ? 'bg-indigo-50/70' : 'hover:bg-slate-50/80'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'relative z-10 flex shrink-0 items-center justify-center w-8 h-8 rounded-full border-2 bg-white transition-all duration-200 motion-reduce:transition-none',
                                                isCurrent && 'border-indigo-600 bg-indigo-600 text-white',
                                                s.completed && !isCurrent && 'border-emerald-500 bg-emerald-500 text-white',
                                                !isCurrent && !s.completed && hasAccess && 'border-slate-200 text-slate-500 group-hover:border-indigo-200 group-hover:text-indigo-600',
                                                !hasAccess && 'border-slate-100 bg-slate-50 text-slate-300'
                                            )}
                                        >
                                            {!hasAccess ? (
                                                <Lock className="w-3 h-3" aria-hidden="true" />
                                            ) : s.completed && !isCurrent ? (
                                                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                            ) : (
                                                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                            )}
                                            <span
                                                className={cn(
                                                    'absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center leading-none',
                                                    isCurrent
                                                        ? 'bg-white text-indigo-600'
                                                        : s.completed
                                                          ? 'bg-emerald-50 text-emerald-700'
                                                          : 'bg-slate-100 text-slate-500'
                                                )}
                                            >
                                                {s.id}
                                            </span>
                                        </div>

                                        <span
                                            className={cn(
                                                'w-full text-center text-[10px] sm:text-[11px] leading-tight font-semibold line-clamp-2 px-0.5 mt-0.5',
                                                isCurrent && 'text-indigo-700',
                                                s.completed && !isCurrent && 'text-emerald-700',
                                                !isCurrent && !s.completed && hasAccess && 'text-slate-600',
                                                !hasAccess && 'text-slate-400'
                                            )}
                                        >
                                            {s.name}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ol>
                </div>
            </nav>

            {/* Steps Content Area with Lock Simulator */}
            <div>
                {activeStepPermission ? (
                    <div>
                        {activeStep === 1 && (
                            <StepRegistration
                                event={event}
                                onUpdate={handleUpdateEvent}
                                isReadOnly={selectedRole !== 'admin' && selectedRole !== 'custom'}
                            />
                        )}
                        {activeStep === 2 && (
                            <StepDesign
                                event={event}
                                onUpdate={handleUpdateEvent}
                                isReadOnly={selectedRole !== 'admin' && selectedRole !== 'designer' && selectedRole !== 'custom'}
                            />
                        )}
                        {activeStep === 3 && (
                            <StepPublishing
                                event={event}
                                onUpdate={handleUpdateEvent}
                                isReadOnly={selectedRole !== 'admin' && selectedRole !== 'promoter' && selectedRole !== 'custom'}
                            />
                        )}
                    </div>
                ) : (
                    <Card className="border-rose-100 bg-rose-50/20 shadow-md py-16 text-center max-w-2xl mx-auto rounded-2xl">
                        <CardContent className="space-y-4">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                                <Lock className="w-8 h-8 text-rose-600 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
                            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                                You do not have permission to view or edit step {activeStep} ({steps.find(s => s.id === activeStep)?.name}).
                            </p>

                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
