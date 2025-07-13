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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addAssignment } from '@/actions/leads'
import type { Disposition, SubDisposition, Assignment, Lead } from '@/lib/types'
import { Wand2, Zap, BrainCircuit } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { useRouter } from 'next/navigation'
import { Checkbox } from '../ui/checkbox'

const dispositions: Disposition[] = ['Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
const subDispositions: SubDisposition[] = ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];

const FormSchema = z.object({
  disposition: z.enum(dispositions, { required_error: 'Please select a disposition.' }),
  subDisposition: z.enum(subDispositions, { required_error: 'Please select a sub-disposition.' }),
  remark: z.string().min(10, {
    message: "Remark must be at least 10 characters.",
  }),
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
  const [suggestion, setSuggestion] = React.useState<SuggestionResponse | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nextLead: true,
    }
  })

  const remarkValue = form.watch('remark');

  const handleSuggest = React.useCallback(async () => {
    if (!remarkValue || remarkValue.length < 10) return;
    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const response = await fetch('/api/genkit/flows/suggestDisposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remarks: remarkValue,
          historicalData: JSON.stringify(history.slice(0, 5)), // Send recent history
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to get suggestion');
      }
      const data = await response.json();
      setSuggestion(data);
    } catch (error) {
      toast({
        title: "Suggestion Failed",
        description: "Could not get an AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  }, [remarkValue, history, toast]);
  
  const useSuggestion = () => {
    if (suggestion) {
      const subDisp = suggestion.suggestedSubDisposition;
      if (subDispositions.includes(subDisp)) {
        form.setValue('subDisposition', subDisp);
        toast({ title: "Suggestion applied!", description: `Set sub-disposition to "${subDisp}".` });
      } else {
        toast({ title: "Unknown Suggestion", description: `The AI suggested "${subDisp}", which is not a valid option. Please select one manually.`, variant: "destructive" });
      }
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      await addAssignment(leadId, 'usr_3', data.disposition, data.subDisposition, data.remark);
      
      form.reset({ remark: '', nextLead: data.nextLead });
      setSuggestion(null);

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
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSuggest}
            disabled={isSuggesting || !remarkValue || remarkValue.length < 10 || isSubmitting}
            className="w-full"
        >
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isSuggesting ? 'Analyzing...' : 'Suggest Sub-Disposition'}
        </Button>

        {isSuggesting && <Progress value={50} className="h-1 w-full" />}
        {suggestion && (
          <div className="p-3 bg-secondary/50 rounded-lg space-y-2 border border-dashed">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> AI Suggestion</h4>
              <Badge variant="outline" className="text-xs">
                Confidence: {Math.round(suggestion.confidenceScore * 100)}%
              </Badge>
            </div>
            <p className="text-sm text-center font-medium p-2 bg-background rounded-md">{suggestion.suggestedSubDisposition}</p>
            <Button type="button" size="sm" className="w-full h-8" onClick={useSuggestion} disabled={isSubmitting}><Wand2 className="w-4 h-4 mr-2"/> Use this suggestion</Button>
          </div>
        )}

        <FormField
          control={form.control}
          name="subDisposition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-Disposition</FormLabel>
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
