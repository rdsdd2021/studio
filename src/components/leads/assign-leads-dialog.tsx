'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { assignLeads } from '@/actions/leads'
import type { User } from '@/lib/types'
import { users } from '@/lib/data'

const FormSchema = z.object({
  userId: z.string({ required_error: 'Please select a caller.' }),
})

interface AssignLeadsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  leadIds: string[]
}

export function AssignLeadsDialog({
  isOpen,
  onOpenChange,
  leadIds,
}: AssignLeadsDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (leadIds.length === 0) {
        toast({ title: "No leads selected", variant: "destructive" });
        return;
    }

    setIsSubmitting(true)
    try {
      await assignLeads(leadIds, data.userId)
      toast({
        title: 'Leads Assigned!',
        description: `${leadIds.length} lead(s) have been assigned successfully.`,
      })
      onOpenChange(false)
      form.reset();
      // Wait a bit for the toast to show before refreshing the page
      setTimeout(() => router.refresh(), 1000)
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Could not assign leads. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const callers = users.filter(u => u.role === 'caller' && u.status === 'active');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Assign Leads</DialogTitle>
              <DialogDescription>
                Assign the selected {leadIds.length} lead(s) to a caller. This action will be recorded in the lead history.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caller</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a caller to assign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {callers.map((caller) => (
                          <SelectItem key={caller.id} value={caller.id}>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                {caller.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Assign Leads'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  </change>
  <change>
    <file>/src/components/leads/data-table-toolbar.tsx</file>
    <content><![CDATA['use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserPlus, X, Upload, Tag } from 'lucide-react'
import { AssignLeadsDialog } from './assign-leads-dialog'
import type { LeadData } from './columns'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import type { Disposition } from '@/lib/types'
import { ImportLeadsDialog } from './import-leads-dialog'
import { UpdateCampaignDialog } from './update-campaign-dialog'
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
  callers?: Option[];
  schoolOptions?: Option[];
  localityOptions?: Option[];
  districtOptions?: Option[];
  genderOptions?: Option[];
  campaignOptions?: Option[];
}

export function DataTableToolbar<TData>({
  table,
  callers,
  schoolOptions,
  localityOptions,
  districtOptions,
  genderOptions,
  campaignOptions,
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
          {campaignOptions && table.getColumn("campaign") && (
            <DataTableFacetedFilter
              column={table.getColumn("campaign")}
              title="Campaign"
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
            <Button size="sm" variant="outline" className="h-8" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            {leadCount > 0 && (
              <>
                <Button size="sm" variant="outline" className="h-8" onClick={() => setIsCampaignDialogOpen(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Update Campaign
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

      <AssignLeadsDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        leadIds={selectedLeadIds}
      />
      <ImportLeadsDialog 
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
      <UpdateCampaignDialog
        isOpen={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
        leadIds={selectedLeadIds}
      />
    </>
  )
}
