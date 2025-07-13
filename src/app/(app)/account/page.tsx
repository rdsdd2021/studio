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
import type { User } from '@/lib/types'
import { users } from '@/lib/data'
import { useRouter } from 'next/navigation'

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Phone must be at least 10 digits.' }),
  role: z.enum(['admin', 'caller'], { required_error: 'Please select a role.' }),
})

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


  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Account & Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application settings.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
