/**
 * Module for encapsulating Firestore API calls. The intention is to remove the need to
 * directly call Firestore functions like {@link getDoc} or hardcode Firestore paths.
 * 
 */

import { firebaseDb, firebaseAuth } from "./FirebaseInstances.js";

import {
    getDoc, getDocs, doc, setDoc, addDoc,
    collection,
} from "firebase/firestore";

const USER_COLLECTION_NAME = "users";
const PREF_COLLECTION_NAME = "preferences";
const PERSONAL_COLLECTION_NAME = "personal-tasks";
const SHARED_COLLECTION_NAME = "shared-tasks";

/**
 * Default app settings.
 */
const DEFAULT_PREFERENCES = {
    bodyFont: "Inria Serif",
    titleFont: "Oooh Baby",
    accentColor: "#fff5fa"
}

/**
 * Introductory task.
 */
const INTRO_TASK = {
    date: (new Date()).toDateString(),
    title: "Welcome",
    desc: "Work hard and plan harder"
}

/**
 * Retrieve current user's document entry and pass the data to another function.
 * @param {(DocumentData) => void} success Callback if user retrieval is successful.
 * @param {(Error) => void | null} fail Callback if user retrieval fails.
 * @return {void}
 */
export const getUser = function(success, fail) {
    let docRef = doc(firebaseDb, USER_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    docFetch(docRef, success, fail, "User Info document not found");
}

/**
 * Retrieve current user's app settings and pass the data to another function.
 * @param {(DocumentData) => void} success Callback if settings retrieval is successful.
 * @param {(Error) => void | null} fail Callback if settings retrieval fails.
 * @return {void}
 */
export const getUserPreferences = function(success, fail) {
    let docRef = doc(firebaseDb, PREF_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    docFetch(docRef, success, fail, "User Preferences document not found");
}

/**
 * Retrieve the current user's friends and pass the array to a callback.
 * @param {(Array) => void} success Callback if friends array retrieval is successful. Note that the array can be empty.
 * @param {(Error) => void | null} fail Callback if settings retrieval failed.
 */
export const getUserFriends = function(success, fail) {
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
 * Gets the task collection for a given data. Passes an empty array if no tasks are given.
 * Array members, in addition to the Firestore fields, will also contain the `docId` field for easy reference is {@link removeTask} calls.
 * @param {Date} date 
 * @param {(a: Array<Object>) => void} success
 * @param {(e: Error) => void | null} fail
 * @return {Promise<any[]> | null}
 */
export const getPersonalTasks = function (date, success, fail) {
    const uid = firebaseAuth.currentUser.uid;
    const collectionId = generateTaskCollectionName(date);
    const dateCollection = collection(firebaseDb, PERSONAL_COLLECTION_NAME, uid, collectionId);

    let gdPromise = getDocs(dateCollection)
        .then(async (tasksSnapshot) => {
            let returnValue =[];
            tasksSnapshot.forEach((dref) => {
                // Appending additional data to help our front end code.
                let indivTask = dref.data();
                indivTask.docId = dref.id;
                returnValue.push(indivTask);
            });
            return returnValue;
        });
    
    // If no callbacks are given, return a promise
    let returnFlag = success != null || fail != null;
    if (success) gdPromise = gdPromise.then(success);
    if (fail) gdPromise.catch(fail);
    
    if (returnFlag)
        return gdPromise;
    else
        return null;
}

/**
 * Remove the task given its document ID and the date associated with it.
 * @param {Date} date 
 * @param {String} docName 
 * @param { () => void | null} success
 */
export const removeTask = function(date, docName, success) {
    const uid = firebaseAuth.currentUser.uid;
    const collectionName = generateTaskCollectionName(date);
    const dref = doc(firebaseDb, PERSONAL_COLLECTION_NAME, uid, collectionName, docName);
    let dStatus = deleteDoc(dref);
    if (success) dStatus.then(success);
}

/**
 * Retreives the current user's public task list and pass it to a callback.
 * @param {(Object) => void} success Callback for successful retrieval.
 * @param {(Error) => void} fail Callback for failed retrieval.
 */
export const getSharedTask = function(success, fail) {
    const subscriberPath = "followers";

    let docRef = doc(firebaseDb, SHARED_COLLECTION_NAME, firebaseAuth.currentUser.uid);
    let gdPromise = getDoc(docRef).then(async (snapshot) => {
        if (snapshot.exists()) {

            let followerCollection = collection(firebaseDb, docRef.path, subscriberPath);
            let followerData = (await getDocs(followerCollection)).docs();

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
 * @param {(string[]) => void} success Callback for successful data retrieval. This can pass on an empty array.
 * @param {(Error) => void} fail Callback for failed retrieval.
 */
export const getFollowedTasks = function(success, fail) {
    const followedCollectionName = "followedTasks";
    let followedCollectionRef = collection(firebaseDb, "users", firebaseAuth.currentUser.uid, followedCollectionName);
    getDocs(followedCollectionRef).then(async (collectionSnap) => {
        return collectionSnap.docs().map(x => x.id);
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
            fail && fail(new Error(eMessage));
    }).catch((error) => {
        fail && fail(error);
    });
}

/**
 * Utility function to generate a collection ID for personal task storage.
 * @param {Date} date 
 */
function generateTaskCollectionName(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate() + 1;
    
    if (month < 10) month = `0${month}`;
    if (day < 10) day = `0${day}`;
    
    return `${date.getFullYear()}${month}${day}`;
}


/**
 * Creates a new entry in the users collection if the uid does not exist yet.
 * @return {Promise<UserInfo>} Resolves to true if a new user entry was successfully added to Firestore.
 */
export const createUniqueUser = async function() {
    const firebaseUser = firebaseAuth.currentUser;
    let userDocRef = doc(firebaseDb, USER_COLLECTION_NAME, firebaseUser.uid);
    let snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
        return firebaseUser;
    } else {
        let userDocFields = {
            name: firebaseUser.displayName
        };
        await setDoc(userDocRef, userDocFields);
        snapshot = await getDoc(userDocRef);

        if (snapshot.exists()) {
            // Only populate default entries if the user entry worked
            defaultEntry();
            return firebaseUser;
        } else {
            throw new Error("Failed to update Firestore");
        }
    }
}


/**
 * Populates Firestore with default data for the logged in user, if the documents do not exist.
 * @return {void}
 */
export const defaultEntry = async function () {
    const firebaseUser = firebaseAuth.currentUser;

    let prefRefs = doc(firebaseDb, PREF_COLLECTION_NAME, firebaseUser.uid);
    let userRef = doc(firebaseDb, USER_COLLECTION_NAME, firebaseUser.uid);
    let personalRef = doc(firebaseDb, PERSONAL_COLLECTION_NAME, firebaseUser.uid);

    // Set default preferences
    getDoc(prefRefs).then((snap) => {
        if (!snap.exists()) {
            setDoc(prefRefs, DEFAULT_PREFERENCES);
        }
    });

    // Make sure user info exists on Firestore as well
    getDoc(userRef).then((snap) => {
        if (!snap.exists()) {
            let defaultUsername = firebaseUser.email.split("@")[0];
            let userInfo = {
                name: defaultUsername,
                email: firebaseUser.email
            }
            setDoc(userRef, {name: defaultUsername});
        }
    });

    // Populate with a default welcome task
    getDoc(personalRef).then((snap) => {
        if (!snap.exists()) {
            setDoc(userRef)
        }
    });
}

/**
 * Adds a personal task for the current user.
 * @param {Object} taskObj Object containing date, title, and desc properties.
 * @param {(DocumentReference) => void | null} success Optional callback for successful database write.
 * @param {(Error) => void | null} fail Optional callback for failed write.
 * @return {void}
 */
export const addPersonalTask = function(taskObj, success, fail) {
    const subCollectionName = generateTaskCollectionName(taskObj.date);
    const user = firebaseAuth.currentUser;
    // Send a copy so we can ammend whatever interface information in the original
    let sentObj = {
        date: (taskObj.date) ? taskObj.date : (new Date()).toDateString(),
        title: (taskObj.title) ? taskObj.title : "",
        desc: (taskObj.desc) ? taskObj.desc : "Nothing right now",
        completed: taskObj.completed
    }

    let subCollectionRef = collection(firebaseDb, PERSONAL_COLLECTION_NAME, user.uid, subCollectionName);
    let writeOperation = addDoc(subCollectionRef, sentObj);
    success && writeOperation.then(success);
    fail && writeOperation.catch(fail);  
}

/**
 * Changes the display name for the current user.
 * (Internally calls {@link appendUserInfo}).
 * @param {string} username 
 * @return {Promise<void>}
 */
export const setUsername = async function(username) {
    return appendUserInfo({name: username})
}

/**
 * Writes information to the `users` document for the current user.
 * @param {{[key: string]: string}} profileObj Object containing optional `name` and `email` fields.
 * @return {Promise<void>}
 */
export const appendUserInfo = async function(profileObj) {
    const firebaseUser = firebaseAuth.currentUser;
    let docRef = doc(firebaseDb, USER_COLLECTION_NAME,firebaseUser.uid);
    getDoc(docRef).then((snapshot) => {
        if (snapshot.exists()) {
            let userDocData = snapshot.data();
            for (const key of Objects.key(profileObj)) {
                userDocData[key] = profileObj[key];
            }
            return setDoc(docRef, userDocData);
        } else {
            return setDoc(docRef, profileObj);
        }
    });
}