
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
import { getUsers } from '@/actions/users'
import type { User } from '@/lib/types'

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
  const [callers, setCallers] = React.useState<User[]>([]);

  React.useEffect(() => {
    async function fetchCallers() {
      const allUsers = await getUsers();
      const activeCallers = allUsers.filter(u => u.role === 'caller' && u.status === 'active');
      setCallers(activeCallers);
    }
    if (isOpen) {
      fetchCallers();
    }
  }, [isOpen])

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
      window.location.reload()
    } catch (error: any) {
      toast({
        title: 'Assignment Failed',
        description: error.message || 'Could not assign leads. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
  )
}
