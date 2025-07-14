
'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserPlus, X, Upload, Tag } from 'lucide-react'
import { AssignLeadsDialog } from './assign-leads-dialog'
import type { LeadData } from './columns'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import type { Disposition, User } from '@/lib/types'
import { ImportLeadsDialog } from './import-leads-dialog'
import { AddCampaignDialog } from './update-campaign-dialog'
import { Alert, AlertDescription } from '../ui/alert'

const dispositions: {label: Disposition, value: Disposition}[] = [
  { label: 'New', value: 'New' },
  { label: 'Interested', value: 'Interested' },
  { label: 'Not Interested', value: 'Not Interested' },
  { label: 'Follow-up', value: 'Follow-up' },
  { label: 'Callback', value: 'Callback' },
  { label: 'Not Reachable', value: 'Not Reachable' },
];

interface Option {
  label: string;
  value: string;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  currentUser?: User;
  callers?: Option[];
  schoolOptions?: Option[];
  localityOptions?: Option[];
  districtOptions?: Option[];
  genderOptions?: Option[];
  campaignOptions?: Option[];
  showImportButton?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  currentUser,
  callers,
  schoolOptions,
  localityOptions,
  districtOptions,
  genderOptions,
  campaignOptions,
  showImportButton = true,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;

  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = React.useState(false);

  const { isAllFilteredRowsSelected, setIsAllFilteredRowsSelected } = table.options.meta as any;

  let selectedLeadIds: string[] = [];
  let leadCount = 0;

  if (isAllFilteredRowsSelected) {
    selectedLeadIds = table.getFilteredRowModel().rows.map(row => (row.original as LeadData).refId);
    leadCount = table.getFilteredRowModel().rows.length;
  } else {
    selectedLeadIds = table.getFilteredSelectedRowModel().rows.map(row => (row.original as LeadData).refId);
    leadCount = table.getFilteredSelectedRowModel().rows.length;
  }

  const handleReset = () => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
    table.resetRowSelection();
    if (setIsAllFilteredRowsSelected) {
      setIsAllFilteredRowsSelected(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center space-x-2 flex-wrap gap-y-2">
          <Input
            placeholder="Filter by name, phone, etc..."
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
          {campaignOptions && table.getColumn("campaigns") && (
            <DataTableFacetedFilter
              column={table.getColumn("campaigns")}
              title="Campaigns"
              options={campaignOptions}
            />
          )}
          {schoolOptions && table.getColumn("school") && (
            <DataTableFacetedFilter
              column={table.getColumn("school")}
              title="School"
              options={schoolOptions}
            />
          )}
          {localityOptions && table.getColumn("locality") && (
            <DataTableFacetedFilter
              column={table.getColumn("locality")}
              title="Locality"
              options={localityOptions}
            />
          )}
          {districtOptions && table.getColumn("district") && (
            <DataTableFacetedFilter
              column={table.getColumn("district")}
              title="District"
              options={districtOptions}
            />
          )}
          {genderOptions && table.getColumn("gender") && (
            <DataTableFacetedFilter
              column={table.getColumn("gender")}
              title="Gender"
              options={genderOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className='flex items-center gap-2'>
            {showImportButton && currentUser?.role === 'admin' && (
                <Button size="sm" variant="outline" className="h-8" onClick={() => setIsImportDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
            )}
            {leadCount > 0 && currentUser?.role === 'admin' && (
              <>
                <Button size="sm" variant="outline" className="h-8" onClick={() => setIsCampaignDialogOpen(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Add Campaign
                </Button>
                <Button size="sm" className="h-8" onClick={() => setIsAssignDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign ({leadCount})
                </Button>
              </>
            )}
        </div>
      </div>

       {isAllFilteredRowsSelected && (
        <Alert>
          <AlertDescription>
            All {leadCount} rows matching the current filters are selected. Any bulk action will apply to all of them.
          </AlertDescription>
        </Alert>
      )}

      {currentUser && (
        <>
          <AssignLeadsDialog
            isOpen={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            leadIds={selectedLeadIds}
            currentUser={currentUser}
          />
          <ImportLeadsDialog 
            isOpen={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            currentUser={currentUser}
          />
          <AddCampaignDialog
            isOpen={isCampaignDialogOpen}
            onOpenChange={setIsCampaignDialogOpen}
            leadIds={selectedLeadIds}
            currentUser={currentUser}
          />
        </>
      )}
    </>
  )
}
