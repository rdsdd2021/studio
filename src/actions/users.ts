'use server'

import { db } from '@/lib/firebase';
import type { User } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function getUsers(): Promise<User[]> {
    const snapshot = await db.collection('users').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const userRef = db.collection('users').doc(userId);
  
  await userRef.update({ ...data });
  
  revalidatePath('/users');
  const updatedDoc = await userRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

export async function addUser(data: Omit<User, 'id' | 'createdAt' | 'avatar' | 'status'>): Promise<User> {
  const newUser: Omit<User, 'id'> = {
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    avatar: `https://placehold.co/32x32.png`,
  };
  
  const docRef = await db.collection('users').add(newUser);

  revalidatePath('/users');
  return { id: docRef.id, ...newUser };
}

export async function toggleUserStatus(userId: string): Promise<User> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }
    const currentStatus = userDoc.data()?.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    await userRef.update({ status: newStatus });
    
    revalidatePath('/users');
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

export async function approveUser(userId: string): Promise<User> {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }

    if (userDoc.data()?.status === 'pending') {
        await userRef.update({ status: 'active' });
    }

    revalidatePath('/users');
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}
