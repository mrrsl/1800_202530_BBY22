import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const appConfig = {
    apiKey: "AIzaSyCvHPZ7Bq3GbQXbnlxnJE8INAWKfTCcNqA",
    authDomain: "team-77dac.firebaseapp.com",
    projectId: "team-77dac",
    storageBucket: "team-77dac.firebasestorage.app",
    appId: "1:744151093255:web:7aa5c0093a097249df1aa2",
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