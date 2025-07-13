'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedMinMaxValues,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DataTableToolbar } from './data-table-toolbar'

interface Option {
  label: string;
  value: string;
}
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  callers?: Option[];
  schoolOptions?: Option[];
  localityOptions?: Option[];
  districtOptions?: Option[];
  genderOptions?: Option[];
  campaignOptions?: Option[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  callers,
  schoolOptions,
  localityOptions,
  districtOptions,
  genderOptions,
  campaignOptions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
        disposition: true,
        assignedTo: true,
        school: true,
        locality: true,
        district: true,
        gender: true,
        campaign: true,
    })
  
  const [isAllFilteredRowsSelected, setIsAllFilteredRowsSelected] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      globalFilter,
    },
    meta: {
      isAllFilteredRowsSelected,
      setIsAllFilteredRowsSelected,
    },
    enableRowSelection: true,
  })

  React.useEffect(() => {
    if (!isAllFilteredRowsSelected) {
      const isAnyRowSelected = Object.keys(rowSelection).length > 0;
      if (!isAnyRowSelected) {
        setIsAllFilteredRowsSelected(false);
      }
    }
  }, [rowSelection, isAllFilteredRowsSelected]);

  React.useEffect(() => {
    // When filters change, reset the 'select all' state
    setIsAllFilteredRowsSelected(false);
    table.resetRowSelection();
  }, [columnFilters, globalFilter, table]);


  const showToolbar = !!(callers || schoolOptions || localityOptions || districtOptions || genderOptions || campaignOptions);

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar 
          table={table} 
          callers={callers}
          schoolOptions={schoolOptions}
          localityOptions={localityOptions}
          districtOptions={districtOptions}
          genderOptions={genderOptions}
          campaignOptions={campaignOptions}
        />
      )}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {isAllFilteredRowsSelected
            ? `${table.getFilteredRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
            : `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
          }
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
