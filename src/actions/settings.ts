'use server'

import { db } from '@/lib/firebase';
import type { FieldValue } from 'firebase-admin/firestore';

export interface GeofenceSettings {
    centerLocation: string;
    radius: number;
}

async function getSettingsDoc(key: string) {
    const docRef = db.collection('settings').doc(key);
    const doc = await docRef.get();
    return doc;
}

async function saveSettingsDoc(key: string, value: any) {
    const docRef = db.collection('settings').doc(key);
    await docRef.set({ value });
}

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
    const doc = await getSettingsDoc('geofence');
    if (doc.exists) {
        return doc.data()?.value as GeofenceSettings;
    }
    // Return default if not set
    return { centerLocation: 'Connaught Place, New Delhi', radius: 5000 };
}

export async function saveGeofenceSettings(settings: GeofenceSettings): Promise<void> {
    await saveSettingsDoc('geofence', settings);
    console.log("Saved geofence settings:", settings);
}

export async function getUniversalCustomFields(): Promise<string[]> {
    const doc = await getSettingsDoc('universalCustomFields');
    return doc.exists ? doc.data()?.value : ['Source', 'Previous Course'];
}

export async function getCampaignCustomFields(): Promise<Record<string, string[]>> {
    const doc = await getSettingsDoc('campaignCustomFields');
    return doc.exists ? doc.data()?.value : {
        'Summer Fest 2024': ["Parent's Name", 'Discount Code'],
        'Diwali Dhamaka': ["Reference ID"],
    };
}
