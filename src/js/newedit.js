import {
    firebaseAuth as auth,
    firebaseDb as db
} from "../lib/FirebaseInstances.js";

import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";

// CONTROLS THE BACKGROUND SHADOW FOR EVERY PRIORITY BUTTON (only a stylistic feature)
var buttons = document.querySelectorAll(".prioritylevel");
// loops through each button
for (var i = 0; i < buttons.length; i++) {
    let button = buttons[i]; // stores the current button

    button.addEventListener("click", function () {
        // removes the inUse class from all buttons, then adds it back in for the button currently selected
        for (var s = 0; s < buttons.length; s++) {
            buttons[s].classList.remove("inUse");
        }
        button.classList.add("inUse");
    });
}

// identifies which task to load by going through the string in the URL after the ? to pull out the task id
const idfromURL = new URLSearchParams(window.location.search);
const taskId = idfromURL.get("taskId");

auth.onAuthStateChanged(async (user) => {
    if (!user) return; // ends here if nobody is signed in

    const currentTask = doc(
        db,
        "personal-tasks",
        user.uid,
        "tasks",
        taskId
    );

    // loads all of the task data from firestore
    const snapshot = await getDoc(currentTask);

    // if it finds the task, then both the name and date of the task should show up in the input boxes
    if (snapshot.exists()) {
        const taskdata = snapshot.data();
        document.querySelector(".inputbubble input").value = taskdata.title;
        document.getElementById("dateoftask").value = taskdata.standardDate;
    }

    // when the save button is clicked, it pushes any updated input about the task back to firestore
    document.getElementById("save").onclick = async () => {
        const newtaskname =
            document.querySelector(".inputbubble input").value;
        const newdate =
            document.getElementById("dateoftask").value ||
            snapshot.data().dateISO; // if no new date was entered, then it will default back to the date saved to firestore

        if (!newdate) {
            return; // if there's still no date, end here
        }

        // builds a new task id
        const newtaskid = newdate.replaceAll("-", "") + newtaskname;
        const newcurrentTask = doc(
            db,
            "personal-tasks",
            user.uid,
            "tasks",
            newtaskid
        );

        // figures out which of the priority buttons was chosen
        let chosenprioritylevel;

        const inuseprioritybutton = document.querySelector(
            ".prioritylevel.inUse"
        );
        if (inuseprioritybutton) {
            chosenprioritylevel = inuseprioritybutton.id; // uses the button's id to represent priority level
        } else {
            // if a new priority level wasn't assigned, it defaults back to whatever priority was already saved to firestore
            chosenprioritylevel = snapshot.data().priority;
        }

        // prepares all of the new task data that needs saving
        const updatedtask = {
            title: newtaskname,
            dateISO: newdate,
            priority: chosenprioritylevel,
        };

        // saves the newly updated task to firestore
        if (newtaskid === taskId) {
            await updateDoc(newcurrentTask, updatedtask); // if the id hasn't changed, just update the existing doc
        } else {
            await setDoc(newcurrentTask, updatedtask); // if the id changed because the name or date was updated, create a new task doc
            await deleteDoc(
                doc(db, "personal-tasks", user.uid, "tasks", taskId) // deletes old doc
            );
        }

        // redirects back to the main calendar page after saving
        window.location.href = "sofiascalendar.html";
    };
});

// deletes the task off of the page when delete button is clicked
document
    .getElementById("deletetask")
    .addEventListener("click", async () => {
        const user = auth.currentUser;
        // stops if there's no user or task id
        if (!user || !taskId) return;

        const taskRef = doc(db, "personal-tasks", user.uid, "tasks", taskId);
        // goes back to the calendar page after deleting
        await deleteDoc(taskRef);
        window.location.href = "sofiascalendar.html";
    }
);