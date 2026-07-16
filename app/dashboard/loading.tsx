export default function DashboardLoading() {
    return (
        <div className="min-h-[60vh] animate-pulse space-y-5" aria-label="Loading dashboard" role="status">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="space-y-2"><div className="h-5 w-48 rounded bg-slate-200" /><div className="h-3 w-72 rounded bg-slate-100" /></div>
                <div className="h-9 w-28 rounded-md bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="h-20 rounded-lg bg-white ring-1 ring-slate-200" /><div className="h-20 rounded-lg bg-white ring-1 ring-slate-200" /><div className="h-20 rounded-lg bg-white ring-1 ring-slate-200" /><div className="h-20 rounded-lg bg-white ring-1 ring-slate-200" /></div>
            <div className="h-10 w-full rounded-md bg-white ring-1 ring-slate-200" />
            <div className="min-h-[280px] rounded-lg bg-white ring-1 ring-slate-200" />
        </div>
    )
}
