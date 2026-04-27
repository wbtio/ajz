import { getSearchSessions } from '@/lib/actions/event-discovery.actions'
import { SessionsList } from './components/sessions-list'

// Allow dynamic rendering so status updates (processing -> completed) are fresh
export const dynamic = 'force-dynamic'

export default async function SessionsPage() {
    const { data: sessions } = await getSearchSessions(1, 20)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium leading-6 text-stone-900">Recent Sessions</h2>
                <p className="mt-1 text-sm text-stone-500">
                    Monitor the status of your automated event discovery searches.
                </p>
            </div>
            
            <SessionsList sessions={(sessions as any) || []} />
        </div>
    )
}
