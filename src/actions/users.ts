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

export async function toggleUserStatus(userId: string, currentStatus: boolean): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found");
    }

    users[userIndex].active = !currentStatus;

    revalidatePath('/users');
    return users[userIndex];
}
