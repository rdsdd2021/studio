
'use server'

import { db } from '@/lib/firebase';
import type { Disposition, SubDisposition } from '@/lib/types';

export interface GeofenceSettings {
    centerLocation: string;
    radius: number;
}

async function getSettingsDoc(key: string) {
    if (!db) return null;
    const docRef = db.collection('settings').doc(key);
    const doc = await docRef.get();
    return doc;
}

async function saveSettingsDoc(key: string, value: any, adminUserId: string) {
    if (!db) { throw new Error("Database not configured."); }
    const adminUserDoc = await db.collection('users').doc(adminUserId).get();
    if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
        throw new Error("Unauthorized: Only admins can save settings.");
    }
    const docRef = db.collection('settings').doc(key);
    await docRef.set({ value });
}

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
    const doc = await getSettingsDoc('geofence');
    if (doc?.exists) {
        return doc.data()?.value as GeofenceSettings;
    }
    return { centerLocation: 'Connaught Place, New Delhi', radius: 5000 };
}

export async function saveGeofenceSettings(settings: GeofenceSettings, adminUserId: string): Promise<void> {
    await saveSettingsDoc('geofence', settings, adminUserId);
}

export async function getUniversalCustomFields(): Promise<string[]> {
    const doc = await getSettingsDoc('universalCustomFields');
    if (doc?.exists) {
        return doc.data()?.value || [];
    }
    return ['Source', 'Previous Course'];
}

export async function saveUniversalCustomFields(fields: string[], adminUserId: string): Promise<void> {
    await saveSettingsDoc('universalCustomFields', fields, adminUserId);
}


export async function getCampaignCustomFields(): Promise<Record<string, string[]>> {
    const doc = await getSettingsDoc('campaignCustomFields');
    if (doc?.exists) {
        return doc.data()?.value || {};
    }
    return {
        'Summer Fest 2024': ["Parent's Name", 'Discount Code'],
        'Diwali Dhamaka': ["Reference ID"],
    };
}

export async function saveCampaignCustomFields(fields: Record<string, string[]>, adminUserId: string): Promise<void> {
    await saveSettingsDoc('campaignCustomFields', fields, adminUserId);
}

export async function getGlobalDispositions(): Promise<Disposition[]> {
    const doc = await getSettingsDoc('globalDispositions');
    if (doc?.exists) {
        return doc.data()?.value || [];
    }
    return ['Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
}

export async function saveGlobalDispositions(dispositions: Disposition[], adminUserId: string): Promise<void> {
    await saveSettingsDoc('globalDispositions', dispositions, adminUserId);
}

export async function getGlobalSubDispositions(): Promise<SubDisposition[]> {
    const doc = await getSettingsDoc('globalSubDispositions');
    if (doc?.exists) {
        return doc.data()?.value || [];
    }
    return ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];
}

export async function saveGlobalSubDispositions(subDispositions: SubDisposition[], adminUserId: string): Promise<void> {
    await saveSettingsDoc('globalSubDispositions', subDispositions, adminUserId);
}

export async function getCampaignDispositions(): Promise<Record<string, Disposition[]>> {
    const doc = await getSettingsDoc('campaignDispositions');
    if (doc?.exists) {
        return doc.data()?.value || {};
    }
    return {
        'Summer Fest 2024': ['Interested', 'Follow-up', 'Callback', 'Application Started'],
        'Diwali Dhamaka': ['Interested', 'Not Interested', 'Callback', 'Wrong Number'],
    };
}

export async function saveCampaignDispositions(dispositions: Record<string, Disposition[]>, adminUserId: string): Promise<void> {
    await saveSettingsDoc('campaignDispositions', dispositions, adminUserId);
}

export async function getCampaignSubDispositions(): Promise<Record<string, SubDisposition[]>> {
    const doc = await getSettingsDoc('campaignSubDispositions');
    if (doc?.exists) {
        return doc.data()?.value || {};
    }
    return {
        'Summer Fest 2024': ['Paid', 'Trial Class Booked', 'Sent Brochure'],
        'Diwali Dhamaka': ['Call Back Tomorrow', 'Price Issue'],
    };
}

export async function saveCampaignSubDispositions(subDispositions: Record<string, SubDisposition[]>, adminUserId: string): Promise<void> {
    await saveSettingsDoc('campaignSubDispositions', subDispositions, adminUserId);
}
