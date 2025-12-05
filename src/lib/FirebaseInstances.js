import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const appConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

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

/**
 * Wrapper to remove some repeated boilerplate when calling onAuthStateChanged.
 * @param {Function} init Callback if user is logged in.
 * @param {Function} fail Callback for logged out user.
 */
export const authWrapper = function(init, fail) {
    onAuthStateChanged(firebaseAuth, (user) => {
        if (user)
            init(user);
        else
            fail && fail();
    });
}