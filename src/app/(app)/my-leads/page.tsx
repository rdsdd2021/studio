
'use client';
import * as React from 'react';
import { getLeads, getAssignments } from '@/actions/leads';
import type { Lead, Assignment } from '@/lib/types';
import { DataTable } from '@/components/leads/data-table';
import { columns } from '@/components/leads/columns';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyLeadsPage() {
  const { user } = useAuth();
  const [data, setData] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [allLeads, allAssignments] = await Promise.all([
        getLeads(),
        getAssignments(),
      ]);

      // Filter assignments for the current user
      const userAssignments = allAssignments.filter(assignment => assignment.userId === user.id);
      
      // Get latest assignment for each lead
      const latestAssignments = new Map<string, Assignment>();
      userAssignments.forEach(assignment => {
        const existing = latestAssignments.get(assignment.mainDataRefId);
        if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
          latestAssignments.set(assignment.mainDataRefId, assignment);
        }
      });

      // Get leads that are assigned to the current user
      const myLeadIds = Array.from(latestAssignments.keys());
      const myLeads = allLeads.filter(lead => myLeadIds.includes(lead.refId));

      // Transform data to include disposition
      const transformedData = myLeads.map(lead => {
        const assignment = latestAssignments.get(lead.refId);
        return {
          ...lead,
          disposition: assignment?.disposition || 'New',
          assignedTo: assignment?.userName,
          assignedTime: assignment?.assignedTime,
        }
      });

      setData(transformedData);
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-2">
        <div className="rounded-md border">
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
       <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">My Leads</h1>
        <p className="text-muted-foreground">
          {user ? `Here are the leads assigned to you, ${user.name}.` : 'Loading your leads...'}
        </p>
      </div>
      {data ? (
        <DataTable 
          columns={columns} 
          data={data}
          showToolbar={false}
        />
      ) : (
         <div className="rounded-md border">
            <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          </div>
      )}
    </div>
  )
}
