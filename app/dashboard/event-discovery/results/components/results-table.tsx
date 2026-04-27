'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ExternalLink, Eye } from 'lucide-react'

export function ResultsTable({ events }: { events: any[] }) {
    function getReviewBadge(status: string) {
        switch (status) {
            case 'approved_for_outreach':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
            case 'mark_for_manual_review':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Needs Review</Badge>
            case 'ready_to_publish':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ready</Badge>
            default:
                return <Badge variant="outline">Pending</Badge>
        }
    }

    if (events.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-stone-200">
                <p className="text-sm text-stone-500">No events match your criteria.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event Title</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => (
                        <TableRow key={event.id}>
                            <TableCell className="font-medium max-w-xs truncate" title={event.title || 'Untitled'}>
                                {event.title || 'Untitled'}
                            </TableCell>
                            <TableCell>
                                <span className={
                                    (event.ai_relevance_score ?? 0) >= 80 ? 'text-green-600 font-bold' : 
                                    (event.ai_relevance_score ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-500'
                                }>
                                    {event.ai_relevance_score ?? 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {event.duplicate_of ? (
                                    <Badge variant="destructive">Duplicate</Badge>
                                ) : (
                                    <Badge variant="secondary">{event.status}</Badge>
                                )}
                            </TableCell>
                            <TableCell>{getReviewBadge(event.review_status)}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={event.organizer_name || ''}>
                                {event.organizer_name || '-'}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                {event.official_url && (
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                        <a href={event.official_url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/event-discovery/results/${event.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Review
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
