
'use server';

import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';
import { convertDbUserToUser } from '@/lib/types';
import { headers } from 'next/headers';

export async function getServerUser(): Promise<User | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Get user details from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    const appUser = convertDbUserToUser(userData);
    
    if (appUser.status !== 'active') {
      return null;
    }

    return appUser;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

export async function verifyUser(token: string, requiredRole?: 'admin' | 'caller'): Promise<User> {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  // Verify the JWT token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authentication token');
  }

  // Get user details from our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new Error('User not found in database');
  }

  const appUser = convertDbUserToUser(userData);

  if (requiredRole && appUser.role !== requiredRole) {
    throw new Error(`Unauthorized: User does not have the required role ('${requiredRole}')`);
  }

  if (appUser.status !== 'active') {
    throw new Error('User account is not active');
  }

  return appUser;
}
