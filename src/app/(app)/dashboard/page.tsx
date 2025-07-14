
'use client';

import * as React from 'react';
import { getLeads, getAssignments } from '@/actions/leads';
import { getUsers } from '@/actions/users';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CallerDashboard } from '@/components/dashboard/caller-dashboard';
import type { User, Lead, Assignment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = React.useState<{
    leads: Lead[];
    assignments: Assignment[];
    users: User[];
  } | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const [allLeads, allAssignments, allUsers] = await Promise.all([
        getLeads(),
        getAssignments(),
        getUsers(),
      ]);
      setData({ leads: allLeads, assignments: allAssignments, users: allUsers });
    }
    fetchData();
  }, []);
  
  if (!user || !data) {
    return (
       <div className="flex flex-col gap-8">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <Skeleton className="lg:col-span-3 h-80" />
            <Skeleton className="lg:col-span-2 h-80" />
          </div>
        </div>
    );
  }

  // Render the appropriate dashboard based on the user's role.
  if (user.role === 'caller') {
    return <CallerDashboard currentUser={user} allLeads={data.leads} allAssignments={data.assignments} />;
  }
  
  // Default to the admin dashboard.
  return <AdminDashboard leads={data.leads} assignments={data.assignments} users={data.users} />;
}
