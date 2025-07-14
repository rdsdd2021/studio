
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  const apps = getApps();
  if (!apps.length) {
    if (process.env.FIREBASE_CONFIG) {
       app = initializeApp();
    } else if(process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("Initializing Firebase with GOOGLE_APPLICATION_CREDENTIALS for local development...");
      const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      app = initializeApp({
          credential: cert(serviceAccount)
      });
    } else {
      console.warn("Firebase could not be initialized. Missing FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS.");
    }
  } else {
    app = getApp();
  }

  if (app) {
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db, auth };
