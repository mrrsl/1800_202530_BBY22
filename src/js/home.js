import Calendar from "../svelte/Calendar.svelte"; 
import { mount } from "svelte";

const calendarMountArgs = {
    target: document.querySelector("body"),
    props: {
        displayedMonth: (new Date(Date.now())).getMonth()
    }
}

const calendarRef = mount(Calendar, calendarMountArgs);