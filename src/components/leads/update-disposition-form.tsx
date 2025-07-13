'use client'

import * as React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addAssignment } from '@/actions/leads'
import type { Disposition, SubDisposition, Assignment, Lead } from '@/lib/types'
import { BrainCircuit, CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '../ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const dispositions: Disposition[] = ['Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
const subDispositions: SubDisposition[] = ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];

const FormSchema = z.object({
  disposition: z.enum(dispositions, { required_error: 'Please select a disposition.' }),
  subDisposition: z.enum(subDispositions, { required_error: 'Please select a sub-disposition.' }),
  remark: z.string().min(10, {
    message: "Remark must be at least 10 characters.",
  }),
  followUpDate: z.date().optional(),
  scheduleDate: z.date().optional(),
  nextLead: z.boolean().default(true),
})

type SuggestionResponse = {
  suggestedSubDisposition: SubDisposition;
  confidenceScore: number;
}

interface UpdateDispositionFormProps {
  leadId: string;
  history: Assignment[];
  myLeads: Lead[];
}

export function UpdateDispositionForm({ leadId, history, myLeads }: UpdateDispositionFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nextLead: true,
    }
  })

  const remarkValue = form.watch('remark');
  const dispositionValue = form.watch('disposition');
  const subDispositionValue = form.watch('subDisposition');

  const showFollowUpPicker = dispositionValue === 'Follow-up' || dispositionValue === 'Callback';
  const showSchedulePicker = dispositionValue === 'Interested' && subDispositionValue === 'Will Join Later';

  const handleSuggest = async () => {
    if (!remarkValue || remarkValue.length < 10) {
      toast({
        title: "Remark is too short",
        description: "Please enter at least 10 characters in the remark field to get a suggestion.",
        variant: "destructive"
      })
      return;
    };
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/genkit/flows/suggestDisposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remarks: remarkValue,
          historicalData: JSON.stringify(history.slice(0, 5)),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to get suggestion');
      }
      const data: SuggestionResponse = await response.json();
      
      if (data.suggestedSubDisposition && subDispositions.includes(data.suggestedSubDisposition)) {
        form.setValue('subDisposition', data.suggestedSubDisposition);
        toast({
          title: "AI Suggestion Applied!",
          description: `Sub-disposition set to "${data.suggestedSubDisposition}". (Confidence: ${Math.round(data.confidenceScore * 100)}%)`,
        });
      } else {
         toast({ title: "Unknown Suggestion", description: `The AI suggested "${data.suggestedSubDisposition}", which is not a valid option. Please select one manually.`, variant: "destructive" });
      }

    } catch (error) {
      toast({
        title: "Suggestion Failed",
        description: "Could not get an AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      await addAssignment(
        leadId, 
        'usr_3', 
        data.disposition, 
        data.subDisposition, 
        data.remark,
        data.followUpDate,
        data.scheduleDate
      );
      
      form.reset({ remark: '', nextLead: data.nextLead });

      if (data.nextLead) {
        const currentIndex = myLeads.findIndex(l => l.refId === leadId);
        const nextLead = myLeads[currentIndex + 1];

        if (nextLead) {
          toast({
            title: "Status Updated",
            description: "Loading next lead...",
          });
          router.push(`/leads/${nextLead.refId}`);
        } else {
          toast({
            title: "Status Updated",
            description: "You've reached the end of your lead list!",
          });
          router.push('/my-leads');
        }
      } else {
        toast({
          title: "Status Updated",
          description: "The lead status has been successfully updated.",
        });
        router.refresh();
      }

    } catch (error) {
       toast({
        title: "Update Failed",
        description: "Could not update the lead status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="disposition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disposition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Select a disposition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dispositions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add your call notes here..."
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       
        <FormField
          control={form.control}
          name="subDisposition"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Sub-Disposition</FormLabel>
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleSuggest}
                            disabled={isSuggesting || isSubmitting || !remarkValue || remarkValue.length < 10}
                            className="h-7 w-7"
                          >
                           <BrainCircuit className="h-4 w-4" />
                           <span className="sr-only">Suggest Sub-Disposition</span>
                         </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Suggest with AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </div>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Select a sub-disposition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subDispositions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showFollowUpPicker && (
            <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Follow-up Date</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        
        {showSchedulePicker && (
            <FormField
                control={form.control}
                name="scheduleDate"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Schedule Date</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}

        <FormField
          control={form.control}
          name="nextLead"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Go to next lead after update
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Lead'}
        </Button>
      </form>
    </Form>
  )
}
