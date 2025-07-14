
'use client';

import * as React from 'react';
import { DataTable } from '@/components/leads/data-table';
import { columns } from './columns';
import type { LoginActivity, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getUsers, getLoginActivity } from '@/actions/users';
import { useAuth } from '@/hooks/use-auth';

export default function UsersPage() {
  const { user } = useAuth();
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [data, setData] = React.useState<User[] | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const [users, loginActivity] = await Promise.all([
          getUsers(),
          getLoginActivity(),
      ]);
      
      const latestActivityMap = new Map<string, LoginActivity>();

      loginActivity
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .forEach(activity => {
            if (!latestActivityMap.has(activity.userId)) {
                latestActivityMap.set(activity.userId, activity);
            }
        });

      const enrichedUsers = users.map(user => {
        const latestActivity = latestActivityMap.get(user.id);
        const loginStatus = latestActivity?.activity === 'login' ? 'online' : 'offline';
        return { ...user, loginStatus };
      });

      setData(enrichedUsers);
    }
    
    fetchData();
  }, [isAddUserOpen]); // Refreshes data when a new user is added


  return (
    <>
      <AddUserDialog 
        isOpen={isAddUserOpen} 
        onOpenChange={setIsAddUserOpen}
      />
      <div className="container mx-auto py-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Add, edit, and manage user roles and permissions.
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => setIsAddUserOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
        {data ? (
          <DataTable columns={columns} data={data} showToolbar={false} />
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
    </>
  )
}
