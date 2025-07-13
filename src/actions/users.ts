'use server'

import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { FieldValue } from "firebase-admin/firestore";

async function docToUser(doc: FirebaseFirestore.DocumentSnapshot): Promise<User> {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        role: data.role,
        status: data.status,
        createdAt: (data.createdAt.toDate()).toISOString(),
        avatar: data.avatar,
    };
}

export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const userRef = db.collection('users').doc(userId);
  await userRef.update(data);
  const updatedDoc = await userRef.get();
  
  revalidatePath('/users');
  return docToUser(updatedDoc);
}

export async function addUser(data: Omit<User, 'id' | 'createdAt' | 'avatar' | 'status'>): Promise<User> {
  const newUserRef = db.collection('users').doc();
  const newUser: Omit<User, 'id'> = {
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    avatar: `https://placehold.co/32x32.png`,
  };
  
  // Convert ISO string to Firestore Timestamp for createdAt
  const { createdAt, ...restOfUser } = newUser;
  const dataToSet = {
    ...restOfUser,
    createdAt: FieldValue.serverTimestamp()
  }

  await newUserRef.set(dataToSet);

  revalidatePath('/users');
  return { id: newUserRef.id, ...newUser };
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
    
    const updatedDoc = await userRef.get();
    revalidatePath('/users');
    return docToUser(updatedDoc);
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

    const updatedDoc = await userRef.get();
    revalidatePath('/users');
    return docToUser(updatedDoc);
}
