import {
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
    getUsersGroups,
    createGroup,
    addGroupMember,
    addGroupMembers,
    removeFromGroup,
    getRecentCompletions,
} from "../lib/GroupTasks.js";

import {
    getFriends
} from "../lib/FriendsAndGroups.js";

import {
    loadPreferences
} from "../lib/Helpers.js";

import {
    onAuthStateChanged
} from "firebase/auth";

import {
    doc,
    getDoc,
} from "firebase/firestore";

// section where all user groups are displayed
const groupsection = document.querySelector(".groupSection");

// represents the + icon for creating a new group
const newgroupicon = document.querySelector(".newgroupicon");

// LOADS IN THE USER'S GROUPS
async function loadGroups(user) {
    groupsection.replaceChildren();
    getUsersGroups(user.uid).then(groups =>{
        if (groups.length > 0) {
            for (const group of groups) {
                populateGroupList(group);
            }
        };
    });
}

/**
 * Populates the list of groups the user is part of.
 * @param {Object} members 
 */
function populateGroupList(groupInfo) {
    // creates a new div for each group
    const div = document.createElement("div");
    div.className = "bubblebox";

    var membersHTML = "";

    for (const currentmember of groupInfo.members) {
        // use their profile picture if they have one, otherwise, use default img
        var pfp = currentmember.profilePic
            ? currentmember.profilePic
            : "/img/default.png";

        // use their username if possible or default to uid
        var name = currentmember.username
            ? currentmember.username
            : members.uid;
        name = name.split(" ")[0];

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
        "<img src='/img/leavegroup.png' class='leavegroupicon' style='float:right;' />" +
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
        `<div class='recentgrouptask'>Get working</div>` +
        "</div>" +
        "</div>";
    
    getRecentCompletions(groupInfo.name).then(count => {
        const completionText = div.querySelector(`.recentgrouptask`);
        completionText.textContent = `Tasks done this week: ${count}`;
    });
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
                "groupedit.html?groupId=" + groupInfo.name;
        });

    // removes a user from a group when leave icon is clicked
    div
        .querySelector(".leavegroupicon")
        .addEventListener("click", async function (buttonclick) {
            buttonclick.stopPropagation(); // prevents group bubble trigger
            
            removeFromGroup(groupInfo.name, auth.currentUser.uid)
                .then(v => loadGroups(auth.currentUser.uid));
        });

    // when you click on the group box itself, redirect to the group weekly view page
    div.addEventListener("click", function (buttonclick) {
        if (buttonclick.target.closest(".taskbutton")) return; // ignore any clicks on the add task button
        window.location.href =
            "groupweeklyview.html?groupId=" + groupInfo.name;
    });

    // add the group box to the actual groups page
    groupsection.appendChild(div);
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
        "Paste an image hotlink";
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
        plusfriendicon.src = "/img/addtogroup.png";
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

        let coverPhoto = document
            .getElementById("groupCoverInput")
            .value.trim();

        if (!groupname) {
            alert("Sorry! You have to enter a group name");
            return;
        }
        if (coverPhoto.includes("dropbox"))
            coverPhoto = coverPhoto.replace("dl=0", "raw=1");

        // creating and adding both return promises so keep the callback chaining here
        createGroup(groupname, coverPhoto)
            .then(async v => {
                await addGroupMember(groupname, user.uid);
                addGroupMembers(groupname, chosenfriends);
            }).catch(e => alert("Error creating group: " + e))
            .then(v => {
                document.body.removeChild(outerpopup);
                loadGroups(user);
            });
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    await loadPreferences();
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
        const searchedkeyword = searchbar.value.toLowerCase();

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