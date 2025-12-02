import { 
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";
import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const nameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const logoutButton = document.getElementById("logoutbutton");
const editButton = document.getElementById("editbutton");
const colorPicker = document.getElementById("accentColor");
const defaultAccentColor = "#fff5fa";

nameInput.disabled = true;
emailInput.disabled = true;

function setPlaceholder(el, text) {
    if (!el) return;
    el.placeholder = text ?? "";
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("No user logged in");
        return;
    }

    const userDocRef = doc(db, "users", user.uid);

    // Load Firestore doc and profile data
    try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
            const data = snap.data();

            // Profile Picture
            if (data?.profilePic) {
                document.getElementById("profilePic").src = data.profilePic;
            }

            // USERNAME (changed from name → username)
            if (
                typeof data?.username === "string" &&
                data.username.trim() !== ""
            ) {
                nameInput.value = data.username;
                setPlaceholder(nameInput, data.username);
            }

            // EMAIL
            if (typeof data?.email === "string" && data.email.trim() !== "") {
                emailInput.value = data.email;
                setPlaceholder(emailInput, data.email);
            }
        }
    } catch (err) {
        console.error("Error fetching user doc:", err);
    }

    // Fallbacks
    const authEmail = user.email || null;

    if (!nameInput.value) {
        setPlaceholder(nameInput, "Choose a username");
    }

    if (!emailInput.value && authEmail) {
        emailInput.value = authEmail;
        setPlaceholder(emailInput, authEmail);
    } else {
        setPlaceholder(
            emailInput,
            emailInput.placeholder || authEmail || "you@example.com"
        );
    }

    // Save profile picture
    document
        .getElementById("savepic")
        .addEventListener("click", async () => {
            const newpicinput = document
                .getElementById("newpicinput")
                .value.trim();
            if (!newpicinput) return;

            try {
                await updateDoc(userDocRef, { profilePic: newpicinput });
                document.getElementById("profilePic").src = newpicinput;
                alert("Profile picture updated!");
            } catch (err) {
                console.error("Failed to update profile picture:", err);
                alert("Failed to update profile picture.");
            }
        });

    // Edit button enables inputs
    editButton.addEventListener("click", () => {
        nameInput.disabled = false;
        emailInput.disabled = false;
        nameInput.focus();
    });

    // Save button writes USERNAME + EMAIL to Firestore
    document
        .getElementById("savebutton")
        .addEventListener("click", async () => {
            const username = nameInput.value.trim();
            const email = emailInput.value.trim();

            const updates = {};
            if (username) updates.username = username; // ✅ changed
            if (email) updates.email = email;

            if (Object.keys(updates).length === 0) {
                console.log("No fields to update.");
            } else {
                try {
                    await updateDoc(userDocRef, updates);
                } catch (err) {
                    console.error("Failed to update user document:", err);
                    alert("Failed to save profile info.");
                }
            }

            nameInput.disabled = true;
            emailInput.disabled = true;

            // Update UI
            if (updates.username) {
                nameInput.value = updates.username;
                setPlaceholder(nameInput, updates.username);
            }
            if (updates.email) {
                emailInput.value = updates.email;
                setPlaceholder(emailInput, updates.email);
            }
        });
});