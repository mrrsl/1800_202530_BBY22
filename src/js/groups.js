import {
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
    getUserGroups
} from "../lib/GroupTasks.js";

import {
    onAuthStateChanged
} from "firebase/auth";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    setDoc,
    query,
    where,
} from "firebase/firestore";

// section where all user groups are displayed
const groupsection = document.querySelector(".groupSection");

// represents the + icon for creating a new group
const newgroupicon = document.querySelector(".newgroupicon");

// LOADS IN THE USER'S GROUPS
async function loadGroups(user) {
    // points to the groups collection
    const groupscollection = collection(db, "groups");

    // gets each of the group docs
    const snapshot = await getDocs(groupscollection);

    // clears placeholder group boxes off of the page
    groupsection.innerHTML = "";

    // loops through each group doc & reads all fields: name, members, cover photo
    snapshot.forEach(function (docSnap) {
        const groupInfo = docSnap.data();

        // checks to see if the user logged in is one of the members
        var isUserInGroup = false;

        // only runs the loop if there's a list of members
        if (groupInfo.members) {
            for (let i = 0; i < groupInfo.members.length; i++) {
                var groupmember = groupInfo.members[i];
                if (groupmember.uid === user.uid) {
                    isUserInGroup = true;
                    break;
                }
            }
        }

        if (isUserInGroup) {
            populateGroupList(groupInfo.members || []);
        }
    });
}

/**
 * Populates the list of groups the user is part of
 */
function populateGroupList(members) {
    // creates a new div for each group
    const div = document.createElement("div");
    div.className = "bubblebox";

    var membersHTML = "";

    for (let i = 0; i < members.length; i++) {
        var currentmember = members[i];
        // use their profile picture if they have one, otherwise, use default img
        var pfp = currentmember.profilePic
            ? currentmember.profilePic
            : "../img/default.png";

        // use their username if possible or default to uid
        var name = currentmember.username
            ? currentmember.username
            : members.uid;

        // adds a span with each group member's name & pfp to the group box
        membersHTML +=
            "<span class='member'>" +
            "<img src='" +
            pfp +
            "' class='pfp' />" +
            name +
            "</span> ";
    }

    // use the cover photo if there is one, otherwise use default img
    var cover = groupInfo.coverPhoto
        ? groupInfo.coverPhoto
        : "/img/defaultgroup.jpg";

    // builds the html for each individual group box
    div.innerHTML =
        "<div class='groupname'>" +
        groupInfo.name +
        "<img src='../img/leavegroup.png' class='leavegroupicon' style='float:right;' />" +
        "</div>" +
        "<div class='aboutgroup'>" +
        "<img src='" +
        cover +
        "' class='coverPhoto' />" +
        "<div class='groupinfo'>" +
        "<div class='groupmembers'>" +
        membersHTML +
        "<button class='taskbutton'>+ Add Task</button>" +
        "</div>" +
        "<div class='recentgrouptask'>Most recent task: placeholder</div>" +
        "</div>" +
        "</div>";

    // adds flex wrap to the group boxes after a certain # of friends bc it causes the layout to break
    const groupmembers = div.querySelector(".groupmembers");
    const pfps = groupmembers.querySelectorAll(".pfp");

    if (pfps.length > 5) {
        groupmembers.style.display = "flex"; // make sure it's flex
        groupmembers.style.flexWrap = "wrap";
    }

    // redirects to the group add/edit task page when the + icon is clicked
    div
        .querySelector(".taskbutton")
        .addEventListener("click", function (buttonclick) {
            buttonclick.stopPropagation(); // prevents any triggers from clicking on the group bubble
            window.location.href =
                "sofiasnewgroupedit.html?groupId=" + docSnap.id;
        });

    // removes a user from a group when leave icon is clicked
    div
        .querySelector(".leavegroupicon")
        .addEventListener("click", async function (buttonclick) {
            buttonclick.stopPropagation(); // prevents group bubble trigger
            const groupDocRef = doc(db, "groups", docSnap.id);

            // builds a new members array without the current user
            var newmembers = []; // starts with an empty list

            if (groupInfo.members) {
                for (let i = 0; i < groupInfo.members.length; i++) {
                    var groupmember = groupInfo.members[i];
                    // only keep this person if their uid doens't match the current user's uid
                    if (groupmember.uid !== user.uid) {
                        newmembers.push(groupmember);
                    }
                }
            }

            // saves the updated group doc back to firestore
            await setDoc(groupDocRef, {
                name: groupInfo.name,
                coverPhoto: groupInfo.coverPhoto,
                members: newmembers,
            });

            // reloads the groups list so that the UI updates
            loadGroups(user);
        });

    // when you click on the group box itself, redirect to the group weekly view page
    div.addEventListener("click", function (buttonclick) {
        if (buttonclick.target.closest(".taskbutton")) return; // ignore any clicks on the add task button
        window.location.href =
            "groupweeklyview.html?groupId=" + docSnap.id;
    });

    // add the group box to the actual groups page
    groupsection.appendChild(div);
}

// GETTING THE USER'S FRIENDS FROM FIRESTORE
async function getFriends(currentUser) {
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
    const friendsIDS = [];

    // for every friendship where the user logged in is userA, add the other person, userB's uid to the list
    whereUserIsA.forEach(function (friendshipDoc) {
        friendsIDS.push(friendshipDoc.data().userB);
    });

    // vise-versa
    whereUserIsB.forEach(function (friendshipDoc) {
        friendsIDS.push(friendshipDoc.data().userA);
    });

    // empty list for storing friend profiles (turned into html later on)
    const friendslist = [];

    // loops through each friend's uid from our earlier list
    for (let i = 0; i < friendsIDS.length; i++) {
        var friendID = friendsIDS[i];

        // gets a snapshot of their profile
        const friendProfileSnap = await getDoc(doc(db, "users", friendID));

        // if their profile exists in firestore, add their info to the friendslist
        if (friendProfileSnap.exists()) {
            var friendInfo = friendProfileSnap.data(); // read all their profile data

            friendslist.push({
                uid: friendID,
                username: friendInfo.username || friendID, // username or default to uid
                profilePic: friendInfo.profilePic || "../img/defaultprofile.png", // pfp or default img
            });
        }
    }

    return friendslist; // returns the full list of friends to display across different pages
}

// THE POPUP/OVERLAY FOR CREATING A NEW GROUP
async function shownewgroupPopup(user, friendslist) {
    // gets all of the saved info on the user logged in
    const userdocref = doc(db, "users", user.uid);
    const usersnap = await getDoc(userdocref);
    const currentuserdata = usersnap.exists() ? usersnap.data() : {}; // only use the data if it exists, otherwise use an empty object

    // creates the outer popup box
    const outerpopup = document.createElement("div");
    outerpopup.className = "overlaybox";

    // creates the inner container that actually holds the buttons & input boxes
    const innercontainer = document.createElement("div");
    innercontainer.className = "groupeditcontainer";

    // the close button in the corner
    const closebutton = document.createElement("button");
    closebutton.className = "closepopup";
    closebutton.style.alignSelf = "flex-end";
    closebutton.style.fontSize = "30pt";
    closebutton.textContent = "X";
    innercontainer.appendChild(closebutton);

    // adds the 'Group Name' heading inside of the popup box
    const groupnameHeading = document.createElement("p");
    groupnameHeading.id = "mainheadings";
    groupnameHeading.textContent = "Group Name:";
    innercontainer.appendChild(groupnameHeading);

    // creates the div wrapper for the Group Name input box
    const inputbox = document.createElement("div");
    inputbox.className = "inputbubble";

    // creates the actual input box for the group name
    const groupname = document.createElement("input");
    groupname.type = "text";
    groupname.id = "groupnameInput";
    groupname.placeholder = "Enter group name";
    inputbox.appendChild(groupname);
    innercontainer.appendChild(inputbox);

    // adds the 'Cover image URL' heading inside the popup box
    const coverimgHeading = document.createElement("p");
    coverimgHeading.id = "mainheadings";
    coverimgHeading.textContent = "Cover image URL:";
    innercontainer.appendChild(coverimgHeading);

    // creates the div wrapper for the cover image input box
    const coverimgInputBox = document.createElement("div");
    coverimgInputBox.className = "inputbubble";

    // creates the actual input box for inserting the link to the cover image
    const coverimgInput = document.createElement("input");
    coverimgInput.type = "text";
    coverimgInput.id = "groupCoverInput";
    coverimgInput.placeholder =
        "Paste an Imgur Link! ex. https://i.imgur.com/...";
    coverimgInputBox.appendChild(coverimgInput);
    innercontainer.appendChild(coverimgInputBox);

    // adds the 'Add Friends' heading inside of the input box
    const friendsHeading = document.createElement("p");
    friendsHeading.id = "mainheadings";
    friendsHeading.textContent = "Add Friends:";
    innercontainer.appendChild(friendsHeading);

    // creates each friend option
    const friendoption = document.createElement("div");
    friendoption.className = "friendoptions";

    // loops through each friend in the friendslist array & attaches an <a> element to each one
    // each anchor tag uniquely represents every friend
    friendslist.forEach((friend) => {
        const link = document.createElement("a");

        // stores extra info about each friend: uid, username and pfp
        // the info gets read later when the link is clicked
        link.dataset.uid = friend.uid;
        link.dataset.username = friend.username;
        link.dataset.pfp = friend.profilePic;

        // creates & attaches each friend pfp to their link
        const pfpimage = document.createElement("img");
        pfpimage.src = friend.profilePic; // sources the pfp image
        pfpimage.className = "pfp";
        link.appendChild(pfpimage);

        // attaches username text to link
        link.appendChild(document.createTextNode(friend.username));

        // creates the icon beside each friend option
        const plusfriendicon = document.createElement("img");
        plusfriendicon.src = "../img/addtogroup.png";
        plusfriendicon.className = "addperson";
        link.appendChild(plusfriendicon);

        friendoption.appendChild(link); // attaches the anchor to each friend
    });

    // attaches the friend options to the popup box
    innercontainer.appendChild(friendoption);

    // creates the save button
    const savebutton = document.createElement("button");
    savebutton.className = "savebutton";
    savebutton.textContent = "Save";

    innercontainer.appendChild(savebutton);

    // sets up the popup box; attaches the inner to the outer container; adds it to the page
    outerpopup.appendChild(innercontainer);
    document.body.appendChild(outerpopup);

    // removes popup when X clicked
    closebutton.addEventListener("click", () => {
        document.body.removeChild(outerpopup);
    });

    // keeps track of friends chosen from the options
    let chosenfriends = [];

    // goes through every friend link
    friendoption.querySelectorAll("a").forEach((friend) => {
        friend.addEventListener("click", (event) => {
            event.preventDefault(); // stops link from redirecting

            // bundles all the info we stored earlier in the link into an object
            const friendInfo = {
                uid: friend.dataset.uid,
                username: friend.dataset.username,
                profilePic: friend.dataset.pfp,
            };

            // starts off by assuming the friend hasn't been picked yet
            let alreadyselected = false;

            // go through each friend in the list
            for (let i = 0; i < chosenfriends.length; i++) {
                // compares the uid of each friend in the list to the uid of the friend selected
                // if it matches, end it immediately to avoid duplicate friends
                if (chosenfriends[i].uid === friendInfo.uid) {
                    alreadyselected = true;
                    break;
                }
            }

            // if alreadyselected = false, then add the friend to the list of chosen friends
            if (!alreadyselected) {
                chosenfriends.push(friendInfo);
                friend.style.backgroundColor = "#e6d9dc"; // also change the option bg color
            }
        });
    });

    // SAVES THE NEWLY CREATED GROUP
    savebutton.addEventListener("click", async () => {
        // gets the group name text, removes whitespace to avoid errors when using the searchbar
        const groupname = document
            .getElementById("groupnameInput")
            .value.trim();

        const coverPhoto = document
            .getElementById("groupCoverInput")
            .value.trim();

        if (!groupname) {
            alert("Sorry! You have to enter a group name");
            return;
        }

        // the logged-in user
        const loggedinuser = {
            uid: user.uid,
            username: currentuserdata.username || user.displayName || "You",
            profilePic: currentuserdata.profilePic || "/img/defaultprofile.png",
        };

        // combines the user with the list of chosen friends
        const totalgroupmembers = [loggedinuser].concat(chosenfriends);

        // saves the new group to firestore
        await addDoc(collection(db, "groups"), {
            name: groupname,
            coverPhoto: coverPhoto || "/img/defaultgroup.jpg",
            members: totalgroupmembers,
        });

        // closes the popup
        document.body.removeChild(outerpopup);

        // reloads all of the groups
        loadGroups(user);
    });
}

// checks user's login status
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // loads groups onto the page & gets friends list from firestore if logged in
    loadGroups(user);
    const friendslist = await getFriends(user);

    // checks that the new group icon is still on the page (idk, doesn't make much sense, but it simplified the logic)
    if (newgroupicon) {
        newgroupicon.addEventListener("click", () => {
            shownewgroupPopup(user, friendslist); // opens the popup box with their friend list
        });
    }
});

// FOR THE SEARCH BAR
const searchbar = document.querySelector(".searchbar");

if (searchbar) {
    searchbar.addEventListener("input", () => {
        const searchedkeyword = searchbar.value.toLowerCase(); // standardizes the text typed in to all lowercase

        // loops through each group bubble on the page, grabs the group name from each
        document.querySelectorAll(".bubblebox").forEach((box) => {
            const nameofgroup = box.querySelector(".groupname");

            // convert text to all lowercase
            const textofgroupname = nameofgroup
                ? nameofgroup.textContent.toLowerCase()
                : "";

            // if group bubble contains the searched word, display it
            box.style.display = textofgroupname.includes(searchedkeyword)
                ? ""
                : "none";
        });
    });
}