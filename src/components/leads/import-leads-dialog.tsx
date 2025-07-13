'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { importLeads } from '@/actions/leads'
import type { Lead } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Lightbulb } from 'lucide-react'

interface ImportLeadsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const requiredFields = ['name', 'phone', 'gender', 'school', 'locality', 'district'];

export function ImportLeadsDialog({
  isOpen,
  onOpenChange,
}: ImportLeadsDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
        toast({ title: 'No file selected', description: 'Please select a CSV file to import.', variant: 'destructive' });
        return;
    }

    setIsSubmitting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const headers = results.meta.fields || [];
        const missingHeaders = requiredFields.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            toast({
                title: 'Missing Required Columns',
                description: `Your CSV is missing the following columns: ${missingHeaders.join(', ')}`,
                variant: 'destructive'
            });
            setIsSubmitting(false);
            return;
        }

        const newLeads = results.data.map((row: any) => {
            const leadData: Omit<Lead, 'refId' | 'createdAt' | 'customFields'> = {
                name: row.name,
                phone: row.phone,
                gender: row.gender,
                school: row.school,
                locality: row.locality,
                district: row.district,
            };

            const customFields: Record<string, any> = {};
            for (const key in row) {
                if (!requiredFields.includes(key)) {
                    customFields[key] = row[key];
                }
            }
            
            return { ...leadData, customFields };
        });

        try {
            const result = await importLeads(newLeads);
            toast({
                title: 'Import Successful!',
                description: `${result.count} leads have been imported successfully.`,
            })
            onOpenChange(false);
            setFile(null);
            setTimeout(() => router.refresh(), 1000);
        } catch (error) {
            toast({
                title: 'Import Failed',
                description: 'Could not import leads. Please check the file and try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false);
        }
      },
      error: (error) => {
        toast({
            title: 'Parsing Error',
            description: `Error parsing CSV file: ${error.message}`,
            variant: 'destructive'
        });
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add new leads. The file must contain the required columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Required Columns</AlertTitle>
                <AlertDescription className="text-xs">
                    name, phone, gender, school, locality, district.
                    <br />
                    Any additional columns will be saved as custom fields.
                </AlertDescription>
            </Alert>
            <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isSubmitting}
            />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !file}>
            {isSubmitting ? 'Importing...' : 'Import Leads'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
