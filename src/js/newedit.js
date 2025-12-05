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
    QueryDocumentSnapshot,
} from "firebase/firestore";

/** Controls the background shadow for every priority button (only a stylistic feature) */
var buttons = document.querySelectorAll(".prioritylevel");

// Identifies which task to load by going through the string in the URL after the ? to pull out the task id
const idfromURL = new URLSearchParams(window.location.search);
const taskId = idfromURL.get("taskId");

/** Button for deleting the current task. */
const deleteBtn = document.getElementById("deletetask");
/** Button for saving changes to the task. */
const saveBtn = document.getElementById("save");

/** Doc reference to the current task being edited.
 * @type {QueryDocumentSnapshot<DocumentData, DocumentData>}
 */
let currentTaskSnap;

/**
 * Handler for deleting task items.
 * @param {MouseEvent} event
 */
async function deleteTaskHandler(event) {
    const user = auth.currentUser;
    if (!user || !taskId) return;
    const taskRef = doc(db, "personal-tasks", user.uid, "tasks", taskId);
    await deleteDoc(taskRef);
    window.location.href = "calendar.html";
}

/**
 * Handler for saving changes to task itmes
 * @param {MouseEvent} event 
 */
async function saveHandler(event) {
    const newtaskname = document.querySelector(".inputbubble input").value;
    const newdate =
        document.getElementById("dateoftask").value ||
        // if no new date was entered, then it will default back to the date saved to firestore
        snapshot.data().dateISO;

    if (!newdate) {
        return;
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

    let chosenprioritylevel;
    const inuseprioritybutton = document.querySelector(
        ".prioritylevel.inUse"
    );
    // Set priority based on ID or default to original priority if not changed
    if (inuseprioritybutton) {
        chosenprioritylevel = inuseprioritybutton.id;
    } else {
        chosenprioritylevel = snapshot.data().priority;
    }

    const updatedtask = {
        title: newtaskname,
        dateISO: newdate,
        priority: chosenprioritylevel,
    };

    // Update current doc if ID hasn't changed, delete and create a new one otherwise
    if (newtaskid === taskId) {
        await updateDoc(newcurrentTask, updatedtask);
    } else {
        await setDoc(newcurrentTask, updatedtask);
        await deleteDoc(
            doc(db, "personal-tasks", user.uid, "tasks", taskId)
        );
    }
    window.location.href = "calendar.html";
}

auth.onAuthStateChanged(async (user) => {
    if (!user) return; // ends here if nobody is signed in

    const currentTaskRef = doc(
        db,
        "personal-tasks",
        user.uid,
        "tasks",
        taskId
    );
    currentTaskSnap = await getDoc(currentTaskRef);

    // if it finds the task, then both the name and date of the task should show up in the input boxes
    if (snapshot.exists()) {
        const taskdata = snapshot.data();
        document.querySelector(".inputbubble input").value = taskdata.title;
        document.getElementById("dateoftask").value = taskdata.standardDate;
    }
    initButtons();
});

/** Initializes buttons on the page. */
function initButtons() {
    
    for (var i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        button.addEventListener("click", function () {
            // removes the inUse class from all buttons, then adds it back in for the button currently selected
            for (var s = 0; s < buttons.length; s++) {
                buttons[s].classList.remove("inUse");
            }
            button.classList.add("inUse");
        });
    }
    deleteBtn.addEventListener("click", deleteTaskHandler);
    saveBtn.addEventListener("click", saveHandler);
}