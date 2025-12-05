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

import {
    user as getUser
} from "../lib/Database.js";

/**
 * Document reference for the current user, set at script scope so other scripts can have access to it.
 * @type {DocumentReference}
 */
let userDocRef;

/** Username input. */
const nameInput = document.getElementById("usernameInput");
/** Email input. */
const emailInput = document.getElementById("emailInput");
/** User logout button. */
const logoutButton = document.getElementById("logoutbutton");
/** Button to enable username and email input. */
const editButton = document.getElementById("editbutton");
/** Color input for changing profile accent colors. */
const colorPicker = document.getElementById("accentColor");
/** Save button for profile picture. */
const savePicBtn = document.getElementById("savepic");
/** Save button for edited user info. */
const saveBtn = document.getElementById("savebutton");
/** Button to restore user accent color to default. */
const restorebutton = document.getElementById("restoreColor");
/** Maps font names to related data for preference storage. */
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

// Disable here to prevent accidental editing
nameInput.disabled = true;
emailInput.disabled = true;

logoutButton.addEventListener("click", ev => signOut(auth));

/** Sets placeholder values in text inputs. */
function setPlaceholder(el, text) {
    if (!el) return;
    el.placeholder = text ?? "";
}

/** 
 * Loads user info into the interface
 * @param {Object} userData Data from the user document.
 */
function loadUserInfo(userData) {
    if (userData != null) {  
        if (userData.profilePic) {
            document.getElementById("profilePic").src = userData.profilePic;
        }
        if (typeof userData.username === "string" && userData.username.trim() !== "") {
            nameInput.value = userData.username;
            setPlaceholder(nameInput, userData.username);
        }

        if (typeof userData.email === "string" && userData.email.trim() !== "") {
            emailInput.value = userData.email;
            setPlaceholder(emailInput, userData.email);
        }
        loadPreferences();
    }
}

/**
 * Handler for saving user info changes.
 * @param {MouseEvent} event 
 */
async function saveInfoHandler(event) {
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
}

/**
 * Handler for resetting user's profile color.
 * @param {MouseEvent} event 
 */
async function defaultColorHandler(event) {
    const defaultColor = "#fff5fa";
    document.documentElement.style.setProperty(
        "--accent-color",
        defaultColor
    );
    await updateDoc(userDocRef, {
        accentColor: defaultColor,
        useSolidHeader: false,
    });
}

/**
 * Handler for changing user profile colour.
 * @param {Event} event
 */
async function changeColorHandler(e) {
    const newColor = this.value;
    document.documentElement.style.setProperty(
        "--accent-color",
        newColor
    );
    await updateDoc(userDocRef, {
        accentColor: newColor,
        useSolidHeader: true,
    });
}
/**
 * Handler for saving user profile picture changes.
 * @param {MouseEvent} event 
 */
async function saveProfilePicHandler(event) {
    let newpicinput = document.getElementById("newpicinput").value.trim();
    if (newpicinput.length > 0) {
        if (newpicinput.includes("dropbox.com")) {
            newpicinput = newpicinput.replace("dl=0", "raw=1");
        }
        await updateDoc(userDocRef, { profilePic: newpicinput });
        document.getElementById("profilePic").src = newpicinput;
        alert("profile picture updated!");
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "loginpage.html";
    }
    userDocRef = doc(db, "users", user.uid);
    const data = await getUser(userDocRef);
    
    loadUserInfo(data);
    initButtons();

    // Font buttons
    async function setFontChoice(variableName, fieldName, fontFamily) {
        document.documentElement.style.setProperty(variableName, fontFamily);
        await updateDoc(userDocRef, { [fieldName]: fontFamily });
    }

    editButton.addEventListener("click", () => {
        nameInput.disabled = false;
        emailInput.disabled = false;
        nameInput.focus();
    });

    fontmappings.forEach(({ id, variable, field, value }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", () =>
                setFontChoice(variable, field, value)
            );
        }
    });
});

/** Initializes event handlers for page buttons. */
function initButtons() {
    saveBtn?.addEventListener("click", saveInfoHandler);
    restorebutton?.addEventListener("click", defaultColorHandler);
    savePicBtn?.addEventListener("click", saveProfilePicHandler);
    colorPicker?.addEventListener("input", changeColorHandler);
}