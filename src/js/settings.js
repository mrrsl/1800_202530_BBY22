import { 
    firebaseDb as db,
    firebaseAuth as auth
} from "../lib/FirebaseInstances.js";

import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";

import {
    onAuthStateChanged,
    signOut,
    updateEmail
} from "firebase/auth";

import {
    loadPreferences
} from "../lib/Helpers.js";

const nameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const logoutButton = document.getElementById("logoutbutton");
const editButton = document.getElementById("editbutton");
const colorPicker = document.getElementById("accentColor");

nameInput.disabled = true;
emailInput.disabled = true;

logoutButton.addEventListener("click", logoutHandler);

function setPlaceholder(el, text) {
    if (!el) return;
    el.placeholder = text ?? "";
}

function logoutHandler(event) {
    signOut(auth)
        .then(v => window.location.href = "/loginpage.html");
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "loginpage.html";
    }

    const userDocRef = doc(db, "users", user.uid);
    const userdoc = await getDoc(userDocRef);
    // Load Firestore doc and profile data

    if (userdoc.exists()) {
        const data = userdoc.data();

        // PROFILE PICTURE
        if (data?.profilePic) {
            document.getElementById("profilePic").src = data.profilePic;
        }
        if (typeof data?.username === "string" && data.username.trim() !== "") {
            nameInput.value = data.username;
            setPlaceholder(nameInput, data.username);
        }

        if (typeof data?.email === "string" && data.email.trim() !== "") {
            emailInput.value = data.email;
            setPlaceholder(emailInput, data.email);
        }
        loadPreferences();
    }

    // SAVE BUTTON FOR THE PFP
    const savePicBtn = document.getElementById("savepic");
    if (savePicBtn) {
        savePicBtn.addEventListener("click", async () => {
            let newpicinput = document
                .getElementById("newpicinput")
                .value.trim();
            if (newpicinput) {
                if (newpicinput.includes("dropbox.com")) {
                    newpicinput = newpicinput.replace("dl=0", "raw=1");
                }
                await updateDoc(userDocRef, { profilePic: newpicinput });
                document.getElementById("profilePic").src = newpicinput;
                alert("profile picture updated!");
            }
        });
    }

    // FONT BUTTONS
    async function setFontChoice(variableName, fieldName, fontFamily) {
        document.documentElement.style.setProperty(variableName, fontFamily);
        await updateDoc(userDocRef, { [fieldName]: fontFamily });
    }

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
                    await updateEmail(auth.currentUser, email);
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

    const fontmappings = [
        {
            id: "fontOptionOne",
            variable: "--header-font",
            field: "headerFont",
            value: '"Cormorant Garamond", sans-serif',
        },
        {
            id: "fontOptionTwo",
            variable: "--header-font",
            field: "headerFont",
            value: '"Quicksand Book", sans-serif',
        },
        {
            id: "fontOptionThree",
            variable: "--header-font",
            field: "headerFont",
            value: '"Oooh Baby", sans-serif',
        },
        {
            id: "fontOptionFour",
            variable: "--header-font",
            field: "headerFont",
            value: '"Delius", sans-serif',
        },
        {
            id: "fontOptionFive",
            variable: "--header-font",
            field: "headerFont",
            value: '"Fuzzy Bubbles", sans-serif',
        },
        {
            id: "fontOptionSix",
            variable: "--header-font",
            field: "headerFont",
            value: '"Emilys Candy", sans-serif',
        },
        {
            id: "fontOptionSeven",
            variable: "--header-font",
            field: "headerFont",
            value: '"DynaPuff", sans-serif',
        },
    ];

    fontmappings.forEach(({ id, variable, field, value }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", () =>
                setFontChoice(variable, field, value)
            );
        }
    });

    // FOR SETTING THE CUSTOM ACCENT COLOR
    const accentPicker = document.getElementById("accentColor");
    const restorebutton = document.getElementById("restoreColor");

    if (accentPicker) {
        accentPicker.addEventListener("input", async (e) => {
            const newColor = e.target.value;
            document.documentElement.style.setProperty(
                "--accent-color",
                newColor
            );
            await updateDoc(userDocRef, {
                accentColor: newColor,
                useSolidHeader: true,
            });
        });
    }

    if (restorebutton) {
        restorebutton.addEventListener("click", async () => {
            const defaultColor = "#fff5fa";
            document.documentElement.style.setProperty(
                "--accent-color",
                defaultColor
            );
            await updateDoc(userDocRef, {
                accentColor: defaultColor,
                useSolidHeader: false,
            });
        });
    }
});