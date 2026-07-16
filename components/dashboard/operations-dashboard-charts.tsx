"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

type OperationsDashboardChartsProps = {
  applicationData: { name: string; value: number; fill: string }[]
  teamData: { name: string; open: number; done: number }[]
  totals: { applications: number; teamMembers: number; openTasks: number; completedTasks: number }
}

const applicationConfig = {
  value: { label: "Applications" },
} satisfies ChartConfig

const teamConfig = {
  open: { label: "Open tasks", color: "#8b0000" },
  done: { label: "Completed", color: "#16a34a" },
} satisfies ChartConfig

export function OperationsDashboardCharts({ applicationData, teamData, totals }: OperationsDashboardChartsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1.35fr]" aria-label="Operational analytics">
      <Card>
        <CardHeader className="gap-1 border-b">
          <CardTitle>Application pipeline</CardTitle>
          <CardDescription>{totals.applications} total applications by current status</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-[minmax(180px,0.9fr)_1fr] sm:items-center">
          <ChartContainer config={applicationConfig} className="mx-auto aspect-square h-[190px] w-full max-w-[220px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={applicationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                {applicationData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="grid gap-3">
            {applicationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />{item.name}</span>
                <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-1 border-b">
          <CardTitle>Team workload</CardTitle>
          <CardDescription>{totals.teamMembers} active team members, {totals.openTasks} open tasks</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartContainer config={teamConfig} className="h-[250px] w-full">
            <BarChart data={teamData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="open" fill="var(--color-open)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="done" fill="var(--color-done)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="mt-3 flex items-center justify-end gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#8b0000]" />Open</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#16a34a]" />Completed</span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
