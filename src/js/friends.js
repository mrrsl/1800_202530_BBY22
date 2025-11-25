import {
    userFriends,
    addFriend, deleteFriend,
    user, userPreferences,
    searchUsers
} from "/lib/Database.js";

import {
    getGroupTasks, getGroupMembers,
    createGroup, addGroupMember,
    searchForGroup, removeGroupTask
} from "/lib/GroupTasks.js";

import {
    authWrapper
} from "/lib/FirebaseInstances.js";

// The default color (pink)
const defaultAccentColor = "#fff5fa";
// Search components so we can append search results
const searchContainer = document.querySelector(".searchbarcontainer");
const searchBar = searchContainer.querySelector(".searchbar");
const searchResults = document.getElementById("searchresults");
// Buttons
const memberButton = document.getElementById("viewmemberbutton");
const groupButton = document.getElementById("viewgroupbutton");

const friendsContainer = document.querySelector(".friendscontainer");
const groupsContainer = document.querySelector(".taskcontainer > #taskList");

// User info cache, populated on auth state change
let userInfo;
// Group info cache, populated on auth state change
let groupInfo;

/** Search matching usernames and display the resutls. */
async function populateSearch(term) {

    let addButton = document.createElement("button");
    addButton.setAttribute("id", "creategroupbutton");
    addButton.innerText = "Create Group named '" + term + "'";
    addButton.addEventListener("click", () => {
        createGroup(term).then(async () => {
            return addGroupMember()
        }).catch((error) => {
            alert("Failed to create group: " + error.message);
        });
    });
    searchResults.appendChild(addButton);

    let resultArray = await searchForGroup(term);

    for (let result of resultArray) {
        let resultElement = resultDisplay(
            result.name,
            result.memberCount
        );
        searchResults.appendChild(resultElement);
    }

}
/**
 * Populate the group member list.
 * @param {boolean} hasGroup Whether the user has a group or not.
 */
function populateGroupMembers(hasGroup) {
    friendsContainer.innerHTML = "";

    if (hasGroup) {
        getGroupMembers(userInfo.group).then(memberArray => {
            for (let mem of memberArray) {
                let memberElement = friendBox(
                    mem.username,
                    mem.email,
                    0,
                    mem.uid
                );
                friendsContainer.appendChild(memberElement);
            }
        });
    } else {
        let noGroupMessage = document.createElement("p");   
        friendsContainer.appendChild(noGroupMessage);
        noGroupMessage.innerText = "You are not in a group.";
    }
}

/**
 * Populate the group task list.
 * @param {boolean} hasGroup Whether the user has a group or not.
 */
function populateGroupTasks(hasGroup) {
    groupsContainer.innerHTML = "";

    if (hasGroup) {
        for (let taskId of Object.keys(groupInfo.tasks)) {
            let taskObj = groupInfo.tasks[taskId];
            let taskElement = taskBox(taskObj);
            groupsContainer.appendChild(taskElement);
        }
    } else {
        searchContainer.style.display = "flex";
        let noGroupMessage = document.createElement("p");   
        groupsContainer.appendChild(noGroupMessage);
        noGroupMessage.innerText = "You are not in a group.";
    }
}

/**
 * Retrieve group data from the server and populates the information on the page.
 */
async function loadGroupData() {

    try {
        groupInfo = {
            members: await getGroupMembers(userInfo.group),
            tasks: await getGroupTasks(userInfo.group)
        }
        var hasGroup = true;
    } catch (error) {
        console.error(error);
        var hasGroup = false;
    }
    populateGroupMembers(hasGroup);
    populateGroupTasks(hasGroup);
    searchContainer.style.display = hasGroup ? "none" : "flex";
}

/** Generates result display items. Get uid from wrapper.uid. */
function resultDisplay(name, memberCount) {
    /*
    div.friendbox
        div.resulttext
            p.friendname
            p.friendusername
        i.addfriendicon
    */
    let wrapper = document.createElement("div");
    wrapper.classList.add("resultwrapper");
    let textWrapper = document.createElement("div");
    textWrapper.classList.add("resulttext");

    let addIcon = document.createElement("i");
    addIcon.classList.add("addfriendicon");
    addIcon.addEventListener("click", addHandler.bind(addIcon, name));

    let nameP = document.createElement("p");
    nameP.classList.add("groupname");
    nameP.innerText = name;

    let countText = document.createElement("p");
    countText.classList.add("membercounttext");
    countText.innerText = memberCount + " members";

    textWrapper.append(nameP, countText);
    wrapper.appendChild(textWrapper);
    wrapper.appendChild(addIcon);

    return wrapper;
}

/** Element generator for the each retreived friend. */
function friendBox(name, email, completions, uid) {

    let wrapper = document.createElement("div");
    wrapper.classList.add("friendbox");

    let unfriend = document.createElement("img");
    unfriend.classList.add("unfriend");
    unfriend.src = "/img/unfriend.png";
    wrapper.append(unfriend);
    unfriend.firebaseUID = uid;
    unfriend.addEventListener("click", unfriendHandler);

    let addtogroup = document.createElement("img");
    addtogroup.classList.add("addToGroup");
    addtogroup.src = "/img/addtogroup.png";
    wrapper.append(addtogroup);

    let dp = document.createElement("img");
    dp.classList.add("profilepic");
    wrapper.append(dp);

    let infoBox = document.createElement("div");
    infoBox.classList.add("friendinfo");
    wrapper.append(infoBox);

    let friendName = document.createElement("div");
    friendName.classList.add("friendname");
    friendName.innerText = name;

    let friendEmail = document.createElement("div");
    friendEmail.classList.add("friendusername");
    friendEmail.innerText = email;
    infoBox.append(friendName, friendEmail);

    let taskCount = document.createElement("div");
    taskCount.classList.add("leaderboardtasks");
    taskCount.innerText = completions + " tasks completed this week";
    wrapper.append(taskCount);

    return wrapper;
}

/** Element generator for each task box in the group view. */
function taskBox(taskObj) {
    
    const element = document.createElement("li");
    element.classList.add("taskbody");
    const textElement = document.createElement("div");
    const deleteButton = document.createElement("button");
    const checkButton = document.createElement("button");
    const infoBar = document.createElement("div");
    infoBar.classList.add("bottominfo");
    const alsoCompleted = document.createElement("div");
    infoBar.append(alsoCompleted, checkButton, deleteButton);


    deleteButton.innerText = "X";
    checkButton.innerText = "✓";
    textElement.innerText = taskObj.desc;

    deleteButton.addEventListener("click", async () => {
        removeGroupTask(taskObj, groupInfo.id);
        groupInfo.tasks = await getGroupTasks(userInfo.group);
        populateGroupTasks(Object.keys(groupInfo.tasks).length > 0);
    });
    checkButton.addEventListener("click", async () => {
        completeGroupTask(taskObj, groupInfo.id);
        groupInfo.tasks = await getGroupTasks(userInfo.group);
        populateGroupTasks(Object.keys(groupInfo.tasks).length > 0);
        checkButton.classList.add("done");
    });

    element.append(textElement, infoBar);
    return element;
}

/** Load user data and group info.
 * Run after auth check to make sure the user ID is populated.
 */
async function loadData() {
    userInfo = await user();
    loadGroupData();

    let prefs = await userPreferences();
    let friends = await userFriends() ?? [];

    const friendsContainer = document.querySelector(".friendscontainer");
    friendsContainer.innerHTML = "";

    for (let friendId of friends) {
        let friendData = await user(friendId);
        let friendElement = friendBox(
        friendData.username,
        friendData.email,
        0,
        friendId
        );
        friendsContainer.appendChild(friendElement);
    }
    changeAccentColor(prefs.accentColor || defaultAccentColor);
}

/** Changes accent color on select elements that rely on the CSS var. */
function changeAccentColor(colorString) {
    document.documentElement.style.setProperty(
        "--accent-color",
        colorString
    );
}

function searchHandler(event) {
    if (event.key !== "Enter") return;

    let term = searchBar.value.trim();
    searchResults.innerHTML = "";
    if (term === "") {
        return;
    }
    populateSearch(term);
}

/** Handles clicking on the add button for search results. */
function addHandler(groupId, event) {
    addGroupMember(groupId).then(() => {
        alert("Joined " + groupId + "!");
        loadData();
        searchResults.innerHTML = "";
    }).catch((error) => {
        alert("Failed to join: " + groupId);
    });
}

function unfriendHandler(event) {
    let unfriendTarget = this.firebaseUID;
    deleteFriend(unfriendTarget).then(() => {
            alert("Friend removed.");
            loadData();
        });
}

function groupButtonHandler(event) {
    friendsContainer.style.display = "none";
    groupsContainer.style.display = "flex";
}

function memberButtonHandler(event) {
    groupsContainer.style.display = "none";
    friendsContainer.style.display = "flex";
}

authWrapper(loadData, () => window.location.href = "login.html");
searchBar.addEventListener("keydown", searchHandler);
memberButton.addEventListener("click", memberButtonHandler);
groupButton.addEventListener("click", groupButtonHandler);
