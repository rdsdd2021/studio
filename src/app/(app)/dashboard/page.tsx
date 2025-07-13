import { getLeads, getAssignments } from '@/actions/leads';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DispositionChart } from '@/components/dashboard/disposition-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your LeadsFlow dashboard.</p>
      </div>

      <StatsCards leads={allLeads} assignments={allAssignments} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Disposition Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DispositionChart assignments={allAssignments} />
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Recent activity feed will be shown here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
