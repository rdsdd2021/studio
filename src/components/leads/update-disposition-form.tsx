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
import type { Disposition, SubDisposition, Assignment } from '@/lib/types'
import { Wand2, Zap, BrainCircuit } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'

const dispositions: Disposition[] = ['Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
const subDispositions: SubDisposition[] = ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];

const FormSchema = z.object({
  disposition: z.enum(dispositions, { required_error: 'Please select a disposition.' }),
  subDisposition: z.enum(subDispositions, { required_error: 'Please select a sub-disposition.' }),
  remark: z.string().min(10, {
    message: "Remark must be at least 10 characters.",
  }),
})

type SuggestionResponse = {
  suggestedSubDisposition: SubDisposition;
  confidenceScore: number;
}

export function UpdateDispositionForm({ leadId, history }: { leadId: string; history: Assignment[] }) {
  const { toast } = useToast()
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<SuggestionResponse | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
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
    try {
      // Mocking current user as 'usr_3' (John Smith)
      await addAssignment(leadId, 'usr_3', data.disposition, data.subDisposition, data.remark);
      toast({
        title: "Status Updated",
        description: "The lead status has been successfully updated.",
      })
      form.reset({ remark: '' });
      setSuggestion(null);
    } catch (error) {
       toast({
        title: "Update Failed",
        description: "Could not update the lead status. Please try again.",
        variant: "destructive"
      })
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
                  <SelectTrigger>
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
            disabled={isSuggesting || !remarkValue || remarkValue.length < 10}
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
            <Button type="button" size="sm" className="w-full h-8" onClick={useSuggestion}><Wand2 className="w-4 h-4 mr-2"/> Use this suggestion</Button>
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
                  <SelectTrigger>
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
        <Button type="submit" className="w-full">Update Lead</Button>
      </form>
    </Form>
  )
}
