
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const apps = getApps();
  if (!apps.length) {
    // Prioritize local development with service account from .env.local
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        console.log("Initializing Firebase with service account credentials from .env.local...");
        app = initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
        });
    } 
    // Fallback to default credentials for production (App Hosting)
    else {
        console.log("Initializing Firebase with Application Default Credentials for App Hosting...");
        app = initializeApp();
    }
  } else {
    app = getApp();
  }

  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
  // In case of error, db and auth will remain null.
  // Functions using them should handle this case.
}

export { db, auth };
