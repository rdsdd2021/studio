
import { getLeads, getAssignments } from '@/actions/leads';
import { getUsers } from '@/actions/users';
import { Lead, Assignment, User } from '@/lib/types';
import { DataTable } from '@/components/leads/data-table';
import { columns } from '@/components/leads/columns';

// In a real application, you would get the current user from an authentication session.
// For this prototype, we'll simulate a logged-in caller to demonstrate functionality.
async function getSimulatedCurrentUser(): Promise<User | undefined> {
    const users = await getUsers();
    // Find the first active caller to simulate being logged in as them.
    return users.find(u => u.role === 'caller' && u.status === 'active');
}


export default async function MyLeadsPage() {
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();

  // Mocking current user by finding the first active caller.
  const currentUser = await getSimulatedCurrentUser();

  // Get the latest assignment for each lead
  const latestAssignments = new Map<string, Assignment>();
  allAssignments.forEach(assignment => {
    const existing = latestAssignments.get(assignment.mainDataRefId);
    if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
      latestAssignments.set(assignment.mainDataRefId, assignment);
    }
  });

  // Filter for leads assigned to the current user
  const myLeadAssignments = currentUser ? Array.from(latestAssignments.values()).filter(
    (a) => a.userId === currentUser.id
  ) : [];
  
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
          {currentUser ? `Here are the leads assigned to you, ${currentUser.name}.` : 'No active caller found.'}
        </p>
      </div>
      <DataTable 
        columns={columns} 
        data={data}
        showToolbar={false}
      />
    </div>
  )
}
