
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Add checks for all required environment variables
if (!firebaseConfig.apiKey) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY in .env.local');
}
if (!firebaseConfig.authDomain) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in .env.local');
}
if (!firebaseConfig.projectId) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local');
}


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
