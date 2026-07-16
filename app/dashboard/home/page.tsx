import Link from 'next/link'
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, FileText, Users, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { OperationsDashboardCharts } from '@/components/dashboard/operations-dashboard-charts'

export const metadata = { title: 'Dashboard | JAZ Admin' }

type OverviewCard = {
  label: string
  value: number
  note: string
  href: string
  icon: LucideIcon
  tone: string
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const [applications, visaSlots, draftEvents, teamMembers, tasks, overdueTasks, applicationRows, teamMemberRows, taskRows] = await Promise.all([
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('visa_availability_slots').select('*', { count: 'exact', head: true }).in('status', ['available', 'limited']),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('users').select('id, full_name, email').eq('role', 'team').eq('is_active', true).order('full_name'),
    supabase.from('team_tasks').select('*', { count: 'exact', head: true }).neq('status', 'done'),
    supabase.from('team_tasks').select('*', { count: 'exact', head: true }).neq('status', 'done').lt('due_date', new Date().toISOString()),
    supabase.from('registrations').select('case_status'),
    supabase.from('users').select('id, full_name, email').eq('role', 'team').eq('is_active', true).order('full_name'),
    supabase.from('team_tasks').select('assignee, status'),
  ])

  const applicationStatuses = new Map<string, number>()
  for (const row of applicationRows.data ?? []) {
    const status = String(row.case_status || 'Draft').replaceAll('_', ' ')
    applicationStatuses.set(status, (applicationStatuses.get(status) ?? 0) + 1)
  }
  const applicationData = Array.from(applicationStatuses.entries()).map(([name, value], index) => ({
    name: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    value,
    fill: ['#8b0000', '#16a34a', '#2563eb', '#d97706', '#7c3aed'][index % 5],
  }))
  if (!applicationData.length) applicationData.push({ name: 'No applications', value: 1, fill: '#cbd5e1' })

  // Team workload is intentionally anchored to active members created in Team.
  // Tasks may contain stale/free-form assignee values, so they must not create
  // chart categories for users who are not members of the managed team.
  const workload = new Map<string, { open: number; done: number }>()
  const memberByAssignee = new Map<string, string>()
  for (const member of teamMemberRows.data ?? []) {
    const name = String(member.full_name || member.email)
    workload.set(name, { open: 0, done: 0 })
    memberByAssignee.set(name, name)
    memberByAssignee.set(String(member.email), name)
  }
  for (const row of taskRows.data ?? []) {
    const name = row.assignee ? memberByAssignee.get(String(row.assignee)) : undefined
    if (!name) continue
    const current = workload.get(name)!
    if (row.status === 'done') current.done++
    else current.open++
  }
  const teamData = Array.from(workload.entries()).slice(0, 8).map(([name, values]) => ({ name, ...values }))
  const completedTasks = (taskRows.data ?? []).filter((row) => row.status === 'done').length

  const cards: OverviewCard[] = [
    { label: 'Applications', value: applications.count ?? 0, note: 'All submitted applications', href: '/dashboard/registrations', icon: FileText, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Available appointments', value: visaSlots.count ?? 0, note: 'Available or limited slots', href: '/dashboard/visa-availability', icon: CalendarDays, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Draft events', value: draftEvents.count ?? 0, note: 'Events waiting for completion', href: '/dashboard/draft-events', icon: ClipboardList, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Active team members', value: teamMembers.count ?? 0, note: 'Currently active members', href: '/dashboard/team', icon: Users, tone: 'text-violet-600 bg-violet-50' },
    { label: 'Open tasks', value: tasks.count ?? 0, note: 'Tasks still in progress', href: '/dashboard/team', icon: CheckCircle2, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Overdue tasks', value: overdueTasks.count ?? 0, note: 'Needs immediate attention', href: '/dashboard/team', icon: AlertTriangle, tone: 'text-rose-600 bg-rose-50' },
  ]

  return (
    <div className="space-y-5 text-left" dir="ltr" lang="en">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">A focused view of the work that needs attention.</p>
        </div>
        <span className="text-xs text-muted-foreground">Live operational counts</span>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Operational overview">
        {cards.map(({ label, value, note, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardContent className="flex items-center gap-2.5 p-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="size-4" /></div>
                <div className="min-w-0">
                  <p className="text-xl font-bold leading-none tabular-nums text-foreground">{value}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{note}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <OperationsDashboardCharts
        applicationData={applicationData}
        teamData={teamData}
        totals={{
          applications: applications.count ?? 0,
          teamMembers: teamMembers.count ?? 0,
          openTasks: tasks.count ?? 0,
          completedTasks,
        }}
      />

    </div>
  )
}
