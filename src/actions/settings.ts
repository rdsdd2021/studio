'use server'

import { getDb } from "@/lib/firebase";

export interface GeofenceSettings {
    centerLocation: string;
    radius: number;
}

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
    const db = getDb();
    const doc = await db.collection('settings').doc('geofence').get();
    if (!doc.exists) {
        return { centerLocation: '', radius: 5000 };
    }
    const data = doc.data() as GeofenceSettings;
    return data;
}

export async function saveGeofenceSettings(settings: GeofenceSettings): Promise<void> {
    const db = getDb();
    await db.collection('settings').doc('geofence').set(settings);
}
