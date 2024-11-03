import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configure Firestore with persistence only once
let db: Firestore; // Explicitly type db as Firestore
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch (error: unknown) {
  if ((error as { code?: string }).code === 'failed-precondition') {
    // If Firestore was already initialized, just get the instance
    db = getFirestore(app);
  } else {
    throw error;
  }
}

// Get Auth instance
const auth = getAuth(app);

// Export necessary Firebase utilities
export { db, auth, GoogleAuthProvider, signInWithEmailAndPassword };
