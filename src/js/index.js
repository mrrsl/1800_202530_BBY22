import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseAuth } from "/src/js/FirebaseInstances.js";
const form = document.querySelector("#usernameinput");
const password = document.querySelector("#passwordinput");
const button = document.querySelector("#loginbutton");
button.addEventListener("click", () => {
  debugger;
  signInWithEmailAndPassword(firebaseAuth, form.value, password.value)
    .then((user) => {
      debugger;
      console.log(user);
    })
    .catch(console.error);
});
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    window.location.href = "/src/html/home.html";
  } else {
    console.log("No user is logged in.");
  }
});
