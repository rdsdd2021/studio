
'use server';

import { headers } from 'next/headers';
import { auth, db } from '@/lib/firebase';
import type { User } from './types';

// This is the primary server-side function to get the current authenticated user.
// It verifies the token sent from the client.
export async function getCurrentUser(): Promise<User | null> {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1];

  if (!idToken || !auth || !db) {
    return null;
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return null;
    }
    
    const user = { id: userDoc.id, ...userDoc.data() } as User;
    return user;
  } catch (error) {
    console.error("Error verifying token or fetching user:", error);
    return null;
  }
}
