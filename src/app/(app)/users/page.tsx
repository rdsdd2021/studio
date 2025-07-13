import { DataTable } from '@/components/leads/data-table';
import { columns } from './columns';
import { users } from '@/lib/data';

export default async function UsersPage() {
  const data = users;

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
