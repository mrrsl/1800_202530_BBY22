import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged 
} from "firebase/auth";
import {
    firebaseInstance as appInstance,
} from "../lib/FirebaseInstances.js";

const auth = getAuth(appInstance);
/* --- FOR LOGGING IN --- */
const form = document.querySelector(".loginbox");

form.addEventListener("submit", async (event) => {
    // stops the page from refreshing
    event.preventDefault();
    const email = form.querySelector("input[type='email']").value;
    const password = form.querySelector("input[type='password']").value;

    // signs in with an email and password
    try {
        const usercredenetials = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
    } catch (error) {
        alert("Something went wrong! " + error.message);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/calendar.html";
    }
});