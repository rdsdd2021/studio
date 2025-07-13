import admin from 'firebase-admin';

// The 'dotenv' config is now handled in the genkit dev entry point (src/ai/dev.ts)
// to ensure variables are loaded before any other code runs.

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set. Please check your .env file.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.firestore();
