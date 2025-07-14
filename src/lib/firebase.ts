
'use server';
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const apps = getApps();

if (!apps.length) {
  // When running on Firebase App Hosting, the config is automatically provided.
  // For local development, you can use a service account file.
  if (process.env.FIREBASE_CONFIG) {
     initializeApp();
  } else if(process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Initializing Firebase with GOOGLE_APPLICATION_CREDENTIALS for local development...");
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    initializeApp({
        credential: cert(serviceAccount)
    });
  } else {
    console.warn("Firebase could not be initialized. Missing FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS.");
  }
}

const db = apps.length ? getFirestore(getApp()) : undefined;
const auth = apps.length ? getAuth(getApp()) : undefined;


export { db, auth };
