import { getEventsByFilters, EventFilters } from '@/lib/actions/event-discovery.actions'
import { ResultsFilters } from './components/results-filters'
import { ResultsTable } from './components/results-table'

export const dynamic = 'force-dynamic'

export default async function ResultsPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Parse searchParams safely
    const sp = await searchParams // Next 15 awaits searchParams conceptually or we just use it

    const filters: EventFilters = {
        status: (sp.status as any) || undefined,
        reviewStatus: (sp.reviewStatus as any) || undefined,
        search: (sp.search as string) || undefined,
        minRelevanceScore: sp.minScore ? parseInt(sp.minScore as string, 10) : undefined,
        hasOrganizer: sp.hasOrganizer === 'true' ? true : undefined,
        duplicate: sp.duplicate === 'false' ? false : undefined // hide duplicates
    }

    const { data: events, count } = await getEventsByFilters(filters, 1, 50)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium leading-6 text-stone-900">Event Results</h2>
                <p className="mt-1 text-sm text-stone-500">
                    Review and act on the events discovered by the AI pipeline.
                </p>
            </div>
            
            <ResultsFilters />
            
            <div className="text-sm text-stone-500 mb-2">
                Showing top 50 results matching your criteria.
            </div>
            <ResultsTable events={events || []} />
        </div>
    )
}
