import {
    firebaseAuth,
    firebaseDb
} from "../src/lib/Database.js";

import {
    createUniqueUser,
}from "../src/lib/Database.js";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";

import { mount } from "svelte";

/** Test account email. */
const testEmail = "waterlover@hydrateyourself.h20";
/** Test account password. */
const testPassword = "password";

const unsubber = onAuthStateChanged(firebaseAuth, authHandler);

/**
 * onAuthStateChangedObserver, automatically logs in with the test account.
 * @param {User} user 
 */
function authHandler(user) {
    if (user) {
        console.log("User is logged in");
        createUniqueUser(user);
    } else {
        console.log("No user detected, attempting to log in..")
        signInWithEmailAndPassword(firebaseAuth, testEmail, testPassword)
            .then(authHandler)
            .catch(async (e) => {
                console.log("User does not exist, creating account...")
                return createUserWithEmailAndPassword(firebaseAuth, testEmail, testPassword)
            })
            .then((usercred) => {
                createUniqueUser(usercred.user)
                //defaultEntry();
            })
            .then((u) => {
                authHandler(u);
            });
    }
}



