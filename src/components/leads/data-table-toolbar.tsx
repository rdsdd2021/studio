'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { AssignLeadsDialog } from './assign-leads-dialog'
import { users } from '@/lib/data' // We'll use mock data for now
import { LeadData } from './columns'


interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedLeadIds = selectedRows.map(row => (row.original as LeadData).refId);

  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
        {selectedRows.length > 0 && (
            <Button size="sm" className="h-8 ml-auto" onClick={() => setIsAssignDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign ({selectedRows.length})
            </Button>
          )}
      </div>
      <AssignLeadsDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        leadIds={selectedLeadIds}
        callers={users.filter(u => u.role === 'caller')}
      />
    </>
  )
}
