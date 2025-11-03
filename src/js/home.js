import CalendarNav from "../svelte/CalendarNav.svelte";
import Calendar from "../svelte/Calendar.svelte"; 
import { mount } from "svelte";

const navMountArgs = {
    target: document.querySelector("header")
};
const calendarMountArgs = {
    target: document.querySelector("body"),
    props: {
        displayedMonth: (new Date()).getMonth(),
        accentColor: "#fff5fa"
    }
};

const navRef = mount(CalendarNav, navMountArgs);
const calendarRef = mount(Calendar, calendarMountArgs);