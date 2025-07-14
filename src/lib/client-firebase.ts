
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
let app;

if (firebaseConfig) {
  if (!getApps().length) {
    app = initializeApp(JSON.parse(firebaseConfig));
  } else {
    app = getApp();
  }
} else {
    console.warn("Client-side Firebase config not found. Firebase features on the client will not work.");
}


export { app };
