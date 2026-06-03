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
        <div data-impeccable-variants="8add3f64" data-impeccable-variant-count="3" style={{ display: "contents" }}>
          {/* impeccable-variants-start 8add3f64 */}
          {/* Original */}
          <div data-impeccable-variant="original">
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
          </div>
          {/* Variants: insert below this line */}
          <style data-impeccable-css="8add3f64">{`
            @scope ([data-impeccable-variant="1"]) {
              :scope {
                --glow-color: rgba(139, 0, 0, var(--p-glow-intensity, 0.4));
                --gap: var(--p-card-gap, 24px);
              }
              :scope > .v1-wrapper {
                display: flex;
                flex-direction: column;
                gap: var(--gap);
                animation: v1-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                max-width: 80rem;
                margin-left: auto;
                margin-right: auto;
                padding-bottom: 2.5rem;
              }
              @keyframes v1-fade-in {
                0% { opacity: 0; transform: translateY(15px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              :scope .v1-header-card {
                background: linear-gradient(135deg, #ffffff 0%, #fcfdfe 100%);
                border: 1px solid rgba(15, 23, 42, 0.08);
                box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                position: relative;
                overflow: hidden;
              }
              @media (min-width: 768px) {
                :scope .v1-header-card {
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;
                }
              }
              :scope .v1-header-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: #8B0000;
              }
              :scope .v1-kpis-grid {
                display: grid;
                grid-template-cols: repeat(1, minmax(0, 1fr));
                gap: 1rem;
              }
              @media (min-width: 640px) {
                :scope .v1-kpis-grid {
                  grid-template-cols: repeat(2, minmax(0, 1fr));
                }
              }
              @media (min-width: 1024px) {
                :scope .v1-kpis-grid {
                  grid-template-cols: repeat(5, minmax(0, 1fr));
                }
              }
              :scope .v1-kpi-card {
                background: #ffffff;
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 10px;
                padding: 1.25rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s;
                position: relative;
              }
              :scope .v1-kpi-card:hover {
                transform: translateY(-2px);
                border-color: #8B0000;
                box-shadow: 0 8px 30px var(--glow-color);
              }
              :scope .v1-chart-container {
                background: #ffffff;
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
                overflow: hidden;
              }
              :scope .v1-card-full {
                background: #ffffff;
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
                overflow: hidden;
              }
              :scope .v1-card-header {
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid rgba(15, 23, 42, 0.05);
                background: #f8fafc;
                display: flex;
                align-items: center;
                gap: 0.75rem;
              }
              :scope .v1-grid-two {
                display: grid;
                grid-template-cols: repeat(1, minmax(0, 1fr));
                gap: 1.5rem;
              }
              @media (min-width: 1024px) {
                :scope .v1-grid-two {
                  grid-template-cols: repeat(2, minmax(0, 1fr));
                }
              }
            }

            @scope ([data-impeccable-variant="2"]) {
              :scope {
                --sidebar-w: calc(var(--p-sidebar-width, 280) * 1px);
                --accent-opacity: var(--p-red-accents, 1);
              }
              :scope > .v2-wrapper {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                animation: v2-slide-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
                max-width: 80rem;
                margin-left: auto;
                margin-right: auto;
                padding-bottom: 2.5rem;
              }
              @keyframes v2-slide-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              :scope .v2-header {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                padding: 1.5rem;
                background: #0b1426;
                color: #ffffff;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.05);
              }
              @media (min-width: 768px) {
                :scope .v2-header {
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;
                }
              }
              :scope .v2-title {
                font-weight: 900;
                color: #ffffff;
              }
              :scope .v2-split-layout {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
              }
              @media (min-width: 1024px) {
                :scope .v2-split-layout {
                  flex-direction: row;
                  align-items: flex-start;
                }
                :scope .v2-sidebar-stats {
                  width: var(--sidebar-w);
                  flex-shrink: 0;
                  position: sticky;
                  top: 2rem;
                  display: flex;
                  flex-direction: column;
                  gap: 0.75rem;
                }
                :scope .v2-main-content {
                  flex-grow: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 1.5rem;
                  min-width: 0;
                }
              }
              :scope .v2-kpi-bar {
                background: #ffffff;
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 10px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: border-color 0.2s, box-shadow 0.2s;
              }
              :scope .v2-kpi-bar:hover {
                border-color: rgba(139, 0, 0, var(--accent-opacity));
                box-shadow: 0 4px 12px rgba(139, 0, 0, 0.04);
              }
              :scope .v2-grid-tables {
                display: grid;
                grid-template-cols: repeat(1, minmax(0, 1fr));
                gap: 1.5rem;
              }
              @media (min-width: 768px) {
                :scope .v2-grid-tables {
                  grid-template-cols: repeat(2, minmax(0, 1fr));
                }
              }
            }

            @scope ([data-impeccable-variant="3"]) {
              :scope {
                --blur: var(--p-blur-radius, 8px);
              }
              :scope > .v3-wrapper {
                display: flex;
                flex-direction: column;
                gap: 2rem;
                animation: v3-zoom-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                max-width: 80rem;
                margin-left: auto;
                margin-right: auto;
                padding-bottom: 2.5rem;
              }
              @keyframes v3-zoom-in {
                0% { opacity: 0; transform: scale(0.97); }
                100% { opacity: 1; transform: scale(1); }
              }
              :scope .v3-fluid-card {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(var(--blur));
                border: 1px solid rgba(15, 23, 42, 0.06);
                border-radius: 16px;
                padding: 1.75rem;
                box-shadow: 0 10px 40px rgba(15, 23, 42, 0.03);
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              }
              :scope .v3-fluid-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
              }
              :scope .v3-kpis-fluid {
                display: grid;
                grid-template-cols: repeat(2, minmax(0, 1fr));
                gap: 1rem;
              }
              @media (min-width: 1024px) {
                :scope .v3-kpis-fluid {
                  grid-template-cols: repeat(5, minmax(0, 1fr));
                }
              }
              :scope .v3-kpi-subcard {
                background: #ffffff;
                border: 1px solid rgba(15, 23, 42, 0.05);
                border-radius: 12px;
                padding: 1.25rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 0.5rem;
                position: relative;
                transition: transform 0.2s;
              }
              :scope .v3-kpi-subcard:hover {
                transform: scale(1.03);
              }
              :scope .v3-icon-badge {
                width: 2.75rem;
                height: 2.75rem;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8fafc;
                border: 1px solid rgba(15, 23, 42, 0.04);
              }
            }
          `}</style>

          <div data-impeccable-variant="1" data-impeccable-params='[
            {"id":"glow-intensity","kind":"range","min":0,"max":1,"step":0.05,"default":0.4,"label":"Glow intensity"},
            {"id":"card-gap","kind":"steps","default":"24px","label":"Card spacing","options":[
              {"value":"16px","label":"Snug"},
              {"value":"24px","label":"Comfortable"},
              {"value":"36px","label":"Spacious"}
            ]}
          ]' style={{ display: "none" }}>
            <div className="v1-wrapper">
              {/* Header */}
              <div className="v1-header-card">
                <div>
                  <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                    Executive Analytics
                  </h1>
                  <p className="text-slate-500 mt-1.5 text-sm max-w-lg leading-relaxed">
                    Track JAZ visitor engagement metrics, conversions, and dynamic event performance logs in real-time.
                  </p>
                </div>
                <div className="flex bg-slate-100/90 rounded-lg p-1 border border-slate-200/50">
                  <Link href="?range=today" className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${range === 'today' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>Today</Link>
                  <Link href="?range=7d" className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${range === '7d' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>7 Days</Link>
                  <Link href="?range=30d" className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${range === '30d' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>30 Days</Link>
                </div>
              </div>

              {/* KPIs */}
              <div className="v1-kpis-grid">
                <div className="v1-kpi-card">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Visitors</span>
                    <Users className="w-5 h-5 text-[#8B0000]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{kpis.visitors.toLocaleString()}</h2>
                  <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded self-start mt-1">Active Now</div>
                </div>

                <div className="v1-kpi-card">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Page Views</span>
                    <Eye className="w-5 h-5 text-[#8B0000]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{kpis.pageViews.toLocaleString()}</h2>
                  <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded self-start mt-1">High Velocity</div>
                </div>

                <div className="v1-kpi-card">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registrations</span>
                    <MousePointerClick className="w-5 h-5 text-[#8B0000]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{kpis.registrationClicks.toLocaleString()}</h2>
                  <div className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded self-start mt-1">Target Met</div>
                </div>

                <div className="v1-kpi-card">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Searches</span>
                    <Search className="w-5 h-5 text-[#8B0000]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{kpis.searches.toLocaleString()}</h2>
                  <div className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded self-start mt-1">Steady</div>
                </div>

                <div className="v1-kpi-card">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversions</span>
                    <CheckCircle className="w-5 h-5 text-[#8B0000]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{kpis.conversions.toLocaleString()}</h2>
                  <div className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded self-start mt-1">Elite Flow</div>
                </div>
              </div>

              {/* Main Chart */}
              <div className="v1-chart-container">
                <AnalyticsMainChart data={chartData} />
              </div>

              {/* Detailed Performance */}
              <div className="v1-card-full">
                <div className="v1-card-header">
                  <TrendingUp className="w-5 h-5 text-[#8B0000]" />
                  <div>
                    <h3 className="font-bold text-slate-900">Event Performance Analysis</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time metrics on conversion velocity and reach.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="pl-6 h-10 text-xs font-bold text-slate-500 uppercase">Event / Division</TableHead>
                        <TableHead className="text-right h-10 text-xs font-bold text-slate-500 uppercase">Views</TableHead>
                        <TableHead className="text-right h-10 text-xs font-bold text-slate-500 uppercase">Clicks</TableHead>
                        <TableHead className="text-right pr-6 h-10 text-xs font-bold text-slate-500 uppercase">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedEventPerformance.map((ev, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/50">
                          <TableCell className="pl-6 py-4 font-semibold text-slate-800">{ev.title}</TableCell>
                          <TableCell className="text-right text-slate-600 font-medium">{ev.views.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-slate-600 font-medium">{ev.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right pr-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B0000]/10 text-[#8B0000]">
                              {ev.conversionRate}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action and Conversion list */}
              <div className="v1-grid-two">
                {/* Top Content */}
                <div className="v1-card-full">
                  <div className="v1-card-header">
                    <FileText className="w-4 h-4 text-[#8B0000]" />
                    <h4 className="font-bold text-slate-900">Top Content Paths</h4>
                  </div>
                  <Table>
                    <TableBody>
                      {topPages.map((page, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/30">
                          <TableCell className="pl-6 py-3 font-semibold text-slate-800">{page.label}</TableCell>
                          <TableCell className="text-right pr-6 font-bold text-slate-900">{page.views.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Conversion Signals */}
                <div className="v1-card-full">
                  <div className="v1-card-header">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900">Live Activity Feed</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {conversions.slice(0, 3).map((conv: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-800 capitalize">{conv.event_type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{conv.label}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div data-impeccable-variant="2" style={{ display: "none" }} data-impeccable-params='[
            {"id":"sidebar-width","kind":"range","min":220,"max":340,"step":10,"default":280,"label":"Sidebar width"},
            {"id":"red-accents","kind":"toggle","default":true,"label":"Sovereign borders"}
          ]'>
            <div className="v2-wrapper">
              {/* Header */}
              <div className="v2-header">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white v2-title">
                    SOVEREIGN ZONE MERIDIAN
                  </h1>
                  <p className="text-slate-400 mt-1 text-xs max-w-md">
                    High-Performance Platform Analytics & Conversion Telemetry.
                  </p>
                </div>
                <div className="flex bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
                  <Link href="?range=today" className={`px-4 py-1 text-xs font-bold rounded transition-all ${range === 'today' ? 'bg-[#8B0000] text-white' : 'text-slate-400 hover:text-white'}`}>Today</Link>
                  <Link href="?range=7d" className={`px-4 py-1 text-xs font-bold rounded transition-all ${range === '7d' ? 'bg-[#8B0000] text-white' : 'text-slate-400 hover:text-white'}`}>7d</Link>
                  <Link href="?range=30d" className={`px-4 py-1 text-xs font-bold rounded transition-all ${range === '30d' ? 'bg-[#8B0000] text-white' : 'text-slate-400 hover:text-white'}`}>30d</Link>
                </div>
              </div>

              {/* Split Content */}
              <div className="v2-split-layout">
                {/* Stats Sidebar */}
                <div className="v2-sidebar-stats">
                  <div className="v2-kpi-bar">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Visitors</p>
                      <h4 className="text-lg font-black text-slate-900">{kpis.visitors.toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="v2-kpi-bar">
                    <Eye className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Page Views</p>
                      <h4 className="text-lg font-black text-slate-900">{kpis.pageViews.toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="v2-kpi-bar">
                    <MousePointerClick className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrations</p>
                      <h4 className="text-lg font-black text-slate-900">{kpis.registrationClicks.toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="v2-kpi-bar">
                    <Search className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Searches</p>
                      <h4 className="text-lg font-black text-slate-900">{kpis.searches.toLocaleString()}</h4>
                    </div>
                  </div>
                  <div className="v2-kpi-bar">
                    <CheckCircle className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversions</p>
                      <h4 className="text-lg font-black text-slate-900">{kpis.conversions.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="v2-main-content">
                  {/* Chart */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
                    <AnalyticsMainChart data={chartData} />
                  </div>

                  {/* detailed table */}
                  <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 text-sm">Strategic Event Conversion Hierarchy</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active Meridian</span>
                    </div>
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="pl-6 h-10 text-xs font-bold text-slate-500 uppercase">Division / Branch</TableHead>
                          <TableHead className="text-right h-10 text-xs font-bold text-slate-500 uppercase">Reach</TableHead>
                          <TableHead className="text-right h-10 text-xs font-bold text-slate-500 uppercase">Clicks</TableHead>
                          <TableHead className="text-right pr-6 h-10 text-xs font-bold text-slate-500 uppercase">Conversion Index</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedEventPerformance.map((ev, idx) => (
                          <TableRow key={idx} className="hover:bg-slate-50/30">
                            <TableCell className="pl-6 py-3 font-semibold text-slate-800">{ev.title}</TableCell>
                            <TableCell className="text-right text-slate-600 font-medium">{ev.views.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-slate-600 font-medium">{ev.clicks.toLocaleString()}</TableCell>
                            <TableCell className="text-right pr-6 font-bold text-slate-800">{ev.conversionRate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div data-impeccable-variant="3" style={{ display: "none" }} data-impeccable-params='[
            {"id":"blur-radius","kind":"range","min":4,"max":16,"step":1,"default":8,"label":"Backdrop blur"}
          ]'>
            <div className="v3-wrapper">
              {/* Elegant Light Header */}
              <div className="v3-fluid-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
                    Meridian Overview
                  </h1>
                  <p className="text-slate-500 text-xs mt-1">Bilingual high-velocity institutional dashboard telemetry.</p>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/50">
                  <Link href="?range=today" className={`px-4 py-1 text-xs font-semibold rounded ${range === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Today</Link>
                  <Link href="?range=7d" className={`px-4 py-1 text-xs font-semibold rounded ${range === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>7 Days</Link>
                  <Link href="?range=30d" className={`px-4 py-1 text-xs font-semibold rounded ${range === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>30 Days</Link>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="v3-kpis-fluid">
                <div className="v3-kpi-subcard">
                  <div className="v3-icon-badge">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Visitors</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{kpis.visitors.toLocaleString()}</h3>
                </div>
                <div className="v3-kpi-subcard">
                  <div className="v3-icon-badge">
                    <Eye className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Page Views</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{kpis.pageViews.toLocaleString()}</h3>
                </div>
                <div className="v3-kpi-subcard">
                  <div className="v3-icon-badge">
                    <MousePointerClick className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Registrations</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{kpis.registrationClicks.toLocaleString()}</h3>
                </div>
                <div className="v3-kpi-subcard">
                  <div className="v3-icon-badge">
                    <Search className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Searches</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{kpis.searches.toLocaleString()}</h3>
                </div>
                <div className="v3-kpi-subcard">
                  <div className="v3-icon-badge">
                    <CheckCircle className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Conversions</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{kpis.conversions.toLocaleString()}</h3>
                </div>
              </div>

              {/* Main Chart */}
              <div className="v3-fluid-card p-4">
                <AnalyticsMainChart data={chartData} />
              </div>

              {/* Event Table */}
              <div className="v3-fluid-card p-0 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">Strategic Divisions Reach</h4>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 text-xs font-bold text-slate-500 uppercase">Division</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-500 uppercase">Views</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-500 uppercase">Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedEventPerformance.map((ev, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/20">
                        <TableCell className="pl-6 py-3 font-semibold text-slate-800">{ev.title}</TableCell>
                        <TableCell className="text-right text-slate-600 font-medium">{ev.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-6 text-emerald-600 font-bold">{ev.conversionRate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          {/* impeccable-variants-end 8add3f64 */}
        </div>
    )
}
