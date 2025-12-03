import {
    user
} from "./Database.js";

/**
 * Helper for setting inline styles on elements generated via document.createElement.
 * @param {HTMLElement} element JS DOM element.
 * @param {Obj} styleObj Object with CSS styles as keys and style values as values.
 */
export const setStyle = function(element, styleObj) {
    for (const key of Object.keys(styleObj)) {
        element.style[key] = styleObj[key];
    }
}

/**
 * Loads user's preferences into the page's CSS root variables.
 * @return {Promise<void>}
 * @throws Throws an error if current user is not logged in.
 */
export const loadPreferences = async function() {

    /** Maps preference field names to css root variable names. */
    const PREF_VAR_MAP = {
        accentColor: "--accent-color",
        headerFont: "--header-font",
        bodyFont: "--body-font"
    };

    /** Default values for a given setting. */
    const PREF_DEFAULTS = {
        accentColor: "#fff5fa",
        headerFont: `"Oooh Baby", sans-serif`,
        bodyFont: `"Inria Serif", sans-serif`
    };

    return user().then(userData => {
        // Simple styling preferences here
        for (const field of Object.keys(PREF_VAR_MAP)) {
            let val = userData[field] ?? PREF_DEFAULTS[field];
            document.documentElement.style.setProperty(PREF_VAR_MAP[field], val);
        }

        // More complex conditional preferences here
        const header = document.querySelector("header");
        if (header) {
            if (userData.useSolidHeader) {
                header.style.backgroundImage = "none";
                header.style.backgroundColor = "var(--accent-color)";
            } else {
                header.style.backgroundImage = "url('/img/lightcoloredbackdrop.png')";
                header.style.backgroundColor = "";
            }
        }
    });



}