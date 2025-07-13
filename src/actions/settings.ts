'use server'

export interface GeofenceSettings {
    centerLocation: string;
    radius: number;
}

// Mocked settings data
let geofenceSettings: GeofenceSettings = {
    centerLocation: 'Connaught Place, New Delhi',
    radius: 5000
};

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    return geofenceSettings;
}

export async function saveGeofenceSettings(settings: GeofenceSettings): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    geofenceSettings = settings;
    console.log("Saved geofence settings:", geofenceSettings);
}
