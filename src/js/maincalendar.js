/* -- ALL OF THE FIREBASE IMPORTS --*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvHPZ7Bq3GbQXbnlxnJE8INAWKfTCcNqA",
  authDomain: "team-77dac.firebaseapp.com",
  projectId: "team-77dac",
  storageBucket: "team-77dac.firebasestorage.app",
  messagingSenderId: "744151093255",
  appId: "1:744151093255:web:7aa5c0093a097249df1aa2",
  measurementId: "G-5H2SQNQ0RR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// represents the ID of the user logged in; assume nobody is logged in, so set it to null
let USERS_CURRENT_ID = null;
// the current date selected, set to today by default
let selectedDate = new Date();

/* --- HELPER FUNCTION FOR CONVERTING DATES TO YYYY-MM-DD FORMAT --- */
function formatDate(dateObj) {
  // gets year
  let year = dateObj.getFullYear();

  // gets month index, adds 1 to make up for the index
  let monthnumber = dateObj.getMonth() + 1;
  // represents the month as a string
  let monthstring = String(monthnumber);

  // pads the month or day with a 0 in front if it's a single digit number
  if (monthstring.length === 1) {
    monthstring = "0" + monthstring;
  }
  let daynumber = dateObj.getDate();
  let daystring = String(daynumber);

  if (daystring.length === 1) {
    daystring = "0" + daystring;
  }

  return year + "-" + monthstring + "-" + daystring; //yyyy-mm-dd
}

/* --- CREATES DOC IDS IN THIS FORMAT: 20251112-Homework --- */
function makeUniqueDocId(formattedDate, title) {
  return formattedDate.replaceAll("-", "") + title;
}

/* --- HELPER FUNCTION TO CALCULATE # OF DAYS IN MONTH --- */
function daysInMonth(indexofmonth, year) {
  // whenever the day number is 0, javascript interprets it as the final day of the last month
  // 2025, 3, 0 means the 0th day of april, aka march 31st
  let dateObject = new Date(year, indexofmonth + 1, 0);
  return dateObject.getDate();
}

/* --- javascript variables that we connect to html elements later on  --- */
let titleElement;
let taskList;
let taskInput;
let calendarContainer;
let collapseButton;

/* --- FOR SAVING AND LOADING TASKS FROM FIRESTORE --- */
async function saveTask(
  title,
  desc = "",
  standardDay = formatDate(selectedDate)
) {
  if (!USERS_CURRENT_ID) {
    //end function if the user isn't logged in
    return;
  }

  let taskId = makeUniqueDocId(standardDay, title); // make a unique id for the task based on the date + title
  let taskRef = doc(db, "personal-tasks", USERS_CURRENT_ID, "tasks", taskId); // where the task is saved in firestore

  // puts the task data into firestore
  await setDoc(taskRef, {
    dateISO: standardDay, // dateISO is the standard yyyymmdd date format
    title: title,
    desc: desc,
    createdAt: new Date(),
    done: false,
  });
}

/* --- LOADING TASKS FOR A SPECIFIC DAY --- */
async function loadTasksForTheDay(currentday) {
  if (!USERS_CURRENT_ID) return;

  // gets all tasks for this user from firestore
  const snapshot = await getDocs(
    collection(db, "personal-tasks", USERS_CURRENT_ID, "tasks")
  );

  taskList.innerHTML = ""; //clears task list before adding anything new

  // loops through each document in the snapshot
  for (let i = 0; i < snapshot.docs.length; i++) {
    const taskDoc = snapshot.docs[i]; // a single document snapshot
    const taskData = taskDoc.data(); // the actual task info inside of that single doc snap

    // if the saved date (yyyy-mm-dd) of the task matches the current day selected, display it as a new list item
    if (taskData.dateISO === currentday) {
      const listItem = document.createElement("li");
      listItem.textContent = taskData.title;

      // create an x button and attach it to each list item
      const deletebutton = document.createElement("button");
      deletebutton.textContent = "X";
      listItem.appendChild(deletebutton);
      taskList.appendChild(listItem);

      // delete the task from firestore when clicked & remove it from the list
      deletebutton.onclick = async function () {
        await deleteDoc(taskDoc.ref);
        listItem.remove();
        updateNote(); // refreshes the limit note after a task has been deleted
      };
    }
  }
  // refreshes the limit note (AGAIN) after all tasks have loaded in
  updateNote();
}

/* --- ADDING A BRAND NEW TASK TO THE LIST --- */
function addTask(taskTitle) {
  // if they already have 20+ tasks, end the function
  if (taskList.children.length >= 20) {
    return;
  }

  // create a brand new list item displaying the task's title
  const listItem = document.createElement("li");
  listItem.textContent = taskTitle;

  // create a delete button, attach it to each list item
  const deletebutton = document.createElement("button");
  deletebutton.textContent = "X";
  listItem.appendChild(deletebutton);
  taskList.appendChild(listItem);

  // if you click the delete button when logged in
  deletebutton.onclick = async () => {
    if (USERS_CURRENT_ID) {
      const currentday = formatDate(selectedDate); // figure out the current day
      const taskId = makeUniqueDocId(currentday, taskTitle); // build a unique id for the task
      const taskRef = doc(
        //and point to this exact task in firestore
        db,
        "personal-tasks",
        USERS_CURRENT_ID,
        "tasks",
        taskId
      );
      // removes the task from firestore (only when logged in!)
      await deleteDoc(taskRef);
    }
    listItem.remove(); // removes the list item from the screen
    updateNote(); // updates limit note after the task has been removed
  };

  updateNote(); // updates limit note after all tasks have loaded in

  // if the user is logged in, save the task to firestore (very similar to deleting a task!)
  if (USERS_CURRENT_ID) {
    const currentday = formatDate(selectedDate);
    const taskId = makeUniqueDocId(currentday, taskTitle);
    const taskRef = doc(
      db,
      "personal-tasks",
      USERS_CURRENT_ID,
      "tasks",
      taskId
    );
    // except we use setDoc to save it
    setDoc(taskRef, {
      standardDate: currentday,
      title: taskTitle,
      createdAt: new Date(),
      done: false, //indicates whether the task is done or not
    });
  }
}

/* --- UPDATING THE TASK LIMIT NOTE --- */
function updateNote() {
  const note = document.getElementById("note");
  const numberOfTasks = taskList.children.length; // # of items in list

  // if you have more than 20 tasks, show the limit note, and disable the task input box
  if (numberOfTasks >= 20) {
    note.style.display = "block";
    taskInput.disabled = true;
  } else {
    // otherwise, hide the task limit note, enable input box
    note.style.display = "none";
    taskInput.disabled = false;
  }
}

/* --- UPDATING THE CALENDAR HEADER --- */
function createHeaders(dateObject) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // creates the month + day heading you see at the very top on the main calendar page
  titleElement.innerHTML =
    months[dateObject.getMonth()] + " " + dateObject.getDate();
}

/* --- CREATING THE CALENDAR GRID! --- */

// holds the year, month index (0-11), and the day of the month
function createCalendar(dateObj) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const todaysdate = dateObj.getDate();

  // finds all the week rows within our big calendar grid
  const allWeekrows = calendarContainer.getElementsByClassName("days");
  // multiplies the number of week rows by 7 to get the total number of days in the calendar grid
  const totalnumboxes = allWeekrows.length * 7;
  // calculates total # of days in the month using our helper function from earlier
  const totalMonthDays = daysInMonth(month, year);
  // tells you which day of the week the 1st day of the month is on
  const firstday = new Date(year, month, 1).getDay();
  // a counter which shows how many calendar boxes we've filled in so far
  let daycount = 0;

  // loops through each box in the calendar grid to decide whether a box should be empty or filled with a day
  // note: i represents each box number
  /* AN EXAMPLE: if i = 3
  3/7 = 0.xxxx -> rounds down to 0 AND 3 % 7 = 3; this means box 3 would be on row 0, column 3
  */
  for (let i = 0; i < totalnumboxes; i++) {
    const rows = Math.floor(i / 7);
    const columns = i % 7;
    const daybox = allWeekrows[rows].getElementsByClassName("day")[columns];

    // resets the style for all the boxes
    daybox.style.visibility = "visible";
    daybox.style.border = "";
    daybox.style.borderRadius = "";
    daybox.style.boxShadow = "";
    daybox.textContent = "";

    // hides all empty calendar boxes that come before the first day of the month
    if (i < firstday) {
      daybox.style.visibility = "hidden";
      daybox.textContent = "";
      daybox.removeAttribute("id");
      daybox.onclick = null;
    }

    // if the day count is less than the total days in the month, that means we're still inside the month, so we should fill the box with a day number
    else if (daycount < totalMonthDays) {
      // daycount initially started at 0, so add 1 to make the first day show up as 1, and not 0
      const displaynumber = daycount + 1;
      daybox.textContent = displaynumber; // update the number displayed in the box
      daybox.id = "day" + displaynumber; // creates a unique id for each box: day1

      // if today's date is equal to the box value, then add a border
      if (displaynumber === todaysdate) {
        daybox.style.border = "2px solid gray";
        daybox.style.borderRadius = "10px";
        daybox.style.boxShadow = "0px 0px 0px 10px rgba(47, 23, 4, 0.3)";
      }

      // when this specific day box is clicked
      daybox.onclick = function () {
        // update the selected day to this date
        selectedDate = new Date(year, month, displaynumber);
        createHeaders(selectedDate); // update the calendar header & add a border around the day box
        createCalendar(selectedDate);

        loadTasksForTheDay(formatDate(selectedDate)); // it should also load the tasks from firestore
      };

      daycount++; // moves onto the next day box
    }

    // hides any empty days leftover at the end of the calendar
    else {
      daybox.style.visibility = "hidden";
      daybox.textContent = "";
      daybox.removeAttribute("id"); // removes ids associated with the empty boxes
      daybox.onclick = null;
    }
  }
}

/* --- COLLAPSIBLE CALENDAR --- */
function collapsecalendar() {
  collapseButton.addEventListener("click", function () {
    // figures out the # of week rows in the calendar
    const allWeekRows = calendarContainer.getElementsByClassName("days");
    // figures out the day, month, and year of the date currently selected
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const currentDate = selectedDate.getDate();

    //finds out which weekday the 1st of the month is on
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // calculates which week row today belongs to
    const currentWeek = Math.floor((currentDate + firstDayOfMonth - 1) / 7);

    // checks if the calendar is already collapsed
    const isCollapsed = allWeekRows[0].style.display === "none";

    // loops through each week row
    for (let i = 0; i < allWeekRows.length; i++) {
      // if the calendar is collapsed, show all the rows using flex
      if (isCollapsed || i === currentWeek) {
        allWeekRows[i].style.display = "flex";
        // otherwise, hide the rows
      } else {
        allWeekRows[i].style.display = "none";
      }
    }

    // rotates arrow 180deg if the calendar is collapsed, and 0deg otherwise
    const arrow = document.querySelector("#collapseButton img");
    if (arrow) {
      arrow.style.transform = isCollapsed ? "rotate(180deg)" : "rotate(0deg)";
    }
  });
}

/* --- CUSTOMIZING THE PLANNER NAME --- */
async function displayPlannerName(userId) {
  const reference = doc(db, "users", userId); // reference this user's document under the users collection
  const snapshot = await getDoc(reference); // get the doc data from firestore

  // if the file is there
  if (snapshot.exists()) {
    const data = snapshot.data(); // get all the fields stored for that user, and use the username
    const name = data.username || "user"; //
    document.getElementById("plannerName").textContent = name + "'s Planner";
  } else {
    document.getElementById("plannerName").textContent = "My Planner";
  }
}

/* --- EVERYTHING THAT NEEDS TO HAPPEN WHEN THE PAGE FIRST LOADS --- */
/* --- Sets up the custom Navbar & Calendar Color --- */
window.onload = function () {
  // links each html element to its javascript var
  titleElement = document.getElementById("title");
  taskList = document.getElementById("taskList");
  taskInput = document.getElementById("taskInput");
  calendarContainer = document.getElementById("tracker");
  collapseButton = document.getElementById("collapseButton");

  // saves the accent color to local storage; NEED TO FIX LATER
  const savedColor = localStorage.getItem("accentColor");
  if (savedColor) {
    document.documentElement.style.setProperty("--accent-color", savedColor);
  }

  /* --- Updates the Calendar & Header whenever the user picks a new date --- */
  createHeaders(selectedDate);
  createCalendar(selectedDate);
  collapsecalendar(); // sets up the collapsible calendar

  /* --- Adds New Tasks Both to Firestore & To the List --- */
  // happens whenever user enters valid input & hits enter key
  taskInput.onkeydown = function (event) {
    if (event.key === "Enter" && taskInput.value !== "") {
      addTask(taskInput.value);
      saveTask(taskInput.value, "", formatDate(selectedDate));
      taskInput.value = "";
    }
  };
};

/* --- USER AUTHENTICATION FEATURES --- */
onAuthStateChanged(auth, function (User) {
  // if the user is logged in, save their id, display the right planner name, and load in their tasks
  if (User) {
    USERS_CURRENT_ID = User.uid;
    displayPlannerName(USERS_CURRENT_ID);
    loadTasksForTheDay(formatDate(selectedDate));
    // otherwise, clear the user's id, clear the task list, set the default planner name, and reset the task limit
  } else {
    USERS_CURRENT_ID = null;
    document.getElementById("plannerName").textContent = "My Planner";
    taskList.innerHTML = "";
    updateNote();
  }
});
