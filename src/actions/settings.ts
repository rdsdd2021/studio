'use server'

import { db } from "@/lib/firebase";

export interface GeofenceSettings {
    centerLocation: string;
    radius: number;
}

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
    const doc = await db.collection('settings').doc('geofence').get();
    if (!doc.exists) {
        return { centerLocation: '', radius: 5000 };
    }
    const data = doc.data() as GeofenceSettings;
    return data;
}

export async function saveGeofenceSettings(settings: GeofenceSettings): Promise<void> {
    await db.collection('settings').doc('geofence').set(settings);
}
