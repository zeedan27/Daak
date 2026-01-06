// /src/firebase/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (replace with your own credentials)
const firebaseConfig = {
  apiKey: "AIzaSyBfrWbGB9cHu2ViYwhfFfYsxRi1NG8e2P8",
  authDomain: "daak-app.firebaseapp.com",
  projectId: "daak-app",
  storageBucket: "daak-app.appspot.com",
  messagingSenderId: "535089953659",
  appId: "1:535089953659:web:30e0f7e701d08c61805bde"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;