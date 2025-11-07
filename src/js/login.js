import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "firebase/auth";

import { firebaseAuth } from "./FirebaseInstances.js";

const homePageUrl = "/sofiascalendar.html";

onAuthStateChanged(firebaseAuth, (user) => {
    if (user)
        window.location.href = homePageUrl;
    
});

function loginInit () {

    let form = document.querySelector("form");
    form.addEventListener("submit", (event) => {
        let email = document.querySelector("input[type='text']");
        let password = document.querySelector("input[type='password']");
        window.location.href = homePageUrl;
        debugger;
        signInWithEmailAndPassword(firebaseAuth, email.value, password.value)
            .then((cred) => {
                debugger;
                window.location.href = homePageUrl;
        });
    });
}

document.addEventListener("DOMContentLoaded", loginInit);

