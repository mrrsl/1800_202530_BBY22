import {
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
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

// search box
const searchbox = document.querySelector(".searchbar");

// the container for all friend boxes
const allfriendscontainer = document.querySelector(".friendscontainer");

/* FOR CREATING A SINGLE FRIEND'S BOX
 * params:
 * - userinfo: all of the user's info from firestore; name, email, pfp
 * - uid: the user's id
 * - forCurrentUser: represents whether or not this box is for the user currently logged in
 * - showCompletedTasks: true if we should show the total # of completed tasks for that user (neceessary for the search bar)
 * */
function createFriendBox(
    userinfo,
    uid,
    forCurrentUser = false,
    showCompletedTasks = true
) {
    // creates the outer container for the friend box
    const friendbox = document.createElement("div");
    friendbox.className = "friendbox";

    // creates an image for each friend's pfp
    const profileimg = document.createElement("img");
    profileimg.src = userinfo.profilePic || "/img/defaultprofile.png";
    profileimg.className = "profilepic";
    friendbox.appendChild(profileimg);

    // creates the container for each friend's name & email
    const friendinfo = document.createElement("div");
    friendinfo.className = "friendinfo";

    // creates a div for each friend's name (including your own, so that you can compare task stats)
    const friendname = document.createElement("div");
    friendname.className = "friendname";
    friendname.textContent = forCurrentUser // if the box happens to be for the current user
        ? userinfo.username || "You" // it should either display either 'you' or their actual username
        : userinfo.username || "";
    friendinfo.appendChild(friendname); // add the name into the container

    // creates another container exclusively for email
    const email = document.createElement("div");
    email.className = "friendemail";
    email.textContent = userinfo.email || ""; // only shows the email if it can find one
    friendinfo.appendChild(email);

    // adds the entire information section/container into the main friend box
    friendbox.appendChild(friendinfo);

    // note: showCompletedTasks is only false for search results (since you shouldn't be able to see the # of completed tasks for someone who isn't a friend)
    if (showCompletedTasks) {
        // creates a container for the # of completed tasks
        const completedtasks = document.createElement("div");
        completedtasks.className = "leaderboardtasks";
        completedtasks.textContent =
            (userinfo.tasksCompleted || 0) + " tasks completed this week";
        friendbox.appendChild(completedtasks);
    }

    // only shows the add to group & unfriend icons if the box isn't for the current user and if we're in the friends list
    // note: showCompletedTasks is always true in the friends list (we should always be able to see the leaderboard for friends)
    if (!forCurrentUser && showCompletedTasks) {
        // creates the add to group icon
        const addToGroupicon = document.createElement("img");
        addToGroupicon.src = "/img/addtogroup.png";
        addToGroupicon.className = "addToGroup";
        addToGroupicon.addEventListener(
            "click",
            () => showaddtogroupPopup(auth.currentUser, uid) // when clicked, opens up the add to group popup
        );
        friendbox.appendChild(addToGroupicon);

        // creates & adds the unfriend icon to the box
        const unfriendicon = document.createElement("img");
        unfriendicon.src = "/img/unfriend.png";
        unfriendicon.className = "unfriend";
        unfriendicon.addEventListener("click", async () => {
            await removeFriend(auth.currentUser.uid, uid); // uses the helper function (from friendsandgroups.js)
            loadfriendslist(auth.currentUser); // refreshes the friends list on click
        });
        friendbox.appendChild(unfriendicon);
    }

    return friendbox; // returns a fully finished friends box, but doesn't add it to the page just yet
}

// LOADS IN THE USER'S FRIENDS LIST
async function loadfriendslist(user) {
    allfriendscontainer.innerHTML = ""; // removes placeholder friends

    const loggedinuser = await getDoc(doc(db, "users", user.uid));

    // shows the logged in user at the top of the friends list
    if (loggedinuser.exists()) {
        const loggedInUsersInfo = loggedinuser.data();
        // creates a friend box for the user currently logged in
        const loggedInUsersBox = createFriendBox(
            loggedInUsersInfo,
            user.uid,
            true,
            true
        );

        // adds the user's box to the top of the list
        allfriendscontainer.appendChild(loggedInUsersBox);
    }

    // references the friendships collection
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

    // loops through friendships where the current user is userA
    for (let i = 0; i < friendshipsWhereUserIsA.docs.length; i++) {
        const friendshipDoc = friendshipsWhereUserIsA.docs[i]; // gets each doc
        const friendshipInfo = friendshipDoc.data(); // gets the fields for each friendship

        // adds the other person (userB's) ID to the list of friend ids
        friendIDS.push(friendshipInfo.userB);
    }

    // the same thing, but with userB
    for (let i = 0; i < friendshipsWhereUserIsB.docs.length; i++) {
        const friendshipDoc = friendshipsWhereUserIsB.docs[i];
        const friendshipInfo = friendshipDoc.data();
        friendIDS.push(friendshipInfo.userA);
    }

    // goes through the list of friend IDS
    for (let i = 0; i < friendIDS.length; i++) {
        const friendID = friendIDS[i];
        // gets that friend's doc
        const friendDoc = await getDoc(doc(db, "users", friendID));

        if (friendDoc.exists()) {
            const friendInfo = friendDoc.data(); // gets the data fields from their doc; username, pfp, email
            // builds the friends box & adds it to the list
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
    // gets the text typed in, removes any extra whitespace, makes it case-insensitive
    const searchedtext = searchbox.value.trim().toLowerCase();

    // finds & removes all old elements with the searchresult class
    document
        .querySelectorAll(".searchresult")
        .forEach((oldresult) => oldresult.remove());

    // doesn't return anything if the searchbox was empty
    if (!searchedtext) return;

    // gets all of the users from firestore
    const allusers = await getDocs(collection(db, "users"));

    // loops through each person
    allusers.forEach((userdoc) => {
        // gets the fields for each user
        const userinfo = userdoc.data();

        // converts each username to lowercase
        const username = userinfo.username.toLowerCase();

        if (!username.includes(searchedtext)) return; // if the username doesn't match the text you searched up in the searchbox, then skip this user
        if (auth.currentUser && userdoc.id === auth.currentUser.uid) return; // skip yourself (don't want to show yourself in the search results)

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

        // adds the friend box that we just created to the top of the page so it looks like a search result
        allfriendscontainer.prepend(friendbox);
    });
});

// SHOWS THE HIDDEN HTML POPUP FOR ADDING A FRIEND TO A GROUP
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
        addbutton.addEventListener("click", async () => {
            await addGroupMember(group.id, friendUid);
            hiddenPopup.style.display = "none"; // hides the popup box after adding a friend to a group
        });
        option.appendChild(addbutton); // adds the button to each group option

        hiddenOptionContainer.appendChild(option); // adds it to the container
    });

    hiddenPopup.style.display = "flex";

    // hides the popup box when the x button is clicked
    hiddenPopup.querySelector(".closebutton").onclick = () => {
        hiddenPopup.style.display = "none";
    };
}

// loads in the friends list only if they're logged in
onAuthStateChanged(auth, (user) => {
    if (user) loadfriendslist(user);
    else return;
});