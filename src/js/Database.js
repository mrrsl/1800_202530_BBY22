/**
 * Module for encapsulating Firestore API calls. The intention is to remove the need to
 * directly call Firestore functions like {@link getDoc} or hardcode Firestore paths.
 */

import { firebaseDb, firebaseAuth } from "./FirebaseInstances.js";

import {
    getDoc, getDocs, doc, setDoc, addDoc,
    collection,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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
  accentColor: "#fff5fa",
};

/**
 * Introductory task.
 */
const INTRO_TASK = {
  date: new Date().toDateString(),
  title: "Welcome",
  desc: "Work hard and plan harder",
  completed: false, // Added for consistency
};

/**
 * Retrieve current user's document entry and pass the data to another function.
 * @param {String | null} idString Optional ID string, defaults to current user.
 * @return {Promise<DocumentData>}
 */
export const user = async function(idString) {
    let uid = (idString)? idString: firebaseAuth.currentUser.uid;
    let docRef = doc(firebaseDb, USER_COLLECTION_NAME, uid);
    return docFetch(docRef, "User Info document not found");
}

/**
 * Retrieve current user's app settings and pass the data to another function.
 * @return {Promise<DocumentData>}
 */
export const userPreferences = async function(idString) {
    let uid = (idString)? idString: firebaseAuth.currentUser.uid;
    let docRef = doc(firebaseDb, PREF_COLLECTION_NAME, uid);
    return docFetch(docRef, "User Preferences document not found");
}

/**
 * Sets fields in the user's preferences according to values defined in the argument.
 * @param {Object} prefObj Values in the argument will either be appended or overwrite the preferences object.
 * @returns 
 */
export const setUserPreferences = async function(prefObj) {
    const uid = firebaseAuth.currentUser.uid;
    let docRef = doc(firebaseDb, PREF_COLLECTION_NAME, uid);
    let currentPrefs = await getDoc(docRef);
    if (currentPrefs.exists()) currentPrefs = currentPrefs.data();

    for (let field of Object.keys(prefObj)) {
        currentPrefs[field] = prefObj[field];
    }
    return setDoc(docRef, currentPrefs);
}
/**
 * Retrieve an array of UID's that the user has added as a friend
 * @param {String | null} idString Optional uid string. Defaults to current user.
 * @return {Promise<Array<String>>}
 */
export const userFriends = async function(idString) {
    const uid = (idString)? idString: firebaseAuth.currentUser.uid;
    let userDocRef = doc(firebaseDb, USER_COLLECTION_NAME, uid);

    return getDoc(userDocRef).then(querySnap => {
        if (querySnap.exists()) {
            return querySnap.data().friends;
        }
    });
}

/**
 * Adds a friend for the existing user. This will throw an error the give friend UID is not valid.
 * @param {String} friendId Friend's UID.
 * @return {Promise<void>}
 */
export const addFriend = async function(friendId) {
    const uid = firebaseAuth.currentUser.uid;
    const docRef = doc(firebaseDb, USER_COLLECTION_NAME, uid);
    const friendUser = doc(firebaseDb, USER_COLLECTION_NAME, friendId);

    return getDoc(friendUser).then(async snap => {
        // Check the friend exists first
        if (snap.exists()) {
            return snap.data();
        } else {
            throw new Error("Friend not found");
        }
    }).then(data => getDoc(docRef))
    .then(async snap => {
        // Get friends array and push the new ID onto it before overwriting the doc
        if (snap.exists()) {
            const userData = snap.data();
            if (userData.friends)
                userData.friends.push(friendId);
            else
                userData.friends = [friendId];

            return setDoc(docRef, userData);
        } else {
            throw new Error("User not found");
        }
    });
}

/**
 * Generate an array of users whos names match the search string.
 * @param {String} searchString 
 * @return {Array<Object>}
 */
export const searchUsers = async function(searchString) {
    const uid = firebaseAuth.currentUser.uid;
    const coll = collection(firebaseDb, USER_COLLECTION_NAME);

    const rex = new RegExp(searchString);

    let matchedUsers = [];
    let docs = await getDocs(coll);
    docs.forEach(doc => {
        if (doc.id != uid && doc.data().name.search(rex) > -1) {
            let nameAndEmail = doc.data();
            nameAndEmail.uid = doc.id;
            matchedUsers.push(nameAndEmail);
        }
    });

    return matchedUsers;
}

/**
 * Retrieves the current user's tasks and pass the document to a callback.
 * @param {String | null} idString Optional UID, defaults to current user.
 * @return {Promise<DocumentData>}
 */
export const personalTasks = function(idString) {
    let uid = (idString)? idString: firebaseAuth.currentUser.uid;
    let docRef = doc(firebaseDb, PERSONAL_COLLECTION_NAME, uid);
    return docFetch(docRef, "Personal Task document not found.");
}

/**
 * Retreives the current user's public task list and pass it to a callback.
 * @param {(Object) => void} success Callback for successful retrieval.
 * @param {(Error) => void} fail Callback for failed retrieval.
 */
export const sharedTask = function (success, fail) {
  const subscriberPath = "followers";

  let docRef = doc(
    firebaseDb,
    SHARED_COLLECTION_NAME,
    firebaseAuth.currentUser.uid
  );
  getDoc(docRef)
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        let followerCollection = collection(
          firebaseDb,
          docRef.path,
          subscriberPath
        );
        let followerData = (await getDocs(followerCollection)).docs();

        let snapData = snapshot.data();
        let curatedData = {
          date: new Date(snapData.date),
          desc: snapData.desc,
          title: snapData.title,
          followers: followerData.map((x) => x.id),
        };
        return curatedData;
      } else {
        fail && fail(new Error("Shared Task document not found."));
      }
    })
    .then(success);
};

/**
 * Retrieve an array of the user's followed task.
 * @param {(string[]) => void} success Callback for successful data retrieval. This can pass on an empty array.
 * @param {(Error) => void} fail Callback for failed retrieval.
 */
export const followedTasks = function (success, fail) {
  const followedCollectionName = "followedTasks";
  let followedCollectionRef = collection(
    firebaseDb,
    "users",
    firebaseAuth.currentUser.uid,
    followedCollectionName
  );
  getDocs(followedCollectionRef)
    .then(async (collectionSnap) => {
      return collectionSnap.docs().map((x) => x.id);
    })
    .catch((error) => {
      fail && fail(error);
    })
    .then(success);
};

/**
 * Utility function for the public retrieval functions.
 * @param {DocumentReference} docRef 
 * @param {string} eMessage Error message on failure.
 * @return {Promise<DocumentData>}
 */
async function docFetch(docRef, eMessage) {
    return getDoc(docRef).then(async (snapshot) => {
        if (snapshot.exists())
            return snapshot.data();
        else
            throw new Error(eMessage);
    })
}

/**
 * Utility function to generate a collection ID for personal task storage.
 * @param {Date} date
 */
function generateTaskCollectionName(date) {
  return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
}

/**
 * Creates a new entry in the users collection if the uid does not exist yet.
 * @param {String} name
 * @param {String} email
 * @param {String} pw Password.
 * @return {Promise<UserInfo>} Resolves to true if a new user entry was successfully added to Firestore.
 */
export const createUser = async function(name, email, pw) {
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pw);
    const uid = cred.user.uid;
    let userDocRef = doc(firebaseDb, USER_COLLECTION_NAME, uid);
    let snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
        return uid;
    } else {
        let userDocFields = {
            name: name,
            email: email,
            createdAt: new Date()
        };
        await setDoc(userDocRef, userDocFields);
        snapshot = await getDoc(userDocRef);

        if (snapshot.exists()) {
            // Only populate default entries if the user entry worked
            defaultEntry(uid);
            return uid;
        } else {
            throw new Error("Failed to update Firestore");
        }
    }
}

/**
 * Populates Firestore with default data for the logged in user, if the documents do not exist.
 * @param {String} idString UID string.
 * @return {void}
 */
export const defaultEntry = function (idString) {
    const firebaseUser = firebaseAuth.currentUser;

    let prefRefs = doc(firebaseDb, PREF_COLLECTION_NAME, firebaseUser.uid);
    let personalRef = doc(firebaseDb, PERSONAL_COLLECTION_NAME, firebaseUser.uid);

    getDoc(prefRefs).then((snap) => {
        if (!snap.exists()) {
            setDoc(prefRefs, DEFAULT_PREFERENCES);
        }
    });

  getDoc(personalRef).then((snap) => {
    if (!snap.exists()) {
      setDoc(personalRef, {}); // Fixed typo: set empty doc for parent
    }
  });
};

/**
 * Adds a personal task for the current user.
 * @param {Object} taskObj Object containing date (Date object), title, desc, and completed properties.
 * @param {(DocumentReference) => void | null} success Optional callback for successful database write.
 * @param {(Error) => void | null} fail Optional callback for failed write.
 * @return {void}
 */
export const addPersonalTask = function (taskObj, success, fail) {
  const dateObj = taskObj.date; // Keep Date for subcollection
  const subCollectionName = generateTaskCollectionName(dateObj);
  const user = firebaseAuth.currentUser;

    if (taskObj.date.toDateString) {
        taskObj.date = taskObj.date.toDateString();
    }
    if (taskObj.complete == null) {
        taskObj.complete = false;
    }

    let subCollectionRef = collection(firebaseDb, PERSONAL_COLLECTION_NAME, user.uid, subCollectionName);
    let writeOperation = addDoc(subCollectionRef, taskObj);
    success && writeOperation.then(success);
    fail && writeOperation.catch(fail);  
}

/**
 * Changes the display name for the current user.
 * @param {string} username
 * @return {void}
 */
export const setUsername = function (username) {
  const firebaseUser = firebaseAuth.currentUser;
  let docRef = doc(firebaseDb, USER_COLLECTION_NAME, firebaseUser.uid);
  getDoc(docRef).then((snapshot) => {
    if (snapshot.exists()) {
      let userDocData = snapshot.data();
      userDocData["name"] = username;
      setDoc(docRef, userDocData);
    } else {
      setDoc(docRef, { name: username });
    }
  });
};
