'use server'

import { users } from "@/lib/data"
import type { User } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  
  users[userIndex] = { ...users[userIndex], ...data };
  
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(users[userIndex]));
}

export async function addUser(data: Omit<User, 'id' | 'createdAt' | 'avatar' | 'status'>): Promise<User> {
  const newUser: User = {
    id: `usr_${Date.now()}`,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    avatar: `https://placehold.co/32x32.png`,
  };
  
  users.unshift(newUser);

  revalidatePath('/users');
  return JSON.parse(JSON.stringify(newUser));
}

export async function toggleUserStatus(userId: string): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }
    const currentStatus = users[userIndex].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    users[userIndex].status = newStatus;
    
    revalidatePath('/users');
    return JSON.parse(JSON.stringify(users[userIndex]));
}

export async function approveUser(userId: string): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }

    if (users[userIndex].status === 'pending') {
        users[userIndex].status = 'active';
    }

    revalidatePath('/users');
    return JSON.parse(JSON.stringify(users[userIndex]));
}
