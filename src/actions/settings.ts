
'use server'

import { db, auth } from '@/lib/firebase';
import type { User } from "@/lib/types"
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
        throw new Error(`Unauthorized: User does not have the required role ('${requiredRole}').`);
    }

    if (user.status !== 'active') {
        throw new Error("User account is not active.");
    }
    
    return user;
}

export async function getUniversalCustomFields(): Promise<string[]> {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  await verifyUser(idToken);

  // Return static custom fields for now
  return [
    'Emergency Contact',
    'Age',
    'Experience Level',
    'Interests',
    'Source',
    'Budget Range',
    'Preferred Time',
    'Special Requirements'
  ];
}

export async function getCampaignCustomFields(): Promise<Record<string, string[]>> {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  await verifyUser(idToken);

  // Return static campaign-specific custom fields for now
  return {
    'Summer Fest 2024': [
      'Activity Preference',
      'Previous Participation',
      'Team Size',
      'Skill Level',
      'Equipment Needed'
    ],
    'Diwali Dhamaka': [
      'Performance Type',
      'Group Size',
      'Duration Preference',
      'Previous Experience',
      'Cultural Background'
    ],
    'New Year Special': [
      'Resolution Goals',
      'Commitment Level',
      'Start Date',
      'Package Preference',
      'Referral Source'
    ]
  };
}

export async function getSettings() {
  const headersList = await headers();
  const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!idToken) {
    throw new Error("No authentication token found.");
  }

  await verifyUser(idToken);

  // Return static settings for now
  return {
    dispositions: ['New', 'Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'],
    subDispositions: ['Initial', 'Hot Lead', 'Warm Lead', 'Cold Lead', 'Converted', 'Not Qualified'],
    campaigns: ['Summer Fest 2024', 'Diwali Dhamaka', 'New Year Special'],
    customFields: await getUniversalCustomFields(),
    campaignCustomFields: await getCampaignCustomFields()
  };
}

// Static disposition and sub-disposition mappings for campaigns
export async function getCampaignDispositions(): Promise<Record<string, string[]>> {
  return {
    'Summer Fest 2024': ['Interested', 'Follow-up', 'Callback', 'Not Interested'],
    'Diwali Dhamaka': ['Interested', 'Not Interested', 'Callback', 'Not Reachable'],
    'New Year Special': ['Interested', 'Follow-up', 'Not Interested', 'Callback']
  };
}

export async function getCampaignSubDispositions(): Promise<Record<string, string[]>> {
  return {
    'Summer Fest 2024': ['Hot Lead', 'Warm Lead', 'Cold Lead'],
    'Diwali Dhamaka': ['Initial', 'Follow-up Required', 'Decision Pending'],
    'New Year Special': ['Qualified', 'Needs More Info', 'Price Sensitive']
  };
}
