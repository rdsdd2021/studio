
'use server'

import { supabase } from '@/lib/supabase';
import type { User } from "@/lib/types"
import { verifyUser } from '@/lib/auth';
import { headers } from 'next/headers';

// Types for settings
export interface GeofenceSettings {
  enabled: boolean;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  allowedUsers: string[];
}

export async function getUniversalCustomFields(): Promise<string[]> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token);

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

export async function saveUniversalCustomFields(fields: string[]): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving universal custom fields:', fields);
}

export async function getCampaignCustomFields(): Promise<Record<string, string[]>> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token);

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

export async function saveCampaignCustomFields(fields: Record<string, string[]>): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving campaign custom fields:', fields);
}

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // Return default geofence settings
  return {
    enabled: false,
    latitude: 0,
    longitude: 0,
    radius: 1000,
    allowedUsers: []
  };
}

export async function saveGeofenceSettings(settings: GeofenceSettings): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving geofence settings:', settings);
}

export async function getGlobalDispositions(): Promise<string[]> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token);

  return ['New', 'Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
}

export async function saveGlobalDispositions(dispositions: string[]): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving global dispositions:', dispositions);
}

export async function getGlobalSubDispositions(): Promise<string[]> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token);

  return ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];
}

export async function saveGlobalSubDispositions(subDispositions: string[]): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving global sub-dispositions:', subDispositions);
}

export async function getSettings() {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token);

  // Return static settings for now
  return {
    dispositions: await getGlobalDispositions(),
    subDispositions: await getGlobalSubDispositions(),
    campaigns: ['Summer Fest 2024', 'Diwali Dhamaka', 'New Year Special'],
    customFields: await getUniversalCustomFields(),
    campaignCustomFields: await getCampaignCustomFields(),
    geofence: await getGeofenceSettings()
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

export async function saveCampaignDispositions(dispositions: Record<string, string[]>): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving campaign dispositions:', dispositions);
}

export async function getCampaignSubDispositions(): Promise<Record<string, string[]>> {
  return {
    'Summer Fest 2024': ['Hot Lead', 'Warm Lead', 'Cold Lead'],
    'Diwali Dhamaka': ['Initial', 'Follow-up Required', 'Decision Pending'],
    'New Year Special': ['Qualified', 'Needs More Info', 'Price Sensitive']
  };
}

export async function saveCampaignSubDispositions(subDispositions: Record<string, string[]>): Promise<void> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  await verifyUser(token, 'admin');

  // TODO: Implement saving to database
  console.log('Saving campaign sub-dispositions:', subDispositions);
}
