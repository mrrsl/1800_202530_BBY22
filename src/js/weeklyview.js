import {
  firebaseDb as db,
  firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  getDocs,
  collection,
  query,
  where
} from "firebase/firestore";

/* --- CONVERTS A DATE INTO A WEEKDAY NAME --- */
// figures out the weekday name associated with a date
function getWeekday(taskdate) {
    var date;

    // if it's a firestore timestamp, convert it to a normal js date
    if(taskdate && taskdate.toDate) {
        date = taskdate.toDate();
    }

    // if it's already a Date object, use it as is
    else if(taskdate instanceof Date) {
        date = taskdate;
    }

    // if it is in the form yyyy-mm-dd, parse it into numbers
    else if(typeof taskdate === "string" ) {
        var parts = taskdate.split("-");
        if(parts.length === 3) {
            var year = parts[0]; // first part is the year
            var month = parts[1] - 1; // month (recall they start at index 0)
            var day = parts[2]; // day
            date = new Date(year, month, day);

        // if it's none of these, let javascript figure it out
        } else {
            date = new Date(taskdate);
        }
    }

    var weekdaynames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdaynames[date.getDay()]; // gets weekday number from the date, uses it as an index to get the weekday name
}

/* --- SHOWS THE TASK ON EACH WEEKDAY BUBBLE  --- */
function showTask(task) {
    var weekday;
    // if the task already has a firestore ISO date (yyyy-mm-dd) use that
    if (task.dateISO) {
        weekday = getWeekday(task.dateISO);
    } else {
        weekday = getWeekday(task.date); // otherwise, use the plain date we created above
    }
    if (!weekday) { // end the function if it's an invalid date
        return;
    }

    // find the task bubble/box that matches this weekday
    var taskcontainer = document.querySelector('[data-weekday="' + weekday + '"]');

    // create a new bubble to show the task
    var bubble = document.createElement("div");
    bubble.className = "taskbubble";

    // put the task title inside of the bubble (unless the user entered a blank title)
    if (task.title) {
        bubble.textContent = task.title;
    } else {
        bubble.textContent = "";
    }
    taskcontainer.appendChild(bubble); // add bubble to the weekday box
}



/* --- CLEARS ALL TASK BUBBLES OFF OF THE PAGE --- */
function clearTasks() {
    var bubbles = document.querySelectorAll(".taskbubble"); // selects all of the task bubbles on the page
    for (var i = 0; i < bubbles.length; i++) { // runs a for loop that removes them one by one
        bubbles[i].remove();
    }
}

/* --- LOADS IN AND DISPLAYS NEW TASKS ONLY FOR THE CURRENT WEEK (SEPARATES HIGH-PRIORITY FROM LOW-PRIORITY TASKS) --- */
async function loadWeeklyTasks(userId) {
    // uses today's date to figure out the bounds of the current week
    const today = new Date();

    // creates a copy of today's date and sets it back to sunday of this week
    /* ex. let's say today is november 21st; then today.getDate() = 21 
        today.getDay() would give you 5 (because we start counting at index 0 from sunday)
        21-5 = 16, which represents sunday, november 16th
    */
    const startofweek = new Date(today);
    startofweek.setDate(today.getDate() - today.getDay());

    /* copies over sunday's date: november 16th, into endofweek
        so it becomes 16 + 6 = 22, therefore the end of the week would be saturday, november 22nd
    */
    const endofweek = new Date(startofweek);
    endofweek.setDate(startofweek.getDate() + 6);

    // slices the first 10 characters of the yyyy-mm-dd string to get both dates in this form
    const startISO = startofweek.toISOString().slice(0, 10);
    const endISO   = endofweek.toISOString().slice(0, 10);

    // gets all tasks from firestore between the dates of sunday and saturday 
    const thisweektasks = query(
        collection(db, "personal-tasks", userId, "tasks"),
        where("dateISO", ">=", startISO),
        where("dateISO", "<=", endISO)
    );
    const snapshot = await getDocs(thisweektasks);

    // clears out any old task bubbles
    clearTasks();


    // finds and clears any leftover tasks in the high priority bubble section
    const urgentList = document.querySelector('.urgentbubblelist');
    if (urgentList) urgentList.innerHTML = '';

    // loops through each of the task docs from Firestore
    for (let i = 0; i < snapshot.docs.length; i++) {
        const tasksnapshot = snapshot.docs[i];
        const task = tasksnapshot.data();

        // shows regular tasks in their correct weekly bubble
        showTask(task);

        // standardizes the priority task value to a lowercase string
        const priority = (task.priority || '').toString().toLowerCase();

        // if it's high priority, create a new bubble to add to the priority section
        if (priority === 'high' && urgentList) {
            const urgentBubble = document.createElement('div');
            urgentBubble.className = 'urgentbubble';
            urgentBubble.textContent = task.title; // adds the name of the task into the task bubble
            urgentList.appendChild(urgentBubble);
        }
    }
}

/* --- GETS THE LOGGED IN USER'S TASKS --- */
function setupWeeklyView() {
    onAuthStateChanged(auth, function (user) {
        if (user) {
            loadWeeklyTasks(user.uid);
        }
    });
}

window.onload = setupWeeklyView;