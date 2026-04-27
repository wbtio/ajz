import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { getEventDetails } from '@/lib/actions/event-discovery.actions'
import { ReviewPanel } from './components/review-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ExternalLink, Calendar, Mail, MapPin, Building, Fingerprint } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params // Next 15 awaits params
    
    let event
    try {
        event = await getEventDetails(id)
    } catch (e) {
        return notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link 
                    href="/dashboard/event-discovery/results"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <h2 className="text-xl font-bold tracking-tight text-stone-900">Event Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Data & AI Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{event.title || 'Untitled Event'}</CardTitle>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="secondary">{event.status}</Badge>
                                        <Badge variant="outline">{event.ai_sector || 'Unknown Sector'}</Badge>
                                        {event.duplicate_of && (
                                            <Badge variant="destructive">Duplicate</Badge>
                                        )}
                                    </div>
                                </div>
                                {event.official_url && (
                                    <a 
                                        href={event.official_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                    >
                                        Visit Source <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Extracted Info Grid */}
                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-stone-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-stone-500" />
                                    <span className="text-sm font-medium text-stone-700">
                                        {event.organizer_name || 'Organizer unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-stone-500" />
                                    <span className="text-sm font-medium text-stone-700">
                                        {event.extracted_date || 'Date unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <Mail className="h-4 w-4 text-stone-500" />
                                    <span className="text-sm font-medium text-stone-700">
                                        {event.extracted_email || 'No email found'}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* AI Summary */}
                            <div>
                                <h3 className="mb-2 font-semibold text-stone-900">AI Summary</h3>
                                <p className="text-sm leading-relaxed text-stone-600">
                                    {event.ai_summary || 'No summary generated.'}
                                </p>
                            </div>

                            {/* Raw Description (Truncated/Scrollable) */}
                            <div>
                                <h3 className="mb-2 font-semibold text-stone-900">Raw HTML Extracted Text</h3>
                                <div className="max-h-60 overflow-y-auto rounded-md border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 whitespace-pre-wrap">
                                    {event.clean_text_for_ai || event.description || 'No raw text available.'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Duplicate Fingerprint Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Fingerprint className="h-4 w-4" />
                                Deduplication Fingerprint
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-xs text-stone-500">Hash: <span className="font-mono">{event.fingerprint || 'N/A'}</span></div>
                                <div className="text-xs text-stone-500 break-all">Source: <span className="font-mono">{event.fingerprint_source || 'N/A'}</span></div>
                                {event.duplicate_of && (
                                    <div className="mt-2 text-sm text-red-600 font-medium">
                                        This event was marked as a duplicate of Event ID: {event.duplicate_of}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Review & Meta */}
                <div className="space-y-6">
                    {/* Review Panel Component */}
                    <ReviewPanel eventId={event.id} currentStatus={event.review_status || 'pending'} />

                    {/* AI Score Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-stone-500">AI Relevance Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-stone-900">
                                {event.ai_relevance_score ?? '-'}
                                <span className="text-lg font-normal text-stone-400">/100</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Badge variant={event.has_clear_organizer ? 'default' : 'secondary'} className="text-[10px]">
                                    {event.has_clear_organizer ? 'Has Organizer' : 'No Organizer'}
                                </Badge>
                                <Badge variant={event.has_contact_info ? 'default' : 'secondary'} className="text-[10px]">
                                    {event.has_contact_info ? 'Has Contact' : 'No Contact'}
                                </Badge>
                            </div>
                            <div className="mt-4 text-xs font-medium text-stone-500">
                                AI Recommended Action: <span className="text-stone-900 uppercase">{event.recommended_action || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Review History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Review History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {event.review_actions && event.review_actions.length > 0 ? (
                                <div className="space-y-4">
                                    {event.review_actions.map((action: any) => (
                                        <div key={action.id} className="relative pl-4 border-l-2 border-stone-200">
                                            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-stone-300 ring-4 ring-white" />
                                            <p className="text-xs font-semibold text-stone-900">
                                                {action.users?.full_name || 'Unknown User'} 
                                                <span className="font-normal text-stone-500"> marked as </span>
                                                {action.action}
                                            </p>
                                            {action.notes && (
                                                <p className="mt-1 text-xs text-stone-600 italic">"{action.notes}"</p>
                                            )}
                                            <p className="mt-1 text-[10px] text-stone-400">
                                                {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500">No review actions yet.</p>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
