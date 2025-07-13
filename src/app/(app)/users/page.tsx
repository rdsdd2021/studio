import { DataTable } from '@/components/leads/data-table';
import { columns } from './columns';
import { loginActivity, users } from '@/lib/data';
import type { LoginActivity } from '@/lib/types';

export default async function UsersPage() {
  const latestActivityMap = new Map<string, LoginActivity>();

  // Sort activities by timestamp to find the latest one for each user
  loginActivity
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .forEach(activity => {
        if (!latestActivityMap.has(activity.userId)) {
            latestActivityMap.set(activity.userId, activity);
        }
    });

  const data = users.map(user => {
    const latestActivity = latestActivityMap.get(user.id);
    const loginStatus = latestActivity?.activity === 'login' ? 'online' : 'offline';
    return { ...user, loginStatus };
  });

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Add, edit, and manage user roles and permissions.
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
