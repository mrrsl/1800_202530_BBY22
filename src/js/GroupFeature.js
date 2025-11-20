/**
 * Library for managing user task groups. Tasks will be identified by a unique name which identifies their document in the
 * Firestore "groups" collection. The collection will take the following structure:
 * {{collections: [
 *      groupName: {
 *          // This will be a field
 *          members: [
 *              userId
 *          ],
 *          // This will be a collection
 *          tasks: [
 *          ]
 *      }
 * ]}}
 */

import {
    firebaseDb as db,
    firebaseAuth as auth
} from "/js/FirebaseInstances.js";

import {
    doc, getDocs, getDoc, setDoc,
    collection,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/** Top-level collection name for groups. */
const GROUP_COLLECTION = "groups";

/** Separator for group names and unique tag. */
const SEP = '\u00A0';

/**
 * Adds the current user to a group with the specified name.
 * @param {String} groupId
 */
export const joinGroup = async function(groupName) {

}

/**
 * 
 * @param {} groupName 
 * @returns 
 */
export const createGroup = async function(groupName) {
    const uid = auth.currentUser.uid;
    const groupCollection = collection(db, GROUP_COLLECTION);
    const existingGroups = await getDocs(groupCollection);

    let existingNameSet = new Set(existingGroups.map(doc => doc.id));
    let workingGroupName = null;

    do {
        workingGroupName = groupName + SEP + generateDigits();
    } while (existingNameSet.has(workingGroupName));

    const defaultGroupDoc = {
        members: [ uid ]
    };
    const groupDocRef = doc(db, GROUP_COLLECTION, workingGroupName);
    return setDoc(groupDocRef, defaultGroupDoc);
}

/** Uitility function to generate 4 digits for a unique group name. */
function generateDigits() {
    return Math.floor(
        Math.random() * 10_000
    );
}