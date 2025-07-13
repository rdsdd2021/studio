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
import { MoreHorizontal, Phone, Tag } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Disposition } from '@/lib/types'

export type LeadData = {
  refId: string
  name: string
  phone: string
  gender: string
  school: string
  locality: string
  district: string
  disposition: Disposition
  assignedTo?: string
  assignedTime?: string
  campaigns?: string[]
  customFields?: Record<string, any>
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
    header: ({ table }) => {
      const { setIsAllFilteredRowsSelected } = table.options.meta as any;
      const isAllFilteredSelected = (table.options.meta as any)?.isAllFilteredRowsSelected;

      const handleCheckedChange = (value: boolean | 'indeterminate') => {
        if (value === true) {
          table.toggleAllPageRowsSelected(true);
          setIsAllFilteredRowsSelected(true);
        } else {
          table.toggleAllPageRowsSelected(false);
          setIsAllFilteredRowsSelected(false);
        }
      };

      return (
        <Checkbox
          checked={
            isAllFilteredSelected ? true : (table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected())
          }
          onCheckedChange={handleCheckedChange}
          aria-label="Select all"
        />
      );
    },
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
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string;
      return (
        <div className="flex items-center gap-2">
          <span>{phone}</span>
          <a href={`tel:${phone}`} className="text-muted-foreground hover:text-primary">
            <Phone className="h-4 w-4" />
            <span className="sr-only">Call {phone}</span>
          </a>
        </div>
      );
    }
  },
  {
    accessorKey: 'campaigns',
    header: 'Campaigns',
    cell: ({ row }) => {
      const campaigns = row.getValue('campaigns') as string[] | undefined;
      if (!campaigns || campaigns.length === 0) {
        return <span className='text-muted-foreground'>N/A</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {campaigns.map(campaign => (
            <Badge key={campaign} variant="outline" className="font-normal"><Tag className="mr-1 h-3 w-3" />{campaign}</Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const campaigns = row.getValue(id) as string[] || [];
      return value.some((v: string) => campaigns.includes(v));
    },
  },
  {
    accessorKey: 'school',
    header: 'School',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
   {
    accessorKey: 'locality',
    header: 'Locality',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'district',
    header: 'District',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'disposition',
    header: 'Disposition',
    cell: ({ row }) => {
        const disposition = row.getValue('disposition') as Disposition
        return (
            <Badge variant={dispositionVariant[disposition] || 'secondary'} className={cn(disposition === 'Interested' && 'bg-green-600')}>{disposition}</Badge>
        )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => {
        return row.getValue('assignedTo') || <span className='text-muted-foreground'>Unassigned</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
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
