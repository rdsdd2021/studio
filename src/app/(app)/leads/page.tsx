import { getLeads, getAssignments } from '@/actions/leads';
import type { Lead, Assignment } from '@/lib/types';
import { DataTable } from '@/components/leads/data-table';
import { columns } from '@/components/leads/columns';

export default async function LeadsPage() {
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();

  const latestAssignments = new Map<string, Assignment>();
  allAssignments.forEach(assignment => {
    const existing = latestAssignments.get(assignment.mainDataRefId);
    if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
      latestAssignments.set(assignment.mainDataRefId, assignment);
    }
  });

  const data = allLeads.map(lead => {
    const assignment = latestAssignments.get(lead.refId);
    return {
      ...lead,
      disposition: assignment?.disposition || 'New',
      assignedTo: assignment?.userName,
      assignedTime: assignment?.assignedTime,
    }
  });

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Leads Management</h1>
        <p className="text-muted-foreground">
          Filter, view, and assign leads to your team.
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
