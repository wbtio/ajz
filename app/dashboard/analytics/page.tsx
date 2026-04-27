import { getAnalyticsSummary, AnalyticsRange } from '@/lib/actions/analytics.actions'
import { AnimatedStatCard } from '@/components/dashboard/animated-stat-card'
import { AnalyticsMainChart } from '@/components/dashboard/analytics-charts'
import { Users, Eye, MousePointerClick, Search, CheckCircle, TrendingUp, Calendar as CalendarIcon, MousePointer2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export const metadata = {
    title: 'Analytics | JAZ Dashboard',
}

interface AnalyticsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    const params = await searchParams
    const range = (params.range as AnalyticsRange) || '7d'

    const summary = await getAnalyticsSummary(range)

    if (!summary) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-stone-200">
                <p className="text-stone-500">Error loading analytics data. Please try again later.</p>
            </div>
        )
    }

    const { kpis, chartData, topPages, actionFrequencies, detailedEventPerformance, conversions } = summary

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-stone-900 to-stone-600 bg-clip-text text-transparent">
                        Analytics Overview
                    </h1>
                    <p className="text-stone-500 mt-2 text-sm max-w-lg leading-relaxed">
                        Track your event engagement, visitor behavior, and conversion signals to optimize your platform.
                    </p>
                </div>
                
                <div className="flex bg-stone-100/80 backdrop-blur-md rounded-xl p-1.5 border border-stone-200/50 shadow-inner">
                    <Link 
                        href="?range=today" 
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${range === 'today' ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/50' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                    >
                        Today
                    </Link>
                    <Link 
                        href="?range=7d" 
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${range === '7d' ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/50' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                    >
                        7 Days
                    </Link>
                    <Link 
                        href="?range=30d" 
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${range === '30d' ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/50' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                    >
                        30 Days
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                <AnimatedStatCard
                    name="Unique Visitors"
                    value={kpis.visitors}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    color="border-blue-200"
                    textColor="text-blue-700"
                    bgLight="bg-blue-100/50"
                    index={0}
                />
                <AnimatedStatCard
                    name="Page Views"
                    value={kpis.pageViews}
                    icon={<Eye className="w-5 h-5 text-emerald-600" />}
                    color="border-emerald-200"
                    textColor="text-emerald-700"
                    bgLight="bg-emerald-100/50"
                    index={1}
                />
                <AnimatedStatCard
                    name="Registrations"
                    value={kpis.registrationClicks}
                    icon={<MousePointerClick className="w-5 h-5 text-indigo-600" />}
                    color="border-indigo-200"
                    textColor="text-indigo-700"
                    bgLight="bg-indigo-100/50"
                    index={2}
                />
                <AnimatedStatCard
                    name="Searches"
                    value={kpis.searches}
                    icon={<Search className="w-5 h-5 text-amber-600" />}
                    color="border-amber-200"
                    textColor="text-amber-700"
                    bgLight="bg-amber-100/50"
                    index={3}
                />
                <AnimatedStatCard
                    name="Conversions"
                    value={kpis.conversions}
                    icon={<CheckCircle className="w-5 h-5 text-rose-600" />}
                    color="border-rose-200"
                    textColor="text-rose-700"
                    bgLight="bg-rose-100/50"
                    index={4}
                />
            </div>

            {/* Main Chart */}
            <div className="rounded-3xl border border-stone-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <AnalyticsMainChart data={chartData} />
            </div>

            {/* Detailed Event Performance (NEW) */}
            <Card className="rounded-3xl border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white/50 backdrop-blur-xl">
                <CardHeader className="bg-white/40 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Detailed Event Performance</CardTitle>
                            <CardDescription>Track views, clicks, and conversion rates for specific events.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-stone-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6 text-stone-500 font-semibold h-12">Event Title</TableHead>
                                    <TableHead className="text-right text-stone-500 font-semibold h-12">Views</TableHead>
                                    <TableHead className="text-right text-stone-500 font-semibold h-12">Clicks</TableHead>
                                    <TableHead className="text-right pr-6 text-stone-500 font-semibold h-12">Conv. Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detailedEventPerformance.length > 0 ? (
                                    detailedEventPerformance.map((ev, idx) => (
                                        <TableRow key={idx} className="transition-colors hover:bg-stone-50/80 group">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <CalendarIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-stone-700">{ev.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-stone-600">{ev.views.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium text-stone-600">{ev.clicks.toLocaleString()}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold px-2.5 py-0.5 rounded-lg">
                                                    {ev.conversionRate}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-stone-500 bg-stone-50/30">
                                            No event data recorded in this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Pages */}
                <Card className="rounded-3xl border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <CardHeader className="bg-stone-50/50 pb-4 border-b border-stone-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-stone-800">
                            <FileText className="w-4 h-4 text-blue-500" /> Top Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-auto max-h-[350px] scrollbar-thin scrollbar-thumb-stone-200">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 h-10 text-xs uppercase tracking-wider text-stone-500">Page / Path</TableHead>
                                        <TableHead className="text-right pr-6 h-10 text-xs uppercase tracking-wider text-stone-500">Views</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topPages.length > 0 ? (
                                        topPages.map((page, idx) => (
                                            <TableRow key={idx} className="hover:bg-blue-50/30 transition-colors">
                                                <TableCell className="pl-6 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-stone-800">{page.label}</span>
                                                        {page.label !== page.path && (
                                                            <span className="text-xs text-stone-400 font-mono mt-0.5">{page.path}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 font-semibold text-stone-700">{page.views.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-stone-400 h-24">No page views</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* System Events */}
                <Card className="rounded-3xl border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <CardHeader className="bg-stone-50/50 pb-4 border-b border-stone-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-stone-800">
                            <MousePointer2 className="w-4 h-4 text-purple-500" /> Action Frequency
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-auto max-h-[350px] scrollbar-thin scrollbar-thumb-stone-200">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 h-10 text-xs uppercase tracking-wider text-stone-500">Action Type</TableHead>
                                        <TableHead className="text-right pr-6 h-10 text-xs uppercase tracking-wider text-stone-500">Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {actionFrequencies.length > 0 ? (
                                        actionFrequencies.map((ev, idx) => (
                                            <TableRow key={idx} className="hover:bg-purple-50/30 transition-colors">
                                                <TableCell className="pl-6 py-3">
                                                    <Badge variant="outline" className="capitalize bg-white text-stone-600 border-stone-200 shadow-sm px-3 py-1 rounded-lg">
                                                        {ev.event.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 font-semibold text-stone-700">{ev.count.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-stone-400 h-24">No actions</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Conversions Activity Feed */}
            <Card className="rounded-3xl border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
                <CardHeader className="border-b border-stone-100 pb-4 bg-gradient-to-r from-stone-50 to-white">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </div>
                        Live Conversion Activity
                    </CardTitle>
                    <CardDescription>The most recent successful forms or registrations.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {conversions.length > 0 ? (
                            conversions.map((conv: any, idx: number) => (
                                <div key={idx} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-rose-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl shadow-inner transition-transform group-hover:scale-110 ${conv.event_type === 'form_submit' ? 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 ring-1 ring-indigo-200'}`}>
                                            {conv.event_type === 'form_submit' ? <CheckCircle className="w-5 h-5" /> : <MousePointerClick className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-800 capitalize flex items-center gap-2">
                                                {conv.event_type.replace(/_/g, ' ')}
                                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-500">New</Badge>
                                            </p>
                                            <p className="text-sm text-stone-500 mt-1 font-medium">{conv.label}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 sm:mt-0 px-3 py-1.5 bg-stone-50 rounded-lg text-sm text-stone-500 font-medium border border-stone-100">
                                        {new Date(conv.created_at!).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-stone-100 bg-stone-50/50">
                                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                                    <CheckCircle className="w-6 h-6 text-stone-300" />
                                </div>
                                <p className="text-stone-500 font-medium">Waiting for conversion signals...</p>
                                <p className="text-sm text-stone-400 mt-1">Actions will appear here in real-time</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
