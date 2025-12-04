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
 */

import {
    firebaseDb as db,
    firebaseAuth as auth
} from "./FirebaseInstances.js";

import {
    dateISOString
} from "./DateUtils.js";

import {
    USER_COLLECTION_NAME, GROUP_COLLECTION_NAME,
    validateTaskObj,
    user,
} from "./Database.js";

import {
    doc, getDocs, getDoc,
    setDoc, deleteDoc, updateDoc,
    query, documentId,
    where, orderBy,
    collection,
} from "firebase/firestore";


/** Separator for group names and unique tag. */
export const SEP = '\u00A0';

/** Collection name for group tasks. */
const GROUP_TASK_COLLECTION = "tasks";

/**
 * Adds a user to a group with the specified name.
 * @param {String} groupId
 * @param {String | null} userId Null to default to current user.
 */
export const addGroupMember = async function(groupId, userId) {
    if (userId == null)
        userId = auth.currentUser.uid;
    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);
    const userRef = doc(db, USER_COLLECTION_NAME, userId);
    
    return getDoc(groupRef).then(async snap => {

        if (snap.exists()) {
            const groupData = snap.data();
            // Check to avoid duplicate entry for the user
            for (const member of groupData.members) {
                if (member.uid == userId) return;
            }

            const userDoc = await getDoc(userRef);
            const userData = userDoc.data()

            groupData.members.push({
                uid: userDoc.id,
                username: userData.username ?? userDoc.id,
                profilePic: userData.profilePic ?? "/img/defaultprofile.png"
            });

            return updateDoc(groupRef, { members: groupData.members });
        } else {
            throw new Error(`Group with name ${groupId} does not exist.`);
        }
    });
}

/**
 * Add multiple members at once to group.
 * @param {String} groupId 
 * @param {Array<Object>} memberList Members will have fields uid, username, and profilePic
 * @remark Front end code uses member objects rather than straight UIDs so we'll use member objects here as the argument.
 */
export const addGroupMembers = async function(groupId, memberList) {
    if (groupId == null) 
        throw new Error("Need group name");
    
    const groupDoc = doc(db, GROUP_COLLECTION_NAME, groupId);

    return getDoc(groupDoc).then(async snap => {
        if (snap.exists()) return snap.data();
    }).then(async groupInfo => {
        groupInfo.members = groupInfo.members.concat(memberList);
        return updateDoc(groupDoc, { members: groupInfo.members });
    });
}

/**
 * Creates a group with the given group name.
 * @param {String} groupId Group document ID.
 * @param {String} coverPhoto Hotlinked image URL.
 * @returns {Promise<void> | Promise<DocumentData>} Resolves to void if a new group was created.
 */
export const createGroup = async function(groupId, coverPhoto) {
    if (groupId == null)
        throw new Error("No group name given");
    if (coverPhoto == null || coverPhoto.length == 0)
        coverPhoto = "/img/defaultgroup.jpg";

    const groupCollection = collection(db, GROUP_COLLECTION_NAME);
    const existingGroups = await getDocs(groupCollection);
    const defaultGroupDoc = {
        members: [],
        completed: 0,
        coverPhoto: coverPhoto
    };    

    // Ensure unique group ids for the task within a group
    let existingNameSet = new Set(existingGroups.docs.map(doc => doc.id));
    
    if (existingNameSet.has(groupId)) {
        const existingGroupRef = doc(db, GROUP_COLLECTION_NAME, groupId);
        return getDoc(existingGroupRef).then(snap => snap.data());
    } else {
        const groupDocRef = doc(db, GROUP_COLLECTION_NAME, groupId);
        return setDoc(groupDocRef, defaultGroupDoc);
    }
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

    return getDoc(groupRef).then(async snap => {

        if (snap.exists()) {
            return snap.data().members;  
        } else {
            throw new Error(`Group with name '${groupId}' does not exist.`)
        }

    }).then(async memberList => {

        let memberOutput = [];

        for (const member of memberList) {
            const memberRef = doc(db, USER_COLLECTION_NAME, member.uid);
            let memberDoc = await getDoc(memberRef);
            if (memberDoc.exists()) {
                const memberData = memberDoc.data()
                memberOutput.push({
                    username: memberData.username,
                    email: memberData.email,
                    profilePic: memberData.profilePic
                })
            }
        }
        return memberOutput;
    });
}

/**
 * Write the given task object to the firestore for a specified group.
 * @param {String} groupId 
 * @param {Option} task
 */
export const addTaskToGroup = async function(groupId, task) {

    validateTaskObj(task);
    let taskId = task.dateISO + SEP + task.title;
    task.createdAt = Date.now();

    let groupDocRef = doc(db, GROUP_COLLECTION_NAME, groupId);
    let targetTaskDoc = doc(db, GROUP_COLLECTION_NAME, groupId, GROUP_TASK_COLLECTION, taskId);

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
 * @param {String} taskObj 
 * @param {String} groupId 
 * @param {String | null} user Default to current user if unspecified. 
 * @return {Promise} Return the result of removeGroupTask if everyone completed it
 */
export const completeGroupTask = async function(taskId, groupId, user) {
    if (user == null)
        user = auth.currentUser.uid;
    if (groupId == null)
        throw new Error("Need group name");

    const taskRef = doc(db, GROUP_COLLECTION_NAME, groupId, "tasks", taskId);
    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);

    return getDoc(taskRef).then(async snap => {

        if (snap.exists()) {
            let taskData = snap.data();
            let group = await getDoc(groupRef);
            group = new Set(group.data().members);
            
            if (taskData.completed == null) taskData.completed = [];

            taskData.completed.push(user);
            let completedSet = new Set(taskData.completed);

            if (group.difference(completedSet).size == 0) {
                return removeGroupTask(taskObj, groupId);
            } else {
                return updateDoc(taskRef, {completed: taskData.completed});
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
    if (groupId == null) return;

    const groupRef = doc(db, GROUP_COLLECTION_NAME, groupId);

    return getDoc(groupRef).then(async snap => {

        if (snap.exists()) {
            let memberList = snap.data().members;

            for (let a = 0; a < memberList.length; a++) {

                if (memberList[a].uid == userId) {
                    memberList.splice(a);
                    if (memberList.length > 0)
                        return updateDoc(groupRef, {members: memberList});
                    else {
                        return deleteDoc(groupRef);
                    }
                }
            }
        }
    });
}

/**
 * Searches the group collection for a group document with the given ID.
 * @param {String} searchTerm 
 */
export const searchForGroup = async function(searchTerm) {
    const groupsRef = collection(db, GROUP_COLLECTION_NAME);
    const rgx = new RegExp(searchTerm);

    return getDocs(groupsRef).then(async querySnap => {

        let results = [];
        querySnap.forEach(doc => {
            if (doc.id.search(rgx) >= 0) {
                let groupInfo = doc.data();
                results.push({
                    name: doc.id,
                    completions: groupInfo.completions,
                    memberCount: groupInfo.members.length,
                });
            }
        });
        return results;
    });
}

/**
 * Get an array of group docs that the user is a part of.
 * @param {String | null} userId Defaults to current user ID when set to null.
 * @return {Promise<Array<Object>>}
 */
export const getUsersGroups = async function(userId) {
    if (userId == null) userId = auth.currentUser.uid;

    const groupsRef = collection(db, GROUP_COLLECTION_NAME);
    

    return getDocs(groupsRef).then(async allGroups => {

        let groups = [];
        allGroups.forEach(doc => {

            const groupData = doc.data();
            for (const memberInfo of groupData.members) {
                if (memberInfo.uid == userId) {
                    groupData.name = doc.id;
                    groups.push(groupData);
                    break;
                }
            }
        });
        return groups

    });
}
