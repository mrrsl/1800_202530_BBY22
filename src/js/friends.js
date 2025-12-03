import {
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import {
    addGroupMember
} from "../lib/GroupTasks.js";

import {
    addFriend,
    removeFriend,
    getUserGroups,
} from "../lib/FriendsAndGroups.js";

import {
    user as getUser
} from "../lib/Database.js";

import {
    loadPreferences
} from "../lib/Helpers.js";

// search box
const searchbox = document.querySelector(".searchbar");

// the container for all friend boxes
const allfriendscontainer = document.querySelector(".friendscontainer");

/**
 * Generates a box containing a friend's information.
 * @param {String} userinfo all of the user's info from firestore; name, email, pfp
 * @param {String} uid the user's id
 * @param {boolean} forCurrentUser represents whether or not this box is for the user currently logged in
 * @param {boolean} showCompletedTasks true if we should show the total # of completed tasks for that user (neceessary for the search bar)
 */
function createFriendBox(
    userinfo,
    uid,
    forCurrentUser = false,
    showCompletedTasks = true
) {
    /** Outer container. */
    const friendbox = document.createElement("div");
    friendbox.className = "friendbox";

    /** Profile PFP. */
    const profileimg = document.createElement("img");
    profileimg.src = userinfo.profilePic || "/img/defaultprofile.png";
    profileimg.className = "profilepic";
    friendbox.appendChild(profileimg);

    /** Email and Username wrappers. */
    const friendinfo = document.createElement("div");
    friendinfo.className = "friendinfo";

    /** Name text. */
    const friendname = document.createElement("div");
    friendname.className = "friendname";
    friendname.textContent = userinfo.username;
    friendinfo.appendChild(friendname);

    /** Email text. */
    const email = document.createElement("div");
    email.className = "friendemail";
    email.textContent = userinfo.email || ""; // only shows the email if it can find one
    friendinfo.appendChild(email);

    friendbox.appendChild(friendinfo);

    // note: showCompletedTasks is only false for search results (since you shouldn't be able to see the # of completed tasks for someone who isn't a friend)
    if (showCompletedTasks) {
        /** Competed task text. */
        const completedtasks = document.createElement("div");
        completedtasks.className = "leaderboardtasks";
        completedtasks.textContent =
            (userinfo.tasksCompleted || 0) + " tasks completed";
        friendbox.appendChild(completedtasks);
    }

    // only shows the add to group & unfriend icons if the box isn't for the current user and if we're in the friends list
    // note: showCompletedTasks is always true in the friends list (we should always be able to see the leaderboard for friends)
    if (!forCurrentUser && showCompletedTasks) {
        /** Add-group icon. */
        const addToGroupicon = document.createElement("img");
        addToGroupicon.src = "/img/addtogroup.png";
        addToGroupicon.className = "addToGroup";
        addToGroupicon.addEventListener( "click", (ev) => {
            ev.stopPropagation();
            showaddtogroupPopup(auth.currentUser, uid);
        });
        friendbox.appendChild(addToGroupicon);

        /** Unfriend icon. */
        const unfriendicon = document.createElement("img");
        unfriendicon.src = "/img/unfriend.png";
        unfriendicon.className = "unfriend";
        unfriendicon.addEventListener("click", async (ev) => {
            ev.stopPropagation();
            await removeFriend(auth.currentUser.uid, uid);
            loadfriendslist(auth.currentUser);
        });
        friendbox.appendChild(unfriendicon);
    }
    friendbox.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        await showFriendProfile(uid);
    })

    return friendbox;
}

/**
 * Loads the logged-in user's friend list.
 * @param {User} user 
 */
async function loadfriendslist(user) {
    allfriendscontainer.innerHTML = "";
    const loggedinuser = await getUser(user.uid);

    // shows the logged in user at the top of the friends list
    if (loggedinuser != null) {
        /** Friend element for the currently logged in user. */
        const loggedInUsersBox = createFriendBox(
            loggedinuser,
            user.uid,
            true,
            true
        );
        allfriendscontainer.appendChild(loggedInUsersBox);
    }
    const friendshipscollection = collection(db, "friendships");

    /**
     * friendships are stored as friendship docs containing a pair of ids known as userA & userB
     * because the logged in user could be in either slot for userA or userB, we have to check both sides so that we don't miss any friends
     * this essentially collects the ids of all of your friends, no matter which side you were stored on
     */
    const friendshipsWhereUserIsA = await getDocs(
        query(friendshipscollection, where("userA", "==", user.uid))
    );
    const friendshipsWhereUserIsB = await getDocs(
        query(friendshipscollection, where("userB", "==", user.uid))
    );

    // for storing all ids of the user's friends
    const friendIDS = [];

    for (let i = 0; i < friendshipsWhereUserIsA.docs.length; i++) {
        const friendshipDoc = friendshipsWhereUserIsA.docs[i];
        const friendshipInfo = friendshipDoc.data(); 
        friendIDS.push(friendshipInfo.userB);
    }

    for (let i = 0; i < friendshipsWhereUserIsB.docs.length; i++) {
        const friendshipDoc = friendshipsWhereUserIsB.docs[i];
        const friendshipInfo = friendshipDoc.data();
        friendIDS.push(friendshipInfo.userA);
    }

    for (let i = 0; i < friendIDS.length; i++) {
        const friendID = friendIDS[i];
        const friendInfo = await getUser(friendID);

        if (friendInfo != null) {
            const friendBox = createFriendBox(
                friendInfo,
                friendID,
                false,
                true
            );
            allfriendscontainer.appendChild(friendBox);
        }
    }
}

// FOR THE SEARCH BAR
searchbox.addEventListener("input", async () => {
    /** Lowercase search-input value. */
    const searchedtext = searchbox.value.trim().toLowerCase();

    // Clear previous search
    document
        .querySelectorAll(".searchresult")
        .forEach((oldresult) => oldresult.remove());

    if (!searchedtext) return;

    const allusers = await getDocs(collection(db, "users"));

    // loops through each person
    allusers.forEach((userdoc) => {
        // gets the fields for each user
        const userinfo = userdoc.data();
        // converts each username to lowercase
        const username = userinfo.username.toLowerCase();

        if (!username.includes(searchedtext)) return; // if the username doesn't match the text you searched up in the searchbox, then skip this user
        if (auth.currentUser && userdoc.id === auth.currentUser.uid) return;

        // creates a friend box for the user that matches the search result;
        // params are: the user's data, their id, not the current user, don't show leaderboard tasks
        const friendbox = createFriendBox(userinfo, userdoc.id, false, false);

        // adds the searchresult class to this friends box so we know to remove it later
        friendbox.classList.add("searchresult");

        // creates the add friend button
        const addfriendbutton = document.createElement("button");
        addfriendbutton.className = "addfriendbutton";
        addfriendbutton.textContent = "Add Friend";

        // calls addFriend() from friends & groups.js; adds them as a friend in firestore
        addfriendbutton.addEventListener("click", async () => {
            await addFriend(userdoc.id);
            if (auth.currentUser) loadfriendslist(auth.currentUser); // reloads the friends list
        });

        friendbox.appendChild(addfriendbutton);
        allfriendscontainer.prepend(friendbox);
    });
});

/**
 * Renders hidden HTML popup for adding a friend to a group.
 * @param {User} user 
 * @param {String} friendUid 
 */
async function showaddtogroupPopup(user, friendUid) {
    const usersGroups = await getUserGroups(user); // gets all groups for the logged in user

    const hiddenPopup = document.getElementById("hiddengroupbox");
    const hiddenOptionContainer = document.getElementById("groupOptions");

    // clears any options that may have loaded in previously
    hiddenOptionContainer.innerHTML = "";

    usersGroups.forEach((group) => {
        // creates the wrapper for all the group options
        const option = document.createElement("div");
        option.className = "groupOptionRow";

        // creates the text for each group option
        const span = document.createElement("span");
        span.textContent = group.name;
        option.appendChild(span);

        // creates the add to group button
        const addbutton = document.createElement("button");
        addbutton.textContent = "Add";
        addbutton.className = "addbutton"
        addbutton.addEventListener("click", async (ev) => {
            ev.stopPropagation();
            await addGroupMember(group.id, friendUid);
            hiddenPopup.style.display = "none"; // hides the popup box after adding a friend to a group
        });
        option.appendChild(addbutton); // adds the button to each group option

        hiddenOptionContainer.appendChild(option); // adds it to the container
    });

    hiddenPopup.style.display = "flex";

    // hides the popup box when the x button is clicked
    hiddenPopup.querySelector(".closebutton").onclick = () => {

    };
}

// BRAND NEW SECTION HERE: The Profile Popups W/ Completed Group Tasks
async function showFriendProfile(frienduid) {
    const overlay = document.getElementById("profilebubble");
    const friendname = document.getElementById("profilename");
    const friendpfp = document.getElementById("friendpfp");
    const sharedtaskslist = document.getElementById("sharedtasklist");

    // clears out any old tasks
    sharedtaskslist.innerHTML = "";

    // loads in that friend's user doc from firestore
    const friendref = doc(db, "users", frienduid);
    const friendrecord = await getDoc(friendref);
    // stops if the friend's doc doesn't exist
    if (!friendrecord.exists()) return;
    const frienddata = friendrecord.data();

    // fills in the box will all of their info
    friendname.textContent = frienddata.username || "unknown";
    friendpfp.src = frienddata.profilePic || "../img/defaultprofile.png";

    // checks the user's id to see what groups they're a part of
    const currentuser = auth.currentUser;
    if (!currentuser) return;

    // loops through each group to find the ones that both them and the friend are in
    const groupsfound = await getDocs(collection(db, "groups"));

    // keeps track of whether or not any tasks were added, used to show an empty message if there are none
    let addedanytasks = false;

    // goes through each group and checks if people are members
    for (let i = 0; i < groupsfound.docs.length; i++) {
        const groupdoc = groupsfound.docs[i];
        const groupdata = groupdoc.data();

        // if for some reason, there is a group with no members, just default to an empty array
        const membersarray = Array.isArray(groupdata.members) ? groupdata.members : [];

        // loops through each group member
        let currentuserinthisgroup = false;
        let friendinthisgroup = false;
        for (let j = 0; j < membersarray.length; j++) {
            const member = membersarray[j];
            if (member && member.uid === currentuser.uid) currentuserinthisgroup = true;
            if (member && member.uid === frienduid) friendinthisgroup = true;
            if (currentuserinthisgroup && friendinthisgroup) break; // stops early if we've found both of them
        }

        // if either person is not in the group, then skip that group altogether
        if (!currentuserinthisgroup || !friendinthisgroup) continue;

        // points to the new subcollection with completed tasks for the group
        const completedtasks = collection(db, "groups", groupdoc.id, "completedTasks");
        const completedtasksresult = await getDocs(completedtasks);

        // loops through each completed task
        for (let k = 0; k < completedtasksresult.docs.length; k++) {
            const taskdoc = completedtasksresult.docs[k];
            const taskdata = taskdoc.data();

            // only shows tasks that are marked as done and completed by this specific friend
            if (taskdata && taskdata.done && taskdata.completedBy === frienduid) {
                const listitem = document.createElement("li");

                const groupbadge = document.createElement("span");
                groupbadge.className = "taskaccentbox";
                groupbadge.textContent = groupdata.name || "group";

                const tasktitle = document.createElement("span");
                tasktitle.className = "taskname";
                tasktitle.textContent = taskdata.title || "task with no title!";

                listitem.appendChild(groupbadge);
                listitem.appendChild(tasktitle);
                sharedtaskslist.appendChild(listitem);

                if (sharedtaskslist.children.length >= 5) {
                    await Promise.all(
                        completedtasksresult.docs.map(d =>
                            deleteDoc(doc(db, "groups", groupdoc.id, "completedTasks", d.id))
                        )
                    );
                    sharedtaskslist.innerHTML = "";
                    sharedtaskslist.classList.add("empty");
                }
                addedanytasks = true;
            }
        }
    }

    // shows an empty placeholder if no tasks were added
    if (!addedanytasks) {
        sharedtaskslist.classList.add("empty");
    } else {
        sharedtaskslist.classList.remove("empty");
    }

    // shows the popup box
    overlay.style.display = "flex";

    // the close button
    overlay.querySelector(".closebutton").onclick = () => {
        overlay.style.display = "none";
    };
}

onAuthStateChanged(auth,async (user) => {
    if (user) {
        loadPreferences();
        loadfriendslist(user);
    } else return;
});