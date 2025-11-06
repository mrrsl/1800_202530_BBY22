import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import {
    defaultEntry
} from "./Database.js";

const SignupForm = {
    usernameInput: document.querySelector("form.loginbox > input[type='text']"),
    password: document.querySelector("form.loginbox > input[type='email']")
}