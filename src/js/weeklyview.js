import {
		firebaseDb as db,
		firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
	user as getUser
} from "../lib/Database.js";

import {
		onAuthStateChanged
} from "firebase/auth";

import {
		getDocs,
		collection,
		query,
		where,
		Timestamp
} from "firebase/firestore";

function getDateFromUrlParam() {
	if (window.location.search.length < 2) return new Date();
	// Search includes the ?
	let query = window.location.search.substring(1);
	query = query.split("=");
	return new Date(query[1]);
}

/**
 * Updates the Dates in the weekly view.
 */
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
 * Gets the name for the day of the week from the given task date.
 * @param {Timestamp} taskdate Timestamp stored in Firestore.
 * @returns {String} Name of the day of the week (eg. Monday).
 */
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

/**
 * Render tasks on individual weekday bubbles.
 * @param {Object} task Data returned form a task document.
 */
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

/**
 * Clear tasks bubbles off the page.
 */
function clearTasks() {
		var bubbles = document.querySelectorAll(".taskbubble"); // selects all of the task bubbles on the page
		for (var i = 0; i < bubbles.length; i++) { // runs a for loop that removes them one by one
				bubbles[i].remove();
		}
}

/** 
 * Loads in and displays new tasks only for the current week (separates high-priority from low-priority).
 * @param {String} userId
 */
async function loadWeeklyTasks(userId) {
	// uses today's date to figure out the bounds of the current week
	const today = getDateFromUrlParam();

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

onAuthStateChanged(auth, async (user) => {
	if (!user) return;
	
	loadWeeklyTasks(user.uid);
	const data = await getUser(user.uid);
	debugger;
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

	updateWeekDates();
});
