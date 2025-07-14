import type { Assignment, Lead, User } from '@/lib/types';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DispositionChart } from '@/components/dashboard/disposition-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TeamPerformanceChart } from './team-performance-chart';

interface AdminDashboardProps {
  leads: Lead[];
  assignments: Assignment[];
  users: User[];
}

export function AdminDashboard({ leads, assignments, users }: AdminDashboardProps) {

  const callers = users.filter(u => u.role === 'caller');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">High-level overview of system activity and performance.</p>
      </div>

      <StatsCards leads={leads} assignments={assignments} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <TeamPerformanceChart assignments={assignments} callers={callers} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Overall Disposition Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DispositionChart assignments={assignments} />
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity assignments={assignments} />
          </CardContent>
        </Card>
    </div>
  );
}
