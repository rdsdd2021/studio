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
import { MoreHorizontal } from 'lucide-react'
import type { User } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { EditUserDialog } from '@/components/users/edit-user-dialog'
import { toggleUserStatus } from '@/actions/users'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'


const UserActions = ({ user }: { user: User }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(user.id, user.active);
      toast({
        title: `User ${user.active ? 'Deactivated' : 'Activated'}`,
        description: `${user.name} has been successfully ${user.active ? 'deactivated' : 'activated'}.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update user status. Please try again.',
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
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleToggleStatus}
            className={cn(user.active ? "text-destructive focus:text-destructive" : "text-green-600 focus:text-green-600")}
          >
            {user.active ? 'Deactivate User' : 'Activate User'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
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
        return (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{nameFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.phone}</span>
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
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => {
        const isActive = row.getValue('active');
        return <Badge variant={isActive ? "default" : "destructive"} className={cn(isActive ? 'bg-green-600' : '')}>{isActive ? 'Active' : 'Inactive'}</Badge>
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
    cell: ({ row }) => <UserActions user={row.original} />,
  },
]
