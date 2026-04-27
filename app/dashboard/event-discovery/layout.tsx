import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Search, Settings, CalendarRange } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Event Discovery & Analysis | JAZ Admin',
    description: 'Discover and analyze external events for partnerships',
}

const navigation = [
    { name: 'Sessions', href: '/dashboard/event-discovery/sessions', icon: CalendarRange },
    { name: 'Search', href: '/dashboard/event-discovery/search', icon: Search },
    { name: 'Results', href: '/dashboard/event-discovery/results', icon: FileText },
    { name: 'Settings', href: '/dashboard/event-discovery/settings', icon: Settings },
]

export default function EventDiscoveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Event Discovery</h1>
                        <p className="text-sm text-stone-500">
                            Discover external events, run AI analysis, and review for outreach
                        </p>
                    </div>
                </div>
                
                <nav className="flex gap-4 overflow-x-auto">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="min-h-[500px]">
                {children}
            </div>
        </div>
    )
}
