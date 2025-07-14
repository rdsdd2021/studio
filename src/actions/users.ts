
'use server'

import { db, auth } from '@/lib/firebase';
import type { User, LoginActivity } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { headers } from 'next/headers';

async function verifyUser(idToken: string, requiredRole?: 'admin' | 'caller'): Promise<User> {
    if (!auth || !db) throw new Error("Authentication services not available.");
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
        throw new Error("User not found in database.");
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (requiredRole && user.role !== requiredRole) {
        throw new Error(`Unauthorized: User does not have the required role ('${required_role}').`);
    }

    if (user.status !== 'active') {
        throw new Error("User account is not active.");
    }
    
    return user;
}

async function getVerifiedAdmin(idToken: string): Promise<User> {
    return verifyUser(idToken, 'admin');
}

export async function getUsers(): Promise<User[]> {
    if (!db) {
        console.warn('DB not configured, returning empty list for users.');
        return [];
    }
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getLoginActivity(): Promise<LoginActivity[]> {
    if (!db) {
        console.warn('DB not configured, returning empty list for login activity.');
        return [];
    }
    const snapshot = await db.collection('loginActivity').orderBy('timestamp', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoginActivity));
}


export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1];
  if (!idToken || !db || !auth) throw new Error("Authentication required.");
  
  const adminUser = await getVerifiedAdmin(idToken);
  
  if (userId === adminUser.id) {
    throw new Error("Admins cannot edit their own roles or status via this function.");
  }

  const userRef = db.collection('users').doc(userId);
  await userRef.update({ ...data });

  await auth.setCustomUserClaims(userId, { role: data.role });
  
  revalidatePath('/users');
  const updatedDoc = await userRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

export async function addUser(data: Omit<User, 'id' | 'createdAt' | 'avatar' | 'status' | 'password'>): Promise<User> {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken || !db || !auth) throw new Error("Authentication required.");
    await getVerifiedAdmin(idToken);
    
    const userRecord = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
        disabled: true, // User starts as 'pending', so disable auth until approved.
    });

    const newUser: Omit<User, 'id' | 'avatar'> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
  
    await db.collection('users').doc(userRecord.uid).set(newUser);
    await auth.setCustomUserClaims(userRecord.uid, { role: data.role });

    revalidatePath('/users');
    return { id: userRecord.uid, ...newUser, avatar: '' };
}

export async function toggleUserStatus(userId: string): Promise<User> {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken || !db || !auth) throw new Error("Authentication required.");

    const adminUser = await getVerifiedAdmin(idToken);
    if (userId === adminUser.id) {
      throw new Error("Admins cannot change their own status.");
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }
    const currentStatus = userDoc.data()?.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    await userRef.update({ status: newStatus });
    await auth.updateUser(userId, { disabled: newStatus !== 'active' });

    revalidatePath('/users');
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

export async function approveUser(userId: string): Promise<User> {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken || !db || !auth) throw new Error("Authentication required.");
    await getVerifiedAdmin(idToken);
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }

    if (userDoc.data()?.status === 'pending') {
        await userRef.update({ status: 'active' });
        await auth.updateUser(userId, { disabled: false });
    }

    revalidatePath('/users');
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

// This action is called by the client after a successful Firebase Auth login
// to get the user's custom data (like role and status) from Firestore.
export async function getAuthenticatedUser(idToken: string): Promise<{user: User}> {
    if (!auth || !db) throw new Error("Authentication services not available.");
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
        throw new Error("User profile not found in database.");
    }
    
    const user = { id: userDoc.id, ...userDoc.data() } as User;
    
    if (user.status !== 'active') {
        throw new Error(`Your account is currently ${user.status}. Please contact an administrator.`);
    }

    return { user };
}
