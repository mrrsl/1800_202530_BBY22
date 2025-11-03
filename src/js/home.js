import Navbar from "../svelte/Navbar.svelte";
import Calendar from "../svelte/Calendar.svelte"; 
import TodoList from "../svelte/TodoList.svelte";

import { mount } from "svelte";

const navMountArgs = {
    target: document.querySelector("header")
};
const calendarMountArgs = {
    target: document.querySelector("body"),
    props: {
        displayedMonth: (new Date()).getMonth(),
        accentColor: "#fff5fa",
        initMonth: (new Date()).getMonth()
    }
};
const todoMountArgs = {
    target: document.querySelector("body"),
    props: {

    }
}

const navRef = mount(Navbar, navMountArgs);
const calendarRef = mount(Calendar, calendarMountArgs);
const todoListRef = mount(TodoList, todoMountArgs);