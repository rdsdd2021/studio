
'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  getAuth,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'
import { app } from '@/lib/client-firebase' // Import client-side firebase app
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LeadsFlowLogo } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAuthenticatedUser } from '@/actions/users'

// For this prototype, we'll use localStorage to simulate a logged-in user session.
function setSimulatedUserSession(user: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('rds2197@example.com'); // Default test user
  const [password, setPassword] = React.useState('password');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const auth = getAuth(app);

    try {
      await setPersistence(auth, browserLocalPersistence)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // After successful Firebase login, get our custom user data
      const { user } = await getAuthenticatedUser(idToken);
      
      // Store the combined user info for client-side access
      setSimulatedUserSession(user);

      router.push(`/dashboard`);
    } catch (error: any) {
        console.error("Login Error:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError("Invalid email or password.");
        } else {
            setError(error.message || "An unexpected error occurred. Please try again.");
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    // Clear any previous session on login page load
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }, []);

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
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
             <CardDescription className="text-center text-xs pt-2">
                Log in with a user from the User Management page.
             </CardDescription>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
