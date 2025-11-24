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
    dateISOString
} from "/js/DateUtils.js";

import {
    USER_COLLECTION_NAME, GROUP_COLLECTION_NAME,
    validateTaskObj,
    user,
} from "/js/Database.js";

import {
    doc, getDocs, getDoc,
    setDoc, deleteDoc, updateDoc,
    collection,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


/** Separator for group names and unique tag. */
export const SEP = '\u00A0';

/**
 * Adds the current user to a group with the specified name.
 * @param {String} groupId
 */
export const joinGroup = async function(groupName) {
    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupName);
    
    getDoc(groupRef).then(async snap => {
        if (snap.exists()) {
            return user();
        } else {
            throw new Error(`Group with name ${groupName} does not exist.`);
        }
    }).then(async data => {
        const userRef = doc(db, USER_COLLECTION_NAME);
        data.group = groupName;
        return setDoc(userRef, data);
    });
}

/**
 * Creates a group with the given group name.
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
        members: [ uid ],
        completed: 0
    };
    const groupDocRef = doc(db, GROUP_COLLECTION_NAME, workingGroupName);
    return setDoc(groupDocRef, defaultGroupDoc);
}

/** Uitility function to generate 4 digits for a unique group name. */
function generateDigits() {
    return Math.floor(
        Math.random() * 10_000
    );
}

/**
 * 
 * @param {String} groupName 
 * @param {Option} task
 */
export const addTaskToGroup = async function(groupName, task, date) {

    validateTaskObj(task);

    let taskId = (date) ? dateISOString(date) : dateISOString(Date.now());
    taskId += "-" + task.title;
    task.createdAt = Date.now();

    let groupDocRef = doc(db, GROUP_COLLECTION_NAME, groupName);
    let targetTaskDoc = doc(db, GROUP_COLLECTION_NAME, groupName, taskId);

    return getDoc(groupDocRef).then(async snap => {
        if (snap.exists()) {
            return setDoc(targetTaskDoc, task);
        } else {
            throw new Error(`Group name ${groupName} not found`);
        }
    });
}

/**
 * Get all tasks from a given group and return it as keyed table.
 * @param {String} groupName 
 * @return {Promise<Array<DocumentSnapshot>>}
 */
export const getGroupTasks = async function(groupName) {
    const collectionRef = collection(db, GROUP_COLLECTION_NAME, groupName, "tasks");

    return getDocs(collectionRef).then(async docs => {
        let taskTable = {};
        for (const doc of docs) {
            taskTable[doc.id] = doc.data();
        }
        return taskTable;
    });
}

/**
 * Remove a task from the specified group that matches the passed task object.
 * @param {String | null} groupId If null, default to current user's group.
 * @param {Object} taskObj 
 */
export const removeGroupTask = async function(taskObj, groupId) {
    if (groupId == null) {
        groupId = await user().group;
    }
}

/**
 * Removes a user from their registered group.
 * @param {String | null} userId Null defaults to current user.
 */
export const removeGroup = async function(userId) {
    if (userId == null) userId = auth.currentUser.uid;
    
    return user(userId).then(async data => {
        if (data.group) {
            const groupRef = doc(db, GROUP_COLLECTION_NAME, data.group);
            return getDoc(groupRef);
        }
    }).then(async groupSnap => {
        if (groupSnap.exists()) {
            let groupData = groupSnap.data();

            for (let a = 0; a < groupData.users.length; a++) {
                if (groupData.users[a] == userId) {
                    groupData.users = groupData.users.splice(a);

                    if (groupData.users.length == 0) {
                        return deleteDoc(groupSnap.ref);
                    } else {
                        return setDoc(groupSnap.ref, groupData);
                    }
                }
            }

            return;

        } else {
            throw new Error("Invalid group name - " + groupSnap.id);
        }
    });
}