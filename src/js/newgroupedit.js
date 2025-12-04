import {
    firebaseDb as db
} from "../lib/FirebaseInstances.js";

import {
    doc,
    setDoc,
} from "firebase/firestore";



// pulls out the group id from the url string after the ?
const urlparams = new URLSearchParams(window.location.search);
const groupId = urlparams.get("groupId");

// finds all of the priority buttons on the page
const prioritybuttons = document.querySelectorAll(".prioritylevel");
prioritybuttons.forEach((button) => {
    // when a priority button is clicked
    button.addEventListener("click", () => {
        // remove the inUse class from all buttons
        prioritybuttons.forEach((b) => b.classList.remove("inUse"));
        // add the inUse class to the clicked button
        button.classList.add("inUse");
    });
});

// when the save button is clicked create a new group task
document.getElementById("save").onclick = async () => {
    const tasktitleinput =
        document.querySelector(".inputbubble input").value; // get the task title from the input box
    const taskdateinput = document.getElementById("dateoftask").value; // get the task date from the date input box

    if (!taskdateinput || !tasktitleinput) return; // stop if input fields are left empty

    // builds a unique id for the task using date + title
    const newtaskid = taskdateinput.replaceAll("-", "") + tasktitleinput;

    const taskdocref = doc(db, "groups", groupId, "tasks", newtaskid);

    // finds which priority button is currently in use
    const selectedprioritybutton = document.querySelector(
        ".prioritylevel.inUse"
    );

    // if a button is selected, use its id; otherwise default to medium
    const chosenpriority = selectedprioritybutton
        ? selectedprioritybutton.id
        : "medium";

    // prepares the new task object
    const newtaskdata = {
        title: tasktitleinput,
        dateISO: taskdateinput, // task date in iso format
        priority: chosenpriority,
        shared: true, // shows this is a group task
    };
    // saves the new task into firestore
    await setDoc(taskdocref, newtaskdata);

    window.location.href = "calendar.html"; // redirects back to the calendar page
};