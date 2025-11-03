import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const appConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Reference to the Firebase app instance.
 */
export const firebaseInstance = initializeApp(appConfig);

/**
 * Reference to the Firebase authentication service
 */
export const firebaseAuth = getAuth(firebaseInstance);

/**
 * Reference to the Firestore persistent storage.
 */
export const firebaseDb = getFirestore(firebaseInstance);