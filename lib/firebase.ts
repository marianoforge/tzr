import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  CACHE_SIZE_UNLIMITED,
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

// Configure Firestore with persistence
initializeFirestore(app, {
  localCache: persistentLocalCache(), // Enables IndexedDb caching
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// Get Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export necessary Firebase utilities
export { db, auth, GoogleAuthProvider, signInWithEmailAndPassword };
