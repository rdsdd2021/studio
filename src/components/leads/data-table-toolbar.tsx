'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserPlus, X, Upload } from 'lucide-react'
import { AssignLeadsDialog } from './assign-leads-dialog'
import { users } from '@/lib/data' 
import type { LeadData } from './columns'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import type { Disposition } from '@/lib/types'
import { ImportLeadsDialog } from './import-leads-dialog'

const dispositions: {label: Disposition, value: Disposition}[] = [
  { label: 'New', value: 'New' },
  { label: 'Interested', value: 'Interested' },
  { label: 'Not Interested', value: 'Not Interested' },
  { label: 'Follow-up', value: 'Follow-up' },
  { label: 'Callback', value: 'Callback' },
  { label: 'Not Reachable', value: 'Not Reachable' },
];


interface DataTableToolbarProps<TData> {
  table: Table<TData>
  callers?: {label: string, value: string}[];
}

export function DataTableToolbar<TData>({
  table,
  callers
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedLeadIds = selectedRows.map(row => (row.original as LeadData).refId);

  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter by name, phone, or custom fields..."
            value={(table.getState().globalFilter as string) ?? ''}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("disposition") && (
            <DataTableFacetedFilter
              column={table.getColumn("disposition")}
              title="Disposition"
              options={dispositions}
            />
          )}
          {callers && table.getColumn("assignedTo") && (
             <DataTableFacetedFilter
              column={table.getColumn("assignedTo")}
              title="Caller"
              options={callers}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter('');
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className='flex items-center gap-2'>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            {selectedRows.length > 0 && (
                <Button size="sm" className="h-8" onClick={() => setIsAssignDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign ({selectedRows.length})
                </Button>
              )}
        </div>
      </div>
      <AssignLeadsDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        leadIds={selectedLeadIds}
        callers={users.filter(u => u.role === 'caller')}
      />
      <ImportLeadsDialog 
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </>
  )
}
