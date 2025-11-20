import {
    firebaseAuth as auth
} from "/js/FirebaseInstances.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

/**
 * Sign out utility to elide explicit auth import.
 * @return {Promise<void>}
 */
export const logout = function() {
    if (isLoggedIn())
        return signOut(firebaseAuth);
}

/**
 * Authentication status utility to elide explicit auth import.
 * @returns True if a user is logged in according to the Firebase Auth instance.
 */
export const isLoggedIn = function() {
    return auth.currentUser != null;
}