import Navbar from "../svelte/Navbar.svelte";
import Calendar from "../svelte/Calendar.svelte";
import { authInit } from "./Authentication.js";
import { getUser } from "./Database.js";

import { mount } from "svelte";

let today = new Date();

authInit(async (user) => {
    let name = getUser( (docData) => {
        const navMountArgs = {
            target: document.querySelector("header"),
            userName: user.displayName
        };
        const navRef = mount(Navbar, navMountArgs);
    });

    const calendarMountArgs = {
        target: document.querySelector("#svlete-calendar-container"),
        props: {
            displayedDateInit: today,
            accentColor: "#fff5fa",
        },
    };
    const calendarRef = mount(Calendar, calendarMountArgs);

}, () => {
    window.location.href = "/";
});
