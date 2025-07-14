
'use client';
import * as React from 'react';
import { supabase } from '@/lib/client-supabase';
import type { User } from '@/lib/types';
import { getAuthenticatedUser } from '@/actions/users';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        fetchUserData(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.access_token) {
        await fetchUserData(session.access_token);
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchUserData = async (accessToken: string) => {
    try {
      // Check if we already have the user data in localStorage to avoid flashes
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      }

      const { user: appUser } = await getAuthenticatedUser(accessToken);
      setUser(appUser);
      localStorage.setItem('currentUser', JSON.stringify(appUser));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch authenticated user data", error);
      await signOut();
      router.push('/login');
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('currentUser');
    }
  };

  // Set up fetch interceptor for authorization
  React.useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const newInit = { ...init };
      
      if (session?.access_token) {
        newInit.headers = {
          ...newInit.headers,
          Authorization: `Bearer ${session.access_token}`,
        };
      }
      
      return originalFetch(input, newInit);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
