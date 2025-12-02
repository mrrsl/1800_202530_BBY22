
import {
    createUser
} from "./lib/Database.js";

import {
    logout
} from "./lib/Authentication.js";
const form = document.querySelector(".loginbox");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = form.querySelector("input[type='text']").value;
    const email = form.querySelector("input[type='email']").value;
    const password = form.querySelector("input[type='password']").value;

    logout();

    try {
        let newUserCred = await createUser(username, email, password);
        window.location.href = "sofiascalendar.html";

    } catch (error) {
        alert("Sign up failed! " + error.message);
    }
});