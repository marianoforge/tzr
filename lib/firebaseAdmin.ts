import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config(); // Asegura que las variables de entorno se carguen

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log(
  'FIREBASE_PRIVATE_KEY:',
  process.env.FIREBASE_PRIVATE_KEY ? 'Loaded' : 'Not Loaded'
);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
  }
}

export const db = admin.firestore();
export const adminAuth = admin.auth();
