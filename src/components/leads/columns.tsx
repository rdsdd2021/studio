'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Disposition } from '@/lib/types'

export type LeadData = {
  refId: string
  name: string
  phone: string
  disposition: Disposition
  assignedTo?: string
  assignedTime?: string
  school: string
}

const dispositionVariant: Record<Disposition, "default" | "secondary" | "destructive"> = {
    'New': 'secondary',
    'Interested': 'default',
    'Not Interested': 'destructive',
    'Follow-up': 'secondary',
    'Callback': 'secondary',
    'Not Reachable': 'destructive'
}

export const columns: ColumnDef<LeadData>[] = [
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
        const lead = row.original;
        return (
            <Link href={`/leads/${lead.refId}`} className="font-medium hover:underline">
                {lead.name}
            </Link>
        )
    }
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'school',
    header: 'School',
  },
  {
    accessorKey: 'disposition',
    header: 'Disposition',
    cell: ({ row }) => {
        const disposition = row.getValue('disposition') as Disposition
        return (
            <Badge variant={dispositionVariant[disposition] || 'secondary'} className={cn(disposition === 'Interested' && 'bg-green-600')}>{disposition}</Badge>
        )
    }
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => {
        return row.getValue('assignedTo') || <span className='text-muted-foreground'>Unassigned</span>
    }
  },
  {
    accessorKey: 'assignedTime',
    header: 'Assigned Date',
    cell: ({ row }) => {
        const date = row.getValue('assignedTime') as string | undefined;
        return date ? new Date(date).toLocaleDateString('en-CA') : <span className='text-muted-foreground'>N/A</span>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const lead = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/leads/${lead.refId}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Re-assign Lead</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
