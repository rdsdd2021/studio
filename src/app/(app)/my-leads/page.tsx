import { getLeads, getAssignments } from '@/actions/leads';
import { Lead, Assignment } from '@/lib/types';
import { DataTable } from '@/components/leads/data-table';
import { columns } from '@/components/leads/columns';

export default async function MyLeadsPage() {
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();

  // Mocking current user as 'usr_3' (John Smith)
  const currentUserId = 'usr_3';

  // Get the latest assignment for each lead
  const latestAssignments = new Map<string, Assignment>();
  allAssignments.forEach(assignment => {
    const existing = latestAssignments.get(assignment.mainDataRefId);
    if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
      latestAssignments.set(assignment.mainDataRefId, assignment);
    }
  });

  // Filter for leads assigned to the current user
  const myLeadAssignments = Array.from(latestAssignments.values()).filter(
    (a) => a.userId === currentUserId
  );
  
  const myLeadIds = new Set(myLeadAssignments.map(a => a.mainDataRefId));

  const data = allLeads
    .filter(lead => myLeadIds.has(lead.refId))
    .map(lead => {
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
        <h1 className="text-3xl font-bold font-headline tracking-tight">My Leads</h1>
        <p className="text-muted-foreground">
          Here are the leads assigned to you.
        </p>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        schoolOptions={[]}
        localityOptions={[]}
        districtOptions={[]}
        genderOptions={[]}
      />
    </div>
  )
}
