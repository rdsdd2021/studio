import type { LoginActivity } from './types';

// NOTE: The `users`, `leads`, and `assignmentHistory` arrays have been removed.
// The application now uses Firebase Firestore for data persistence.
// You will need to populate your Firestore database with initial data.
// The `loginActivity` data remains here as it's not yet migrated.

export const loginActivity: LoginActivity[] = [
    { id: 'act_1', userId: 'usr_1', userName: 'Admin User', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '192.168.1.1', device: 'Chrome on macOS' },
    { id: 'act_2', userId: 'usr_2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '203.0.113.25', device: 'Safari on iPhone' },
    { id: 'act_3', userId: 'usr_3', userName: 'John Smith', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '198.51.100.10', device: 'Chrome on Windows' },
    { id: 'act_4', userId: 'usr_2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), activity: 'logout', ipAddress: '203.0.113.25', device: 'Safari on iPhone' },
];
