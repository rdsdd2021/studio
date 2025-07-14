import { getLoginActivity } from '@/actions/users';
import { DataTable } from '@/components/leads/data-table';
import { columns } from './columns';

export default async function TrackerPage() {
  const data = await getLoginActivity();

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Login Activity Tracker</h1>
        <p className="text-muted-foreground">
          View recent login and logout events for all users.
        </p>
      </div>
      <DataTable columns={columns} data={data} showToolbar={false} />
    </div>
  )
}
