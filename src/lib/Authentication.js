import {
    firebaseAuth as auth
} from "./FirebaseInstances.js";

import {
    signOut
} from "firebase/auth";

import {
    user
} from "./Database.js";

/**
 * Sign out utility to elide explicit auth import.
 * @return {Promise<void>}
 */
export const logout = function() {
    if (isLoggedIn())
        return signOut(auth);
}

/**
 * Authentication status utility to elide explicit auth import.
 * @returns True if a user is logged in according to the Firebase Auth instance.
 */
export const isLoggedIn = function() {
    return auth.currentUser != null;
}

/**
 * Repair for janky email changing.
 * @param {User} user 
 */
export const forceEmailMatch = async function(user) {
    const userDoc = await user(auth.currentUser.uid);
    if (userDoc.exists()) {
        userFirestoreEmail = userDoc.data().email;
        if (userFirestoreEmail != user.email) {
            let updatedDoc = userDoc.data();
            updatedDoc.email = user.email;
            
        }
    }
}