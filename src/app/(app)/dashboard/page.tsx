import { getLeads, getAssignments } from '@/actions/leads';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CallerDashboard } from '@/components/dashboard/caller-dashboard';
import { users } from '@/lib/data';
import type { User } from '@/lib/types';

// In a real application, you would get the current user from your authentication system.
// For this prototype, we'll simulate it.
// To view the Caller dashboard, change this ID to 'usr_3' (John Smith).
const MOCK_CURRENT_USER_ID = 'usr_1'; // 'usr_1' is Admin, 'usr_3' is a Caller

async function getCurrentUser(userId: string): Promise<User | undefined> {
  return users.find(u => u.id === userId);
}


export default async function DashboardPage() {
  const currentUser = await getCurrentUser(MOCK_CURRENT_USER_ID);
  
  // In a real app, you might fetch data conditionally based on the role.
  // For simplicity, we'll fetch all data needed for either dashboard.
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();

  if (currentUser?.role === 'admin') {
    return <AdminDashboard leads={allLeads} assignments={allAssignments} />;
  }
  
  // Default to caller dashboard
  return <CallerDashboard userId={currentUser!.id} leads={allLeads} assignments={allAssignments} />;
}
