'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { LoginActivity } from '@/lib/types'
import { LogIn, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export const columns: ColumnDef<LoginActivity>[] = [
  {
    accessorKey: 'activity',
    header: 'Activity',
    cell: ({ row }) => {
        const activity = row.getValue('activity') as LoginActivity['activity'];
        const isLogin = activity === 'login';
        return (
            <Badge variant={isLogin ? 'default' : 'secondary'} className={cn(isLogin && 'bg-green-600')}>
                {isLogin ? <LogIn className="mr-1 h-3 w-3" /> : <LogOut className="mr-1 h-3 w-3" />}
                <span className="capitalize">{activity}</span>
            </Badge>
        )
    }
  },
  {
    accessorKey: 'userName',
    header: 'User',
  },
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
        const date = row.getValue('timestamp') as string;
        return new Date(date).toLocaleString()
    }
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
  },
  {
    accessorKey: 'device',
    header: 'Device / Client',
  },
]
