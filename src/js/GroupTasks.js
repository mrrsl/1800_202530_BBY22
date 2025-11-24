/**
 * Library for managing user task groups. Tasks will be identified by a unique name which identifies their document in the
 * Firestore "groups" collection. The collection will take the following structure:
 * groups: [
 *      groupId: {
 *          // This will be a field
 *          members: [
 *              userId
 *          ],
 *          // This will be a collection
 *          tasks: [
 *          ]
 *      }
 * ]
 * 
 * 
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
    query, documentId, deleteField,
    where, orderBy,
    collection,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


/** Separator for group names and unique tag. */
export const SEP = '\u00A0';

/**
 * Adds the current user to a group with the specified name.
 * @param {String} groupId
 */
export const joinGroup = async function(groupId) {
    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);
    
    getDoc(groupRef).then(async snap => {

        if (snap.exists()) {
            return user();
        } else {
            throw new Error(`Group with name ${groupId} does not exist.`);
        }

    }).then(async data => {

        const userRef = doc(db, USER_COLLECTION_NAME);
        data.group = groupId;
        return setDoc(userRef, data);
    });
}

/**
 * Creates a group with the given group name.
 * @param {} groupId 
 * @returns 
 */
export const createGroup = async function(groupId) {
    const uid = auth.currentUser.uid;
    const groupCollection = collection(db, GROUP_COLLECTION_NAME);
    const existingGroups = await getDocs(groupCollection);

    // Ensure unique group ids for the task within a group
    let existingNameSet = new Set(existingGroups.docs.map(doc => doc.id));
    let workingGroupName = null;

    do {
        workingGroupName = groupId + SEP + generateDigits();
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
 * Retrieve a list of group members for the given group.
 * @param {String} groupId 
 * @return {Array<Object>} Objects have fields: id, name, email
 */
export const getGroupMembers = async function(groupId) {
    if (groupId == null)
        throw new Error("null argument passed");

    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);
    const usersRef = collection(db, USER_COLLECTION_NAME);

    return getDoc(groupRef).then(async snap => {

        if (snap.exists()) {
            return snap.data().members;  
        } else {
            throw new Error(`Group with name '${groupId}' does not exist.`)
        }

    }).then(async memberList => {

        const memberQuery = query(usersRef,
            where(documentId, "in", memberList),
            orderBy(groupId, "desc")
        );
        const memberDocs = await getDocs(memberQuery);
        return memberDocs.docs.map(doc => {
            return {
                id: doc.id,
                name: doc.data().name,
                email: doc.data().email
            };
        });

    });
}

/**
 * Write the given task object to the firestore for a specified group
 * @param {String} groupId 
 * @param {Option} task
 */
export const addTaskToGroup = async function(groupId, task) {

    validateTaskObj(task);
    let taskId = task.dateISO + "-" + task.title;
    task.createdAt = Date.now();

    let groupDocRef = doc(db, GROUP_COLLECTION_NAME, groupId);
    let targetTaskDoc = doc(db, GROUP_COLLECTION_NAME, groupId, taskId);

    return getDoc(groupDocRef).then(async snap => {

        if (snap.exists()) {
            return setDoc(targetTaskDoc, task);
        } else {
            throw new Error(`Group name ${groupId} not found`);
        }
    });
}

/**
 * Get all tasks from a given group and return it as keyed table.
 * @param {String} groupId 
 * @return {Promise<Array<DocumentSnapshot>>}
 */
export const getGroupTasks = async function(groupId) {
    const collectionRef = collection(db, GROUP_COLLECTION_NAME, groupId, "tasks");

    return getDocs(collectionRef).then(async querySnap => {

        let taskTable = {};
        for (const doc of querySnap.docs) {
            taskTable[doc.id] = doc.data();
        }
        return taskTable;
    });
}

/**
 * Mark the group task as completed by the current user. If all group members have completed it,
 * delete the task.
 * @param {Object} taskObj 
 * @param {String} groupId 
 * @param {String | null} user Default to current user if unspecified. 
 * @return {Promise} Return the result of removeGroupTask if everyone completed it
 */
export const completeGroupTask = async function(taskObj, groupId, user) {
    if (user == null)
        user = auth.currentUser.uid;
    if (groupId == null)
        throw new Error("Need group name");

    const taskId = dateISOString(taskObj.dateISO) + "-" + task.title;
    const taskRef = doc(db, GROUP_COLLECTION_NAME, groupId, "tasks", taskId);
    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);

    return getDoc(taskRef).then(async snap => {

        if (snap.exists()) {
            let group = await getDoc(groupRef);
            group = new Set(group.data().members);
            let completed = snap.data().completed;
            completed.push(user);
            let completedSet = new Set(completed);

            if (group.difference(completedSet).size == 0) {
                return removeGroupTask(taskObj, groupId);
            } else {
                return updateDoc(taskRef, {completed: completed});
            }

        } else {
            throw new Error("Problem looking up task");
        }
    });
}

/**
 * Remove a task from the specified group that matches the passed task object.
 * @param {String | null} groupId If null, default to current user's group.
 * @param {Object} taskObj 
 */
export const removeGroupTask = async function(taskObj, groupId) {
    if (groupId == null)
        groupId = await user().group;
    
    const groupTasksRef = collection(db, GROUP_COLLECTION_NAME, groupId, "tasks");
    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);
    const filter = query(groupTasksRef,
        where("dateISO", "==", taskObj.dateISO),
        where("title", "==", taskObj.title)
    );
    return getDocs(filter).then(async querySnap => {

        if (querySnap.docs.length > 0) {
            let group = await getDoc(groupRef);
            group = group.data();

            await updateDoc(groupRef, {
                completions: group.completions + 1
            });
            return deleteDoc(querySnap.docs[0].ref);
        }
    });
}

/**
 * Removes a user from their registered group.
 * @param {String} groupId
 * @param {String | null} userId Null defaults to current user.
 */
export const removeFromGroup = async function(groupId, userId) {
    if (userId == null) userId = auth.currentUser.uid;
    
    return user(userId).then(async data => {

        if (data.group) {
            const groupRef = doc(db, GROUP_COLLECTION_NAME, data.group);
            return getDoc(groupRef);
        } else {
            throw new Error("No Group");
        }

    }).then(async groupSnap => {

        if (groupSnap.exists()) {
            let groupData = groupSnap.data();

            for (let a = 0; a < groupData.members.length; a++) {
                if (groupData.members[a] == userId) {
                    groupData.members = groupData.members.splice(a);
                    // Delete the group document if no members are left
                    if (groupData.members.length == 0) {
                        return deleteDoc(groupSnap.ref);
                    } else {
                        return updateDoc(groupSnap.ref, {members: groupData.members});
                    }
                }
            }
            return;
        } else {
            throw new Error("Invalid group name - " + groupSnap.id);
        }
    });
}

/**
 * Searches the group collection for a group document with the given ID.
 * @param {String} searchTerm 
 */
export const searchForGroup = function(searchTerm) {
    const groupsRef = collection(db, GROUP_COLLECTION_NAME);
    const rgx = new RegExp(searchTerm);

    return getDocs(groupsRef).then(async querySnap => {

        let results = [];

        querySnap.forEach(doc => {
            if (doc.id.search(rgx) >= 0) {
                results.push({
                    name: doc.id,
                    completions: doc.data().completions
                });
            }
        });
        return results;
    });
}
