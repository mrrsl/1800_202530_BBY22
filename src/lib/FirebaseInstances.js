import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const appConfig = {
    apiKey: "AIzaSyC1X3eQaWxuFZt-Jrrzxl_X7RPzD1ooRd8",
    authDomain: "calendar-app-eeda4.firebaseapp.com",
    projectId: "calendar-app-eeda4",
    storageBucket: "calendar-app-eeda4.firebasestorage.app",
    messagingSenderId: "135200443171",
    appId: "1:135200443171:web:d842dc61da8fcae97d5a96",
    measurementId: "G-B0DBRK6MM2"
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