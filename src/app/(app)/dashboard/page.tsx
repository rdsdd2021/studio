
import { getLeads, getAssignments } from '@/actions/leads';
import { getUsers } from '@/actions/users';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CallerDashboard } from '@/components/dashboard/caller-dashboard';
import type { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    // This could redirect to login or show an error message
    return (
      <div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Could not determine user role. Please log in.</p>
      </div>
    );
  }

  // Fetch all data needed for either dashboard.
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();
  const allUsers = await getUsers();

  // Render the appropriate dashboard based on the user's role.
  if (currentUser?.role === 'caller') {
    return <CallerDashboard currentUser={currentUser} allLeads={allLeads} allAssignments={allAssignments} />;
  }
  
  // Default to the admin dashboard.
  return <AdminDashboard leads={allLeads} assignments={allAssignments} users={allUsers} />;
}
