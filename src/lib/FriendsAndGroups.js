import {
    firebaseDb as db,
    firebaseAuth as auth
} from "./FirebaseInstances.js";

import {
    doc,
    getDoc,
    query,
    where,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
} from "firebase/firestore";

const USER_COLLECTION = "users";
const GROUP_COLLECTION = "groups";

// Add a friend by creating a new friendship doc
export async function addFriend(frienduid) {
    const signedinuser = auth.currentUser;
    if (!signedinuser) {
        return;
    }

    const friendshipscollection = collection(db, "friendships");

    await addDoc(friendshipscollection, {
        userA: signedinuser.uid,
        userB: frienduid,
        createdAt: Date.now(),
    });
}

// Remove a friend by finding and deleting the friendship document that matches
export async function removeFriend(currentuserid, frienduid) {
    const friendshipscollection = collection(db, "friendships");
    const friendshipsdocs = await getDocs(friendshipscollection);

    for (const friendshipdoc of friendshipsdocs.docs) {
        const friendshipdata = friendshipdoc.data();
        const matchA =
            friendshipdata.userA === currentuserid &&
            friendshipdata.userB === frienduid;
        const matchB =
            friendshipdata.userB === currentuserid &&
            friendshipdata.userA === frienduid;

        if (matchA || matchB) {
            await deleteDoc(doc(db, "friendships", friendshipdoc.id));
        }
    }
}

// Get all groups that include the current user
export async function getUserGroups(signedinuser) {
    const userid = signedinuser.uid;
    const groupscollection = collection(db, "groups");
    const groupsdocs = await getDocs(groupscollection);

    const usergroups = [];

    for (const groupdoc of groupsdocs.docs) {
        const groupdata = groupdoc.data();
        if (groupdata.members) {
            for (const member of groupdata.members) {
                if (member.uid === userid) {
                    usergroups.push({ id: groupdoc.id, name: groupdata.name });
                    break;
                }
            }
        }
    }

    return usergroups;
}
/**
 * Get info for all users the current user is friends with.
 * @param {String} currentUser 
 * @returns {Array} Array with objects of structure {uid, username, profile pic}.
 */
export const getFriends = async function(currentUser) {
    const frienshipscollection = collection(db, "friendships"); // points to friendships collection

    // note: in the database, friendship docs are structured so that userA represents one person's uid and userB is the other friend's uid

    // finds friendships where the current user is userA
    const whereUserIsA = await getDocs(
        query(frienshipscollection, where("userA", "==", currentUser.uid))
    );

    // friendships where the current user is userB
    const whereUserIsB = await getDocs(
        query(frienshipscollection, where("userB", "==", currentUser.uid))
    );

    // an empty list for all the uids of this user's friends
    const friendsIDS = new Set();

    // for every friendship where the user logged in is userA, add the other person, userB's uid to the list
    whereUserIsA.forEach(function (friendshipDoc) {
        friendsIDS.add(friendshipDoc.data().userB);
    });

    // vise-versa
    whereUserIsB.forEach(function (friendshipDoc) {
        friendsIDS.add(friendshipDoc.data().userA);
    });

    // empty list for storing friend profiles (turned into html later on)
    const friendslist = [];

    // loops through each friend's uid from our earlier list
    for (const friendID of friendsIDS) {

        // gets a snapshot of their profile
        const friendProfileSnap = await getDoc(doc(db, "users", friendID));

        // if their profile exists in firestore, add their info to the friendslist
        if (friendProfileSnap.exists()) {
            var friendInfo = friendProfileSnap.data(); // read all their profile data

            friendslist.push({
                uid: friendID,
                username: friendInfo.username || friendID, // username or default to uid
                profilePic: friendInfo.profilePic || "/img/defaultprofile.png", // pfp or default img
            });
        }
    }

    return friendslist; // returns the full list of friends to display across different pages
}