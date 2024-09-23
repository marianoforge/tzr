// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBrNBzTm27cfz60M8nfjbsKEOHbo79I594",
  authDomain: "gds-si.firebaseapp.com",
  projectId: "gds-si",
  storageBucket: "gds-si.appspot.com",
  messagingSenderId: "342233680729",
  appId: "1:342233680729:web:61230ada1e5b7737621a48",
  measurementId: "G-1917CJGN9D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
