import { loginUser } from "./Authentication.js";
import { firebaseAuth } from "./FirebaseInstances.js";

const homePageUrl = "/home.html";

if (firebaseAuth.currentUser) {
    window.location.href = homePageUrl;
}

function loginInit () {
    let form = document.querySelector("form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let email = document.querySelector("input[type='text']");
        let password = document.querySelector("input[type='password']");
        
        loginUser(email.value, password.value, homePageUrl);
    });
}

document.addEventListener("DOMContentLoaded", loginInit);

