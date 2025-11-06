/**
 * Module for encapsulating Firestore API calls. The intention is to remove the need to
 * directly call Firestore functions like {@link getDoc} or hardcode Firestore paths.
 * 
 * All functions here should take a Firestore {@link User} object as the first argument, which can
 * be read from the currentUser property of the @firebase/auth module.
 */

import { firebaseDb, firebaseAuth } from "./FirebaseInstances.js";

import {
    getDoc, getDocs, doc, setDoc,
    collection,
} from "firebase/firestore";

const USER_COLLECTION_NAME = "users";
const PREF_COLLECTION_NAME = "preferences";
const PERSONAL_COLLECTION_NAME = "personal-tasks";
const SHARED_COLLECTION_NAME = "shared-tasks";

/**
 * Retrieve current user's document entry and pass the data to another function.
 * @param {(DocumentData) => void} success Callback if user retrieval is successful.
 * @param {(Error) => void | null} fail Callback if user retrieval fails.
 * @return {void}
 */
export const user = function(success, fail) {
    let docRef = doc(firebaseDb, USER_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    docFetch(docRef, success, fail, "User Info document not found");
}

/**
 * Retrieve current user's app settings and pass the data to another function.
 * @param {(DocumentData) => void} success Callback if settings retrieval is successful.
 * @param {(Error) => void | null} fail Callback if settings retrieval fails.
 * @return {void}
 */
export const userPreferences = function(success, fail) {
    let docRef = doc(firebaseDb, PREF_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    docFetch(docRef, success, fail, "User Preferences document not found");
}

/**
 * Retrieve the current user's friends and pass the array to a callback.
 * @param {(Array) => void} success Callback if friends array retrieval is successful. Note that the array can be empty.
 * @param {(Error) => void | null} fail Callback if settings retrieval failed.
 */
export const userFriends = function(success, fail) {
    const friendField = "friends";
    let friendCollection = collection(firebaseDb, PREF_COLLECTION_NAME, firebaseAuth.currentUser.uid, friendField);

    friendCollection.get().then(async (querySnap) => {

        let friendIds = [];

        if (!querySnap.empty()) {         
            for (let docQuery of querySnap.docs()) {
                friendIds.push(docQuery.data());
            }
        }
        return friendIds;

    }).catch(error => {
        fail && fail(error)

    }).then(success);
}

/**
 * Retrieves the current user's tasks and pass the document to a callback.
 * @param {(Object) => void} success Callback that processes the task document. See curatedData in the function body for properties.
 * @param {(Error) => void | null} fail Callback if document retrieval failed.
 */
export const personalTasks = function(success, fail) {
    let docRef = doc(firebaseDb, PERSONAL_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    docFetch(docRef, success, fail, "Personal Task document not found.");
}

/**
 * Retreives the current user's public task list and pass it to a callback.
 * @param {(Object) => void} success Callback for successful retrieval.
 * @param {(Error) => void} fail Callback for failed retrieval.
 */
export const sharedTask = function(success, fail) {
    const subscriberPath = "followers";

    let docRef = doc(firebaseDb, SHARED_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    getDoc(docRef).then(async (snapshot) => {
        if (snapshot.exists()) {

            let followerCollection = collection(firebaseDb, docRef.path, subscriberPath);
            let followerData = (await followerCollection.get()).docs();

            let snapData = snapshot.data();
            let curatedData = {
                date: new Date(snapData.date),
                desc: snapData.desc,
                title: snapData.title,
                followers: followerData.map(x => x.id)
            };
            return curatedData;
            
        } else {
            fail && fail(new Error("Shared Task document not found."));
        }
    }).then(success);
}

/**
 * Retrieve an array of the user's followed task.
 * @param {(string[]) => void} success Callback for successful data retrieval.
 * @param {(Error) => void} fail Callback for failed retrieval.
 */
export const followedTasks = function(success, fail) {
    const followedCollectionName = "followedTasks";
    let followedCollectionRef = collection(firebaseDb, "users", firebaseAuth.currentUser.uid, followedCollectionName);
    collection.get().then(async (querySnap) => {
        if (!querySnap.empty()) {
            let collectionDocs = querySnap.docs();    
            return collectionDocs.map(x => x.id);
        }
    }).catch(error => {
        fail && fail(error);
    }).then(success);
}

/**
 * Utility function for the public retrieval functions.
 * @param {DocumentReference} docRef 
 * @param {(DocumentData) => void} success 
 * @param {(Error) => void | null} fail 
 * @param {string} eMessage Error message on failure.
 * @return {void}
 */
function docFetch(docRef, success, fail, eMessage) {
    getDoc(docRef).then((snapshot) => {
        if (snapshot.exists())
            success(snapshot.data());
        else
            fail && fail(new Error("Document not found"));
    }).catch((error) => {
        fail && fail(error);
    });
}

/**
 * Creates a new entry in the users collection if the uid does not exist yet.
 * @param {User} firebaseUser User object returned by auth functions.
 * @return {Promise<boolean>} Resolves to true if a new user entry was successfully added to Firestore.
 */
export const createUniqueUser = async function(firebaseUser) {
    let userDocRef = doc(firebaseDb, TopLevelUserCollection, firebaseUser.uid);
    let snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
        return false;
    } else {
        let userDocFields = {
            name: firebaseUser.displayName
        };
        await setDoc(userDocRef, userDocFields);
        snapshot = await getDoc(userDocRef);
        return snapshot.exists();
    }
}


/**
 * Execute this at the bottom of the script to automatically redirect back to login page if no user is detected.
 * @return {void}
 */
function checkAuth() {
    if (currentUser == null) {
        window.location.href = "index.html";
    }
}