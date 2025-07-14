
'use client';
import * as React from 'react';
import {
  getAuth,
  onIdTokenChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { app } from '@/lib/client-firebase';
import type { User } from '@/lib/types';
import { getAuthenticatedUser } from '@/actions/users';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Set up an interceptor for fetch to automatically add the auth token
const originalFetch = fetch;
let idToken: string | null = null;

globalThis.fetch = async (input, init) => {
  const newInit = { ...init };
  if (idToken) {
    newInit.headers = {
      ...newInit.headers,
      Authorization: `Bearer ${idToken}`,
    };
  }
  return originalFetch(input, newInit);
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    if (!app) {
        setLoading(false);
        return;
    }
    const auth = getAuth(app);
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        idToken = await fbUser.getIdToken();
        try {
          // Check if we already have the user data in localStorage to avoid flashes
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
              setUser(JSON.parse(storedUser));
          } else {
             const { user: appUser } = await getAuthenticatedUser(idToken);
             setUser(appUser);
             localStorage.setItem('currentUser', JSON.stringify(appUser));
          }
        } catch (error) {
          console.error("Failed to fetch authenticated user data", error);
          await firebaseSignOut(auth); // Sign out if custom user data fails
          setUser(null);
          idToken = null;
          localStorage.removeItem('currentUser');
          router.push('/login');
        }
      } else {
        setUser(null);
        idToken = null;
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signOut = async () => {
    if(app) {
        const auth = getAuth(app);
        await firebaseSignOut(auth);
    }
    setUser(null);
    setFirebaseUser(null);
    idToken = null;
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
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
