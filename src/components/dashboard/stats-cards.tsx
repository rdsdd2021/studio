import type { Lead, Assignment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, FolderKanban } from 'lucide-react';

interface StatsCardsProps {
  leads: Lead[];
  assignments: Assignment[];
}

export function StatsCards({ leads, assignments }: StatsCardsProps) {
  const totalLeads = leads.length;

  const latestAssignments = new Map<string, Assignment>();
  assignments.forEach(assignment => {
    const existing = latestAssignments.get(assignment.mainDataRefId);
    if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
      latestAssignments.set(assignment.mainDataRefId, assignment);
    }
  });

  const assignedLeadsCount = latestAssignments.size;
  
  const interestedLeadsCount = Array.from(latestAssignments.values()).filter(a => a.disposition === 'Interested').length;


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">All leads in the system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assigned Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{assignedLeadsCount}</div>
          <p className="text-xs text-muted-foreground">Leads currently assigned to callers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interested Leads</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{interestedLeadsCount}</div>
          <p className="text-xs text-muted-foreground">Leads marked as 'Interested'</p>
        </CardContent>
      </Card>
    </div>
  );
}
