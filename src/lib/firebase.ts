
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

const hasRequiredEnvVars =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasRequiredEnvVars) {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                }),
            });
            console.log("Firebase Admin SDK initialized successfully.");
            db = admin.firestore();
        } catch (error: any) {
            console.error('Firebase admin initialization error:', error.stack);
        }
    } else {
        db = admin.firestore();
    }
} else {
    console.warn(
      'Firebase Admin SDK not initialized. Missing one or more of FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
}


export { db };
