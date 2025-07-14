
'use server'

import { supabase } from '@/lib/supabase';
import type { User } from "@/lib/types"
import { convertDbUserToUser, convertUserToDbUser } from "@/lib/types"
import { verifyUser } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getUsers(): Promise<User[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return users?.map(convertDbUserToUser) || [];
}

export async function getCallers(): Promise<User[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'caller')
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to fetch callers: ${error.message}`);
  }

  return users?.map(convertDbUserToUser) || [];
}

export async function getAuthenticatedUser(token: string) {
  const user = await verifyUser(token);
  return { user };
}

export async function toggleUserStatus(userId: string) {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const currentUser = await verifyUser(token, 'admin');

  // Get current user data
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError || !userData) {
    throw new Error("User not found.");
  }

  const newStatus = userData.status === 'active' ? 'inactive' : 'active';
  
  const { data, error } = await supabase
    .from('users')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
      updated_by: currentUser.name
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle user status: ${error.message}`);
  }

  return convertDbUserToUser(data);
}

export async function approveUser(userId: string) {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const currentUser = await verifyUser(token, 'admin');

  const { data, error } = await supabase
    .from('users')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
      approved_by: currentUser.name
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to approve user: ${error.message}`);
  }

  return convertDbUserToUser(data);
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const currentUser = await verifyUser(token, 'admin');

  const dbUpdates = {
    ...(updates.name && { name: updates.name }),
    ...(updates.email && { email: updates.email }),
    ...(updates.phone && { phone: updates.phone }),
    ...(updates.role && { role: updates.role }),
    ...(updates.status && { status: updates.status }),
    ...(updates.avatar && { avatar: updates.avatar }),
    ...(updates.loginStatus && { login_status: updates.loginStatus }),
    updated_at: new Date().toISOString(),
    updated_by: currentUser.name
  };

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return convertDbUserToUser(data);
}

export async function addUser(newUser: Omit<User, 'id' | 'createdAt' | 'status'>) {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const currentUser = await verifyUser(token, 'admin');

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: newUser.email,
    password: newUser.password!,
    phone: newUser.phone,
    user_metadata: {
      name: newUser.name,
      role: newUser.role
    }
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create auth user: ${authError?.message || 'Unknown error'}`);
  }

  // Create user record in our users table
  const dbUser = {
    id: authData.user.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    status: 'pending' as const,
    avatar: newUser.avatar || null,
    login_status: null,
    created_by: currentUser.name
  };

  const { data, error } = await supabase
    .from('users')
    .insert([dbUser])
    .select()
    .single();

  if (error) {
    // If user table insert fails, clean up auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create user record: ${error.message}`);
  }

  return convertDbUserToUser(data);
}

// Keep createUser as an alias for backward compatibility
export const createUser = addUser;

export async function getLoginActivity(): Promise<any[]> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  const { data: activity, error } = await supabase
    .from('login_activity')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch login activity: ${error.message}`);
  }

  return activity || [];
}
