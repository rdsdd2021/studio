'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LeadsFlowLogo } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { users } from '@/lib/data'

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@leadsflow.com');
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // This is a mock authentication check.
    // In a real app, you would make an API call to your backend.
    const user = users.find(u => u.name.toLowerCase().replace(' ', '') + '@leadsflow.com' === email);

    if (!user) {
        setError("Invalid email or password.");
        return;
    }

    switch(user.status) {
        case 'pending':
            setError("Your account is awaiting admin approval. Please check back later.");
            break;
        case 'inactive':
            setError("Your account has been deactivated. Please contact an administrator.");
            break;
        case 'active':
            // In a real app, you'd also record the login event here.
            router.push('/dashboard');
            break;
        default:
            setError("An unknown error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <LeadsFlowLogo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Welcome to LeadsFlow</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password123" />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
