import { mount } from "svelte";
import Footer from "../svelte/Footer.svelte";
import AppearanceSettings from "../svelte/AppearanceSettings.svelte";
import ProfileSettings from "../svelte/ProfileSettings.svelte";

const profileArgs = {
    target: document.querySelector("main")
}

const appearanceArgs = {
    target: document.querySelector("main")
}

const footerArgs = {
    target: document.querySelector("footer")
}

let profileRef = mount(ProfileSettings, profileArgs);
let appearanceRef = mount(AppearanceSettings, appearanceArgs);
let footerRef = mount(Footer, footerArgs);