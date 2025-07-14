
'use client'

import * as React from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { Disposition, SubDisposition, User } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Tag, Trash2, X, Save } from 'lucide-react';
import { 
  getGeofenceSettings, saveGeofenceSettings, type GeofenceSettings, 
  getCampaignCustomFields, getUniversalCustomFields,
  saveUniversalCustomFields, saveCampaignCustomFields,
  getGlobalDispositions, saveGlobalDispositions,
  getGlobalSubDispositions, saveGlobalSubDispositions,
  getCampaignDispositions, saveCampaignDispositions,
  getCampaignSubDispositions, saveCampaignSubDispositions,
} from '@/actions/settings';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';

const ProfileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Phone must be at least 10 digits.' }),
  email: z.string().email(),
  role: z.enum(['admin', 'caller'], { required_error: 'Please select a role.' }),
})

const GeofenceFormSchema = z.object({
    centerLocation: z.string().min(1, { message: "Center location cannot be empty." }),
    radius: z.coerce.number().min(1, { message: "Radius must be at least 1." })
})

function GeofenceSettingsForm({ settings, currentUser }: { settings: GeofenceSettings, currentUser: User }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof GeofenceFormSchema>>({
        resolver: zodResolver(GeofenceFormSchema),
        defaultValues: {
            centerLocation: settings.centerLocation || '',
            radius: settings.radius || 5000,
        },
    });

    async function onSubmit(data: z.infer<typeof GeofenceFormSchema>) {
        setIsSubmitting(true);
        try {
            await saveGeofenceSettings(data);
            toast({
                title: 'Settings Saved!',
                description: 'Your geofencing settings have been updated.',
            });
            router.refresh();
        } catch (error) {
            toast({
                title: 'Save Failed',
                description: 'Could not save geofencing settings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="centerLocation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Center Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Connaught Place, New Delhi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="radius"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Radius (in meters)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 5000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <p className="text-sm text-muted-foreground pt-4">
                            Other application-wide settings like notification preferences, API keys, and theme customization would appear here.
                        </p>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border bg-muted h-64 md:h-auto">
                        <Image
                            src="https://placehold.co/600x400.png"
                            alt="Map placeholder"
                            width={600}
                            height={400}
                            data-ai-hint="map"
                            className="object-cover w-full h-full opacity-30"
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="w-full h-full rounded-full bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center">
                                <span className="text-primary font-semibold text-sm bg-background/80 px-3 py-1 rounded-full">Operational Area</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button type="submit" disabled={isSubmitting || currentUser.role !== 'admin'}>
                        {isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}


export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true);

  // Data state
  const [geofenceSettings, setGeofenceSettings] = React.useState<GeofenceSettings | null>(null);
  const [universalFields, setUniversalFields] = React.useState<string[]>([]);
  const [campaignFields, setCampaignFields] = React.useState<Record<string, string[]>>({});
  const [globalDispositions, setGlobalDispositions] = React.useState<Disposition[]>([]);
  const [globalSubDispositions, setGlobalSubDispositions] = React.useState<SubDisposition[]>([]);
  const [campaignDispositions, setCampaignDispositions] = React.useState<Record<string, Disposition[]>>({});
  const [campaignSubDispositions, setCampaignSubDispositions] = React.useState<Record<string, SubDisposition[]>>({});
  
  // UI State
  const [newUniversalField, setNewUniversalField] = React.useState('');
  const [newCampaignField, setNewCampaignField] = React.useState('');
  const [newDisposition, setNewDisposition] = React.useState('');
  const [newSubDisposition, setNewSubDisposition] = React.useState('');
  const [selectedCustomFieldCampaign, setSelectedCustomFieldCampaign] = React.useState('');
  const [selectedDispositionCampaign, setSelectedDispositionCampaign] = React.useState('');

  const uniqueCampaigns = Object.keys(campaignFields);
  
  React.useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      try {
        const [gSettings, uFields, cFields, gDispos, gSubDispos, cDispos, cSubDispos] = await Promise.all([
          getGeofenceSettings(),
          getUniversalCustomFields(),
          getCampaignCustomFields(),
          getGlobalDispositions(),
          getGlobalSubDispositions(),
          getCampaignDispositions(),
          getCampaignSubDispositions(),
        ]);
        
        setGeofenceSettings(gSettings);
        setUniversalFields(uFields);
        setCampaignFields(cFields);
        setGlobalDispositions(gDispos);
        setGlobalSubDispositions(gSubDispos);
        setCampaignDispositions(cDispos);
        setCampaignSubDispositions(cSubDispos);

        if (Object.keys(cFields).length > 0) {
          const firstCampaign = Object.keys(cFields)[0];
          setSelectedCustomFieldCampaign(firstCampaign);
          setSelectedDispositionCampaign(firstCampaign);
        }
      } catch (error) {
        toast({ title: "Failed to load settings", description: "Could not fetch account and settings data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, [toast]);

  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    values: {
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      role: currentUser?.role || 'caller',
    },
  })

  async function onProfileSubmit(data: z.infer<typeof ProfileFormSchema>) {
    // NOTE: This form is for display. Actual user edits happen in the User Management page.
    // If you want profile editing here, a new server action would be needed.
    toast({
        title: 'Display Only',
        description: `Profile editing is handled in the "Users" page by an administrator.`,
      })
  }

  const handleSaveChanges = async (type: 'universal' | 'campaign' | 'dispositions') => {
    if (!currentUser) return;
    setIsSubmitting(true);
    let promise;
    let title = '';

    try {
      switch (type) {
        case 'universal':
          promise = saveUniversalCustomFields(universalFields);
          title = 'Universal Fields Saved!';
          break;
        case 'campaign':
          promise = saveCampaignCustomFields(campaignFields);
          title = 'Campaign Fields Saved!';
          break;
        case 'dispositions':
          promise = Promise.all([
            saveGlobalDispositions(globalDispositions),
            saveGlobalSubDispositions(globalSubDispositions),
            saveCampaignDispositions(campaignDispositions, currentUser.id),
            saveCampaignSubDispositions(campaignSubDispositions)
          ]);
          title = 'Dispositions Saved!';
          break;
      }
      await promise;
      toast({ title });
      router.refresh();
    } catch (error: any) {
      toast({ title: "Save Failed", description: error.message || `Could not save ${type}.`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !currentUser) {
    return <Skeleton className="h-[500px] w-full" />;
  }
  
  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Account & Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application settings.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="dispositions">Dispositions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is your current user profile. Editing is handled by admins in User Management.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John Doe" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="user@email.com" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                        <Input placeholder="1234567890" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="caller">Caller</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit">
                Save Changes (Disabled)
              </Button>
            </CardFooter>
            </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
                <CardTitle>Geofencing Configuration</CardTitle>
                <CardDescription>
                    Define the operational area for your team. Only admins can modify this.
                </CardDescription>
            </CardHeader>
            {geofenceSettings ? (
                <GeofenceSettingsForm settings={geofenceSettings} currentUser={currentUser} />
            ) : (
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                  </div>
                </CardContent>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="custom-fields">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Universal Custom Fields</CardTitle>
                  <CardDescription>
                    These fields will appear for all leads, regardless of their campaign.
                  </CardDescription>
                </div>
                 {currentUser.role === 'admin' && <Button size="sm" onClick={() => handleSaveChanges('universal')} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {universalFields.map(field => (
                    <Badge key={field} variant="secondary" className="text-base py-1 pl-3 pr-2">
                      {field}
                      {currentUser.role === 'admin' && <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => setUniversalFields(prev => prev.filter(f => f !== field))}><X className="h-3 w-3" /></Button>}
                    </Badge>
                  ))}
                </div>
                 {currentUser.role === 'admin' && <div className="flex items-center gap-2">
                    <Input 
                        placeholder="New universal field..."
                        value={newUniversalField}
                        onChange={(e) => setNewUniversalField(e.target.value)}
                        className="h-9 max-w-xs"
                    />
                    <Button size="sm" onClick={() => { if(newUniversalField.trim()) { setUniversalFields(p => [...p, newUniversalField.trim()]); setNewUniversalField(''); } }}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                 </div>}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Campaign-Specific Custom Fields</CardTitle>
                  <CardDescription>
                    Define custom fields that only apply to leads within a specific campaign.
                  </CardDescription>
                </div>
                {currentUser.role === 'admin' && <Button size="sm" onClick={() => handleSaveChanges('campaign')} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-xs">
                    <Label htmlFor="campaign-select-custom-fields">Select a Campaign</Label>
                     <Select value={selectedCustomFieldCampaign} onValueChange={setSelectedCustomFieldCampaign}>
                        <SelectTrigger id="campaign-select-custom-fields">
                            <SelectValue placeholder="Select a campaign..." />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueCampaigns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {selectedCustomFieldCampaign && (
                    <div className="border-t pt-4 mt-4">
                         <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /> Fields for "{selectedCustomFieldCampaign}"</h4>
                         <div className="flex flex-wrap gap-2">
                            {(campaignFields[selectedCustomFieldCampaign] || []).map(field => (
                                <Badge key={field} variant="outline" className="text-base py-1 pl-3 pr-2">
                                    {field}
                                    {currentUser.role === 'admin' && <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => setCampaignFields(p => ({...p, [selectedCustomFieldCampaign]: p[selectedCustomFieldCampaign].filter(f => f !== field)}))}><X className="h-3 w-3" /></Button>}
                                </Badge>
                            ))}
                        </div>
                        {currentUser.role === 'admin' && <div className="flex items-center gap-2 mt-4">
                            <Input
                                placeholder={`New field for ${selectedCustomFieldCampaign}...`}
                                value={newCampaignField}
                                onChange={(e) => setNewCampaignField(e.target.value)}
                                className="h-9 max-w-xs"
                            />
                            <Button size="sm" onClick={() => { if(newCampaignField.trim()) { setCampaignFields(p => ({...p, [selectedCustomFieldCampaign]: [...(p[selectedCustomFieldCampaign] || []), newCampaignField.trim()] })); setNewCampaignField(''); } }}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                        </div>}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
         <TabsContent value="dispositions">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Dispositions</CardTitle>
                <CardDescription>
                  Manage global and campaign-specific dispositions. Only admins can make changes.
                </CardDescription>
              </div>
              {currentUser.role === 'admin' && <Button size="sm" onClick={() => handleSaveChanges('dispositions')} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> Save All Dispositions</Button>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-semibold">Global Dispositions</h4>
                        <div className="flex flex-wrap gap-2">
                            {globalDispositions.map(d => (
                                <Badge key={d} variant="secondary" className="text-base py-1 pl-3 pr-2">
                                    {d}
                                    {currentUser.role === 'admin' && <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20" onClick={() => setGlobalDispositions(p => p.filter(item => item !== d))}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                                </Badge>
                            ))}
                        </div>
                        <Separator />
                        {currentUser.role === 'admin' && <div className="flex items-center gap-2">
                            <Input placeholder="New global disposition..." value={newDisposition} onChange={(e) => setNewDisposition(e.target.value)} className="h-9" />
                            <Button size="sm" onClick={() => { if(newDisposition.trim()) { setGlobalDispositions(p => [...p, newDisposition.trim() as Disposition]); setNewDisposition('')}}}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                        </div>}
                    </div>
                    <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-semibold">Global Sub-Dispositions</h4>
                        <div className="flex flex-wrap gap-2">
                            {globalSubDispositions.map(d => (
                                <Badge key={d} variant="outline" className="text-base py-1 pl-3 pr-2">
                                    {d}
                                    {currentUser.role === 'admin' && <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20" onClick={() => setGlobalSubDispositions(p => p.filter(item => item !== d))}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                                </Badge>
                            ))}
                        </div>
                        <Separator />
                        {currentUser.role === 'admin' && <div className="flex items-center gap-2">
                            <Input placeholder="New global sub-disposition..." value={newSubDisposition} onChange={(e) => setNewSubDisposition(e.target.value)} className="h-9" />
                            <Button size="sm" onClick={() => { if(newSubDisposition.trim()) { setGlobalSubDispositions(p => [...p, newSubDisposition.trim() as SubDisposition]); setNewSubDisposition('')}}}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                        </div>}
                    </div>
                </div>

                <Separator />
                
               <div className="max-w-xs">
                    <Label htmlFor="campaign-select-dispositions">Manage Campaign-Specific Dispositions</Label>
                     <Select value={selectedDispositionCampaign} onValueChange={setSelectedDispositionCampaign}>
                        <SelectTrigger id="campaign-select-dispositions">
                            <SelectValue placeholder="Select a campaign..." />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueCampaigns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {selectedDispositionCampaign && (
                  <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-semibold">Dispositions for "{selectedDispositionCampaign}"</h4>
                      <div className="flex flex-wrap gap-2">
                        {(campaignDispositions[selectedDispositionCampaign] || []).map(d => (
                           <Badge key={d} variant="secondary" className="text-base py-1 pl-3 pr-2">
                              {d}
                              {currentUser.role === 'admin' && <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20" onClick={() => setCampaignDispositions(p => ({ ...p, [selectedDispositionCampaign]: p[selectedDispositionCampaign].filter(item => item !== d) }))}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                            </Badge>
                        ))}
                      </div>
                      <Separator />
                       {currentUser.role === 'admin' && <div className="flex items-center gap-2">
                            <Input placeholder="New disposition..." value={newDisposition} onChange={(e) => setNewDisposition(e.target.value)} className="h-9" />
                            <Button size="sm" onClick={() => {if(newDisposition.trim()){ setCampaignDispositions(p => ({...p, [selectedDispositionCampaign]: [...(p[selectedDispositionCampaign] || []), newDisposition.trim() as Disposition]})); setNewDisposition('')}}}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                        </div>}
                    </div>

                     <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-semibold">Sub-Dispositions for "{selectedDispositionCampaign}"</h4>
                       <div className="flex flex-wrap gap-2">
                        {(campaignSubDispositions[selectedDispositionCampaign] || []).map(d => (
                           <Badge key={d} variant="outline" className="text-base py-1 pl-3 pr-2">
                              {d}
                              {currentUser.role === 'admin' && <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20" onClick={() => setCampaignSubDispositions(p => ({ ...p, [selectedDispositionCampaign]: p[selectedDispositionCampaign].filter(item => item !== d) }))}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                            </Badge>
                        ))}
                      </div>
                      <Separator />
                      {currentUser.role === 'admin' && <div className="flex items-center gap-2">
                            <Input placeholder="New sub-disposition..." value={newSubDisposition} onChange={(e) => setNewSubDisposition(e.target.value)} className="h-9" />
                            <Button size="sm" onClick={() => {if(newSubDisposition.trim()){ setCampaignSubDispositions(p => ({...p, [selectedDispositionCampaign]: [...(p[selectedDispositionCampaign] || []), newSubDisposition.trim() as SubDisposition]})); setNewSubDisposition('')}}}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                        </div>}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
