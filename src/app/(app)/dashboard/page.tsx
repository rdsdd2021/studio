
import { getLeads, getAssignments } from '@/actions/leads';
import { getUsers } from '@/actions/users';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CallerDashboard } from '@/components/dashboard/caller-dashboard';
import type { User } from '@/lib/types';

// In a real application, you would get the current user's ID from an authentication session.
// For this prototype, we'll try to find an 'admin' or the first 'caller'.
// This should be replaced with actual session management (e.g., Firebase Auth) in production.
async function getCurrentUser(): Promise<User | undefined> {
  const users = await getUsers();
  // Prefer an active admin user
  const admin = users.find(u => u.role === 'admin' && u.status === 'active');
  if (admin) return admin;
  // Fallback to the first active caller
  return users.find(u => u.role === 'caller' && u.status === 'active');
}


export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  
  // Fetch all data needed for either dashboard.
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();
  const allUsers = await getUsers();

  // If the current user is a caller, show their specific dashboard.
  if (currentUser?.role === 'caller') {
    return <CallerDashboard userId={currentUser.id} leads={allLeads} assignments={allAssignments} />;
  }
  
  // Default to the admin dashboard for admins or if no specific user role is found.
  // This provides a safe fallback for the prototype.
  return <AdminDashboard leads={allLeads} assignments={allAssignments} users={allUsers} />;
}
