
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { importLeads } from '@/actions/leads'
import { getCampaignCustomFields, getUniversalCustomFields } from '@/actions/settings'
import type { Lead, User } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Lightbulb, FileQuestion, Map, Download } from 'lucide-react'


interface ImportLeadsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  currentUser: User;
}

const requiredFields = ['name', 'phone'];
const DO_NOT_MAP_VALUE = '__do_not_map__';


export function ImportLeadsDialog({
  isOpen,
  onOpenChange,
  currentUser,
}: ImportLeadsDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<any[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = React.useState<string>('');
  const [fieldMapping, setFieldMapping] = React.useState<Record<string, string>>({});
  
  const [universalCustomFields, setUniversalCustomFields] = React.useState<string[]>([]);
  const [campaignCustomFields, setCampaignCustomFields] = React.useState<Record<string, string[]>>({});
  const uniqueCampaigns = Object.keys(campaignCustomFields);

  React.useEffect(() => {
    async function fetchCustomFields() {
        const [uFields, cFields] = await Promise.all([
            getUniversalCustomFields(),
            getCampaignCustomFields(),
        ]);
        setUniversalCustomFields(uFields);
        setCampaignCustomFields(cFields);
    }
    if (isOpen) {
        fetchCustomFields();
    }
  }, [isOpen])


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            preview: 5, // Just need headers and a few rows for validation
            complete: (results) => {
                const fileHeaders = results.meta.fields || [];
                const missingHeaders = requiredFields.filter(h => !fileHeaders.includes(h));

                if (missingHeaders.length > 0) {
                    toast({
                        title: 'Missing Required Columns',
                        description: `Your CSV is missing the following required columns: ${missingHeaders.join(', ')}. Please fix the file and re-upload.`,
                        variant: 'destructive',
                        duration: 10000
                    });
                    resetState();
                    return;
                }
                setHeaders(fileHeaders);
                setParsedData(results.data);
            },
        });
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setSelectedCampaign('');
    setFieldMapping({});
    const fileInput = document.getElementById('csv-file') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
        resetState();
    }
    onOpenChange(open);
  }

  const handleMappingChange = (customField: string, csvHeader: string) => {
    setFieldMapping(prev => ({...prev, [customField]: csvHeader}));
  }

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a CSV file.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const leadsToImport = results.data.map((row: any) => {
            const leadData: Partial<Lead> = {
                name: row.name,
                phone: row.phone,
                // These are optional standard fields
                gender: row.gender,
                school: row.school,
                locality: row.locality,
                district: row.district,
            };

            const customFields: Lead['customFields'] = {};
            
            const processField = (fieldName: string) => {
                const mappedHeader = fieldMapping[fieldName];
                if (mappedHeader && mappedHeader !== DO_NOT_MAP_VALUE && row[mappedHeader]) {
                    customFields[fieldName] = {
                        value: row[mappedHeader],
                        updatedBy: 'Import',
                        updatedAt: new Date().toISOString()
                    };
                }
            };
            
            universalCustomFields.forEach(processField);
            
            if (selectedCampaign && campaignCustomFields[selectedCampaign]) {
                campaignCustomFields[selectedCampaign].forEach(processField);
            }
            
            leadData.customFields = customFields;
            return leadData;
        });

        try {
          await importLeads(leadsToImport, currentUser.id, selectedCampaign);
          toast({
            title: 'Import Successful!',
            description: `${leadsToImport.length} leads have been imported.`,
          });
          handleDialogClose(false);
          router.refresh();
        } catch (error: any) {
          toast({
            title: 'Import Failed',
            description: error.message || 'An error occurred during import. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      error: (err) => {
        toast({ title: 'CSV Parsing Error', description: err.message, variant: 'destructive' });
        setIsSubmitting(false);
      }
    });
  };
  
  const currentCampaignFields = selectedCampaign ? campaignCustomFields[selectedCampaign] || [] : [];
  const allMappableFields = [...universalCustomFields, ...currentCampaignFields];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add new leads. `name` and `phone` are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>File Requirements</AlertTitle>
                <AlertDescription className="text-xs space-y-2">
                    <p>Your CSV must contain `name` and `phone` columns. Other standard fields like `gender`, `school`, `locality`, and `district` are optional.</p>
                    <Button asChild variant="link" className="p-0 h-auto font-normal">
                      <a href="/leads_sample.csv" download>
                        <Download className="mr-2 h-3 w-3" />
                        Download sample CSV format
                      </a>
                    </Button>
                </AlertDescription>
            </Alert>
            <div className="space-y-2">
                <Label htmlFor='csv-file'>1. Upload CSV File</Label>
                <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                />
            </div>

            {headers.length > 0 && (
                <>
                <div className="space-y-2">
                    <Label htmlFor='campaign-select'>2. Select Campaign (Optional)</Label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign} disabled={isSubmitting}>
                        <SelectTrigger id="campaign-select">
                            <SelectValue placeholder="No specific campaign" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value={DO_NOT_MAP_VALUE}>No specific campaign</SelectItem>
                            {uniqueCampaigns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Selecting a campaign adds its specific fields for mapping.</p>
                </div>

                {allMappableFields.length > 0 && (
                    <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-semibold flex items-center gap-2"><Map className="h-4 w-4" /> Map Additional Fields</h4>
                        {allMappableFields.map(field => (
                            <div key={field} className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor={`map-${field}`}>{field}</Label>
                                <Select onValueChange={(value) => handleMappingChange(field, value)} disabled={isSubmitting}>
                                    <SelectTrigger id={`map-${field}`}>
                                        <SelectValue placeholder="Select CSV column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={DO_NOT_MAP_VALUE}>-- Do not map --</SelectItem>
                                        {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                )}
                </>
            )}

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSubmitting}>
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
