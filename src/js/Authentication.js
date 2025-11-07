import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";

import { firebaseAuth } from "./FirebaseInstances.js";

/**
 * Logs the user in and redirects them on successful login attempt.
 * @param {string} email 
 * @param {string} pw User's password
 * @param {string | null} redirect Redirect URL.
 */
export const loginUser = function(email, pw, redirect) {
    signInWithEmailAndPassword(firebaseAuth, email, pw)
        .then(() => {
            // Keep window in place if no redirect is given
            window.location.href = (redirect) ? redirect : window.location.href;
        })
}

/**
 * Signs out then redirects the window to an optional redirect URL. Defaults to index.
 * @param {String | null} redirectUrl 
 */
export const logoutUser = function(redirectUrl) {
    signOut(firebaseAuth)
        .then(() => {
            window.location.href = (redirectUrl) ? redirectUrl : "/";
        });
}

/**
 * Execute this at the bottom of the script to automatically redirect back to index page if no user is detected.
 * @return {void}
 */
export const checkAuth = function() {
    if (firebaseDb.currentUser == null) {
        window.location.href = "index.html";
    }
}
