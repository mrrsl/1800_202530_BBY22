import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

import { firebaseAuth } from "./FirebaseInstances.js";

import { defaultEntry } from "./Database.js";

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
        });
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
 * Runs an authentication check once the Firebase auth instance is fully resolved.
 * * The `auth.currentUser` field is initially set to null until script load, so the user's actual status isn't accurately reflected until `auth` is fully resolved.
 * @param {() => void} success Callback if the client is logged in.
 * @param {() => void} fail Callback if no user.
 * @return {void}
 */
export const checkAuth = function(success, fail) {
    onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
            success();
        } else {
            fail();
        }
    });
}

/**
 * Creates account on Firebase auth with the given email/password and redirects to the given URL on successful registration.
 * @param {string} email
 * @param {string} password
 * @param {string | null} redirect
 * @return {Promise<void>}
 */
export const register = function(email, password, redirect) {
    let accountRegStatus = createUserWithEmailAndPassword(firebaseAuth, email, password)
        .then((cred) => {
            defaultEntry();
            if (redirect)
                window.location.href = redirect;
        });
    return accountRegStatus;
}

/**
 * Shortener of onAuthStateChanged.
 * @param {Function} observerFunction 
 */
export const authInit = function(observerFunction) {
    onAuthStateChanged(firebaseAuth, (user) => {
        if (user)
            observerFunction();

    });
}

/**
 * Check current authentication state.
 * @return {Boolean}
 */
export const isAuthenticated = function() {
    if (firebaseAuth.currentUser)
        return true;
    else
        return false;
}
