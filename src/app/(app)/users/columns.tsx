
'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, CheckCircle, XCircle, Hourglass, ShieldAlert } from 'lucide-react'
import type { User } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { EditUserDialog } from '@/components/users/edit-user-dialog'
import { toggleUserStatus, approveUser } from '@/actions/users'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'


const UserActions = ({ user, currentUser }: { user: User, currentUser?: User }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (!currentUser || currentUser.role !== 'admin' || user.id === currentUser.id) {
    // Admins can't edit themselves
    return null;
  }
  
  const isMasterAdmin = user.email === 'ramanuj@dreamdesk.in';

  const handleToggle = async () => {
    try {
      await toggleUserStatus(user.id, currentUser.id);
      toast({
        title: `User ${user.status === 'active' ? 'Deactivated' : 'Activated'}`,
        description: `${user.name} has been successfully ${user.status === 'active' ? 'deactivated' : 'activated'}.`,
      });
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update user status.',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async () => {
    try {
      await approveUser(user.id, currentUser.id);
       toast({
        title: "User Approved",
        description: `${user.name} has been approved and is now active.`,
      });
       router.refresh()
    } catch (error: any) {
       toast({
        title: 'Approval Failed',
        description: error.message || 'Could not approve user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <EditUserDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        currentUser={currentUser}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isMasterAdmin}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.status === 'pending' && (
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleToggle}
            className={cn(user.status === 'active' ? "text-destructive focus:text-destructive" : "text-green-600 focus:text-green-600")}
          >
            {user.status === 'active' ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

const statusVariant: Record<User['status'], "default" | "secondary" | "destructive"> = {
    'active': 'default',
    'inactive': 'destructive',
    'pending': 'secondary'
}

const statusIcon: Record<User['status'], React.ElementType> = {
    'active': CheckCircle,
    'inactive': XCircle,
    'pending': Hourglass,
}

const statusColor: Record<User['status'], string> = {
    'active': 'bg-green-500',
    'inactive': 'bg-red-500',
    'pending': 'bg-amber-500'
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        disabled={row.original.email === 'ramanuj@dreamdesk.in'}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
        const user = row.original;
        const nameFallback = user.name.split(' ').map(n => n[0]).join('');
        const isOnline = user.loginStatus === 'online';
        const isMasterAdmin = user.email === 'ramanuj@dreamdesk.in';

        return (
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{nameFallback}</AvatarFallback>
                    </Avatar>
                    <span
                        className={cn(
                            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card',
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                        )}
                        title={isOnline ? 'Online' : 'Offline'}
                    />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{user.name}</span>
                    {isMasterAdmin && <ShieldAlert className="h-4 w-4 text-amber-500" title="Master Admin"/>}
                  </div>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return <Badge variant="secondary" className="capitalize">{role}</Badge>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as User['status'];
        const Icon = statusIcon[status];
        return <Badge variant={statusVariant[status]} className={cn('capitalize', statusColor[status])}><Icon className="mr-1 h-3 w-3"/>{status}</Badge>
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
        const date = row.getValue('createdAt') as string | undefined;
        return date ? new Date(date).toLocaleDateString('en-CA') : <span className='text-muted-foreground'>N/A</span>
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const { currentUser } = table.options.meta as { currentUser?: User };
      return <UserActions user={row.original} currentUser={currentUser} />;
    },
  },
]
