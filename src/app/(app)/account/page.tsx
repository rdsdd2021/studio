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
import { useForm } from 'react-hook-form'
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
import { updateUser } from '@/actions/users'
import type { Disposition, SubDisposition, User } from '@/lib/types'
import { leads, users } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Tag, Trash2, X } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Phone must be at least 10 digits.' }),
  role: z.enum(['admin', 'caller'], { required_error: 'Please select a role.' }),
})

const uniqueCampaigns = Array.from(new Set(leads.map(l => l.campaign).filter(Boolean)));
const globalDispositions: Disposition[] = ['Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
const globalSubDispositions: SubDisposition[] = ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];


export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // In a real app, you'd get the current user from session/auth context
  const user = users.find(u => u.role === 'admin') as User;
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true)
    try {
      await updateUser(user.id, data)
      toast({
        title: 'Profile Updated!',
        description: `Your details have been updated successfully.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mock state for custom fields/dispositions UI - in a real app this would come from a DB
  const [universalFields, setUniversalFields] = React.useState(['Source', 'Previous Course']);
  const [campaignFields, setCampaignFields] = React.useState<Record<string, string[]>>({
    'Summer Fest 2024': ["Parent's Name", 'Discount Code'],
    'Diwali Dhamaka': ["Reference ID"],
  });
  const [selectedCustomFieldCampaign, setSelectedCustomFieldCampaign] = React.useState(uniqueCampaigns[0] || '');

  const [campaignDispositions, setCampaignDispositions] = React.useState<Record<string, Disposition[]>>({
     'Summer Fest 2024': ['Interested', 'Follow-up', 'Callback', 'Application Started'],
     'Diwali Dhamaka': ['Interested', 'Not Interested', 'Callback', 'Wrong Number'],
  });
   const [campaignSubDispositions, setCampaignSubDispositions] = React.useState<Record<string, SubDisposition[]>>({
     'Summer Fest 2024': ['Paid', 'Trial Class Booked', 'Sent Brochure'],
     'Diwali Dhamaka': ['Call Back Tomorrow', 'Price Issue'],
  });
  const [selectedDispositionCampaign, setSelectedDispositionCampaign] = React.useState(uniqueCampaigns[0] || '');


  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Account & Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application settings.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
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
                Make changes to your public profile here. Click save when you're done.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
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
                        <Input placeholder="1234567890" {...field} disabled={isSubmitting}/>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
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
                    Define the operational area for your team. Users logging in outside this area can be flagged or restricted.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="center-location">Center Location</Label>
                        <Input id="center-location" placeholder="e.g., Connaught Place, New Delhi" defaultValue="Connaught Place, New Delhi" />
                    </div>
                    <div>
                        <Label htmlFor="radius">Radius (in meters)</Label>
                        <Input id="radius" placeholder="e.g., 5000" defaultValue="5000" type="number" />
                    </div>
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
                <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="custom-fields">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Universal Custom Fields</CardTitle>
                <CardDescription>
                  These fields will appear for all leads, regardless of their campaign.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {universalFields.map(field => (
                    <Badge key={field} variant="secondary" className="text-base py-1 pl-3 pr-2">
                      {field}
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1"><X className="h-3 w-3" /></Button>
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Universal Field</Button>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Campaign-Specific Custom Fields</CardTitle>
                <CardDescription>
                  Define custom fields that only apply to leads within a specific campaign.
                </CardDescription>
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
                                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1"><X className="h-3 w-3" /></Button>
                                </Badge>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Field for Campaign</Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
         <TabsContent value="dispositions">
          <Card>
            <CardHeader>
              <CardTitle>Campaign-Specific Dispositions</CardTitle>
              <CardDescription>
                Customize dispositions and sub-dispositions for each campaign. If a campaign is not configured, it will use the global defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="max-w-xs">
                    <Label htmlFor="campaign-select-dispositions">Select a Campaign</Label>
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
                    {/* Dispositions Card */}
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-semibold">Dispositions for "{selectedDispositionCampaign}"</h4>
                      <div className="flex flex-wrap gap-2">
                        {(campaignDispositions[selectedDispositionCampaign] || globalDispositions).map(d => (
                           <Badge key={d} variant="secondary" className="text-base py-1 pl-3 pr-2">
                              {d}
                              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Disposition</Button>
                    </div>

                    {/* Sub-Dispositions Card */}
                     <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-semibold">Sub-Dispositions for "{selectedDispositionCampaign}"</h4>
                       <div className="flex flex-wrap gap-2">
                        {(campaignSubDispositions[selectedDispositionCampaign] || globalSubDispositions).map(d => (
                           <Badge key={d} variant="outline" className="text-base py-1 pl-3 pr-2">
                              {d}
                              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            </Badge>
                        ))}
                      </div>
                       <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Sub-Disposition</Button>
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
