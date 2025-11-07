import {
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "firebase/auth";

import {
    firebaseAuth
} from "/js/FirebaseInstances.js";

import {
    defaultEntry
} from "/js//Database.js";


document.onload = function () {
    const SignupForm = {
        username: document.querySelector("form.loginbox > input[type='text']"),
        email: document.querySelector("form.loginbox > input[type='email']"),
        password: document.querySelector("form.loginbox > input[type='password']"),
        login: document.querySelector("form.loginbox > input[type='submit']")
    };

    onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
            window.location.href = "/html/sofiascalendar.html";
        }
    });

    SignupForm.login.addEventListener("submit", (event) => {
        createUserWithEmailAndPassword(firebaseAuth, email.value, password.value);
    });
    
}
