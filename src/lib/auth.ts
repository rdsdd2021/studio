
'use server';

import { db, auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { headers } from 'next/headers';

export async function getServerUser(): Promise<User | null> {
  try {
    const headersList = await headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken || !auth || !db) {
      return null;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;
    
    if (user.status !== 'active') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}
