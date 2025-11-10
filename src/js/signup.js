import {
    firebaseAuth
} from "/js/FirebaseInstances.js";

import {
    register
} from "./Authentication.js";

import {
    setUsername
} from ".//Database.js";

document.onload = function () {

    let username = document.querySelector("form.loginbox > input[type='text']");
    let email = document.querySelector("form.loginbox > input[type='email']");
    let password = document.querySelector("form.loginbox > input[type='password']");
    let form = document.querySelector("form.loginbox");
    
    onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
            window.location.href = "/html/sofiascalendar.html";
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let regResult = register(email.value, password.value, "home.html");
        if (username.value.length > 0) {
            regResult.then(() => {
                setUsername(username.value);
            });
        }

    });
    
}
