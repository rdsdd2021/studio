'use server'

import { users } from "@/lib/data"
import type { User } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }

  const updatedUser = { ...users[userIndex], ...data };
  users[userIndex] = updatedUser;

  revalidatePath('/users');
  return updatedUser;
}

export async function addUser(data: Omit<User, 'id' | 'createdAt' | 'avatar' | 'status'>): Promise<User> {
  const newUser: User = {
    id: `usr_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    avatar: `https://placehold.co/32x32.png`,
  };

  users.unshift(newUser);
  revalidatePath('/users');
  return newUser;
}

export async function toggleUserStatus(userId: string): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }

    const currentStatus = users[userIndex].status;
    users[userIndex].status = currentStatus === 'active' ? 'inactive' : 'active';

    revalidatePath('/users');
    return users[userIndex];
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
    return users[userIndex];
}
