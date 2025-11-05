import Navbar from "../svelte/Navbar.svelte";
import Calendar from "../svelte/Calendar.svelte"; 

import { mount } from "svelte";

let today = new Date();

const navMountArgs = {
    target: document.querySelector("header")
};
const calendarMountArgs = {
    target: document.querySelector("#svlete-calendar-container"),
    props: {
        displayedDateInit: new Date(),
        accentColor: "#fff5fa",

    }
};


const navRef = mount(Navbar, navMountArgs);
const calendarRef = mount(Calendar, calendarMountArgs);
