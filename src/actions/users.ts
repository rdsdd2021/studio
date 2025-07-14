
'use server'

import { db } from '@/lib/firebase';
import type { User, LoginActivity } from "@/lib/types"
import { revalidatePath } from "next/cache"

const MASTER_ADMIN: User = {
    id: 'master-admin-001',
    name: 'rds2197',
    email: 'ramanuj@dreamdesk.in',
    phone: '0000000000',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    avatar: `https://placehold.co/32x32.png`,
    password: 'Passw0rd'
};

export async function getUsers(): Promise<User[]> {
    if (!db) {
        console.warn('DB not configured, returning empty list for users.');
        return [MASTER_ADMIN];
    }
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [MASTER_ADMIN];
    }
    const dbUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    // Ensure master admin isn't duplicated if it somehow gets into the DB
    const filteredUsers = dbUsers.filter(user => user.email !== MASTER_ADMIN.email);
    return [MASTER_ADMIN, ...filteredUsers];
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

async function verifyAdmin(adminUserId: string) {
    if (adminUserId === MASTER_ADMIN.id) return;
    if (!db) throw new Error("Database not configured.");
    const adminUserDoc = await db.collection('users').doc(adminUserId).get();
    if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        throw new Error("Unauthorized: Only admins can perform this action.");
    }
}

export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>, adminUserId: string): Promise<User> {
  if (userId === MASTER_ADMIN.id) {
    throw new Error("The master admin user cannot be edited.");
  }
  if (!db) throw new Error("Database not configured.");
  await verifyAdmin(adminUserId);
  const userRef = db.collection('users').doc(userId);
  
  await userRef.update({ ...data });
  
  revalidatePath('/users');
  const updatedDoc = await userRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

export async function addUser(data: Omit<User, 'id' | 'createdAt' | 'avatar' | 'status'>, adminUserId: string): Promise<User> {
  if (!db) throw new Error("Database not configured.");
  await verifyAdmin(adminUserId);
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

export async function toggleUserStatus(userId: string, adminUserId: string): Promise<User> {
    if (userId === MASTER_ADMIN.id) {
        throw new Error("The master admin status cannot be changed.");
    }
    if (!db) throw new Error("Database not configured.");
    await verifyAdmin(adminUserId);
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

export async function approveUser(userId: string, adminUserId: string): Promise<User> {
    if (!db) throw new Error("Database not configured.");
    await verifyAdmin(adminUserId);
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


// This is a simulated login for the prototype.
// In a real app, use Firebase Auth for secure authentication.
export async function attemptLogin(email: string, password?: string): Promise<{ success: boolean; message: string; user?: User }> {
    // Check for Master Admin credentials first
    if (email.toLowerCase() === MASTER_ADMIN.email) {
        if (password === MASTER_ADMIN.password) {
            return { success: true, message: "Master Admin login successful!", user: MASTER_ADMIN };
        } else {
            return { success: false, message: "Invalid password for Master Admin." };
        }
    }

    if (!db) {
        return { success: false, message: "Database not configured. Cannot log in." };
    }
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

    if (snapshot.empty) {
        return { success: false, message: "Invalid email or password." };
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;
    
    // In a real app, you would verify a password hash. Here we do a plain text check.
    if (user.password !== password) {
        return { success: false, message: "Invalid email or password." };
    }

    switch(user.status) {
        case 'pending':
            return { success: false, message: "Your account is awaiting admin approval. Please check back later." };
        case 'inactive':
            return { success: false, message: "Your account has been deactivated. Please contact an administrator." };
        case 'active':
            return { success: true, message: "Login successful!", user: user };
        default:
            return { success: false, message: "An unknown error occurred. Please try again." };
    }
}
