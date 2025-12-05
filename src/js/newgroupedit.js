import {
    firebaseDb as db
} from "../lib/FirebaseInstances.js";

import {
    doc,
    setDoc,
} from "firebase/firestore";

const urlparams = new URLSearchParams(window.location.search);
/** Name of the group parsed from the URL parameter. */
const groupId = urlparams.get("groupId");

/** Buttons for setting task priority level. */
const prioritybuttons = document.querySelectorAll(".prioritylevel");

prioritybuttons.forEach((button) => {
    button.addEventListener("click", () => {
        prioritybuttons.forEach((b) => b.classList.remove("inUse"));
        button.classList.add("inUse");
    });
});

// Event handler for the save button. Will create a new task and delete the old task if the date is changed.
document.getElementById("save").onclick = async () => {
    const tasktitleinput =
        document.querySelector(".inputbubble input").value;
    const taskdateinput = document.getElementById("dateoftask").value;

    if (!taskdateinput || !tasktitleinput) return;

    /** Pending task Firestore ID. */
    const newtaskid = taskdateinput.replaceAll("-", "") + tasktitleinput;
    /** Pending task `DocumentReference`. */
    const taskdocref = doc(db, "groups", groupId, "tasks", newtaskid);
    /** Currently selected priority level. */
    const selectedprioritybutton = document.querySelector(
        ".prioritylevel.inUse"
    );

    const chosenpriority = selectedprioritybutton
        ? selectedprioritybutton.id
        : "medium";

    const newtaskdata = {
        title: tasktitleinput,
        dateISO: taskdateinput,
        priority: chosenpriority,
        /** True if task is a group task. */
        shared: true
    };
    await setDoc(taskdocref, newtaskdata);
    window.location.href = "calendar.html";
}