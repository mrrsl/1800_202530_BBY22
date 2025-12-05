import {
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
    user as getUser
} from "../lib/Database.js";

import {
    getDocs,
    collection,
    doc,
    getDoc,
    query,
    where,
} from "firebase/firestore";

import {
    onAuthStateChanged
} from "firebase/auth";

// NEW CHANGES HERE!! EXACTLY THE SAME AS THE ONE FOR THE OTHER WEEKLY VIEW; UPDATES HARDCODED DATES
// updates each weekdate
function updateWeekDates() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weekdaySections = document.querySelectorAll(".weekday");

    weekdaySections.forEach((section, index) => {
        const thisDay = new Date(startOfWeek);
        thisDay.setDate(startOfWeek.getDate() + index);
        const months = [
            "Jan","Feb","Mar","Apr","May","Jun",
            "Jul","Aug","Sep","Oct","Nov","Dec"
        ];
        const formatted = months[thisDay.getMonth()] + " " + thisDay.getDate();

        const dateElement = section.querySelector(".date");
        if (dateElement) {
            dateElement.textContent = formatted;
        }
    });
}

/**
 * Gets the weekday name from a date
 * @param {Date} taskdate 
 * @returns {String}
 */
function getWeekday(taskdate) {

    const weekdaynames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    let date;
    if (taskdate && taskdate.toDate) {
        date = taskdate.toDate();
    } else if (taskdate instanceof Date) {
        date = taskdate;
    } else if (typeof taskdate === "string") {
        const parts = taskdate.split("-");
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1] - 1;
            const day = parts[2];
            date = new Date(year, month, day);
        } else {
            date = new Date(taskdate);
        }
    }
    return weekdaynames[date.getDay()];
}

/**
 * Populates task info for each task bubble
 * @param {Object} task Task data retreived from Firestore.
 */
function showTask(task) {
    let weekday = task.dateISO ? getWeekday(task.dateISO) : getWeekday(task.date);
    if (!weekday) return;

    const taskcontainer = document.querySelector('[data-weekday="' + weekday + '"]');
    const bubble = document.createElement("div");
    bubble.className = "taskbubble";
    bubble.textContent = task.title || "";
    taskcontainer.appendChild(bubble);
}

/** Clear page of all task bubbles. */
function clearTasks() {
    document.querySelectorAll(".taskbubble").forEach(b => b.remove());
}

/**
 * Loads group tasks for the current week
 * @param {String} groupId Group's Firestore group ID.
 */
async function loadWeeklyGroupTasks(groupId) {
    const today = new Date();
    const startofweek = new Date(today);
    startofweek.setDate(today.getDate() - today.getDay());
    const endofweek = new Date(startofweek);
    endofweek.setDate(startofweek.getDate() + 6);

    const startISO = startofweek.toISOString().slice(0, 10);
    const endISO   = endofweek.toISOString().slice(0, 10);

    const thisweektasks = query(
        collection(db, "groups", groupId, "tasks"),
        where("dateISO", ">=", startISO),
        where("dateISO", "<=", endISO)
    );
    const snapshot = await getDocs(thisweektasks);

    clearTasks();

    const urgentList = document.querySelector(".urgentbubblelist");
    if (urgentList) urgentList.innerHTML = "";

    snapshot.forEach((taskdoc) => {
        const task = taskdoc.data();
        showTask(task);

        const priority = (task.priority || "").toLowerCase();
        if (priority === "high" && urgentList) {
            const urgentBubble = document.createElement("div");
            urgentBubble.className = "urgensecondtbubble";
            urgentBubble.textContent = task.title;
            urgentList.appendChild(urgentBubble);
        }
    });
}

/*  Sets up and loads data for rendering on the page. */
async function setupGroupWeeklyView() {
    const url = new URLSearchParams(window.location.search);
    const groupId = url.get("groupId");

    if (!groupId) return; 

    const groupdoc = doc(db, "groups", groupId);
    const groupsnapshot = await getDoc(groupdoc);

    if (groupsnapshot.exists()) {
        const groupinfo = groupsnapshot.data();
        const heading = document.querySelector(".topheading");
        // changes the heading of each weekly calenar to correspond to the group's name
        if (heading) {
            heading.textContent = groupId + " — This Week";
        }
    }

    loadWeeklyGroupTasks(groupId);
}

window.onload = function() {
    setupGroupWeeklyView();
    updateWeekDates();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const data = await getUser(user.uid);
    
    if (data.accentColor) {
        document.documentElement.style.setProperty("--second-accent", data.accentColor);
        document.documentElement.style.setProperty("--accent", data.accentColor);
    }

    const header = document.querySelector("header");
    if (header) {
        if (data.useSolidHeader) {
        header.style.backgroundImage = "none";
        header.style.backgroundColor = data.accentColor || "var(--accent)";
        } else {
        header.style.backgroundImage = "linear-gradient(180deg, #fbf7f8, rgba(251,247,248,0.75))";
        header.style.backgroundColor = "";
        }
    }
});