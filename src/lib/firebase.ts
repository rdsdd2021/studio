
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  const apps = getApps();
  if (!apps.length) {
    // Production environment (Firebase App Hosting)
    if (process.env.FIREBASE_CONFIG) {
        console.log("Initializing Firebase with default credentials for App Hosting...");
        app = initializeApp();
    } 
    // Local development environment
    else if (process.env.FIREBASE_PRIVATE_KEY) {
        console.log("Initializing Firebase with service account credentials from .env.local...");
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID;

        if (!privateKey || !clientEmail || !projectId) {
            throw new Error("Missing Firebase service account credentials in .env.local. Please check your setup.");
        }

        app = initializeApp({
            credential: cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey,
            }),
            databaseURL: `https://${projectId}.firebaseio.com`
        });
    } else {
        console.warn("Firebase could not be initialized. Configure .env.local for local development or deploy to App Hosting.");
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
