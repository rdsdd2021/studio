'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateLeadCustomField } from '@/actions/leads';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

const FormSchema = z.object({
  value: z.string().min(1, { message: 'Value cannot be empty.' }),
});

interface UpdateCustomFieldFormProps {
  leadId: string;
  fieldName: string;
  currentUserId: string; // Mocking current user ID
}

export function UpdateCustomFieldForm({ leadId, fieldName, currentUserId }: UpdateCustomFieldFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      await updateLeadCustomField(leadId, fieldName, data.value, currentUserId);
      toast({
        title: 'Field Updated!',
        description: `The field "${fieldName}" has been updated.`,
      });
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update the field. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder={`Enter ${fieldName}...`} {...field} disabled={isSubmitting} className="h-9"/>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} size="icon" className="h-9 w-9">
          <Send className="h-4 w-4" />
          <span className="sr-only">Save</span>
        </Button>
      </form>
    </Form>
  );
}
