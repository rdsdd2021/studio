import { getLeads, getAssignments } from '@/actions/leads';
import { getUsers } from '@/actions/users';
import type { Lead, Assignment, User } from '@/lib/types';
import { DataTable } from '@/components/leads/data-table';
import { columns } from '@/components/leads/columns';

// Prevent prerendering to avoid database calls during build
export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const [allLeads, allAssignments, allUsers] = await Promise.all([
    getLeads(),
    getAssignments(),
    getUsers(),
  ]);

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

  const callers = allUsers.filter(u => u.role === 'caller').map(u => ({ label: u.name, value: u.name }));

  const getUniqueOptions = (fieldName: keyof Lead) => {
    const values = new Set(allLeads.map(lead => lead[fieldName]).filter(Boolean));
    return Array.from(values).map(value => ({ label: String(value), value: String(value) }));
  }
  
  const getUniqueCampaignOptions = () => {
    const values = new Set(allLeads.flatMap(lead => lead.campaigns || []).filter(Boolean));
    return Array.from(values).map(value => ({ label: String(value), value: String(value) }));
  }

  const schoolOptions = getUniqueOptions('school');
  const localityOptions = getUniqueOptions('locality');
  const districtOptions = getUniqueOptions('district');
  const genderOptions = getUniqueOptions('gender');
  const campaignOptions = getUniqueCampaignOptions();
  
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Leads Management</h1>
        <p className="text-muted-foreground">
          Filter, view, and assign leads to your team.
        </p>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        callers={callers}
        schoolOptions={schoolOptions}
        localityOptions={localityOptions}
        districtOptions={districtOptions}
        genderOptions={genderOptions}
        campaignOptions={campaignOptions}
      />
    </div>
  )
}
