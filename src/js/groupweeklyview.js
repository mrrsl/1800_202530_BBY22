import {
    firebaseDb as db
} from "../lib/FirebaseInstances.js";

import {
    getDocs,
    collection,
    doc,
    getDoc,
    query,
    where
} from "firebase/firestore";


/* --- CONVERTS A DATE INTO A WEEKDAY NAME --- */
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

/* --- SHOWS THE TASK ON EACH WEEKDAY BUBBLE --- */
function showTask(task) {
    let weekday = task.dateISO ? getWeekday(task.dateISO) : getWeekday(task.date);
    if (!weekday) return;

    const taskcontainer = document.querySelector('[data-weekday="' + weekday + '"]');
    const bubble = document.createElement("div");
    bubble.className = "taskbubble";
    bubble.textContent = task.title || "";
    taskcontainer.appendChild(bubble);
}

/* --- CLEARS ALL TASK BUBBLES OFF OF THE PAGE --- */
function clearTasks() {
    document.querySelectorAll(".taskbubble").forEach(b => b.remove());
}

/* --- JUST A REFACTOR OF THE PERSONAL WEEKLY VIEW PAGE (ALMOST IDENTICAL) --- */
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
            urgentBubble.className = "urgentbubble";
            urgentBubble.textContent = task.title;
            urgentList.appendChild(urgentBubble);
        }
    });
}

/* --- SETUP GROUP WEEKLY VIEW --- */
async function setupGroupWeeklyView() {
    const url = new URLSearchParams(window.location.search); // gets the group id from url
    const groupId = url.get("groupId");
    if (!groupId) return; // ends function if no group id is present

    const groupdoc = doc(db, "groups", groupId);
    const groupsnapshot = await getDoc(groupdoc);
    if (groupsnapshot.exists()) { // checks if the group doc exists
        const groupinfo = groupsnapshot.data(); // if it does, read all the fields inside of the doc
        const heading = document.querySelector(".topheading");
        // changes the heading of each weekly calenar to correspond to the group's name
        if (heading) {
            heading.textContent = groupinfo.name + " — This Week";
        }
    }

    loadWeeklyGroupTasks(groupId);
}

window.onload = setupGroupWeeklyView;
