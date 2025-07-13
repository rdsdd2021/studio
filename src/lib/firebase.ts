import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const getFirebaseAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY environment variable is not set. Please check your .env file.'
    );
  }

  try {
    const app = initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    return app;
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    throw new Error('Could not initialize Firebase Admin SDK.');
  }
};

export function getDb() {
  const app = getFirebaseAdminApp();
  return getFirestore(app);
}
