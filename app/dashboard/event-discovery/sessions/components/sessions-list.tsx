'use client'

import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SearchSessionStatus } from '@/lib/actions/event-discovery.actions'

interface Session {
    id: number
    keywords: string | null
    sector: string | null
    status: SearchSessionStatus
    total_events_found: number | null
    created_at: string
    users?: { full_name: string | null } | null
}

export function SessionsList({ sessions }: { sessions: Session[] }) {
    function getStatusBadge(status: SearchSessionStatus) {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
            case 'processing':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 animate-pulse">Processing</Badge>
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (sessions.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-stone-200">
                <p className="text-sm text-stone-500">No search sessions found.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Keywords</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Events Found</TableHead>
                        <TableHead>Started By</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session) => (
                        <TableRow key={session.id}>
                            <TableCell className="font-medium">#{session.id}</TableCell>
                            <TableCell>{session.keywords}</TableCell>
                            <TableCell>{session.sector || '-'}</TableCell>
                            <TableCell>{getStatusBadge(session.status)}</TableCell>
                            <TableCell className="text-right font-medium">
                                {session.total_events_found ?? '-'}
                            </TableCell>
                            <TableCell>{session.users?.full_name || 'System'}</TableCell>
                            <TableCell className="text-right text-stone-500">
                                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
