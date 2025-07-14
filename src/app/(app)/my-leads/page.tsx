
'use client';
import * as React from 'react';
import { getLeads, getAssignments } from '@/actions/leads';
import type { Assignment, User, Lead } from '@/lib/types';
import { DataTable } from '@/components/leads/data-table';
import { columns } from '@/components/leads/columns';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyLeadsPage() {
  const { user } = useAuth();
  const [data, setData] = React.useState<Lead[] | null>(null);

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [allLeads, allAssignments] = await Promise.all([
        getLeads(),
        getAssignments()
      ]);

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
        (a) => a.userId === user.id
      );
      
      const myLeadIds = new Set(myLeadAssignments.map(a => a.mainDataRefId));

      const myLeadsData = allLeads
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
      
      setData(myLeadsData);
    };

    fetchData();
  }, [user]);


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
