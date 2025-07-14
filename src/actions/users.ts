
'use server'

import { db, auth } from '@/lib/firebase';
import type { User, Disposition } from "@/lib/types"
import { headers } from 'next/headers';

// Verify user identity from token
async function verifyUser(idToken: string, requiredRole?: 'admin' | 'caller'): Promise<User> {
    if (!auth || !db) throw new Error("Authentication services not available.");
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
        throw new Error("User not found in database.");
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (requiredRole && user.role !== requiredRole) {
        throw new Error(`Unauthorized: User does not have the required role ('${requiredRole}').`);
    }

    if (user.status !== 'active') {
        throw new Error("User account is not active.");
    }
    
    return user;
}

export async function getUsers(): Promise<User[]> {
  if (!db) throw new Error("Database not configured.");
  
  const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getCallers(): Promise<User[]> {
  if (!db) throw new Error("Database not configured.");
  
  const snapshot = await db.collection('users')
    .where('role', '==', 'caller')
    .where('status', '==', 'active')
    .get();
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getAuthenticatedUser(idToken: string) {
  const user = await verifyUser(idToken);
  return { user };
}

export async function toggleUserStatus(userId: string) {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  const currentUser = await verifyUser(idToken, 'admin');

  if (!db) throw new Error("Database not configured.");

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error("User not found.");
  }

  const userData = userDoc.data() as User;
  const newStatus = userData.status === 'active' ? 'inactive' : 'active';
  
  await userRef.update({
    status: newStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.name
  });

  return { ...userData, id: userDoc.id, status: newStatus };
}

export async function approveUser(userId: string) {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  const currentUser = await verifyUser(idToken, 'admin');

  if (!db) throw new Error("Database not configured.");

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error("User not found.");
  }

  const userData = userDoc.data() as User;
  
  await userRef.update({
    status: 'active',
    updatedAt: new Date().toISOString(),
    approvedBy: currentUser.name
  });

  return { ...userData, id: userDoc.id, status: 'active' as const };
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  const currentUser = await verifyUser(idToken, 'admin');

  if (!db) throw new Error("Database not configured.");

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error("User not found.");
  }

  await userRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.name
  });

  const updatedDoc = await userRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

export async function addUser(newUser: Omit<User, 'id' | 'createdAt' | 'status'>) {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  const currentUser = await verifyUser(idToken, 'admin');

  if (!db || !auth) throw new Error("Database or auth not configured.");

  // Create user in Firebase Auth
  const userRecord = await auth.createUser({
    email: newUser.email,
    password: newUser.password,
    displayName: newUser.name,
    phoneNumber: newUser.phone,
  });

  // Create user document in Firestore
  const userData = {
    ...newUser,
    createdAt: new Date().toISOString(),
    status: 'pending' as const,
    createdBy: currentUser.name
  };

  await db.collection('users').doc(userRecord.uid).set(userData);

  return { id: userRecord.uid, ...userData };
}

// Keep createUser as an alias for backward compatibility
export const createUser = addUser;

export async function getLoginActivity(): Promise<any[]> {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  await verifyUser(idToken, 'admin');

  if (!db) throw new Error("Database not configured.");

  // Return empty array for now - this can be implemented later
  return [];
}
