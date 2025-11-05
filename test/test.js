import {
    firebaseAuth,
    firebaseDb
} from "../src/js/FirebaseInstances.js";

import {
    createUniqueUser,
}from "../src/js/Database.js";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";

import { mount } from "svelte";

/** Test account email. */
const testEmail = "boatfan@buoyswillbebuoys.com";
/** Test account password. */
const testPassword = "password";

const unsubber = onAuthStateChanged(authHandler);

/**
 * onAuthStateChangedObserver, automatically logs in with the test account.
 * @param {User} user 
 */
function authHandler(user) {
    if (user) {

    } else {
        signInWithEmailAndPassword(firebaseAuth, testEmail, testPassword)
            .then(authHandler)
            .catch(async (e) => {
                return createUserWithEmailAndPassword(firebaseAuth, testEmail, testPassword)
            })
            .then((usercred) => {
                createUniqueUser(usercred.user)
            })
            .then((u) => {
                authHandler(u);
            });
    }
}

